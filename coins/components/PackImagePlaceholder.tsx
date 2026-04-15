import Image from 'next/image';

/** Branded placeholder matching RepackCard image area (4:3). */
export function PackImagePlaceholder({ label = 'Pack Image Coming Soon' }: { label?: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-black">
      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-slate-900/80 p-2">
        <Image
          src="/coin-icon.svg"
          alt="ShackPack"
          width={48}
          height={48}
          className="opacity-90"
        />
      </div>
      <p className="px-4 text-center text-xs font-medium uppercase tracking-wide text-gold/90">
        ShackPack
      </p>
      <p className="mt-2 px-4 text-center text-sm text-slate-400">{label}</p>
    </div>
  );
}
