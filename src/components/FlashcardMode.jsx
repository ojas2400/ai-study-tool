import { useEffect, useState } from 'react';
import { Check, RotateCcw, Trophy } from 'lucide-react';
import { useFlashcards } from '../hooks/useFlashcards';
import { LABEL_CLASS } from '../libs/theme.js';
import ErrorBanner from './ErrorBanner';
import ProgressBar from './ProgressBar';
import Loader from './Loader';

function Stat({ value, label }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xl font-semibold">{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
        {label}
      </p>
    </div>
  );
}

export default function FlashcardMode({ initialText, onBack }) {
  const {
    cards,
    currentIndex,
    flipped,
    known,
    loading,
    error,
    isComplete,
    loadCards,
    loadReviewCards,
    flip,
    markKnown,
    markReview,
    setError,
  } = useFlashcards();

  const [sessionKnown, setSessionKnown] = useState(0);
  const [totalCards, setTotalCards] = useState(0);

  useEffect(() => {
    if (initialText) loadCards(initialText);
  }, [initialText, loadCards]);

  useEffect(() => {
    if (isComplete && sessionKnown === 0 && cards.length > 0) {
      setSessionKnown(known.size);
      setTotalCards(cards.length);
    }
  }, [isComplete, sessionKnown, known.size, cards.length]);

  const handleReviewMissed = () => {
    setSessionKnown(known.size);
    setTotalCards(cards.length);
    loadReviewCards();
    setSessionKnown(0);
  };

  if (loading) {
    return <Loader label="Generating flashcards…" />;
  }

  if (isComplete) {
    const knownCount = sessionKnown || known.size;
    const reviewCount = (totalCards || cards.length) - knownCount;

    return (
      <div className="flex flex-col gap-6">
        <button
          type="button"
          onClick={onBack}
          className="self-start text-sm text-white/50 transition-colors hover:text-white"
        >
          ← Back to Notes
        </button>

        <div className="flex flex-col items-center gap-6 py-10 text-center">
          <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
            <Trophy className="h-7 w-7 text-violet-400" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">You&apos;re done!</h2>
            <p className="mt-1 text-sm text-white/50">
              You reviewed all {totalCards || cards.length} cards.
            </p>
          </div>
          <div className="grid w-full max-w-sm grid-cols-2 gap-3">
            <Stat value={`${knownCount}`} label="Known" />
            <Stat value={`${reviewCount}`} label="To review" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            {reviewCount > 0 && (
              <button
                type="button"
                onClick={handleReviewMissed}
                className="flex-1 rounded-md border border-orange-500/30 bg-orange-500/10 py-3 text-sm font-medium text-orange-200 transition-colors hover:bg-orange-500/20 active:scale-[0.98]"
              >
                Review Missed
              </button>
            )}
            <button
              type="button"
              onClick={() => loadCards(initialText)}
              className="flex-1 rounded-md bg-violet-600 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-500 active:scale-[0.98]"
            >
              Start Over
            </button>
            <button
              type="button"
              onClick={onBack}
              className="flex-1 rounded-md border border-white/15 bg-white/5 py-3 text-sm font-medium transition-colors hover:bg-white/10 active:scale-[0.98]"
            >
              Back to Notes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  if (!currentCard) {
    return (
      <div className="flex flex-col gap-6">
        <button
          type="button"
          onClick={onBack}
          className="self-start text-sm text-white/50 transition-colors hover:text-white"
        >
          ← Back to Notes
        </button>
        <ErrorBanner
          error={error || 'No flashcards generated'}
          onDismiss={() => setError(null)}
          onRetry={() => loadCards(initialText)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onBack}
        className="self-start text-sm text-white/50 transition-colors hover:text-white"
      >
        ← Back to Notes
      </button>

      <ErrorBanner
        error={error}
        onDismiss={() => setError(null)}
        onRetry={() => loadCards(initialText)}
      />

      <ProgressBar
        current={currentIndex + 1}
        total={cards.length}
        known={known.size}
      />

      <button
        type="button"
        onClick={flip}
        aria-label="Flip card"
        className="relative flex min-h-64 w-full flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-8 text-center backdrop-blur-xl transition-all hover:border-white/20 active:scale-[0.99]"
        style={{ perspective: '1000px' }}
      >
        <span className={LABEL_CLASS}>{flipped ? 'Answer' : 'Question'}</span>
        <p
          className={`text-balance max-w-lg ${
            flipped
              ? 'text-lg font-normal text-violet-200'
              : 'text-xl font-semibold sm:text-2xl'
          }`}
        >
          {flipped ? currentCard.answer : currentCard.question}
        </p>
        <span className="absolute bottom-4 font-mono text-[10px] uppercase tracking-widest text-white/30">
          {flipped ? 'Tap to see question' : 'Click to flip'}
        </span>
      </button>

      {flipped && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={markReview}
            className="flex items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 py-3 text-sm font-medium transition-colors hover:bg-white/10 active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            ↩ Review Again
          </button>
          <button
            type="button"
            onClick={markKnown}
            className="flex items-center justify-center gap-2 rounded-md bg-emerald-600 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-500 active:scale-[0.98]"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            ✓ Got it
          </button>
        </div>
      )}
    </div>
  );
}
