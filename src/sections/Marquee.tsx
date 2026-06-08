"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Marquee() {
    const marquee = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.to(marquee.current, {
            xPercent: -50,
            repeat: -1,
            duration: 20,
            ease: "none",
        });
    }, []);

    return (
        <section className="w-full overflow-hidden bg-white py-10">
            <div
                ref={marquee}
                className="flex w-max whitespace-nowrap"
            >
                <h1 className="text-[8vw] font-bold uppercase text-black px-10">
                    Mitro Agency — 
                </h1>

                <h1 className="text-[8vw] font-bold uppercase text-black px-10">
                    Logo Design —
                </h1>

                <h1 className="text-[8vw] font-bold uppercase text-black px-10">
                    Website Design —
                </h1>

                <h1 className="text-[8vw] font-bold uppercase text-black px-10">
                    Social Media Management —
                </h1>
            </div>
        </section>
    );
}