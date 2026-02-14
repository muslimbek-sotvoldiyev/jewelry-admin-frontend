'use client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategories } from '@/store/slices/categorySlice';
import { fetchProducts } from '@/store/slices/productSlice';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector((state) => state.categories);
  const { products } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts());
  }, [dispatch]);

  const stats = [
    {
      name: 'Jami Kategoriyalar',
      value: categories.length,
    },
    {
      name: 'Jami Mahsulotlar',
      value: products.length,
    },
  ];

  return (
    <div>
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Admin panel statistikasi</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm font-medium text-gray-600">{stat.name}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* LATEST CATEGORIES & PRODUCTS */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">So'nggi Kategoriyalar</h2>
          <div className="space-y-3">
            {categories.slice(0, 5).map((cat) => (
              <div key={cat.id} className="p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{cat.name_uz}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">So'nggi Mahsulotlar</h2>
          <div className="space-y-3">
            {products.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{product.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
