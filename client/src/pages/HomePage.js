import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Users, Zap, Shield } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="mb-8">
          <BarChart3 className="h-20 w-20 text-blue-600 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Live Polling Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create engaging polls and get real-time results. Perfect for presentations, 
            meetings, classrooms, and events.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/create"
            className="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center"
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            Create Your First Poll
          </Link>
          <button className="btn-secondary text-lg px-8 py-3">
            Learn More
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="card text-center">
                      <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Real-time Results</h3>
          <p className="text-gray-600">
            Watch votes come in live with instant updates and beautiful visualizations.
          </p>
        </div>
        
        <div className="card text-center">
                      <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Multiple Question Types</h3>
          <p className="text-gray-600">
            MCQ, Rating scales, Yes/No, and open text questions.
          </p>
        </div>
        
        <div className="card text-center">
                      <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Registration Required</h3>
          <p className="text-gray-600">
            Participants can vote instantly with just a link - no accounts needed.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-700 font-bold text-lg">1</span>
            </div>
            <h3 className="font-semibold mb-2">Create Poll</h3>
            <p className="text-gray-600 text-sm">
              Choose your question type, add options, and customize settings.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-700 font-bold text-lg">2</span>
            </div>
            <h3 className="font-semibold mb-2">Share Link</h3>
            <p className="text-gray-600 text-sm">
              Get a unique link to share with your audience via email, chat, or QR code.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-700 font-bold text-lg">3</span>
            </div>
            <h3 className="font-semibold mb-2">Get Results</h3>
            <p className="text-gray-600 text-sm">
              View live results, export data, and analyze responses in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 