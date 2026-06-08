"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function LightTracking() {
    const light = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const moveLight = (e: MouseEvent) => {
            gsap.to(light.current, {
                x: e.clientX - 200,
                y: e.clientY - 200,
                duration: 0.6,
                ease: "power3.out",
            });
        };

        window.addEventListener(
            "mousemove",
            moveLight
        );

        return () => {
            window.removeEventListener(
                "mousemove",
                moveLight
            );
        };
    }, []);

    return (
        <section
            className="
      relative
      min-h-screen
      overflow-hidden
      bg-black
      flex
      items-center
      justify-center
      "
        >
            <div
                ref={light}
                className="
        absolute
        w-[400px]
        h-[400px]
        rounded-full
        pointer-events-none
        blur-[120px]
        opacity-40
        "
                style={{
                    background:
                        "radial-gradient(circle, white 0%, transparent 70%)",
                }}
            />

            <h1
                className="
        relative
        z-10
        text-[10vw]
        font-black
        uppercase
        tracking-[-0.06em]
        text-white
        "
            >
                Illuminate
            </h1>
        </section>
    );
}