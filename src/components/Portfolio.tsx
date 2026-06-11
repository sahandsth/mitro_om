"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

/** Shared cache so PfImg stays visible across strip ↔ morph remounts */
const loadedImageUrls = new Set<string>();

const markImageLoaded = (src: string) => {
    loadedImageUrls.add(src);
};

const MAX_STACK = 3;
/** pos 0 = nearest active panel (widest) → pos 2 = thinnest peek */
const STRIP_RATIOS = [0.118, 0.074, 0.042];
const MIN_STRIP_RATIO = 0.024;
const EASE = (t: number) => 1 - Math.pow(1 - t, 3);
const EASE_SMOOTH = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const PREVIEW_BY_TIER = [
    { w: 0.9, top: 0.3, aspect: 1.28 },
    { w: 0.74, top: 0.46, aspect: 1.38 },
    { w: 0.6, top: 0.58, aspect: 1.32 },
];

const SCATTER_OFFSETS = [
    { x: -118, y: -24, r: -12 },
    { x: 108, y: -40, r: 9 },
    { x: -88, y: 52, r: -7 },
    { x: 96, y: 44, r: 11 },
];

const INTRO_TAGS = [
    "Branding",
    "Social Media Management",
    "UI Design",
    "Website Development",
    "Advertisement campaign",
];

const PROJECTS = [
    {
        id: "01",
        title: "Planetary Resilience Institution",
        year: "2025",
        about: "About Planetary Resilience Institution",
        description:
            "Planetary Resilience is a Germany-based academic institution dedicated to ecological preservation and climate research. The brand identity spans logo, print, digital touchpoints, and a full visual language built around sustainability and scientific rigor.",
        mainImage: "/images/portfolio/PR/1.png",
        cover: "/images/portfolio/PR/Main.png",
        scatter: [
            "/images/portfolio/PR/2.png",
            "/images/portfolio/PR/3.png",
            "/images/portfolio/PR/4.png",
            "/images/portfolio/PR/5.png",
        ],
    },
    {
        id: "02",
        title: "Stra Technology",
        year: "2024",
        about: "About Stra Technology",
        description:
            "Visual identity and web presence for a creative studio — bold typography, motion-led brand assets, and a portfolio site designed to showcase multidisciplinary work.",
        mainImage: "/images/portfolio/ST/1.png",
        cover: "/images/portfolio/ST/Main.png",
        scatter: [
            "https://picsum.photos/seed/aur-s1/280/360",
            "https://picsum.photos/seed/aur-s2/280/360",
            "https://picsum.photos/seed/aur-s3/280/360",
            "https://picsum.photos/seed/aur-s4/280/360",
        ],
    },
    {
        id: "03",
        title: "Meridian Coffee Co.",
        year: "2023",
        about: "About Meridian Coffee Co.",
        description:
            "Packaging, signage, and social content for a specialty roaster — earthy tones, hand-drawn illustrations, and a warm brand voice across every customer touchpoint.",
        mainImage: "https://picsum.photos/seed/mer-main/400/700",
        cover: "https://picsum.photos/seed/mer-cover/300/800",
        scatter: [
            "https://picsum.photos/seed/mer-s1/280/360",
            "https://picsum.photos/seed/mer-s2/280/360",
            "https://picsum.photos/seed/mer-s3/280/360",
            "https://picsum.photos/seed/mer-s4/280/360",
        ],
    },
    {
        id: "04",
        title: "Nova Health Platform",
        year: "2023",
        about: "About Nova Health Platform",
        description:
            "UI/UX design for a digital health app — intuitive flows, accessible components, and a calm visual system that puts patient trust first.",
        mainImage: "https://picsum.photos/seed/nov-main/400/700",
        cover: "https://picsum.photos/seed/nov-cover/300/800",
        scatter: [
            "https://picsum.photos/seed/nov-s1/280/360",
            "https://picsum.photos/seed/nov-s2/280/360",
            "https://picsum.photos/seed/nov-s3/280/360",
            "https://picsum.photos/seed/nov-s4/280/360",
        ],
    },
    {
        id: "05",
        title: "Lumen Architecture",
        year: "2022",
        about: "About Lumen Architecture",
        description:
            "Brand strategy and website for an architecture firm — minimal layouts, large-format project photography, and a refined typographic hierarchy.",
        mainImage: "https://picsum.photos/seed/lum-main/400/700",
        cover: "https://picsum.photos/seed/lum-cover/300/800",
        scatter: [
            "https://picsum.photos/seed/lum-s1/280/360",
            "https://picsum.photos/seed/lum-s2/280/360",
            "https://picsum.photos/seed/lum-s3/280/360",
            "https://picsum.photos/seed/lum-s4/280/360",
        ],
    },
    {
        id: "06",
        title: "Pulse Festival",
        year: "2022",
        about: "About Pulse Festival",
        description:
            "Campaign identity for a music festival — poster series, social templates, stage graphics, and merchandise designed for maximum impact at scale.",
        mainImage: "https://picsum.photos/seed/pul-main/400/700",
        cover: "https://picsum.photos/seed/pul-cover/300/800",
        scatter: [
            "https://picsum.photos/seed/pul-s1/280/360",
            "https://picsum.photos/seed/pul-s2/280/360",
            "https://picsum.photos/seed/pul-s3/280/360",
            "https://picsum.photos/seed/pul-s4/280/360",
        ],
    },
];

const ALL_IMAGE_URLS = PROJECTS.flatMap((p) => [
    p.mainImage,
    ...p.scatter,
]);

/** Main heroes first so the last slide is preloaded before the user reaches it */
const PRELOAD_MAIN_URLS = PROJECTS.map((p) => p.mainImage);
const PRELOAD_SCATTER_URLS = PROJECTS.flatMap((p) => p.scatter);

const EXPAND_DELAY = 0.08;
const AUTO_SCATTER_MS = 1000;
const PREVIEW_MORPH_DELAY = 0.1;
const SNAP_DEBOUNCE_MS = 140;
const HERO_SIZE = { w: 248, h: 168 };

/** Match morph landing position to scatter-main center in the flex layout. */
const heroTargetFromLayout = (vh: number, panelF = 1) => {
    const navH = 110;
    const padTop = (navH + 16) * panelF;
    const padBottom = 56 * panelF;
    const headerBlock = 78;
    const scatterMargin = 8;
    const footerBlock = 96;
    const scatterMax = vh * 0.46;
    const scatterMin = 280;
    const available =
        vh - padTop - padBottom - headerBlock - footerBlock - scatterMargin;
    const scatterH = Math.min(Math.max(scatterMin, available), scatterMax);
    const centerY = padTop + headerBlock + scatterMargin + scatterH / 2;

    return {
        w: HERO_SIZE.w,
        h: HERO_SIZE.h,
        topVh: (centerY - HERO_SIZE.h / 2) / vh,
    };
};

type HeroTarget = ReturnType<typeof heroTargetFromLayout>;

const resolveHeroEnd = (
    vh: number,
    panelF: number,
    measured: HeroTarget | null
) => {
    const layout = heroTargetFromLayout(vh, panelF);
    if (!measured || measured.topVh <= 0) return layout;

    const blend = clamp01((panelF - 0.82) / 0.18);
    return {
        ...layout,
        topVh: lerp(layout.topVh, measured.topVh, blend),
    };
};

const stripZ = (tier: number) => 16 - tier;
const Z_ACTIVE = 22;
const Z_EXIT = 8;

const delayedMorph = (moveE: number) =>
    moveE <= PREVIEW_MORPH_DELAY
        ? 0
        : EASE_SMOOTH(
              clamp01((moveE - PREVIEW_MORPH_DELAY) / (1 - PREVIEW_MORPH_DELAY))
          );

const portfolioMaxScroll = (vh: number, totalVh: number) =>
    Math.max(0, totalVh * vh - vh);

/** Sticky track is active only while the wrapper fills the viewport. */
const isPortfolioStickyEngaged = (rect: DOMRect, vh: number) =>
    rect.top <= 1 && rect.bottom >= vh - 1;

/** Skip snap when the user is scrolling out toward an adjacent section. */
const portfolioEdgeExit = (
    scrolled: number,
    maxScroll: number,
    vh: number,
    direction: number
) => {
    const edge = vh * 0.12;
    if (scrolled < edge && direction < 0) return true;
    if (scrolled > maxScroll - edge && direction > 0) return true;
    return false;
};

/**
 * Fraction of the gap between two rest points the user must travel before the
 * snap commits to the next/previous one. Kept low so a single normal scroll
 * gesture is enough to advance — they no longer have to fight to open a layer.
 */
const SNAP_COMMIT = 0.32;

/**
 * Snap target inside the portfolio track (px).
 *
 * Every project settles at the centre of its hold band; the intro top and the
 * exit form the two outer rest points. We land on whichever bounding anchor the
 * user is heading toward: scrolling forward commits to the next anchor after
 * only ~SNAP_COMMIT of the gap (and likewise backward), so one scroll is enough
 * to open the next layer while small nudges still settle back into place.
 */
const snapPortfolioScrolled = (
    scrolled: number,
    vh: number,
    introVh: number,
    openVh: number,
    cardVh: number,
    holdRatio: number,
    cardCount: number,
    totalVh: number,
    direction: number
) => {
    const introEnd = introVh * vh;
    const openEnd = introEnd + openVh * vh;
    const perCard = cardVh * vh;
    const maxIdx = cardCount - 1;
    const maxScroll = portfolioMaxScroll(vh, totalVh);

    if (scrolled <= 0) return 0;
    if (scrolled >= maxScroll) return maxScroll;

    const holdCenter = (idx: number) =>
        openEnd + idx * perCard + holdRatio * perCard * 0.5;

    const anchors = [0];
    for (let idx = 0; idx <= maxIdx; idx++) anchors.push(holdCenter(idx));
    anchors.push(maxScroll);

    let k = 0;
    for (let i = 0; i < anchors.length - 1; i++) {
        if (scrolled >= anchors[i] && scrolled <= anchors[i + 1]) {
            k = i;
            break;
        }
    }

    const lo = anchors[k];
    const hi = anchors[k + 1];
    const gap = hi - lo;
    if (gap <= 0) return lo;

    const frac = (scrolled - lo) / gap;

    if (direction > 0) return frac >= SNAP_COMMIT ? hi : lo;
    if (direction < 0) return frac <= 1 - SNAP_COMMIT ? lo : hi;
    return frac < 0.5 ? lo : hi;
};

type Phase = "intro" | "opening" | "cards";

type StackGeom = {
    positions: number[];
    widths: number[];
    totalW: number;
};

type CardLayout = {
    visible: boolean;
    mode: "strip" | "active" | "exiting" | "entering" | "past";
    left: number;
    width: number;
    slideX: number;
    zIndex: number;
    scatterFrac: number;
    contentFrac: number;
    isStrip: boolean;
    stackPos: number;
    previewW: number;
    previewTop: number;
    previewAspect: number;
    panelExpand: number;
    mainMorph: number;
    useMainMorph: boolean;
    morphStartW: number;
    morphStartH: number;
    morphStartTop: number;
    heroEndW: number;
    heroEndH: number;
    heroEndTopVh: number;
    stripReveal: number;
};

const NO_MORPH = {
    panelExpand: 1,
    mainMorph: 1,
    useMainMorph: false,
    morphStartW: 0,
    morphStartH: 0,
    morphStartTop: 0,
    heroEndW: 0,
    heroEndH: 0,
    heroEndTopVh: 0,
    stripReveal: 1,
};

const morphFromExpand = (
    expandProgress: number,
    preview: { w: number; top: number; aspect: number },
    cardWidth: number,
    vh: number,
    measuredHero: HeroTarget | null
) => {
    const t = clamp01(expandProgress);
    const safeW = Math.max(cardWidth, 1);
    const startW = safeW * preview.w;
    const startH = startW / preview.aspect;
    const heroEnd = resolveHeroEnd(vh, t, measuredHero);

    return {
        panelExpand: t,
        mainMorph: t,
        useMainMorph: true,
        morphStartW: startW,
        morphStartH: startH,
        morphStartTop: preview.top,
        heroEndW: heroEnd.w,
        heroEndH: heroEnd.h,
        heroEndTopVh: heroEnd.topVh,
        stripReveal: 1,
    };
};

function usePreloadProgress(total: number) {
    const loadedRef = useRef(new Set<string>());
    const [count, setCount] = useState(0);

    const markLoaded = useCallback((src: string) => {
        if (loadedRef.current.has(src)) return;
        loadedRef.current.add(src);
        markImageLoaded(src);
        setCount(loadedRef.current.size);
    }, []);

    return {
        progress: total > 0 ? count / total : 1,
        ready: count >= total,
        markLoaded,
    };
}

function PfImg({
    src,
    alt,
    sizes,
    priority,
    imagesReady,
    className,
}: {
    src: string;
    alt: string;
    sizes: string;
    priority?: boolean;
    imagesReady?: boolean;
    className?: string;
}) {
    const [loaded, setLoaded] = useState(() => loadedImageUrls.has(src));

    const reveal = useCallback(() => {
        markImageLoaded(src);
        setLoaded(true);
    }, [src]);

    useEffect(() => {
        if (loadedImageUrls.has(src)) {
            setLoaded(true);
        }
    }, [src, imagesReady]);

    useLayoutEffect(() => {
        if (loadedImageUrls.has(src)) {
            setLoaded(true);
        }
    });

    useEffect(() => {
        if (loadedImageUrls.has(src)) return;

        const probe = new window.Image();
        const done = () => reveal();
        probe.onload = done;
        probe.onerror = done;
        probe.src = src;
        if (probe.complete) done();
    }, [src, reveal]);

    return (
        <div
            className={`pf-img-wrap ${loaded ? "pf-img-wrap--loaded" : ""} ${
                priority ? "pf-img-wrap--priority" : ""
            } ${className ?? ""}`}
        >
            {!loaded && <span className="pf-img-shimmer" aria-hidden="true" />}
            <Image
                src={src}
                alt={alt}
                fill
                sizes={sizes}
                priority={priority}
                loading={priority ? "eager" : "lazy"}
                onLoad={reveal}
                onError={reveal}
                style={{ objectFit: "cover" }}
            />
        </div>
    );
}

function PortfolioDesktop() {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const heroMeasureRef = useRef<HTMLDivElement>(null);
    const heroProbeRef = useRef<HTMLDivElement>(null);
    const [stageWidth, setStageWidth] = useState(0);
    const [layoutReady, setLayoutReady] = useState(false);
    const [phase, setPhase] = useState<Phase>("intro");
    const [openFrac, setOpenFrac] = useState(0);
    const [cardIndex, setCardIndex] = useState(0);
    const [cardFrac, setCardFrac] = useState(0);
    const [entryFrac, setEntryFrac] = useState(1);
    const [showLoader, setShowLoader] = useState(true);
    const [viewportH, setViewportH] = useState(0);
    const [measuredHero, setMeasuredHero] = useState<HeroTarget | null>(null);
    const [autoScatter, setAutoScatter] = useState(0);
    const scatterRafRef = useRef(0);
    const scatterSessionRef = useRef("");
    const scatterDoneRef = useRef(false);
    const scatterIndexRef = useRef(-1);
    const snapLockRef = useRef(false);
    const snapTimerRef = useRef(0);
    const lastPortfolioScrolledRef = useRef<number | null>(null);
    const scrollDirRef = useRef(0);

    const imageUrls = useMemo(() => ALL_IMAGE_URLS, []);
    const { progress: loadProgress, ready: imagesReady, markLoaded } =
        usePreloadProgress(imageUrls.length);

    const INTRO_VH = 0.25;
    const OPEN_VH = 0.45;
    const CARD_VH = 1.0;
    const HOLD_RATIO = 0.25;
    const TAIL_VH = 0.4;

    const totalVh =
        INTRO_VH + OPEN_VH + PROJECTS.length * CARD_VH + TAIL_VH;

    const layoutVh = Math.max(viewportH, 900);

    const stackGeometry = useCallback(
        (count: number): StackGeom => {
            if (stageWidth === 0 || count === 0) {
                return { positions: [], widths: [], totalW: 0 };
            }
            const widths = STRIP_RATIOS.slice(0, count).map(
                (r) => stageWidth * r
            );
            const totalW = widths.reduce((a, b) => a + b, 0);
            const positions: number[] = [];
            let x = stageWidth - totalW;
            for (let i = 0; i < count; i++) {
                positions.push(x);
                x += widths[i];
            }
            return { positions, widths, totalW };
        },
        [stageWidth]
    );

    const previewForTier = (tier: number) =>
        PREVIEW_BY_TIER[Math.min(tier, PREVIEW_BY_TIER.length - 1)];

    const easeOnce = (raw: number) => EASE_SMOOTH(clamp01(raw));

    /** Width expands after card comes to front */
    const expandT = (raw: number) =>
        easeOnce(clamp01((raw - EXPAND_DELAY) / (1 - EXPAND_DELAY)));

    const measureStage = useCallback(() => {
        if (stageRef.current) {
            setStageWidth(stageRef.current.offsetWidth);
        }
    }, []);

    const measureHeroTarget = useCallback(() => {
        const panel = heroMeasureRef.current;
        const probe = heroProbeRef.current;
        if (!panel || !probe) return;

        const vh = window.innerHeight;
        const panelRect = panel.getBoundingClientRect();
        const probeRect = probe.getBoundingClientRect();

        setMeasuredHero({
            w: probeRect.width,
            h: probeRect.height,
            topVh: (probeRect.top - panelRect.top) / vh,
        });
    }, []);

    useEffect(() => {
        const onResize = () => {
            setViewportH(window.innerHeight);
            measureStage();
            measureHeroTarget();
        };
        onResize();
        window.addEventListener("resize", onResize, { passive: true });
        return () => window.removeEventListener("resize", onResize);
    }, [measureStage, measureHeroTarget]);

    useEffect(() => {
        measureHeroTarget();
    }, [measureHeroTarget, stageWidth, viewportH]);

    // Reset the scatter to "tucked in" synchronously the moment a different card
    // becomes active, so the freshly-landed card never paints a single frame
    // with the previous card's fully-scattered value (which looked like the
    // images flashing back in and out again).
    useLayoutEffect(() => {
        if (cardIndex !== scatterIndexRef.current) {
            scatterIndexRef.current = cardIndex;
            setAutoScatter(0);
        }
    }, [cardIndex]);

    useEffect(() => {
        if (!imagesReady) return;

        const maxIdx = PROJECTS.length - 1;
        const expanding =
            (phase === "opening" && openFrac < 1) ||
            (phase === "cards" &&
                cardIndex < maxIdx &&
                cardFrac > 0);

        if (expanding) {
            // Pause the running scatter, but keep the "done" flag intact: a tiny
            // forward nudge that snaps back to the same card must NOT replay the
            // animation. Replays are keyed on cardIndex below.
            cancelAnimationFrame(scatterRafRef.current);
            return;
        }

        if (phase === "intro") {
            scatterSessionRef.current = "";
            scatterDoneRef.current = false;
            cancelAnimationFrame(scatterRafRef.current);
            return;
        }

        const settledKey = `settled-${cardIndex}`;
        if (
            settledKey === scatterSessionRef.current &&
            scatterDoneRef.current
        ) {
            return;
        }

        scatterSessionRef.current = settledKey;
        scatterDoneRef.current = false;
        setAutoScatter(0);
        cancelAnimationFrame(scatterRafRef.current);

        const start = performance.now();
        const tick = (now: number) => {
            const t = clamp01((now - start) / AUTO_SCATTER_MS);
            setAutoScatter(EASE(t));
            if (t < 1) {
                scatterRafRef.current = requestAnimationFrame(tick);
            } else {
                scatterDoneRef.current = true;
            }
        };

        scatterRafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(scatterRafRef.current);
    }, [imagesReady, phase, cardIndex, cardFrac, openFrac]);

    useEffect(() => {
        if (!imagesReady) return;
        const t = window.setTimeout(() => setShowLoader(false), 280);
        return () => window.clearTimeout(t);
    }, [imagesReady]);

    useEffect(() => {
        if (imagesReady) return;
        const t = window.setTimeout(() => {
            imageUrls.forEach((src) => markLoaded(src));
        }, 8000);
        return () => window.clearTimeout(t);
    }, [imagesReady, imageUrls, markLoaded]);

    useEffect(() => {
        if (cardIndex < PROJECTS.length - 3) return;
        const last = PROJECTS[PROJECTS.length - 1]?.mainImage;
        if (last) markImageLoaded(last);
    }, [cardIndex]);

    const syncFromScroll = useCallback(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const rect = wrapper.getBoundingClientRect();
        const scrolled = -rect.top;
        const vh = window.innerHeight;

        if (lastPortfolioScrolledRef.current !== null) {
            const delta = scrolled - lastPortfolioScrolledRef.current;
            if (Math.abs(delta) > 0.5) {
                scrollDirRef.current = delta > 0 ? 1 : -1;
            }
        }
        lastPortfolioScrolledRef.current = scrolled;

        setEntryFrac(clamp01(1 - rect.top / vh));

        if (scrolled < 0) {
            setPhase("intro");
            setOpenFrac(0);
            setCardIndex(0);
            setCardFrac(0);
            return;
        }

        const introEnd = INTRO_VH * vh;
        const openEnd = introEnd + OPEN_VH * vh;

        if (scrolled < introEnd) {
            setPhase("intro");
            setOpenFrac(0);
            setCardIndex(0);
            setCardFrac(0);
            return;
        }

        if (scrolled < openEnd) {
            setPhase("opening");
            setOpenFrac((scrolled - introEnd) / (OPEN_VH * vh));
            setCardIndex(0);
            setCardFrac(0);
            return;
        }

        setPhase("cards");
        setOpenFrac(1);

        const perCard = CARD_VH * vh;
        const raw = (scrolled - openEnd) / perCard;
        const maxIdx = PROJECTS.length - 1;
        const clamped = Math.min(raw, maxIdx);
        const idx = Math.floor(clamped);
        const seg = clamped - idx;
        const frac =
            idx >= maxIdx
                ? 0
                : seg > HOLD_RATIO
                  ? (seg - HOLD_RATIO) / (1 - HOLD_RATIO)
                  : 0;

        setCardIndex(idx);
        setCardFrac(frac);
    }, []);

    const snapToNearestOpen = useCallback(() => {
        if (snapLockRef.current) return;

        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const rect = wrapper.getBoundingClientRect();
        const vh = window.innerHeight;

        if (!isPortfolioStickyEngaged(rect, vh)) return;

        const scrolled = -rect.top;
        const maxScroll = portfolioMaxScroll(vh, totalVh);

        if (portfolioEdgeExit(scrolled, maxScroll, vh, scrollDirRef.current)) {
            return;
        }

        const targetScrolled = snapPortfolioScrolled(
            scrolled,
            vh,
            INTRO_VH,
            OPEN_VH,
            CARD_VH,
            HOLD_RATIO,
            PROJECTS.length,
            totalVh,
            scrollDirRef.current
        );

        if (Math.abs(targetScrolled - scrolled) < 6) return;

        const targetY = window.scrollY + rect.top + targetScrolled;
        snapLockRef.current = true;
        window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
        window.setTimeout(() => {
            snapLockRef.current = false;
        }, 700);
    }, [totalVh]);

    useLayoutEffect(() => {
        setViewportH(window.innerHeight);
        measureStage();
        measureHeroTarget();
        syncFromScroll();
        setLayoutReady(true);
    }, [measureStage, measureHeroTarget, syncFromScroll]);

    useEffect(() => {
        const queueSnap = () => {
            window.clearTimeout(snapTimerRef.current);
            snapTimerRef.current = window.setTimeout(() => {
                snapToNearestOpen();
            }, SNAP_DEBOUNCE_MS);
        };

        window.addEventListener("scroll", syncFromScroll, { passive: true });
        window.addEventListener("resize", syncFromScroll, { passive: true });
        window.addEventListener("scrollend", snapToNearestOpen, {
            passive: true,
        });
        window.addEventListener("scroll", queueSnap, { passive: true });

        return () => {
            window.removeEventListener("scroll", syncFromScroll);
            window.removeEventListener("resize", syncFromScroll);
            window.removeEventListener("scrollend", snapToNearestOpen);
            window.removeEventListener("scroll", queueSnap);
            window.clearTimeout(snapTimerRef.current);
        };
    }, [syncFromScroll, snapToNearestOpen]);

    const stackCountAfter = (idx: number) =>
        Math.min(MAX_STACK, Math.max(0, PROJECTS.length - idx - 1));

    const stripLayout = (
        tier: number,
        geom: StackGeom
    ): Pick<
        CardLayout,
        | "left"
        | "width"
        | "previewW"
        | "previewTop"
        | "previewAspect"
        | "stackPos"
    > => {
        const pv = previewForTier(tier);
        return {
            left: geom.positions[tier] ?? 0,
            width: geom.widths[tier] ?? 0,
            previewW: pv.w,
            previewTop: pv.top,
            previewAspect: pv.aspect,
            stackPos: tier,
        };
    };

    const getEntering = (
        rawT: number,
        startL: number,
        startW: number,
        endStackCount: number
    ): Omit<
        CardLayout,
        "visible" | "mode" | "zIndex" | "stackPos" | "previewW" | "previewTop" | "previewAspect"
    > & {
        previewW: number;
        previewTop: number;
        previewAspect: number;
        stackPos: number;
    } => {
        const promoteE = easeOnce(rawT);
        const ex = expandT(rawT);
        const endGeom = stackGeometry(endStackCount);
        const targetW = stageWidth - endGeom.totalW;
        const pv = previewForTier(0);

        return {
            left: lerp(startL, 0, promoteE),
            width: lerp(startW, targetW, ex),
            slideX: 0,
            scatterFrac: 0,
            contentFrac: EASE(clamp01((ex - 0.45) / 0.55)),
            isStrip: false,
            previewW: pv.w,
            previewTop: pv.top,
            previewAspect: pv.aspect,
            stackPos: 0,
            ...morphFromExpand(
                ex,
                pv,
                lerp(startW, targetW, ex),
                layoutVh,
                measuredHero
            ),
        };
    };

    const getCardLayout = (i: number): CardLayout => {
        const pv0 = previewForTier(0);
        const hidden: CardLayout = {
            visible: false,
            mode: "strip",
            left: 0,
            width: 0,
            slideX: 0,
            zIndex: 0,
            scatterFrac: 0,
            contentFrac: 0,
            isStrip: true,
            stackPos: 0,
            previewW: pv0.w,
            previewTop: pv0.top,
            previewAspect: pv0.aspect,
            ...NO_MORPH,
            panelExpand: 0,
        };

        if (stageWidth === 0) return hidden;

        const introStripTotal = Math.min(MAX_STACK, PROJECTS.length);

        const introStack = stackGeometry(introStripTotal);

        if (phase === "intro") {
            if (i >= introStripTotal) return hidden;

            const reveal = clamp01((entryFrac - i * 0.08) / 0.84);
            const slideX =
                (1 - easeOnce(reveal)) * (stageWidth * 0.06 + i * 28);
            const strip = stripLayout(i, introStack);

            return {
                visible: true,
                mode: "strip",
                ...strip,
                slideX,
                zIndex: stripZ(i),
                scatterFrac: 0,
                contentFrac: 0,
                isStrip: true,
                ...NO_MORPH,
                panelExpand: 0,
            };
        }

        if (phase === "opening") {
            const moveE = easeOnce(openFrac);
            const ex = expandT(openFrac);
            const stackN = stackCountAfter(0);
            const finalStack = stackGeometry(stackN);

            if (i === 0) {
                const startL = introStack.positions[0] ?? 0;
                const startW = introStack.widths[0] ?? 0;
                const endW = stageWidth - finalStack.totalW;

                const cardW = lerp(startW, endW, ex);
                const pv = previewForTier(0);
                const expandDone = openFrac >= 0.999 || ex >= 0.999;

                return {
                    visible: true,
                    mode: expandDone ? "active" : "entering",
                    left: lerp(startL, 0, ex),
                    width: cardW,
                    slideX: 0,
                    scatterFrac: expandDone ? autoScatter : 0,
                    contentFrac: EASE(clamp01((ex - 0.45) / 0.55)),
                    isStrip: false,
                    previewW: pv.w,
                    previewTop: pv.top,
                    previewAspect: pv.aspect,
                    stackPos: 0,
                    zIndex: Math.round(
                        lerp(stripZ(0), Z_ACTIVE, easeOnce(openFrac))
                    ),
                    ...morphFromExpand(ex, pv, cardW, layoutVh, measuredHero),
                };
            }

            if (i >= 1 && i <= stackN) {
                const tier = i - 1;
                const inIntro = i < introStripTotal;
                const startPv = previewForTier(inIntro ? i : tier);
                const endPv = previewForTier(tier);

                if (!inIntro && openFrac < 0.08) return hidden;

                const startL = inIntro
                    ? (introStack.positions[i] ?? finalStack.positions[tier] ?? 0)
                    : stageWidth;
                const startW = inIntro
                    ? (introStack.widths[i] ?? 0)
                    : stageWidth * MIN_STRIP_RATIO;
                const appearE = inIntro ? moveE : easeOnce(clamp01((openFrac - 0.2) / 0.8));

                return {
                    visible: true,
                    mode: "strip",
                    left: lerp(startL, finalStack.positions[tier] ?? 0, inIntro ? moveE : appearE),
                    width: lerp(startW, finalStack.widths[tier] ?? 0, inIntro ? moveE : appearE),
                    previewW: lerp(startPv.w, endPv.w, inIntro ? moveE : appearE),
                    previewTop: lerp(startPv.top, endPv.top, inIntro ? moveE : appearE),
                    previewAspect: lerp(
                        startPv.aspect,
                        endPv.aspect,
                        inIntro ? moveE : appearE
                    ),
                    slideX: 0,
                    zIndex: stripZ(tier),
                    scatterFrac: 0,
                    contentFrac: 0,
                    isStrip: true,
                    stackPos: tier,
                    ...NO_MORPH,
                    panelExpand: 0,
                };
            }

            return hidden;
        }

        const maxIdx = PROJECTS.length - 1;
        const transitioning = cardFrac > 0 && cardIndex < maxIdx;
        const moveE = easeOnce(cardFrac);
        const stackAfter = stackCountAfter(cardIndex);
        const settledGeom = stackGeometry(stackAfter);

        if (i < cardIndex) {
            return {
                visible: true,
                mode: "past",
                left: 0,
                width: stageWidth - settledGeom.totalW,
                slideX: -102,
                zIndex: 1,
                scatterFrac: 0,
                contentFrac: 0,
                isStrip: false,
                stackPos: 0,
                previewW: pv0.w,
                previewTop: pv0.top,
                previewAspect: pv0.aspect,
                ...NO_MORPH,
            };
        }

        if (i === cardIndex && !transitioning) {
            const cardW = stageWidth - settledGeom.totalW;

            return {
                visible: true,
                mode: "active",
                left: 0,
                width: cardW,
                slideX: 0,
                zIndex: Z_ACTIVE,
                scatterFrac: autoScatter,
                contentFrac: 1,
                isStrip: false,
                stackPos: 0,
                previewW: pv0.w,
                previewTop: pv0.top,
                previewAspect: pv0.aspect,
                ...morphFromExpand(1, pv0, cardW, layoutVh, measuredHero),
            };
        }

        if (i === cardIndex && transitioning) {
            const cardW = stageWidth - settledGeom.totalW;

            return {
                visible: true,
                mode: "exiting",
                left: 0,
                width: cardW,
                slideX: -moveE * 100,
                zIndex: Math.round(lerp(Z_ACTIVE, Z_EXIT, moveE)),
                scatterFrac: lerp(autoScatter, 0, moveE),
                contentFrac: lerp(1, 0, moveE),
                isStrip: false,
                stackPos: 0,
                previewW: pv0.w,
                previewTop: pv0.top,
                previewAspect: pv0.aspect,
                ...morphFromExpand(1, pv0, cardW, layoutVh, measuredHero),
            };
        }

        if (i === cardIndex + 1 && transitioning) {
            const nextStack = stackCountAfter(cardIndex + 1);
            const entering = getEntering(
                cardFrac,
                settledGeom.positions[0] ?? 0,
                settledGeom.widths[0] ?? 0,
                nextStack
            );

            return {
                visible: true,
                mode: "entering",
                ...entering,
                zIndex: Math.round(
                    lerp(stripZ(0), Z_ACTIVE, easeOnce(cardFrac))
                ),
            };
        }

        const stackStart = cardIndex + 1 + (transitioning ? 1 : 0);
        const stackN = stackCountAfter(
            cardIndex + (transitioning ? 1 : 0)
        );
        const stackGeom = stackGeometry(stackN);

        if (i >= stackStart && i < stackStart + stackN) {
            const tier = i - stackStart;
            const to = stripLayout(tier, stackGeom);
            const isNewBack = transitioning && i > cardIndex + stackAfter;

            if (isNewBack) {
                const revealE = easeOnce(cardFrac);
                const peekW = stageWidth * MIN_STRIP_RATIO;
                const startPv = previewForTier(
                    Math.min(tier + 1, PREVIEW_BY_TIER.length - 1)
                );

                return {
                    visible: true,
                    mode: "strip",
                    left: lerp(stageWidth - peekW * 0.35, to.left, revealE),
                    width: lerp(peekW, to.width, revealE),
                    previewW: lerp(startPv.w * 0.92, to.previewW, revealE),
                    previewTop: lerp(startPv.top, to.previewTop, revealE),
                    previewAspect: lerp(
                        startPv.aspect,
                        to.previewAspect,
                        revealE
                    ),
                    slideX: 0,
                    zIndex: Math.round(
                        lerp(
                            stripZ(Math.min(tier + 1, MAX_STACK - 1)),
                            stripZ(tier),
                            revealE
                        )
                    ),
                    scatterFrac: 0,
                    contentFrac: 0,
                    isStrip: true,
                    stackPos: tier,
                    ...NO_MORPH,
                    panelExpand: 0,
                    stripReveal: revealE,
                };
            }

            if (transitioning) {
                const oldTier = i - (cardIndex + 1);
                const oldStack = stackGeometry(stackAfter);
                const from = stripLayout(oldTier, oldStack);
                const previewE = delayedMorph(moveE);

                return {
                    visible: true,
                    mode: "strip",
                    left: lerp(from.left, to.left, moveE),
                    width: lerp(from.width, to.width, moveE),
                    previewW: lerp(from.previewW, to.previewW, previewE),
                    previewTop: lerp(from.previewTop, to.previewTop, previewE),
                    previewAspect: lerp(
                        from.previewAspect,
                        to.previewAspect,
                        previewE
                    ),
                    slideX: 0,
                    zIndex: Math.round(
                        lerp(stripZ(oldTier), stripZ(tier), moveE)
                    ),
                    scatterFrac: 0,
                    contentFrac: 0,
                    isStrip: true,
                    stackPos: tier,
                    ...NO_MORPH,
                    panelExpand: 0,
                };
            }

            return {
                visible: true,
                mode: "strip",
                ...to,
                slideX: 0,
                zIndex: stripZ(tier),
                scatterFrac: 0,
                contentFrac: 0,
                isStrip: true,
                stackPos: tier,
                ...NO_MORPH,
                panelExpand: 0,
            };
        }

        return hidden;
    };

    const introStripTotal = Math.min(MAX_STACK, PROJECTS.length);
    const introGeom = stackGeometry(introStripTotal);
    const introPanelW = stageWidth - introGeom.totalW;
    const introFade =
        phase === "opening"
            ? Math.max(0, 1 - easeOnce(openFrac) * 1.1)
            : 1;
    const introVisible = phase !== "cards" && introFade > 0.02;

    const heroImagePriority = (i: number) => {
        const maxIdx = PROJECTS.length - 1;
        const nearActive = Math.abs(i - cardIndex) <= 2;
        const enteringNext =
            i === cardIndex + 1 && cardFrac > 0 && cardIndex < maxIdx;
        return nearActive || enteringNext || i === maxIdx;
    };

    return (
        <>
            <div
                id="portfolio"
                ref={wrapperRef}
                style={{ height: `${totalVh * 100}vh`, position: "relative" }}
            >
                <div
                    id="portfolio-entry"
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        top: `${INTRO_VH * 100}vh`,
                        width: 0,
                        height: 0,
                        pointerEvents: "none",
                    }}
                />

                <div className="pf-sticky">
                    <div className="pf-preload" aria-hidden="true">
                        {PRELOAD_MAIN_URLS.map((src) => (
                            <Image
                                key={`main-${src}`}
                                src={src}
                                alt=""
                                width={400}
                                height={560}
                                priority
                                onLoad={() => markLoaded(src)}
                                onError={() => markLoaded(src)}
                            />
                        ))}
                        {PRELOAD_SCATTER_URLS.map((src) => (
                            <Image
                                key={`sc-${src}`}
                                src={src}
                                alt=""
                                width={280}
                                height={360}
                                onLoad={() => markLoaded(src)}
                                onError={() => markLoaded(src)}
                            />
                        ))}
                    </div>

                    <div
                        className={`pf-loader ${!showLoader ? "pf-loader--done" : ""}`}
                        aria-live="polite"
                        aria-busy={!imagesReady}
                    >
                        <span className="pf-loader-label">Portfolio</span>
                        <div className="pf-loader-track">
                            <div
                                className="pf-loader-bar"
                                style={{
                                    transform: `scaleX(${Math.max(loadProgress, 0.04)})`,
                                }}
                            />
                        </div>
                        <span className="pf-loader-pct">
                            {Math.round(loadProgress * 100)}%
                        </span>
                    </div>

                    {layoutReady && introVisible && (
                        <div
                            className="pf-intro"
                            style={{
                                width: introPanelW,
                                opacity: introFade,
                            }}
                        >
                            <h1 className="pf-intro-title">Portfolio</h1>
                            <p className="pf-intro-desc">
                                The brand architecture for a home appliances
                                company was designed with a focus on
                                functionality and aesthetics, ensuring a
                                seamless user experience across all touchpoints.
                            </p>
                            <ul className="pf-intro-tags">
                                {INTRO_TAGS.map((tag) => (
                                    <li
                                        key={tag}
                                        className={
                                            tag === "Social Media Management"
                                                ? "pf-intro-tag pf-intro-tag--active"
                                                : "pf-intro-tag"
                                        }
                                    >
                                        {tag}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div
                        ref={heroMeasureRef}
                        className="pf-hero-measure"
                        aria-hidden="true"
                    >
                        <div className="pf-panel">
                            <header className="pf-header pf-header--probe">
                                <h2 className="pf-title">Probe</h2>
                                <span className="pf-year">2025</span>
                            </header>
                            <div className="pf-scatter">
                                <div
                                    ref={heroProbeRef}
                                    className="pf-scatter-main"
                                />
                            </div>
                            <footer className="pf-footer pf-footer--probe">
                                <span className="pf-about-label">Branding</span>
                                <p className="pf-about-text">Probe layout</p>
                            </footer>
                        </div>
                    </div>

                    <div
                        ref={stageRef}
                        className="pf-stage"
                        suppressHydrationWarning
                    >
                        {layoutReady &&
                            PROJECTS.map((project, i) => {
                            const layout = getCardLayout(i);
                            if (!layout.visible) return null;

                            return (
                                <div
                                    key={project.id}
                                    className={`pf-card pf-card--${layout.mode}`}
                                    style={{
                                        width: layout.width,
                                        left: layout.left,
                                        transform: `translateX(${layout.slideX}%)`,
                                        zIndex: layout.zIndex,
                                        opacity: layout.isStrip
                                            ? layout.stripReveal
                                            : 1,
                                        ["--stack-pos" as string]:
                                            layout.stackPos,
                                    }}
                                >
                                    <div
                                        className={`pf-panel ${
                                            layout.isStrip
                                                ? "pf-panel--strip"
                                                : layout.useMainMorph &&
                                                    layout.panelExpand < 1
                                                  ? "pf-panel--expanding"
                                                  : ""
                                        }`}
                                        style={{
                                            ["--content-f" as string]:
                                                layout.contentFrac,
                                            ["--scatter-f" as string]:
                                                layout.scatterFrac,
                                            ["--panel-f" as string]:
                                                layout.panelExpand,
                                        }}
                                    >
                                        {layout.useMainMorph && (
                                            <div
                                                className="pf-main-morph"
                                                style={{
                                                    ["--mm" as string]:
                                                        layout.mainMorph,
                                                    ["--mm-sw" as string]: `${layout.morphStartW}px`,
                                                    ["--mm-sh" as string]: `${layout.morphStartH}px`,
                                                    ["--mm-st" as string]:
                                                        layout.morphStartTop,
                                                    ["--mm-ew" as string]: `${layout.heroEndW}px`,
                                                    ["--mm-eh" as string]: `${layout.heroEndH}px`,
                                                    ["--mm-et" as string]:
                                                        layout.heroEndTopVh,
                                                }}
                                            >
                                                <PfImg
                                                    src={project.mainImage}
                                                    alt={project.title}
                                                    sizes="280px"
                                                    priority={heroImagePriority(
                                                        i
                                                    )}
                                                    imagesReady={imagesReady}
                                                />
                                            </div>
                                        )}

                                        {layout.isStrip ? (
                                            <>
                                                <div
                                                    className="pf-strip-preview"
                                                    style={{
                                                        ["--pv-w" as string]:
                                                            layout.previewW,
                                                        ["--pv-top" as string]:
                                                            layout.previewTop,
                                                        ["--pv-ar" as string]:
                                                            layout.previewAspect,
                                                    }}
                                                >
                                                    <PfImg
                                                        src={project.mainImage}
                                                        alt=""
                                                        sizes="280px"
                                                        priority={heroImagePriority(
                                                            i
                                                        )}
                                                        imagesReady={
                                                            imagesReady
                                                        }
                                                    />
                                                </div>
                                                <span
                                                    className="pf-strip-num"
                                                    style={{
                                                        opacity:
                                                            1 -
                                                            layout.panelExpand *
                                                                1.4,
                                                    }}
                                                >
                                                    {project.id}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                {layout.panelExpand < 0.92 && (
                                                    <span
                                                        className="pf-strip-num"
                                                        style={{
                                                            opacity: Math.max(
                                                                0,
                                                                1 -
                                                                    layout.panelExpand *
                                                                        1.4
                                                            ),
                                                        }}
                                                    >
                                                        {project.id}
                                                    </span>
                                                )}

                                                <header className="pf-header">
                                                    <h2 className="pf-title">
                                                        {project.title}
                                                    </h2>
                                                    <span className="pf-year">
                                                        {project.year}
                                                    </span>
                                                </header>

                                                <div className="pf-scatter">
                                                    {project.scatter.map(
                                                        (src, j) => {
                                                            const off =
                                                                SCATTER_OFFSETS[
                                                                    j %
                                                                        SCATTER_OFFSETS
                                                                            .length
                                                                ];
                                                            const itemSf = EASE(
                                                                clamp01(
                                                                    (layout.scatterFrac -
                                                                        j * 0.09) /
                                                                        Math.max(
                                                                            0.15,
                                                                            1 -
                                                                                j *
                                                                                    0.09
                                                                        )
                                                                )
                                                            );
                                                            return (
                                                                <div
                                                                    key={j}
                                                                    className="pf-scatter-item"
                                                                    style={{
                                                                        ["--sx" as string]: `${off.x}px`,
                                                                        ["--sy" as string]: `${off.y}px`,
                                                                        ["--sr" as string]: off.r,
                                                                        ["--sf" as string]:
                                                                            itemSf,
                                                                    }}
                                                                >
                                                                    <PfImg
                                                                        src={src}
                                                                        alt=""
                                                                        sizes="200px"
                                                                        imagesReady={
                                                                            imagesReady
                                                                        }
                                                                    />
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                                    <div
                                                        className={`pf-scatter-main ${
                                                            layout.useMainMorph
                                                                ? "pf-scatter-main--morphing"
                                                                : ""
                                                        }`}
                                                    >
                                                        {!layout.useMainMorph && (
                                                            <PfImg
                                                                src={
                                                                    project.mainImage
                                                                }
                                                                alt={
                                                                    project.title
                                                                }
                                                                sizes="240px"
                                                                priority={heroImagePriority(
                                                                    i
                                                                )}
                                                                imagesReady={
                                                                    imagesReady
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                </div>

                                                <footer className="pf-footer">
                                                    <span className="pf-about-label">
                                                        Branding
                                                    </span>
                                                    <span className="pf-about-label pf-about-label--second">
                                                        Branding
                                                    </span>
                                                    <p className="pf-about-text">
                                                        {project.description}
                                                    </p>
                                                </footer>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .pf-sticky {
                    position: sticky;
                    top: 0;
                    width: 100%;
                    height: 100vh;
                    overflow: hidden;
                    background: #c4c4c4;
                }

                .pf-hero-measure {
                    position: absolute;
                    inset: 0;
                    z-index: -1;
                    visibility: hidden;
                    pointer-events: none;
                }

                .pf-header--probe,
                .pf-footer--probe {
                    opacity: 1;
                    transform: none;
                }

                .pf-preload {
                    position: absolute;
                    width: 0;
                    height: 0;
                    overflow: hidden;
                    opacity: 0;
                    pointer-events: none;
                }

                .pf-loader {
                    position: absolute;
                    inset: 0;
                    z-index: 50;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    background: #c4c4c4;
                    transition: opacity 0.5s ease, visibility 0.5s ease;
                }

                .pf-loader--done {
                    opacity: 0;
                    visibility: hidden;
                    pointer-events: none;
                }

                .pf-loader-label {
                    font-family: "Francy", serif;
                    font-size: 56px;
                    color: #ffffff;
                    letter-spacing: -0.02em;
                }

                .pf-loader-track {
                    width: 200px;
                    height: 2px;
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 2px;
                    overflow: hidden;
                }

                .pf-loader-bar {
                    height: 100%;
                    width: 100%;
                    background: rgba(255, 255, 255, 0.75);
                    transform-origin: left center;
                    transition: transform 0.25s ease;
                }

                .pf-loader-pct {
                    font-family: "Francy", serif;
                    font-size: 13px;
                    color: rgba(60, 60, 60, 0.5);
                    letter-spacing: 0.06em;
                }

                /* ── Intro panel (left) ── */
                .pf-intro {
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    z-index: 15;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: calc(var(--nav-h, 110px) + 32px) 72px 80px;
                    pointer-events: none;
                }

                .pf-intro-title {
                    font-family: "Francy", serif;
                    font-size: clamp(72px, 9.5vw, 128px);
                    font-weight: 400;
                    color: #ffffff;
                    margin: 0 0 36px;
                    line-height: 0.92;
                    letter-spacing: -0.03em;
                }

                .pf-intro-desc {
                    font-family: "Cormorant Garamond", Georgia, serif;
                    font-size: 15px;
                    font-weight: 300;
                    color: rgba(45, 45, 45, 0.72);
                    line-height: 1.75;
                    margin: 0 0 48px;
                    max-width: 480px;
                }

                .pf-intro-tags {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px 28px;
                }

                .pf-intro-tag {
                    font-family: "Francy", serif;
                    font-size: 14px;
                    color: rgba(45, 45, 45, 0.38);
                    letter-spacing: 0.01em;
                }

                .pf-intro-tag--active {
                    color: rgba(30, 30, 30, 0.82);
                    font-weight: 500;
                }

                /* ── Stage & cards ── */
                .pf-stage {
                    position: absolute;
                    inset: 0;
                    z-index: 10;
                }

                .pf-card {
                    position: absolute;
                    top: 0;
                    height: 100%;
                    will-change: transform, width, left;
                }

                .pf-card--active,
                .pf-card--entering {
                    filter: drop-shadow(8px 0 24px rgba(0, 0, 0, 0.14));
                }

                .pf-card--strip {
                    filter: drop-shadow(
                        -6px 0 16px rgba(0, 0, 0, 0.1)
                    );
                }

                .pf-panel {
                    height: 100%;
                    background: #c4c4c4;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    padding: calc(var(--nav-h, 110px) + 16px) 72px 56px;
                }

                .pf-panel--strip {
                    padding: 0;
                    position: relative;
                    border-left: 1px solid rgba(255, 255, 255, 0.18);
                }

                .pf-panel--expanding {
                    position: relative;
                    padding: calc(
                            (var(--nav-h, 110px) + 16px) * var(--panel-f, 0)
                        )
                        calc(72px * var(--panel-f, 0))
                        calc(56px * var(--panel-f, 0));
                    border-left: 1px solid
                        rgba(255, 255, 255, calc(0.18 * (1 - var(--panel-f, 0))));
                }

                .pf-main-morph {
                    position: absolute;
                    left: 50%;
                    z-index: 12;
                    overflow: hidden;
                    background: #b8b8b8;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
                    opacity: 1;
                    transform: translateX(-50%);
                    top: calc(
                        (
                                var(--mm-st) * (1 - var(--mm)) +
                                    var(--mm-et) * var(--mm)
                            ) * 100vh
                    );
                    width: calc(
                        var(--mm-sw) * (1 - var(--mm)) + var(--mm-ew) * var(--mm)
                    );
                    height: calc(
                        var(--mm-sh) * (1 - var(--mm)) + var(--mm-eh) * var(--mm)
                    );
                    pointer-events: none;
                }

                .pf-main-morph :global(img) {
                    object-position: center center !important;
                }

                /* ── Tiered strip previews ── */
                .pf-strip-preview {
                    position: absolute;
                    left: 50%;
                    top: calc(var(--pv-top, 0.4) * 100vh);
                    transform: translate(-50%, 0);
                    width: calc(var(--pv-w, 0.85) * 100%);
                    aspect-ratio: var(--pv-ar, 1.3);
                    overflow: hidden;
                    background: #b8b8b8;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
                }

                .pf-strip-preview :global(img) {
                    object-position: center center !important;
                }

                .pf-strip-num {
                    position: absolute;
                    bottom: 44px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-family: "Francy", serif;
                    font-size: clamp(22px, 2vw, 30px);
                    font-weight: 400;
                    color: rgba(255, 255, 255, 0.5);
                    letter-spacing: 0.04em;
                    z-index: 3;
                }

                /* ── Active card content ── */
                .pf-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 32px;
                    margin-bottom: 20px;
                    flex-shrink: 0;
                    opacity: var(--content-f, 0);
                    transform: translateY(
                        calc((1 - var(--content-f, 0)) * 20px)
                    );
                }

                .pf-title {
                    font-family: "Francy", serif;
                    font-size: clamp(28px, 3.8vw, 52px);
                    font-weight: 400;
                    color: #ffffff;
                    margin: 0;
                    line-height: 1.1;
                    letter-spacing: -0.01em;
                    text-transform: uppercase;
                    max-width: 72%;
                }

                .pf-year {
                    font-family: "Francy", serif;
                    font-size: 18px;
                    color: rgba(255, 255, 255, 0.65);
                    flex-shrink: 0;
                    padding-top: 6px;
                }

                .pf-scatter {
                    position: relative;
                    flex: 1;
                    min-height: 280px;
                    max-height: 46vh;
                    margin: 8px auto 0;
                    width: min(100%, 560px);
                }

                .pf-scatter-item,
                .pf-scatter-main {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    overflow: hidden;
                    box-shadow: 0 10px 32px rgba(0, 0, 0, 0.15);
                }

                .pf-scatter-item {
                    width: 196px;
                    height: 132px;
                    z-index: 2;
                    opacity: var(--sf, 0);
                    transform: translate(-50%, -50%)
                        translate(
                            calc(var(--sx, 0px) * var(--sf, 0)),
                            calc(var(--sy, 0px) * var(--sf, 0))
                        )
                        rotate(calc(var(--sr, 0) * var(--sf, 0) * 1deg))
                        scale(calc(0.55 + 0.45 * var(--sf, 0)));
                    filter: blur(calc((1 - var(--sf, 0)) * 3px));
                }

                .pf-scatter-main {
                    width: 248px;
                    height: 168px;
                    z-index: 10;
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }

                .pf-scatter-main--morphing {
                    opacity: 0;
                    pointer-events: none;
                }

                .pf-footer {
                    margin-top: auto;
                    max-width: 560px;
                    flex-shrink: 0;
                    opacity: var(--content-f, 0);
                    transform: translateY(
                        calc((1 - var(--content-f, 0)) * 16px)
                    );
                }

                .pf-about-label {
                    display: inline-block;
                    font-family: "Francy", serif;
                    font-size: 14px;
                    color: rgba(50, 50, 50, 0.55);
                    margin-right: 20px;
                    margin-bottom: 10px;
                }

                .pf-about-label--second {
                    margin-right: 0;
                }

                .pf-about-text {
                    font-family: "Cormorant Garamond", Georgia, serif;
                    font-size: 15px;
                    font-weight: 300;
                    color: rgba(50, 50, 50, 0.78);
                    line-height: 1.7;
                    margin: 0;
                }

                .pf-img-wrap {
                    position: absolute;
                    inset: 0;
                    background: #b0b0b0;
                }

                .pf-img-wrap :global(img) {
                    opacity: 1;
                }

                .pf-img-wrap--loaded :global(img),
                .pf-img-wrap.pf-img-wrap--priority :global(img) {
                    opacity: 1;
                }

                .pf-img-shimmer {
                    z-index: 1;
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        110deg,
                        #b0b0b0 0%,
                        #c8c8c8 45%,
                        #b0b0b0 90%
                    );
                    background-size: 200% 100%;
                    animation: pf-shimmer 1.2s ease-in-out infinite;
                }

                @keyframes pf-shimmer {
                    0% {
                        background-position: 100% 0;
                    }
                    100% {
                        background-position: -100% 0;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .pf-img-shimmer {
                        animation: none;
                    }
                }
            `}</style>
        </>
    );
}

/* ───────────────────────── Mobile experience ───────────────────────── */

/**
 * The desktop layout is a horizontal, scroll-driven stack that depends on a
 * wide viewport. On phones we render a dedicated vertical, editorial layout
 * with scroll-reveal animations instead — same content, same brand language,
 * but a touch-first design. The PC component above is untouched.
 */
function PortfolioMobile() {
    const [mounted, setMounted] = useState(false);
    const prefersReducedMotion = () =>
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const [visible, setVisible] = useState<boolean[]>(() => {
        const reduce = prefersReducedMotion();
        return PROJECTS.map(() => reduce);
    });
    const cardRefs = useRef<(HTMLElement | null)[]>([]);

    useEffect(() => {
        const id = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(id);
    }, []);

    useEffect(() => {
        if (prefersReducedMotion()) return;

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const idx = Number(
                        (entry.target as HTMLElement).dataset.idx
                    );
                    setVisible((prev) => {
                        if (prev[idx]) return prev;
                        const next = [...prev];
                        next[idx] = true;
                        return next;
                    });
                    io.unobserve(entry.target);
                });
            },
            { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
        );

        cardRefs.current.forEach((el) => el && io.observe(el));
        return () => io.disconnect();
    }, []);

    return (
        <section
            id="portfolio"
            className={`pfm ${mounted ? "pfm--in" : ""}`}
        >
            <span
                id="portfolio-entry"
                aria-hidden="true"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 0,
                    height: 0,
                    pointerEvents: "none",
                }}
            />
            <header className="pfm-intro">
                <span className="pfm-eyebrow">Selected Work</span>
                <h1 className="pfm-intro-title">Portfolio</h1>
                <p className="pfm-intro-desc">
                    The brand architecture for a home appliances company was
                    designed with a focus on functionality and aesthetics,
                    ensuring a seamless user experience across all touchpoints.
                </p>
                <ul className="pfm-intro-tags">
                    {INTRO_TAGS.map((tag) => (
                        <li
                            key={tag}
                            className={
                                tag === "Social Media Management"
                                    ? "pfm-intro-tag pfm-intro-tag--active"
                                    : "pfm-intro-tag"
                            }
                        >
                            {tag}
                        </li>
                    ))}
                </ul>
            </header>

            <div className="pfm-list">
                {PROJECTS.map((project, i) => (
                    <article
                        key={project.id}
                        data-idx={i}
                        ref={(el) => {
                            cardRefs.current[i] = el;
                        }}
                        className={`pfm-card ${
                            visible[i] ? "pfm-card--visible" : ""
                        }`}
                    >
                        <div className="pfm-card-head">
                            <span className="pfm-card-num">{project.id}</span>
                            <span className="pfm-card-year">
                                {project.year}
                            </span>
                        </div>

                        <h2 className="pfm-card-title">{project.title}</h2>

                        <div className="pfm-hero">
                            <PfImg
                                src={project.mainImage}
                                alt={project.title}
                                sizes="(max-width: 768px) 92vw, 480px"
                                imagesReady
                            />
                        </div>

                        <div className="pfm-thumbs">
                            {project.scatter.slice(0, 4).map((src, j) => (
                                <div
                                    key={j}
                                    className="pfm-thumb"
                                    style={{
                                        ["--d" as string]: `${j * 90}ms`,
                                    }}
                                >
                                    <PfImg
                                        src={src}
                                        alt=""
                                        sizes="(max-width: 768px) 44vw, 220px"
                                        imagesReady
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="pfm-card-foot">
                            <span className="pfm-card-label">Branding</span>
                            <p className="pfm-card-desc">
                                {project.description}
                            </p>
                        </div>
                    </article>
                ))}
            </div>

            <style jsx>{`
                .pfm {
                    position: relative;
                    background: #c4c4c4;
                    padding: calc(var(--nav-h, 110px) + 24px) 22px 96px;
                    overflow: hidden;
                }

                /* ── Intro ── */
                .pfm-intro {
                    margin-bottom: 56px;
                    opacity: 0;
                    transform: translateY(26px);
                    transition: opacity 0.7s ease, transform 0.7s ease;
                }

                .pfm--in .pfm-intro {
                    opacity: 1;
                    transform: translateY(0);
                }

                .pfm-eyebrow {
                    display: inline-block;
                    font-family: "Francy", serif;
                    font-size: 12px;
                    letter-spacing: 0.22em;
                    text-transform: uppercase;
                    color: rgba(45, 45, 45, 0.5);
                    margin-bottom: 14px;
                }

                .pfm-intro-title {
                    font-family: "Francy", serif;
                    font-size: clamp(56px, 22vw, 96px);
                    font-weight: 400;
                    color: #ffffff;
                    margin: 0 0 22px;
                    line-height: 0.9;
                    letter-spacing: -0.03em;
                }

                .pfm-intro-desc {
                    font-family: "Cormorant Garamond", Georgia, serif;
                    font-size: 16px;
                    font-weight: 300;
                    color: rgba(45, 45, 45, 0.74);
                    line-height: 1.75;
                    margin: 0 0 28px;
                    max-width: 38ch;
                }

                .pfm-intro-tags {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px 18px;
                }

                .pfm-intro-tag {
                    font-family: "Francy", serif;
                    font-size: 13px;
                    color: rgba(45, 45, 45, 0.4);
                }

                .pfm-intro-tag--active {
                    color: rgba(30, 30, 30, 0.85);
                    font-weight: 500;
                }

                /* ── Cards ── */
                .pfm-list {
                    display: flex;
                    flex-direction: column;
                    gap: 72px;
                }

                .pfm-card {
                    position: relative;
                }

                .pfm-card-head {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    border-top: 1px solid rgba(255, 255, 255, 0.4);
                    padding-top: 14px;
                    margin-bottom: 12px;
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.6s ease, transform 0.6s ease;
                }

                .pfm-card-num {
                    font-family: "Francy", serif;
                    font-size: 14px;
                    letter-spacing: 0.08em;
                    color: rgba(45, 45, 45, 0.55);
                }

                .pfm-card-year {
                    font-family: "Francy", serif;
                    font-size: 14px;
                    color: rgba(45, 45, 45, 0.55);
                }

                .pfm-card-title {
                    font-family: "Francy", serif;
                    font-size: clamp(26px, 8vw, 40px);
                    font-weight: 400;
                    color: #ffffff;
                    margin: 0 0 22px;
                    line-height: 1.08;
                    letter-spacing: -0.01em;
                    text-transform: uppercase;
                    opacity: 0;
                    transform: translateY(22px);
                    transition: opacity 0.6s ease 0.05s,
                        transform 0.6s ease 0.05s;
                }

                .pfm-hero {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 4 / 5;
                    overflow: hidden;
                    background: #b8b8b8;
                    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.18);
                    clip-path: inset(0 0 100% 0);
                    transform: scale(1.06);
                    transition: clip-path 0.85s cubic-bezier(0.16, 1, 0.3, 1)
                            0.08s,
                        transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.08s;
                }

                .pfm-thumbs {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    margin-top: 12px;
                }

                .pfm-thumb {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 1.3;
                    overflow: hidden;
                    background: #b8b8b8;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
                    opacity: 0;
                    transform: translateY(26px) scale(0.94);
                    transition: opacity 0.6s ease var(--d, 0ms),
                        transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)
                            var(--d, 0ms);
                }

                .pfm-card-foot {
                    margin-top: 22px;
                    opacity: 0;
                    transform: translateY(18px);
                    transition: opacity 0.6s ease 0.12s,
                        transform 0.6s ease 0.12s;
                }

                .pfm-card-label {
                    display: inline-block;
                    font-family: "Francy", serif;
                    font-size: 13px;
                    letter-spacing: 0.04em;
                    color: rgba(50, 50, 50, 0.55);
                    margin-bottom: 8px;
                }

                .pfm-card-desc {
                    font-family: "Cormorant Garamond", Georgia, serif;
                    font-size: 15px;
                    font-weight: 300;
                    color: rgba(50, 50, 50, 0.8);
                    line-height: 1.7;
                    margin: 0;
                }

                /* ── Reveal state ── */
                .pfm-card--visible .pfm-card-head,
                .pfm-card--visible .pfm-card-title,
                .pfm-card--visible .pfm-card-foot {
                    opacity: 1;
                    transform: translateY(0);
                }

                .pfm-card--visible .pfm-hero {
                    clip-path: inset(0 0 0 0);
                    transform: scale(1);
                }

                .pfm-card--visible .pfm-thumb {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }

                @media (prefers-reduced-motion: reduce) {
                    .pfm-intro,
                    .pfm-card-head,
                    .pfm-card-title,
                    .pfm-card-foot,
                    .pfm-hero,
                    .pfm-thumb {
                        opacity: 1;
                        transform: none;
                        clip-path: none;
                        transition: none;
                    }
                }
            `}</style>
        </section>
    );
}

/**
 * Responsive entry point. Renders the untouched desktop experience on wide
 * viewports and the dedicated mobile layout on phones. Starts on desktop so
 * SSR and first client paint match, then swaps after measuring the viewport.
 */
export default function Portfolio() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 768px)");
        const update = () => setIsMobile(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    return isMobile ? <PortfolioMobile /> : <PortfolioDesktop />;
}
