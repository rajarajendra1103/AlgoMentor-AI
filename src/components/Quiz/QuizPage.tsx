import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play, 
  Trophy,
  Target,
  Zap,
  Code
} from 'lucide-react';
import { QuizQuestion } from '../../types';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';

const QuizPage: React.FC = () => {
  const [quizType, setQuizType] = useState<'quick' | 'topic' | 'mock' | 'timed' | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [code, setCode] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [score, setScore] = useState(0);

  const quizTypes = [
    {
      id: 'quick',
      title: '🟢 Quick Quiz',
      description: 'Previous & Today\'s Topics',
      questions: 10,
      duration: '15 min',
      color: 'from-green-600 to-green-500'
    },
    {
      id: 'topic',
      title: '🔷 Topic-wise Test',
      description: 'Deep dive into specific topics',
      questions: 20,
      duration: '30 min',
      color: 'from-blue-600 to-blue-500'
    },
    {
      id: 'mock',
      title: '🧠 Full-length Mock',
      description: 'Complete course assessment',
      questions: 20,
      duration: '45 min',
      color: 'from-purple-600 to-purple-500'
    },
    {
      id: 'timed',
      title: '⏱️ Timed Practice',
      description: 'Code under pressure',
      questions: 5,
      duration: '20 min',
      color: 'from-red-600 to-red-500'
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleSubmitQuiz();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const generateQuestions = (type: string): QuizQuestion[] => {
    const sampleQuestions: QuizQuestion[] = [
      {
        id: '1',
        type: 'mcq',
        question: 'Which of the following is the correct way to declare a variable in Python?',
        options: ['var x = 5', 'let x = 5', 'x = 5', 'int x = 5'],
        correctAnswer: 'x = 5',
        explanation: 'In Python, variables are declared by simply assigning a value to them.',
        difficulty: 'easy'
      },
      {
        id: '2',
        type: 'fill-code',
        question: 'Complete the code to print "Hello World"',
        code: 'print("_____ World")',
        correctAnswer: 'Hello',
        explanation: 'The print function outputs text to the console.',
        difficulty: 'easy'
      },
      {
        id: '3',
        type: 'execution',
        question: 'Write a function that returns the sum of two numbers',
        code: 'def add_numbers(a, b):\n    # Your code here\n    pass',
        correctAnswer: 'return a + b',
        explanation: 'The function should return the sum of parameters a and b.',
        difficulty: 'medium'
      },
      {
        id: '4',
        type: 'mcq',
        question: 'What is the output of: print(type([1, 2, 3]))?',
        options: ['<class \'tuple\'>', '<class \'list\'>', '<class \'dict\'>', '<class \'set\'>'],
        correctAnswer: '<class \'list\'>',
        explanation: '[1, 2, 3] is a list in Python, so type() returns <class \'list\'>.',
        difficulty: 'medium'
      },
      {
        id: '5',
        type: 'execution',
        question: 'Write a function to find the maximum number in a list',
        code: 'def find_max(numbers):\n    # Your code here\n    pass',
        correctAnswer: 'return max(numbers)',
        explanation: 'The max() function returns the largest item in an iterable.',
        difficulty: 'medium'
      }
    ];

    const questionCount = type === 'quick' ? 10 : type === 'topic' ? 20 : type === 'mock' ? 20 : 5;
    return sampleQuestions.slice(0, Math.min(questionCount, sampleQuestions.length));
  };

  const startQuiz = (type: string) => {
    const quizQuestions = generateQuestions(type);
    setQuestions(quizQuestions);
    setQuizType(type as any);
    setCurrentQuestion(0);
    setAnswers([]);
    setScore(0);
    setShowResults(false);
    
    // Set timer based on quiz type
    const duration = type === 'quick' ? 900 : type === 'topic' ? 1800 : type === 'mock' ? 2700 : 1200;
    setTimeLeft(duration);
    setIsActive(true);
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
    setSelectedAnswer(value || '');
  };

  const nextQuestion = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
      setCode('');
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = () => {
    setIsActive(false);
    
    // Calculate score
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    setScore(Math.round((correctAnswers / questions.length) * 100));
    setShowResults(true);
    toast.success('Quiz completed!');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetQuiz = () => {
    setQuizType(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setCode('');
    setAnswers([]);
    setShowResults(false);
    setTimeLeft(0);
    setIsActive(false);
    setScore(0);
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center"
          >
            <div className="mb-8">
              <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <h1 className="text-4xl font-bold gradient-text mb-4">Quiz Complete!</h1>
              <div className="text-6xl font-bold mb-4">
                <span className={score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'}>
                  {score}%
                </span>
              </div>
              <p className="text-xl text-gray-400">
                You scored {Math.round((score / 100) * questions.length)} out of {questions.length} questions correctly
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">{questions.length}</div>
                <div className="text-gray-400">Total Questions</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">{Math.round((score / 100) * questions.length)}</div>
                <div className="text-gray-400">Correct Answers</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">{formatTime(timeLeft)}</div>
                <div className="text-gray-400">Time Remaining</div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={resetQuiz}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Take Another Quiz
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (quizType && questions.length > 0) {
    const question = questions[currentQuestion];
    
    return (
      <div className="min-h-screen bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Quiz Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Question {currentQuestion + 1} of {questions.length}
              </h1>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <Clock className="h-5 w-5" />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          {/* Question */}
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 rounded-xl p-8 border border-gray-700"
          >
            <h2 className="text-xl font-semibold text-white mb-6">{question.question}</h2>

            {question.type === 'mcq' && (
              <div className="space-y-3">
                {question.options?.map((option, index) => (
                  <motion.div
                    key={index}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedAnswer === option
                        ? 'border-purple-500 bg-purple-500 bg-opacity-20'
                        : 'border-gray-600 bg-gray-700 hover:border-purple-400'
                    }`}
                    onClick={() => handleAnswerSelect(option)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedAnswer === option ? 'border-purple-500 bg-purple-500' : 'border-gray-400'
                      }`}></div>
                      <span className="text-white">{option}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {question.type === 'fill-code' && (
              <div className="space-y-4">
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-green-400">
                  <pre>{question.code}</pre>
                </div>
                <input
                  type="text"
                  value={selectedAnswer}
                  onChange={(e) => handleAnswerSelect(e.target.value)}
                  placeholder="Enter your answer..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                />
              </div>
            )}

            {question.type === 'execution' && (
              <div className="space-y-4">
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="p-3 bg-gray-800 border-b border-gray-700">
                    <div className="flex items-center space-x-2">
                      <Code className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">Python</span>
                    </div>
                  </div>
                  <Editor
                    height="200px"
                    language="python"
                    value={code || question.code}
                    theme="vs-dark"
                    onChange={handleCodeChange}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      wordWrap: 'on',
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <button
                onClick={nextQuestion}
                disabled={!selectedAnswer}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentQuestion === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-4">Test Zone</h1>
          <p className="text-xl text-gray-400">
            Challenge yourself with different types of assessments
          </p>
        </motion.div>

        {/* Quiz Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quizTypes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-r ${quiz.color} rounded-xl p-6 text-white cursor-pointer card-hover`}
              onClick={() => startQuiz(quiz.id)}
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
                <p className="text-white text-opacity-90 text-sm mb-4">{quiz.description}</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Questions:</span>
                  <span className="font-semibold">{quiz.questions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Duration:</span>
                  <span className="font-semibold">{quiz.duration}</span>
                </div>
              </div>
              
              <motion.button
                className="w-full mt-4 bg-white bg-opacity-20 hover:bg-opacity-30 py-2 rounded-lg transition-all flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play className="h-4 w-4" />
                <span>Start Quiz</span>
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gray-800 rounded-xl p-8 border border-gray-700"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Quiz Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Multiple Choice</h3>
              <p className="text-gray-400 text-sm">Test your theoretical knowledge with carefully crafted questions</p>
            </div>
            
            <div className="text-center">
              <Code className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Code Execution</h3>
              <p className="text-gray-400 text-sm">Write and run code to solve programming challenges</p>
            </div>
            
            <div className="text-center">
              <Zap className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Instant Feedback</h3>
              <p className="text-gray-400 text-sm">Get immediate results with detailed explanations</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizPage;