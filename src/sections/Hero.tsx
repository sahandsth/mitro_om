"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
    const section = useRef<HTMLElement>(null);
    const image = useRef<HTMLImageElement>(null);
    const title = useRef<HTMLHeadingElement>(null);

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

        tl.fromTo(
            image.current,
            {
                scale: 1.3,
                opacity: 0,
            },
            {
                scale: 1,
                opacity: 1,
                ease: "none",
            }
        );

        tl.to(
            title.current,
            {
                y: -300,
                opacity: 0,
                ease: "none",
            },
            0
        );
    }, []);

    return (
        <section
            ref={section}
            className="relative h-screen overflow-hidden bg-black"
        >
            <img
                ref={image}
                src="/images/hero.jpg"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/40" />

            <div className="relative z-10 w-full h-full flex items-center justify-center">
                <h1
                    ref={title}
                    className="text-[8vw] uppercase font-bold text-white"
                >
                    Mitro Agency
                </h1>
            </div>
        </section>
    );
}