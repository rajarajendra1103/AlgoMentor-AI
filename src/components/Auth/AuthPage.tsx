import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Code, Zap, Target } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Get personalized explanations and step-by-step guidance from our advanced AI tutor.'
    },
    {
      icon: Code,
      title: 'Interactive Coding',
      description: 'Practice with our universal compiler supporting 10+ programming languages.'
    },
    {
      icon: Zap,
      title: 'Visual Learning',
      description: 'See your code come to life with our advanced visualization engine.'
    },
    {
      icon: Target,
      title: 'Structured Path',
      description: 'Follow carefully crafted roadmaps designed by industry experts.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left Panel - Features */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg items-center justify-center p-12">
        <div className="max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-white bg-opacity-20 rounded-2xl">
                <Brain className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">AlgoMentor AI</h1>
            <p className="text-xl text-purple-100">
              Master programming with AI-powered interactive learning
            </p>
          </motion.div>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="flex items-start space-x-4"
              >
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-purple-100 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold gradient-text">AlgoMentor AI</h1>
            <p className="text-gray-400 mt-2">AI-powered interactive learning platform</p>
          </div>

          {isLogin ? (
            <LoginForm onToggleMode={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onToggleMode={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;