// app/products/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '@/store/slices/productSlice';
import { fetchCategories } from '@/store/slices/categorySlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state) => state.products);
  const { categories } = useAppSelector((state) => state.categories);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    weight: 0,
    category_id: 0,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  
  // Lightbox uchun
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Card swiper uchun
  const [cardImageIndexes, setCardImageIndexes] = useState<{[key: number]: number}>({});

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const resetForm = () => {
    setFormData({ name: '', weight: 0, category_id: 0 });
    setImageFiles([]);
    setExistingImages([]);
    setImagesToRemove([]);
    setEditingId(null);
  };

  const handleEdit = (product: any) => {
    console.log('Editing product:', product);
    setFormData({
      name: product.name,
      weight: product.weight,
      category_id: product.category_id,
    });
    // Rasmlarni to'g'ri set qilish
    setExistingImages(product.images || []);
    setImageFiles([]);
    setImagesToRemove([]);
    setEditingId(product.id);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalImages = existingImages.length - imagesToRemove.length + imageFiles.length + newFiles.length;
      
      if (totalImages > 5) {
        alert('Maksimal 5 ta rasm qo\'shishingiz mumkin!');
        return;
      }
      
      setImageFiles([...imageFiles, ...newFiles]);
    }
  };

  // Mavjud rasmni o'chirish uchun belgilash
  const handleRemoveExistingImage = (imageUrl: string) => {
    const imageName = imageUrl.split('/').pop() || '';
    console.log('Marking for removal:', imageName);
    setImagesToRemove([...imagesToRemove, imageName]);
  };

  // Yangi rasmni o'chirish
  const handleRemoveNewImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  // O'chirishni bekor qilish
  const handleUndoRemove = (imageUrl: string) => {
    const imageName = imageUrl.split('/').pop() || '';
    console.log('Undoing removal:', imageName);
    setImagesToRemove(imagesToRemove.filter(img => img !== imageName));
  };

  // Lightbox ochish
  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  // Lightbox keyingi rasm
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % lightboxImages.length);
  };

  // Lightbox oldingi rasm
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
  };

  // Card'dagi rasmni o'zgartirish
  const nextCardImage = (productId: number, totalImages: number) => {
    setCardImageIndexes(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % totalImages
    }));
  };

  const prevCardImage = (productId: number, totalImages: number) => {
    setCardImageIndexes(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalImages = existingImages.length - imagesToRemove.length + imageFiles.length;
    if (totalImages === 0 && !editingId) {
      alert('Kamida 1 ta rasm qo\'shishingiz kerak!');
      return;
    }
    
    console.log('Submitting with:');
    console.log('Existing images:', existingImages);
    console.log('Images to remove:', imagesToRemove);
    console.log('New images:', imageFiles.length);
    
    try {
      if (editingId) {
        await dispatch(updateProduct({ 
          id: editingId, 
          data: { 
            ...formData,
            images: imageFiles.length > 0 ? imageFiles : undefined,
            removeImages: imagesToRemove.length > 0 ? imagesToRemove : undefined
          } 
        })).unwrap();
      } else {
        await dispatch(createProduct({ 
          ...formData,
          images: imageFiles 
        })).unwrap();
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert('Xatolik yuz berdi! Console\'ni tekshiring.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Rostdan ham o\'chirmoqchimisiz?')) {
      try {
        await dispatch(deleteProduct(id)).unwrap();
      } catch (error) {
        console.error('Delete error:', error);
        alert('O\'chirishda xatolik!');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mahsulotlar</h1>
          <p className="text-gray-600 mt-2">Barcha mahsulotlarni boshqaring</p>
        </div>
        <Button onClick={() => {
          resetForm();
          setIsModalOpen(true);
        }}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yangi Mahsulot
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const currentIndex = cardImageIndexes[product.id] || 0;
            const hasMultipleImages = product.images && product.images.length > 1;
            
            return (
              <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Image Gallery with Swiper */}
                <div className="aspect-square bg-gray-100 relative">
                  {product.images && product.images.length > 0 ? (
                    <div className="relative w-full h-full group">
                      <img 
                        src={product.images[currentIndex]}
                        alt={product.name}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => openLightbox(product.images, currentIndex)}
                        onError={(e) => {
                          console.error('Image load error:', product.images[currentIndex]);
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5SYXNtIHlvJ3E8L3RleHQ+PC9zdmc+';
                        }}
                      />
                      
                      {/* Rasmlar soni ko'rsatkichi */}
                      {hasMultipleImages && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {currentIndex + 1}/{product.images.length}
                        </div>
                      )}
                      
                      {/* Swiper tugmalari */}
                      {hasMultipleImages && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              prevCardImage(product.id, product.images.length);
                            }}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              nextCardImage(product.id, product.images.length);
                            }}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </>
                      )}
                      
                      {/* Kattalashtirishga ishora */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-white rounded-full p-3 shadow-lg">
                          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Rasmlar indikatori */}
                      {hasMultipleImages && (
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 bg-black bg-opacity-50 px-2 py-1 rounded-full">
                          {product.images.map((_, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                                index === currentIndex ? 'bg-white w-4' : 'bg-white bg-opacity-50'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCardImageIndexes(prev => ({
                                  ...prev,
                                  [product.id]: index
                                }));
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Og'irligi:</span>
                      <span className="font-semibold text-gray-900">{product.weight}g</span>
                    </div>
                    
                    {product.category && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Kategoriya:</span>
                        <span className="text-gray-900">{product.category.name_uz}</span>
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
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {products.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-500">Hozircha mahsulotlar yo'q</p>
        </div>
      )}

      {/* LIGHTBOX - Rasmlarni Kattalashtirish */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-[100] flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Oldingi tugma */}
          {lightboxImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Rasm */}
          <div className="max-w-7xl max-h-[90vh] w-full px-16" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImages[currentImageIndex]}
              alt={`Image ${currentImageIndex + 1}`}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Keyingi tugma */}
          {lightboxImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Rasm sanagichi */}
          {lightboxImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full">
              {currentImageIndex + 1} / {lightboxImages.length}
            </div>
          )}

          {/* Thumbnails */}
          {lightboxImages.length > 1 && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2" onClick={(e) => e.stopPropagation()}>
              {lightboxImages.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-16 h-16 cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                    index === currentImageIndex ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL - Mahsulot Qo'shish/Tahrirlash */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Mahsulotni Tahrirlash' : 'Yangi Mahsulot'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <Label>Nom *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="mt-1"
                  placeholder="Mahsulot nomini kiriting"
                />
              </div>

              <div>
                <Label>Og'irligi (gramm) *</Label>
                <Input
                  type="number"
                  value={formData.weight || ''}
                  onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                  required
                  className="mt-1"
                  placeholder="500"
                  min="0"
                />
              </div>

              <div>
                <Label>Kategoriya *</Label>
                <select
                  value={formData.category_id || ''}
                  onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                  required
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Kategoriyani tanlang</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name_uz}</option>
                  ))}
                </select>
              </div>

              {/* Rasmlar Bo'limi */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>
                    Rasmlar (maksimal 5 ta) {!editingId && '*'}
                  </Label>
                  <span className="text-sm text-gray-500">
                    ({existingImages.length - imagesToRemove.length + imageFiles.length}/5)
                  </span>
                </div>

                {/* Mavjud Rasmlar */}
                {editingId && existingImages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Mavjud rasmlar:</p>
                    <div className="grid grid-cols-5 gap-3">
                      {existingImages.map((imageUrl, index) => {
                        const imageName = imageUrl.split('/').pop() || '';
                        const isMarkedForRemoval = imagesToRemove.includes(imageName);
                        
                        return (
                          <div key={index} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`Image ${index + 1}`}
                              className={`w-full h-24 object-cover rounded-lg border-2 cursor-pointer transition-all ${
                                isMarkedForRemoval 
                                  ? 'border-red-500 opacity-40' 
                                  : 'border-gray-200 hover:border-blue-400'
                              }`}
                              onClick={() => {
                                if (!isMarkedForRemoval) {
                                  const validImages = existingImages.filter((img) => {
                                    const name = img.split('/').pop() || '';
                                    return !imagesToRemove.includes(name);
                                  });
                                  openLightbox(validImages, validImages.indexOf(imageUrl));
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isMarkedForRemoval) {
                                  handleUndoRemove(imageUrl);
                                } else {
                                  handleRemoveExistingImage(imageUrl);
                                }
                              }}
                              className={`absolute top-1 right-1 p-1.5 rounded-full shadow-lg ${
                                isMarkedForRemoval
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : 'bg-red-500 hover:bg-red-600'
                              } text-white opacity-0 group-hover:opacity-100 transition-all`}
                            >
                              {isMarkedForRemoval ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                            </button>
                            {isMarkedForRemoval && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-lg pointer-events-none">
                                <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
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

                {/* Yangi Rasmlar Preview */}
                {imageFiles.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Yangi rasmlar:</p>
                    <div className="grid grid-cols-5 gap-3">
                      {imageFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-blue-400 cursor-pointer hover:border-blue-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveNewImage(index)}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

                {/* Rasm Yuklash Tugmasi */}
                {(existingImages.length - imagesToRemove.length + imageFiles.length) < 5 && (
                  <div>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <div className="text-center">
                        <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm font-medium text-gray-600">Rasm yuklash uchun bosing</span>
                        <span className="text-xs text-gray-500 block mt-1">PNG, JPG, GIF (maks. 5MB)</span>
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

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
                <Button type="submit">
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