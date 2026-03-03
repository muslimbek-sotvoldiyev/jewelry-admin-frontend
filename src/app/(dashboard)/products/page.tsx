'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  Quality,
} from '@/store/slices/productSlice';
import { fetchCategories } from '@/store/slices/categorySlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const EMPTY_FORM = {
  name: '',
  weight: '',
  comment: '',
  size: '',
  quality: '' as Quality | '',
  category_id: 0,
};

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state) => state.products);
  const { categories } = useAppSelector((state) => state.categories);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [cardImageIndexes, setCardImageIndexes] = useState<{ [key: number]: number }>({});

  // Memory leak oldini olish — URL.createObjectURL cleanup
  const newImagePreviews = useMemo(
    () => imageFiles.map((file) => URL.createObjectURL(file)),
    [imageFiles],
  );

  useEffect(() => {
    return () => {
      newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImagePreviews]);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Nechta rasm aktiv ekanligini hisoblash
  const activeExistingCount = useMemo(() => {
    return existingImages.filter((img) => {
      const name = img.split('/').pop() || '';
      return !imagesToRemove.includes(name);
    }).length;
  }, [existingImages, imagesToRemove]);

  const totalImageCount = activeExistingCount + imageFiles.length;

  const resetForm = useCallback(() => {
    setFormData(EMPTY_FORM);
    setImageFiles([]);
    setExistingImages([]);
    setImagesToRemove([]);
    setEditingId(null);
  }, []);

  const handleEdit = useCallback((product: any) => {
    setFormData({
      name: product.name,
      weight: String(product.weight),
      comment: product.comment || '',
      size: product.size || '',
      quality: product.quality || '',
      category_id: product.category_id,
    });
    setExistingImages(product.images || []);
    setImageFiles([]);
    setImagesToRemove([]);
    setEditingId(product.id);
    setIsModalOpen(true);
  }, []);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;

      const newFiles = Array.from(e.target.files);
      const canAdd = 5 - totalImageCount;

      if (canAdd <= 0) {
        toast.error("Maksimal 5 ta rasm qo'shishingiz mumkin!");
        return;
      }

      // Faqat sig'adigan miqdorini olamiz
      const filesToAdd = newFiles.slice(0, canAdd);

      if (newFiles.length > canAdd) {
        toast.warning(`Faqat ${canAdd} ta rasm qo'shildi (limit: 5 ta)`);
      }

      setImageFiles((prev) => [...prev, ...filesToAdd]);
      // Input ni reset qilamiz — bir xil faylni qayta tanlash uchun
      e.target.value = '';
    },
    [totalImageCount],
  );

  const handleRemoveExistingImage = useCallback((imageUrl: string) => {
    const imageName = imageUrl.split('/').pop() || '';
    setImagesToRemove((prev) => [...prev, imageName]);
  }, []);

  const handleUndoRemove = useCallback((imageUrl: string) => {
    const imageName = imageUrl.split('/').pop() || '';
    setImagesToRemove((prev) => prev.filter((img) => img !== imageName));
  }, []);

  const handleRemoveNewImage = useCallback((index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const openLightbox = useCallback((images: string[], index: number) => {
    setLightboxImages(images);
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  }, []);

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % lightboxImages.length);
  }, [lightboxImages.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
  }, [lightboxImages.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, nextImage, prevImage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (totalImageCount === 0) {
      toast.error("Kamida 1 ta rasm qo'shishingiz kerak!");
      return;
    }

    const loadingToast = toast.loading(
      editingId ? 'Mahsulot saqlanmoqda...' : 'Mahsulot yaratilmoqda...',
    );

    try {
      if (editingId) {
        await dispatch(
          updateProduct({
            id: editingId,
            data: {
              ...formData,
              quality: formData.quality || undefined,
              images: imageFiles.length > 0 ? imageFiles : undefined,
              removeImages: imagesToRemove.length > 0 ? imagesToRemove : undefined,
            },
          }),
        ).unwrap();
        toast.success('Mahsulot muvaffaqiyatli yangilandi!', { id: loadingToast });
      } else {
        await dispatch(
          createProduct({
            ...formData,
            quality: formData.quality || undefined,
            images: imageFiles,
          }),
        ).unwrap();
        toast.success("Mahsulot muvaffaqiyatli yaratildi!", { id: loadingToast });
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Xatolik yuz berdi!', {
        id: loadingToast,
        description: "Iltimos, qaytadan urinib ko'ring",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Rostdan ham o'chirmoqchimisiz?")) return;

    const loadingToast = toast.loading("O'chirilmoqda...");
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success("Mahsulot o'chirildi!", { id: loadingToast });
    } catch (error) {
      console.error('Delete error:', error);
      toast.error("O'chirishda xatolik!", { id: loadingToast });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mahsulotlar</h1>
          <p className="text-gray-600 mt-2">Barcha mahsulotlarni boshqaring</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yangi Mahsulot
        </Button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <p className="text-gray-500">Hozircha mahsulotlar yo'q</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const currentIndex = cardImageIndexes[product.id] || 0;
            const hasMultiple = product.images?.length > 1;

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Image */}
                <div className="aspect-square bg-gray-100 relative">
                  {product.images?.length > 0 ? (
                    <div className="relative w-full h-full group">
                      <img
                        src={product.images[currentIndex]}
                        alt={product.name}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => openLightbox(product.images, currentIndex)}
                        onError={(e) => {
                          e.currentTarget.src =
                            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5SYXNtIHlvJ3E8L3RleHQ+PC9zdmc+';
                        }}
                      />

                      {hasMultiple && (
                        <>
                          <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {currentIndex + 1}/{product.images.length}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCardImageIndexes((prev) => ({
                                ...prev,
                                [product.id]:
                                  ((prev[product.id] || 0) - 1 + product.images.length) %
                                  product.images.length,
                              }));
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCardImageIndexes((prev) => ({
                                ...prev,
                                [product.id]:
                                  ((prev[product.id] || 0) + 1) % product.images.length,
                              }));
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>

                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/50 px-2 py-1 rounded-full">
                            {product.images.map((_, index) => (
                              <div
                                key={index}
                                className={`h-2 rounded-full transition-all cursor-pointer bg-white ${
                                  index === currentIndex ? 'w-4' : 'w-2 opacity-50'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCardImageIndexes((prev) => ({
                                    ...prev,
                                    [product.id]: index,
                                  }));
                                }}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg
                        className="w-16 h-16 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 line-clamp-1">{product.name}</h3>

                  <div className="space-y-1.5 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Og'irligi:</span>
                      <span className="font-semibold">{product.weight}g</span>
                    </div>
                    {product.size && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">O'lcham:</span>
                        <span>{product.size}</span>
                      </div>
                    )}
                    {product.quality && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Sifat:</span>
                        <span className="font-medium">{product.quality}</span>
                      </div>
                    )}
                    {product.category && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Kategoriya:</span>
                        <span>{product.category.name_uz}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                      className="flex-1"
                    >
                      Tahrirlash
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(product.id)}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIGHTBOX */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {lightboxImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          <div
            className="max-w-5xl max-h-[90vh] w-full px-16 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImages[currentImageIndex]}
              alt={`Rasm ${currentImageIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>

          {lightboxImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full text-sm">
              {currentImageIndex + 1} / {lightboxImages.length}
            </div>
          )}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Mahsulotni Tahrirlash' : 'Yangi Mahsulot'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Nom */}
              <div>
                <Label>Nom *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Mahsulot nomini kiriting"
                  className="mt-1"
                />
              </div>

              {/* Og'irligi */}
              <div>
                <Label>Og'irligi (gramm) *</Label>
                <Input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                      setFormData({ ...formData, weight: val });
                    }
                  }}
                  required
                  placeholder="Masalan: 500.5"
                  className="mt-1"
                />
              </div>

              {/* O'lcham */}
              <div>
                <Label>O'lcham</Label>
                <Input
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  placeholder="Masalan: 18mm yoki M"
                  className="mt-1"
                />
              </div>

              {/* Sifat */}
              <div>
                <Label>Sifat</Label>
                <select
                  value={formData.quality}
                  onChange={(e) =>
                    setFormData({ ...formData, quality: e.target.value as Quality | '' })
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tanlang (ixtiyoriy)</option>
                  <option value="14K">14 Karat</option>
                  <option value="18K">18 Karat</option>
                  <option value="22K">22 Karat</option>
                </select>
              </div>

              {/* Izoh */}
              <div>
                <Label>Izoh</Label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Qo'shimcha ma'lumot yoki izoh"
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Kategoriya */}
              <div>
                <Label>Kategoriya *</Label>
                <select
                  value={formData.category_id || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: Number(e.target.value) })
                  }
                  required
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Kategoriyani tanlang</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name_uz}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rasmlar */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Rasmlar {!editingId && '*'}</Label>
                  <span
                    className={`text-sm font-medium ${totalImageCount >= 5 ? 'text-red-500' : 'text-gray-500'}`}
                  >
                    {totalImageCount}/5
                  </span>
                </div>

                {/* Mavjud rasmlar */}
                {editingId && existingImages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Mavjud rasmlar:</p>
                    <div className="grid grid-cols-5 gap-2">
                      {existingImages.map((imageUrl, index) => {
                        const imageName = imageUrl.split('/').pop() || '';
                        const isRemoving = imagesToRemove.includes(imageName);

                        return (
                          <div key={index} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`Rasm ${index + 1}`}
                              className={`w-full h-24 object-cover rounded-lg border-2 cursor-pointer transition-all ${
                                isRemoving
                                  ? 'border-red-400 opacity-40'
                                  : 'border-gray-200 hover:border-blue-400'
                              }`}
                              onClick={() => {
                                if (!isRemoving) {
                                  const active = existingImages.filter((img) => {
                                    const n = img.split('/').pop() || '';
                                    return !imagesToRemove.includes(n);
                                  });
                                  openLightbox(active, active.indexOf(imageUrl));
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                isRemoving
                                  ? handleUndoRemove(imageUrl)
                                  : handleRemoveExistingImage(imageUrl)
                              }
                              className={`absolute top-1 right-1 p-1.5 rounded-full shadow-md text-white opacity-0 group-hover:opacity-100 transition-opacity ${
                                isRemoving
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : 'bg-red-500 hover:bg-red-600'
                              }`}
                            >
                              {isRemoving ? (
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              )}
                            </button>
                            {isRemoving && (
                              <div className="absolute inset-0 flex items-center justify-center rounded-lg pointer-events-none">
                                <span className="bg-red-600 text-white text-xs font-medium px-1.5 py-0.5 rounded">
                                  O'chiriladi
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Yangi rasmlar preview */}
                {imageFiles.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Yangi rasmlar:</p>
                    <div className="grid grid-cols-5 gap-2">
                      {imageFiles.map((_, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={newImagePreviews[index]}
                            alt={`Yangi ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-blue-400"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveNewImage(index)}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                          <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">
                            Yangi
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload button */}
                {totalImageCount < 5 && (
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <svg
                      className="w-8 h-8 text-gray-400 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">
                      Rasm yuklash ({5 - totalImageCount} ta qoldi)
                    </span>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                >
                  Bekor qilish
                </Button>
                <Button type="submit" disabled={totalImageCount === 0}>
                  {editingId ? 'Saqlash' : 'Yaratish'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}