import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import CustomersPage from './pages/CustomersPage';
import ProductsPage from './pages/ProductsPage';
import InvoicesPage from './pages/InvoicesPage';
import NewInvoicePage from './pages/NewInvoicePage';
import InvoiceViewPage from './pages/InvoiceViewPage';

const link = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-1.5 text-sm font-medium ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`;

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 print:bg-white">
      <header className="border-b bg-white print:hidden">
        <nav className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3">
          <span className="mr-4 font-semibold">Invoice Generator</span>
          <NavLink to="/customers" className={link}>Customers</NavLink>
          <NavLink to="/products" className={link}>Products</NavLink>
          <NavLink to="/invoices" className={link}>Invoices</NavLink>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 print:max-w-none print:p-0">
        <Routes>
          <Route path="/" element={<Navigate to="/customers" replace />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/invoices/new" element={<NewInvoicePage />} />
          <Route path="/invoices/:id" element={<InvoiceViewPage />} />
        </Routes>
      </main>
    </div>
  );
}