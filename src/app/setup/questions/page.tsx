'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { StepIndicator, SETUP_STEPS } from '@/components/setup/StepIndicator';
import { QuestionEditor } from '@/components/setup/QuestionEditor';
import { getStarterQuestions, LANGUAGES } from '@/lib/questions';
import { getSetupState, setSetupState } from '@/lib/storage';

interface Question {
  id: string;
  text: string;
  enabled: boolean;
  isCustom: boolean;
}

export default function SetupStep4() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [birthplace, setBirthplace] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [language, setLanguage] = useState('en');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const state = getSetupState();
    setName(state.interviewee_name);
    setRelationship(state.relationship);
    setBirthplace(state.birthplace);
    setCurrentLocation(state.current_location);
    setLanguage(state.language);

    // Generate initial questions based on context
    const generateQuestions = async () => {
      console.warn('🔍 DEBUG: Generating questions with context:', state.context);

      try {
        const response = await fetch('/api/suggest-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: state.interviewee_name,
            relationship: state.relationship,
            birthplace: state.birthplace,
            current_location: state.current_location,
            language: state.language,
            context: state.context,
            _t: Date.now() // Force fresh request
          }),
        });

        if (response.ok) {
          const { questions: aiQuestions } = await response.json();
          console.warn('✅ DEBUG: Received questions:', aiQuestions);
          setQuestions(aiQuestions.map((q: string, i: number) => ({
            id: `q-${i}`,
            text: q,
            enabled: true,
            isCustom: false,
          })));
        } else {
          const errorText = await response.text();
          console.error('❌ API error:', response.status, errorText);
          throw new Error('API failed');
        }
      } catch (error) {
        console.error('❌ Failed to generate AI questions:', error);
        console.log('📋 Using fallback questions instead');
        // Fallback to starter questions
        const starterQuestions = getStarterQuestions(state.relationship, state.birthplace, state.current_location);
        setQuestions(starterQuestions.map((q, i) => ({
          id: `q-${i}`,
          text: q,
          enabled: true,
          isCustom: false,
        })));
      }
      
      setIsLoading(false);
    };

    generateQuestions();
  }, []);

  const handleNext = () => {
    // Save enabled questions to storage
    const enabledQuestions = questions
      .filter(q => q.enabled)
      .map((q, i) => ({
        id: q.id,
        interview_id: '',
        question_text: q.text,
        priority_order: i,
        is_custom: q.isCustom,
        was_asked: false,
      }));
    
    setSetupState({ suggested_questions: enabledQuestions });
    router.push('/setup/your-name');
  };

  const handleBack = () => {
    router.push('/setup/context');
  };

  const languageName = LANGUAGES.find(l => l.code === language)?.name || 'English';

  return (
    <div className="space-y-8">
      <StepIndicator steps={SETUP_STEPS} currentStep={5} />

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-serif text-white">
          Questions for {name || 'the interview'}
        </h1>
        <p className="text-stone-500">
          Based on: {birthplace || 'their birthplace'} • {languageName} • Your {relationship || 'family member'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full"
          />
          <p className="text-stone-400">Generating thoughtful questions...</p>
        </div>
      ) : (
        <QuestionEditor
          questions={questions}
          onQuestionsChange={setQuestions}
        />
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={handleBack}
          className="px-6 py-3 text-stone-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          disabled={isLoading || questions.filter(q => q.enabled).length === 0}
          className="px-8 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue →
        </motion.button>
      </div>
    </div>
  );
}
