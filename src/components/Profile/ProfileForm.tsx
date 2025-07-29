import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Upload, Phone, Mail, Linkedin, GraduationCap, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProfileForm: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    completedEducation: user?.completedEducation || '',
    currentEducation: user?.currentEducation || '',
    collegeName: user?.collegeName || '',
    courseName: user?.courseName || '',
    mobile: user?.mobile || '',
    linkedIn: user?.linkedIn || '',
    photo: user?.photo || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateProfile(formData);
      toast.success('Profile saved successfully!');
      navigate('/courses');
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold gradient-text mb-2">Complete Your Profile</h2>
            <p className="text-gray-400">Help us personalize your learning experience</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  {formData.photo ? (
                    <img src={formData.photo} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-white" />
                  )}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-2 hover:bg-purple-700 transition-colors"
                >
                  <Upload className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>

            {/* Education Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <GraduationCap className="inline h-4 w-4 mr-1" />
                Completed Education
              </label>
              <select
                value={formData.completedEducation}
                onChange={(e) => handleInputChange('completedEducation', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                required
              >
                <option value="">Select your completed education</option>
                <option value="High School">High School</option>
                <option value="Diploma">Diploma</option>
                <option value="Bachelor's">Bachelor's Degree</option>
                <option value="Master's">Master's Degree</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <BookOpen className="inline h-4 w-4 mr-1" />
                Current Education
              </label>
              <select
                value={formData.currentEducation}
                onChange={(e) => handleInputChange('currentEducation', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
              >
                <option value="">Select your current education (if any)</option>
                <option value="High School">High School</option>
                <option value="Diploma">Diploma</option>
                <option value="Bachelor's">Bachelor's Degree</option>
                <option value="Master's">Master's Degree</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">College Name</label>
                <input
                  type="text"
                  value={formData.collegeName}
                  onChange={(e) => handleInputChange('collegeName', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Enter your college name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Course Name</label>
                <input
                  type="text"
                  value={formData.courseName}
                  onChange={(e) => handleInputChange('courseName', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Enter your course name"
                />
              </div>
            </div>

            {/* Contact Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Mobile Number
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                placeholder="Enter your mobile number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Linkedin className="inline h-4 w-4 mr-1" />
                LinkedIn Profile (Optional)
              </label>
              <input
                type="url"
                value={formData.linkedIn}
                onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full gradient-bg text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? 'Saving Profile...' : 'Save Profile & Continue'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileForm;