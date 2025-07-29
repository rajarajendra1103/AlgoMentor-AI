import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Star, Users } from 'lucide-react';
import { Course } from '../../types';

interface CourseCardProps {
  course: Course;
  onClick: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  const getIcon = (iconName: string) => {
    // This would normally import from lucide-react based on iconName
    return <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-white font-bold text-lg">{iconName.charAt(0)}</div>;
  };

  return (
    <motion.div
      className="bg-gray-800 rounded-xl p-6 border border-gray-700 card-hover cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(course)}
      style={{
        background: `linear-gradient(135deg, ${course.color}20 0%, ${course.color}10 100%)`
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getIcon(course.icon)}
          <div>
            <h3 className="text-xl font-semibold text-white">{course.name}</h3>
            <span className="text-sm text-gray-400 capitalize">{course.category}</span>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          course.level === 'Beginner' ? 'bg-green-500 bg-opacity-20 text-green-400' :
          course.level === 'Intermediate' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
          'bg-red-500 bg-opacity-20 text-red-400'
        }`}>
          {course.level}
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{course.description}</p>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>12.5k</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span>4.8</span>
        </div>
      </div>

      <motion.button
        className="w-full mt-4 py-2 rounded-lg font-medium transition-all"
        style={{
          background: `linear-gradient(135deg, ${course.color} 0%, ${course.color}dd 100%)`
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Start Learning
      </motion.button>
    </motion.div>
  );
};

export default CourseCard;