"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CameraZoom() {
    const section = useRef<HTMLElement>(null);

    const bg = useRef<HTMLImageElement>(null);
    const text = useRef<HTMLHeadingElement>(null);
    const overlay = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section.current,
                start: "top top",
                end: "+=2500",
                scrub: true,
                pin: true,
            },
        });

        tl.to(bg.current, {
            scale: 1.4,
            ease: "none",
        });

        tl.to(
            text.current,
            {
                scale: 0.6,
                y: -200,
                opacity: 0,
                ease: "none",
            },
            0
        );

        tl.to(
            overlay.current,
            {
                opacity: 0.6,
                ease: "none",
            },
            0
        );
    }, []);

    return (
        <section
            ref={section}
            className="
      relative
      h-screen
      overflow-hidden
      bg-black
      "
        >
            <img
                ref={bg}
                src="/images/hero.jpg"
                alt=""
                className="
        absolute
        inset-0
        w-full
        h-full
        object-cover
        scale-110
        "
            />

            <div
                ref={overlay}
                className="
        absolute
        inset-0
        bg-black
        opacity-20
        "
            />

            <div
                className="
        relative
        z-10
        w-full
        h-full
        flex
        items-center
        justify-center
        "
            >
                <h1
                    ref={text}
                    className="
          text-[9vw]
          font-black
          uppercase
          tracking-[-0.06em]
          text-white
          "
                >
                    Vision
                </h1>
            </div>
        </section>
    );
}