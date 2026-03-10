import Link from 'next/link';
import { Article } from '@/lib/api';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch { return ''; }
}

interface ArticleCardProps {
  article: Article;
  showCover?: boolean;
}

export default function ArticleCard({ article, showCover = false }: ArticleCardProps) {
  const date = formatDate(article.publishedAt);
  const readingTime = article.readingTime || 1;

  return (
    <article className="group py-6 last:border-0" style={{ borderBottom: '1px solid var(--border)' }}>
      <Link href={`/article/${article.slug}`} className="block">
        {showCover && article.coverImage && (
          <div className="mb-4 overflow-hidden" style={{ aspectRatio: '16/7' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
            />
          </div>
        )}
        {article.categoryName && (
          <p className="text-xs uppercase tracking-widest font-medium mb-2"
            style={{ color: 'var(--muted2)' }}>
            {article.categoryName}
          </p>
        )}
        <h3 className="font-serif text-[1.1rem] font-bold leading-snug group-hover:opacity-60 transition-opacity mb-2"
          style={{ color: 'var(--ink)' }}>
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-sm leading-relaxed line-clamp-2 mb-3"
            style={{ color: 'var(--muted)' }}>
            {article.excerpt}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs"
          style={{ color: 'var(--muted2)' }}>
          {article.author && (
            <span className="font-medium" style={{ color: 'var(--muted)' }}>{article.author}</span>
          )}
          {date && <><span>·</span><span>{date}</span></>}
          <span>·</span>
          <span>{readingTime} min read</span>
        </div>
      </Link>
    </article>
  );
}
