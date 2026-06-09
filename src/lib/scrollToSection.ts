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

    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}
