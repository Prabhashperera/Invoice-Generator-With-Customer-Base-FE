import { useEffect, useState } from 'react';
import {
  useCustomers,
  useDeleteCustomer,
  useSaveCustomer,
} from '../features/customers/hooks';
import type { Customer } from '../types';

const input =
  'w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none';

function CustomerForm({
  customer,
  onDone,
}: {
  customer: Customer | null;
  onDone: () => void;
}) {
  const [name, setName] = useState(customer?.name ?? '');
  const [mobile, setMobile] = useState(customer?.mobile ?? '');
  const save = useSaveCustomer();

  const submit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    save.mutate(
      { id: customer?.id, input: { name, mobile } },
      { onSuccess: onDone },
    );
  };

  return (
    <form onSubmit={submit} className="mb-6 space-y-3 rounded-lg border bg-white p-4">
      <h2 className="font-semibold">{customer ? 'Edit customer' : 'New customer'}</h2>
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
          placeholder="Mobile (e.g. 0771234567)"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          required
        />
      </div>
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

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  // undefined = form closed, null = creating, Customer = editing
  const [editing, setEditing] = useState<Customer | null | undefined>(undefined);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, error } = useCustomers(page, search);
  const del = useDeleteCustomer();

  const remove = (c: Customer) => {
    if (window.confirm(`Delete ${c.name}?`)) del.mutate(c.id);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Customers</h1>
        <button
          onClick={() => setEditing(null)}
          className="rounded bg-slate-900 px-4 py-2 text-sm text-white"
        >
          New customer
        </button>
      </div>

      {editing !== undefined && (
        <CustomerForm
          key={editing?.id ?? 'new'}
          customer={editing}
          onDone={() => setEditing(undefined)}
        />
      )}

      <input
        className={`${input} mb-4 max-w-sm bg-white`}
        placeholder="Search by name or mobile"
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
                  <th className="px-4 py-2">Mobile</th>
                  <th className="px-4 py-2">Created</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="px-4 py-2">{c.name}</td>
                    <td className="px-4 py-2">{c.mobile}</td>
                    <td className="px-4 py-2">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => setEditing(c)}
                        className="mr-3 text-slate-700 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(c)}
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
                      No customers found.
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