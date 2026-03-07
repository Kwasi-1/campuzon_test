import React from 'react';
import Hero from '@/components/Hero';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SEO from '@/components/SEO';

const FAQs = () => {
  const faqs = [
    {
      question: "How do I place an order on Tobra?",
      answer: "Simply browse our products, add items to your cart, and proceed to checkout. You can pay using mobile money, bank transfer, or cash on delivery."
    },
    {
      question: "What are your delivery areas?",
      answer: "We currently deliver within Greater Accra Region. We're expanding to other regions soon. Check our delivery zones during checkout."
    },
    {
      question: "How long does delivery take?",
      answer: "Most orders are delivered within 2-4 hours for express delivery, or next day for standard delivery. Delivery times may vary based on location and product availability."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept Mobile Money (MTN, Vodafone, AirtelTigo), bank transfers, and cash on delivery. All payments are secure and encrypted."
    },
    {
      question: "Can I return or exchange items?",
      answer: "Yes, we have a 7-day return policy for unopened items in original packaging. Contact our customer service team to initiate a return."
    },
    {
      question: "How do I track my order?",
      answer: "You can track your order using the tracking number sent to your phone via SMS, or log into your account and view order status in real-time."
    },
    {
      question: "Are the products fresh and of good quality?",
      answer: "Absolutely! We partner with trusted grocery stores and suppliers to ensure all products meet our quality standards. Fresh items are sourced daily."
    },
    {
      question: "How can I become a partner store?",
      answer: "Visit our Store Portal to register your business. We welcome grocery stores, supermarkets, and food vendors who meet our quality standards."
    },
    {
      question: "What if an item is out of stock?",
      answer: "We'll notify you immediately if an item is unavailable and offer suitable alternatives or a full refund for that item."
    },
    {
      question: "Do you offer bulk discounts?",
      answer: "Yes, we offer special pricing for bulk orders. Contact our customer service team for custom quotes on large orders."
    }
  ];

  return (
    <>
      <SEO 
        title="Frequently Asked Questions"
        description="Find answers to common questions about Tobra services, delivery, payments, and more."
        keywords="FAQ, frequently asked questions, help, support, Tobra help"
      />
      
      <div>
        <Hero 
          title="Frequently Asked Questions"
          subtitle="Find answers to common questions about Tobra services, delivery, and more."
        />
        
        <div className="max-w-4xl mx-auto section-padding py-16">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Common Questions</h2>
            <p className="text-gray-600">
              Can't find what you're looking for? Contact our support team for personalized assistance.
            </p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg px-6">
                <AccordionTrigger className="text-left font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="mt-12 text-center bg-gray-50 rounded-lg p-8">
            <h3 className="text-xl font-semibold mb-4">Still have questions?</h3>
            <p className="text-gray-600 mb-6">
              Our customer support team is here to help you with any additional questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                Contact Support
              </a>
              <a href="tel:+233201234567" className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors">
                Call Us: +233 20 123 4567
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQs;
