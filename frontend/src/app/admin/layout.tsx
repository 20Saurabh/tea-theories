'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FileText, Upload, Home, LogOut, Plus, LayoutDashboard } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setReady(true);
      return;
    }
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
    } else {
      setReady(true);
    }
  }, [pathname, router]);

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  if (!ready) return null;
  if (pathname === '/admin/login') return <>{children}</>;

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/articles', label: 'All Articles', icon: FileText, exact: true },
    { href: '/admin/articles/new', label: 'New Article', icon: Plus, exact: true },
    { href: '/admin/media', label: 'Media Library', icon: Upload, exact: true },
  ];

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-[#fafaf8] flex">
      {/* Sidebar */}
      <aside className="w-52 border-r border-[#e5e5e3] flex flex-col fixed top-0 bottom-0 z-20">
        <div className="p-5 border-b border-[#e5e5e3]">
          <Link href="/" className="font-serif text-lg font-bold text-[#0a0a0a] hover:opacity-70 transition-opacity">
            Pasta and Perspective
          </Link>
          <p className="text-xs text-[#9b9b9b] mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          <ul className="space-y-0.5">
            {navItems.map(({ href, label, icon: Icon, exact }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded transition-colors ${
                    isActive(href, exact)
                      ? 'bg-[#0a0a0a] text-[#fafaf8]'
                      : 'text-[#6b6b6b] hover:text-[#0a0a0a] hover:bg-[#f0f0ee]'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-3 border-t border-[#e5e5e3] space-y-0.5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#6b6b6b] hover:text-[#0a0a0a] hover:bg-[#f0f0ee] rounded transition-colors"
          >
            <Home size={14} />
            View Site
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#6b6b6b] hover:text-red-600 hover:bg-red-50 rounded transition-colors w-full text-left"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-52 min-h-screen">
        {children}
      </main>
    </div>
  );
}
