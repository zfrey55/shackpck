import type { Grader } from '@/lib/card-checklist-data';

export function GradePill({ grader, grade }: { grader: Grader; grade: string }) {
  const styles: Record<Grader, string> = {
    PSA: 'border-blue-500 bg-blue-950/50 text-blue-200',
    BGS: 'border-amber-500 bg-amber-950/50 text-amber-200',
    SGC: 'border-emerald-500 bg-emerald-950/50 text-emerald-200',
  };

  return (
    <span
      className={`inline-flex min-w-[4.5rem] justify-center rounded border px-2 py-0.5 text-xs font-semibold ${styles[grader]}`}
    >
      {grader} {grade}
    </span>
  );
}
