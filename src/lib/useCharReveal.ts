import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

type Options = {
    /** ScrollTrigger start position. */
    start?: string;
    /** Per-character stagger (s). */
    stagger?: number;
    /** Skip on viewports narrower than this (px). */
    minWidth?: number;
};

/**
 * Masked, character-by-character reveal for a heading. Splits into words +
 * chars (word-level masking keeps it robust against reflow), then slides each
 * char up from behind its word the first time the heading scrolls into view.
 * Runs after fonts are ready so custom-font widths measure correctly.
 */
export function useCharReveal(
    ref: RefObject<HTMLElement | null>,
    options: Options = {}
) {
    const { start = "top 88%", stagger = 0.014, minWidth = 0 } = options;

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            return;
        if (minWidth && window.innerWidth < minWidth) return;

        gsap.registerPlugin(ScrollTrigger);

        let split: SplitType | null = null;
        let tween: gsap.core.Tween | null = null;
        let killed = false;

        const run = () => {
            if (killed || !ref.current) return;

            split = new SplitType(el, { types: "words,chars" });
            split.words?.forEach((w) => {
                w.style.overflow = "hidden";
                w.style.paddingBottom = "0.06em";
                w.style.marginBottom = "-0.06em";
            });

            if (!split.chars || split.chars.length === 0) return;

            gsap.set(split.chars, { yPercent: 118 });
            tween = gsap.to(split.chars, {
                yPercent: 0,
                duration: 0.85,
                ease: "power4.out",
                stagger,
                scrollTrigger: {
                    trigger: el,
                    start,
                    once: true,
                },
            });
        };

        if (document.fonts && "ready" in document.fonts) {
            document.fonts.ready.then(run);
        } else {
            run();
        }

        return () => {
            killed = true;
            tween?.scrollTrigger?.kill();
            tween?.kill();
            split?.revert();
        };
    }, [ref, start, stagger, minWidth]);
}
