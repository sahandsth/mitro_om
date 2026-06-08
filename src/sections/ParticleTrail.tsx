"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function ParticleTrail() {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let lastX = window.innerWidth / 2;
        let lastY = window.innerHeight / 2;

        const createParticle = (
            x: number,
            y: number,
            dx: number,
            dy: number
        ) => {
            const particle =
                document.createElement("div");

            particle.style.position = "absolute";

            const size =
                Math.random() * 10 + 6;

            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;

            particle.style.borderRadius = "999px";

            particle.style.background = "white";

            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;

            particle.style.pointerEvents = "none";

            particle.style.opacity = "1";

            container.current?.appendChild(
                particle
            );

            // direction normalization
            const length =
                Math.sqrt(dx * dx + dy * dy) || 1;

            const dirX = dx / length;
            const dirY = dy / length;

            // if mouse is still
            const isStill =
                Math.abs(dx) < 1 &&
                Math.abs(dy) < 1;

            // behind movement
            const targetX = isStill
                ? x + (Math.random() - 0.5) * 40
                : x - dirX * 120 +
                (Math.random() - 0.5) * 50;

            const targetY = isStill
                ? y + 80 + Math.random() * 40
                : y - dirY * 120 +
                (Math.random() - 0.5) * 50;

            gsap.to(particle, {
                x: targetX - x,
                y: targetY - y,
                opacity: 0,
                scale: 0,
                duration: 1.2,
                ease: "power3.out",
                onComplete: () => {
                    particle.remove();
                },
            });
        };

        const move = (e: MouseEvent) => {
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;

            createParticle(
                e.clientX,
                e.clientY,
                dx,
                dy
            );

            lastX = e.clientX;
            lastY = e.clientY;
        };

        window.addEventListener(
            "mousemove",
            move
        );

        return () => {
            window.removeEventListener(
                "mousemove",
                move
            );
        };
    }, []);

    return (
        <section
            ref={container}
            className="
      relative
      min-h-screen
      bg-black
      overflow-hidden
      flex
      items-center
      justify-center
      "
        >
            <h1
                className="
        relative
        z-10
        text-[9vw]
        uppercase
        font-black
        tracking-[-0.06em]
        text-white
        "
            >
                Energy
            </h1>
        </section>
    );
}