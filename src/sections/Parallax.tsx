"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Parallax() {
    const section = useRef<HTMLElement>(null);

    const bg = useRef<HTMLDivElement>(null);
    const mid = useRef<HTMLDivElement>(null);
    const front = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        gsap.to(bg.current, {
            y: -200,
            ease: "none",
            scrollTrigger: {
                trigger: section.current,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
            },
        });

        gsap.to(mid.current, {
            y: -400,
            ease: "none",
            scrollTrigger: {
                trigger: section.current,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
            },
        });

        gsap.to(front.current, {
            y: -600,
            ease: "none",
            scrollTrigger: {
                trigger: section.current,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
            },
        });
    }, []);

    return (
        <section
            ref={section}
            className="relative h-[200vh] overflow-hidden bg-black flex items-center justify-center"
        >
            <div
                ref={bg}
                className="absolute w-[80vw] h-[80vh] bg-zinc-800 rounded-[3rem]"
            />

            <div
                ref={mid}
                className="absolute w-[50vw] h-[50vh] bg-zinc-600 rounded-[2rem]"
            />

            <h1
                ref={front}
                className="relative z-10 text-[10vw] uppercase font-bold"
            >
                Something
            </h1>
        </section>
    );
}