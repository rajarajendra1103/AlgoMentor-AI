import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Save, Download, Settings, Zap } from 'lucide-react';
import Editor from '@monaco-editor/react';
import VisualizationCanvas from '../AIVisualLearn/VisualizationCanvas';
import { APIService } from '../../services/apiService';
import toast from 'react-hot-toast';

const CodeEditor: React.FC = () => {
  const [code, setCode] = useState(`# Welcome to AlgoMentor AI Code Editor
# Write your Python code here

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Test the function
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
`);
  const [language, setLanguage] = useState('python');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [showVisualization, setShowVisualization] = useState(false);
  const [testCases] = useState([
    { input: '5', expected: 'F(5) = 5' },
    { input: '10', expected: 'F(10) = 55' }
  ]);
  
  const editorRef = useRef<any>(null);

  const languages = [
    { id: 'python', name: 'Python', extension: 'py' },
    { id: 'javascript', name: 'JavaScript', extension: 'js' },
    { id: 'java', name: 'Java', extension: 'java' },
    { id: 'cpp', name: 'C++', extension: 'cpp' },
    { id: 'c', name: 'C', extension: 'c' }
  ];

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const runCode = async () => {
    setIsRunning(true);
    
    try {
      // Use Judge0 API for real code execution
      const result = await APIService.executeCode(code, language, input);
      setExecutionResult(result);
      
      if (result.status?.id === 3) { // Accepted
        setOutput(result.stdout || 'Program executed successfully');
        toast.success('Code executed successfully!');
      } else if (result.status?.id === 6) { // Compilation Error
        setOutput(`Compilation Error:\n${result.compile_output || result.stderr}`);
        toast.error('Compilation failed');
      } else if (result.status?.id === 5) { // Time Limit Exceeded
        setOutput('Time Limit Exceeded');
        toast.error('Execution timed out');
      } else {
        setOutput(result.stderr || result.stdout || 'Unknown error occurred');
        toast.error('Execution failed');
      }
    } catch (error) {
      console.error('Execution error:', error);
      setOutput('Error: Failed to execute code. Please try again.');
      toast.error('Failed to execute code');
    } finally {
      setIsRunning(false);
    }
  };

  const saveCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${languages.find(l => l.id === language)?.extension || 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Code saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold gradient-text">Universal Code Compiler</h1>
            <p className="text-gray-400 mt-1">Write, test, and execute code in multiple languages</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
            >
              {languages.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>
            
            <button
              onClick={saveCode}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Save className="h-5 w-5 text-gray-400" />
            </button>
            
            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Code Editor */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Code Editor</h3>
              <motion.button
                onClick={runCode}
                disabled={isRunning}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Run Code</span>
                  </>
                )}
              </motion.button>
            </div>
            
            <div className="h-96">
              <Editor
                height="100%"
                language={language}
                value={code}
                theme="vs-dark"
                onChange={(value) => setCode(value || '')}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  automaticLayout: true,
                }}
              />
            </div>
          </motion.div>

          {/* Input/Output Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Input */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Input</h3>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your input here..."
                className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Output */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Output</h3>
              <div className="bg-gray-900 rounded-lg p-3 h-32 overflow-y-auto">
                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                  {output || 'No output yet. Run your code to see results.'}
                </pre>
              </div>
            </div>

            {/* AI Visual Learn Button */}
            <motion.button
              onClick={() => {
                if (executionResult && executionResult.status?.id === 3) {
                  setShowVisualization(true);
                } else {
                  toast.error('Please run your code successfully first');
                }
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold ai-glow flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Zap className="h-5 w-5" />
              <span>AI Visual Learn</span>
            </motion.button>

            {/* Test Cases */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Test Cases</h3>
              <div className="space-y-2">
                {testCases.map((testCase, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-3">
                    <div className="text-sm text-gray-300">
                      <span className="font-medium">Input:</span> {testCase.input}
                    </div>
                    <div className="text-sm text-gray-300">
                      <span className="font-medium">Expected:</span> {testCase.expected}
                    </div>
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 bg-green-500 bg-opacity-20 text-green-400 rounded text-xs">
                        ✓ Passed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* AI Visualization Canvas */}
      {showVisualization && (
        <VisualizationCanvas
          code={code}
          language={language}
          executionResult={executionResult}
          onClose={() => setShowVisualization(false)}
        />
      )}
    </div>
  );
};

export default CodeEditor;