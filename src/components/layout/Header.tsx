import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import { PresentationIcon, LogOutIcon, UserIcon, FileTextIcon, ChevronDownIcon, ImageIcon } from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };
  
  // Close the profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <PresentationIcon className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">DeckGenius</span>
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/create" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                  Create Deck
                </Link>
                <Link to="/agreements/create" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                  Business Agreement
                </Link>
                <Link to="/logo" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                  Logo Generator
                </Link>
                <div className="relative ml-4" ref={profileMenuRef}>
                  <button
                    onClick={toggleProfileMenu}
                    className="flex items-center gap-2 rounded-full bg-primary-100 p-1 text-sm text-primary-700 hover:bg-primary-200 focus:outline-none"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm text-primary-700">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                  
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-700 font-medium border-b border-gray-100">
                          {user?.email}
                        </div>
                        
                        <Link to="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <PresentationIcon className="h-4 w-4 mr-2" />
                          Your Pitch Decks
                        </Link>
                        
                        <Link to="/agreements/my-agreements" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <FileTextIcon className="h-4 w-4 mr-2" />
                          Your Business Documents
                        </Link>
                        
                        <Link to="/logo" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Logo Generator
                        </Link>
                        
                        <div className="border-t border-gray-100"></div>
                        
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOutIcon className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                  Log In
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;