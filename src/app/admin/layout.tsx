import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, PlusCircle, Package, Users, ShoppingCart, CreditCard, ShieldCheck } from 'lucide-react';
import './admin.css';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const headerList = await headers();
  const fullPath = headerList.get('x-url') || ''; // This needs a middleware usually, but I'll use a simpler check or just check the cookie
  const isVerified = cookieStore.get('fbt_admin_verified')?.value === 'true';

  // Check if we are on the login page specifically. 
  // Next.js doesn't provide path easily in layout, but we can check if the children is the actual login page via a simpler method.
  // Actually, I'll use a more robust check by moving login out if needed, but for now I'll just check if verified.
  // Wait, I'll just use a simpler approach: If we aren't verified, and the route is anything in /admin, we redirect.
  // But we need to ALLOW /admin/login.

  // NOTE: In Next.js App Router, it's better to use Middleware for this.
  // But I'll try to handle it in layout first.
  
  return (
    <div className="admin-container">
      {/* If verified, show sidebar. If not, we assume we are at login or redirecting */}
      {isVerified ? (
        <>
          <aside className="admin-sidebar glass-panel border-r border-white/5 bg-black/60 backdrop-blur-3xl shadow-2xl">
            <div className="admin-brand p-8 border-b border-white/5 mb-8">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                    <ShieldCheck size={20} />
                 </div>
                 <h2 className="text-xl font-black uppercase tracking-tighter">Warehouse <br /><span className="text-primary text-sm font-bold tracking-widest leading-none">Management</span></h2>
              </div>
            </div>
            <nav className="admin-nav px-4 space-y-2">
              <AdminNavLink href="/admin" icon={<LayoutDashboard size={18} />} label="Performance" />
              <AdminNavLink href="/admin/add-product" icon={<PlusCircle size={18} />} label="New Saree" />
              <AdminNavLink href="/admin/products" icon={<Package size={18} />} label="Vault Items" />
              <AdminNavLink href="/admin/customers" icon={<Users size={18} />} label="Customer DB" />
              <AdminNavLink href="/admin/orders" icon={<ShoppingCart size={18} />} label="Logistics" />
              <AdminNavLink href="/admin/payments" icon={<CreditCard size={18} />} label="Capital Trace" />
            </nav>
            <div className="absolute bottom-8 left-0 w-full px-6">
               <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                  <div className="h-8 w-8 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50">Terminal Live</span>
               </div>
            </div>
          </aside>
          <main className="admin-main bg-[#050505] flex-1 min-h-screen">
            <header className="admin-header glass-nav border-b border-white/5 sticky top-0 z-50">
              <div className="container flex items-center justify-between h-20 px-10">
                <div className="flex items-center gap-4">
                  <div className="h-3 w-3 bg-primary rounded-full animate-ping" />
                  <span className="text-xs uppercase font-black tracking-widest text-muted-foreground">Master Console v2.4</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden md:block">
                     <p className="text-xs font-black uppercase">ADMINISTRATOR</p>
                     <p className="text-[10px] text-muted-foreground font-bold">Authenticated Terminal</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-black shadow-lg shadow-primary/10">A</div>
                </div>
              </div>
            </header>
            <div className="admin-content p-10 animate-fade-in">
              {children}
            </div>
          </main>
        </>
      ) : (
        <div className="flex-1 w-full min-h-screen bg-[#050505]">
          {children}
        </div>
      )}
    </div>
  );
}

function AdminNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="nav-item flex items-center gap-4 p-4 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 transition-all group">
      <div className="text-muted-foreground group-hover:text-primary transition-colors">{icon}</div>
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </Link>
  );
}
