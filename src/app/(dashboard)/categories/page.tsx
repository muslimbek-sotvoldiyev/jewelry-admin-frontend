'use client';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '@/store/slices/categorySlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function CategoriesPage() {
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector((state) => state.categories);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('uz');
  const [formData, setFormData] = useState({
    name_uz: '',
    name_ru: '',
    name_en: '',
    name_tr: '',
    description_uz: '',
    description_ru: '',
    description_en: '',
    description_tr: '',
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const resetForm = () => {
    setFormData({
      name_uz: '', name_ru: '', name_en: '', name_tr: '',
      description_uz: '', description_ru: '', description_en: '', description_tr: '',
      is_active: true, sort_order: 0,
    });
    setEditingId(null);
    setActiveTab('uz');
  };

  const handleEdit = (category: any) => {
    setFormData(category);
    setEditingId(category.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await dispatch(updateCategory({ id: editingId, data: formData })).unwrap();
      } else {
        await dispatch(createCategory(formData)).unwrap();
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
        await dispatch(deleteCategory(id)).unwrap();
      } catch (error) {
        alert('O\'chirishda xatolik!');
      }
    }
  };

  const tabs = [
    { id: 'uz', label: "O'zbek" },
    { id: 'ru', label: 'Русский' },
    { id: 'en', label: 'English' },
    { id: 'tr', label: 'Türkçe' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kategoriyalar</h1>
          <p className="text-gray-600 mt-2">Barcha kategoriyalarni boshqaring</p>
        </div>
        <Button onClick={() => {
          resetForm();
          setIsModalOpen(true);
        }}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yangi Kategoriya
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">ID</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Nom (O'zbek)</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Nom (Русский)</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">{cat.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{cat.name_uz}</div>
                    {cat.description_uz && (
                      <div className="text-sm text-gray-500 mt-1 line-clamp-1">{cat.description_uz}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{cat.name_ru}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      cat.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {cat.is_active ? 'Faol' : 'Nofaol'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(cat)}
                    >
                      Tahrirlash
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(cat.id)}
                    >
                      O'chirish
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {categories.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <p className="text-gray-500">Hozircha kategoriyalar yo'q</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Kategoriyani Tahrirlash' : 'Yangi Kategoriya'}
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

            <form onSubmit={handleSubmit} className="p-6">
              {/* TABS */}
              <div className="flex border-b mb-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB CONTENT */}
              <div className="space-y-4">
                {tabs.map((tab) => (
                  <div key={tab.id} className={activeTab === tab.id ? 'block' : 'hidden'}>
                    <div className="space-y-4">
                      <div>
                        <Label>Nom ({tab.label})</Label>
                        <Input
                          value={formData[`name_${tab.id}` as keyof typeof formData] as string}
                          onChange={(e) => setFormData({ ...formData, [`name_${tab.id}`]: e.target.value })}
                          required={tab.id === 'uz'}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Ta'rif ({tab.label})</Label>
                        <Textarea
                          value={formData[`description_${tab.id}` as keyof typeof formData] as string}
                          onChange={(e) => setFormData({ ...formData, [`description_${tab.id}`]: e.target.value })}
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-3">
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
