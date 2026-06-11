import { smoothScrollTo } from "@/lib/lenisStore";

export function getNavHeight() {
    if (typeof window === "undefined") return 110;
    return (
        parseInt(
            getComputedStyle(document.documentElement).getPropertyValue(
                "--nav-h"
            ),
            10
        ) || 110
    );
}

const SECTION_ANCHORS: Record<string, string> = {
    home: "home",
    services: "services",
    portfolio: "portfolio-entry",
    about: "about-entry",
    contacts: "contacts-entry",
};

export function scrollToSection(id: string) {
    const anchorId = SECTION_ANCHORS[id] ?? id;
    const el = document.getElementById(anchorId);
    if (!el) return;

    const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY);

    // Prefer Lenis so the jump rides the same momentum curve as wheel scroll.
    if (smoothScrollTo(top, { duration: 1.1 })) return;

    window.scrollTo({ top, behavior: "smooth" });
}
