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

    if (editingId) {
      await dispatch(updateCategory({ id: editingId, data: formData }));
    } else {
      await dispatch(createCategory(formData));
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Rostdan o'chirmoqchimisiz?")) {
      await dispatch(deleteCategory(id));
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
      {/* HEADER */}
      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-bold">Kategoriyalar</h1>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          Yangi Kategoriya
        </Button>
      </div>

      {/* TABLE */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="border-b">
              <th>ID</th>
              <th>Nom (UZ)</th>
              <th>Nom (RU)</th>
              <th>Nom (EN)</th>
              <th>Nom (TR)</th>
              <th>Amallar</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b">
                <td>{cat.id}</td>
                <td>{cat.name_uz}</td>
                <td>{cat.name_ru}</td>
                <td>{cat.name_en}</td>
                <td>{cat.name_tr}</td>
                <td className="space-x-2">
                  <Button size="sm" onClick={() => handleEdit(cat)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(cat.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg">
            <form onSubmit={handleSubmit}>
              {/* TABS */}
              <div className="flex border-b mb-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 ${activeTab === tab.id ? 'border-b-2 border-blue-600' : ''}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* INPUT */}
              {tabs.map((tab) => (
                <div key={tab.id} className={activeTab === tab.id ? 'block' : 'hidden'}>
                  <Label>Nom ({tab.label})</Label>
                  <Input
                    value={formData[`name_${tab.id}` as keyof typeof formData] as string}
                    onChange={(e) => setFormData({ ...formData, [`name_${tab.id}`]: e.target.value })}
                    required={tab.id === 'uz'}
                    className="mt-1 mb-4"
                  />
                </div>
              ))}

              <div className="flex justify-end gap-3 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Bekor qilish</Button>
                <Button type="submit">{editingId ? 'Saqlash' : 'Yaratish'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
