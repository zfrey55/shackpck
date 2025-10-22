import { ContactForm } from '@/components/ContactForm';

export default function ContactPage() {
  return (
    <main className="container py-10">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold">Contact Us</h1>
        <p className="mt-4 text-slate-300">
          Have questions about our trading card repacks or need assistance? We'd love to hear from you.
        </p>
        <ContactForm />
      </div>
    </main>
  );
}
