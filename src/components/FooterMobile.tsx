"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { scrollToSection } from "@/lib/scrollToSection";

const EXPLORE_LINKS = [
    { label: "Portfolio", id: "portfolio" },
    { label: "Services", id: "services" },
    { label: "About", id: "about" },
    { label: "Home", id: "home" },
];

const SOCIAL_LINKS = [
    { label: "LinkedIn", href: "https://linkedin.com" },
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Behance", href: "https://behance.net" },
    { label: "Tiktok", href: "https://tiktok.com" },
];

export default function FooterMobile() {
    const rootRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        const targets = Array.from(
            root.querySelectorAll<HTMLElement>(".ftm-reveal")
        );

        if (reduceMotion) {
            targets.forEach((el) => el.classList.add("is-visible"));
            return;
        }

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );

        targets.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);

    return (
        <footer id="contacts" className="ftm" ref={rootRef}>
            <span
                id="contacts-entry"
                aria-hidden="true"
                className="ftm-anchor"
            />

            <p className="ftm-watermark" aria-hidden="true">
                MITRO TEAM
            </p>

            <div className="ftm-shell">
                <h2 className="ftm-cta ftm-reveal">Lets Work Together</h2>

                <div className="ftm-columns">
                    <div className="ftm-col ftm-reveal" style={{ "--d": "0.05s" } as React.CSSProperties}>
                        <h3 className="ftm-heading">Reach out</h3>
                        <nav className="ftm-nav">
                            <a
                                className="ftm-link"
                                href="mailto:mitro.agency@gmail.com"
                            >
                                mitro.agency@gmail.com
                            </a>
                            <a className="ftm-link" href="tel:+96892086094">
                                +968 9208 6094
                            </a>
                        </nav>
                    </div>

                    <div className="ftm-col ftm-reveal" style={{ "--d": "0.12s" } as React.CSSProperties}>
                        <h3 className="ftm-heading">Explore</h3>
                        <nav className="ftm-nav">
                            {EXPLORE_LINKS.map(({ label, id }) => (
                                <button
                                    key={id}
                                    type="button"
                                    className="ftm-nav-btn"
                                    onClick={() => scrollToSection(id)}
                                >
                                    {label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="ftm-col ftm-reveal" style={{ "--d": "0.19s" } as React.CSSProperties}>
                        <h3 className="ftm-heading">Social</h3>
                        <nav className="ftm-nav">
                            {SOCIAL_LINKS.map(({ label, href }) => (
                                <a
                                    key={label}
                                    className="ftm-link"
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {label}
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>

                <div className="ftm-bottom ftm-reveal">
                    <Image
                        src="/Logo.png"
                        alt="Mitro Team"
                        width={48}
                        height={48}
                        className="ftm-logo-img"
                    />
                    <span className="ftm-credits">
                        Mitro Team 2026 / Oman / Site Credits
                    </span>
                </div>
            </div>

            <style jsx>{`
                .ftm {
                    position: relative;
                    width: 100%;
                    background: #080808;
                    color: #ffffff;
                    overflow: hidden;
                    padding: clamp(64px, 14vw, 96px) clamp(22px, 6vw, 40px)
                        clamp(32px, 8vw, 48px);
                    box-sizing: border-box;
                }

                .ftm-anchor {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 0;
                    height: 0;
                    pointer-events: none;
                }

                .ftm-watermark {
                    position: absolute;
                    left: 50%;
                    top: clamp(40px, 10vw, 72px);
                    transform: translateX(-50%);
                    font-family: "Francy", serif;
                    font-size: clamp(46px, 19vw, 120px);
                    font-weight: 400;
                    color: rgba(255, 255, 255, 0.05);
                    letter-spacing: -0.02em;
                    white-space: nowrap;
                    margin: 0;
                    pointer-events: none;
                    user-select: none;
                    z-index: 0;
                }

                .ftm-shell {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    flex-direction: column;
                }

                .ftm-cta {
                    font-family: "Francy", serif;
                    font-size: clamp(34px, 11vw, 58px);
                    font-weight: 400;
                    line-height: 1.02;
                    letter-spacing: -0.02em;
                    margin: 0 0 clamp(40px, 11vw, 64px);
                    color: #ffffff;
                }

                .ftm-columns {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: clamp(28px, 8vw, 44px) clamp(20px, 6vw, 40px);
                    margin-bottom: clamp(40px, 11vw, 64px);
                }

                .ftm-col:first-child {
                    grid-column: 1 / -1;
                }

                .ftm-heading {
                    font-family: "Francy", serif;
                    font-size: clamp(17px, 4.6vw, 22px);
                    font-weight: 400;
                    margin: 0 0 clamp(14px, 4vw, 18px);
                    letter-spacing: 0.01em;
                    line-height: 1;
                    color: rgba(255, 255, 255, 0.55);
                }

                .ftm-nav {
                    display: flex;
                    flex-direction: column;
                    gap: clamp(9px, 2.6vw, 13px);
                    align-items: flex-start;
                }

                .ftm-link,
                .ftm-nav-btn {
                    font-family: "Francy", serif;
                    font-size: clamp(15px, 4.4vw, 19px);
                    font-weight: 400;
                    color: rgba(255, 255, 255, 0.86);
                    text-decoration: none;
                    background: none;
                    border: none;
                    padding: 0;
                    text-align: left;
                    cursor: pointer;
                    letter-spacing: 0.015em;
                    line-height: 1.3;
                    transition: color 0.2s ease, opacity 0.2s ease;
                }

                .ftm-link:active,
                .ftm-nav-btn:active {
                    opacity: 0.6;
                }

                .ftm-bottom {
                    display: flex;
                    align-items: center;
                    gap: clamp(14px, 4vw, 20px);
                    padding-top: clamp(22px, 6vw, 30px);
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .ftm-bottom :global(.ftm-logo-img) {
                    filter: brightness(0) invert(1);
                    display: block;
                    width: clamp(38px, 11vw, 48px);
                    height: auto;
                    opacity: 0.95;
                }

                .ftm-credits {
                    font-family: "Francy", serif;
                    font-size: clamp(11px, 3.2vw, 14px);
                    color: rgba(255, 255, 255, 0.5);
                    letter-spacing: 0.02em;
                    line-height: 1.4;
                }

                .ftm-reveal {
                    opacity: 0;
                    transform: translateY(34px);
                    transition: opacity 0.7s ease,
                        transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
                    transition-delay: var(--d, 0s);
                    will-change: opacity, transform;
                }

                .ftm-reveal.is-visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                @media (prefers-reduced-motion: reduce) {
                    .ftm-reveal {
                        transition: none;
                    }
                }
            `}</style>
        </footer>
    );
}
