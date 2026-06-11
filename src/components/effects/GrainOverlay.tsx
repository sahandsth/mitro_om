"use client";

/**
 * Full-screen filmic grain plus a soft vignette. Purely decorative and
 * non-interactive; sits above sections but below the cursor / nav / preloader.
 */
export default function GrainOverlay() {
    return (
        <>
            <div className="grain" aria-hidden="true" />
            <div className="vignette" aria-hidden="true" />

            <style jsx>{`
                .grain {
                    position: fixed;
                    inset: -150%;
                    z-index: 9000;
                    pointer-events: none;
                    opacity: 0.05;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
                    background-size: 220px 220px;
                    animation: grain-shift 0.7s steps(5) infinite;
                    will-change: transform;
                }

                .vignette {
                    position: fixed;
                    inset: 0;
                    z-index: 8999;
                    pointer-events: none;
                    background: radial-gradient(
                        ellipse 130% 120% at 50% 50%,
                        transparent 58%,
                        rgba(0, 0, 0, 0.16) 100%
                    );
                }

                @keyframes grain-shift {
                    0% {
                        transform: translate(0, 0);
                    }
                    20% {
                        transform: translate(-4%, 3%);
                    }
                    40% {
                        transform: translate(3%, -4%);
                    }
                    60% {
                        transform: translate(-3%, -2%);
                    }
                    80% {
                        transform: translate(4%, 2%);
                    }
                    100% {
                        transform: translate(0, 0);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .grain {
                        animation: none;
                    }
                }
            `}</style>
        </>
    );
}
