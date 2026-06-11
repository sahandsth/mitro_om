"use client";

import Image from "next/image";
import { scrollToSection } from "@/lib/scrollToSection";
import Spotlight from "@/components/effects/Spotlight";

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

export default function Footer() {
    return (
        <footer id="contacts" className="ft">
            <Spotlight color="rgba(255, 255, 255, 0.08)" size={640} />
            <p className="ft-watermark" aria-hidden="true">
                MITRO TEAM
            </p>

            <div className="ft-shell">
                <div className="ft-columns">
                    <div className="ft-col">
                        <h3 className="ft-heading">Reach out</h3>
                        <nav className="ft-nav">
                            <a
                                className="ft-link"
                                href="mailto:mitro.agency@gmail.com"
                            >
                                mitro.agency@gmail.com
                            </a>
                            <a className="ft-link" href="tel:+96892086094">
                                +968 9208 6094
                            </a>
                        </nav>
                    </div>

                    <div className="ft-col">
                        <h3 className="ft-heading">Explore</h3>
                        <nav className="ft-nav">
                            {EXPLORE_LINKS.map(({ label, id }) => (
                                <button
                                    key={id}
                                    type="button"
                                    className="ft-nav-btn"
                                    onClick={() => scrollToSection(id)}
                                >
                                    {label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="ft-col">
                        <h3 className="ft-heading">Social</h3>
                        <nav className="ft-nav">
                            {SOCIAL_LINKS.map(({ label, href }) => (
                                <a
                                    key={label}
                                    className="ft-link"
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {label}
                                </a>
                            ))}
                        </nav>
                    </div>

                    <div className="ft-logo">
                        <Image
                            src="/Logo.png"
                            alt="Mitro Team"
                            width={56}
                            height={56}
                            className="ft-logo-img"
                        />
                    </div>
                </div>

                <div className="ft-bottom">
                    <span className="ft-cta">Lets Work Together</span>
                    <span className="ft-credits">
                        Mitro Team 2026 / Oman / Site Credits
                    </span>
                </div>
            </div>

            <style jsx>{`
                .ft {
                    position: absolute;
                    inset: 0;
                    height: 100%;
                    background: #080808;
                    color: #ffffff;
                    z-index: 0;
                    overflow: hidden;
                }

                .ft-watermark {
                    position: absolute;
                    left: 50%;
                    top: 42%;
                    transform: translate(-50%, -50%);
                    font-family: "Francy", serif;
                    font-size: clamp(64px, 12.5vw, 180px);
                    font-weight: 400;
                    color: rgba(255, 255, 255, 0.045);
                    letter-spacing: -0.02em;
                    white-space: nowrap;
                    margin: 0;
                    pointer-events: none;
                    user-select: none;
                    z-index: 1;
                }

                .ft-shell {
                    position: relative;
                    z-index: 2;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    padding: 0 62px clamp(24px, 3.8vh, 40px);
                    box-sizing: border-box;
                }

                .ft-columns {
                    display: grid;
                    grid-template-columns:
                        minmax(0, 1.35fr) minmax(0, 0.75fr) minmax(0, 0.75fr)
                        auto;
                    column-gap: clamp(56px, 7.5vw, 112px);
                    row-gap: 24px;
                    align-items: start;
                    width: 100%;
                    margin-bottom: clamp(40px, 7.5vh, 88px);
                }

                .ft-col {
                    min-width: 0;
                }

                .ft-heading {
                    font-family: "Francy", serif;
                    font-size: clamp(18px, 1.7vw, 26px);
                    font-weight: 400;
                    margin: 0 0 clamp(16px, 2.2vh, 24px);
                    letter-spacing: 0.01em;
                    line-height: 1;
                    min-height: 1em;
                }

                .ft-nav {
                    display: flex;
                    flex-direction: column;
                    gap: clamp(7px, 1.1vh, 12px);
                }

                .ft-link,
                .ft-nav-btn {
                    font-family: "Francy", serif;
                    font-size: clamp(13px, 1.05vw, 17px);
                    font-weight: 400;
                    color: rgba(255, 255, 255, 0.82);
                    text-decoration: none;
                    background: none;
                    border: none;
                    padding: 0;
                    text-align: left;
                    cursor: pointer;
                    transition: color 0.2s ease;
                    letter-spacing: 0.015em;
                    line-height: 1.4;
                }

                .ft-link:hover,
                .ft-nav-btn:hover {
                    color: #ffffff;
                }

                .ft-logo {
                    justify-self: end;
                    align-self: start;
                    margin-left: clamp(16px, 2vw, 40px);
                    opacity: 0.95;
                }

                .ft-logo :global(.ft-logo-img) {
                    filter: brightness(0) invert(1);
                    display: block;
                }

                .ft-bottom {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    gap: 24px;
                    width: 100%;
                }

                .ft-cta,
                .ft-credits {
                    font-family: "Francy", serif;
                    font-size: clamp(12px, 0.95vw, 15px);
                    color: rgba(255, 255, 255, 0.88);
                    letter-spacing: 0.02em;
                    line-height: 1.4;
                }

                .ft-credits {
                    color: rgba(255, 255, 255, 0.5);
                    text-align: right;
                }

                @media (max-height: 800px) {
                    .ft-columns {
                        margin-bottom: clamp(32px, 6vh, 56px);
                    }

                    .ft-watermark {
                        font-size: clamp(48px, 10vw, 120px);
                        top: 44%;
                    }
                }

                @media (max-width: 900px) {
                    .ft-shell {
                        padding-left: clamp(24px, 5vw, 48px);
                        padding-right: clamp(24px, 5vw, 48px);
                    }

                    .ft-columns {
                        grid-template-columns: 1fr 1fr;
                        gap: 32px 24px;
                    }

                    .ft-logo {
                        grid-column: 2;
                        grid-row: 1;
                        justify-self: end;
                    }

                    .ft-col:nth-child(3) {
                        grid-column: 1;
                    }
                }

                @media (max-width: 560px) {
                    .ft-columns {
                        grid-template-columns: 1fr;
                    }

                    .ft-logo {
                        grid-column: 1;
                        grid-row: auto;
                        justify-self: start;
                    }

                    .ft-bottom {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 12px;
                    }

                    .ft-credits {
                        text-align: left;
                    }
                }
            `}</style>
        </footer>
    );
}
