import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Contact — Tea and Theories',
  description: 'Contact Tea and Theories for feedback, inquiries, or collaboration.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--paper)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main className="pt-14" style={{ flex: '1' }}>
        <div className="max-w-[760px] mx-auto px-6">
          <div className="pt-12 pb-8" style={{ borderBottom: '1px solid var(--border)' }}>
            <h1 className="font-serif text-3xl font-bold mb-1" style={{ color: 'var(--ink)' }}>
              Contact
            </h1>
          </div>
          <article className="py-8">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
              For feedback, inquiries, or collaboration, reach out via email at spillthetea.sk@gmail.com. Connect with us on Instagram at @20Sau_abh or @voicebuzzz, or follow on X (Twitter) at @20Sau_abh.
            </p>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}

