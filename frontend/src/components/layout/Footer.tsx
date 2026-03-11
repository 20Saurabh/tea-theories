import Link from 'next/link';

export default function Footer() {
  return (
    <footer 
      style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        padding: '12px 0', 
        borderTop: '1px solid var(--border)',
        backgroundColor: 'var(--paper)',
        zIndex: 30
      }}>
      <div className="max-w-[760px] mx-auto px-6">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs" style={{ color: 'var(--muted)' }}>
          <nav className="flex items-center gap-x-3 gap-y-1">
            <Link href="/about" className="hover:opacity-60 transition-opacity">About</Link>
            <span>·</span>
            <Link href="/contact" className="hover:opacity-60 transition-opacity">Contact</Link>
            <span>·</span>
            <Link href="/editorial-policy" className="hover:opacity-60 transition-opacity">Editorial Policy</Link>
          </nav>
          <span>© 2026 All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

