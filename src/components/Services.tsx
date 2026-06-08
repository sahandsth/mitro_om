"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const SERVICES = [
    {
        title: "Brand Strategy",
        description:
            "We craft purposeful brand strategies that align your vision with your audience — building a foundation that drives recognition, trust, and long-term growth.",
        image: "/images/brand-strategy.jpg",
    },
    {
        title: "Visual Identity",
        description:
            "From logo to color system, we design cohesive visual identities that speak your brand's language clearly and beautifully across every touchpoint.",
        image: "/images/visual-identity.jpg",
    },
    {
        title: "Website Design",
        description:
            "We design websites that are as functional as they are stunning — crafted to convert visitors into clients while reflecting your brand at its best.",
        image: "/images/website-design.jpg",
    },
    {
        title: "Content Creation",
        description:
            "Compelling content tailored to your brand voice — from copywriting to art direction — crafted to engage, inspire, and convert your audience.",
        image: "/images/content-creation.jpg",
    },
];

export default function ServicesSection() {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    const [activeIndex, setActiveIndex] = useState(-1);
    const [expandedIndex, setExpandedIndex] = useState(-1);
    const [introVisible, setIntroVisible] = useState(false);
    // translateY to vertically center the active item
    const [listOffset, setListOffset] = useState(0);

    const INTRO_VH = 0.4;
    const EXPAND_VH = 1.2;

    const totalVh =
        1 +
        SERVICES.length * INTRO_VH +
        SERVICES.length * EXPAND_VH +
        1;

    // Compute how much to shift the list so that item `idx` is vertically centered
    const computeOffset = (idx: number) => {
        const list = listRef.current;
        const item = itemRefs.current[idx];
        if (!list || !item) return 0;

        const listRect = list.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();

        const itemCenterRelative =
            (itemRect.top - listRect.top) + itemRect.height / 2;

        const vh = window.innerHeight;
        const targetCenter = vh / 2;

        const listCenter = listRect.top + listRect.height / 2;
        const itemCenter = itemRect.top + itemRect.height / 2;

        return listCenter - itemCenter;
    };

    useEffect(() => {
        const handleScroll = () => {
            const wrapper = wrapperRef.current;
            if (!wrapper) return;

            const wrapperTop = wrapper.getBoundingClientRect().top;
            const scrolled = -wrapperTop;

            if (scrolled < 0) {
                setIntroVisible(false);
                setActiveIndex(-1);
                setExpandedIndex(-1);
                setListOffset(0);
                return;
            }

            const vh = window.innerHeight;
            const introEnd = vh * 1;

            if (scrolled < introEnd) {
                setIntroVisible(true);
                setActiveIndex(-1);
                setExpandedIndex(-1);
                setListOffset(0);
                return;
            }

            setIntroVisible(true);

            const phaseStart = introEnd;
            const perService = (INTRO_VH + EXPAND_VH) * vh;
            const phaseProgress = scrolled - phaseStart;
            const serviceIdx = Math.floor(phaseProgress / perService);
            const withinService = phaseProgress - serviceIdx * perService;

            if (serviceIdx >= SERVICES.length) {
                const lastIdx = SERVICES.length - 1;
                setActiveIndex(lastIdx);
                setExpandedIndex(lastIdx);
                setListOffset(computeOffset(lastIdx));
                return;
            }

            setActiveIndex(serviceIdx);

            const expandThreshold = INTRO_VH * vh;
            if (withinService >= expandThreshold) {
                setExpandedIndex(serviceIdx);
                setListOffset(computeOffset(serviceIdx));
            } else {
                setExpandedIndex(-1);
                setListOffset(0);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isImageVisible = expandedIndex !== -1;

    return (
        <>
            <style>{`
        @font-face {
          font-family: 'Francy';
          src: url('/fonts/Francy.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
      `}</style>

            <div
                ref={wrapperRef}
                style={{ height: `${totalVh * 100}vh`, position: "relative" }}
            >
                <div className="svc-sticky">
                    <div className="svc-bg" />

                    <div className="svc-layout">
                        {/* LEFT: service list */}
                        <div
                            ref={listRef}
                            className="svc-list"
                            style={{ transform: `translateY(${listOffset}px)` }}
                        >
                            {SERVICES.map((svc, i) => {
                                const isActive = activeIndex === i;
                                const isExpanded = expandedIndex === i;
                                const isPast = activeIndex > i;
                                const isVisible = introVisible;

                                return (
                                    <div
                                        key={svc.title}
                                        ref={(el) => { itemRefs.current[i] = el; }}
                                        className={`svc-item
                      ${isVisible ? "svc-item--visible" : ""}
                      ${isActive ? "svc-item--active" : ""}
                      ${isPast ? "svc-item--past" : ""}
                      ${isExpanded ? "svc-item--expanded" : ""}
                    `}
                                        style={{ transitionDelay: `${i * 0.08}s` }}
                                    >
                                        <div className="svc-title-row">
                                            <span className="svc-title">{svc.title}</span>
                                        </div>
                                        <div className="svc-desc">
                                            <p>{svc.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* RIGHT: image */}
                        <div className={`svc-image-wrap ${!isImageVisible ? "svc-image-wrap--hidden" : ""}`}>
                            {SERVICES.map((svc, i) => (
                                <div
                                    key={svc.title}
                                    className={`svc-image-slot ${expandedIndex === i ? "svc-image-slot--visible" : ""}`}
                                >
                                    <div className="svc-img-inner">
                                        <Image
                                            src={svc.image}
                                            alt={svc.title}
                                            fill
                                            style={{ objectFit: "cover" }}
                                            sizes="40vw"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                /* ── Sticky shell ── */
                .svc-sticky {
                    position: sticky;
                    top: 0;
                    width: 100%;
                    height: 100vh;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                }

                /* ── Background ── */
                .svc-bg {
                    position: absolute;
                    inset: 0;
                    background: #0a0a0a;
                    z-index: 0;
                }

                /* ── Layout ── */
                .svc-layout {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    padding: 0 7vw;
                    gap: 4vw;
                }

                /* ── Left list ── */
                .svc-list {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                    transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
                }

                /* ── Each service item ── */
                .svc-item {
                    overflow: hidden;
                    padding: 0;
                    opacity: 0;
                    transform: translateY(40px);
                    transition:
                            opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
                            transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .svc-item--visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                /* ── Title row ── */
                .svc-title-row {
                    display: flex;
                    align-items: baseline;
                    padding: 14px 0 12px;
                    cursor: default;
                }

                .svc-title {
                    font-family: "Francy", serif;
                    font-size: clamp(34px, 5.2vw, 70px);
                    font-weight: 400;
                    color: rgba(255, 255, 255, 0.18);
                    letter-spacing: -0.01em;
                    line-height: 1;
                    transition: color 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .svc-item--active .svc-title {
                    color: rgba(255, 255, 255, 0.95);
                }

                .svc-item--past .svc-title {
                    color: rgba(255, 255, 255, 0.22);
                }

                /* ── Description — expands when active ── */
                .svc-desc {
                    max-height: 0;
                    overflow: hidden;
                    transition:
                            max-height 0.65s cubic-bezier(0.16, 1, 0.3, 1),
                            opacity 0.5s ease,
                            padding 0.5s ease;
                    opacity: 0;
                    padding-bottom: 0;
                }

                .svc-item--expanded .svc-desc {
                    max-height: 200px;
                    opacity: 1;
                    padding-bottom: 20px;
                }

                .svc-desc p {
                    font-family: "Francy", serif;
                    font-size: clamp(13px, 1.1vw, 16px);
                    color: rgba(255, 255, 255, 0.45);
                    line-height: 1.75;
                    max-width: 520px;
                    margin: 0;
                    letter-spacing: 0.01em;
                }

                /* ── Right image area ── */
                .svc-image-wrap {
                    width: 36vw;
                    height: 62vh;
                    flex-shrink: 0;
                    position: relative;
                    opacity: 1;
                    transform: translateX(0);
                    transition:
                            opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1),
                            transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .svc-image-wrap--hidden {
                    opacity: 0;
                    transform: translateX(20px);
                    pointer-events: none;
                }

                .svc-image-slot {
                    position: absolute;
                    inset: 0;
                    opacity: 0;
                    transform: scale(0.96) translateY(12px);
                    transition:
                            opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1),
                            transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .svc-image-slot--visible {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }

                .svc-img-inner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    background: #1a1a1a;
                }

                /* ── Responsive ── */
                @media (max-width: 900px) {
                    .svc-layout {
                        flex-direction: column;
                        padding: 0 6vw;
                        justify-content: center;
                    }
                    .svc-image-wrap {
                        width: 80vw;
                        height: 30vh;
                    }
                    .svc-title {
                        font-size: 30px;
                    }
                }
            `}</style>
        </>
    );
}
