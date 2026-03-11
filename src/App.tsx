/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  X, 
  Loader2, 
  ChevronRight, 
  Presentation, 
  FileCheck, 
  Sparkles,
  Layout,
  Palette,
  Download,
  ArrowLeft,
  Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { analyzePDFs, type AnalysisResult } from './services/ai';

type AppState = 'upload' | 'analyzing' | 'result' | 'presentation';

interface PresentationTheme {
  id: string;
  name: string;
  bg: string;
  text: string;
  accent: string;
  card: string;
}

const THEMES: PresentationTheme[] = [
  { id: 'modern', name: 'Modern Dark', bg: 'bg-zinc-950', text: 'text-zinc-100', accent: 'bg-indigo-500', card: 'bg-zinc-900' },
  { id: 'minimal', name: 'Minimal Light', bg: 'bg-white', text: 'text-zinc-900', accent: 'bg-zinc-900', card: 'bg-zinc-50' },
  { id: 'ocean', name: 'Deep Ocean', bg: 'bg-slate-900', text: 'text-slate-100', accent: 'bg-cyan-500', card: 'bg-slate-800' },
  { id: 'forest', name: 'Organic Forest', bg: 'bg-stone-900', text: 'text-stone-100', accent: 'bg-emerald-600', card: 'bg-stone-800' },
  { id: 'luxury', name: 'Luxury Gold', bg: 'bg-neutral-950', text: 'text-neutral-100', accent: 'bg-amber-500', card: 'bg-neutral-900' },
];

export default function App() {
  const [state, setState] = useState<AppState>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [currentTheme, setCurrentTheme] = useState<PresentationTheme>(THEMES[0]);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'zh-TW'>('zh-TW');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => {
      const combined = [...prev, ...acceptedFiles];
      return combined.slice(0, 5); // Limit to 5 files
    });
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 5,
    multiple: true
  } as any);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;
    
    setState('analyzing');
    setError(null);

    try {
      const fileData = await Promise.all(
        files.map(async (file) => {
          return new Promise<{ name: string; data: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ name: file.name, data: reader.result as string });
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      const result = await analyzePDFs(fileData, language);
      setAnalysis(result);
      setState('result');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setState('upload');
    }
  };

  const reset = () => {
    setFiles([]);
    setAnalysis(null);
    setState('upload');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">PDF Insight Pro</span>
          </div>
          
          {state !== 'upload' && (
            <button 
              onClick={reset}
              className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Start Over
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {state === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
                  Analyze your PDFs with <span className="text-indigo-600">AI Precision</span>
                </h1>
                <p className="text-lg text-zinc-600">
                  Upload up to 5 documents to extract key insights, summaries, and generate professional presentations instantly.
                </p>
              </div>

              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-3xl p-12 transition-all cursor-pointer flex flex-col items-center justify-center gap-4",
                  isDragActive ? "border-indigo-500 bg-indigo-50" : "border-zinc-200 hover:border-zinc-300 bg-white"
                )}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center">
                  <Upload className="w-8 h-8 text-zinc-400" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg">Click or drag PDF files here</p>
                  <p className="text-zinc-500 text-sm">Support for up to 5 files, max 10MB each</p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      Uploaded Files ({files.length}/5)
                    </h3>
                  </div>
                  
                  {/* Language Selection */}
                  <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                      <Languages className="w-4 h-4 text-indigo-500" />
                      Output Language
                    </div>
                    <div className="flex bg-zinc-100 p-1 rounded-xl">
                      <button
                        onClick={() => setLanguage('zh-TW')}
                        className={cn(
                          "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                          language === 'zh-TW' ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                        )}
                      >
                        繁體中文
                      </button>
                      <button
                        onClick={() => setLanguage('en')}
                        className={cn(
                          "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                          language === 'en' ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                        )}
                      >
                        English
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                            <FileText className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm truncate max-w-[200px] sm:max-w-md">{file.name}</p>
                            <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFile(idx)}
                          className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleAnalyze}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Analyze Documents
                  </button>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium">
                  {error}
                </div>
              )}
            </motion.div>
          )}

          {state === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-6"
            >
              <div className="relative">
                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">AI is reading your documents...</h2>
                <p className="text-zinc-500">Extracting key points and generating insights. This may take a moment.</p>
              </div>
            </motion.div>
          )}

          {state === 'result' && analysis && (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">
                      <FileCheck className="w-3 h-3" />
                      Analysis Complete
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">{analysis.title}</h1>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Layout className="w-5 h-5 text-indigo-600" />
                      Executive Summary
                    </h3>
                    <p className="text-zinc-600 leading-relaxed text-lg">
                      {analysis.summary}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <ChevronRight className="w-5 h-5 text-indigo-600" />
                        Key Points
                      </h3>
                      <ul className="space-y-3">
                        {analysis.keyPoints.map((point, i) => (
                          <li key={i} className="flex gap-3 text-zinc-600">
                            <span className="flex-shrink-0 w-6 h-6 bg-zinc-100 rounded-full flex items-center justify-center text-xs font-bold text-zinc-500">
                              {i + 1}
                            </span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        Extended Insights
                      </h3>
                      <ul className="space-y-3">
                        {analysis.extendedInsights.map((insight, i) => (
                          <li key={i} className="flex gap-3 text-zinc-600 italic">
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 space-y-6">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Presentation className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Create Presentation</h2>
                    <p className="text-indigo-100 text-sm">
                      We've drafted {analysis.suggestedSlides.length} slides based on your analysis. Customize the theme and present your findings.
                    </p>
                  </div>
                  <button
                    onClick={() => setState('presentation')}
                    className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                  >
                    Generate Slides
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm">
                  <h3 className="font-bold mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-between p-3 hover:bg-zinc-50 rounded-xl transition-colors text-sm font-medium">
                      <span className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-zinc-400" />
                        Export as PDF Report
                      </span>
                    </button>
                    <button className="w-full flex items-center justify-between p-3 hover:bg-zinc-50 rounded-xl transition-colors text-sm font-medium">
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-zinc-400" />
                        Copy Summary
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {state === 'presentation' && analysis && (
            <motion.div
              key="presentation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Presentation Designer</h1>
                  <p className="text-zinc-500">Customize the look and feel of your generated slides.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setState('result')}
                    className="px-4 py-2 text-sm font-medium hover:bg-zinc-100 rounded-xl transition-colors"
                  >
                    Back to Analysis
                  </button>
                  <button className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Slides
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Theme Selector */}
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4">
                    <h3 className="font-bold flex items-center gap-2">
                      <Palette className="w-4 h-4 text-indigo-600" />
                      Select Theme
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {THEMES.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setCurrentTheme(theme)}
                          className={cn(
                            "w-full p-3 rounded-xl border-2 transition-all text-left flex items-center justify-between",
                            currentTheme.id === theme.id 
                              ? "border-indigo-600 bg-indigo-50" 
                              : "border-transparent hover:bg-zinc-50"
                          )}
                        >
                          <span className="text-sm font-medium">{theme.name}</span>
                          <div className={cn("w-4 h-4 rounded-full", theme.bg)} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Slides Preview */}
                <div className="lg:col-span-3 space-y-8">
                  <div className="grid gap-8">
                    {analysis.suggestedSlides.map((slide, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={cn(
                          "aspect-video rounded-[2rem] p-12 shadow-2xl flex flex-col justify-center relative overflow-hidden",
                          currentTheme.bg,
                          currentTheme.text
                        )}
                      >
                        {/* Decorative elements */}
                        <div className={cn("absolute top-0 right-0 w-64 h-64 opacity-10 rounded-full -mr-20 -mt-20", currentTheme.accent)} />
                        <div className={cn("absolute bottom-0 left-0 w-32 h-32 opacity-10 rounded-full -ml-10 -mb-10", currentTheme.accent)} />
                        
                        <div className="relative z-10 space-y-8">
                          <div className="space-y-2">
                            <span className={cn("text-xs font-bold uppercase tracking-[0.2em] opacity-50")}>
                              Slide {idx + 1}
                            </span>
                            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                              {slide.title}
                            </h2>
                          </div>
                          
                          <ul className="space-y-4">
                            {slide.content.map((item, i) => (
                              <li key={i} className="flex items-start gap-4 text-xl opacity-80">
                                <div className={cn("w-2 h-2 rounded-full mt-3 flex-shrink-0", currentTheme.accent)} />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-zinc-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Powered by Gemini AI</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-zinc-500">
            <a href="#" className="hover:text-zinc-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
