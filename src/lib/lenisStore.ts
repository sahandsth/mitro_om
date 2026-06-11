import type Lenis from "lenis";

/**
 * Central reference to the single Lenis instance so that the carefully tuned,
 * scroll-driven sections (Hero / Portfolio / About) can route their
 * programmatic scrolls through Lenis instead of native `window.scrollTo`,
 * which would otherwise fight Lenis's own rAF loop.
 */
let lenisInstance: Lenis | null = null;

export function setLenis(l: Lenis | null) {
    lenisInstance = l;
}

export function getLenis(): Lenis | null {
    return lenisInstance;
}

type ScrollToOptions = {
    offset?: number;
    duration?: number;
    immediate?: boolean;
    lock?: boolean;
    onComplete?: () => void;
};

/**
 * Smoothly scrolls to a target using Lenis when available.
 * Returns true if Lenis handled it, false if the caller should fall back to
 * native scrolling.
 */
export function smoothScrollTo(
    target: number | string | HTMLElement,
    options?: ScrollToOptions
): boolean {
    if (lenisInstance) {
        lenisInstance.scrollTo(target, options);
        return true;
    }
    return false;
}

/** Pause Lenis (used by the preloader while the page is locked). */
export function stopLenis() {
    lenisInstance?.stop();
}

/** Resume Lenis. */
export function startLenis() {
    lenisInstance?.start();
}
