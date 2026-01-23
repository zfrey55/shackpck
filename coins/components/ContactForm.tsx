"use client";
import { useState } from 'react';

const CASE_TYPE_DISPLAY_NAMES: Record<string, string> = {
  'reign': 'Reign by Shackpack',
  'prominence': 'Prominence by Shackpack',
  'apex': 'Apex by Shackpack',
  'base': 'ShackPack',
  'deluxe': 'ShackPack Deluxe',
  'xtreme': 'ShackPack Xtreme',
  'unleashed': 'ShackPack Unleashed',
  'resurgence': 'ShackPack Resurgence',
  'transcendent': 'ShackPack Transcendent',
  'transcendent-transformed': 'ShackPack Transcendent Transformed',
  'ignite': 'ShackPack Ignite',
  'eclipse': 'ShackPack Eclipse',
  'radiant': 'ShackPack Radiant',
  'currencyclash': 'Currency Clash by Shackpack',
  'mystery': 'ShackPack Mystery',
  'aura': 'Aura by Shackpack'
};

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    caseTypes: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Submit to Netlify Forms
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          'form-name': 'contact',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          caseTypes: formData.caseTypes.join(', ')
        }).toString()
      });

      if (response.ok) {
        setIsSubmitted(true);
        setIsSubmitting(false);
      } else {
        throw new Error('Form submission failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again or email us directly.');
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCaseTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      caseTypes: selectedOptions
    }));
  };

  if (isSubmitted) {
    return (
      <div className="mt-8 rounded-lg border border-green-500/20 bg-green-500/10 p-6 text-center">
        <h3 className="text-lg font-semibold text-green-400">Message Sent!</h3>
        <p className="mt-2 text-green-300">Thank you for contacting us. We'll get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <>
      {/* Hidden form for Netlify detection */}
      <form name="contact" data-netlify="true" hidden>
        <input type="text" name="name" />
        <input type="text" name="email" />
        <input type="text" name="phone" />
        <select name="subject">
          <option value="general">General Question</option>
          <option value="order">Order Inquiry</option>
          <option value="coin-info">Coin Information</option>
          <option value="shipping">Shipping Question</option>
          <option value="other">Other</option>
        </select>
        <select name="caseTypes" multiple>
          {Object.entries(CASE_TYPE_DISPLAY_NAMES).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <textarea name="message"></textarea>
      </form>

      {/* Actual form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-200">
              Name *
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 placeholder-slate-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-200">
              Email *
            </label>
            <input
              type="text"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 placeholder-slate-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              placeholder="your@email.com"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-200">
            Phone Number *
          </label>
          <input
            type="text"
            name="phone"
            id="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 placeholder-slate-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            placeholder="Your phone number"
          />
        </div>
        
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-slate-200">
            Subject *
          </label>
          <select
            name="subject"
            id="subject"
            required
            value={formData.subject}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          >
            <option value="">Select a subject</option>
            <option value="general">General Question</option>
            <option value="order">Order Inquiry</option>
            <option value="coin-info">Coin Information</option>
            <option value="shipping">Shipping Question</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="caseTypes" className="block text-sm font-medium text-slate-200">
            Case Types Interested In
          </label>
          <select
            name="caseTypes"
            id="caseTypes"
            multiple
            value={formData.caseTypes}
            onChange={handleCaseTypeChange}
            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold min-h-[120px]"
            size={5}
          >
            {Object.entries(CASE_TYPE_DISPLAY_NAMES).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400">Hold Ctrl (or Cmd on Mac) to select multiple options</p>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-slate-200">
            Message *
          </label>
          <textarea
            name="message"
            id="message"
            rows={6}
            required
            value={formData.message}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 placeholder-slate-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            placeholder="Tell us how we can help..."
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-gold px-6 py-3 font-medium text-black hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </>
  );
}
