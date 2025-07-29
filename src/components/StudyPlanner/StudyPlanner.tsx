import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Target, CheckCircle, ArrowRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Course, RoadmapItem, StudySession } from '../../types';
import toast from 'react-hot-toast';

const StudyPlanner: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { course, roadmap, level } = location.state || {};
  
  const [dailyHours, setDailyHours] = useState(2);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [studyPlan, setStudyPlan] = useState<StudySession[]>([]);
  const [showPlan, setShowPlan] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateStudyPlan = async () => {
    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const sessions: StudySession[] = [];
      let currentDate = new Date(startDate);
      let sessionId = 1;

      roadmap.forEach((item: RoadmapItem) => {
        const daysNeeded = parseInt(item.duration);
        const topicsPerDay = Math.ceil(item.topics.length / daysNeeded);
        
        for (let day = 0; day < daysNeeded; day++) {
          const topicsForDay = item.topics.slice(
            day * topicsPerDay,
            (day + 1) * topicsPerDay
          );
          
          sessions.push({
            id: sessionId.toString(),
            date: new Date(currentDate),
            topic: day === 0 ? item.title : `${item.title} (Day ${day + 1})`,
            duration: dailyHours,
            completed: false,
            progress: 0
          });
          
          currentDate.setDate(currentDate.getDate() + 1);
          sessionId++;
        }
      });

      setStudyPlan(sessions);
      setShowPlan(true);
      toast.success('Study plan generated successfully!');
    } catch (error) {
      toast.error('Failed to generate study plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const finalizePlan = () => {
    // Save study plan to localStorage or context
    localStorage.setItem('algomentor_study_plan', JSON.stringify({
      course,
      roadmap,
      level,
      dailyHours,
      startDate,
      studyPlan
    }));
    
    toast.success('Study plan finalized! Redirecting to dashboard...');
    navigate('/dashboard');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTotalDuration = () => {
    return studyPlan.length * dailyHours;
  };

  const getCompletionDate = () => {
    if (studyPlan.length === 0) return '';
    const lastSession = studyPlan[studyPlan.length - 1];
    return formatDate(lastSession.date);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl">
              <Target className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-4">Smart Study Planner</h1>
          <p className="text-xl text-gray-400">
            Create your personalized study schedule for <span className="text-purple-400 font-semibold">{course?.name}</span>
          </p>
        </motion.div>

        {!showPlan ? (
          /* Study Plan Configuration */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-8 border border-gray-700"
          >
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Configure Your Study Plan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Daily Hours */}
              <div>
                <label className="block text-lg font-medium text-gray-300 mb-4">
                  <Clock className="inline h-5 w-5 mr-2" />
                  Daily Study Hours
                </label>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((hours) => (
                    <motion.div
                      key={hours}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        dailyHours === hours
                          ? 'border-purple-500 bg-purple-500 bg-opacity-20'
                          : 'border-gray-600 bg-gray-700 hover:border-purple-400'
                      }`}
                      onClick={() => setDailyHours(hours)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{hours} hour{hours > 1 ? 's' : ''} per day</span>
                        <span className="text-gray-400 text-sm">
                          {hours === 1 && 'Light pace'}
                          {hours === 2 && 'Recommended'}
                          {hours === 3 && 'Intensive'}
                          {hours === 4 && 'Fast track'}
                          {hours === 5 && 'Accelerated'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-lg font-medium text-gray-300 mb-4">
                  <Calendar className="inline h-5 w-5 mr-2" />
                  Starting Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                />
                
                <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                  <h3 className="text-white font-semibold mb-2">Plan Summary</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>Course:</span>
                      <span className="text-purple-400">{course?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Level:</span>
                      <span className="text-purple-400">{level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Topics:</span>
                      <span className="text-purple-400">{roadmap?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Daily Commitment:</span>
                      <span className="text-purple-400">{dailyHours} hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <motion.button
                onClick={generateStudyPlan}
                disabled={isGenerating}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Generating Plan...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Generate Study Plan</span>
                  </div>
                )}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* Generated Study Plan */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Plan Overview */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold gradient-text mb-6">Your Study Plan Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">{studyPlan.length}</div>
                  <div className="text-gray-400">Study Days</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{getTotalDuration()}h</div>
                  <div className="text-gray-400">Total Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{dailyHours}h</div>
                  <div className="text-gray-400">Daily</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">{getCompletionDate()}</div>
                  <div className="text-gray-400">Completion</div>
                </div>
              </div>
            </div>

            {/* Study Sessions */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-6">Daily Study Sessions</h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {studyPlan.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{session.topic}</h4>
                        <p className="text-gray-400 text-sm">{formatDate(session.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{session.duration}h</span>
                      </div>
                      {session.completed && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <motion.button
                onClick={finalizePlan}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Finalize Plan</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudyPlanner;