import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDeleteInvoice, useInvoices } from '../features/invoices/hooks';
import { CURRENCY, money } from '../lib/format';
import type { Invoice } from '../types';

export default function InvoicesPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, error } = useInvoices(page, search);
  const del = useDeleteInvoice();

  const remove = (inv: Invoice) => {
    if (window.confirm(`Delete invoice ${inv.invoiceNumber}? This cannot be undone.`)) {
      del.mutate(inv.id);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Invoices</h1>
        <Link
          to="/invoices/new"
          className="rounded bg-slate-900 px-4 py-2 text-sm text-white"
        >
          New invoice
        </Link>
      </div>

      <input
        className="mb-4 w-full max-w-sm rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
        placeholder="Search by invoice number or customer"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />

      {del.error && (
        <p className="mb-3 rounded bg-red-50 p-3 text-sm text-red-700">
          {del.error.message}
        </p>
      )}
      {isLoading && <p className="text-slate-500">Loading...</p>}
      {error && <p className="text-red-600">{error.message}</p>}

      {data && (
        <>
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-2">Number</th>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2 text-right">Total ({CURRENCY})</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((inv) => (
                  <tr key={inv.id} className="border-b last:border-0">
                    <td className="px-4 py-2 font-medium">{inv.invoiceNumber}</td>
                    <td className="px-4 py-2">{inv.customer.name}</td>
                    <td className="px-4 py-2">{inv.issueDate}</td>
                    <td className="px-4 py-2 text-right">{money(inv.totalAmount)}</td>
                    <td className="px-4 py-2 text-right">
                      <Link
                        to={`/invoices/${inv.id}`}
                        className="mr-3 text-slate-700 hover:underline"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => remove(inv)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {data.data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                      No invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-slate-600">
              Page {data.meta.page} of {Math.max(data.meta.totalPages, 1)} ·{' '}
              {data.meta.total} total
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded border px-3 py-1.5 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= data.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded border px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}