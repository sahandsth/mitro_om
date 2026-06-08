"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function TextReveal() {
    const text = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const lines =
            gsap.utils.toArray(".line");

        gsap.from(lines, {
            y: 120,
            opacity: 0,
            stagger: 0.15,
            duration: 1.4,
            ease: "power4.out",
            scrollTrigger: {
                trigger: text.current,
                start: "top 80%",
            },
        });
    }, []);

    return (
        <section
            className="
      min-h-screen
      bg-black
      flex
      items-center
      justify-center
      px-10
      overflow-hidden
      "
        >
            <div
                ref={text}
                className="
        text-white
        uppercase
        font-black
        tracking-[-0.06em]
        leading-[0.9]
        text-[8vw]
        "
            >
                <div className="overflow-hidden">
                    <div className="line">
                        Creative
                    </div>
                </div>

                <div className="overflow-hidden">
                    <div className="line">
                        Experiences
                    </div>
                </div>

                <div className="overflow-hidden">
                    <div className="line">
                        That Move
                    </div>
                </div>
            </div>
        </section>
    );
}