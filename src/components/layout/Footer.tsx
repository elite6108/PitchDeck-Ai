import React from 'react';
import { Link } from 'react-router-dom';
import { PresentationIcon, GithubIcon, TwitterIcon } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <div className="flex items-center">
              <PresentationIcon className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">DeckGenius</span>
            </div>
            <p className="text-gray-500 text-sm">
              Create stunning pitch decks in minutes with the power of AI.
              Perfect for startups, entrepreneurs, and business professionals.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <TwitterIcon className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <GithubIcon className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
                  Product
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/features" className="text-sm text-gray-500 hover:text-gray-900">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link to="/pricing" className="text-sm text-gray-500 hover:text-gray-900">
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
                  Support
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/documentation" className="text-sm text-gray-500 hover:text-gray-900">
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-sm text-gray-500 hover:text-gray-900">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
                  Company
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/about" className="text-sm text-gray-500 hover:text-gray-900">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link to="/blog" className="text-sm text-gray-500 hover:text-gray-900">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
                  Legal
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-900">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-900">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-400 xl:text-center">
            &copy; {new Date().getFullYear()} DeckGenius. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;