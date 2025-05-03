import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Questionnaire from '../../components/deck/Questionnaire';

const CreateDeckPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50">
        <Questionnaire />
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateDeckPage;