"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";

const SERVICES = [
    {
        title: "Brand Strategy",
        description:
            "We craft purposeful brand strategies that align your vision with your audience — building a foundation that drives recognition, trust, and long-term growth.",
        images: [
            "https://picsum.photos/seed/brand1/600/450",
            "https://picsum.photos/seed/brand2/600/450",
            "https://picsum.photos/seed/brand3/600/450",
            "https://picsum.photos/seed/brand4/600/450",
        ],
    },
    {
        title: "Visual Identity",
        description:
            "From logo to color system, we design cohesive visual identities that speak your brand's language clearly and beautifully across every touchpoint.",
        images: [
            "https://picsum.photos/seed/visual1/600/450",
            "https://picsum.photos/seed/visual2/600/450",
            "https://picsum.photos/seed/visual3/600/450",
            "https://picsum.photos/seed/visual4/600/450",
        ],
    },
    {
        title: "Website",
        description:
            "We design websites that are as functional as they are stunning — crafted to convert visitors into clients while reflecting your brand at its best.",
        images: [
            "https://picsum.photos/seed/web1/600/450",
            "https://picsum.photos/seed/web2/600/450",
            "https://picsum.photos/seed/web3/600/450",
            "https://picsum.photos/seed/web4/600/450",
        ],
    },
    {
        title: "Content Creation",
        description:
            "Compelling content tailored to your brand voice — from copywriting to art direction — crafted to engage, inspire, and convert your audience.",
        images: [
            "https://picsum.photos/seed/content1/600/450",
            "https://picsum.photos/seed/content2/600/450",
            "https://picsum.photos/seed/content3/600/450",
            "https://picsum.photos/seed/content4/600/450",
        ],
    },
];

export default function ServicesSection() {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    const [openIndex, setOpenIndex] = useState(-1);
    const [introVisible, setIntroVisible] = useState(false);
    const [listOffset, setListOffset] = useState(0);

    const INTRO_VH = 0.15;
    const SERVICE_VH = 1;

    const totalVh = INTRO_VH + SERVICES.length * SERVICE_VH + 0.4;

    const computeOffset = (idx: number) => {
        const list = listRef.current;
        const item = itemRefs.current[idx];
        if (!list || !item) return 0;

        const listRect = list.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
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
            const vh = window.innerHeight;

            if (scrolled < 0) {
                setIntroVisible(false);
                setOpenIndex(-1);
                setListOffset(0);
                return;
            }

            const introEnd = vh * INTRO_VH;

            if (scrolled < introEnd) {
                setIntroVisible(true);
                setOpenIndex(-1);
                setListOffset(0);
                return;
            }

            setIntroVisible(true);

            const phaseProgress = scrolled - introEnd;
            const perService = SERVICE_VH * vh;
            const floatIdx = phaseProgress / perService;
            const idx = Math.min(
                Math.floor(floatIdx),
                SERVICES.length - 1
            );

            setOpenIndex(idx);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll, { passive: true });
        handleScroll();
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, []);

    useLayoutEffect(() => {
        if (openIndex < 0) {
            setListOffset(0);
            return;
        }
        setListOffset(computeOffset(openIndex));
    }, [openIndex]);

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
                id="services"
                ref={wrapperRef}
                style={{ height: `${totalVh * 100}vh`, position: "relative" }}
            >
                <div className="svc-sticky">
                    <div className="svc-bg" />

                    <div
                        ref={listRef}
                        className="svc-list"
                        style={{ transform: `translateY(${listOffset}px)` }}
                    >
                        {SERVICES.map((svc, i) => {
                            const isOpen = openIndex === i;
                            const isPast = openIndex > i;

                            return (
                                <div
                                    key={svc.title}
                                    ref={(el) => {
                                        itemRefs.current[i] = el;
                                    }}
                                    className={`svc-item
                                        ${introVisible ? "svc-item--visible" : ""}
                                        ${isOpen ? "svc-item--open" : ""}
                                        ${isPast ? "svc-item--past" : ""}
                                    `}
                                >
                                    <div className="svc-title-row">
                                        <span className="svc-title">{svc.title}</span>
                                    </div>

                                    <div className="svc-body">
                                        <div className="svc-body-inner">
                                            <p className="svc-desc">{svc.description}</p>
                                            <div className="svc-grid">
                                                {svc.images.map((src, j) => (
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
                            );
                        })}
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
                    justify-content: center;
                }

                .svc-bg {
                    position: absolute;
                    inset: 0;
                    background: #080808;
                    z-index: 0;
                }

                .svc-list {
                    position: relative;
                    z-index: 10;
                    width: min(92vw, 1180px);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding-top: calc(var(--nav-h, 110px) * 0.35);
                }

                .svc-item {
                    width: 100%;
                    overflow: hidden;
                    opacity: 0;
                    transform: translateY(32px);
                    transition:
                        opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                        transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .svc-item--visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .svc-title-row {
                    display: flex;
                    justify-content: center;
                    padding: clamp(10px, 1.6vh, 18px) 0;
                    text-align: center;
                }

                .svc-title {
                    font-family: "Francy", serif;
                    font-size: clamp(36px, 5.5vw, 72px);
                    font-weight: 400;
                    color: rgba(255, 255, 255, 0.14);
                    letter-spacing: -0.02em;
                    line-height: 1.05;
                    transition: color 0.25s ease;
                }

                .svc-item--open .svc-title {
                    color: #ffffff;
                }

                .svc-item--past .svc-title {
                    color: rgba(255, 255, 255, 0.14);
                }

                .svc-body {
                    display: grid;
                    grid-template-rows: 0fr;
                }

                .svc-item--open .svc-body {
                    grid-template-rows: 1fr;
                }

                .svc-body-inner {
                    overflow: hidden;
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
                    gap: clamp(20px, 3vw, 48px);
                    align-items: start;
                    justify-content: center;
                    max-width: 960px;
                    margin: 0 auto;
                    padding-bottom: clamp(16px, 2.5vh, 32px);
                    opacity: 0;
                }

                .svc-item--open .svc-body-inner {
                    opacity: 1;
                }

                .svc-desc {
                    font-family: "Cormorant Garamond", Georgia, serif;
                    font-size: clamp(14px, 1.15vw, 17px);
                    font-weight: 300;
                    color: rgba(255, 255, 255, 0.42);
                    line-height: 1.75;
                    margin: 0;
                    padding-top: 4px;
                    text-align: center;
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
                    .svc-body-inner {
                        grid-template-columns: 1fr;
                    }

                    .svc-grid {
                        max-width: 420px;
                        margin: 0 auto;
                    }

                    .svc-title {
                        font-size: clamp(28px, 8vw, 40px);
                    }
                }
            `}</style>
        </>
    );
}
