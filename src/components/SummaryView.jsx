import { useEffect, useState } from 'react';
import { Check, Copy, Sparkles } from 'lucide-react';
import { useSummary } from '../hooks/useSummary';
import { LABEL_CLASS } from '../libs/theme.js';
import ErrorBanner from './ErrorBanner';

function SkeletonLoader() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <div className="flex items-center gap-2 text-violet-400">
        <Sparkles className="h-4 w-4 animate-pulse" aria-hidden="true" />
        <span className={LABEL_CLASS}>Generating summary…</span>
      </div>
      {[90, 75, 60].map((w, i) => (
        <div
          key={i}
          className="h-3 animate-pulse rounded bg-white/10"
          style={{ width: `${w}%` }}
        />
      ))}
    </div>
  );
}

export default function SummaryView({ initialText, onBack }) {
  const { summary, loading, error, loadSummary, setError } = useSummary();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialText) loadSummary(initialText);
  }, [initialText, loadSummary]);

  const bullets = summary
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('•'));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

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
        onRetry={() => loadSummary(initialText)}
      />

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <span className={LABEL_CLASS}>Step 03 · Output</span>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            📋 Summary
          </h1>
        </div>
        {summary && !loading && (
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 active:scale-[0.98]"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        {loading ? (
          <SkeletonLoader />
        ) : bullets.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {bullets.map((line, i) => (
              <li
                key={i}
                className="flex gap-3 text-sm leading-relaxed text-white/75"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                {line.replace(/^•\s*/, '')}
              </li>
            ))}
          </ul>
        ) : summary ? (
          <p className="text-sm leading-relaxed text-white/75 whitespace-pre-wrap">
            {summary}
          </p>
        ) : null}
      </div>
    </div>
  );
}
