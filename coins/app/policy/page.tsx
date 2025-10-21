export default function PolicyPage() {
  return (
    <main className="container py-10">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-semibold mb-8">Policies</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gold">Shipping Policy</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 mb-4">
                We ship all orders within 1-2 business days using insured, tracked shipping. 
                All packages are carefully packaged to ensure your coins arrive in perfect condition.
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Standard shipping: 3-5 business days</li>
                <li>Express shipping: 1-2 business days</li>
                <li>All orders over $500 include free shipping</li>
                <li>International shipping available upon request</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gold">Return Policy</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 mb-4">
                We offer a 30-day return policy on all purchases. Items must be returned in 
                original condition with all original packaging and certificates.
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>30-day return window from purchase date</li>
                <li>Items must be in original condition</li>
                <li>Return shipping costs are the responsibility of the customer</li>
                <li>Refunds processed within 5-7 business days</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gold">Privacy Policy</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 mb-4">
                Your privacy is important to us. We collect and use your information only 
                as necessary to provide our services and improve your experience.
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>We never sell your personal information</li>
                <li>Payment information is processed securely</li>
                <li>We use cookies to improve site functionality</li>
                <li>You can opt out of marketing communications at any time</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gold">Terms of Service</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 mb-4">
                By using our website and services, you agree to our terms of service. 
                Please read these terms carefully.
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>All coin descriptions are accurate to the best of our knowledge</li>
                <li>Prices are subject to change based on market conditions</li>
                <li>We reserve the right to refuse service to anyone</li>
                <li>Disputes will be resolved through arbitration</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
