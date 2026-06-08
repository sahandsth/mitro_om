"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

const STRIP_W = 54;
const MAX_STACK = 3;
const HOLD_RATIO = 0.62;
const EASE = (t: number) => 1 - Math.pow(1 - t, 3);

const CATEGORIES = [
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
        year: "2024",
        about: "About Planetary Resilience Institution",
        description:
            "A comprehensive brand identity for an environmental research body — spanning logo, print, digital touchpoints, and a full visual language built around sustainability and scientific rigor.",
        mainImage: "https://picsum.photos/seed/pri-main/400/700",
        cover: "https://picsum.photos/seed/pri-cover/300/800",
        scatter: [
            "https://picsum.photos/seed/pri-s1/280/360",
            "https://picsum.photos/seed/pri-s2/280/360",
            "https://picsum.photos/seed/pri-s3/280/360",
            "https://picsum.photos/seed/pri-s4/280/360",
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

type Phase = "intro" | "transition" | "cards";

type CardLayout = {
    visible: boolean;
    mode: "past" | "active" | "exiting" | "entering" | "stack";
    left?: number;
    width: number;
    translateX: number;
    zIndex: number;
    stackPos?: number;
    scatterActive: boolean;
    stripOnly: boolean;
};

export default function Portfolio() {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const [stageWidth, setStageWidth] = useState(0);
    const [phase, setPhase] = useState<Phase>("intro");
    const [cardIndex, setCardIndex] = useState(0);
    const [cardFrac, setCardFrac] = useState(0);

    const INTRO_VH = 1;
    const TRANSITION_VH = 0.75;
    const CARD_VH = 1.4;

    const totalVh =
        INTRO_VH + TRANSITION_VH + PROJECTS.length * CARD_VH + 0.5;

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
        const handleScroll = () => {
            const wrapper = wrapperRef.current;
            if (!wrapper) return;

            const scrolled = -wrapper.getBoundingClientRect().top;
            const vh = window.innerHeight;

            if (scrolled < 0) {
                setPhase("intro");
                setCardIndex(0);
                setCardFrac(0);
                return;
            }

            const introEnd = INTRO_VH * vh;
            const transitionEnd = introEnd + TRANSITION_VH * vh;

            if (scrolled < introEnd) {
                setPhase("intro");
                setCardIndex(0);
                setCardFrac(0);
                return;
            }

            if (scrolled < transitionEnd) {
                setPhase("transition");
                setCardIndex(0);
                setCardFrac(0);
                return;
            }

            setPhase("cards");
            const perCard = CARD_VH * vh;
            const raw = (scrolled - transitionEnd) / perCard;
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

        if (phase === "transition") {
            if (i >= MAX_STACK) return hidden;
            const stackCount = Math.min(MAX_STACK, PROJECTS.length);
            return {
                visible: true,
                mode: "stack",
                width: STRIP_W,
                left: stageWidth - (stackCount - i) * STRIP_W,
                translateX: 0,
                zIndex: 5 + i,
                stackPos: i,
                scatterActive: false,
                stripOnly: true,
            };
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
                scatterActive: true,
                stripOnly: false,
            };
        }

        if (i === cardIndex + 1 && isTransitioning) {
            const stackBefore = getStackCount(cardIndex, true);
            const stackAfter = getStackCount(cardIndex + 1, false);
            const widthStart = STRIP_W;
            const widthEnd = stageWidth - stackAfter * STRIP_W;
            const leftStart = stageWidth - stackBefore * STRIP_W;
            return {
                visible: true,
                mode: "entering",
                width: widthStart + t * (widthEnd - widthStart),
                left: leftStart * (1 - t),
                translateX: 0,
                zIndex: 18,
                scatterActive: t > 0.55,
                stripOnly: t < 0.35,
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
                stackPos: pos,
                scatterActive: false,
                stripOnly: true,
            };
        }

        return hidden;
    };

    return (
        <>
            <div
                id="portfolio"
                ref={wrapperRef}
                style={{ height: `${totalVh * 100}vh`, position: "relative" }}
            >
                <div className="pf-sticky">
                    <div className="pf-bg" />

                    <div
                        className={`pf-intro
                            ${phase === "transition" ? "pf-intro--aside" : ""}
                            ${phase === "cards" ? "pf-intro--gone" : ""}
                        `}
                    >
                        <h1 className="pf-intro-title">Portfolio</h1>

                        {phase === "transition" && (
                            <ul className="pf-categories">
                                {CATEGORIES.map((cat) => (
                                    <li key={cat}>{cat}</li>
                                ))}
                            </ul>
                        )}

                        {phase === "intro" && (
                            <span className="pf-intro-index">01</span>
                        )}
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
                                                    <Image
                                                        src={project.cover}
                                                        alt=""
                                                        fill
                                                        sizes="60px"
                                                        style={{
                                                            objectFit: "cover",
                                                        }}
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
                                                                <Image
                                                                    src={src}
                                                                    alt=""
                                                                    fill
                                                                    sizes="180px"
                                                                    style={{
                                                                        objectFit:
                                                                            "cover",
                                                                    }}
                                                                />
                                                            </div>
                                                        )
                                                    )}
                                                    <div className="pf-scatter-main">
                                                        <Image
                                                            src={
                                                                project.mainImage
                                                            }
                                                            alt={project.title}
                                                            fill
                                                            sizes="200px"
                                                            style={{
                                                                objectFit:
                                                                    "cover",
                                                            }}
                                                            priority={i === 0}
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

                .pf-intro {
                    position: absolute;
                    inset: 0;
                    z-index: 30;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: #c4c4c4;
                    transition:
                        width 0.85s cubic-bezier(0.22, 1, 0.36, 1),
                        transform 0.85s cubic-bezier(0.22, 1, 0.36, 1),
                        opacity 0.6s ease;
                }

                .pf-intro--aside {
                    width: 38%;
                    align-items: flex-start;
                    justify-content: flex-start;
                    padding: calc(var(--nav-h, 110px) + 24px) clamp(24px, 4vw, 56px)
                        32px;
                }

                .pf-intro--gone {
                    opacity: 0;
                    pointer-events: none;
                    transform: translateX(-55%);
                }

                .pf-intro-title {
                    font-family: "Francy", serif;
                    font-size: clamp(48px, 8vw, 96px);
                    font-weight: 400;
                    color: #ffffff;
                    margin: 0;
                    line-height: 1;
                    letter-spacing: -0.02em;
                    transition: font-size 0.7s cubic-bezier(0.22, 1, 0.36, 1);
                }

                .pf-intro--aside .pf-intro-title {
                    font-size: clamp(36px, 5vw, 64px);
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

                .pf-categories {
                    list-style: none;
                    margin: clamp(28px, 4vh, 48px) 0 0;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    gap: clamp(6px, 1vh, 12px);
                }

                .pf-categories li {
                    font-family: "Francy", serif;
                    font-size: clamp(13px, 1.1vw, 16px);
                    color: rgba(60, 60, 60, 0.55);
                    letter-spacing: 0.02em;
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
                        transform 0.9s cubic-bezier(0.22, 1, 0.36, 1),
                        opacity 0.7s ease;
                }

                .pf-scatter-main {
                    width: clamp(116px, 15vw, 168px);
                    height: clamp(190px, 26vw, 290px);
                    z-index: 10;
                    transform: translate(-50%, -50%) scale(0.4);
                    opacity: 0;
                    transition:
                        transform 0.75s cubic-bezier(0.22, 1, 0.36, 1),
                        opacity 0.55s ease;
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
                    transition-delay: 0.08s;
                }

                .pf-scatter--active .pf-scatter-item--1 {
                    transform: translate(calc(-50% + 112px), calc(-50% - 44px))
                        rotate(9deg) scale(1);
                    transition-delay: 0.14s;
                }

                .pf-scatter--active .pf-scatter-item--2 {
                    transform: translate(calc(-50% - 92px), calc(-50% + 54px))
                        rotate(-7deg) scale(1);
                    transition-delay: 0.2s;
                }

                .pf-scatter--active .pf-scatter-item--3 {
                    transform: translate(calc(-50% + 100px), calc(-50% + 46px))
                        rotate(11deg) scale(1);
                    transition-delay: 0.26s;
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
                    z-index: 2;
                }

                @media (max-width: 768px) {
                    .pf-intro--aside {
                        width: 100%;
                        opacity: 0;
                        pointer-events: none;
                    }

                    .pf-scatter--active .pf-scatter-item--2,
                    .pf-scatter--active .pf-scatter-item--3 {
                        opacity: 0;
                    }
                }
            `}</style>
        </>
    );
}
