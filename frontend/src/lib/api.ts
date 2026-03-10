// Use environment variable in production, fallback to localhost for development
const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8801';
const API_BASE = `${BACKEND}/api`;

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem('admin_token'); } catch { return null; }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const callerHeaders = options.headers as Record<string, string> | undefined;
  if (callerHeaders) Object.assign(headers, callerHeaders);

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
    throw new Error('Session expired. Please log in again.');
  }
  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(errorText || `Request failed (HTTP ${res.status})`);
  }
  if (res.status === 204) return null as T;
  return res.json();
}

export const api = {
  login: (username: string, password: string) =>
    request<{ token: string; username: string }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ username, password }),
    }),

  getArticles: () => request<Article[]>('/articles'),
  getArticle: (slug: string) => request<Article>(`/articles/${slug}`),
  getRelatedArticles: (slug: string) => request<Article[]>(`/articles/${slug}/related`),
  getCategoryArticles: (slug: string) => request<Article[]>(`/categories/${slug}/articles`),
  getHomeData: () => request<CategoryWithArticles[]>('/categories/home'),

  getComments: (slug: string) => request<Comment[]>(`/articles/${slug}/comments`),
  addComment: (slug: string, data: { authorName: string; content: string; authorEmail?: string }) =>
    request<Comment>(`/articles/${slug}/comments`, { method: 'POST', body: JSON.stringify(data) }),

  getLikes: (slug: string, token: string) =>
    request<{ count: number; liked: boolean }>(`/articles/${slug}/like?token=${encodeURIComponent(token)}`),
  toggleLike: (slug: string, token: string) =>
    request<{ count: number; liked: boolean }>(`/articles/${slug}/like?token=${encodeURIComponent(token)}`, { method: 'POST' }),

  getCategories: () => request<Category[]>('/categories'),

  adminGetArticles: () => request<Article[]>('/admin/articles'),
  adminGetArticle: (id: number) => request<Article>(`/admin/articles/${id}`),
  adminCreateArticle: (data: Partial<ArticleRequest>) =>
    request<Article>('/admin/articles', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateArticle: (id: number, data: Partial<ArticleRequest>) =>
    request<Article>(`/admin/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteArticle: (id: number) =>
    request<void>(`/admin/articles/${id}`, { method: 'DELETE' }),

  adminGetMedia: (type?: string) =>
    request<MediaFile[]>(`/admin/media${type ? `?type=${type}` : ''}`),
  adminUploadMedia: (file: File): Promise<MediaFile> => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE}/admin/media/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async res => {
      if (!res.ok) throw new Error(`Upload failed (HTTP ${res.status})`);
      return res.json();
    });
  },
};

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  categoryName: string;
  categorySlug: string;
  author: string;
  published: boolean;
  metaDescription: string;
  tags: string;
  scheduledAt: string | null;
  createdAt: string;
  publishedAt: string;
  likeCount: number;
  commentCount: number;
  readingTime: number;
}

export interface ArticleRequest {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  coverImage: string;
  categoryId: number;
  author: string;
  published: boolean;
  metaDescription?: string;
  tags?: string;
  scheduledAt?: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentSlug: string | null;
  displayOrder: number;
  articleCount: number;
}

export interface CategoryWithArticles {
  category: Category;
  articles: Article[];
}

export interface Comment {
  id: number;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface MediaFile {
  id: number;
  originalName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  url: string;
  createdAt: string;
}
