import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { Article } from '@/lib/api';

const BACKEND = 'http://localhost:8801';

async function getAllArticles(): Promise<Article[]> {
  try {
    const res = await fetch(`${BACKEND}/api/articles`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

function formatDate(d: string | null) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return ''; }
}

export const metadata = {
  title: 'All Ideas — Pasta and Perspective',
  description: 'Browse all articles on Pasta and Perspective.',
};

export default async function ArticlesPage() {
  const articles = await getAllArticles();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--paper)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main className="pt-14" style={{ flex: '1' }}>
        <div className="max-w-[760px] mx-auto px-6">
          <div className="pt-12 pb-10" style={{ borderBottom: '1px solid var(--border)' }}>
            <Link href="/" className="text-xs hover:opacity-60 transition-opacity"
              style={{ color: 'var(--muted2)' }}>
              ← Home
            </Link>
            <h1 className="font-serif text-3xl font-bold mt-3" style={{ color: 'var(--ink)' }}>
              All Ideas
            </h1>
          </div>

          {articles.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm" style={{ color: 'var(--muted2)' }}>
                No articles published yet.
              </p>
            </div>
          ) : (
            <div className="py-8 space-y-10">
              {articles.map(article => (
                <article key={article.id} className="pb-8" style={{ borderBottom: '1px solid var(--border)' }}>
                  <Link href={`/article/${article.slug}`} className="block group">
                    <h2 className="font-serif text-2xl font-bold mb-3 group-hover:opacity-60 transition-opacity"
                      style={{ color: 'var(--ink)' }}>
                      {article.title}
                    </h2>
                  </Link>
                  {article.excerpt && (
                    <p className="text-base mb-3" style={{ color: 'var(--muted)' }}>
                      {article.excerpt}
                    </p>
                  )}
                  <p className="text-sm" style={{ color: 'var(--muted2)' }}>
                    {formatDate(article.publishedAt)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

