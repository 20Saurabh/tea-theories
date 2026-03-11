import CategoryClient from './CategoryClient';
import { Article, Category } from '@/lib/api';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8801';

async function getCategoryArticles(slug: string): Promise<Article[]> {
  const res = await fetch(`${BACKEND}/api/categories/${slug}/articles-with-children`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  return res.json();
}

async function getAllCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${BACKEND}/api/categories`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    title: `${name} — Pasta and Perspective`,
    description: `Read articles about ${name} on Pasta and Perspective.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [articles, categories] = await Promise.all([
    getCategoryArticles(slug),
    getAllCategories()
  ]);
  
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  
  const currentCategory = categories.find(c => c.slug === slug);
  const subcategories = currentCategory ? categories.filter(c => c.parentSlug === slug) : [];
  const hasSubcategories = subcategories.length > 0;

  return (
    <CategoryClient 
      slug={slug}
      name={name}
      articles={articles}
      subcategories={subcategories}
      hasSubcategories={hasSubcategories}
    />
  );
}

