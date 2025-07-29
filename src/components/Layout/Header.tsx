import React from 'react';
import { motion } from 'framer-motion';
import { Brain, User, LogOut, Settings, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.header 
      className="bg-gray-800 border-b border-gray-700 px-6 py-4"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg ai-glow">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">AlgoMentor AI</h1>
        </div>

        {isAuthenticated && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-gray-300">{user?.firstName || user?.email}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => navigate('/study-plan-manager')}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Study Plan Manager"
              >
                <Calendar className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <button 
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;