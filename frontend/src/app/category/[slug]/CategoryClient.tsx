'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ArticleCard from '@/components/ui/ArticleCard';
import Link from 'next/link';
import { Article, Category } from '@/lib/api';

interface CategoryClientProps {
  slug: string;
  name: string;
  articles: Article[];
  subcategories: Category[];
  hasSubcategories: boolean;
}

export default function CategoryClient({ 
  slug, 
  name, 
  articles, 
  subcategories,
  hasSubcategories
}: CategoryClientProps) {
  const [filter, setFilter] = useState<string>('all');
  
  // Filter articles based on selected filter
  const filteredArticles = filter === 'all' 
    ? articles 
    : articles.filter(a => {
        const articleCatSlug = a.categorySlug;
        return articleCatSlug === filter;
      });

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
            
            {/* Dropdown filter for categories with subcategories */}
            {hasSubcategories && (
              <div className="mt-4">
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="text-sm px-3 py-1.5 border rounded cursor-pointer"
                  style={{ 
                    color: 'var(--ink)', 
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--paper)'
                  }}
                >
                  <option value="all">All {name}</option>
                  {subcategories.map(sub => (
                    <option key={sub.slug} value={sub.slug}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {!hasSubcategories && (
              <p className="text-sm" style={{ color: 'var(--muted2)' }}>
                {articles.length} {articles.length === 1 ? 'article' : 'articles'}
              </p>
            )}
          </div>
          
          {/* Show article count when filtered */}
          {hasSubcategories && (
            <p className="text-sm py-2" style={{ color: 'var(--muted2)' }}>
              {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
            </p>
          )}
          
          <div className="py-4">
            {filteredArticles.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm" style={{ color: 'var(--muted2)' }}>
                  No articles in this section yet.
                </p>
              </div>
            ) : (
              filteredArticles.map(a => <ArticleCard key={a.id} article={a} />)
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

