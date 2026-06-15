import { useEffect } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useQuiz } from '../hooks/useQuiz';
import { LABEL_CLASS } from '../libs/theme.js';
import ErrorBanner from './ErrorBanner';
import Loader from './Loader';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

function getScoreColor(score, total) {
  const pct = total > 0 ? score / total : 0;
  if (pct >= 0.7) return 'border-emerald-500/50 text-emerald-400';
  if (pct >= 0.5) return 'border-yellow-500/50 text-yellow-400';
  return 'border-red-500/50 text-red-400';
}

function getScoreMessage(score, total) {
  const pct = total > 0 ? score / total : 0;
  if (pct >= 0.7) return 'Excellent!';
  if (pct >= 0.5) return 'Good job!';
  return 'Keep studying!';
}

export default function QuizMode({ initialText, onBack }) {
  const {
    questions,
    currentIndex,
    selectedAnswer,
    answers,
    loading,
    error,
    submitted,
    score,
    isComplete,
    loadQuiz,
    selectAnswer,
    next,
    setError,
  } = useQuiz();

  useEffect(() => {
    if (initialText) loadQuiz(initialText);
  }, [initialText, loadQuiz]);

  if (loading) {
    return <Loader label="Generating quiz…" />;
  }

  if (isComplete) {
    const total = questions.length;
    const scoreColor = getScoreColor(score, total);

    return (
      <div className="flex flex-col gap-6">
        <button
          type="button"
          onClick={onBack}
          className="self-start text-sm text-white/50 transition-colors hover:text-white"
        >
          ← Back to Notes
        </button>

        <div className="flex flex-col items-center gap-6 py-6 text-center">
          <div
            className={`flex h-32 w-32 items-center justify-center rounded-full border-4 ${scoreColor}`}
          >
            <span className="text-3xl font-bold">
              {score}/{total}
            </span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {getScoreMessage(score, total)}
          </h2>
        </div>

        <ul className="flex flex-col gap-3">
          {questions.map((q, i) => {
            const answer = answers[i];
            const isCorrect = answer?.selected === answer?.correct;

            return (
              <li
                key={i}
                className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <span className={isCorrect ? 'text-emerald-400' : 'text-red-400'}>
                  {isCorrect ? '✓' : '✗'}
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm text-white/80">{q.question}</p>
                  {!isCorrect && (
                    <p className="mt-1 text-xs text-white/40">
                      Correct: {q.options[q.correct]}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => loadQuiz(initialText)}
            className="flex-1 rounded-md bg-violet-600 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-500 active:scale-[0.98]"
          >
            Try Again
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
    );
  }

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
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
          error={error || 'No quiz questions generated'}
          onDismiss={() => setError(null)}
          onRetry={() => loadQuiz(initialText)}
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
        onRetry={() => loadQuiz(initialText)}
      />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className={LABEL_CLASS}>
            Question {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i < currentIndex
                  ? 'bg-violet-500'
                  : i === currentIndex
                    ? 'bg-violet-500/60'
                    : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      <h2 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
        {currentQuestion.question}
      </h2>

      <div className="flex flex-col gap-3">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = index === currentQuestion.correct;
          const letter = OPTION_LABELS[index];

          let optionClass =
            'flex items-center justify-between rounded-lg border px-4 py-3.5 text-sm transition-colors ';

          if (submitted) {
            if (isCorrect) {
              optionClass +=
                'border-emerald-500/50 bg-emerald-500/10 text-emerald-200';
            } else if (isSelected) {
              optionClass += 'border-red-500/50 bg-red-500/10 text-red-200';
            } else {
              optionClass += 'border-white/10 bg-white/[0.03] text-white/50';
            }
          } else {
            optionClass +=
              'cursor-pointer border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:bg-white/[0.06]';
          }

          return (
            <button
              key={index}
              type="button"
              disabled={submitted}
              onClick={() => selectAnswer(index)}
              className={optionClass}
            >
              <span className="flex items-center gap-3 text-left">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono text-[11px] uppercase ${
                    submitted && isCorrect
                      ? 'border-emerald-500/50 text-emerald-300'
                      : submitted && isSelected
                        ? 'border-red-500/50 text-red-300'
                        : 'border-white/15 text-white/40'
                  }`}
                >
                  {letter}
                </span>
                {option}
              </span>
              {submitted && isCorrect && (
                <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              {submitted && isSelected && !isCorrect && (
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest">
                  ✗
                </span>
              )}
            </button>
          );
        })}
      </div>

      {submitted && currentIndex < questions.length - 1 && (
        <button
          type="button"
          onClick={next}
          className="ml-auto flex w-full items-center justify-center gap-2 rounded-md bg-violet-600 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-violet-500 active:scale-[0.98] sm:w-auto"
        >
          Next <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
