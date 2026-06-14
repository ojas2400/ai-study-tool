import { useState } from 'react';
import NotesInput from './components/NotesInput';
import FlashcardMode from './components/FlashcardMode';
import QuizMode from './components/QuizMode';
import SummaryView from './components/SummaryView';

export default function App() {
  const [view, setView] = useState('input');
  const [notesText, setNotesText] = useState('');

  const handleFlashcards = (text) => {
    setNotesText(text);
    setView('flashcards');
  };

  const handleQuiz = (text) => {
    setNotesText(text);
    setView('quiz');
  };

  const handleSummary = (text) => {
    setNotesText(text);
    setView('summary');
  };

  const handleBack = () => setView('input');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16 transition-all duration-300">
        {view === 'input' && (
          <NotesInput
            initialText={notesText}
            onFlashcards={handleFlashcards}
            onQuiz={handleQuiz}
            onSummary={handleSummary}
          />
        )}

        {view === 'flashcards' && (
          <FlashcardMode initialText={notesText} onBack={handleBack} />
        )}

        {view === 'quiz' && (
          <QuizMode initialText={notesText} onBack={handleBack} />
        )}

        {view === 'summary' && (
          <SummaryView initialText={notesText} onBack={handleBack} />
        )}
      </div>
    </div>
  );
}
