"use client";

import Image from "next/image";

export default function Navbar() {
    return (
        <nav className="hero-nav">
            <div className="hero-logo">
                <Image
                    src="/logo.png"
                    alt="Logo"
                    width={45}
                    height={45}
                    className="logo-img"
                    priority
                />
            </div>

            <div className="hero-nav-links">
                <a href="#portfolio">Portfolio</a>
                <a href="#about">About</a>
                <a href="#contacts">Contacts</a>
                <a href="#services">Services</a>
            </div>
        </nav>
    );
}