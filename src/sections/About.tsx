"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
    const section = useRef<HTMLElement>(null);
    const text = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        if (!text.current) return;

        const split = new SplitType(text.current, {
            types: "chars",
        });

        gsap.fromTo(
            split.chars,
            {
                opacity: 0,
                y: 100,
            },
            {
                opacity: 1,
                y: 0,
                stagger: 0.03,
                ease: "power4.out",
                scrollTrigger: {
                    trigger: section.current,
                    start: "top 70%",
                },
            }
        );
    }, []);

    return (
        <section
            ref={section}
            className="min-h-screen bg-white text-black flex items-center justify-center px-10 overflow-hidden"
        >
            <p
                ref={text}
                className="text-[5vw] leading-[1] uppercase font-bold max-w-6xl"
            >
                We create immersive digital experiences through
                motion and storytelling.
            </p>
        </section>
    );
}