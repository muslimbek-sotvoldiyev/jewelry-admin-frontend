'use client';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '@/store/slices/categorySlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const resetForm = () => {
    setFormData({
      name_uz: '',
      name_ru: '',
      name_en: '',
      name_tr: '',
    });
    setEditingId(null);
    setActiveTab('uz');
  };

  const handleEdit = (category: any) => {
    setFormData({
      name_uz: category.name_uz || '',
      name_ru: category.name_ru || '',
      name_en: category.name_en || '',
      name_tr: category.name_tr || '',
    });
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
      console.error('Error:', error);
      alert('Xatolik yuz berdi!');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Rostdan ham o'chirmoqchimisiz?")) {
      try {
        await dispatch(deleteCategory(id)).unwrap();
      } catch (error) {
        console.error('Delete error:', error);
        alert('O\'chirishda xatolik!');
      }
    }
  };

  const tabs = [
    { id: 'uz', label: "O'zbek", flag: '🇺🇿' },
    { id: 'ru', label: 'Русский', flag: '🇷🇺' },
    { id: 'en', label: 'English', flag: '🇬🇧' },
    { id: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  ];

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kategoriyalar</h1>
          <p className="text-gray-600 mt-2">Mahsulotlar kategoriyalarini boshqaring</p>
        </div>
        <Button 
          onClick={() => { 
            resetForm(); 
            setIsModalOpen(true); 
          }}
          className="flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yangi Kategoriya
        </Button>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <p className="text-gray-500">Hozircha kategoriyalar yo'q</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>🇺🇿</span>
                    Nom (UZ)
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>🇷🇺</span>
                    Nom (RU)
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>🇬🇧</span>
                    Nom (EN)
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>🇹🇷</span>
                    Nom (TR)
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amallar
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                      {cat.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {cat.name_uz || '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {cat.name_ru || '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {cat.name_en || '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {cat.name_tr || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(cat)}
                        className="flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Tahrirlash
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDelete(cat.id)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            {/* Modal Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Kategoriyani Tahrirlash' : 'Yangi Kategoriya'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* TABS */}
              <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span>{tab.flag}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* INPUT */}
              <div className="space-y-4">
                {tabs.map((tab) => (
                  <div 
                    key={tab.id} 
                    className={activeTab === tab.id ? 'block' : 'hidden'}
                  >
                    <Label className="text-gray-700 font-medium mb-2 flex items-center gap-2">
                      <span>{tab.flag}</span>
                      Kategoriya nomi ({tab.label})
                      {tab.id === 'uz' && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      value={formData[`name_${tab.id}` as keyof typeof formData] as string}
                      onChange={(e) => setFormData({ ...formData, [`name_${tab.id}`]: e.target.value })}
                      required={tab.id === 'uz'}
                      placeholder={`Kategoriya nomini kiriting`}
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
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