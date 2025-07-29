import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('algomentor_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: '1',
      email,
      firstName: '',
      lastName: '',
      completedEducation: '',
      currentEducation: '',
      collegeName: '',
      courseName: '',
      mobile: '',
      createdAt: new Date()
    };
    
    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('algomentor_user', JSON.stringify(mockUser));
  };

  const register = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: '1',
      email,
      firstName: '',
      lastName: '',
      completedEducation: '',
      currentEducation: '',
      collegeName: '',
      courseName: '',
      mobile: '',
      createdAt: new Date()
    };
    
    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('algomentor_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('algomentor_user');
  };

  const updateProfile = (profile: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...profile };
      setUser(updatedUser);
      localStorage.setItem('algomentor_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateProfile,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};