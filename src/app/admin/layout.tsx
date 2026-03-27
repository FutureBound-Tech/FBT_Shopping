import Link from 'next/link';
import { LayoutDashboard, PlusCircle, Package, Users, ShoppingCart, CreditCard } from 'lucide-react';
import './admin.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-container">
      <aside className="admin-sidebar glass-panel">
        <div className="admin-brand">
          <h2>AI Shopping<span>Admin</span></h2>
        </div>
        <nav className="admin-nav">
          <Link href="/admin" className="nav-item">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/add-product" className="nav-item">
            <PlusCircle size={20} />
            <span>Add Product</span>
          </Link>
          <Link href="/admin/products" className="nav-item">
            <Package size={20} />
            <span>Products</span>
          </Link>
          <Link href="/admin/customers" className="nav-item">
            <Users size={20} />
            <span>Customers</span>
          </Link>
          <Link href="/admin/orders" className="nav-item">
            <ShoppingCart size={20} />
            <span>Orders</span>
          </Link>
          <Link href="/admin/payments" className="nav-item">
            <CreditCard size={20} />
            <span>Payments</span>
          </Link>
        </nav>
      </aside>
      <main className="admin-main">
        <header className="admin-header glass-nav">
          <div className="header-title">Admin Console</div>
          <div className="header-actions">
            <div className="admin-avatar">A</div>
          </div>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
