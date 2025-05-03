import React from 'react';
import AuthLayout from '../../components/layout/AuthLayout';
import SignupForm from '../../components/auth/SignupForm';

const SignupPage: React.FC = () => {
  return (
    <AuthLayout
      title="Create an account"
      subtitle="Start creating pitch decks in minutes"
    >
      <SignupForm />
    </AuthLayout>
  );
};

export default SignupPage;