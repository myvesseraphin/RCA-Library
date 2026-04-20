import { useMemo, useRef } from 'react';

export function OtpInput({
  value,
  length = 6,
  onChange,
}: {
  value: string;
  length?: number;
  onChange: (value: string) => void;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = useMemo(
    () => Array.from({ length }, (_, index) => value[index] ?? ''),
    [length, value],
  );

  return (
    <div
      className="mx-auto grid w-full max-w-[21rem] gap-2"
      style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          autoComplete="off"
          value={digit}
          onChange={(event) => {
            const nextDigit = event.target.value.replace(/\D/g, '').slice(-1);
            const nextValue = digits.map((entry, entryIndex) => entryIndex === index ? nextDigit : entry).join('');
            onChange(nextValue);

            if (nextDigit && index < length - 1) {
              refs.current[index + 1]?.focus();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && !digits[index] && index > 0) {
              refs.current[index - 1]?.focus();
            }
          }}
          onPaste={(event) => {
            event.preventDefault();
            const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
            if (!pasted) {
              return;
            }

            onChange(pasted);
            refs.current[Math.min(pasted.length, length) - 1]?.focus();
          }}
          className="aspect-square w-full rounded-full border border-brand-secondary bg-white text-center text-base font-semibold text-brand-text shadow-[0_10px_24px_rgba(82,24,165,0.08)] outline-none transition focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/10 sm:text-lg"
        />
      ))}
    </div>
  );
}
