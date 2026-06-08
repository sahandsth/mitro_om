"use client";

import Image from "next/image";

const NAV_LINKS = [
    { label: "Portfolio", id: "portfolio" },
    { label: "About", id: "about" },
    { label: "Contacts", id: "contacts" },
    { label: "Services", id: "services" },
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

export default function Navbar() {
    return (
        <nav className="hero-nav">
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

            <div className="hero-nav-links">
                {NAV_LINKS.map(({ label, id }) => (
                    <button
                        key={id}
                        type="button"
                        className="hero-nav-btn"
                        onClick={() => scrollToSection(id)}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </nav>
    );
}
