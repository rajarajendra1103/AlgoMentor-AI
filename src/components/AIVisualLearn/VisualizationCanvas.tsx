import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { Brain, Play, Pause, SkipForward, RotateCcw, Volume2, Code, Zap } from 'lucide-react';
import { APIService } from '../../services/apiService';
import toast from 'react-hot-toast';

interface VisualizationStep {
  id: string;
  line: number;
  description: string;
  variables: Record<string, any>;
  memory: any[];
  callStack: string[];
  highlight: string;
  visualType: string;
}

interface VisualizationCanvasProps {
  code: string;
  language: string;
  executionResult: any;
  onClose: () => void;
}

const VisualizationCanvas: React.FC<VisualizationCanvasProps> = ({
  code,
  language,
  executionResult,
  onClose
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const p5InstanceRef = useRef<any>(null);
  
  const [steps, setSteps] = useState<VisualizationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [aiNarration, setAiNarration] = useState('');
  const [isLoadingNarration, setIsLoadingNarration] = useState(false);
  const [visualizationType, setVisualizationType] = useState<string>('variables');
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    analyzeCodeAndGenerateSteps();
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
      }
    };
  }, [code, language]);

  useEffect(() => {
    if (steps.length > 0 && !isAnalyzing) {
      renderVisualization();
      generateAINarration();
    }
  }, [currentStep, steps, visualizationType, isAnalyzing]);

  const analyzeCodeAndGenerateSteps = async () => {
    setIsAnalyzing(true);
    
    // Detect visualization type based on code content
    let detectedType = 'variables';
    if (code.includes('for ') || code.includes('while ')) detectedType = 'loops';
    if (code.includes('def ') || code.includes('function')) detectedType = 'functions';
    if (code.includes('[') && code.includes(']')) detectedType = 'arrays';
    if (code.includes('{') && code.includes(':')) detectedType = 'dictionaries';
    if (code.includes('if ') || code.includes('else')) detectedType = 'control_flow';
    if (code.includes('open(') || code.includes('file')) detectedType = 'file_handling';
    if (code.includes('try:') || code.includes('except')) detectedType = 'error_handling';
    if (code.includes('import ') || code.includes('from ')) detectedType = 'modules';

    setVisualizationType(detectedType);

    // Generate detailed execution steps
    const lines = code.split('\n').filter(line => line.trim());
    const mockSteps: VisualizationStep[] = [];

    lines.forEach((line, index) => {
      mockSteps.push({
        id: `step-${index}`,
        line: index + 1,
        description: `Executing: ${line.trim()}`,
        variables: generateVariablesForStep(line, index, detectedType),
        memory: generateMemoryForStep(line, index, detectedType),
        callStack: generateCallStackForStep(line, index, detectedType),
        highlight: line.trim(),
        visualType: detectedType
      });
    });

    setSteps(mockSteps);
    setIsAnalyzing(false);
  };

  const generateVariablesForStep = (line: string, step: number, type: string): Record<string, any> => {
    const variables: Record<string, any> = {};
    
    switch (type) {
      case 'variables':
        if (line.includes('=') && !line.includes('==')) {
          const parts = line.split('=');
          if (parts.length === 2) {
            const varName = parts[0].trim();
            const value = parts[1].trim();
            variables[varName] = evaluateValue(value);
          }
        }
        break;
      
      case 'loops':
        variables['i'] = step % 10;
        variables['count'] = step;
        if (line.includes('range')) {
          const match = line.match(/range\((\d+)\)/);
          if (match) variables['range_limit'] = parseInt(match[1]);
        }
        break;
      
      case 'arrays':
        variables['arr'] = Array.from({length: 5}, (_, i) => i <= step ? i * 2 : null);
        variables['index'] = step % 5;
        break;
      
      case 'dictionaries':
        variables['dict'] = {
          'key1': step,
          'key2': `value_${step}`,
          'key3': step * 2
        };
        break;
    }

    return variables;
  };

  const generateMemoryForStep = (line: string, step: number, type: string): any[] => {
    const memory = [];
    
    switch (type) {
      case 'arrays':
        for (let i = 0; i < 8; i++) {
          memory.push({
            address: `0x${(1000 + i * 4).toString(16)}`,
            value: i <= step ? i * 2 : null,
            type: 'int',
            index: i
          });
        }
        break;
      
      case 'variables':
        memory.push({
          address: `0x${(2000 + step * 8).toString(16)}`,
          value: step,
          type: 'variable',
          name: `var_${step}`
        });
        break;
    }

    return memory;
  };

  const generateCallStackForStep = (line: string, step: number, type: string): string[] => {
    const stack = ['main()'];
    
    if (type === 'functions') {
      if (line.includes('def ')) {
        const funcName = line.match(/def\s+(\w+)/)?.[1] || 'function';
        stack.push(`${funcName}()`);
      }
      if (step > 2) stack.push('helper_function()');
    }

    return stack;
  };

  const evaluateValue = (value: string): any => {
    if (value.includes('"') || value.includes("'")) {
      return value.replace(/['"]/g, '');
    } else if (!isNaN(Number(value))) {
      return Number(value);
    } else if (value === 'True') {
      return true;
    } else if (value === 'False') {
      return false;
    }
    return value;
  };

  const generateAINarration = async () => {
    if (steps.length === 0 || currentStep >= steps.length) return;

    setIsLoadingNarration(true);
    const step = steps[currentStep];
    
    const prompt = `As an AI programming tutor, explain this code execution step in simple, educational terms:

Code line: ${step.highlight}
Step: ${currentStep + 1} of ${steps.length}
Visualization type: ${step.visualType}
Variables: ${JSON.stringify(step.variables)}

Focus on:
1. What's happening in this specific step
2. Why this step is important
3. Common mistakes beginners make here
4. Memory/execution details if relevant

Keep it conversational and beginner-friendly (2-3 sentences max).`;

    try {
      const narration = await APIService.getAIExplanation(prompt);
      setAiNarration(narration);
    } catch (error) {
      setAiNarration('AI narration temporarily unavailable. This step shows the execution of the highlighted code line.');
    } finally {
      setIsLoadingNarration(false);
    }
  };

  const renderVisualization = () => {
    if (steps.length === 0 || currentStep >= steps.length) return;

    const step = steps[currentStep];

    // Clean up previous p5 instance
    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove();
      p5InstanceRef.current = null;
    }

    switch (step.visualType) {
      case 'variables':
        renderVariablesVisualization(step);
        break;
      case 'loops':
        renderLoopVisualization(step);
        break;
      case 'functions':
        renderFunctionVisualization(step);
        break;
      case 'arrays':
        renderArrayVisualization(step);
        break;
      case 'dictionaries':
        renderDictionaryVisualization(step);
        break;
      case 'control_flow':
        renderControlFlowVisualization(step);
        break;
      case 'file_handling':
        renderFileHandlingVisualization(step);
        break;
      case 'error_handling':
        renderErrorHandlingVisualization(step);
        break;
      case 'modules':
        renderModulesVisualization(step);
        break;
      default:
        renderVariablesVisualization(step);
    }
  };

  const renderVariablesVisualization = (step: VisualizationStep) => {
    if (!canvasRef.current) return;

    // Dynamic import for p5.js to avoid SSR issues
    import('p5').then((p5Module) => {
      const p5 = p5Module.default;
      
      const sketch = (p: any) => {
        p.setup = () => {
          p.createCanvas(800, 500);
          p.background(17, 24, 39); // gray-900
        };

        p.draw = () => {
          p.background(17, 24, 39);
          
          // Title
          p.fill(243, 244, 246);
          p.textAlign(p.CENTER);
          p.textSize(20);
          p.text('Memory Cell Diagram - Variables & Data Types', 400, 30);

          const variables = Object.entries(step.variables);
          const cellWidth = 120;
          const cellHeight = 80;
          const startX = 50;
          const startY = 80;

          variables.forEach(([name, value], index) => {
            const x = startX + (index % 4) * (cellWidth + 20);
            const y = startY + Math.floor(index / 4) * (cellHeight + 30);

            // Animate cell appearance
            const animationProgress = p.min(1, (p.frameCount - index * 10) / 30);
            if (animationProgress <= 0) return;

            p.push();
            p.translate(x + cellWidth/2, y + cellHeight/2);
            p.scale(animationProgress);

            // Memory cell background
            p.fill(55, 65, 81); // gray-700
            p.stroke(139, 92, 246); // purple-500
            p.strokeWeight(2);
            p.rect(-cellWidth/2, -cellHeight/2, cellWidth, cellHeight, 8);

            // Variable name
            p.fill(229, 231, 235);
            p.textAlign(p.CENTER);
            p.textSize(14);
            p.text(name, 0, -15);

            // Variable value with type-based coloring
            if (typeof value === 'number') {
              p.fill(16, 185, 129); // green-500
            } else if (typeof value === 'string') {
              p.fill(59, 130, 246); // blue-500
            } else if (typeof value === 'boolean') {
              p.fill(245, 158, 11); // amber-500
            } else {
              p.fill(156, 163, 175); // gray-400
            }
            
            p.textSize(16);
            p.text(String(value), 0, 10);

            // Memory address
            p.fill(107, 114, 128);
            p.textSize(10);
            p.text(`0x${(1000 + index * 8).toString(16)}`, 0, 25);

            p.pop();
          });

          // Add memory usage indicator
          p.fill(139, 92, 246);
          p.textAlign(p.LEFT);
          p.textSize(12);
          p.text(`Memory Usage: ${variables.length * 8} bytes`, 50, 480);
        };
      };

      p5InstanceRef.current = new p5(sketch, canvasRef.current);
    }).catch(() => {
      // Fallback to canvas rendering if p5.js fails to load
      renderCanvasFallback(step);
    });
  };

  const renderLoopVisualization = (step: VisualizationStep) => {
    if (!canvasRef.current) return;

    import('p5').then((p5Module) => {
      const p5 = p5Module.default;
      
      const sketch = (p: any) => {
        let angle = 0;

        p.setup = () => {
          p.createCanvas(800, 500);
        };

        p.draw = () => {
          p.background(17, 24, 39);
          
          // Title
          p.fill(243, 244, 246);
          p.textAlign(p.CENTER);
          p.textSize(20);
          p.text('Loop Animator - Step-by-Step Execution', 400, 30);

          const centerX = 400;
          const centerY = 250;
          const radius = 100;

          // Outer circle
          p.noFill();
          p.stroke(139, 92, 246);
          p.strokeWeight(4);
          p.circle(centerX, centerY, radius * 2);

          // Progress arc
          const progress = (currentStep / steps.length) * p.TWO_PI;
          p.stroke(16, 185, 129);
          p.strokeWeight(8);
          p.arc(centerX, centerY, radius * 2, radius * 2, -p.HALF_PI, -p.HALF_PI + progress);

          // Animated loop counter
          angle += 0.05;
          const counterX = centerX + Math.cos(angle) * 20;
          const counterY = centerY + Math.sin(angle) * 20;

          p.fill(16, 185, 129);
          p.noStroke();
          p.circle(counterX, counterY, 15);

          // Counter text
          p.fill(243, 244, 246);
          p.textAlign(p.CENTER);
          p.textSize(24);
          p.text(`i = ${step.variables.i || 0}`, centerX, centerY + 5);

          // Loop information
          p.textSize(14);
          p.text(`Iteration ${currentStep + 1} of ${steps.length}`, centerX, centerY + 30);

          // Loop body visualization
          const bodyY = centerY + 80;
          p.fill(55, 65, 81);
          p.stroke(139, 92, 246);
          p.strokeWeight(2);
          p.rect(centerX - 150, bodyY, 300, 60, 8);

          p.fill(229, 231, 235);
          p.textAlign(p.CENTER);
          p.textSize(12);
          p.text('Loop Body Execution', centerX, bodyY + 20);
          p.text(step.highlight, centerX, bodyY + 40);
        };
      };

      p5InstanceRef.current = new p5(sketch, canvasRef.current);
    }).catch(() => {
      renderCanvasFallback(step);
    });
  };

  const renderFunctionVisualization = (step: VisualizationStep) => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 500;
    
    svg.attr('width', width).attr('height', height);

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f3f4f6')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .text('Call Stack Visualizer - Functions & Scope');

    // Call stack visualization
    const stackWidth = 250;
    const stackHeight = 60;
    const startX = width / 2 - stackWidth / 2;
    const startY = 80;

    step.callStack.forEach((func, index) => {
      const y = startY + index * (stackHeight + 15);
      const isActive = index === step.callStack.length - 1;

      const stackFrame = svg.append('g')
        .attr('transform', `translate(${startX}, ${y})`);

      // Stack frame with animation
      stackFrame.append('rect')
        .attr('width', 0)
        .attr('height', stackHeight)
        .attr('fill', isActive ? '#8b5cf6' : '#374151')
        .attr('stroke', '#6b7280')
        .attr('stroke-width', 2)
        .attr('rx', 8)
        .transition()
        .duration(500)
        .delay(index * 200)
        .attr('width', stackWidth);

      // Function name
      stackFrame.append('text')
        .attr('x', stackWidth / 2)
        .attr('y', stackHeight / 2 + 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f3f4f6')
        .attr('font-size', '16px')
        .attr('opacity', 0)
        .transition()
        .duration(300)
        .delay(index * 200 + 500)
        .attr('opacity', 1)
        .text(func);

      // Scope indicator
      if (isActive) {
        stackFrame.append('circle')
          .attr('cx', stackWidth - 20)
          .attr('cy', 20)
          .attr('r', 0)
          .attr('fill', '#10b981')
          .transition()
          .duration(300)
          .delay(index * 200 + 800)
          .attr('r', 8);
      }
    });

    // Scope variables
    if (Object.keys(step.variables).length > 0) {
      const scopeY = startY + step.callStack.length * (stackHeight + 15) + 30;
      
      svg.append('text')
        .attr('x', startX)
        .attr('y', scopeY)
        .attr('fill', '#9ca3af')
        .attr('font-size', '14px')
        .text('Local Variables:');

      Object.entries(step.variables).forEach(([name, value], index) => {
        const varY = scopeY + 25 + index * 20;
        
        svg.append('text')
          .attr('x', startX + 20)
          .attr('y', varY)
          .attr('fill', '#e5e7eb')
          .attr('font-size', '12px')
          .attr('opacity', 0)
          .transition()
          .duration(300)
          .delay(1000 + index * 100)
          .attr('opacity', 1)
          .text(`${name}: ${value}`);
      });
    }
  };

  const renderArrayVisualization = (step: VisualizationStep) => {
    if (!canvasRef.current) return;

    import('p5').then((p5Module) => {
      const p5 = p5Module.default;
      
      const sketch = (p: any) => {
        p.setup = () => {
          p.createCanvas(800, 500);
        };

        p.draw = () => {
          p.background(17, 24, 39);
          
          // Title
          p.fill(243, 244, 246);
          p.textAlign(p.CENTER);
          p.textSize(20);
          p.text('Interactive Array - Lists & Tuples', 400, 30);

          const cellSize = 70;
          const startX = 100;
          const startY = 200;
          const arr = step.variables.arr || [];

          // Array visualization
          arr.forEach((value: any, index: number) => {
            const x = startX + index * (cellSize + 5);
            const isActive = index === (step.variables.index || 0);

            // Cell animation
            const animationOffset = isActive ? p.sin(p.frameCount * 0.1) * 5 : 0;
            
            // Cell background
            p.fill(value !== null ? (isActive ? 16 : 55), value !== null ? (isActive ? 185 : 65), value !== null ? (isActive ? 129 : 81));
            p.stroke(139, 92, 246);
            p.strokeWeight(isActive ? 3 : 2);
            p.rect(x, startY + animationOffset, cellSize, cellSize, 4);

            // Value
            if (value !== null) {
              p.fill(243, 244, 246);
              p.textAlign(p.CENTER);
              p.textSize(18);
              p.text(value, x + cellSize / 2, startY + cellSize / 2 + 5 + animationOffset);
            }

            // Index label
            p.fill(156, 163, 175);
            p.textSize(12);
            p.text(index, x + cellSize / 2, startY - 10);

            // Memory address
            p.textSize(10);
            p.text(`0x${(1000 + index * 4).toString(16)}`, x + cellSize / 2, startY + cellSize + 20);
          });

          // Array operations indicator
          p.fill(139, 92, 246);
          p.textAlign(p.LEFT);
          p.textSize(14);
          p.text('Array Operations:', 100, 350);
          
          const operations = ['append()', 'insert()', 'remove()', 'pop()'];
          operations.forEach((op, index) => {
            const isCurrentOp = step.highlight.includes(op.replace('()', ''));
            p.fill(isCurrentOp ? 16 : 107, isCurrentOp ? 185 : 114, isCurrentOp ? 129 : 128);
            p.text(op, 100 + index * 80, 375);
          });
        };
      };

      p5InstanceRef.current = new p5(sketch, canvasRef.current);
    }).catch(() => {
      renderCanvasFallback(step);
    });
  };

  const renderDictionaryVisualization = (step: VisualizationStep) => {
    if (!canvasRef.current) return;

    import('p5').then((p5Module) => {
      const p5 = p5Module.default;
      
      const sketch = (p: any) => {
        p.setup = () => {
          p.createCanvas(800, 500);
        };

        p.draw = () => {
          p.background(17, 24, 39);
          
          // Title
          p.fill(243, 244, 246);
          p.textAlign(p.CENTER);
          p.textSize(20);
          p.text('Key-Value Grid - Dictionary Visualization', 400, 30);

          const dict = step.variables.dict || {};
          const entries = Object.entries(dict);
          const pairWidth = 200;
          const pairHeight = 80;
          const startX = 100;
          const startY = 100;

          entries.forEach(([key, value], index) => {
            const x = startX + (index % 3) * (pairWidth + 30);
            const y = startY + Math.floor(index / 3) * (pairHeight + 30);

            // Key box
            p.fill(55, 65, 81);
            p.stroke(139, 92, 246);
            p.strokeWeight(2);
            p.rect(x, y, pairWidth / 2 - 5, pairHeight, 8);

            // Value box
            p.fill(16, 185, 129);
            p.rect(x + pairWidth / 2 + 5, y, pairWidth / 2 - 5, pairHeight, 8);

            // Key text
            p.fill(243, 244, 246);
            p.textAlign(p.CENTER);
            p.textSize(14);
            p.text(String(key), x + (pairWidth / 2 - 5) / 2, y + pairHeight / 2 + 5);

            // Value text
            p.text(String(value), x + pairWidth / 2 + 5 + (pairWidth / 2 - 5) / 2, y + pairHeight / 2 + 5);

            // Hash indicator
            p.fill(156, 163, 175);
            p.textSize(10);
            p.text(`hash: ${Math.abs(key.toString().split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 100}`, 
                   x + pairWidth / 2, y + pairHeight + 15);
          });

          // Dictionary operations
          p.fill(139, 92, 246);
          p.textAlign(p.LEFT);
          p.textSize(14);
          p.text('Dictionary Operations:', 100, 400);
          
          const operations = ['get()', 'set()', 'del()', 'keys()'];
          operations.forEach((op, index) => {
            const isCurrentOp = step.highlight.includes(op.replace('()', ''));
            p.fill(isCurrentOp ? 16 : 107, isCurrentOp ? 185 : 114, isCurrentOp ? 129 : 128);
            p.text(op, 100 + index * 80, 425);
          });
        };
      };

      p5InstanceRef.current = new p5(sketch, canvasRef.current);
    }).catch(() => {
      renderCanvasFallback(step);
    });
  };

  const renderCanvasFallback = (step: VisualizationStep) => {
    if (!canvasRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 500;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear previous content
    canvasRef.current.innerHTML = '';
    canvasRef.current.appendChild(canvas);
    
    // Basic fallback visualization
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, 800, 500);
    
    ctx.fillStyle = '#f3f4f6';
    ctx.font = '20px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Code Visualization', 400, 50);
    
    ctx.font = '14px Inter';
    ctx.fillText(`Step ${currentStep + 1}: ${step.highlight}`, 400, 100);
    
    // Draw variables
    const variables = Object.entries(step.variables);
    variables.forEach(([name, value], index) => {
      const x = 100 + (index % 4) * 150;
      const y = 150 + Math.floor(index / 4) * 80;
      
      ctx.fillStyle = '#374151';
      ctx.fillRect(x, y, 120, 60);
      
      ctx.fillStyle = '#8b5cf6';
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, 120, 60);
      
      ctx.fillStyle = '#f3f4f6';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(name, x + 60, y + 25);
      ctx.fillText(String(value), x + 60, y + 45);
    });
  };

  const renderControlFlowVisualization = (step: VisualizationStep) => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 500;
    
    svg.attr('width', width).attr('height', height);

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f3f4f6')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .text('Code Trace Simulator - Control Flow');

    // Decision diamond
    const centerX = width / 2;
    const centerY = 150;
    const diamondSize = 80;

    // Diamond shape for condition
    const diamond = svg.append('path')
      .attr('d', `M ${centerX} ${centerY - diamondSize/2} 
                  L ${centerX + diamondSize/2} ${centerY} 
                  L ${centerX} ${centerY + diamondSize/2} 
                  L ${centerX - diamondSize/2} ${centerY} Z`)
      .attr('fill', '#8b5cf6')
      .attr('stroke', '#a855f7')
      .attr('stroke-width', 2);

    // Condition text
    svg.append('text')
      .attr('x', centerX)
      .attr('y', centerY + 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .text('Condition');

    // True path
    svg.append('rect')
      .attr('x', centerX + 100)
      .attr('y', centerY - 30)
      .attr('width', 120)
      .attr('height', 60)
      .attr('fill', '#10b981')
      .attr('stroke', '#059669')
      .attr('stroke-width', 2)
      .attr('rx', 8);

    svg.append('text')
      .attr('x', centerX + 160)
      .attr('y', centerY + 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '14px')
      .text('True Branch');

    // False path
    svg.append('rect')
      .attr('x', centerX - 220)
      .attr('y', centerY - 30)
      .attr('width', 120)
      .attr('height', 60)
      .attr('fill', '#ef4444')
      .attr('stroke', '#dc2626')
      .attr('stroke-width', 2)
      .attr('rx', 8);

    svg.append('text')
      .attr('x', centerX - 160)
      .attr('y', centerY + 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '14px')
      .text('False Branch');

    // Arrows
    svg.append('path')
      .attr('d', `M ${centerX + diamondSize/2} ${centerY} L ${centerX + 100} ${centerY}`)
      .attr('stroke', '#10b981')
      .attr('stroke-width', 3)
      .attr('marker-end', 'url(#arrowhead-green)');

    svg.append('path')
      .attr('d', `M ${centerX - diamondSize/2} ${centerY} L ${centerX - 100} ${centerY}`)
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 3)
      .attr('marker-end', 'url(#arrowhead-red)');

    // Arrow markers
    const defs = svg.append('defs');
    
    defs.append('marker')
      .attr('id', 'arrowhead-green')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 9)
      .attr('refY', 3)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,0 L0,6 L9,3 z')
      .attr('fill', '#10b981');

    defs.append('marker')
      .attr('id', 'arrowhead-red')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 9)
      .attr('refY', 3)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,0 L0,6 L9,3 z')
      .attr('fill', '#ef4444');

    // Current execution path highlight
    const isTrue = currentStep % 2 === 0;
    svg.append('circle')
      .attr('cx', isTrue ? centerX + 160 : centerX - 160)
      .attr('cy', centerY)
      .attr('r', 0)
      .attr('fill', '#fbbf24')
      .transition()
      .duration(500)
      .attr('r', 10);
  };

  const renderFileHandlingVisualization = (step: VisualizationStep) => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 500;
    
    svg.attr('width', width).attr('height', height);

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f3f4f6')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .text('Stream Visualizer - File Handling');

    // File representation
    const fileX = 100;
    const fileY = 100;
    const fileWidth = 200;
    const fileHeight = 300;

    svg.append('rect')
      .attr('x', fileX)
      .attr('y', fileY)
      .attr('width', fileWidth)
      .attr('height', fileHeight)
      .attr('fill', '#374151')
      .attr('stroke', '#8b5cf6')
      .attr('stroke-width', 2)
      .attr('rx', 8);

    // File content lines
    for (let i = 0; i < 10; i++) {
      const lineY = fileY + 30 + i * 25;
      const isCurrentLine = i === currentStep % 10;
      
      svg.append('rect')
        .attr('x', fileX + 10)
        .attr('y', lineY)
        .attr('width', fileWidth - 20)
        .attr('height', 20)
        .attr('fill', isCurrentLine ? '#8b5cf6' : '#4b5563')
        .attr('rx', 4);

      svg.append('text')
        .attr('x', fileX + 20)
        .attr('y', lineY + 15)
        .attr('fill', '#f3f4f6')
        .attr('font-size', '12px')
        .text(`Line ${i + 1}: Sample text data...`);
    }

    // File pointer
    const pointerY = fileY + 30 + (currentStep % 10) * 25 + 10;
    svg.append('polygon')
      .attr('points', `${fileX - 20},${pointerY} ${fileX - 5},${pointerY - 8} ${fileX - 5},${pointerY + 8}`)
      .attr('fill', '#10b981')
      .transition()
      .duration(300)
      .attr('points', `${fileX - 15},${pointerY} ${fileX},${pointerY - 8} ${fileX},${pointerY + 8}`);

    // Buffer visualization
    const bufferX = 400;
    const bufferY = 150;
    
    svg.append('rect')
      .attr('x', bufferX)
      .attr('y', bufferY)
      .attr('width', 300)
      .attr('height', 100)
      .attr('fill', '#1f2937')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2)
      .attr('rx', 8);

    svg.append('text')
      .attr('x', bufferX + 150)
      .attr('y', bufferY - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#10b981')
      .attr('font-size', '14px')
      .text('Memory Buffer');

    // Data flow animation
    svg.append('path')
      .attr('d', `M ${fileX + fileWidth} ${pointerY} Q ${(fileX + fileWidth + bufferX) / 2} ${pointerY - 50} ${bufferX} ${bufferY + 50}`)
      .attr('stroke', '#fbbf24')
      .attr('stroke-width', 3)
      .attr('fill', 'none')
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0)
      .transition()
      .duration(1000)
      .attr('opacity', 1);
  };

  const renderErrorHandlingVisualization = (step: VisualizationStep) => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 500;
    
    svg.attr('width', width).attr('height', height);

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f3f4f6')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .text('Debug Trail Replay - Error Handling');

    // Try block
    svg.append('rect')
      .attr('x', 100)
      .attr('y', 80)
      .attr('width', 250)
      .attr('height', 120)
      .attr('fill', '#065f46')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2)
      .attr('rx', 8);

    svg.append('text')
      .attr('x', 225)
      .attr('y', 100)
      .attr('text-anchor', 'middle')
      .attr('fill', '#10b981')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('TRY BLOCK');

    // Except block
    svg.append('rect')
      .attr('x', 450)
      .attr('y', 80)
      .attr('width', 250)
      .attr('height', 120)
      .attr('fill', '#7f1d1d')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .attr('rx', 8);

    svg.append('text')
      .attr('x', 575)
      .attr('y', 100)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ef4444')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('EXCEPT BLOCK');

    // Error path animation
    const hasError = step.highlight.includes('except') || currentStep > steps.length / 2;
    
    if (hasError) {
      // Error arrow
      svg.append('path')
        .attr('d', 'M 350 140 Q 400 100 450 140')
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 4)
        .attr('fill', 'none')
        .attr('marker-end', 'url(#error-arrow)')
        .attr('stroke-dasharray', '200')
        .attr('stroke-dashoffset', '200')
        .transition()
        .duration(1000)
        .attr('stroke-dashoffset', '0');

      // Error message
      svg.append('text')
        .attr('x', 400)
        .attr('y', 90)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ef4444')
        .attr('font-size', '12px')
        .attr('opacity', 0)
        .transition()
        .delay(500)
        .duration(500)
        .attr('opacity', 1)
        .text('Exception Caught!');
    }

    // Stack trace
    svg.append('rect')
      .attr('x', 200)
      .attr('y', 250)
      .attr('width', 400)
      .attr('height', 200)
      .attr('fill', '#1f2937')
      .attr('stroke', '#6b7280')
      .attr('stroke-width', 1)
      .attr('rx', 8);

    svg.append('text')
      .attr('x', 400)
      .attr('y', 275)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9ca3af')
      .attr('font-size', '14px')
      .text('Stack Trace:');

    const traceLines = [
      'File "main.py", line 10, in <module>',
      '  result = divide(10, 0)',
      'File "main.py", line 5, in divide',
      '  return a / b',
      'ZeroDivisionError: division by zero'
    ];

    traceLines.forEach((line, index) => {
      svg.append('text')
        .attr('x', 220)
        .attr('y', 300 + index * 20)
        .attr('fill', index === traceLines.length - 1 ? '#ef4444' : '#e5e7eb')
        .attr('font-size', '11px')
        .attr('font-family', 'monospace')
        .attr('opacity', 0)
        .transition()
        .delay(1000 + index * 200)
        .duration(300)
        .attr('opacity', 1)
        .text(line);
    });

    // Arrow marker for error
    svg.append('defs')
      .append('marker')
      .attr('id', 'error-arrow')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 9)
      .attr('refY', 3)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,0 L0,6 L9,3 z')
      .attr('fill', '#ef4444');
  };

  const renderModulesVisualization = (step: VisualizationStep) => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 500;
    
    svg.attr('width', width).attr('height', height);

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f3f4f6')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .text('Import Flow Tree - Modules & Packages');

    // Main module
    const mainModule = svg.append('g')
      .attr('transform', 'translate(350, 80)');

    mainModule.append('rect')
      .attr('width', 100)
      .attr('height', 60)
      .attr('fill', '#8b5cf6')
      .attr('stroke', '#a855f7')
      .attr('stroke-width', 2)
      .attr('rx', 8);

    mainModule.append('text')
      .attr('x', 50)
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '14px')
      .text('main.py');

    // Imported modules
    const modules = [
      { name: 'os', x: 150, y: 200, color: '#10b981' },
      { name: 'sys', x: 300, y: 250, color: '#f59e0b' },
      { name: 'json', x: 450, y: 250, color: '#ef4444' },
      { name: 'requests', x: 600, y: 200, color: '#06b6d4' }
    ];

    modules.forEach((module, index) => {
      const moduleGroup = svg.append('g')
        .attr('transform', `translate(${module.x}, ${module.y})`);

      // Module box
      moduleGroup.append('rect')
        .attr('width', 80)
        .attr('height', 50)
        .attr('fill', module.color)
        .attr('stroke', module.color)
        .attr('stroke-width', 2)
        .attr('rx', 6)
        .attr('opacity', 0)
        .transition()
        .delay(index * 300)
        .duration(500)
        .attr('opacity', 1);

      // Module name
      moduleGroup.append('text')
        .attr('x', 40)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-size', '12px')
        .attr('opacity', 0)
        .transition()
        .delay(index * 300 + 200)
        .duration(300)
        .attr('opacity', 1)
        .text(module.name);

      // Connection line
      svg.append('path')
        .attr('d', `M 400 140 Q ${(400 + module.x + 40) / 2} ${(140 + module.y + 25) / 2} ${module.x + 40} ${module.y}`)
        .attr('stroke', module.color)
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('stroke-dasharray', '100')
        .attr('stroke-dashoffset', '100')
        .transition()
        .delay(index * 300)
        .duration(800)
        .attr('stroke-dashoffset', '0');
    });

    // Import statements
    const imports = [
      'import os',
      'import sys',
      'import json',
      'import requests'
    ];

    svg.append('rect')
      .attr('x', 50)
      .attr('y', 350)
      .attr('width', 700)
      .attr('height', 120)
      .attr('fill', '#1f2937')
      .attr('stroke', '#374151')
      .attr('stroke-width', 1)
      .attr('rx', 8);

    svg.append('text')
      .attr('x', 400)
      .attr('y', 375)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9ca3af')
      .attr('font-size', '14px')
      .text('Import Statements:');

    imports.forEach((imp, index) => {
      svg.append('text')
        .attr('x', 70)
        .attr('y', 400 + index * 20)
        .attr('fill', '#10b981')
        .attr('font-size', '12px')
        .attr('font-family', 'monospace')
        .attr('opacity', 0)
        .transition()
        .delay(1500 + index * 200)
        .duration(300)
        .attr('opacity', 1)
        .text(imp);
    });
  };

  const playVisualization = () => {
    setIsPlaying(true);
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 2500);
  };

  const pauseVisualization = () => {
    setIsPlaying(false);
  };

  const resetVisualization = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const getVisualizationTitle = () => {
    const titles: Record<string, string> = {
      variables: '🧠 Variables & Data Types - Memory Cell Diagram',
      loops: '🔄 Loops - Step-by-Step Animator',
      functions: '📚 Functions & Scope - Call Stack Visualizer',
      arrays: '📊 Arrays & Lists - Interactive Memory Layout',
      dictionaries: '🗂️ Dictionaries - Key-Value Grid',
      control_flow: '🔀 Control Flow - Code Trace Simulator',
      file_handling: '📁 File Handling - Stream Visualizer',
      error_handling: '🚨 Error Handling - Debug Trail Replay',
      modules: '📦 Modules & Packages - Import Flow Tree'
    };
    return titles[visualizationType] || '🧠 Code Visualization';
  };

  const getToolsUsed = () => {
    const tools: Record<string, string[]> = {
      variables: ['p5.js', 'Canvas API', 'Memory Animation'],
      loops: ['p5.js', 'Canvas API', 'Framer Motion'],
      functions: ['D3.js', 'SVG', 'Dagre.js Layout'],
      arrays: ['p5.js', 'Canvas API', 'Interactive Animation'],
      dictionaries: ['p5.js', 'Canvas API', 'Hash Visualization'],
      control_flow: ['D3.js', 'SVG', 'Path Animation'],
      file_handling: ['D3.js', 'SVG', 'Stream Animation'],
      error_handling: ['D3.js', 'SVG', 'Timeline UI'],
      modules: ['D3.js', 'SVG', 'Tree Layout']
    };
    return tools[visualizationType] || ['Canvas', 'SVG'];
  };

  if (isAnalyzing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl ai-glow">
              <Brain className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold gradient-text mb-4">AI Analyzing Your Code</h2>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-400 border-t-transparent"></div>
            <span className="text-gray-300">Detecting visualization patterns...</span>
          </div>
          <p className="text-gray-400">
            Preparing the perfect visualization for your code structure
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg ai-glow">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold gradient-text">{getVisualizationTitle()}</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Code className="h-4 w-4" />
                  <span>Tools: {getToolsUsed().join(', ')}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex h-[calc(95vh-120px)]">
          {/* Visualization Panel */}
          <div className="flex-1 p-6">
            <div className="bg-gray-900 rounded-lg p-4 h-full relative overflow-hidden">
              {/* Canvas for p5.js visualizations */}
              <div ref={canvasRef} className="absolute inset-0"></div>
              
              {/* SVG for D3.js visualizations */}
              <svg ref={svgRef} className="absolute inset-0 w-full h-full"></svg>
              
              {/* Visualization type indicator */}
              <div className="absolute top-4 right-4 bg-black bg-opacity-50 px-3 py-1 rounded-full">
                <span className="text-purple-400 text-sm font-medium">
                  {visualizationType.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="w-80 border-l border-gray-700 p-6 overflow-y-auto">
            {/* Controls */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Zap className="h-5 w-5 text-purple-400" />
                <span>AI Visual Controls</span>
              </h3>
              
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={isPlaying ? pauseVisualization : playVisualization}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                
                <button
                  onClick={nextStep}
                  disabled={currentStep >= steps.length - 1}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
                
                <button
                  onClick={resetVisualization}
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Step {currentStep + 1} of {steps.length}</span>
                  <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Current Step Info */}
            {steps.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Current Execution</h3>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-300 mb-2">Line {steps[currentStep]?.line}</div>
                  <div className="text-white font-mono text-sm bg-gray-800 p-2 rounded mb-2">
                    {steps[currentStep]?.highlight}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {steps[currentStep]?.description}
                  </div>
                </div>
              </div>
            )}

            {/* AI Narration */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">AI Explanation</h3>
                <Volume2 className="h-4 w-4 text-gray-400" />
              </div>
              
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 bg-opacity-20 rounded-lg p-4 border border-purple-500 border-opacity-30">
                {isLoadingNarration ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent"></div>
                    <span className="text-gray-300">AI is analyzing...</span>
                  </div>
                ) : (
                  <p className="text-gray-200 text-sm leading-relaxed">{aiNarration}</p>
                )}
              </div>
            </div>

            {/* Variables */}
            {steps.length > 0 && Object.keys(steps[currentStep]?.variables || {}).length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Variables</h3>
                <div className="space-y-2">
                  {Object.entries(steps[currentStep]?.variables || {}).map(([name, value]) => (
                    <div key={name} className="flex justify-between items-center bg-gray-700 rounded p-2">
                      <span className="text-gray-300 font-mono text-sm">{name}</span>
                      <span className="text-green-400 font-mono text-sm">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Stack Used */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Tech Stack</h3>
              <div className="space-y-2">
                {getToolsUsed().map((tool, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-gray-700 rounded p-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">{tool}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VisualizationCanvas;