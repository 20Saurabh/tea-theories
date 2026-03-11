import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { Article, Category } from '@/lib/api';

const BACKEND = 'http://localhost:8801';

async function getLatestArticle(): Promise<Article | null> {
  try {
    const res = await fetch(`${BACKEND}/api/articles`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const articles: Article[] = await res.json();
    // Filter only published and return most recent
    const published = articles.filter(a => a.published);
    if (published.length === 0) return null;
    // Sort by publishedAt descending
    published.sort((a, b) => {
      if (!a.publishedAt) return 1;
      if (!b.publishedAt) return -1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
    return published[0];
  } catch { return null; }
}

async function getRecentArticles(): Promise<Article[]> {
  try {
    const res = await fetch(`${BACKEND}/api/articles`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const articles: Article[] = await res.json();
    // Filter only published
    const published = articles.filter(a => a.published);
    if (published.length === 0) return [];
    // Sort by publishedAt descending, skip the first one (latest)
    published.sort((a, b) => {
      if (!a.publishedAt) return 1;
      if (!b.publishedAt) return -1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
    return published.slice(0, 6);
  } catch { return []; }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${BACKEND}/api/categories`, { next: { revalidate: 3600 } });
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
  title: 'Pasta and Perspective',
  description: 'Ideas worth sitting with. — Writing on philosophy, history, culture, and the questions that matter.',
  openGraph: {
    title: 'Pasta and Perspective',
    description: 'Ideas worth sitting with. — Writing on philosophy, history, culture, and the questions that matter.',
    type: 'website',
  },
};

export default async function HomePage() {
  const [latestArticle, recentArticles, categories] = await Promise.all([
    getLatestArticle(),
    getRecentArticles(),
    getCategories()
  ]);

  // Filter out the latest article from recent articles to avoid duplication
  const recentWithoutLatest = latestArticle 
    ? recentArticles.filter(a => a.id !== latestArticle.id).slice(0, 5)
    : recentArticles.slice(0, 6);

  // Group categories by parent
  const parentCategories = categories.filter(cat => !cat.parentSlug);
  const getSubcategories = (parentSlug: string) => categories.filter(cat => cat.parentSlug === parentSlug);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--paper)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main className="pt-14" style={{ flex: '1' }}>
        <div className="max-w-[760px] mx-auto px-6">

          {/* Hero */}
          <div className="pt-14 pb-12" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="mb-6 overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <img 
                src="https://thumbs.dreamstime.com/b/ai-generated-optical-illusion-digital-art-mind-bending-elements-like-people-animals-buildings-landscapes-etc-mind-bending-268997483.jpg?w=992" 
                alt="Hero" 
                className="w-full h-full object-cover"
              />
            </div>
            <p className="font-serif text-lg italic mb-3" style={{ color: 'var(--muted)' }}>
              Ideas worth sitting with.
            </p>
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--muted)' }}>
              Writing on philosophy, history, literature, and the questions that matter.
            </p>
            <Link href="/articles" 
              className="inline-block text-sm border-b pb-0.5 hover:opacity-60 transition-opacity"
              style={{ color: 'var(--ink)', borderColor: 'var(--border)' }}>
              Read ideas →
            </Link>
          </div>

          {/* Latest Essay */}
          {latestArticle && (
            <div className="py-10" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-serif text-lg font-bold mb-6" style={{ color: 'var(--muted2)' }}>
                Latest Thought
              </h2>
              <article>
                <Link href={`/article/${latestArticle.slug}`}>
                  <h3 className="font-serif text-2xl font-bold mb-3 hover:opacity-60 transition-opacity"
                    style={{ color: 'var(--ink)' }}>
                    {latestArticle.title}
                  </h3>
                </Link>
                {latestArticle.excerpt && (
                  <p className="text-base mb-4 line-clamp-3" style={{ color: 'var(--muted)' }}>
                    {latestArticle.excerpt}
                  </p>
                )}
                <div className="text-sm" style={{ color: 'var(--muted2)' }}>
                  {latestArticle.author || 'Pasta and Perspective'} · {formatDate(latestArticle.publishedAt)} · {latestArticle.readingTime || 1} min read
                </div>
              </article>
            </div>
          )}

          {/* Recent Thoughts */}
          {recentWithoutLatest.length > 0 && (
            <div className="py-10" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-serif text-lg font-bold mb-6" style={{ color: 'var(--muted2)' }}>
                Recent Thoughts
              </h2>
              <div className="space-y-8">
                {recentWithoutLatest.map(article => (
                  <article key={article.id}>
                    <Link href={`/article/${article.slug}`}>
                      <h3 className="font-serif text-lg font-bold mb-2 hover:opacity-60 transition-opacity"
                        style={{ color: 'var(--ink)' }}>
                        {article.title}
                      </h3>
                    </Link>
                    {article.excerpt && (
                      <p className="text-sm mb-2 line-clamp-2" style={{ color: 'var(--muted)' }}>
                        {article.excerpt}
                      </p>
                    )}
                    <div className="text-xs" style={{ color: 'var(--muted2)' }}>
                      {article.author || 'Pasta and Perspective'} · {formatDate(article.publishedAt)} · {article.readingTime || 1} min read
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Explore Themes */}
          {parentCategories.length > 0 && (
            <div className="py-10">
              <h2 className="font-serif text-lg font-bold mb-6" style={{ color: 'var(--muted2)' }}>
                Explore Themes
              </h2>
              <div className="flex flex-wrap gap-x-6 gap-y-4">
                {parentCategories.map((parent, index) => (
                  <div key={parent.id} className="flex items-baseline gap-2">
                    <Link 
                      href={`/category/${parent.slug}`}
                      className="font-serif text-base font-bold border-b pb-0.5 hover:opacity-60 transition-opacity"
                      style={{ color: 'var(--ink)', borderColor: 'var(--border)' }}
                    >
                      {parent.name}
                    </Link>
                    {parent.slug === 'news' && (
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>(National, International)</span>
                    )}
                    {parent.slug === 'literature' && (
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>(Hindi, English)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!latestArticle && recentWithoutLatest.length === 0 && categories.length === 0 && (
            <div className="py-20 text-center">
              <p className="font-serif text-xl mb-3" style={{ color: 'var(--muted2)' }}>
                No articles published yet.
              </p>
              <Link href="/admin/login"
                className="text-sm underline hover:opacity-60 transition-opacity"
                style={{ color: 'var(--ink)' }}>
                Log in as admin to start publishing.
              </Link>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}

