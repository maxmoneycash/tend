export function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <div className={`w-5 h-5 flex items-center justify-center shrink-0 ${className}`}>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </div>
  );
}

export function SpinnerIcon() {
  return (
    <div className="w-5 h-5 flex items-center justify-center shrink-0">
      <div className="w-[18px] h-[18px] border-2 border-transparent border-t-[var(--accent)] rounded-full animate-spin" />
    </div>
  );
}

export function CircleIcon() {
  return (
    <div className="w-5 h-5 flex items-center justify-center shrink-0">
      <div className="w-[18px] h-[18px] rounded-full border-[1.5px] border-white/15" />
    </div>
  );
}
