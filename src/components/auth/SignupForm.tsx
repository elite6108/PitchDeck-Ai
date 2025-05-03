import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Input from '../ui/Input';
import Button from '../ui/Button';

const SignupForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { signUp, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswords()) return;
    
    await signUp(email, password);
    
    // Check for errors from the auth store
    if (!error) {
      // Supabase might require email confirmation
      // Show confirmation message and don't navigate yet
      if (!useAuthStore.getState().user) {
        alert('Please check your email for a confirmation link before logging in.');
        navigate('/login');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div>
        <Input
          label="Email Address"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={passwordError}
        />
      </div>

      <div>
        <Input
          label="Confirm Password"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <div>
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={loading}
        >
          Sign up
        </Button>
      </div>

      <div className="text-center text-sm">
        <span className="text-gray-600">Already have an account?</span>{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
          Sign in
        </Link>
      </div>
    </form>
  );
};

export default SignupForm;