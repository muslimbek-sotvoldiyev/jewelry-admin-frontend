// src/store/slices/productSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/lib/api';

export enum Quality {
  K14 = '14K',
  K18 = '18K',
  K22 = '22K',
}

export interface Product {
  id: number;
  name: string;
  weight: number; // float
  comment?: string;
  size?: string;
  quality?: Quality;
  images: string[];
  category_id: number;
  category?: {
    id: number;
    name_uz: string;
    name_ru: string;
    name_en: string;
    name_tr: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
};

// GET ALL
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async () => {
    return await apiRequest<Product[]>('/products');
  }
);

// CREATE with FormData
export const createProduct = createAsyncThunk(
  'products/create',
  async (productData: { 
    name: string; 
    weight: number | string;
    comment?: string;
    size?: string;
    quality?: Quality;
    category_id: number; 
    images: File[] 
  }) => {
    const formData = new FormData();
    
    productData.images.forEach((file) => {
      formData.append('images', file);
    });

    formData.append('name', productData.name);
    formData.append('weight', String(productData.weight));
    
    if (productData.comment) {
      formData.append('comment', productData.comment);
    }
    
    if (productData.size) {
      formData.append('size', productData.size);
    }
    
    if (productData.quality) {
      formData.append('quality', productData.quality);
    }
    
    formData.append('category_id', String(productData.category_id));

    return await apiRequest<Product>('/products', {
      method: 'POST',
      body: formData,
    });
  }
);

// UPDATE with FormData
export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ 
    id, 
    data 
  }: { 
    id: number; 
    data: { 
      name?: string; 
      weight?: number | string;
      comment?: string;
      size?: string;
      quality?: Quality;
      category_id?: number; 
      images?: File[];
      removeImages?: string[];
    } 
  }) => {
    const formData = new FormData();
    
    if (data.name) formData.append('name', data.name);
    if (data.weight !== undefined) formData.append('weight', String(data.weight));
    if (data.comment !== undefined) formData.append('comment', data.comment);
    if (data.size !== undefined) formData.append('size', data.size);
    if (data.quality !== undefined) formData.append('quality', data.quality);
    if (data.category_id) formData.append('category_id', String(data.category_id));
    
    if (data.removeImages && data.removeImages.length > 0) {
      formData.append('removeImages', JSON.stringify(data.removeImages));
    }
    
    if (data.images && data.images.length > 0) {
      data.images.forEach((file) => {
        formData.append('images', file);
      });
    }

    return await apiRequest<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: formData,
    });
  }
);

// DELETE
export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id: number) => {
    await apiRequest(`/products/${id}`, { method: 'DELETE' });
    return id;
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p.id !== action.payload);
      });
  },
});

export default productSlice.reducer;