import { useEffect, useState } from 'react';
import {
  useDeleteProduct,
  useProducts,
  useSaveProduct,
} from '../features/products/hooks';
import { CURRENCY, money } from '../lib/format';
import type { Product } from '../types';

const input =
  'w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none';

function ProductForm({
  product,
  onDone,
}: {
  product: Product | null;
  onDone: () => void;
}) {
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product ? String(product.unitPrice) : '');
  const save = useSaveProduct();

  const submit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    save.mutate(
      {
        id: product?.id,
        input: { name, description, unitPrice: Number(price) },
      },
      { onSuccess: onDone },
    );
  };

  return (
    <form onSubmit={submit} className="mb-6 space-y-3 rounded-lg border bg-white p-4">
      <h2 className="font-semibold">{product ? 'Edit product' : 'New product'}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className={input}
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={150}
        />
        <input
          className={input}
          type="number"
          min="0"
          step="0.01"
          placeholder={`Unit price (${CURRENCY})`}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>
      <input
        className={input}
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={1000}
      />
      {save.error && <p className="text-sm text-red-600">{save.error.message}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={save.isPending}
          className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {save.isPending ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded border px-4 py-2 text-sm hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null | undefined>(undefined);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, error } = useProducts(page, search);
  const del = useDeleteProduct();

  const remove = (p: Product) => {
    if (window.confirm(`Delete ${p.name}? Existing invoices keep their lines.`)) {
      del.mutate(p.id);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Products</h1>
        <button
          onClick={() => setEditing(null)}
          className="rounded bg-slate-900 px-4 py-2 text-sm text-white"
        >
          New product
        </button>
      </div>

      {editing !== undefined && (
        <ProductForm
          key={editing?.id ?? 'new'}
          product={editing}
          onDone={() => setEditing(undefined)}
        />
      )}

      <input
        className={`${input} mb-4 max-w-sm bg-white`}
        placeholder="Search by name"
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
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2 text-right">Unit price ({CURRENCY})</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-4 py-2">{p.name}</td>
                    <td className="px-4 py-2 text-slate-600">{p.description}</td>
                    <td className="px-4 py-2 text-right">{money(p.unitPrice)}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => setEditing(p)}
                        className="mr-3 text-slate-700 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(p)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {data.data.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                      No products found.
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