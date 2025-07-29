import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Zap } from 'lucide-react';
import { Course } from '../../types';
import CourseCard from './CourseCard';
import { useNavigate } from 'react-router-dom';

const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const courses: Course[] = [
    {
      id: '1',
      name: 'Python Programming',
      category: 'language',
      icon: 'P',
      description: 'Master Python from basics to advanced concepts with hands-on projects and real-world applications.',
      color: '#3776ab',
      duration: '8 weeks',
      level: 'Beginner'
    },
    {
      id: '2',
      name: 'Java Development',
      category: 'language',
      icon: 'J',
      description: 'Learn Java programming with object-oriented concepts, frameworks, and enterprise development.',
      color: '#ed8b00',
      duration: '10 weeks',
      level: 'Intermediate'
    },
    {
      id: '3',
      name: 'JavaScript Essentials',
      category: 'language',
      icon: 'JS',
      description: 'Modern JavaScript, ES6+, DOM manipulation, and asynchronous programming techniques.',
      color: '#f7df1e',
      duration: '6 weeks',
      level: 'Beginner'
    },
    {
      id: '4',
      name: 'C++ Programming',
      category: 'language',
      icon: 'C++',
      description: 'System programming, memory management, and advanced C++ features for competitive programming.',
      color: '#00599c',
      duration: '12 weeks',
      level: 'Advanced'
    },
    {
      id: '5',
      name: 'Data Structures & Algorithms',
      category: 'dsa',
      icon: 'DSA',
      description: 'Master DSA concepts with Python implementation, complexity analysis, and problem-solving techniques.',
      color: '#8b5cf6',
      duration: '16 weeks',
      level: 'Intermediate'
    },
    {
      id: '6',
      name: 'SQL Database',
      category: 'database',
      icon: 'SQL',
      description: 'Database design, complex queries, joins, and database optimization techniques.',
      color: '#336791',
      duration: '4 weeks',
      level: 'Beginner'
    },
    {
      id: '7',
      name: 'MongoDB',
      category: 'database',
      icon: 'M',
      description: 'NoSQL database operations, aggregation pipelines, and modern database design patterns.',
      color: '#47a248',
      duration: '5 weeks',
      level: 'Intermediate'
    },
    {
      id: '8',
      name: 'HTML & CSS',
      category: 'web',
      icon: 'H',
      description: 'Web fundamentals, responsive design, CSS Grid, Flexbox, and modern web development practices.',
      color: '#e34f26',
      duration: '6 weeks',
      level: 'Beginner'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Courses', count: courses.length },
    { id: 'language', name: 'Programming Languages', count: courses.filter(c => c.category === 'language').length },
    { id: 'dsa', name: 'DSA Tracks', count: courses.filter(c => c.category === 'dsa').length },
    { id: 'database', name: 'Databases', count: courses.filter(c => c.category === 'database').length },
    { id: 'web', name: 'Web Technologies', count: courses.filter(c => c.category === 'web').length }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCourseClick = (course: Course) => {
    navigate(`/roadmap/${course.id}`, { state: { course } });
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold gradient-text mb-4">Choose Your Learning Path</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Explore our comprehensive courses designed to make you a proficient programmer with AI-powered learning experiences.
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* AI Roadmap Generator Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 mb-8 ai-glow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">🤖 AI-Powered Roadmap Generator</h3>
              <p className="text-purple-100">Get personalized learning paths based on your skill level and goals</p>
            </div>
            <Zap className="h-8 w-8 text-yellow-300" />
          </div>
        </motion.div>

        {/* Course Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <CourseCard course={course} onClick={handleCourseClick} />
            </motion.div>
          ))}
        </motion.div>

        {filteredCourses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No courses found</h3>
            <p className="text-gray-500">Try adjusting your search terms or filters</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;