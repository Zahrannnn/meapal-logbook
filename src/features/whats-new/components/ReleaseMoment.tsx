import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';

interface ReleaseMomentProps {
  /** Called when the tour ends (last stop, skip, or Escape). */
  onDone: () => void;
  /** Opens the full What's new dialog from the last stop. */
  onOpenWhatsNew?: () => void;
}

interface TourStop {
  selector: string;
  title: string;
  body: string;
}

const STOPS: TourStop[] = [
  {
    selector: '[data-tour="hero"]',
    title: 'Your logged hours lead the screen',
    body: 'Main and stretch targets, with overtime tracked past 9h.',
  },
  {
    selector: '[data-tour="list"]',
    title: 'Your day, in order',
    body: 'Entries on a day rail — with draft saving and 5-second undo deletes.',
  },
  {
    selector: '[data-tour="cta"]',
    title: 'Log activity lives here',
    body: 'The main action, one click away at the top of the page.',
  },
];

/**
 * Once-per-version release tour: the page stays put while each changed area is
 * spotlighted in place with a short note. Click advances, Escape ends.
 */
export const ReleaseMoment: React.FC<ReleaseMomentProps> = ({ onDone, onOpenWhatsNew }) => {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const finishedRef = useRef(false);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const stop = STOPS[step];
  const isLast = step === STOPS.length - 1;

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onDone();
  }, [onDone]);

  const advance = useCallback(() => {
    if (isLast) {
      finish();
    } else {
      setStep((current) => current + 1);
    }
  }, [isLast, finish]);

  // Measure the current stop's element; wait (briefly) for it to exist on boot.
  const measure = useCallback(() => {
    const element = document.querySelector(stop.selector);
    setRect(element ? element.getBoundingClientRect() : null);
  }, [stop.selector]);

  useEffect(() => {
    measure();
    let raf = 0;
    let tries = 0;
    const poll = () => {
      tries += 1;
      measure();
      if (tries < 90 && !rect) raf = requestAnimationFrame(poll);
    };
    raf = requestAnimationFrame(poll);
    const onReflow = () => measure();
    window.addEventListener('resize', onReflow);
    window.addEventListener('scroll', onReflow, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onReflow);
      window.removeEventListener('scroll', onReflow, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Soft entrance per stop.
  useEffect(() => {
    if (!rect) return;
    const reduceMotion = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    tweenRef.current?.kill();
    tweenRef.current = gsap.fromTo(
      [ringRef.current, cardRef.current],
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.3, ease: 'power2.out' },
    );
    return () => {
      tweenRef.current?.kill();
    };
  }, [rect, step]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish();
      if (event.key === 'Enter' || event.key === 'ArrowRight') advance();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, finish]);

  if (!rect) return null;

  const pad = 8;
  const cardWidth = Math.min(320, window.innerWidth - 24);
  const cardLeft = Math.min(Math.max(12, rect.left), window.innerWidth - cardWidth - 12);
  const cardBelow = rect.bottom + 60 < window.innerHeight;
  const cardTop = cardBelow ? rect.bottom + 12 : Math.max(12, rect.top - 130);

  return createPortal(
    <>
      {/* Absorbs clicks so the page can't be touched mid-tour */}
      <div className="fixed inset-0 z-[89]" onClick={advance} aria-hidden="true" />

      {/* Spotlight cutout: the dim is the ring's own box-shadow */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed z-[90] rounded-2xl ring-2 ring-primary"
        style={{
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
          boxShadow: '0 0 0 9999px rgba(10, 15, 28, 0.55)',
        }}
      />

      <div
        ref={cardRef}
        className="fixed z-[91] w-[19rem] rounded-xl border border-border bg-card p-3.5 shadow-xl"
        style={{ top: cardTop, left: cardLeft }}
        role="dialog"
        aria-label="What changed in this release"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Version 1.3.0</p>
          <p className="text-[11px] font-semibold text-muted-foreground tabular-nums">
            {step + 1} / {STOPS.length}
          </p>
        </div>
        <p className="mt-1.5 text-sm font-bold text-foreground">{stop.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{stop.body}</p>
        {isLast && onOpenWhatsNew && (
          <button
            type="button"
            onClick={onOpenWhatsNew}
            className="mt-2.5 flex w-full items-center justify-between rounded-lg bg-muted/60 px-2.5 py-2 text-left transition-colors hover:bg-muted"
          >
            <span className="text-xs font-semibold text-foreground">Full release notes</span>
            <span className="text-[11px] font-bold text-primary">What's new</span>
          </button>
        )}
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={finish}
            className="text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Skip tour
          </button>
          <Button size="sm" variant="secondary" onClick={advance}>
            {isLast ? 'Done' : 'Next'}
          </Button>
        </div>
      </div>
    </>,
    document.body,
  );
};
