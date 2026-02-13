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

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const resetForm = () => {
    setFormData({ name: '', weight: 0, category_id: 0 });
    setImageFiles([]);
    setEditingId(null);
  };

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      weight: product.weight,
      category_id: product.category_id,
    });
    setEditingId(product.id);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files).slice(0, 5)); // Maksimal 5 ta
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await dispatch(updateProduct({ 
          id: editingId, 
          data: { 
            ...formData,
            images: imageFiles.length > 0 ? imageFiles : undefined 
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
      alert('Xatolik yuz berdi!');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Rostdan ham o\'chirmoqchimisiz?')) {
      try {
        await dispatch(deleteProduct(id)).unwrap();
      } catch (error) {
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
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              {/* Image */}
              <div className="aspect-square bg-gray-100 relative">
                {product.images && product.images[0] ? (
                  <img 
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/uploads/${product.images[0]}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
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
          ))}
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

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Mahsulotni Tahrirlash' : 'Yangi Mahsulot'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <Label>Nom *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Og'irligi (gramm) *</Label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Kategoriya *</Label>
                <select
                  value={formData.category_id}
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

              <div>
                <Label>Rasmlar (maksimal 5 ta)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="mt-1"
                />
                {imageFiles.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">{imageFiles.length} ta rasm tanlandi</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
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