"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Horizontal() {
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
                <div className="w-screen h-full flex items-center justify-center bg-red-500 text-[6vw] font-bold">
                    Sahand
                </div>

                <div className="w-screen h-full flex items-center justify-center bg-blue-500 text-[6vw] font-bold">
                    Saghar

                </div>

                <div className="w-screen h-full flex items-center justify-center bg-green-500 text-[6vw] font-bold">
                    Maani
                </div>

                <div className="w-screen h-full flex items-center justify-center bg-yellow-500 text-black text-[6vw] font-bold">
                    Elahe
                </div>
            </div>
        </section>
    );
}