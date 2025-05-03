import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import { PresentationIcon, LogOutIcon, UserIcon } from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
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
                <div className="relative ml-4 flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm text-primary-700">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                    >
                      <LogOutIcon className="h-4 w-4 mr-1" />
                      Sign Out
                    </Button>
                  </div>
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