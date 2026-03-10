import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Editorial Policy — Tea and Theories',
  description: 'Editorial policy of Tea and Theories - thoughtful analysis and discussion.',
};

export default function EditorialPolicyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--paper)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main className="pt-14" style={{ flex: '1' }}>
        <div className="max-w-[760px] mx-auto px-6">
          <div className="pt-12 pb-8" style={{ borderBottom: '1px solid var(--border)' }}>
            <h1 className="font-serif text-3xl font-bold mb-1" style={{ color: 'var(--ink)' }}>
              Editorial Policy
            </h1>
          </div>
          <article className="py-8">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
              Tea and Theories publishes articles, essays, and commentary on news, philosophy, literature, ethics, and social issues. While we strive for accuracy and responsible commentary, views expressed reflect the author's perspective. Our purpose is thoughtful analysis and discussion rather than real-time news reporting.
            </p>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}

