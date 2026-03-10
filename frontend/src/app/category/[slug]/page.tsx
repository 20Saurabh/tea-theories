import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ArticleCard from '@/components/ui/ArticleCard';
import Link from 'next/link';
import { Article } from '@/lib/api';

const BACKEND = 'http://localhost:8801';

async function getCategoryArticles(slug: string): Promise<Article[]> {
  try {
    const res = await fetch(`${BACKEND}/api/categories/${slug}/articles`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    title: `${name} — Tea and Theories`,
    description: `Read articles about ${name} on Tea and Theories.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const articles = await getCategoryArticles(slug);
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--paper)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main className="pt-14" style={{ flex: '1' }}>
        <div className="max-w-[760px] mx-auto px-6">
          <div className="pt-12 pb-8" style={{ borderBottom: '1px solid var(--border)' }}>
            <Link href="/" className="text-xs hover:opacity-60 transition-opacity"
              style={{ color: 'var(--muted2)' }}>
              ← Home
            </Link>
            <h1 className="font-serif text-3xl font-bold mt-3 mb-1" style={{ color: 'var(--ink)' }}>
              {name}
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted2)' }}>
              {articles.length} {articles.length === 1 ? 'article' : 'articles'}
            </p>
          </div>
          <div className="py-4">
            {articles.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm" style={{ color: 'var(--muted2)' }}>
                  No articles in this section yet.
                </p>
              </div>
            ) : (
              articles.map(a => <ArticleCard key={a.id} article={a} />)
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

