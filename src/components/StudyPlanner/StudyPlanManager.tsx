import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Edit3, 
  SkipForward,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { StudySession } from '../../types';
import toast from 'react-hot-toast';

const StudyPlanManager: React.FC = () => {
  const [studyPlan, setStudyPlan] = useState<any>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const savedPlan = localStorage.getItem('algomentor_study_plan');
    if (savedPlan) {
      const plan = JSON.parse(savedPlan);
      setStudyPlan(plan);
      setSessions(plan.studyPlan || []);
    }
  }, []);

  const postponeSession = (sessionId: string) => {
    const updatedSessions = sessions.map(session => {
      if (session.id === sessionId) {
        const newDate = new Date(session.date);
        newDate.setDate(newDate.getDate() + 1);
        return { ...session, date: newDate };
      }
      return session;
    });

    setSessions(updatedSessions);
    
    // Update localStorage
    const updatedPlan = { ...studyPlan, studyPlan: updatedSessions };
    localStorage.setItem('algomentor_study_plan', JSON.stringify(updatedPlan));
    
    toast.success('Session postponed to tomorrow');
  };

  const markSessionComplete = (sessionId: string) => {
    const updatedSessions = sessions.map(session => {
      if (session.id === sessionId) {
        return { ...session, completed: true, progress: 100 };
      }
      return session;
    });

    setSessions(updatedSessions);
    
    const updatedPlan = { ...studyPlan, studyPlan: updatedSessions };
    localStorage.setItem('algomentor_study_plan', JSON.stringify(updatedPlan));
    
    toast.success('Session marked as complete!');
  };

  const resetPlan = () => {
    const resetSessions = sessions.map(session => ({
      ...session,
      completed: false,
      progress: 0
    }));

    setSessions(resetSessions);
    
    const updatedPlan = { ...studyPlan, studyPlan: resetSessions };
    localStorage.setItem('algomentor_study_plan', JSON.stringify(updatedPlan));
    
    toast.success('Study plan reset successfully');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWeekSessions = () => {
    const startIndex = currentWeek * 7;
    return sessions.slice(startIndex, startIndex + 7);
  };

  const getProgressStats = () => {
    const completed = sessions.filter(s => s.completed).length;
    const total = sessions.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  if (!studyPlan) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">No Study Plan Found</h2>
          <p className="text-gray-400 mb-6">Create a study plan to get started with your learning journey</p>
          <button
            onClick={() => window.location.href = '/courses'}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create Study Plan
          </button>
        </div>
      </div>
    );
  }

  const stats = getProgressStats();
  const weekSessions = getWeekSessions();
  const totalWeeks = Math.ceil(sessions.length / 7);

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">Study Plan Manager</h1>
              <p className="text-xl text-gray-400">
                {studyPlan.course?.name} - {studyPlan.level} Level
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                <span>{isEditing ? 'Done' : 'Edit'}</span>
              </button>
              
              <button
                onClick={resetPlan}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Progress Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{stats.percentage}%</div>
              <div className="text-gray-400">Complete</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{stats.completed}</div>
              <div className="text-gray-400">Sessions Done</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{stats.total - stats.completed}</div>
              <div className="text-gray-400">Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{studyPlan.dailyHours}h</div>
              <div className="text-gray-400">Daily Goal</div>
            </div>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${stats.percentage}%` }}
            ></div>
          </div>
        </motion.div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            Week {currentWeek + 1} of {totalWeeks}
          </h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
              disabled={currentWeek === 0}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentWeek(Math.min(totalWeeks - 1, currentWeek + 1))}
              disabled={currentWeek === totalWeeks - 1}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>

        {/* Weekly Sessions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weekSessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gray-800 rounded-xl p-6 border ${
                session.completed 
                  ? 'border-green-500 bg-green-500 bg-opacity-10' 
                  : 'border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{session.topic}</h3>
                  <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(session.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{session.duration} hours</span>
                  </div>
                </div>
                
                {session.completed && (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${session.progress}%` }}
                ></div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex space-x-2">
                  {!session.completed ? (
                    <>
                      <button
                        onClick={() => markSessionComplete(session.id)}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Complete</span>
                      </button>
                      <button
                        onClick={() => postponeSession(session.id)}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                      >
                        <SkipForward className="h-4 w-4" />
                        <span>Postpone</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        const updatedSessions = sessions.map(s => 
                          s.id === session.id ? { ...s, completed: false, progress: 0 } : s
                        );
                        setSessions(updatedSessions);
                        const updatedPlan = { ...studyPlan, studyPlan: updatedSessions };
                        localStorage.setItem('algomentor_study_plan', JSON.stringify(updatedPlan));
                        toast.success('Session marked as incomplete');
                      }}
                      className="w-full flex items-center justify-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Mark Incomplete</span>
                    </button>
                  )}
                </div>
              )}

              {/* Start Session Button */}
              {!isEditing && !session.completed && (
                <button
                  onClick={() => window.location.href = '/lessons'}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Play className="h-4 w-4" />
                  <span>Start Session</span>
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                window.location.href = '/dashboard';
              }}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowRight className="h-5 w-5" />
              <span>Go to Dashboard</span>
            </button>
            
            <button
              onClick={() => {
                window.location.href = '/quiz';
              }}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckCircle className="h-5 w-5" />
              <span>Take Quiz</span>
            </button>
            
            <button
              onClick={() => {
                window.location.href = '/compiler';
              }}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play className="h-5 w-5" />
              <span>Practice Coding</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudyPlanManager;