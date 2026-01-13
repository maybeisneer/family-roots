import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-amber-500 hover:text-amber-400 text-sm mb-8 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-serif text-white mb-8">Privacy Policy</h1>

        <div className="space-y-6 text-sm leading-relaxed">
          <p className="text-stone-400">Last updated: January 2026</p>

          <section className="space-y-4">
            <h2 className="text-xl text-white font-medium">1. Introduction</h2>
            <p>
              My House Tales is operated by Metaverse Limited (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), a company
              registered in England and Wales with registered address at 35-37 Ludgate Hill, London, EC4M 7JN.
              This Privacy Policy explains how we collect, use, and protect your personal information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl text-white font-medium">2. Information We Collect</h2>
            <p>We collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Email address and name via Google Sign-In</li>
              <li><strong>Interview Content:</strong> Video recordings, audio, and transcripts you create</li>
              <li><strong>Payment Information:</strong> Processed securely by Stripe (we do not store card details)</li>
              <li><strong>Usage Data:</strong> Information about how you use our Service</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl text-white font-medium">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain the Service</li>
              <li>Process your payments</li>
              <li>Send you important updates about your interviews</li>
              <li>Improve and develop new features</li>
              <li>Respond to your enquiries</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl text-white font-medium">4. Data Storage and Security</h2>
            <p>
              Your data is stored securely using Google Cloud/Firebase infrastructure. Video recordings
              and associated data are stored in secure cloud storage with encryption at rest. We implement
              appropriate technical and organizational measures to protect your personal data.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl text-white font-medium">5. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google/Firebase:</strong> Authentication and data storage</li>
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>OpenAI:</strong> AI-powered transcription and question generation</li>
              <li><strong>Resend:</strong> Email notifications</li>
              <li><strong>TikTok Pixel:</strong> Analytics and advertising (can be disabled)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl text-white font-medium">6. Data Retention</h2>
            <p>
              We retain your interview content indefinitely unless you request deletion. Account
              information is retained as long as your account is active. You may request deletion
              of your data at any time by contacting us.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl text-white font-medium">7. Your Rights (GDPR)</h2>
            <p>Under UK GDPR, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Rectify inaccurate data</li>
              <li>Request erasure of your data</li>
              <li>Restrict processing of your data</li>
              <li>Data portability</li>
              <li>Object to processing</li>
            </ul>
            <p>
              To exercise these rights, please contact us at hey@neer.is.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl text-white font-medium">8. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. We also use
              analytics cookies (TikTok Pixel) to understand how users interact with our Service.
              You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl text-white font-medium">9. Children&apos;s Privacy</h2>
            <p>
              The Service is not intended for children under 13. We do not knowingly collect
              personal information from children under 13. If you believe we have collected
              such information, please contact us immediately.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl text-white font-medium">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any
              significant changes by email or through the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl text-white font-medium">11. Contact Us</h2>
            <p>
              For any questions about this Privacy Policy or to exercise your data rights, please contact us:
            </p>
            <p>
              <a href="mailto:hey@neer.is" className="text-amber-500 hover:text-amber-400">
                hey@neer.is
              </a>
            </p>
            <p className="text-stone-500">
              Metaverse Limited<br />
              35-37 Ludgate Hill<br />
              London, EC4M 7JN<br />
              United Kingdom
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
