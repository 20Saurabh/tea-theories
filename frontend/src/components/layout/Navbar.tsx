'use client';
import { useState } from 'react';
import Link from 'next/link';
import { X, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const navSections = [
  {
    label: 'News',
    items: [
      { name: 'National News', slug: 'national-news' },
      { name: 'International News', slug: 'international-news' },
    ],
  },
  {
    label: 'Ideas',
    items: [
      { name: 'Philosophy', slug: 'philosophy' },
      { name: 'Ethics', slug: 'ethics' },
    ],
  },
  {
    label: 'Literature',
    items: [
      { name: 'Hindi', slug: 'hindi' },
      { name: 'English', slug: 'english' },
      { name: 'Others', slug: 'others' },
    ],
  },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{ backgroundColor: 'var(--paper)', borderColor: 'var(--border)' }}>
        <div className="max-w-[760px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl font-bold tracking-tight hover:opacity-70 transition-opacity"
            style={{ color: 'var(--ink)' }}>
            Tea and Theories
          </Link>
          <div className="flex items-center gap-1">
            <button onClick={toggle}
              className="p-2 hover:opacity-60 transition-opacity"
              style={{ color: 'var(--ink)' }}
              aria-label={theme === 'light' ? 'Dark mode' : 'Light mode'}>
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <button onClick={() => setOpen(!open)}
              className="p-2 hover:opacity-60 transition-opacity"
              style={{ color: 'var(--ink)' }} aria-label="Menu">
              {open ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </header>

      <div className={`fixed inset-0 z-40 transition-all duration-300 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 transition-opacity duration-300 ${open ? 'opacity-30' : 'opacity-0'}`}
          style={{ backgroundColor: theme === 'dark' ? '#fff' : '#000' }}
          onClick={() => setOpen(false)} />
        <nav className={`absolute top-14 right-0 w-64 border-l border-b transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ backgroundColor: 'var(--paper)', borderColor: 'var(--border)' }}>
          <div className="p-6 space-y-6">
            {navSections.map(section => (
              <div key={section.label}>
                <p className="text-xs uppercase tracking-widest font-semibold mb-2"
                  style={{ color: 'var(--muted2)' }}>
                  {section.label}
                </p>
                <ul className="space-y-0.5">
                  {section.items.map(item => (
                    <li key={item.slug}>
                      <Link href={`/category/${item.slug}`}
                        className="block py-1.5 text-sm hover:opacity-60 transition-opacity"
                        style={{ color: 'var(--ink)' }}
                        onClick={() => setOpen(false)}>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-xs uppercase tracking-widest font-semibold mb-2"
                style={{ color: 'var(--muted2)' }}>
                Pages
              </p>
              <ul className="space-y-0.5">
                <li>
                  <Link href="/about"
                    className="block py-1.5 text-sm hover:opacity-60 transition-opacity"
                    style={{ color: 'var(--ink)' }}
                    onClick={() => setOpen(false)}>
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/editorial-policy"
                    className="block py-1.5 text-sm hover:opacity-60 transition-opacity"
                    style={{ color: 'var(--ink)' }}
                    onClick={() => setOpen(false)}>
                    Editorial Policy
                  </Link>
                </li>
                <li>
                  <Link href="/contact"
                    className="block py-1.5 text-sm hover:opacity-60 transition-opacity"
                    style={{ color: 'var(--ink)' }}
                    onClick={() => setOpen(false)}>
                    Contact
                  </Link>
                </li>
              </ul>
              <div className="mt-4">
                <Link href="/admin/login"
                  className="text-xs hover:opacity-60 transition-opacity"
                  style={{ color: 'var(--muted)' }}
                  onClick={() => setOpen(false)}>
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
