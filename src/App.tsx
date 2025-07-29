import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import AuthPage from './components/Auth/AuthPage';
import ProfileForm from './components/Profile/ProfileForm';
import CoursesPage from './components/Courses/CoursesPage';
import CodeEditor from './components/Compiler/CodeEditor';
import RoadmapGenerator from './components/Roadmap/RoadmapGenerator';
import StudyPlanner from './components/StudyPlanner/StudyPlanner';
import StudyPlanManager from './components/StudyPlanner/StudyPlanManager';
import Dashboard from './components/Dashboard/Dashboard';
import QuizPage from './components/Quiz/QuizPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
};

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {isAuthenticated && <Header />}

      <Routes>
        <Route
          path="/auth"
          element={isAuthenticated ? <Navigate to={user?.firstName ? "/courses" : "/profile"} /> : <AuthPage />}
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <CoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roadmap/:courseId"
          element={
            <ProtectedRoute>
              <RoadmapGenerator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/study-planner"
          element={
            <ProtectedRoute>
              <StudyPlanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/study-plan-manager"
          element={
            <ProtectedRoute>
              <StudyPlanManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz"
          element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compiler"
          element={
            <ProtectedRoute>
              <CodeEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            isAuthenticated ? 
              <Navigate to={user?.firstName ? "/dashboard" : "/profile"} /> : 
              <Navigate to="/auth" />
          }
        />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;