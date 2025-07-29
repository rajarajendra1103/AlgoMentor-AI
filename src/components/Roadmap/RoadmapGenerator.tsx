import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Clock, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Course, RoadmapItem } from '../../types';
import toast from 'react-hot-toast';

const RoadmapGenerator: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const course = location.state?.course as Course;
  const [selectedLevel, setSelectedLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);

  const generateRoadmap = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate AI roadmap generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const baseRoadmap: RoadmapItem[] = [
        {
          id: '1',
          title: 'What is Coding?',
          description: 'Understanding the fundamentals of programming and computational thinking',
          duration: '2 days',
          completed: false,
          topics: ['Introduction to Programming', 'Problem Solving', 'Algorithms vs Programs']
        },
        {
          id: '2',
          title: 'High-Level vs Low-Level Languages',
          description: 'Learn the differences between programming language levels and their applications',
          duration: '1 day',
          completed: false,
          topics: ['Language Classification', 'Compilation vs Interpretation', 'Performance Trade-offs']
        }
      ];

      // Add course-specific topics
      const courseSpecificTopics = getCourseSpecificRoadmap(course, selectedLevel);
      const fullRoadmap = [...baseRoadmap, ...courseSpecificTopics];
      
      setRoadmap(fullRoadmap);
      setShowRoadmap(true);
      toast.success('Roadmap generated successfully!');
    } catch (error) {
      toast.error('Failed to generate roadmap');
    } finally {
      setIsGenerating(false);
    }
  };

  const getCourseSpecificRoadmap = (course: Course, level: string): RoadmapItem[] => {
    const roadmaps: Record<string, Record<string, RoadmapItem[]>> = {
      'Python Programming': {
        'Beginner': [
          {
            id: '3',
            title: 'Python Basics',
            description: 'Variables, data types, and basic operations',
            duration: '5 days',
            completed: false,
            topics: ['Variables', 'Data Types', 'Input/Output', 'Basic Operators']
          },
          {
            id: '4',
            title: 'Control Structures',
            description: 'Conditional statements and loops',
            duration: '7 days',
            completed: false,
            topics: ['If-Else', 'For Loops', 'While Loops', 'Nested Structures']
          },
          {
            id: '5',
            title: 'Functions',
            description: 'Creating and using functions effectively',
            duration: '6 days',
            completed: false,
            topics: ['Function Definition', 'Parameters', 'Return Values', 'Scope']
          },
          {
            id: '6',
            title: 'Data Structures',
            description: 'Lists, tuples, dictionaries, and sets',
            duration: '8 days',
            completed: false,
            topics: ['Lists', 'Tuples', 'Dictionaries', 'Sets', 'List Comprehensions']
          }
        ],
        'Intermediate': [
          {
            id: '3',
            title: 'Object-Oriented Programming',
            description: 'Classes, objects, and OOP principles',
            duration: '10 days',
            completed: false,
            topics: ['Classes', 'Objects', 'Inheritance', 'Polymorphism', 'Encapsulation']
          },
          {
            id: '4',
            title: 'File Handling & Exceptions',
            description: 'Working with files and error handling',
            duration: '6 days',
            completed: false,
            topics: ['File I/O', 'Exception Handling', 'Context Managers']
          },
          {
            id: '5',
            title: 'Modules & Packages',
            description: 'Code organization and reusability',
            duration: '5 days',
            completed: false,
            topics: ['Modules', 'Packages', 'Import Systems', 'Virtual Environments']
          }
        ],
        'Advanced': [
          {
            id: '3',
            title: 'Advanced Python Concepts',
            description: 'Decorators, generators, and metaclasses',
            duration: '12 days',
            completed: false,
            topics: ['Decorators', 'Generators', 'Context Managers', 'Metaclasses']
          },
          {
            id: '4',
            title: 'Concurrency & Performance',
            description: 'Threading, multiprocessing, and optimization',
            duration: '10 days',
            completed: false,
            topics: ['Threading', 'Multiprocessing', 'Async/Await', 'Performance Optimization']
          }
        ]
      },
      'Data Structures & Algorithms': {
        'Beginner': [
          {
            id: '3',
            title: 'Arrays & Strings',
            description: 'Basic data structures and string manipulation',
            duration: '8 days',
            completed: false,
            topics: ['Arrays', 'Strings', 'Two Pointers', 'Sliding Window']
          },
          {
            id: '4',
            title: 'Linked Lists',
            description: 'Understanding and implementing linked lists',
            duration: '6 days',
            completed: false,
            topics: ['Singly Linked Lists', 'Doubly Linked Lists', 'Circular Lists']
          }
        ]
      }
    };

    return roadmaps[course.name]?.[level] || [];
  };

  const handleSetPlan = () => {
    navigate('/study-planner', { state: { course, roadmap, level: selectedLevel } });
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Course not found</h2>
          <button
            onClick={() => navigate('/courses')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

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
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl ai-glow">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-4">AI Roadmap Generator</h1>
          <p className="text-xl text-gray-400">
            Creating personalized learning path for <span className="text-purple-400 font-semibold">{course.name}</span>
          </p>
        </motion.div>

        {!showRoadmap ? (
          /* Level Selection */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-8 border border-gray-700"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Choose Your Level</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                <motion.div
                  key={level}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedLevel === level
                      ? 'border-purple-500 bg-purple-500 bg-opacity-20'
                      : 'border-gray-600 bg-gray-700 hover:border-purple-400'
                  }`}
                  onClick={() => setSelectedLevel(level)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      level === 'Beginner' ? 'bg-green-500' :
                      level === 'Intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      <span className="text-white font-bold text-lg">
                        {level === 'Beginner' ? '🌱' : level === 'Intermediate' ? '🚀' : '⚡'}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{level}</h3>
                    <p className="text-gray-400 text-sm">
                      {level === 'Beginner' && 'Perfect for those new to programming'}
                      {level === 'Intermediate' && 'For those with basic programming knowledge'}
                      {level === 'Advanced' && 'For experienced programmers seeking mastery'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <motion.button
                onClick={generateRoadmap}
                disabled={isGenerating}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Generating Roadmap...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>Generate AI Roadmap</span>
                  </div>
                )}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* Generated Roadmap */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold gradient-text">Your Personalized Roadmap</h2>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Clock className="h-5 w-5" />
                  <span>Total: {roadmap.reduce((acc, item) => acc + parseInt(item.duration), 0)} days</span>
                </div>
              </div>

              <div className="space-y-4">
                {roadmap.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-700 rounded-lg p-6 border border-gray-600"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                        </div>
                        <p className="text-gray-300 mb-4">{item.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {item.topics.map((topic, topicIndex) => (
                            <span
                              key={topicIndex}
                              className="px-3 py-1 bg-purple-500 bg-opacity-20 text-purple-300 rounded-full text-sm"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 text-gray-400 mb-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{item.duration}</span>
                        </div>
                        {item.completed && (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <motion.button
                  onClick={handleSetPlan}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="h-5 w-5" />
                    <span>Set Study Plan</span>
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RoadmapGenerator;