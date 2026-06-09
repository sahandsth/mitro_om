"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Footer from "@/components/Footer";

const TEAM = [
    {
        name: "Maani Esnashari",
        role: "Creative Director",
        bio: "Shapes brand vision and leads creative direction — from strategy to final delivery across every client project.",
        skills: ["Brand Strategy", "Art Direction", "Creative Leadership"],
        tone: "#1c1c1c",
    },
    {
        name: "Elahe Akrami",
        role: "Lead Designer",
        bio: "Crafts visual identities, UI systems, and print work with a sharp eye for detail and timeless aesthetics.",
        skills: ["Visual Identity", "UI Design", "Typography"],
        tone: "#4a4a4a",
    },
    {
        name: "Sahand Setoudeh",
        role: "Developer & Motion",
        bio: "Builds immersive websites and motion-driven experiences that bring brands to life on screen.",
        skills: ["Web Development", "Motion Design", "Creative Code"],
        tone: "#767676",
    },
];

const EASE_OUT = (t: number) => 1 - Math.pow(1 - t, 3);
const EASE_IN_OUT = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type CardLayout = {
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    opacity: number;
};

type Phase = "intro" | "peel" | "assemble" | "final" | "reveal" | "revealed";

export default function About() {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
    const [phase, setPhase] = useState<Phase>("intro");
    const [peelIndex, setPeelIndex] = useState(0);
    const [peelFrac, setPeelFrac] = useState(0);
    const [assembleFrac, setAssembleFrac] = useState(0);
    const [revealFrac, setRevealFrac] = useState(0);

    const INTRO_VH = 0.5;
    const PEEL_VH = 1;
    const PEEL_HOLD = 0.38;
    const ASSEMBLE_VH = 1.6;
    const ASSEMBLE_ANIM = 0.92;
    const FINAL_HOLD_VH = 1.75;
    const REVEAL_VH = 1.25;
    const FOOTER_HOLD_VH = 0.9;

    const totalVh =
        INTRO_VH +
        TEAM.length * PEEL_VH +
        ASSEMBLE_VH +
        FINAL_HOLD_VH +
        REVEAL_VH +
        FOOTER_HOLD_VH;

    const measure = useCallback(() => {
        if (stageRef.current) {
            setStageSize({
                w: stageRef.current.offsetWidth,
                h: stageRef.current.offsetHeight,
            });
        }
    }, []);

    useEffect(() => {
        measure();
        window.addEventListener("resize", measure, { passive: true });
        return () => window.removeEventListener("resize", measure);
    }, [measure]);

    useEffect(() => {
        const handleScroll = () => {
            const wrapper = wrapperRef.current;
            if (!wrapper) return;

            const scrolled = -wrapper.getBoundingClientRect().top;
            const vh = window.innerHeight;

            if (scrolled < 0) {
                setPhase("intro");
                setPeelIndex(0);
                setPeelFrac(0);
                setAssembleFrac(0);
                setRevealFrac(0);
                return;
            }

            const introEnd = INTRO_VH * vh;
            const peelEnd = introEnd + TEAM.length * PEEL_VH * vh;

            if (scrolled < introEnd) {
                setPhase("intro");
                setPeelIndex(0);
                setPeelFrac(0);
                setAssembleFrac(0);
                setRevealFrac(0);
                return;
            }

            if (scrolled < peelEnd) {
                setPhase("peel");
                const peelProgress = scrolled - introEnd;
                const perPeel = PEEL_VH * vh;
                const idx = Math.min(
                    Math.floor(peelProgress / perPeel),
                    TEAM.length - 1
                );
                const within = (peelProgress - idx * perPeel) / perPeel;
                const animEnd = 1 - PEEL_HOLD;
                const frac =
                    within < animEnd ? within / animEnd : 1;
                setPeelIndex(idx);
                setPeelFrac(frac);
                setAssembleFrac(0);
                setRevealFrac(0);
                return;
            }

            const assembleEnd = peelEnd + ASSEMBLE_VH * vh;

            if (scrolled < assembleEnd) {
                setPhase("assemble");
                const within =
                    (scrolled - peelEnd) / (ASSEMBLE_VH * vh);
                const frac =
                    within < ASSEMBLE_ANIM
                        ? within / ASSEMBLE_ANIM
                        : 1;
                setPeelIndex(TEAM.length - 1);
                setPeelFrac(1);
                setAssembleFrac(frac);
                setRevealFrac(0);
                return;
            }

            const finalHoldEnd = assembleEnd + FINAL_HOLD_VH * vh;
            const revealEnd = finalHoldEnd + REVEAL_VH * vh;

            if (scrolled < finalHoldEnd) {
                setPhase("final");
                setPeelIndex(TEAM.length - 1);
                setPeelFrac(1);
                setAssembleFrac(1);
                setRevealFrac(0);
                return;
            }

            if (scrolled < revealEnd) {
                setPhase("reveal");
                setPeelIndex(TEAM.length - 1);
                setPeelFrac(1);
                setAssembleFrac(1);
                const raw = (scrolled - finalHoldEnd) / (REVEAL_VH * vh);
                setRevealFrac(EASE_OUT(raw));
                return;
            }

            setPhase("revealed");
            setPeelIndex(TEAM.length - 1);
            setPeelFrac(1);
            setAssembleFrac(1);
            setRevealFrac(1);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll, { passive: true });
        handleScroll();
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, []);

    const stackCardSize = () => ({
        w: Math.min(stageSize.w * 0.22, 220),
        h: Math.min(stageSize.h * 0.52, 340),
    });

    const dockRowMetrics = () => {
        const gap = Math.max(8, stageSize.w * 0.01);
        const padX = Math.max(56, stageSize.w * 0.07);
        const padBottom = Math.max(80, stageSize.h * 0.12);
        const maxRowW = stageSize.w - padX * 2;
        const maxCardH = Math.floor(stageSize.h * 0.15);

        let cardW = Math.floor(
            (maxRowW - (TEAM.length - 1) * gap) / TEAM.length
        );
        cardW = Math.min(cardW, 74);
        cardW = Math.max(cardW, 50);

        let cardH = Math.round(cardW * 1.28);
        cardH = Math.min(cardH, maxCardH);

        const totalW = TEAM.length * cardW + (TEAM.length - 1) * gap;
        const startX = (stageSize.w - totalW) / 2;
        const y = stageSize.h - padBottom - cardH;

        return { cardW, cardH, gap, startX, y };
    };

    const finalRowMetrics = () => {
        const gap = Math.max(14, stageSize.w * 0.02);
        const marginX = Math.max(40, stageSize.w * 0.05);
        const maxRowW = stageSize.w - marginX * 2;
        let cardW = Math.min(stageSize.w * 0.25, 272);
        let cardH = Math.min(stageSize.h * 0.46, 340);
        const rawTotal = TEAM.length * cardW + (TEAM.length - 1) * gap;
        const scale = rawTotal > maxRowW ? maxRowW / rawTotal : 1;
        cardW *= scale;
        cardH *= scale;

        const totalW = TEAM.length * cardW + (TEAM.length - 1) * gap;
        const startX = (stageSize.w - totalW) / 2;
        const idealY = stageSize.h * 0.54 - cardH / 2;
        const minY = stageSize.h * 0.24;
        const maxY = stageSize.h - cardH - 40;
        const y = Math.min(Math.max(idealY, minY), maxY);

        return { cardW, cardH, gap, startX, y };
    };

    const STACK_OFFSET_X = 26;
    const STACK_OFFSET_Y = 18;

    const getStackPos = (depth: number): CardLayout => {
        const { w: cw, h: ch } = stackCardSize();
        const baseX = stageSize.w * 0.1;
        const baseY = stageSize.h * 0.5 - ch / 2;
        return {
            x: baseX - depth * STACK_OFFSET_X,
            y: baseY - depth * STACK_OFFSET_Y,
            width: cw,
            height: ch,
            zIndex: 12 - depth,
            opacity: 1,
        };
    };

    const getDockPos = (index: number): CardLayout => {
        const { cardW, cardH, gap, startX, y } = dockRowMetrics();
        return {
            x: startX + index * (cardW + gap),
            y,
            width: cardW,
            height: cardH,
            zIndex: 8 + index,
            opacity: 1,
        };
    };

    const getFinalPos = (index: number): CardLayout => {
        const { cardW, cardH, gap, startX, y } = finalRowMetrics();
        return {
            x: startX + index * (cardW + gap),
            y,
            width: cardW,
            height: cardH,
            zIndex: 20 + index,
            opacity: 1,
        };
    };

    const getCardLayout = (i: number): CardLayout | null => {
        if (stageSize.w === 0) return null;

        if (phase === "intro") {
            return getStackPos(i);
        }

        if (phase === "peel") {
            if (i < peelIndex) {
                return getDockPos(i);
            }

            if (i === peelIndex) {
                const start = getStackPos(0);
                const end = getDockPos(i);
                const tPos = EASE_OUT(peelFrac);
                const tSize = clamp01(EASE_IN_OUT(peelFrac) * 1.18);
                return {
                    x: lerp(start.x, end.x, tPos),
                    y: lerp(start.y, end.y, tPos),
                    width: lerp(start.width, end.width, tSize),
                    height: lerp(start.height, end.height, tSize),
                    zIndex: 50,
                    opacity: 1,
                };
            }

            const depth = i - peelIndex;
            const stacked = getStackPos(depth);
            return {
                ...stacked,
                zIndex: 10 - depth,
            };
        }

        if (
            phase === "assemble" ||
            phase === "final" ||
            phase === "reveal" ||
            phase === "revealed"
        ) {
            if (phase === "final" || phase === "reveal" || phase === "revealed") {
                return getFinalPos(i);
            }

            const dock = getDockPos(i);
            const final = getFinalPos(i);
            const tPos = EASE_OUT(assembleFrac);
            const tSize = clamp01(EASE_IN_OUT(assembleFrac) * 1.06);

            return {
                x: lerp(dock.x, final.x, tPos),
                y: lerp(dock.y, final.y, tPos),
                width: lerp(dock.width, final.width, tSize),
                height: lerp(dock.height, final.height, tSize),
                zIndex: 20 + i,
                opacity: 1,
            };
        }

        return null;
    };

    const getFullContentOpacity = (cardIndex: number) => {
        if (phase === "intro") return 1;
        if (phase === "final" || phase === "reveal" || phase === "revealed") {
            return 1;
        }

        if (phase === "peel") {
            if (cardIndex < peelIndex) return 0;
            if (cardIndex === peelIndex) {
                return 1 - clamp01((peelFrac - 0.42) / 0.38);
            }
            return 1;
        }

        if (phase === "assemble") {
            return clamp01((assembleFrac - 0.42) / 0.38);
        }

        return 1;
    };

    const textOpacity = () => {
        if (phase === "intro" || phase === "peel") return 1;
        if (assembleFrac < 0.35) return 1;
        return Math.max(0, 1 - (assembleFrac - 0.35) / 0.4);
    };

    const textCentered =
        phase === "assemble" ||
        phase === "final";
    const isRevealPhase = phase === "reveal" || phase === "revealed";

    const panelTransform =
        revealFrac <= 0
            ? "none"
            : `translate3d(${revealFrac * 1.5}%, ${-revealFrac * 72}%, 0) skewY(${-(revealFrac * 14).toFixed(2)}deg)`;

    return (
        <div
            id="about"
            ref={wrapperRef}
            style={{ height: `${totalVh * 100}vh`, position: "relative" }}
        >
            <div
                id="about-entry"
                aria-hidden="true"
                style={{
                    position: "absolute",
                    top: `${INTRO_VH * 100}vh`,
                    width: 0,
                    height: 0,
                    pointerEvents: "none",
                }}
            />
            <div
                id="contacts-entry"
                aria-hidden="true"
                style={{
                    position: "absolute",
                    bottom: 0,
                    width: 0,
                    height: 0,
                    pointerEvents: "none",
                }}
            />
            <div className="ab-sticky">
                <Footer />

                <div
                    className={`ab-panel ${isRevealPhase ? "ab-panel--reveal" : ""}`}
                    style={{ transform: panelTransform }}
                >
                <div className="ab-bg" />

                <div
                    className={`ab-text ${textCentered ? "ab-text--centered" : ""}`}
                    style={{ opacity: textOpacity() }}
                >
                    <h2 className="ab-title">About Us</h2>
                    <p className="ab-desc">
                        We are a small team of three — each bringing a distinct
                        craft to every project. Together we cover strategy,
                        design, and development so your brand moves from idea to
                        execution without losing its voice.
                    </p>
                </div>

                <div ref={stageRef} className="ab-stage">
                    {TEAM.map((member, i) => ({ member, i }))
                        .sort((a, b) => {
                            if (phase !== "peel") return 0;
                            const order = (idx: number) => {
                                if (idx < peelIndex) return idx;
                                if (idx > peelIndex) return 10 + idx;
                                return 100;
                            };
                            return order(a.i) - order(b.i);
                        })
                        .map(({ member, i }) => {
                        const layout = getCardLayout(i);
                        if (!layout) return null;

                        const fullOpacity = getFullContentOpacity(i);
                        const isPeeling =
                            phase === "peel" &&
                            i === peelIndex &&
                            peelFrac > 0 &&
                            peelFrac < 1;

                        return (
                            <div
                                key={member.name}
                                className={`ab-card ${isPeeling ? "ab-card--peeling" : ""}`}
                                style={{
                                    transform: `translate(${layout.x}px, ${layout.y}px)`,
                                    width: layout.width,
                                    height: layout.height,
                                    zIndex: layout.zIndex,
                                    opacity: layout.opacity,
                                }}
                            >
                                <div
                                    className="ab-card-inner"
                                    style={{ background: member.tone }}
                                >
                                    <div className="ab-card-content-stack">
                                        <div
                                            className="ab-card-content ab-card-content--compact"
                                            style={{
                                                opacity: 1 - fullOpacity,
                                            }}
                                        >
                                            <h3
                                                className="ab-card-name ab-card-name--compact"
                                                style={{
                                                    fontSize: `${Math.max(8, Math.min(layout.width * 0.17, 11))}px`,
                                                }}
                                            >
                                                {member.name}
                                            </h3>
                                        </div>
                                        <div
                                            className="ab-card-content ab-card-content--full"
                                            style={{ opacity: fullOpacity }}
                                        >
                                            <div className="ab-card-head">
                                                <span className="ab-card-role">
                                                    {member.role}
                                                </span>
                                                <h3 className="ab-card-name">
                                                    {member.name}
                                                </h3>
                                            </div>
                                            <p className="ab-card-bio">
                                                {member.bio}
                                            </p>
                                            <ul className="ab-card-skills">
                                                {member.skills.map((s) => (
                                                    <li key={s}>{s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                </div>
            </div>

            <style jsx>{`
                .ab-sticky {
                    position: sticky;
                    top: 0;
                    width: 100%;
                    height: 100vh;
                    overflow: hidden;
                    background: #080808;
                }

                .ab-panel {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10;
                    min-height: 115%;
                    background: #c4c4c4;
                    transform-origin: 50% 100%;
                    will-change: transform;
                }

                .ab-panel--reveal {
                    box-shadow: 0 28px 72px rgba(0, 0, 0, 0.22);
                }

                .ab-bg {
                    position: absolute;
                    inset: 0;
                    background: #c4c4c4;
                    z-index: 0;
                }

                .ab-text {
                    position: absolute;
                    top: calc(var(--nav-h, 110px) + 40px);
                    left: 52%;
                    right: clamp(24px, 5vw, 72px);
                    z-index: 15;
                    max-width: 420px;
                    transition: opacity 0.35s ease;
                }

                .ab-text--centered {
                    left: 50%;
                    right: auto;
                    transform: translateX(-50%);
                    text-align: center;
                    max-width: 520px;
                    top: calc(var(--nav-h, 110px) + 24px);
                }

                .ab-title {
                    font-family: "Francy", serif;
                    font-size: clamp(32px, 4.5vw, 56px);
                    font-weight: 400;
                    color: #1a1a1a;
                    margin: 0 0 20px;
                    line-height: 1.05;
                    letter-spacing: -0.02em;
                }

                .ab-desc {
                    font-family: "Cormorant Garamond", Georgia, serif;
                    font-size: clamp(14px, 1.15vw, 17px);
                    font-weight: 300;
                    color: rgba(30, 30, 30, 0.72);
                    line-height: 1.75;
                    margin: 0;
                }

                .ab-stage {
                    position: absolute;
                    inset: 0;
                    z-index: 10;
                }

                .ab-card {
                    position: absolute;
                    top: 0;
                    left: 0;
                    will-change: transform, width, height;
                    opacity: 1 !important;
                }

                .ab-card--peeling {
                    overflow: visible;
                }

                .ab-card--peeling .ab-card-inner {
                    overflow: visible;
                }

                .ab-card-inner {
                    width: 100%;
                    height: 100%;
                    border-radius: 2px;
                    box-shadow: 0 10px 32px rgba(0, 0, 0, 0.18);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    opacity: 1;
                    backface-visibility: hidden;
                    isolation: isolate;
                }

                .ab-card-content-stack {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }

                .ab-card-content {
                    padding: clamp(10px, 2vw, 20px);
                    color: #ffffff;
                }

                .ab-card-content--compact {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                }

                .ab-card-content--full {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                }

                .ab-card-content--full {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    box-sizing: border-box;
                }

                .ab-card-head {
                    flex-shrink: 0;
                    min-height: clamp(52px, 8vh, 72px);
                }

                .ab-card-content--compact {
                    height: 100%;
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    padding: 6px 4px 8px;
                }

                .ab-card-name--compact {
                    writing-mode: vertical-rl;
                    transform: rotate(180deg);
                    text-align: center;
                    line-height: 1.15;
                    letter-spacing: 0.03em;
                    white-space: nowrap;
                    margin: 0;
                    max-height: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .ab-card-role {
                    display: block;
                    font-family: "Francy", serif;
                    font-size: clamp(9px, 0.85vw, 12px);
                    opacity: 0.65;
                    letter-spacing: 0.04em;
                    margin-bottom: 4px;
                }

                .ab-card-name {
                    font-family: "Francy", serif;
                    font-size: clamp(14px, 1.6vw, 22px);
                    font-weight: 400;
                    margin: 0;
                    line-height: 1.2;
                    letter-spacing: -0.01em;
                    min-height: 1.2em;
                }

                .ab-card-bio {
                    font-family: "Cormorant Garamond", Georgia, serif;
                    font-size: clamp(11px, 0.95vw, 14px);
                    font-weight: 300;
                    line-height: 1.6;
                    margin: 10px 0 0;
                    opacity: 0.85;
                    flex: 1;
                }

                .ab-card-skills {
                    list-style: none;
                    margin: auto 0 0;
                    padding: 0;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    flex-shrink: 0;
                }

                .ab-card-skills li {
                    font-family: "Francy", serif;
                    font-size: clamp(8px, 0.7vw, 10px);
                    padding: 3px 8px;
                    border: 1px solid rgba(255, 255, 255, 0.25);
                    border-radius: 2px;
                    opacity: 0.8;
                }

                @media (max-width: 768px) {
                    .ab-text:not(.ab-text--centered) {
                        left: 42%;
                        right: 16px;
                        max-width: 52vw;
                    }

                    .ab-text--centered {
                        top: calc(var(--nav-h, 110px) + 12px);
                        padding: 0 24px;
                    }
                }
            `}</style>
        </div>
    );
}
