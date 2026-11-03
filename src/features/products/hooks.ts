import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Paginated, Product, ProductInput } from '../../types';

export function useProducts(page: number, search: string) {
  const params = new URLSearchParams({ page: String(page), limit: '10' });
  if (search) params.set('search', search);
  return useQuery({
    queryKey: ['products', page, search],
    queryFn: () => api<Paginated<Product>>(`/products?${params}`),
    placeholderData: keepPreviousData,
  });
}

export function useProductOptions() {
  return useQuery({
    queryKey: ['products', 'options'],
    queryFn: () => api<Paginated<Product>>('/products?limit=100'),
  });
}

export function useSaveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: ProductInput }) =>
      id
        ? api<Product>(`/products/${id}`, { method: 'PATCH', body: input })
        : api<Product>('/products', { method: 'POST', body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}