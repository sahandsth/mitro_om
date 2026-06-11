"use client";

import { useEffect, useRef } from "react";
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

export default function ServicesSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const root = sectionRef.current;
        if (!root) return;

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        const targets = Array.from(
            root.querySelectorAll<HTMLElement>("[data-reveal]")
        );

        if (reduceMotion) {
            targets.forEach((el) => el.classList.add("is-visible"));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2, rootMargin: "0px 0px -12% 0px" }
        );

        targets.forEach((el) => observer.observe(el));

        // Subtle scroll-linked parallax on the media grids.
        const media = Array.from(
            root.querySelectorAll<HTMLElement>("[data-parallax]")
        );
        let raf = 0;

        const update = () => {
            raf = 0;
            const vh = window.innerHeight;
            for (const el of media) {
                const rect = el.getBoundingClientRect();
                if (rect.bottom < -200 || rect.top > vh + 200) continue;
                const center = rect.top + rect.height / 2;
                const progress = (center - vh / 2) / vh;
                el.style.setProperty(
                    "--py",
                    `${Math.max(-1, Math.min(1, progress)) * -22}px`
                );
            }
        };

        const onScroll = () => {
            if (raf) return;
            raf = requestAnimationFrame(update);
        };

        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });

        return () => {
            observer.disconnect();
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <section ref={sectionRef} id="services" className="svc">
            <div className="svc-bg" />
            <div className="svc-bg-glow" />
            <div className="svc-bg-noise" aria-hidden="true" />

            <div className="svc-inner">
                <header className="svc-header" data-reveal>
                    <span className="svc-eyebrow">Services</span>
                    <h2 className="svc-heading">
                        What we craft for ambitious brands
                    </h2>
                    <span className="svc-count">
                        {String(SERVICES.length).padStart(2, "0")} disciplines
                    </span>
                </header>

                <ul className="svc-list">
                    {SERVICES.map((svc, i) => (
                        <li
                            key={svc.title}
                            className="svc-item"
                            data-reveal
                            style={{ ["--i" as string]: i }}
                        >
                            <div className="svc-item-text">
                                <span className="svc-item-index">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <h3 className="svc-item-title">
                                    <span className="svc-item-title-inner">
                                        {svc.title}
                                    </span>
                                </h3>
                                <p className="svc-item-desc">
                                    {svc.description}
                                </p>
                            </div>

                            <div className="svc-item-media" data-parallax>
                                <div className="svc-grid">
                                    {svc.images.map((src, j) => (
                                        <div
                                            key={j}
                                            className="svc-grid-cell"
                                            style={{
                                                ["--d" as string]: `${j * 0.09}s`,
                                            }}
                                        >
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
                        </li>
                    ))}
                </ul>
            </div>

            <style jsx>{`
                .svc {
                    position: relative;
                    width: 100%;
                    overflow: hidden;
                    isolation: isolate;
                }

                .svc-bg {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        165deg,
                        #0a0a0a 0%,
                        #080808 45%,
                        #060606 100%
                    );
                    z-index: -3;
                }

                .svc-bg-glow {
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(
                            ellipse 70% 55% at 78% 18%,
                            rgba(255, 255, 255, 0.05) 0%,
                            transparent 68%
                        ),
                        radial-gradient(
                            ellipse 50% 40% at 8% 82%,
                            rgba(255, 255, 255, 0.028) 0%,
                            transparent 70%
                        );
                    z-index: -2;
                    pointer-events: none;
                }

                .svc-bg-noise {
                    position: absolute;
                    inset: 0;
                    opacity: 0.35;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
                    z-index: -1;
                    pointer-events: none;
                }

                .svc-inner {
                    position: relative;
                    z-index: 1;
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: clamp(96px, 14vh, 168px) clamp(28px, 5vw, 72px)
                        clamp(96px, 14vh, 168px);
                    box-sizing: border-box;
                }

                /* ── Header ── */
                .svc-header {
                    display: flex;
                    flex-direction: column;
                    gap: clamp(14px, 2vh, 22px);
                    margin-bottom: clamp(56px, 9vh, 120px);
                    max-width: 760px;
                }

                .svc-eyebrow {
                    font-family: "Cormorant Garamond", Georgia, serif;
                    font-size: clamp(11px, 0.9vw, 13px);
                    letter-spacing: 0.32em;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.34);
                }

                .svc-heading {
                    font-family: "Francy", serif;
                    font-weight: 400;
                    font-size: clamp(30px, 4.6vw, 64px);
                    line-height: 1.06;
                    letter-spacing: -0.02em;
                    color: rgba(255, 255, 255, 0.94);
                    margin: 0;
                }

                .svc-count {
                    font-family: "Cormorant Garamond", Georgia, serif;
                    font-size: clamp(12px, 1vw, 14px);
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.28);
                }

                /* ── List ── */
                .svc-list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    gap: clamp(64px, 11vh, 150px);
                }

                .svc-item {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
                    align-items: center;
                    gap: clamp(32px, 6vw, 96px);
                }

                .svc-item:nth-child(even) .svc-item-text {
                    order: 2;
                }

                .svc-item-text {
                    position: relative;
                }

                .svc-item-index {
                    display: block;
                    font-family: "Cormorant Garamond", Georgia, serif;
                    font-size: clamp(13px, 1vw, 15px);
                    letter-spacing: 0.2em;
                    color: rgba(255, 255, 255, 0.3);
                    margin-bottom: clamp(14px, 2vh, 22px);
                }

                .svc-item-index::before {
                    content: "";
                    display: inline-block;
                    width: 26px;
                    height: 1px;
                    margin-right: 14px;
                    vertical-align: middle;
                    background: rgba(255, 255, 255, 0.3);
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)
                        0.15s;
                }

                .svc-item.is-visible .svc-item-index::before {
                    transform: scaleX(1);
                }

                .svc-item-title {
                    margin: 0 0 clamp(16px, 2.4vh, 26px);
                    overflow: hidden;
                }

                .svc-item-title-inner {
                    display: block;
                    font-family: "Francy", serif;
                    font-weight: 400;
                    font-size: clamp(28px, 3.6vw, 54px);
                    line-height: 1.08;
                    letter-spacing: -0.02em;
                    color: rgba(255, 255, 255, 0.95);
                    transform: translateY(110%);
                    transition: transform 0.85s cubic-bezier(0.22, 1, 0.36, 1)
                        0.08s;
                }

                .svc-item.is-visible .svc-item-title-inner {
                    transform: translateY(0);
                }

                .svc-item-desc {
                    font-family: "Cormorant Garamond", Georgia, serif;
                    font-size: clamp(15px, 1.18vw, 18px);
                    font-weight: 300;
                    line-height: 1.78;
                    color: rgba(255, 255, 255, 0.5);
                    margin: 0;
                    max-width: 46ch;
                    opacity: 0;
                    transform: translateY(18px);
                    transition:
                        opacity 0.8s ease 0.28s,
                        transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.28s;
                }

                .svc-item.is-visible .svc-item-desc {
                    opacity: 1;
                    transform: translateY(0);
                }

                /* ── Media grid ── */
                .svc-item-media {
                    will-change: transform;
                    transform: translateY(var(--py, 0px));
                }

                .svc-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: clamp(8px, 0.8vw, 12px);
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow:
                        0 30px 60px rgba(0, 0, 0, 0.5),
                        0 0 0 1px rgba(255, 255, 255, 0.05);
                }

                .svc-grid-cell {
                    position: relative;
                    aspect-ratio: 4 / 3;
                    background: #141414;
                    overflow: hidden;
                    clip-path: inset(0 0 100% 0);
                    transform: scale(1.08);
                    transition:
                        clip-path 0.85s cubic-bezier(0.76, 0, 0.24, 1) var(--d),
                        transform 1.1s cubic-bezier(0.22, 1, 0.36, 1) var(--d);
                }

                .svc-item.is-visible .svc-grid-cell {
                    clip-path: inset(0 0 0 0);
                    transform: scale(1);
                }

                .svc-grid-cell :global(img) {
                    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
                }

                .svc-grid:hover .svc-grid-cell :global(img) {
                    transform: scale(1.03);
                }

                .svc-grid-cell:hover :global(img) {
                    transform: scale(1.07);
                }

                /* ── Header reveal ── */
                .svc-header {
                    opacity: 0;
                    transform: translateY(24px);
                    transition:
                        opacity 0.8s ease,
                        transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
                }

                .svc-header.is-visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                @media (max-width: 900px) {
                    .svc-item {
                        grid-template-columns: 1fr;
                        gap: clamp(24px, 5vh, 40px);
                    }

                    .svc-item:nth-child(even) .svc-item-text {
                        order: 0;
                    }

                    .svc-item-media {
                        transform: none;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .svc-header,
                    .svc-item-title-inner,
                    .svc-item-desc,
                    .svc-grid-cell,
                    .svc-item-index::before {
                        transition: none;
                    }
                    .svc-item-media {
                        transform: none !important;
                    }
                }
            `}</style>
        </section>
    );
}
