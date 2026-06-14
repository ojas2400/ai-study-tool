import { LABEL_CLASS } from '../libs/theme.js';

export default function Loader({ label, size = 'md', inline = false }) {
  const sizeClasses =
    size === 'sm' ? 'h-4 w-4 border-2' : 'h-8 w-8 border-[3px]';

  const spinner = (
    <div
      className={`${sizeClasses} animate-spin rounded-full border-white/20 border-t-violet-500`}
      role="status"
      aria-label="Loading"
    />
  );

  if (inline) return spinner;

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      {spinner}
      {label && (
        <p className={`${LABEL_CLASS} normal-case tracking-normal`}>{label}</p>
      )}
    </div>
  );
}
