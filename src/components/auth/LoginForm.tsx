import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Input from '../ui/Input';
import Button from '../ui/Button';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
    if (!error) {
      navigate('/dashboard');
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
          autoComplete="current-password"
          required
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
            Forgot your password?
          </Link>
        </div>
      </div>

      <div>
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={loading}
        >
          Sign in
        </Button>
      </div>

      <div className="text-center text-sm">
        <span className="text-gray-600">Don't have an account?</span>{' '}
        <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
          Sign up
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;