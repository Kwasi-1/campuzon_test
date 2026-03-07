import React from 'react';
import Hero from '@/components/Hero';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, Award, Heart } from 'lucide-react';
import SEO from '@/components/SEO';

const AboutUs = () => {
  const values = [
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Community First",
      description: "We're committed to supporting local Ghanaian businesses and strengthening our communities through technology."
    },
    {
      icon: <Target className="w-8 h-8 text-primary" />,
      title: "Quality Assurance",
      description: "We maintain the highest standards for product quality and freshness, ensuring customer satisfaction with every order."
    },
    {
      icon: <Award className="w-8 h-8 text-primary" />,
      title: "Excellence in Service",
      description: "From fast delivery to responsive customer support, we strive for excellence in every aspect of our service."
    },
    {
      icon: <Heart className="w-8 h-8 text-primary" />,
      title: "Customer Care",
      description: "Your satisfaction is our priority. We listen, care, and continuously improve based on your feedback and needs."
    }
  ];

  return (
    <>
      <SEO 
        title="About Us"
        description="Learn about Tobra's mission to connect Ghanaian communities through innovative grocery delivery services."
        keywords="about Tobra, Ghana grocery delivery, local business support, company story"
      />
      
      <div>
        <Hero 
          title="About Tobra"
          subtitle="Empowering Ghanaian businesses and connecting communities through innovative grocery delivery services."
        />
        
        <div className="max-w-7xl mx-auto section-padding py-16">
          {/* Our Story Section */}
          <div className="mb-16">
            <div className="flex gap-12 items-center justify-center text-center max-w-6xl mx-auto">
              <div>
                <h2 className="text-3xl font-semibold mb-6">Our Story</h2>
                <div className="text-base md:text-lg space-y-6 lg:space-y-8 text-gray-700">
                  <p>
                    Tobra was founded with a simple yet powerful vision: to bridge the gap between local Ghanaian 
                    grocery stores and modern consumers who value convenience without compromising on quality and community support.
                  </p>
                  <p>
                    We recognized that while technology was transforming how people shop globally, many local businesses 
                    in Ghana were being left behind. That's why we built a platform that not only serves customers with 
                    fast, reliable grocery delivery but also empowers local store owners to reach new customers and grow their businesses.
                  </p>
                  <p>
                    Today, we're proud to serve thousands of customers across Greater Accra Region while supporting 
                    hundreds of local grocery stores, supermarkets, and vendors. Every order placed on Tobra 
                    contributes to the growth of our local economy and strengthens our communities.
                  </p>
                </div>
              </div>
              {/* <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">500+</div>
                    <div className="text-sm text-gray-600">Partner Stores</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                    <div className="text-sm text-gray-600">Happy Customers</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                    <div className="text-sm text-gray-600">Orders Delivered</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">2Hr</div>
                    <div className="text-sm text-gray-600">Average Delivery</div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>

          {/* Our Mission Section */}
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-semibold mb-6">Our Mission</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-base md:text-lg text-gray-700 mb-8">
                To democratize grocery shopping in Ghana by providing a seamless digital platform that connects 
                customers with local stores, ensuring fresh, quality products are delivered quickly while 
                empowering local businesses to thrive in the digital age.
              </p>
            </div>
          </div>

          {/* Our Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-semibold text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center h-full border-gray-300/30 hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="flex justify-center mb-4">
                      <div className="bg-primary/5 p-3.5 rounded-full">
                        {value.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-semibold text-center mb-6">Leadership Team</h2>
            <p className="text-center text-base md:text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Our diverse team brings together expertise in technology, business, and local market knowledge 
              to deliver exceptional service to our customers and partners.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Kwame Asante",
                  role: "CEO & Co-Founder",
                  description: "Former tech executive with 15+ years experience in e-commerce and marketplace development."
                },
                {
                  name: "Ama Osei",
                  role: "CTO & Co-Founder", 
                  description: "Software engineer passionate about building scalable solutions for emerging markets."
                },
                {
                  name: "Kofi Mensah",
                  role: "Head of Operations",
                  description: "Logistics and supply chain expert focused on optimizing delivery efficiency and partner relationships."
                }
              ].map((member, index) => (
                <Card key={index} className='border-gray-300/30 hover:shadow-lg transition-shadow duration-300'>
                  <CardContent className="p-6 text-center">
                    <div className="w-[72px] h-[72px] md:w-20 md:h-20 bg-primary/5 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                    <p className="text-primary font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-semibold mb-4">Join Our Journey</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Whether you're a customer looking for convenient grocery shopping or a store owner wanting to 
              expand your reach, we invite you to be part of the Tobra community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/products" className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Start Shopping
              </a>
              <a href="/store" className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-primary transition-colors">
                Partner With Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUs;
