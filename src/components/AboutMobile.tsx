"use client";

import { useEffect, useRef } from "react";
import FooterMobile from "@/components/FooterMobile";

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
        skills: ["Visual Identity", "Brand Books", "Art & Content Direction"],
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

export default function AboutMobile() {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        const targets = Array.from(
            root.querySelectorAll<HTMLElement>(".abm-reveal")
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
            { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
        );

        targets.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);

    return (
        <div id="about" className="abm" ref={rootRef}>
            <span id="about-entry" aria-hidden="true" className="abm-anchor" />

            <section className="abm-intro">
                <h2 className="abm-title abm-reveal">About Us</h2>
                <p className="abm-desc abm-reveal" style={{ "--d": "0.1s" } as React.CSSProperties}>
                    We are a small team of three — each bringing a distinct
                    craft to every project. Together we cover strategy, design,
                    and development so your brand moves from idea to execution
                    without losing its voice.
                </p>
            </section>

            <div className="abm-cards">
                {TEAM.map((member, i) => (
                    <article
                        key={member.name}
                        className="abm-card abm-reveal"
                        style={
                            {
                                background: member.tone,
                                "--i": i,
                            } as React.CSSProperties
                        }
                    >
                        <div className="abm-card-head">
                            <span className="abm-role">{member.role}</span>
                            <span className="abm-index" aria-hidden="true">
                                0{i + 1}
                            </span>
                        </div>
                        <h3 className="abm-name">{member.name}</h3>
                        <span className="abm-rule" aria-hidden="true" />
                        <p className="abm-bio">{member.bio}</p>
                        <ul className="abm-skills">
                            {member.skills.map((s) => (
                                <li key={s}>{s}</li>
                            ))}
                        </ul>
                    </article>
                ))}
            </div>

            <FooterMobile />

            <style jsx>{`
                .abm {
                    position: relative;
                    width: 100%;
                    background: #c4c4c4;
                    overflow: hidden;
                }

                .abm-anchor {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 0;
                    height: 0;
                    pointer-events: none;
                }

                .abm-intro {
                    padding: clamp(72px, 20vw, 120px) clamp(22px, 6vw, 40px)
                        clamp(28px, 8vw, 44px);
                }

                .abm-title {
                    font-family: "Francy", serif;
                    font-size: clamp(40px, 13vw, 68px);
                    font-weight: 400;
                    color: #1a1a1a;
                    margin: 0 0 clamp(16px, 4vw, 22px);
                    line-height: 1.02;
                    letter-spacing: -0.02em;
                }

                .abm-desc {
                    font-family: "Cormorant Garamond", Georgia, serif;
                    font-size: clamp(16px, 4.6vw, 20px);
                    font-weight: 300;
                    color: rgba(30, 30, 30, 0.74);
                    line-height: 1.7;
                    margin: 0;
                    max-width: 36ch;
                }

                .abm-cards {
                    display: flex;
                    flex-direction: column;
                    gap: clamp(11px, 3vw, 16px);
                    padding: clamp(4px, 2vw, 10px) clamp(22px, 6vw, 40px)
                        clamp(48px, 12vw, 72px);
                }

                .abm-card {
                    position: relative;
                    border-radius: 3px;
                    padding: clamp(18px, 5vw, 24px) clamp(18px, 5vw, 24px)
                        clamp(18px, 5vw, 22px);
                    color: #ffffff;
                    overflow: hidden;
                    box-shadow: 0 10px 26px rgba(0, 0, 0, 0.2);
                }

                .abm-card-head {
                    display: flex;
                    align-items: baseline;
                    justify-content: space-between;
                    gap: 12px;
                    margin-bottom: clamp(5px, 1.6vw, 8px);
                }

                .abm-index {
                    font-family: "Francy", serif;
                    font-size: clamp(10px, 2.6vw, 12px);
                    color: rgba(255, 255, 255, 0.28);
                    letter-spacing: 0.1em;
                    flex-shrink: 0;
                }

                .abm-role {
                    font-family: "Francy", serif;
                    font-size: clamp(9px, 2.4vw, 11px);
                    color: rgba(255, 255, 255, 0.55);
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                }

                .abm-name {
                    font-family: "Francy", serif;
                    font-size: clamp(19px, 5.4vw, 25px);
                    font-weight: 400;
                    margin: 0 0 clamp(10px, 2.8vw, 14px);
                    line-height: 1.12;
                    letter-spacing: -0.005em;
                }

                .abm-rule {
                    display: block;
                    width: clamp(28px, 9vw, 40px);
                    height: 1px;
                    background: rgba(255, 255, 255, 0.28);
                    margin-bottom: clamp(10px, 2.8vw, 14px);
                }

                .abm-bio {
                    font-family: "Cormorant Garamond", Georgia, serif;
                    font-size: clamp(13px, 3.6vw, 15px);
                    font-weight: 300;
                    line-height: 1.55;
                    color: rgba(255, 255, 255, 0.78);
                    margin: 0 0 clamp(13px, 3.6vw, 17px);
                }

                .abm-skills {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: clamp(6px, 1.8vw, 10px);
                }

                .abm-skills li {
                    font-family: "Francy", serif;
                    font-size: clamp(9px, 2.5vw, 11px);
                    color: rgba(255, 255, 255, 0.55);
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }

                .abm-skills li:not(:last-child)::after {
                    content: "";
                    display: inline-block;
                    width: 3px;
                    height: 3px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    margin-left: clamp(6px, 1.8vw, 10px);
                    vertical-align: middle;
                }

                .abm-reveal {
                    opacity: 0;
                    transform: translateY(40px) scale(0.985);
                    transition: opacity 0.75s ease,
                        transform 0.75s cubic-bezier(0.22, 1, 0.36, 1);
                    transition-delay: var(--d, 0s);
                    will-change: opacity, transform;
                }

                .abm-card.abm-reveal {
                    transform: translateY(28px) scale(0.985);
                }

                .abm-reveal.is-visible {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }

                @media (prefers-reduced-motion: reduce) {
                    .abm-reveal {
                        transition: none;
                    }
                }
            `}</style>
        </div>
    );
}
