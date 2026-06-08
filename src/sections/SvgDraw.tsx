"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SvgDraw() {
    const path = useRef<SVGPathElement>(null);
    const section = useRef<HTMLElement>(null);

    useEffect(() => {
        const length =
            path.current?.getTotalLength() || 0;

        gsap.set(path.current, {
            strokeDasharray: length,
            strokeDashoffset: length,
        });

        gsap.to(path.current, {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
                trigger: section.current,
                start: "top center",
                end: "bottom center",
                scrub: true,
            },
        });
    }, []);

    return (
        <section
            ref={section}
            className="
      min-h-screen
      bg-black
      flex
      items-center
      justify-center
      overflow-hidden
      "
        >
            <svg
                width="800"
                height="400"
                viewBox="0 0 800 400"
                fill="none"
            >
                <path
                    ref={path}
                    d="
          M50 200
          C200 50,
          400 350,
          750 200
          "
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
            </svg>
        </section>
    );
}