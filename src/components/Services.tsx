"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";

export const SERVICES = [

    {
    title: "Visual Identity",
    description:
        "From logo systems to typography, color palettes, and brand assets, we create cohesive visual identities that communicate your brand's personality consistently across every touchpoint.",
    images: [
        "/images/services/VI/1.png",
        "/images/services/VI/2.png",
        "/images/services/VI/3.png",
        "/images/services/VI/4.png",
    ],
},
    {
        title: "Character Design",
        description:
            "We design memorable characters that bring personality and storytelling to your brand, creating unique visual ambassadors that connect with audiences and leave a lasting impression.",
        images: [
            "/images/services/CD/1.png",
            "/images/services/CD/2.png",
            "/images/services/CD/3.png",
            "/images/services/CD/4.png",
        ],
    },
    {
        title: "Content Creation",
        description:
            "Compelling content tailored to your brand voice — from copywriting to art direction — crafted to engage, inspire, and convert your audience.",
        images: [
            "/images/services/CC/1.png",
            "/images/services/CC/2.png",
            "/images/services/CC/3.png",
            "/images/services/CC/4.png",
        ],
    },
    {
        title: "Website",
        description:
            "We design and develop websites that are visually engaging, user-focused, and optimized to transform visitors into loyal clients while showcasing your brand at its best.",
        images: [
            "/images/services/WS/1.png",
            "/images/services/WS/2.png",
            "/images/services/WS/3.png",
            "/images/services/WS/4.png",
        ],
    },

    {
        title: "Poster Design",
        description:
            "We create impactful poster designs that combine striking visuals with clear messaging, ensuring your campaigns capture attention and communicate effectively.",
        images: [
            "/images/services/PD/1.png",
            "/images/services/PD/2.png",
            "/images/services/PD/3.png",
            "/images/services/PD/4.png",
        ],
    },
    {
        title: "UI Design",
        description:
            "We design intuitive and visually refined user interfaces that enhance usability, improve user experiences, and seamlessly align with your brand identity.",
        images: [
            "/images/services/UI/1.png",
            "/images/services/UI/2.png",
            "/images/services/UI/3.png",
            "/images/services/UI/4.png",
        ],
    },
    {
        title: "Brand Book",
        description:
            "We develop comprehensive brand books that define your visual and verbal guidelines, ensuring consistency and clarity across all brand communications.",
        images: [
            "/images/services/BB/1.png",
            "/images/services/BB/2.png",
            "/images/services/BB/3.png",
            "/images/services/BB/4.png",
        ],
    },
];

const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const smoothstep = (t: number) => {
    const x = clamp01(t);
    return x * x * (3 - 2 * x);
};

const OVERVIEW_VH = 0.55;
const SERVICE_VH = 1;
const TAIL_VH = 0.6;
const OPEN_AT = 0.58;

function openAmount(within: number) {
    if (within < 0.18) return smoothstep(within / 0.18);
    if (within > 0.82) return smoothstep((1 - within) / 0.18);
    return 1;
}

function serviceScrollTop(wrapper: HTMLElement, index: number) {
    const vh = window.innerHeight;
    const overviewEnd = OVERVIEW_VH * vh;
    const perService = SERVICE_VH * vh;
    const totalVh =
        OVERVIEW_VH + SERVICES.length * SERVICE_VH + TAIL_VH;
    const ideal =
        wrapper.offsetTop +
        overviewEnd +
        index * perService +
        perService * OPEN_AT;
    const maxTop = wrapper.offsetTop + (totalVh - 1) * vh;
    return Math.min(ideal, maxTop);
}

export default function ServicesSection() {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [mode, setMode] = useState<"overview" | "detail">("overview");
    const [activeIndex, setActiveIndex] = useState(0);
    const [openFrac, setOpenFrac] = useState(0);
    const [introReady, setIntroReady] = useState(false);
    const introPlayed = useRef(false);

    const totalVh =
        OVERVIEW_VH + SERVICES.length * SERVICE_VH + TAIL_VH;

    const scrollToService = useCallback((index: number, smooth = true) => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        window.scrollTo({
            top: serviceScrollTop(wrapper, index),
            behavior: smooth ? "smooth" : "auto",
        });
    }, []);

    const playIntro = useCallback(() => {
        if (introPlayed.current) return;
        introPlayed.current = true;
        requestAnimationFrame(() => setIntroReady(true));
    }, []);

    useLayoutEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        if (-wrapper.getBoundingClientRect().top >= 0) playIntro();
    }, [playIntro]);

    useEffect(() => {
        const handleScroll = () => {
            const wrapper = wrapperRef.current;
            if (!wrapper) return;

            const scrolled = -wrapper.getBoundingClientRect().top;
            const vh = window.innerHeight;
            const overviewEnd = OVERVIEW_VH * vh;
            const perService = SERVICE_VH * vh;

            if (scrolled < 0) {
                setMode("overview");
                setOpenFrac(0);
                return;
            }

            playIntro();

            if (scrolled < overviewEnd) {
                setMode("overview");
                setOpenFrac(0);
                return;
            }

            setMode("detail");
            const detailProgress = scrolled - overviewEnd;
            const floatIdx = detailProgress / perService;
            const idx = Math.min(
                Math.floor(floatIdx),
                SERVICES.length - 1
            );
            const within = Math.min(floatIdx - idx, 1);

            setActiveIndex(idx);
            setOpenFrac(openAmount(within));
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll, { passive: true });
        handleScroll();
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, [playIntro]);

    const isOverview = mode === "overview";
    const active = SERVICES[activeIndex];

    return (
        <div
            ref={wrapperRef}
            style={{ height: `${totalVh * 100}vh`, position: "relative" }}
        >
            <div
                id="services"
                aria-hidden="true"
                style={{
                    position: "absolute",
                    top: 0,
                    width: 0,
                    height: 0,
                    pointerEvents: "none",
                }}
            />
            <div className="svc-sticky">
                <div className="svc-bg" />

                <div
                    className={`svc-shell ${isOverview ? "svc-shell--overview" : "svc-shell--detail"}`}
                >
                    <nav
                        className={`svc-menu ${introReady ? "svc-menu--intro" : ""}`}
                        aria-label="Services"
                    >
                        {SERVICES.map((svc, i) => {
                            const isActive =
                                !isOverview && activeIndex === i;
                            const focus = isOverview
                                ? 0.32
                                : isActive
                                  ? 1
                                  : 0.24;

                            return (
                                <button
                                    key={svc.title}
                                    type="button"
                                    className={`svc-menu-btn ${isActive ? "svc-menu-btn--active" : ""}`}
                                    onClick={() => scrollToService(i)}
                                    style={{
                                        color: `rgba(255,255,255,${focus})`,
                                    }}
                                >
                                    <span className="svc-menu-label">
                                        {svc.title}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>

                    <div
                        className="svc-detail"
                        style={{
                            opacity: isOverview ? 0 : openFrac,
                            pointerEvents:
                                !isOverview && openFrac > 0.5
                                    ? "auto"
                                    : "none",
                        }}
                    >
                        <div
                            key={activeIndex}
                            className="svc-panel"
                        >
                            <p className="svc-desc">{active.description}</p>
                            <div className="svc-grid">
                                {active.images.map((src, j) => (
                                    <div key={j} className="svc-grid-cell">
                                        <Image
                                            src={src}
                                            alt=""
                                            fill
                                            sizes="(max-width: 900px) 45vw, 22vw"
                                            style={{ objectFit: "cover" }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .svc-sticky {
                    position: sticky;
                    top: 0;
                    width: 100%;
                    height: 100vh;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                }

                .svc-bg {
                    position: absolute;
                    inset: 0;
                    background: #080808;
                    z-index: 0;
                }

                .svc-shell {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    height: 100%;
                    display: grid;
                    align-items: center;
                    padding: calc(var(--nav-h, 110px) + 12px) 62px
                        clamp(24px, 4vh, 48px);
                    box-sizing: border-box;
                    transition: grid-template-columns 0.45s
                        cubic-bezier(0.22, 1, 0.36, 1);
                }

                .svc-shell--overview {
                    grid-template-columns: 1fr;
                }

                .svc-shell--detail {
                    grid-template-columns: minmax(200px, 0.95fr) minmax(
                            0,
                            1.35fr
                        );
                    gap: clamp(28px, 4vw, 64px);
                }

                .svc-menu {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: clamp(6px, 1.1vh, 12px);
                    width: 100%;
                }

                .svc-shell--detail .svc-menu {
                    gap: clamp(4px, 0.8vh, 9px);
                }

                .svc-menu-btn {
                    display: block;
                    width: 100%;
                    background: none;
                    border: none;
                    padding: clamp(4px, 0.65vh, 8px) 0;
                    cursor: pointer;
                    text-align: left;
                    transform: translate3d(0, 7px, 0);
                    transition:
                        color 0.3s ease,
                        transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
                }

                .svc-menu--intro .svc-menu-btn {
                    transform: translate3d(0, 0, 0);
                }

                .svc-menu--intro .svc-menu-btn:nth-child(1) {
                    transition-delay: 0.03s;
                }
                .svc-menu--intro .svc-menu-btn:nth-child(2) {
                    transition-delay: 0.06s;
                }
                .svc-menu--intro .svc-menu-btn:nth-child(3) {
                    transition-delay: 0.09s;
                }
                .svc-menu--intro .svc-menu-btn:nth-child(4) {
                    transition-delay: 0.12s;
                }
                .svc-menu--intro .svc-menu-btn:nth-child(5) {
                    transition-delay: 0.15s;
                }
                .svc-menu--intro .svc-menu-btn:nth-child(6) {
                    transition-delay: 0.18s;
                }
                .svc-menu--intro .svc-menu-btn:nth-child(7) {
                    transition-delay: 0.21s;
                }

                .svc-menu-label {
                    font-family: "Francy", serif;
                    font-weight: 400;
                    letter-spacing: -0.02em;
                    line-height: 1.12;
                    transition: font-size 0.45s
                        cubic-bezier(0.22, 1, 0.36, 1);
                }

                .svc-shell--overview .svc-menu-label {
                    font-size: clamp(24px, 3.2vw, 44px);
                }

                .svc-shell--detail .svc-menu-label {
                    font-size: clamp(18px, 1.75vw, 30px);
                }

                .svc-menu-btn:hover {
                    color: rgba(255, 255, 255, 0.55) !important;
                }

                .svc-menu-btn--active:hover {
                    color: rgba(255, 255, 255, 1) !important;
                }

                .svc-detail {
                    position: relative;
                    min-height: clamp(240px, 36vh, 400px);
                    transition: opacity 0.28s ease;
                }

                .svc-panel {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) minmax(0, 1.12fr);
                    gap: clamp(20px, 3vw, 44px);
                    align-items: start;
                    animation: svcPanelIn 0.38s
                        cubic-bezier(0.22, 1, 0.36, 1) both;
                }

                @keyframes svcPanelIn {
                    from {
                        opacity: 0;
                        transform: translateY(12px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .svc-desc {
                    font-family: "Cormorant Garamond", Georgia, serif;
                    font-size: clamp(14px, 1.15vw, 17px);
                    font-weight: 300;
                    color: rgba(255, 255, 255, 0.42);
                    line-height: 1.75;
                    margin: 0;
                    padding-top: 4px;
                    text-align: left;
                }

                .svc-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }

                .svc-grid-cell {
                    position: relative;
                    aspect-ratio: 4 / 3;
                    background: #141414;
                    overflow: hidden;
                }

                .svc-grid-cell:nth-child(1) {
                    border-radius: 2px 0 0 0;
                }

                .svc-grid-cell:nth-child(2) {
                    border-radius: 0 2px 0 0;
                }

                .svc-grid-cell:nth-child(3) {
                    border-radius: 0 0 0 2px;
                }

                .svc-grid-cell:nth-child(4) {
                    border-radius: 0 0 2px 0;
                }

                @media (max-width: 900px) {
                    .svc-shell {
                        padding-left: clamp(24px, 5vw, 48px);
                        padding-right: clamp(24px, 5vw, 48px);
                    }

                    .svc-shell--detail {
                        grid-template-columns: 1fr;
                        gap: 20px;
                        align-content: start;
                        overflow-y: auto;
                    }

                    .svc-shell--detail .svc-menu {
                        flex-direction: row;
                        flex-wrap: wrap;
                        gap: 8px 14px;
                    }

                    .svc-shell--detail .svc-menu-btn {
                        width: auto;
                    }

                    .svc-panel {
                        grid-template-columns: 1fr;
                    }

                    .svc-grid {
                        max-width: 420px;
                    }
                }
            `}</style>
        </div>
    );
}
