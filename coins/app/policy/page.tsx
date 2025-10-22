export default function PolicyPage() {
  return (
    <main className="container py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-8">Terms & Policies</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gold">1. Agreement to Terms</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300">
                By purchasing any repack, participating in live coin breaks, or engaging with our platform, you acknowledge and agree to these terms and conditions. Our policies ensure fair practices and clear expectations for all collectors.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gold">2. Live Coin Breaks</h2>
            <div className="prose prose-invert max-w-none">
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Every live break is recorded and broadcast publicly to maintain complete transparency.</li>
                <li>All purchases are considered final once the break commences.</li>
                <li>Coin allocations are determined exclusively by the live break results shown on stream.</li>
                <li>We cannot be held responsible for technical issues, connectivity problems, or broadcast disruptions outside our reasonable control.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gold">3. Coin Repack Products</h2>
            <div className="prose prose-invert max-w-none">
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Each repack is assembled with randomized contents that may vary significantly in composition and market value.</li>
                <li>By purchasing a repack, you acknowledge the inherent uncertainty and chance involved in the product.</li>
                <li>All purchases are final — refunds, substitutions, or exchanges are not available except in cases of confirmed missing items or shipping damage directly attributable to our handling.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gold">4. Shipping & Delivery</h2>
            <div className="prose prose-invert max-w-none">
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>All coins are packaged securely and shipped within 1-3 business days following your break or purchase.</li>
                <li>You will receive tracking details once your package is dispatched.</li>
                <li>Our responsibility ends once delivery is confirmed by the carrier. We cannot be held liable for carrier delays, lost packages, or theft occurring after confirmed delivery.</li>
                <li>Buyers must verify their shipping information is accurate prior to completing checkout.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gold">5. Damage or Missing Items</h2>
            <div className="prose prose-invert max-w-none">
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>If your coins arrive damaged due to our packaging or handling, you must contact us within 48 hours of delivery with clear photographic documentation.</li>
                <li>Upon verification, we will provide a replacement coin (subject to availability) or issue a partial refund.</li>
                <li>We are not responsible for manufacturer imperfections, mint errors, natural toning, or environmental wear that occurred before packaging.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gold">6. No Value Guarantees</h2>
            <div className="prose prose-invert max-w-none">
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>We provide no assurances regarding future coin values, grading results, authentication outcomes, or investment performance.</li>
                <li>Numismatic values are inherently subjective and fluctuate based on collector demand and market conditions.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gold">7. Community Standards</h2>
            <div className="prose prose-invert max-w-none">
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Inappropriate, offensive, or disruptive behavior during live streams will result in immediate removal from the broadcast and cancellation of any pending orders without refund.</li>
                <li>We maintain the right to decline service to any individual at our sole discretion.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gold">8. Limitation of Liability</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 mb-4">
                By engaging with Shackpack, you agree that our company and its representatives bear no liability for:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Financial losses related to coin value depreciation or market volatility.</li>
                <li>Service failures or errors caused by external vendors (including shipping carriers, payment gateways, or streaming platforms).</li>
                <li>Any indirect damages arising from product use, platform malfunctions, or unforeseen circumstances.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gold">9. Policy Updates</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300">
                These terms may be modified periodically at our discretion. The current version will always be available on this page, and continued use of our services constitutes acceptance of any revisions.
              </p>
            </div>
          </section>

          <section className="mt-12 pt-8 border-t border-slate-700">
            <h2 className="text-2xl font-semibold mb-4 text-gold">Privacy & Contact</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 mb-4">
                Your privacy is important to us. We collect and use your information only as necessary to provide our services and improve your experience.
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>We never sell your personal information</li>
                <li>Payment information is processed securely through trusted providers</li>
                <li>You can opt out of marketing communications at any time</li>
              </ul>
              <p className="text-slate-300 mt-6">
                Questions about our policies? <a href="/contact" className="text-gold hover:underline">Contact us</a> and we'll be happy to help.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
