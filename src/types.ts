export interface Product {
  id: string;
  name: string;
  description: string | null;
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  description: string;
  unitPrice: number;
}

export interface InvoiceItem {
  id: string;
  position: number;
  productId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  notes: string | null;
  totalAmount: number;
  customerId: string;
  customer: Customer;
  items: InvoiceItem[];
  createdAt: string;
}

export interface InvoiceInput {
  customerId: string;
  issueDate: string;
  notes?: string;
  items: { productId: string; quantity: number }[];
}