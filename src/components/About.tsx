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

const EASE = (t: number) => 1 - Math.pow(1 - t, 3);
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
    const ASSEMBLE_VH = 1.2;
    const ASSEMBLE_ANIM = 0.48;
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
                    within < animEnd
                        ? EASE(within / animEnd)
                        : 1;
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
                        ? EASE(within / ASSEMBLE_ANIM)
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
                setRevealFrac(EASE(raw));
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

    const smallCardSize = () => ({
        w: Math.min(stageSize.w * 0.068, 64),
        h: Math.min(stageSize.h * 0.13, 96),
    });

    const finalCardSize = () => ({
        w: Math.min(stageSize.w * 0.26, 280),
        h: Math.min(stageSize.h * 0.52, 380),
    });

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
            zIndex: 30 - depth,
            opacity: 1,
        };
    };

    const getDockPos = (index: number): CardLayout => {
        const { w: sw, h: sh } = smallCardSize();
        const gap = 10;
        const marginR = Math.max(32, stageSize.w * 0.05);
        const marginB = 48;
        const rightX = stageSize.w - marginR - sw;
        return {
            x: rightX - index * (sw + gap),
            y: stageSize.h - marginB - sh,
            width: sw,
            height: sh,
            zIndex: 20 + index,
            opacity: 1,
        };
    };

    const getCenterRowPos = (index: number): CardLayout => {
        const { w: sw, h: sh } = smallCardSize();
        const gap = 14;
        const totalW = TEAM.length * sw + (TEAM.length - 1) * gap;
        const startX = (stageSize.w - totalW) / 2;
        return {
            x: startX + index * (sw + gap),
            y: stageSize.h - sh - 72,
            width: sw,
            height: sh,
            zIndex: 20 + index,
            opacity: 1,
        };
    };

    const getFinalPos = (index: number): CardLayout => {
        const { w: fw, h: fh } = finalCardSize();
        const gap = Math.max(16, stageSize.w * 0.02);
        const totalW = TEAM.length * fw + (TEAM.length - 1) * gap;
        const startX = (stageSize.w - totalW) / 2;
        return {
            x: startX + index * (fw + gap),
            y: stageSize.h * 0.5 - fh / 2,
            width: fw,
            height: fh,
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
                const t = peelFrac;
                return {
                    x: lerp(start.x, end.x, t),
                    y: lerp(start.y, end.y, t),
                    width: lerp(start.width, end.width, t),
                    height: lerp(start.height, end.height, t),
                    zIndex: 30,
                    opacity: 1,
                };
            }

            const depth = i - peelIndex;
            return getStackPos(depth);
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
            const center = getCenterRowPos(i);
            const final = getFinalPos(i);
            const t = assembleFrac;

            if (t < 0.45) {
                const local = t / 0.45;
                return {
                    x: lerp(dock.x, center.x, local),
                    y: lerp(dock.y, center.y, local),
                    width: lerp(dock.width, center.width, local),
                    height: lerp(dock.height, center.height, local),
                    zIndex: 20 + i,
                    opacity: 1,
                };
            }

            const local = (t - 0.45) / 0.55;
            return {
                x: lerp(center.x, final.x, local),
                y: lerp(center.y, final.y, local),
                width: lerp(center.width, final.width, local),
                height: lerp(center.height, final.height, local),
                zIndex: 20 + i,
                opacity: 1,
            };
        }

        return null;
    };

    const textOpacity = () => {
        if (phase === "intro" || phase === "peel") return 1;
        if (assembleFrac < 0.55) return 1;
        return Math.max(0, 1 - (assembleFrac - 0.55) / 0.35);
    };

    const textCentered =
        phase === "assemble" ||
        phase === "final";
    const isRevealPhase = phase === "reveal" || phase === "revealed";

    const REVEAL_SLIDE_Y = 58;
    const REVEAL_SLIDE_X = 5;
    const REVEAL_DIAGONAL = 24;

    const panelClip =
        revealFrac <= 0
            ? "none"
            : `polygon(0 0, 100% 0, 100% ${(100 - revealFrac * REVEAL_DIAGONAL).toFixed(1)}%, 0 100%)`;

    const panelTransform =
        revealFrac <= 0
            ? "none"
            : `translate(${revealFrac * REVEAL_SLIDE_X}%, ${-revealFrac * REVEAL_SLIDE_Y}%)`;

    return (
        <div
            id="about"
            ref={wrapperRef}
            style={{ height: `${totalVh * 100}vh`, position: "relative" }}
        >
            <div className="ab-sticky">
                <Footer />

                <div
                    className={`ab-panel ${isRevealPhase ? "ab-panel--reveal" : ""}`}
                    style={{
                        transform: panelTransform,
                        clipPath: panelClip,
                    }}
                >
                <div className="ab-bg" />

                <div
                    className={`ab-text ${textCentered ? "ab-text--centered" : ""}`}
                    style={{
                        opacity: isRevealPhase
                            ? 0
                            : textOpacity(),
                    }}
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
                    {TEAM.map((member, i) => {
                        const layout = getCardLayout(i);
                        if (!layout) return null;

                        const isCompact =
                            layout.height <
                            stackCardSize().h * 0.55;

                        return (
                            <div
                                key={member.name}
                                className="ab-card"
                                style={{
                                    transform: `translate(${layout.x}px, ${layout.y}px)`,
                                    width: layout.width,
                                    height: layout.height,
                                    zIndex: layout.zIndex,
                                    opacity: isRevealPhase
                                        ? Math.max(0, 1 - revealFrac * 4)
                                        : layout.opacity,
                                }}
                            >
                                <div
                                    className="ab-card-inner"
                                    style={{ background: member.tone }}
                                >
                                    <div
                                        className={`ab-card-content ${isCompact ? "ab-card-content--compact" : ""}`}
                                    >
                                        {isCompact ? (
                                            <h3
                                                className="ab-card-name ab-card-name--compact"
                                                style={{
                                                    fontSize: `${Math.max(8, Math.min(layout.width * 0.17, 11))}px`,
                                                }}
                                            >
                                                {member.name}
                                            </h3>
                                        ) : (
                                            <>
                                                <span className="ab-card-role">
                                                    {member.role}
                                                </span>
                                                <h3 className="ab-card-name">
                                                    {member.name}
                                                </h3>
                                                <p className="ab-card-bio">
                                                    {member.bio}
                                                </p>
                                                <ul className="ab-card-skills">
                                                    {member.skills.map((s) => (
                                                        <li key={s}>{s}</li>
                                                    ))}
                                                </ul>
                                            </>
                                        )}
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
                    inset: 0;
                    z-index: 10;
                    min-height: 100%;
                    background: #c4c4c4;
                    will-change: transform, clip-path;
                }

                .ab-panel--reveal {
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
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

                .ab-card-inner {
                    width: 100%;
                    height: 100%;
                    border-radius: 2px;
                    box-shadow: 0 10px 32px rgba(0, 0, 0, 0.18);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    opacity: 1;
                    backface-visibility: hidden;
                }

                .ab-card-content {
                    padding: clamp(10px, 2vw, 20px);
                    color: #ffffff;
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
                    line-height: 1.1;
                    letter-spacing: -0.01em;
                }

                .ab-card-bio {
                    font-family: "Cormorant Garamond", Georgia, serif;
                    font-size: clamp(11px, 0.95vw, 14px);
                    font-weight: 300;
                    line-height: 1.6;
                    margin: 12px 0 0;
                    opacity: 0.85;
                }

                .ab-card-skills {
                    list-style: none;
                    margin: 10px 0 0;
                    padding: 0;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
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
