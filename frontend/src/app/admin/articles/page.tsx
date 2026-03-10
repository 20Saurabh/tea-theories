'use client';
import { useEffect, useState } from 'react';
import { api, Article } from '@/lib/api';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminGetArticles().then(setArticles).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    await api.adminDeleteArticle(id);
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#0a0a0a]">Articles</h1>
          <p className="text-sm text-[#6b6b6b] mt-1">{articles.length} total</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 bg-[#0a0a0a] text-[#fafaf8] px-4 py-2.5 text-sm font-medium hover:bg-[#333] transition-colors"
        >
          <Plus size={15} />
          New Article
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-[#9b9b9b]">Loading...</p>
      ) : (
        <div className="border border-[#e5e5e3]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e5e3] bg-[#f9f9f7]">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-[#9b9b9b] font-medium">Title</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-[#9b9b9b] font-medium">Category</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-[#9b9b9b] font-medium">Status</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-[#9b9b9b] font-medium">Likes</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-[#9b9b9b] font-medium">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {articles.map(a => (
                <tr key={a.id} className="border-b border-[#e5e5e3] last:border-0 hover:bg-[#f5f5f3] transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-[#0a0a0a]">{a.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-[#6b6b6b]">{a.categoryName || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 ${a.published ? 'bg-[#0a0a0a] text-[#fafaf8]' : 'bg-[#e5e5e3] text-[#6b6b6b]'}`}>
                      {a.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-[#9b9b9b]">{a.likeCount}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-[#9b9b9b]">
                      {a.createdAt ? format(new Date(a.createdAt), 'MMM d, yyyy') : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {a.published && (
                        <Link href={`/article/${a.slug}`} target="_blank"
                          className="p-1.5 text-[#9b9b9b] hover:text-[#0a0a0a] transition-colors">
                          <Eye size={14} />
                        </Link>
                      )}
                      <Link href={`/admin/articles/${a.id}`}
                        className="p-1.5 text-[#9b9b9b] hover:text-[#0a0a0a] transition-colors">
                        <Edit2 size={14} />
                      </Link>
                      <button onClick={() => handleDelete(a.id, a.title)}
                        className="p-1.5 text-[#9b9b9b] hover:text-red-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
