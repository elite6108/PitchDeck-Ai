import React from 'react';
import LogoGenerator from '../../components/logo/LogoGenerator';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const LogoGeneratorPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Company Logo</h1>
          <p className="text-gray-600 mb-8">
            Use AI to instantly generate professional logo designs for your business.
          </p>
          
          <LogoGenerator />
          
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">About Our Logo Generator</h2>
            <div className="prose text-gray-600">
              <p>
                Our logo generator uses advanced AI technology from DALL-E to create unique, professional logos 
                tailored to your business needs. Simply enter your company name and customize your preferences
                to generate a logo in seconds.
              </p>
              <h3 className="text-lg font-medium text-gray-800 mt-4">Tips for Great Logo Results:</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Be specific about your industry to get more relevant designs</li>
                <li>Choose a color scheme that matches your brand identity</li>
                <li>Add details about what makes your business unique</li>
                <li>Try different style options to find the perfect match</li>
                <li>Use the square format option for versatile logos that work well across platforms</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LogoGeneratorPage;
