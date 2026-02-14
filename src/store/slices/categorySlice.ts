import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/lib/api';

export interface Category {
  id: number;
  name_uz: string;
  name_ru: string;
  name_en: string;
  name_tr: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

// GET
export const fetchCategories = createAsyncThunk<Category[]>(
  'categories/fetchAll',
  async () => {
    const data = await apiRequest<Category[]>('/categories');
    return data;
  }
);

// CREATE
export const createCategory = createAsyncThunk<
  Category,
  Omit<Category, 'id' | 'createdAt' | 'updatedAt'>
>(
  'categories/create',
  async (categoryData) => {
    const data = await apiRequest<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    return data;
  }
);

// UPDATE
export const updateCategory = createAsyncThunk<
  Category,
  { id: number; data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>> }
>(
  'categories/update',
  async ({ id, data }) => {
    const updated = await apiRequest<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return updated;
  }
);

// DELETE
export const deleteCategory = createAsyncThunk<number, number>(
  'categories/delete',
  async (id) => {
    await apiRequest(`/categories/${id}`, { method: 'DELETE' });
    return id;
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })

      // CREATE
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.unshift(action.payload);
      })

      // UPDATE
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })

      // DELETE
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (c) => c.id !== action.payload
        );
      });
  },
});

export default categorySlice.reducer;
