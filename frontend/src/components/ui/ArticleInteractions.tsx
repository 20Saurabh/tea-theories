'use client';
import { useState, useEffect } from 'react';
import { api, Comment } from '@/lib/api';
import { Heart, MessageCircle, Share2, Check } from 'lucide-react';

function getOrCreateVisitorToken(): string {
  const key = 'va_token';
  try {
    let token = localStorage.getItem(key);
    if (!token) {
      token = Date.now().toString(36) + Math.random().toString(36).slice(2);
      localStorage.setItem(key, token);
    }
    return token;
  } catch {
    return 'anon-' + Math.random().toString(36).slice(2);
  }
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return ''; }
}

export default function ArticleInteractions({ slug }: { slug: string }) {
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = getOrCreateVisitorToken();
    api.getLikes(slug, token).then(r => { setLikeCount(r.count); setLiked(r.liked); }).catch(() => {});
    api.getComments(slug).then(setComments).catch(() => {});
  }, [slug]);

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const token = getOrCreateVisitorToken();
      const res = await api.toggleLike(slug, token);
      setLikeCount(res.count); setLiked(res.liked);
    } catch {}
    setLikeLoading(false);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const c = await api.addComment(slug, { authorName: name.trim() || 'Anonymous', content: comment.trim() });
      setComments(prev => [...prev, c]);
      setComment(''); setName('');
      setSubmitMsg('Comment posted!');
      setTimeout(() => setSubmitMsg(''), 3000);
    } catch { setSubmitMsg('Failed to post. Try again.'); }
    setSubmitting(false);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {}
  };

  return (
    <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
      {/* Action buttons */}
      <div className="flex items-center gap-6 mb-12">
        <button onClick={handleLike} disabled={likeLoading}
          className="group flex items-center gap-2 text-sm transition-all disabled:opacity-50"
          style={{ color: liked ? 'var(--ink)' : 'var(--muted2)' }}>
          <Heart size={18} fill={liked ? 'currentColor' : 'none'}
            className="transition-transform group-hover:scale-110" />
          <span>{likeCount > 0 ? `${likeCount} ` : ''}{liked ? 'Liked' : 'Like'}</span>
        </button>
        <button onClick={() => document.getElementById('comment-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: 'var(--muted2)' }}>
          <MessageCircle size={18} />
          <span>{comments.length > 0 ? `${comments.length} ` : ''}Comment{comments.length !== 1 ? 's' : ''}</span>
        </button>
        <button onClick={handleShare}
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: 'var(--muted2)' }}>
          {copied ? <Check size={18} /> : <Share2 size={18} />}
          <span>{copied ? 'Copied!' : 'Share'}</span>
        </button>
      </div>

      {/* Comments */}
      <div id="comment-section">
        <h3 className="font-serif text-xl font-bold mb-8" style={{ color: 'var(--ink)' }}>
          {comments.length === 0 ? 'Be the first to comment' : `${comments.length} Comment${comments.length !== 1 ? 's' : ''}`}
        </h3>
        {comments.length > 0 && (
          <div className="space-y-6 mb-10">
            {comments.map(c => (
              <div key={c.id} className="pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{c.authorName}</span>
                  <span className="text-xs" style={{ color: 'var(--muted2)' }}>
                    {c.createdAt ? formatDate(c.createdAt) : ''}
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--muted)' }}>
                  {c.content}
                </p>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleComment} className="space-y-3">
          <input type="text" placeholder="Your name (optional)"
            value={name} onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 text-sm focus:outline-none transition-colors"
            style={{
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--ink)',
            }} />
          <textarea placeholder="Write a comment..." value={comment}
            onChange={e => setComment(e.target.value)} required rows={4}
            className="w-full px-4 py-3 text-sm focus:outline-none transition-colors resize-none"
            style={{
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--ink)',
            }} />
          <div className="flex items-center gap-4">
            <button type="submit" disabled={submitting || !comment.trim()}
              className="px-6 py-2.5 text-sm font-medium disabled:opacity-40 transition-colors"
              style={{ backgroundColor: 'var(--ink)', color: 'var(--paper)' }}>
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
            {submitMsg && (
              <span className="text-xs" style={{ color: submitMsg.includes('Failed') ? '#ef4444' : 'var(--muted)' }}>
                {submitMsg}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
