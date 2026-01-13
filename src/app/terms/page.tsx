import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-amber-500 hover:text-amber-400 text-sm mb-8 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-serif text-white mb-8">Terms of Service</h1>

        <div className="space-y-6 text-sm leading-relaxed">
          <p className="text-stone-400">Last updated: January 2026</p>

          <section className="space-y-4">
            <h2 className="text-xl text-white font-medium">1. Acceptance of Terms</h2>
            <p>
              By accessing or using My House Tales (&quot;the Service&quot;), operated by Metaverse Limited,
              a company registered in England and Wales with registered address at 35-37 Ludgate Hill,
              London, EC4M 7JN, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl text-white font-medium">2. Description of Service</h2>
            <p>
              My House Tales provides an AI-guided video interview platform that allows users to record,
              preserve, and share family stories. The Service includes video recording, transcription,
              translation, and secure storage of interview content.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl text-white font-medium">3. User Accounts</h2>
            <p>
              To use certain features of the Service, you must create an account using Google Sign-In.
              You are responsible for maintaining the confidentiality of your account and for all activities
              that occur under your account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl text-white font-medium">4. Payment and Refunds</h2>
            <p>
              The Service requires a one-time payment to create an interview. All payments are processed
              securely through Stripe. Due to the nature of digital services, refunds are handled on a
              case-by-case basis. Please contact us at hey@neer.is for refund requests.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl text-white font-medium">5. Content Ownership</h2>
            <p>
              You retain full ownership of all content you create through the Service, including video
              recordings and transcripts. By using the Service, you grant us a limited license to store,
              process, and display your content solely for the purpose of providing the Service to you.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl text-white font-medium">6. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Upload content that is illegal, harmful, or violates the rights of others</li>
              <li>Record individuals without their consent</li>
              <li>Attempt to access other users&apos; content without authorization</li>
              <li>Interfere with or disrupt the Service</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl text-white font-medium">7. Data Storage</h2>
            <p>
              Your interview content is stored securely using Firebase/Google Cloud infrastructure.
              While we take reasonable measures to protect your data, you acknowledge that no method
              of electronic storage is 100% secure.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl text-white font-medium">8. Limitation of Liability</h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties of any kind. We shall not be liable
              for any indirect, incidental, special, or consequential damages arising from your use
              of the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl text-white font-medium">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the Service
              after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl text-white font-medium">10. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of England
              and Wales. Any disputes arising under these Terms shall be subject to the exclusive
              jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl text-white font-medium">11. Contact</h2>
            <p>
              For questions about these Terms, please contact us at{' '}
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
