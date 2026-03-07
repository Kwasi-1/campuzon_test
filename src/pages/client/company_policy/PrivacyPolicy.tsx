import React from 'react';
import Hero from '@/components/Hero';
import SEO from '@/components/SEO';

const PrivacyPolicy = () => {
  return (
    <>
      <SEO 
        title="Privacy Policy"
        description="Learn how Tobra collects, uses, and protects your personal information. Read our comprehensive privacy policy for grocery delivery services."
        keywords="privacy policy, data protection, personal information, privacy rights, data security, GDPR"
      />
      
      <div>
        <Hero 
          title="Privacy Policy"
          subtitle="Learn how we collect, use, and protect your personal information on Tobra."
        />
        
        <div className="max-w-4xl mx-auto section-padding py-16">
        <div className="prose prose-lg max-w-none">
          <div className="mb-8">
            <p className="text-gray-600 mb-6">
              Last updated: January 2024
            </p>
          </div>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <div className="text-gray-700 space-y-4">
              <p>We collect information you provide directly to us, such as when you:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create or modify your account</li>
                <li>Place an order or make a purchase</li>
                <li>Contact us for customer support</li>
                <li>Subscribe to our newsletters or promotions</li>
                <li>Participate in surveys or feedback</li>
              </ul>
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <div className="text-gray-700 space-y-3">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders and account</li>
                <li>Provide customer support and respond to your inquiries</li>
                <li>Send you promotional materials and updates (with your consent)</li>
                <li>Improve our services and user experience</li>
                <li>Prevent fraud and enhance security</li>
              </ul>
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
            <div className="text-gray-700 space-y-4">
              <p>We may share your information in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>With partner stores to fulfill your orders</li>
                <li>With delivery partners to complete deliveries</li>
                <li>With payment processors to handle transactions</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transfer or acquisition</li>
              </ul>
              <p>We do not sell, trade, or rent your personal information to third parties for marketing purposes.</p>
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <div className="text-gray-700 space-y-3">
              <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
              <p>However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Cookies and Tracking</h2>
            <div className="text-gray-700 space-y-3">
              <p>We use cookies and similar tracking technologies to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Remember your preferences and settings</li>
                <li>Analyze how you use our website</li>
                <li>Provide personalized content and advertisements</li>
                <li>Improve our services</li>
              </ul>
              <p>You can control cookies through your browser settings, but disabling them may affect your experience on our site.</p>
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <div className="text-gray-700 space-y-3">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and update your personal information</li>
                <li>Delete your account and personal data</li>
                <li>Opt-out of marketing communications</li>
                <li>Request a copy of your data</li>
                <li>File a complaint with relevant authorities</li>
              </ul>
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
            <p className="text-gray-700 mb-4">
              Our services are not directed to children under 13 years of age. We do not knowingly collect personal 
              information from children under 13. If we become aware that we have collected such information, 
              we will take steps to delete it promptly.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Changes to Privacy Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <div className="text-gray-700 space-y-3">
              <p>If you have any questions about this Privacy Policy, please contact us:</p>
              <ul className="list-none space-y-2">
                <li>Email: privacy@ghanamall.com</li>
                <li>Phone: +233 20 123 4567</li>
                <li>Address: 123 Independence Avenue, Accra, Ghana</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
