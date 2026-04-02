"use client";
import { useState } from 'react';

const CASE_TYPE_DISPLAY_NAMES: Record<string, string> = {
  reign: 'Reign by Shackpack',
  prominence: 'Prominence by Shackpack',
  apex: 'Apex by Shackpack',
  base: 'ShackPack',
  deluxe: 'ShackPack Deluxe',
  xtreme: 'ShackPack Xtreme',
  unleashed: 'ShackPack Unleashed',
  resurgence: 'ShackPack Resurgence',
  transcendent: 'ShackPack Transcendent',
  'transcendent-transformed': 'ShackPack Transcendent Transformed',
  transcendenttransformed: 'ShackPack Transcendent Transformed',
  ignite: 'ShackPack Ignite',
  eclipse: 'ShackPack Eclipse',
  radiant: 'ShackPack Radiant',
  'shackpack-expo': 'Shackpack Expo',
  'shackpack-ascension': 'Shackpack Ascension',
  'shackpack-flex': 'Shackpack Flex',
  'shackpack-pinnacle': 'Shackpack Pinnacle',
  'shackpack-summit': 'Shackpack Summit',
  'coinwave-platinum-drill': 'Coinwave Platinum Drill',
  'coinwave-gold-pan': 'Coinwave Gold Pan',
  'coinwave-the-mine': 'Coinwave The Mine',
  'coinwave-gold-mine': 'Coinwave Gold Mine',
  currencyclash: 'Currency Clash by Shackpack',
  custom: 'ShackPack Custom',
  aura: 'Aura by Shackpack',
};

export function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
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
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          caseTypes: formData.caseTypes,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setIsSubmitted(true);
        return;
      }

      setError(
        typeof data.error === 'string'
          ? data.error
          : 'Something went wrong. Please try again or email us directly.'
      );
    } catch {
      setError('Something went wrong. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCaseTypeCheckboxChange = (caseType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      caseTypes: checked
        ? [...prev.caseTypes, caseType]
        : prev.caseTypes.filter(ct => ct !== caseType)
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
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-slate-200">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 placeholder-slate-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              placeholder="First name"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-slate-200">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 placeholder-slate-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              placeholder="Last name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
              placeholder="you@example.com"
            />
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
          <p className="block text-sm font-medium text-slate-200">
            Case Types Interested In
          </p>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(CASE_TYPE_DISPLAY_NAMES).map(([value, label]) => {
              const checked = formData.caseTypes.includes(value);
              return (
                <label key={value} className="flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    name="caseTypes"
                    value={value}
                    checked={checked}
                    onChange={(e) => handleCaseTypeCheckboxChange(value, e.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-gold focus:ring-gold"
                  />
                  <span>{label}</span>
                </label>
              );
            })}
          </div>
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
  );
}
