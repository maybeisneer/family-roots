'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

interface Question {
  id: string;
  text: string;
  enabled: boolean;
  isCustom: boolean;
}

interface QuestionEditorProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
}

export function QuestionEditor({ questions, onQuestionsChange }: QuestionEditorProps) {
  const [newQuestion, setNewQuestion] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const toggleQuestion = (id: string) => {
    onQuestionsChange(
      questions.map(q => q.id === id ? { ...q, enabled: !q.enabled } : q)
    );
  };

  const removeQuestion = (id: string) => {
    onQuestionsChange(questions.filter(q => q.id !== id));
  };

  const startEditing = (question: Question) => {
    setEditingId(question.id);
    setEditText(question.text);
  };

  const saveEdit = () => {
    if (!editText.trim() || !editingId) return;
    onQuestionsChange(
      questions.map(q => q.id === editingId ? { ...q, text: editText.trim() } : q)
    );
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const addCustomQuestion = () => {
    if (!newQuestion.trim()) return;
    
    const question: Question = {
      id: `custom-${Date.now()}`,
      text: newQuestion.trim(),
      enabled: true,
      isCustom: true,
    };
    
    onQuestionsChange([...questions, question]);
    setNewQuestion('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <Reorder.Group 
        axis="y" 
        values={questions} 
        onReorder={onQuestionsChange}
        className="space-y-3"
      >
        <AnimatePresence>
          {questions.map((question) => (
            <Reorder.Item
              key={question.id}
              value={question}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className={`
                group flex items-start gap-3 p-4 rounded-xl cursor-grab active:cursor-grabbing
                transition-colors duration-200
                ${question.enabled 
                  ? 'bg-stone-800/50 border border-stone-700' 
                  : 'bg-stone-900/30 border border-stone-800/50 opacity-60'
                }
              `}
            >
              {/* Drag handle */}
              <div className="flex-shrink-0 mt-1 text-stone-600 group-hover:text-stone-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>

              {/* Checkbox */}
              <button
                onClick={() => toggleQuestion(question.id)}
                className={`
                  flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 transition-all duration-200
                  ${question.enabled 
                    ? 'bg-amber-500 border-amber-500' 
                    : 'border-stone-600 hover:border-stone-500'
                  }
                `}
              >
                {question.enabled && (
                  <svg className="w-full h-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {/* Question text - editable */}
              {editingId === question.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="flex-1 px-2 py-1 bg-stone-900 border border-amber-500/50 rounded text-sm text-stone-200 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={saveEdit}
                    className="p-1 text-emerald-500 hover:text-emerald-400"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1 text-stone-500 hover:text-stone-400"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <p 
                  className={`
                    flex-1 text-sm leading-relaxed cursor-pointer hover:text-amber-300 transition-colors
                    ${question.enabled ? 'text-stone-200' : 'text-stone-500'}
                  `}
                  onClick={() => startEditing(question)}
                  title="Click to edit"
                >
                  {question.text}
                  {question.isCustom && (
                    <span className="ml-2 text-xs text-amber-500/70">(custom)</span>
                  )}
                </p>
              )}

              {/* Edit & Delete buttons */}
              {editingId !== question.id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEditing(question)}
                    className="flex-shrink-0 p-1 text-stone-600 hover:text-amber-400 transition-colors"
                    title="Edit question"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeQuestion(question.id)}
                    className="flex-shrink-0 p-1 text-stone-600 hover:text-red-400 transition-colors"
                    title="Remove question"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {/* Add custom question */}
      <AnimatePresence>
        {isAdding ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-stone-800/30 border border-stone-700 rounded-xl space-y-3">
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Type your custom question..."
                className="w-full px-3 py-2 bg-stone-900/50 border border-stone-700 rounded-lg text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewQuestion('');
                  }}
                  className="px-3 py-1.5 text-sm text-stone-400 hover:text-stone-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addCustomQuestion}
                  disabled={!newQuestion.trim()}
                  className="px-4 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Add Question
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsAdding(true)}
            className="w-full py-3 border-2 border-dashed border-stone-700 rounded-xl text-stone-500 hover:text-amber-500 hover:border-amber-500/50 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add your own question
          </motion.button>
        )}
      </AnimatePresence>

      {/* Tip */}
      <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <span className="text-amber-500">💡</span>
        <p className="text-sm text-amber-200/80">
          These are starting points. The AI will ask follow-up questions based on their answers to dig deeper into their stories.
        </p>
      </div>
    </div>
  );
}

