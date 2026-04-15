import { useEffect, useRef } from 'react';
import type { NavigateDirection } from '../shared/components/media/mediaViewerTypes';

export type UseMediaViewerKeyboardOptions = {
  /** When false, no listeners are registered. */
  enabled?: boolean;
  onEscape?: () => void;
  onNavigate?: (direction: NavigateDirection) => void;
};

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (target == null || !(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    return true;
  }
  return target.isContentEditable;
};

/**
 * Window-level shortcuts for media viewer: Escape, ArrowLeft (previous), ArrowRight (next).
 * Arrow keys are ignored while focus is in a form field so cursor movement still works.
 */
export const useMediaViewerKeyboard = ({
  enabled = true,
  onEscape,
  onNavigate,
}: UseMediaViewerKeyboardOptions): void => {
  const onEscapeRef = useRef(onEscape);
  const onNavigateRef = useRef(onNavigate);

  onEscapeRef.current = onEscape;
  onNavigateRef.current = onNavigate;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onEscapeRef.current?.();
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (isTypingTarget(e.target)) {
          return;
        }
        e.preventDefault();
        const direction: NavigateDirection = e.key === 'ArrowLeft' ? 'previous' : 'next';
        onNavigateRef.current?.(direction);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [enabled]);
};
