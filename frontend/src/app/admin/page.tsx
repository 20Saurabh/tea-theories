'use client';
import { useEffect, useState } from 'react';
import { api, Article, Category } from '@/lib/api';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Eye, Heart, MessageCircle, FileText, ChevronDown, ChevronRight } from 'lucide-react';

type GroupedArticles = {
  category: string;
  articles: Article[];
};

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    Promise.all([
      api.adminGetArticles(),
      api.getCategories(),
    ]).then(([arts, cats]) => {
      setArticles(arts);
      setCategories(cats);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?\n\nThis cannot be undone.`)) return;
    try {
      await api.adminDeleteArticle(id);
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (e: any) {
      alert('Failed to delete: ' + (e.message || 'Unknown error'));
    }
  };

  const toggleCollapse = (cat: string) => {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Group articles by category, sorted by category display order
  const grouped: GroupedArticles[] = (() => {
    const map: Record<string, Article[]> = {};

    // Add uncategorized bucket
    articles.forEach(a => {
      const key = a.categoryName || 'Uncategorized';
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });

    // Sort categories by their display order from backend
    const catOrder = categories.map(c => c.name);
    const keys = Object.keys(map).sort((a, b) => {
      const ai = catOrder.indexOf(a);
      const bi = catOrder.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

    return keys.map(key => ({
      category: key,
      articles: map[key].sort((a, b) => {
        const da = a.publishedAt || a.createdAt || '';
        const db = b.publishedAt || b.createdAt || '';
        return db.localeCompare(da);
      }),
    }));
  })();

  const published = articles.filter(a => a.published).length;
  const drafts = articles.filter(a => !a.published).length;
  const totalLikes = articles.reduce((s, a) => s + (a.likeCount || 0), 0);
  const totalComments = articles.reduce((s, a) => s + (a.commentCount || 0), 0);

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return '—'; }
  };

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#0a0a0a]">Dashboard</h1>
          <p className="text-sm text-[#9b9b9b] mt-0.5">Tea and Theories — Admin</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 bg-[#0a0a0a] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#333] transition-colors"
        >
          <Plus size={15} />
          New Article
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: FileText,      label: 'Published',  value: published      },
          { icon: FileText,      label: 'Drafts',     value: drafts         },
          { icon: Heart,         label: 'Likes',      value: totalLikes     },
          { icon: MessageCircle, label: 'Comments',   value: totalComments  },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="border border-[#e5e5e3] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={13} className="text-[#9b9b9b]" />
              <span className="text-xs text-[#9b9b9b] uppercase tracking-widest font-medium">{label}</span>
            </div>
            <span className="text-2xl font-bold text-[#0a0a0a]">{value}</span>
          </div>
        ))}
      </div>

      {/* Category-wise articles */}
      {loading ? (
        <p className="text-sm text-[#9b9b9b]">Loading...</p>
      ) : articles.length === 0 ? (
        <div className="border border-dashed border-[#e5e5e3] p-16 text-center">
          <p className="text-sm text-[#9b9b9b] mb-4">No articles yet.</p>
          <Link href="/admin/articles/new" className="text-sm text-[#0a0a0a] underline">
            Create your first article →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ category, articles: arts }) => {
            const isCollapsed = collapsed[category];
            const liveCt = arts.filter(a => a.published).length;
            const draftCt = arts.filter(a => !a.published).length;

            return (
              <div key={category} className="border border-[#e5e5e3]">

                {/* Category header — click to collapse/expand */}
                <button
                  onClick={() => toggleCollapse(category)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#f9f9f7] hover:bg-[#f0f0ee] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {isCollapsed
                      ? <ChevronRight size={14} className="text-[#9b9b9b]" />
                      : <ChevronDown size={14} className="text-[#9b9b9b]" />
                    }
                    <span className="font-serif font-bold text-[#0a0a0a]">{category}</span>
                    <div className="flex items-center gap-2">
                      {liveCt > 0 && (
                        <span className="text-xs bg-[#0a0a0a] text-white px-1.5 py-0.5">
                          {liveCt} live
                        </span>
                      )}
                      {draftCt > 0 && (
                        <span className="text-xs bg-[#e5e5e3] text-[#6b6b6b] px-1.5 py-0.5">
                          {draftCt} draft
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href="/admin/articles/new"
                    onClick={e => e.stopPropagation()}
                    className="text-xs text-[#9b9b9b] hover:text-[#0a0a0a] transition-colors flex items-center gap-1"
                  >
                    <Plus size={11} /> Add
                  </Link>
                </button>

                {/* Articles list — collapsible */}
                {!isCollapsed && (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#e5e5e3]">
                        <th className="text-left px-4 py-2 text-xs text-[#9b9b9b] font-medium">Title</th>
                        <th className="text-left px-4 py-2 text-xs text-[#9b9b9b] font-medium">Status</th>
                        <th className="text-left px-4 py-2 text-xs text-[#9b9b9b] font-medium hidden lg:table-cell">Date</th>
                        <th className="text-left px-4 py-2 text-xs text-[#9b9b9b] font-medium hidden md:table-cell">♥</th>
                        <th className="px-4 py-2 w-20"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {arts.map(a => (
                        <tr
                          key={a.id}
                          className="border-b border-[#e5e5e3] last:border-0 hover:bg-[#f5f5f3] transition-colors"
                        >
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-[#0a0a0a] line-clamp-1 block max-w-[260px]">
                              {a.title}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-1.5 py-0.5 ${
                              a.published
                                ? 'bg-[#0a0a0a] text-white'
                                : 'bg-[#f0f0ee] text-[#6b6b6b]'
                            }`}>
                              {a.published ? 'Live' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="text-xs text-[#9b9b9b]">
                              {formatDate(a.publishedAt || a.createdAt)}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-xs text-[#9b9b9b]">{a.likeCount || 0}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 justify-end">
                              {a.published && (
                                <Link
                                  href={`/article/${a.slug}`}
                                  target="_blank"
                                  title="View live"
                                  className="p-1.5 text-[#9b9b9b] hover:text-[#0a0a0a] transition-colors"
                                >
                                  <Eye size={13} />
                                </Link>
                              )}
                              <Link
                                href={`/admin/articles/${a.id}`}
                                title="Edit"
                                className="p-1.5 text-[#9b9b9b] hover:text-[#0a0a0a] transition-colors"
                              >
                                <Edit2 size={13} />
                              </Link>
                              <button
                                onClick={() => handleDelete(a.id, a.title)}
                                title="Delete"
                                className="p-1.5 text-[#9b9b9b] hover:text-red-600 transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
