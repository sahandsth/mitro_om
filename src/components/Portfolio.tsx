"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Portfolio() {
    const section = useRef<HTMLElement>(null);
    const slider = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const amountToScroll =
            slider.current!.scrollWidth - window.innerWidth;

        gsap.to(slider.current, {
            x: -amountToScroll,
            ease: "none",
            scrollTrigger: {
                trigger: section.current,
                start: "top top",
                end: `+=${amountToScroll}`,
                scrub: true,
                pin: true,
            },
        });
    }, []);

    return (
        <section
            ref={section}
            className="h-screen overflow-hidden bg-black"
        >
            <div
                ref={slider}
                className="flex h-full w-max"
            >
                <div className="w-screen h-full flex items-center justify-center bg-taupe-300 text-white text-[6vw] font-bold">
                    Portfolio
                </div>

            </div>
        </section>
    );
}