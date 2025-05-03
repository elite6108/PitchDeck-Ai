import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PresentationIcon, 
  Sparkles, 
  Clock, 
  Download, 
  LayoutList, 
  EditIcon, 
  Save as SaveIcon 
} from 'lucide-react';
import Button from '../components/ui/Button';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero section */}
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Create stunning</span>
                  <span className="block text-primary-600">
                    pitch decks with AI
                  </span>
                </h1>
                <p className="mt-6 text-xl text-gray-500">
                  Answer a few questions about your business, and our AI will create a professional, investor-ready pitch deck in minutes.
                </p>
                <div className="mt-10 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link to="/create">
                      <Button variant="primary" size="lg">
                        <Sparkles className="h-5 w-5 mr-2" />
                        Create Your Pitch Deck
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link to="/signup">
                      <Button variant="outline" size="lg">
                        Sign Up Free
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                  <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                    <img
                      className="w-full"
                      src="https://images.pexels.com/photos/6476260/pexels-photo-6476260.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
                      alt="Pitch deck mockup"
                    />
                    <div className="absolute inset-0 bg-black opacity-10"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PresentationIcon className="h-16 w-16 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">Features</h2>
              <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
                Everything you need for a perfect pitch
              </p>
              <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
                Create, customize, and present your ideas with confidence.
              </p>
            </div>
            
            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* Feature 1 */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
                  <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-md shadow-lg mb-5">
                    <Sparkles className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900">AI-Powered Creation</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Answer simple questions and our AI generates a complete, professional pitch deck in minutes.
                  </p>
                </div>
                
                {/* Feature 2 */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
                  <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-md shadow-lg mb-5">
                    <Clock className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900">Save Time</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Create in minutes what would normally take hours or days. Focus on your business, not making slides.
                  </p>
                </div>
                
                {/* Feature 3 */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
                  <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-md shadow-lg mb-5">
                    <LayoutList className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900">Professional Templates</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Clean, modern designs that follow best practices for investor pitches.
                  </p>
                </div>
                
                {/* Feature 4 */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
                  <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-md shadow-lg mb-5">
                    <EditIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900">Easy Editing</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Customize any part of your deck with our simple editor. Update content without losing design quality.
                  </p>
                </div>
                
                {/* Feature 5 */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
                  <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-md shadow-lg mb-5">
                    <SaveIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900">Cloud Storage</h3>
                  <p className="mt-2 text-base text-gray-500">
                    All your decks are securely stored in the cloud. Access them anytime, anywhere.
                  </p>
                </div>
                
                {/* Feature 6 */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
                  <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-md shadow-lg mb-5">
                    <Download className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900">Export Options</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Download your deck as PDF or PowerPoint files to present or share with investors.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA section */}
        <div className="bg-primary-700">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Ready to create your pitch deck?</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-primary-200">
              Create a professional pitch deck in minutes. No design skills required.
            </p>
            <Link to="/signup">
              <Button
                variant="secondary"
                size="lg"
                className="mt-8 w-full sm:w-auto"
              >
                Get Started For Free
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;