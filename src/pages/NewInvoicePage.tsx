import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerOptions } from '../features/customers/hooks';
import { useProductOptions } from '../features/products/hooks';
import { useCreateInvoice } from '../features/invoices/hooks';
import { CURRENCY, money, toCents } from '../lib/format';

interface Row {
  productId: string;
  quantity: number;
}

const field =
  'w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none';

export default function NewInvoicePage() {
  const navigate = useNavigate();
  const customers = useCustomerOptions();
  const products = useProductOptions();
  const create = useCreateInvoice();

  const [customerId, setCustomerId] = useState('');
  const [issueDate, setIssueDate] = useState(
    new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD in local time
  );
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState<Row[]>([{ productId: '', quantity: 1 }]);

  const productList = products.data?.data ?? [];
  const priceOf = (id: string) =>
    productList.find((p) => p.id === id)?.unitPrice ?? 0;

  const totalCents = rows.reduce(
    (sum, r) => sum + r.quantity * toCents(priceOf(r.productId)),
    0,
  );

  const updateRow = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const canSubmit = customerId && rows.length > 0 && rows.every((r) => r.productId);

  const submit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    create.mutate(
      {
        customerId,
        issueDate,
        notes: notes.trim() || undefined,
        items: rows,
      },
      { onSuccess: (inv) => navigate(`/invoices/${inv.id}`) },
    );
  };

  if (customers.isLoading || products.isLoading) {
    return <p className="text-slate-500">Loading...</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <h1 className="text-xl font-semibold">New invoice</h1>

      <div className="grid gap-4 rounded-lg border bg-white p-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Customer</span>
          <select
            className={field}
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
          >
            <option value="">Select a customer...</option>
            {customers.data?.data.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.mobile})
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Issue date</span>
          <input
            type="date"
            className={field}
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
          />
        </label>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 font-semibold">Items</h2>
        <div className="space-y-3">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-12 items-center gap-2">
              <select
                className={`${field} col-span-12 sm:col-span-6`}
                value={row.productId}
                onChange={(e) => updateRow(i, { productId: e.target.value })}
                required
              >
                <option value="">Select a product...</option>
                {productList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {CURRENCY} {money(p.unitPrice)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={100000}
                step={1}
                className={`${field} col-span-4 sm:col-span-2`}
                value={row.quantity}
                onChange={(e) =>
                  updateRow(i, {
                    quantity: Math.max(1, Math.floor(Number(e.target.value)) || 1),
                  })
                }
              />
              <div className="col-span-6 text-right text-sm sm:col-span-3">
                {money((row.quantity * toCents(priceOf(row.productId))) / 100)}
              </div>
              <button
                type="button"
                disabled={rows.length === 1}
                onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))}
                className="col-span-2 text-sm text-red-600 hover:underline disabled:opacity-30 sm:col-span-1"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setRows((rs) => [...rs, { productId: '', quantity: 1 }])}
          className="mt-4 rounded border px-3 py-1.5 text-sm hover:bg-slate-100"
        >
          + Add item
        </button>

        <div className="mt-4 border-t pt-3 text-right text-lg font-semibold">
          Total: {CURRENCY} {money(totalCents / 100)}
        </div>
        <p className="text-right text-xs text-slate-500">
          Preview only. The server calculates the final total.
        </p>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block text-slate-600">Notes (optional)</span>
        <textarea
          className={field}
          rows={3}
          maxLength={1000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>

      {create.error && <p className="text-sm text-red-600">{create.error.message}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!canSubmit || create.isPending}
          className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {create.isPending ? 'Creating...' : 'Create invoice'}
        </button>
        <Link to="/invoices" className="rounded border px-4 py-2 text-sm hover:bg-slate-100">
          Cancel
        </Link>
      </div>
    </form>
  );
}