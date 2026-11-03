import { Link, useParams } from 'react-router-dom';
import { BUSINESS } from '../config';
import { useInvoice } from '../features/invoices/hooks';
import { CURRENCY, money } from '../lib/format';

export default function InvoiceViewPage() {
  const { id } = useParams();
  const { data: inv, isLoading, error } = useInvoice(id);

  if (isLoading) return <p className="text-slate-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error.message}</p>;
  if (!inv) return null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link to="/invoices" className="text-sm text-slate-600 hover:underline">
          ← Back to invoices
        </Link>
        <button
          onClick={() => window.print()}
          className="rounded bg-slate-900 px-4 py-2 text-sm text-white"
        >
          Print / Save as PDF
        </button>
      </div>

      <article className="mx-auto max-w-3xl rounded-lg border bg-white p-10 shadow-sm print:max-w-none print:border-0 print:p-0 print:shadow-none">
        <header className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">{BUSINESS.name}</h2>
            {BUSINESS.address.map((line) => (
              <p key={line} className="text-sm text-slate-600">{line}</p>
            ))}
            <p className="text-sm text-slate-600">{BUSINESS.phone}</p>
            <p className="text-sm text-slate-600">{BUSINESS.email}</p>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold tracking-wide">INVOICE</h1>
            <p className="mt-2 text-sm">No: <strong>{inv.invoiceNumber}</strong></p>
            <p className="text-sm">Date: {inv.issueDate}</p>
          </div>
        </header>

        <section className="mt-8">
          <p className="text-xs font-semibold uppercase text-slate-500">Bill to</p>
          <p className="font-medium">{inv.customer.name}</p>
          <p className="text-sm text-slate-600">{inv.customer.mobile}</p>
        </section>

        <table className="mt-8 w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-slate-900">
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Unit price</th>
              <th className="py-2 text-right">Total ({CURRENCY})</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((item) => (
              <tr key={item.id} className="break-inside-avoid border-b border-slate-200">
                <td className="py-2">{item.description}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">{money(item.unitPrice)}</td>
                <td className="py-2 text-right">{money(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-64 border-t-2 border-slate-900 pt-2 text-right text-lg font-bold">
            Total: {CURRENCY} {money(inv.totalAmount)}
          </div>
        </div>

        {inv.notes && (
          <section className="mt-8">
            <p className="text-xs font-semibold uppercase text-slate-500">Notes</p>
            <p className="whitespace-pre-wrap text-sm">{inv.notes}</p>
          </section>
        )}
      </article>
    </div>
  );
}