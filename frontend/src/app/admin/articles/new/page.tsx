'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { api, Category } from '@/lib/api';
import { Save, Eye, Upload, Clock, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const RichEditor = dynamic(() => import('@/components/editor/RichEditor'), { ssr: false });

function buildSlug(title: string): string {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 80);
}

function calcReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(' ').filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [author, setAuthor] = useState('Tea and Theories');
  const [coverImage, setCoverImage] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [tags, setTags] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const readingTime = calcReadingTime(content);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  // Auto-generate slug from title unless manually edited
  useEffect(() => {
    if (!slugEdited && title) setSlug(buildSlug(title));
  }, [title, slugEdited]);

  const handleSave = async (pub?: boolean) => {
    if (!title.trim()) { alert('Title is required'); return; }
    setSaving(true);
    try {
      const created = await api.adminCreateArticle({
        title, slug: slug || undefined, excerpt, content,
        categoryId: categoryId ? Number(categoryId) : undefined,
        published: pub ?? false,
        coverImage, author, metaDescription, tags,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      });
      router.replace(`/admin/articles/${created.id}`);
    } catch (e: any) {
      alert(e.message || 'Failed to save');
      setSaving(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const media = await api.adminUploadMedia(file);
      setCoverImage(`http://localhost:8801${media.url}`);
    } catch {}
    setUploadingCover(false);
  };

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="border-b border-[#e5e5e3] px-8 py-4 flex items-center justify-between bg-[#fafaf8] sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm text-[#9b9b9b] hover:text-[#0a0a0a] transition-colors">← Back</Link>
          <h1 className="font-serif text-lg font-bold text-[#0a0a0a]">New Article</h1>
          <span className="text-xs text-[#9b9b9b] flex items-center gap-1">
            <Clock size={11} /> {readingTime} min read
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-[#e5e5e3] text-[#6b6b6b]">Draft</span>
          <button onClick={() => handleSave(true)} disabled={saving}
            className="flex items-center gap-2 bg-[#0a0a0a] text-white px-4 py-2 text-sm font-medium hover:bg-[#333] disabled:opacity-50 transition-colors">
            <Eye size={14} /> Publish
          </button>
          <button onClick={() => handleSave(false)} disabled={saving}
            className="flex items-center gap-2 border border-[#e5e5e3] text-[#0a0a0a] px-4 py-2 text-sm font-medium hover:bg-[#f0f0ee] disabled:opacity-50 transition-colors">
            <Save size={14} /> {saving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Row 1: category + author */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="col-span-2">
            <label className="block text-xs uppercase tracking-widest text-[#9b9b9b] mb-1.5 font-medium">Category</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
              className="w-full border border-[#e5e5e3] bg-[#fafaf8] px-3 py-2 text-sm text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]">
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#9b9b9b] mb-1.5 font-medium">Author</label>
            <input type="text" value={author} onChange={e => setAuthor(e.target.value)}
              className="w-full border border-[#e5e5e3] bg-transparent px-3 py-2 text-sm text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]" />
          </div>
        </div>

        {/* Title */}
        <textarea placeholder="Article title..."
          value={title} onChange={e => setTitle(e.target.value)} rows={2}
          className="w-full font-serif text-3xl font-bold text-[#0a0a0a] bg-transparent border-0 outline-none resize-none placeholder-[#ccc] mb-3 leading-tight" />

        {/* Slug */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-[#9b9b9b]">URL:</span>
          <span className="text-xs text-[#9b9b9b]">/article/</span>
          <input type="text" value={slug}
            onChange={e => { setSlug(e.target.value); setSlugEdited(true); }}
            className="flex-1 text-xs border-b border-[#e5e5e3] bg-transparent text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] pb-0.5"
            placeholder="auto-generated-slug" />
          {slugEdited && (
            <button onClick={() => { setSlug(buildSlug(title)); setSlugEdited(false); }}
              className="text-[#9b9b9b] hover:text-[#0a0a0a]" title="Reset to auto">
              <RefreshCw size={12} />
            </button>
          )}
        </div>

        {/* Excerpt */}
        <textarea placeholder="Short excerpt (shown in listings)..."
          value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2}
          className="w-full font-serif text-base italic text-[#6b6b6b] bg-transparent border-0 outline-none resize-none placeholder-[#ccc] mb-6 leading-relaxed" />

        {/* Cover image */}
        <div className="mb-6">
          <label className="block text-xs uppercase tracking-widest text-[#9b9b9b] mb-1.5 font-medium">Cover Image</label>
          <div className="flex items-center gap-3">
            <input type="text" placeholder="Paste image URL or upload"
              value={coverImage} onChange={e => setCoverImage(e.target.value)}
              className="flex-1 border border-[#e5e5e3] bg-transparent px-3 py-2 text-sm text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]" />
            <label className="flex items-center gap-2 border border-[#e5e5e3] px-3 py-2 text-sm cursor-pointer hover:bg-[#f0f0ee] transition-colors">
              <Upload size={14} />
              {uploadingCover ? 'Uploading...' : 'Upload'}
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            </label>
          </div>
          {coverImage && (
            <img src={coverImage} alt="Cover" className="mt-3 max-h-40 object-cover border border-[#e5e5e3]" />
          )}
        </div>

        {/* Content */}
        <div className="mb-6">
          <label className="block text-xs uppercase tracking-widest text-[#9b9b9b] mb-2 font-medium">Content</label>
          <RichEditor key="new-article" content="" onChange={setContent} />
        </div>

        {/* Advanced / SEO section */}
        <div className="border border-[#e5e5e3]">
          <button onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[#6b6b6b] hover:bg-[#f9f9f7] transition-colors text-left">
            SEO & Advanced Settings
            <span>{showAdvanced ? '▲' : '▼'}</span>
          </button>
          {showAdvanced && (
            <div className="px-4 pb-4 space-y-4 border-t border-[#e5e5e3] pt-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#9b9b9b] mb-1.5 font-medium">
                  Meta Description <span className="normal-case">(for SEO, ~150 chars)</span>
                </label>
                <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)}
                  placeholder="Brief description for search engines..."
                  rows={2} maxLength={160}
                  className="w-full border border-[#e5e5e3] bg-transparent px-3 py-2 text-sm text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] resize-none" />
                <p className="text-xs text-[#9b9b9b] mt-1">{metaDescription.length}/160</p>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#9b9b9b] mb-1.5 font-medium">
                  Tags <span className="normal-case">(comma-separated)</span>
                </label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                  placeholder="philosophy, india, analysis"
                  className="w-full border border-[#e5e5e3] bg-transparent px-3 py-2 text-sm text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#9b9b9b] mb-1.5 font-medium">
                  Schedule Publish <span className="normal-case">(optional — leave blank to publish now)</span>
                </label>
                <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                  className="border border-[#e5e5e3] bg-transparent px-3 py-2 text-sm text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]" />
                {scheduledAt && (
                  <p className="text-xs text-[#9b9b9b] mt-1">
                    Will publish at {new Date(scheduledAt).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
