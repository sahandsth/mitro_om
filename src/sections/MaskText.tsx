"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function MaskText() {
    const section = useRef<HTMLElement>(null);
    const lines = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        gsap.fromTo(
            lines.current,
            {
                yPercent: 120,
            },
            {
                yPercent: 0,
                stagger: 0.15,
                ease: "power4.out",
                scrollTrigger: {
                    trigger: section.current,
                    start: "top 70%",
                },
            }
        );
    }, []);

    const addToRefs = (el: HTMLDivElement | null) => {
        if (el && !lines.current.includes(el)) {
            lines.current.push(el);
        }
    };

    return (
        <section
            ref={section}
            className="min-h-screen bg-black text-white flex items-center px-10 overflow-hidden"
        >
            <div className="text-[7vw] uppercase font-bold leading-[0.9]">

                <div className="overflow-hidden">
                    <div ref={addToRefs}>
                        Crafted
                    </div>
                </div>

                <div className="overflow-hidden">
                    <div ref={addToRefs}>
                        Through
                    </div>
                </div>

                <div className="overflow-hidden">
                    <div ref={addToRefs}>
                        Motion
                    </div>
                </div>

            </div>
        </section>
    );
}