import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ArticleInteractions from '@/components/ui/ArticleInteractions';
import ArticleCard from '@/components/ui/ArticleCard';
import Link from 'next/link';
import { Article } from '@/lib/api';
import { notFound } from 'next/navigation';

const BACKEND = 'http://localhost:8801';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch { return ''; }
}

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${BACKEND}/api/articles/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function getRelated(slug: string): Promise<Article[]> {
  try {
    const res = await fetch(`${BACKEND}/api/articles/${slug}/related`, { next: { revalidate: 120 } });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: 'Not Found — Tea and Theories' };
  const desc = article.metaDescription || article.excerpt || undefined;
  return {
    title: `${article.title} — Tea and Theories`,
    description: desc,
    openGraph: {
      title: article.title,
      description: desc,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author || 'Tea and Theories'],
      images: article.coverImage ? [{ url: article.coverImage }] : [],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [article, related] = await Promise.all([getArticle(slug), getRelated(slug)]);
  if (!article || !article.published) notFound();

  const date = formatDate(article.publishedAt);
  const tags = article.tags ? article.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--paper)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main className="pt-14" style={{ flex: '1' }}>
        <div className="max-w-[760px] mx-auto px-6">

          {/* Breadcrumb */}
          <nav className="pt-10 flex items-center gap-2 text-xs" style={{ color: 'var(--muted2)' }}>
            <Link href="/" className="hover:opacity-60 transition-opacity" style={{ color: 'var(--muted2)' }}>
              Home
            </Link>
            {article.categoryName && (
              <>
                <span>/</span>
                <Link href={`/category/${article.categorySlug}`}
                  className="hover:opacity-60 transition-opacity"
                  style={{ color: 'var(--muted2)' }}>
                  {article.categoryName}
                </Link>
              </>
            )}
          </nav>

          {/* Header */}
          <header className="pt-6 pb-8" style={{ borderBottom: '1px solid var(--border)' }}>
            {article.categoryName && (
              <p className="text-xs uppercase tracking-widest font-medium mb-3"
                style={{ color: 'var(--muted2)' }}>
                {article.categoryName}
              </p>
            )}
            <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-4"
              style={{ color: 'var(--ink)' }}>
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="font-serif text-lg italic leading-relaxed mb-5"
                style={{ color: 'var(--muted)' }}>
                {article.excerpt}
              </p>
            )}
            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
              style={{ color: 'var(--muted2)' }}>
              <span className="font-medium" style={{ color: 'var(--muted)' }}>
                {article.author || 'Tea and Theories'}
              </span>
              {date && <><span>·</span><span>{date}</span></>}
              <span>·</span>
              <span>{article.readingTime || 1} min read</span>
            </div>
          </header>

          {/* Cover image */}
          {article.coverImage && (
            <figure className="mt-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-auto"
                style={{ maxHeight: '500px', objectFit: 'cover' }}
              />
            </figure>
          )}

          {/* Body */}
          <div className="article-content mt-8"
            style={{ fontSize: '1.0625rem', lineHeight: '1.85' }}
            dangerouslySetInnerHTML={{ __html: article.content || '' }}
          />

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-10 pt-6 flex flex-wrap gap-2"
              style={{ borderTop: '1px solid var(--border)' }}>
              {tags.map(tag => (
                <span key={tag}
                  className="text-xs px-3 py-1 border"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--muted)',
                    backgroundColor: 'var(--card-bg)',
                  }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Interactions */}
          <ArticleInteractions slug={article.slug} />

          {/* Related articles */}
          {related.length > 0 && (
            <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
              <h2 className="font-serif text-xl font-bold mb-2" style={{ color: 'var(--ink)' }}>
                More from {article.categoryName || 'Tea and Theories'}
              </h2>
              <div>
                {related.map(a => <ArticleCard key={a.id} article={a} />)}
              </div>
            </div>
          )}

          <div className="py-10" />
        </div>
      </main>
      <Footer />
    </div>
  );
}

