"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

const STRIP_W = 54;
const MAX_STACK = 3;
const EASE = (t: number) => 1 - Math.pow(1 - t, 3);

const PROJECTS = [
    {
        id: "01",
        title: "Planetary Resilience Institution",
        year: "2024",
        about: "About Planetary Resilience Institution",
        description:
            "A comprehensive brand identity for an environmental research body — spanning logo, print, digital touchpoints, and a full visual language built around sustainability and scientific rigor.",
        mainImage:    "/images/portfolio/PR/1.png",
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
        title: "Aurora Studio Collective",
        year: "2024",
        about: "About Aurora Studio Collective",
        description:
            "Visual identity and web presence for a creative studio — bold typography, motion-led brand assets, and a portfolio site designed to showcase multidisciplinary work.",
        mainImage: "https://picsum.photos/seed/aur-main/400/700",
        cover: "https://picsum.photos/seed/aur-cover/300/800",
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
    p.cover,
    ...p.scatter,
]);

type Phase = "intro" | "opening" | "cards";

type CardLayout = {
    visible: boolean;
    mode: "past" | "active" | "exiting" | "entering" | "stack";
    left?: number;
    width: number;
    translateX: number;
    zIndex: number;
    scatterActive: boolean;
    stripOnly: boolean;
};

function usePreloadProgress(total: number) {
    const loadedRef = useRef(new Set<string>());
    const [count, setCount] = useState(0);

    const markLoaded = useCallback((src: string) => {
        if (loadedRef.current.has(src)) return;
        loadedRef.current.add(src);
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
    className,
}: {
    src: string;
    alt: string;
    sizes: string;
    priority?: boolean;
    className?: string;
}) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className={`pf-img-wrap ${loaded ? "pf-img-wrap--loaded" : ""} ${className ?? ""}`}>
            {!loaded && <span className="pf-img-shimmer" aria-hidden="true" />}
            <Image
                src={src}
                alt={alt}
                fill
                sizes={sizes}
                priority={priority}
                onLoad={() => setLoaded(true)}
                style={{ objectFit: "cover" }}
            />
        </div>
    );
}

export default function Portfolio() {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const [stageWidth, setStageWidth] = useState(0);
    const [phase, setPhase] = useState<Phase>("intro");
    const [openFrac, setOpenFrac] = useState(0);
    const [cardIndex, setCardIndex] = useState(0);
    const [cardFrac, setCardFrac] = useState(0);
    const [showLoader, setShowLoader] = useState(true);

    const imageUrls = useMemo(() => ALL_IMAGE_URLS, []);
    const { progress: loadProgress, ready: imagesReady, markLoaded } =
        usePreloadProgress(imageUrls.length);

    const INTRO_VH = 0.35;
    const OPEN_VH = 0.55;
    const CARD_VH = 1.25;
    const HOLD_RATIO = 0.5;

    const totalVh =
        INTRO_VH + OPEN_VH + PROJECTS.length * CARD_VH + 0.5;

    const measureStage = useCallback(() => {
        if (stageRef.current) {
            setStageWidth(stageRef.current.offsetWidth);
        }
    }, []);

    useEffect(() => {
        measureStage();
        window.addEventListener("resize", measureStage, { passive: true });
        return () => window.removeEventListener("resize", measureStage);
    }, [measureStage]);

    useEffect(() => {
        if (!imagesReady) return;
        const t = window.setTimeout(() => setShowLoader(false), 280);
        return () => window.clearTimeout(t);
    }, [imagesReady]);

    useEffect(() => {
        const handleScroll = () => {
            const wrapper = wrapperRef.current;
            if (!wrapper) return;

            const scrolled = -wrapper.getBoundingClientRect().top;
            const vh = window.innerHeight;

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
                const raw = (scrolled - introEnd) / (OPEN_VH * vh);
                setOpenFrac(EASE(raw));
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
                      ? EASE((seg - HOLD_RATIO) / (1 - HOLD_RATIO))
                      : 0;

            setCardIndex(idx);
            setCardFrac(frac);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll, { passive: true });
        handleScroll();
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, []);

    const getStackCount = (baseIndex: number, includeIncomingInStack: boolean) => {
        const remaining =
            PROJECTS.length - baseIndex - (includeIncomingInStack ? 0 : 1);
        return Math.min(MAX_STACK, Math.max(0, remaining));
    };

    const getEnteringLayout = (
        t: number,
        stackBefore: number,
        stackAfter: number
    ): Pick<CardLayout, "width" | "left" | "scatterActive" | "stripOnly"> => {
        const widthEnd = stageWidth - stackAfter * STRIP_W;
        const leftStart = stageWidth - stackBefore * STRIP_W;
        return {
            width: STRIP_W + t * (widthEnd - STRIP_W),
            left: leftStart * (1 - t),
            scatterActive: t > 0.62,
            stripOnly: t < 0.28,
        };
    };

    const getCardLayout = (i: number): CardLayout => {
        const hidden: CardLayout = {
            visible: false,
            mode: "stack",
            width: STRIP_W,
            translateX: 0,
            zIndex: 0,
            scatterActive: false,
            stripOnly: true,
        };

        if (stageWidth === 0) return hidden;

        if (phase === "intro") return hidden;

        if (phase === "opening") {
            const t = openFrac;
            const stackBefore = Math.min(MAX_STACK, PROJECTS.length);
            const stackAfter = getStackCount(0, false);

            if (i === 0) {
                const entering = getEnteringLayout(t, stackBefore, stackAfter);
                return {
                    visible: true,
                    mode: t < 1 ? "entering" : "active",
                    ...entering,
                    translateX: 0,
                    zIndex: 18,
                };
            }

            if (i >= 1 && i < stackBefore) {
                const stackCount = stackBefore - 1;
                const pos = i - 1;
                return {
                    visible: true,
                    mode: "stack",
                    width: STRIP_W,
                    left: stageWidth - (stackCount - pos) * STRIP_W,
                    translateX: 0,
                    zIndex: 8 + pos,
                    scatterActive: false,
                    stripOnly: true,
                };
            }

            return hidden;
        }

        const maxIdx = PROJECTS.length - 1;
        const isTransitioning = cardFrac > 0 && cardIndex < maxIdx;
        const t = cardFrac;

        if (i < cardIndex) {
            return {
                visible: true,
                mode: "past",
                width: stageWidth - getStackCount(cardIndex, false) * STRIP_W,
                left: 0,
                translateX: -105,
                zIndex: 1,
                scatterActive: false,
                stripOnly: false,
            };
        }

        if (i === cardIndex && !isTransitioning) {
            const stackCount = getStackCount(cardIndex, false);
            return {
                visible: true,
                mode: "active",
                width: stageWidth - stackCount * STRIP_W,
                left: 0,
                translateX: 0,
                zIndex: 20,
                scatterActive: true,
                stripOnly: false,
            };
        }

        if (i === cardIndex && isTransitioning) {
            const stackCount = getStackCount(cardIndex, false);
            return {
                visible: true,
                mode: "exiting",
                width: stageWidth - stackCount * STRIP_W,
                left: 0,
                translateX: -t * 100,
                zIndex: 15,
                scatterActive: t < 0.35,
                stripOnly: false,
            };
        }

        if (i === cardIndex + 1 && isTransitioning) {
            const stackBefore = getStackCount(cardIndex, true);
            const stackAfter = getStackCount(cardIndex + 1, false);
            const entering = getEnteringLayout(t, stackBefore, stackAfter);
            return {
                visible: true,
                mode: "entering",
                ...entering,
                translateX: 0,
                zIndex: 18,
            };
        }

        const stackStart = cardIndex + 1 + (isTransitioning ? 1 : 0);
        const stackEnd = stackStart + MAX_STACK - 1;

        if (i >= stackStart && i <= stackEnd) {
            const stackCount = getStackCount(
                cardIndex + (isTransitioning ? 1 : 0),
                false
            );
            const pos = i - stackStart;
            if (pos >= stackCount) return hidden;

            return {
                visible: true,
                mode: "stack",
                width: STRIP_W,
                left: stageWidth - (stackCount - pos) * STRIP_W,
                translateX: 0,
                zIndex: 8 + pos,
                scatterActive: false,
                stripOnly: true,
            };
        }

        return hidden;
    };

    const introOpacity =
        phase === "intro"
            ? 1
            : phase === "opening"
              ? Math.max(0, 1 - openFrac * 3.2)
              : 0;
    const introVisible = introOpacity > 0.02;

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
                    <div className="pf-bg" />

                    <div
                        className="pf-preload"
                        aria-hidden="true"
                    >
                        {imageUrls.map((src) => (
                            <Image
                                key={src}
                                src={src}
                                alt=""
                                width={280}
                                height={360}
                                priority
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

                    <div
                        className="pf-intro"
                        style={{
                            opacity: introOpacity,
                            visibility: introVisible ? "visible" : "hidden",
                            pointerEvents: introVisible ? "auto" : "none",
                        }}
                    >
                        <h1 className="pf-intro-title">Portfolio</h1>
                        <span className="pf-intro-index">01</span>
                    </div>

                    <div ref={stageRef} className="pf-stage">
                        {PROJECTS.map((project, i) => {
                            const layout = getCardLayout(i);
                            if (!layout.visible) return null;

                            return (
                                <div
                                    key={project.id}
                                    className={`pf-card pf-card--${layout.mode}`}
                                    style={{
                                        width: layout.width,
                                        left: layout.left,
                                        transform: `translateX(${layout.translateX}%)`,
                                        zIndex: layout.zIndex,
                                    }}
                                >
                                    <div
                                        className={`pf-card-panel ${
                                            layout.stripOnly
                                                ? "pf-card-panel--strip"
                                                : ""
                                        }`}
                                    >
                                        {layout.stripOnly ? (
                                            <>
                                                <div className="pf-strip-img">
                                                    <PfImg
                                                        src={project.cover}
                                                        alt=""
                                                        sizes="60px"
                                                    />
                                                </div>
                                                <span className="pf-strip-num">
                                                    {project.id}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="pf-card-header">
                                                    <h2 className="pf-card-title">
                                                        {project.title}
                                                    </h2>
                                                    <span className="pf-card-year">
                                                        {project.year}
                                                    </span>
                                                </div>

                                                <div
                                                    className={`pf-scatter ${
                                                        layout.scatterActive
                                                            ? "pf-scatter--active"
                                                            : ""
                                                    }`}
                                                >
                                                    {project.scatter.map(
                                                        (src, j) => (
                                                            <div
                                                                key={j}
                                                                className={`pf-scatter-item pf-scatter-item--${j}`}
                                                            >
                                                                <PfImg
                                                                    src={src}
                                                                    alt=""
                                                                    sizes="180px"
                                                                />
                                                            </div>
                                                        )
                                                    )}
                                                    <div className="pf-scatter-main">
                                                        <PfImg
                                                            src={
                                                                project.mainImage
                                                            }
                                                            alt={project.title}
                                                            sizes="200px"
                                                            priority={i <= 1}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pf-card-footer">
                                                    <span className="pf-about-label">
                                                        {project.about}
                                                    </span>
                                                    <p className="pf-about-text">
                                                        {project.description}
                                                    </p>
                                                </div>
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

                .pf-bg {
                    position: absolute;
                    inset: 0;
                    background: #c4c4c4;
                    z-index: 0;
                }

                .pf-preload {
                    position: absolute;
                    width: 0;
                    height: 0;
                    overflow: hidden;
                    opacity: 0;
                    pointer-events: none;
                    z-index: -1;
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
                    transition: opacity 0.55s ease, visibility 0.55s ease;
                }

                .pf-loader--done {
                    opacity: 0;
                    visibility: hidden;
                    pointer-events: none;
                }

                .pf-loader-label {
                    font-family: "Francy", serif;
                    font-size: clamp(32px, 5vw, 56px);
                    color: rgba(255, 255, 255, 0.9);
                    letter-spacing: -0.02em;
                }

                .pf-loader-track {
                    width: min(200px, 40vw);
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

                .pf-intro {
                    position: absolute;
                    inset: 0;
                    z-index: 30;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: #c4c4c4;
                    will-change: opacity;
                }

                .pf-intro-title {
                    font-family: "Francy", serif;
                    font-size: clamp(48px, 8vw, 96px);
                    font-weight: 400;
                    color: #ffffff;
                    margin: 0;
                    line-height: 1;
                    letter-spacing: -0.02em;
                }

                .pf-intro-index {
                    position: absolute;
                    bottom: clamp(32px, 6vh, 64px);
                    left: 50%;
                    transform: translateX(-50%);
                    font-family: "Francy", serif;
                    font-size: clamp(14px, 1.2vw, 18px);
                    color: rgba(255, 255, 255, 0.85);
                    letter-spacing: 0.05em;
                }

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

                .pf-card--stack {
                    filter: drop-shadow(-8px 0 14px rgba(0, 0, 0, 0.14));
                }

                .pf-card--active,
                .pf-card--entering {
                    filter: drop-shadow(-10px 0 22px rgba(0, 0, 0, 0.16));
                }

                .pf-card--exiting {
                    filter: drop-shadow(-6px 0 16px rgba(0, 0, 0, 0.1));
                }

                .pf-card-panel {
                    height: 100%;
                    background: #c4c4c4;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    padding: calc(var(--nav-h, 110px) + 12px) clamp(28px, 5vw, 72px)
                        clamp(28px, 4vh, 48px);
                }

                .pf-card-panel--strip {
                    padding: 0;
                    position: relative;
                }

                .pf-img-wrap {
                    position: absolute;
                    inset: 0;
                    background: #b0b0b0;
                }

                .pf-img-wrap :global(img) {
                    opacity: 0;
                    transition: opacity 0.45s ease;
                }

                .pf-img-wrap--loaded :global(img) {
                    opacity: 1;
                }

                .pf-img-shimmer {
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

                .pf-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 24px;
                    margin-bottom: clamp(12px, 2vh, 24px);
                    flex-shrink: 0;
                }

                .pf-card-title {
                    font-family: "Francy", serif;
                    font-size: clamp(22px, 3.2vw, 42px);
                    font-weight: 400;
                    color: #ffffff;
                    margin: 0;
                    line-height: 1.15;
                    letter-spacing: -0.01em;
                    max-width: 70%;
                }

                .pf-card-year {
                    font-family: "Francy", serif;
                    font-size: clamp(14px, 1.2vw, 18px);
                    color: rgba(255, 255, 255, 0.7);
                    flex-shrink: 0;
                }

                .pf-scatter {
                    position: relative;
                    flex: 1;
                    min-height: 200px;
                    max-height: 38vh;
                    margin: 0 auto;
                    width: min(100%, 500px);
                }

                .pf-scatter-item,
                .pf-scatter-main {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    overflow: hidden;
                    box-shadow: 0 10px 32px rgba(0, 0, 0, 0.16);
                }

                .pf-scatter-item {
                    width: clamp(96px, 13vw, 140px);
                    height: clamp(124px, 17vw, 176px);
                    z-index: 1;
                    transform: translate(-50%, -50%) scale(0.15);
                    opacity: 0;
                    transition:
                        transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                        opacity 0.3s ease;
                }

                .pf-scatter-main {
                    width: clamp(116px, 15vw, 168px);
                    height: clamp(190px, 26vw, 290px);
                    z-index: 10;
                    transform: translate(-50%, -50%) scale(0.4);
                    opacity: 0;
                    transition:
                        transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                        opacity 0.28s ease;
                }

                .pf-scatter--active .pf-scatter-main {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }

                .pf-scatter--active .pf-scatter-item {
                    opacity: 1;
                }

                .pf-scatter--active .pf-scatter-item--0 {
                    transform: translate(calc(-50% - 120px), calc(-50% - 28px))
                        rotate(-13deg) scale(1);
                    transition-delay: 0.03s;
                }

                .pf-scatter--active .pf-scatter-item--1 {
                    transform: translate(calc(-50% + 112px), calc(-50% - 44px))
                        rotate(9deg) scale(1);
                    transition-delay: 0.06s;
                }

                .pf-scatter--active .pf-scatter-item--2 {
                    transform: translate(calc(-50% - 92px), calc(-50% + 54px))
                        rotate(-7deg) scale(1);
                    transition-delay: 0.09s;
                }

                .pf-scatter--active .pf-scatter-item--3 {
                    transform: translate(calc(-50% + 100px), calc(-50% + 46px))
                        rotate(11deg) scale(1);
                    transition-delay: 0.12s;
                }

                .pf-card-footer {
                    margin-top: auto;
                    max-width: 520px;
                    flex-shrink: 0;
                }

                .pf-about-label {
                    display: block;
                    font-family: "Francy", serif;
                    font-size: clamp(13px, 1.1vw, 15px);
                    color: rgba(50, 50, 50, 0.6);
                    margin-bottom: 8px;
                }

                .pf-about-text {
                    font-family: "Cormorant Garamond", Georgia, serif;
                    font-size: clamp(13px, 1.05vw, 15px);
                    font-weight: 300;
                    color: rgba(50, 50, 50, 0.75);
                    line-height: 1.7;
                    margin: 0;
                }

                .pf-strip-img {
                    position: absolute;
                    inset: 0;
                }

                .pf-strip-img::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    box-shadow: inset 6px 0 12px rgba(0, 0, 0, 0.12);
                    pointer-events: none;
                    z-index: 2;
                }

                .pf-strip-num {
                    position: absolute;
                    bottom: clamp(24px, 4vh, 48px);
                    left: 50%;
                    transform: translateX(-50%) rotate(-90deg);
                    font-family: "Francy", serif;
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.85);
                    letter-spacing: 0.08em;
                    white-space: nowrap;
                    z-index: 3;
                }

                @media (max-width: 768px) {
                    .pf-scatter--active .pf-scatter-item--2,
                    .pf-scatter--active .pf-scatter-item--3 {
                        opacity: 0;
                    }
                }
            `}</style>
        </>
    );
}
