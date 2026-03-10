import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'About — Tea and Theories',
  description: 'About Tea and Theories - Independent platform for ideas, commentary, and thoughtful writing.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--paper)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main className="pt-14" style={{ flex: '1' }}>
        <div className="max-w-[760px] mx-auto px-6">
          <div className="pt-12 pb-8" style={{ borderBottom: '1px solid var(--border)' }}>
            <h1 className="font-serif text-3xl font-bold mb-1" style={{ color: 'var(--ink)' }}>
              About
            </h1>
          </div>
          <article className="py-8">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
              Tea and Theories is an independent platform for ideas, commentary, and thoughtful writing. We explore news, history, philosophy, ethics, and literature—examining the ideas and narratives behind events. Our aim is to encourage reflection and critical thinking in an age of constant information.
            </p>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}

