"use client";

import { useEffect, useRef } from "react";

/**
 * Classic agency image-trail: as the cursor sweeps across the parent, small
 * thumbnails are dropped along the path and quickly fade out. Mounts as a
 * pointer-events-none overlay inside a relatively-positioned parent.
 */
export default function ImageTrail({
    images,
    threshold = 110,
    thumbWidth = 130,
}: {
    images: string[];
    threshold?: number;
    thumbWidth?: number;
}) {
    const layerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const layer = layerRef.current;
        const parent = layer?.parentElement;
        if (!layer || !parent || images.length === 0) return;
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
            return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            return;

        const last = { x: 0, y: 0 };
        let dist = 0;
        let idx = 0;
        let started = false;

        const spawn = (x: number, y: number, src: string) => {
            const img = document.createElement("img");
            img.src = src;
            img.alt = "";
            img.className = "trail-img";
            img.style.left = `${x}px`;
            img.style.top = `${y}px`;
            img.style.width = `${thumbWidth}px`;
            layer.appendChild(img);

            requestAnimationFrame(() => img.classList.add("trail-img--in"));
            window.setTimeout(() => {
                img.classList.remove("trail-img--in");
                img.classList.add("trail-img--out");
            }, 360);
            window.setTimeout(() => img.remove(), 1000);
        };

        const onMove = (e: MouseEvent) => {
            const r = parent.getBoundingClientRect();
            const x = e.clientX - r.left;
            const y = e.clientY - r.top;
            if (!started) {
                last.x = x;
                last.y = y;
                started = true;
                return;
            }
            dist += Math.hypot(x - last.x, y - last.y);
            last.x = x;
            last.y = y;
            if (dist < threshold) return;
            dist = 0;
            spawn(x, y, images[idx % images.length]);
            idx++;
        };

        const onLeave = () => {
            started = false;
            dist = 0;
        };

        parent.addEventListener("mousemove", onMove, { passive: true });
        parent.addEventListener("mouseleave", onLeave);
        return () => {
            parent.removeEventListener("mousemove", onMove);
            parent.removeEventListener("mouseleave", onLeave);
            layer.replaceChildren();
        };
    }, [images, threshold, thumbWidth]);

    return (
        <div ref={layerRef} className="trail-layer" aria-hidden="true">
            <style jsx>{`
                .trail-layer {
                    position: absolute;
                    inset: 0;
                    z-index: 35;
                    pointer-events: none;
                    overflow: hidden;
                }
            `}</style>
            <style jsx global>{`
                .trail-layer .trail-img {
                    position: absolute;
                    aspect-ratio: 3 / 4;
                    object-fit: cover;
                    transform: translate(-50%, -50%) scale(0.6) rotate(-3deg);
                    opacity: 0;
                    border-radius: 2px;
                    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.32);
                    transition:
                        transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                        opacity 0.45s ease;
                    will-change: transform, opacity;
                }
                .trail-layer .trail-img--in {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1) rotate(0deg);
                }
                .trail-layer .trail-img--out {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(1.08) rotate(2deg);
                }
            `}</style>
        </div>
    );
}
