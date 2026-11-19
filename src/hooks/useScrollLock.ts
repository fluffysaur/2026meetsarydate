import { useEffect } from 'react';

let lockCount = 0;
let savedScrollY = 0;
let savedStyles: {
  htmlOverflow: string;
  bodyOverflow: string;
  bodyPosition: string;
  bodyTop: string;
  bodyLeft: string;
  bodyRight: string;
  bodyPaddingRight: string;
} | null = null;

function acquireScrollLock() {
  if (lockCount === 0) {
    const html = document.documentElement;
    const body = document.body;
    const scrollbarWidth = window.innerWidth - html.clientWidth;

    savedScrollY = window.scrollY;
    savedStyles = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyPaddingRight: body.style.paddingRight,
    };

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${savedScrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  lockCount += 1;
}

function releaseScrollLock() {
  if (lockCount <= 0) return;
  lockCount -= 1;
  if (lockCount === 0 && savedStyles) {
    const html = document.documentElement;
    const body = document.body;

    html.style.overflow = savedStyles.htmlOverflow;
    body.style.overflow = savedStyles.bodyOverflow;
    body.style.position = savedStyles.bodyPosition;
    body.style.top = savedStyles.bodyTop;
    body.style.left = savedStyles.bodyLeft;
    body.style.right = savedStyles.bodyRight;
    body.style.paddingRight = savedStyles.bodyPaddingRight;

    const scrollY = savedScrollY;
    savedStyles = null;
    window.scrollTo(0, scrollY);
  }
}

/**
 * Locks background document scrolling while `locked` is true.
 * Ref-counted so nested modals do not unlock scroll prematurely.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    acquireScrollLock();
    return () => {
      releaseScrollLock();
    };
  }, [locked]);
}
