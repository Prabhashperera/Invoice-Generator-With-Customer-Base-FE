import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Customer, CustomerInput, Paginated } from '../../types';

export function useCustomers(page: number, search: string) {
  const params = new URLSearchParams({ page: String(page), limit: '10' });
  if (search) params.set('search', search);

  return useQuery({
    queryKey: ['customers', page, search],
    queryFn: () => api<Paginated<Customer>>(`/customers?${params}`),
    placeholderData: keepPreviousData,
  });
}

export function useCustomerOptions() {
  return useQuery({
    queryKey: ['customers', 'options'],
    queryFn: () => api<Paginated<Customer>>('/customers?limit=100'),
  });
}

export function useSaveCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: CustomerInput }) =>
      id
        ? api<Customer>(`/customers/${id}`, { method: 'PATCH', body: input })
        : api<Customer>('/customers', { method: 'POST', body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/customers/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}