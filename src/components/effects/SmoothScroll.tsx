"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setLenis } from "@/lib/lenisStore";

/**
 * Buttery momentum scrolling via Lenis, wired into the GSAP ticker and
 * ScrollTrigger so the existing pinned/scrubbed hero stays in sync.
 *
 * Lenis drives the *real* document scroll position, so every section that
 * listens to native `scroll` events or reads `getBoundingClientRect()`
 * keeps working unchanged. Programmatic scrolls (snap / nav) are routed
 * through `smoothScrollTo` from the lenis store to avoid fighting the loop.
 */
export default function SmoothScroll() {
    useEffect(() => {
        const reduce = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
        if (reduce) return;

        gsap.registerPlugin(ScrollTrigger);

        const lenis = new Lenis({
            duration: 1.05,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.6,
        });

        setLenis(lenis);

        const onLenisScroll = () => ScrollTrigger.update();
        lenis.on("scroll", onLenisScroll);

        const onTick = (time: number) => {
            lenis.raf(time * 1000);
        };
        gsap.ticker.add(onTick);
        gsap.ticker.lagSmoothing(0);

        return () => {
            lenis.off("scroll", onLenisScroll);
            gsap.ticker.remove(onTick);
            lenis.destroy();
            setLenis(null);
        };
    }, []);

    return null;
}
