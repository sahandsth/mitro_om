"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { scrollToSection } from "@/lib/scrollToSection";

const NAV_LINKS = [
    { label: "Portfolio", id: "portfolio" },
    { label: "About", id: "about" },
    { label: "Contacts", id: "contacts" },
    { label: "Services", id: "services" },
];

/** anchor element id used to detect when a section is the active one */
const ACTIVE_ANCHORS: { id: string; anchor: string }[] = [
    { id: "home", anchor: "home" },
    { id: "services", anchor: "services" },
    { id: "portfolio", anchor: "portfolio-entry" },
    { id: "about", anchor: "about-entry" },
    { id: "contacts", anchor: "contacts-entry" },
];

/** Wraps a child and nudges it toward the cursor for a magnetic hover feel. */
function Magnetic({
    children,
    strength = 0.4,
}: {
    children: React.ReactNode;
    strength?: number;
}) {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
            return;

        const onMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);
            el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        };
        const onLeave = () => {
            el.style.transform = "translate(0, 0)";
        };

        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        return () => {
            el.removeEventListener("mousemove", onMove);
            el.removeEventListener("mouseleave", onLeave);
        };
    }, [strength]);

    return (
        <span ref={ref} className="nav-magnetic">
            {children}
        </span>
    );
}

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [active, setActive] = useState("home");

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 40);

            const mid = window.innerHeight * 0.45;
            let current = "home";
            for (const { id, anchor } of ACTIVE_ANCHORS) {
                const el = document.getElementById(anchor);
                if (!el) continue;
                if (el.getBoundingClientRect().top <= mid) current = id;
            }
            setActive(current);
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, []);

    return (
        <nav
            className={`hero-nav ${scrolled ? "hero-nav--scrolled" : ""}`}
            {...(active === "home" ? { "data-cursor-light": "" } : {})}
        >
            <Magnetic strength={0.35}>
                <button
                    type="button"
                    className="hero-logo"
                    onClick={() => scrollToSection("home")}
                    aria-label="Go to home"
                >
                    <Image
                        src="/Logo.png"
                        alt="Logo"
                        width={45}
                        height={45}
                        className="logo-img"
                        priority
                    />
                </button>
            </Magnetic>

            <div className="hero-nav-links">
                {NAV_LINKS.map(({ label, id }) => (
                    <Magnetic key={id} strength={0.45}>
                        <button
                            type="button"
                            className={`hero-nav-btn ${
                                active === id ? "hero-nav-btn--active" : ""
                            }`}
                            onClick={() => scrollToSection(id)}
                        >
                            <span className="nav-label">
                                <span className="nav-label-row">{label}</span>
                                <span className="nav-label-row nav-label-row--dup">
                                    {label}
                                </span>
                            </span>
                        </button>
                    </Magnetic>
                ))}
            </div>

            <style jsx global>{`
                .hero-nav {
                    transition:
                        background 0.4s ease,
                        backdrop-filter 0.4s ease,
                        box-shadow 0.4s ease;
                }

                .hero-nav--scrolled {
                    background: rgba(200, 200, 200, 0.18);
                    backdrop-filter: blur(14px) saturate(1.2);
                    -webkit-backdrop-filter: blur(14px) saturate(1.2);
                    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.18);
                }

                .nav-magnetic {
                    display: inline-flex;
                    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
                    will-change: transform;
                }

                .hero-nav-btn {
                    position: relative;
                    overflow: hidden;
                }

                .nav-label {
                    position: relative;
                    display: inline-block;
                    overflow: hidden;
                    vertical-align: bottom;
                }

                .nav-label-row {
                    display: block;
                    transition: transform 0.42s cubic-bezier(0.76, 0, 0.24, 1);
                }

                .nav-label-row--dup {
                    position: absolute;
                    top: 100%;
                    left: 0;
                }

                .hero-nav-btn:hover .nav-label-row {
                    transform: translateY(-100%);
                }

                .hero-nav-btn--active {
                    color: rgba(60, 60, 60, 1);
                }

                .hero-nav-btn--active::after {
                    content: "";
                    position: absolute;
                    left: 0;
                    bottom: 2px;
                    width: 100%;
                    height: 1.5px;
                    background: currentColor;
                    transform-origin: left center;
                    animation: nav-underline 0.4s cubic-bezier(0.22, 1, 0.36, 1);
                }

                @keyframes nav-underline {
                    from {
                        transform: scaleX(0);
                    }
                    to {
                        transform: scaleX(1);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .nav-magnetic {
                        transform: none !important;
                    }
                }
            `}</style>
        </nav>
    );
}
