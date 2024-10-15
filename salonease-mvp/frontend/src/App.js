import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen max-w-2xl mx-auto">
        <Header />
        <div className="flex flex-1">
          <Sidebar className="hidden md:block" />
          <main className="flex-1 p-4 md:p-8 lg:p-12 ml-64">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">Welcome to SalonEase</h2>
            <p className="text-base md:text-lg lg:text-xl">Your salon management solution.</p>
          </main>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
