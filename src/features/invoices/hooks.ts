import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Invoice, InvoiceInput, Paginated } from '../../types';

export function useInvoices(page: number, search: string) {
  const params = new URLSearchParams({ page: String(page), limit: '10' });
  if (search) params.set('search', search);
  return useQuery({
    queryKey: ['invoices', page, search],
    queryFn: () => api<Paginated<Invoice>>(`/invoices?${params}`),
    placeholderData: keepPreviousData,
  });
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => api<Invoice>(`/invoices/${id}`),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InvoiceInput) =>
      api<Invoice>('/invoices', { method: 'POST', body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/invoices/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}