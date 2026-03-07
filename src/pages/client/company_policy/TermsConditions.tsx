import React from 'react';
import Hero from '@/components/Hero';
import SEO from '@/components/SEO';

const TermsConditions = () => {
  return (
    <>
      <SEO 
        title="Terms & Conditions"
        description="Read our terms and conditions for using Tobra's grocery delivery services. Understand your rights and responsibilities when shopping with us."
        keywords="terms and conditions, legal agreement, user agreement, grocery delivery terms, service terms"
      />
      
      <div>
        <Hero 
          title="Terms & Conditions"
          subtitle="Please read these terms and conditions carefully before using Tobra services."
        />
        
        <div className="max-w-4xl mx-auto section-padding py-16">
          <div className="prose prose-lg max-w-none">
            <div className="mb-8">
              <p className="text-gray-500 mb-6">
                Last updated: January 2024
              </p>
            </div>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using Tobra's services, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
              <p className="text-gray-700 mb-4">
                Tobra is an online marketplace that connects customers with local grocery stores and vendors. We facilitate 
                transactions between buyers and sellers but are not directly involved in the actual transaction between users.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <div className="text-gray-700 space-y-3">
                <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times.</p>
                <p>You are responsible for safeguarding the password and for maintaining the confidentiality of your account.</p>
                <p>You agree not to disclose your password to any third party and to notify us immediately if you become aware of any breach of security.</p>
              </div>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Orders and Payment</h2>
              <div className="text-gray-700 space-y-3">
                <p>All orders are subject to availability and confirmation of the order price.</p>
                <p>Payment must be made in full before delivery of products.</p>
                <p>We reserve the right to refuse or cancel orders at any time for any reason.</p>
                <p>Prices are subject to change without notice.</p>
              </div>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Delivery Policy</h2>
              <div className="text-gray-700 space-y-3">
                <p>Delivery times are estimates and not guaranteed. We will make reasonable efforts to deliver within estimated timeframes.</p>
                <p>Risk of loss and title for items passes to you upon delivery.</p>
                <p>You must be available to receive deliveries at the specified address and time.</p>
              </div>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Returns and Refunds</h2>
              <div className="text-gray-700 space-y-3">
                <p>Items may be returned within 7 days of delivery in their original condition and packaging.</p>
                <p>Perishable items cannot be returned unless they are defective or damaged upon delivery.</p>
                <p>Refunds will be processed within 5-7 business days after we receive the returned items.</p>
              </div>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Prohibited Uses</h2>
              <div className="text-gray-700 space-y-3">
                <p>You may not use our service for any illegal or unauthorized purpose.</p>
                <p>You may not violate any laws in your jurisdiction when using our service.</p>
                <p>You may not transmit any viruses or malicious code through our platform.</p>
              </div>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                Tobra shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to update or change our Terms and Conditions at any time without prior notice. 
                Your continued use of the service after we post any modifications constitutes acceptance of those changes.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms and Conditions, please contact us at support@ghanamall.com 
                or call +233 20 123 4567.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsConditions;
