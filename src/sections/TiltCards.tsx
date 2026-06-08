"use client";

import { useRef } from "react";
import gsap from "gsap";

export default function TiltCards() {
    const card = useRef<HTMLDivElement>(null);

    const handleMove = (
        e: React.MouseEvent<HTMLDivElement>
    ) => {
        if (!card.current) return;

        const rect =
            card.current.getBoundingClientRect();

        const x =
            e.clientX - rect.left - rect.width / 2;

        const y =
            e.clientY - rect.top - rect.height / 2;

        gsap.to(card.current, {
            rotateY: x * 0.03,
            rotateX: -y * 0.03,
            transformPerspective: 1000,
            transformOrigin: "center",
            duration: 0.5,
            ease: "power3.out",
        });
    };

    const handleLeave = () => {
        if (!card.current) return;

        gsap.to(card.current, {
            rotateY: 0,
            rotateX: 0,
            duration: 1,
            ease: "elastic.out(1,0.4)",
        });
    };

    return (
        <section
            className="
      min-h-screen
      bg-black
      flex
      items-center
      justify-center
      p-10
      "
        >
            <div
                ref={card}
                onMouseMove={handleMove}
                onMouseLeave={handleLeave}
                className="
        relative
        w-[500px]
        h-[650px]
        rounded-[3rem]
        overflow-hidden
        bg-zinc-900
        border
        border-white/10
        shadow-[0_0_80px_rgba(255,255,255,0.08)]
        "
            >
                <img
                    src="/images/hero.jpg"
                    alt=""
                    className="
          absolute
          inset-0
          w-full
          h-full
          object-cover
          opacity-70
          "
                />

                <div
                    className="
          absolute
          inset-0
          bg-gradient-to-t
          from-black
          via-black/20
          to-transparent
          "
                />

                <div
                    className="
          relative
          z-10
          h-full
          flex
          flex-col
          justify-end
          p-10
          "
                >
                    <p
                        className="
            text-sm
            uppercase
            tracking-[0.3em]
            text-white/60
            mb-4
            "
                    >
                        Creative Direction
                    </p>

                    <h1
                        className="
            text-6xl
            font-black
            uppercase
            leading-none
            tracking-[-0.06em]
            "
                    >
                        Future
                    </h1>
                </div>
            </div>
        </section>
    );
}