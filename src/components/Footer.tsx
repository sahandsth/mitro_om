"use client";

import Image from "next/image";

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

function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const navH =
        parseInt(
            getComputedStyle(document.documentElement).getPropertyValue(
                "--nav-h"
            ),
            10
        ) || 110;
    const top = el.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: "smooth" });
}

export default function Footer() {
    return (
        <footer id="contacts" className="ft">
            <p className="ft-watermark" aria-hidden="true">
                MITRO AGENCY
            </p>

            <div className="ft-inner">
                <div className="ft-content">
                    <div className="ft-grid">
                        <div className="ft-col">
                            <h3 className="ft-heading">Reach out</h3>
                            <a
                                className="ft-link"
                                href="mailto:mitro.agency@gmail.com"
                            >
                                mitro.agency@gmail.com
                            </a>
                            <a className="ft-link" href="tel:+96892086094">
                                +968 9208 6094
                            </a>
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

                        <div className="ft-col ft-col--social">
                            <h3 className="ft-heading">Social</h3>
                            <div className="ft-social-row">
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
                                <div className="ft-logo">
                                    <Image
                                        src="/Logo.png"
                                        alt="Mitro Agency"
                                        width={48}
                                        height={48}
                                        className="ft-logo-img"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="ft-bottom">
                        <span className="ft-cta">Lets Work Together</span>
                        <span className="ft-credits">
                            Mitro Agency 2026 / Oman / Site Credits
                        </span>
                    </div>
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
                    box-sizing: border-box;
                }

                .ft-inner {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 2;
                    box-sizing: border-box;
                    padding: 0 clamp(28px, 5vw, 72px)
                        clamp(24px, 4vh, 40px);
                }

                .ft-content {
                    display: flex;
                    flex-direction: column;
                    gap: clamp(20px, 3vh, 36px);
                }

                .ft-watermark {
                    position: absolute;
                    left: 50%;
                    bottom: clamp(80px, 14vh, 160px);
                    transform: translateX(-50%);
                    font-family: "Francy", serif;
                    font-size: clamp(52px, 10vw, 140px);
                    font-weight: 400;
                    color: rgba(255, 255, 255, 0.05);
                    letter-spacing: -0.02em;
                    white-space: nowrap;
                    margin: 0;
                    pointer-events: none;
                    user-select: none;
                    z-index: 1;
                }

                .ft-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: clamp(20px, 3vw, 48px);
                    align-items: end;
                }

                .ft-heading {
                    font-family: "Francy", serif;
                    font-size: clamp(16px, 1.8vw, 24px);
                    font-weight: 400;
                    margin: 0 0 clamp(10px, 1.5vh, 18px);
                    letter-spacing: 0.01em;
                }

                .ft-nav {
                    display: flex;
                    flex-direction: column;
                    gap: clamp(5px, 0.9vh, 10px);
                }

                .ft-link,
                .ft-nav-btn {
                    font-family: "Francy", serif;
                    font-size: clamp(13px, 1.1vw, 17px);
                    color: rgba(255, 255, 255, 0.88);
                    text-decoration: none;
                    background: none;
                    border: none;
                    padding: 0;
                    text-align: left;
                    cursor: pointer;
                    transition: color 0.2s ease;
                    letter-spacing: 0.02em;
                    line-height: 1.35;
                }

                .ft-link:hover,
                .ft-nav-btn:hover {
                    color: #ffffff;
                }

                .ft-social-row {
                    display: flex;
                    align-items: flex-end;
                    gap: clamp(16px, 2.5vw, 40px);
                }

                .ft-logo {
                    flex-shrink: 0;
                    opacity: 0.95;
                }

                .ft-logo :global(.ft-logo-img) {
                    filter: brightness(0) invert(1);
                }

                .ft-bottom {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    gap: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                    padding-top: clamp(14px, 2vh, 22px);
                }

                .ft-cta,
                .ft-credits {
                    font-family: "Francy", serif;
                    font-size: clamp(12px, 1vw, 15px);
                    color: rgba(255, 255, 255, 0.9);
                    letter-spacing: 0.02em;
                    line-height: 1.4;
                }

                .ft-credits {
                    color: rgba(255, 255, 255, 0.55);
                    text-align: right;
                }

                @media (max-height: 820px) {
                    .ft-inner {
                        padding-bottom: 18px;
                    }

                    .ft-watermark {
                        font-size: clamp(40px, 8vw, 90px);
                        bottom: clamp(60px, 10vh, 100px);
                    }

                    .ft-content {
                        gap: 16px;
                    }

                    .ft-heading {
                        margin-bottom: 8px;
                    }
                }

                @media (max-width: 768px) {
                    .ft-grid {
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }

                    .ft-bottom {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .ft-credits {
                        text-align: left;
                    }
                }
            `}</style>
        </footer>
    );
}
