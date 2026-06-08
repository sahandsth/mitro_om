"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CharReveal() {
    const text = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        if (!text.current) return;

        const chars =
            text.current.querySelectorAll("span");

        gsap.set(chars, {
            opacity: 0,
            y: 120,
            rotateX: -90,
            transformOrigin: "top center",
        });

        gsap.to(chars, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            stagger: 0.04,
            duration: 1.2,
            ease: "power4.out",
            scrollTrigger: {
                trigger: text.current,
                start: "top 80%",
            },
        });
    }, []);

    const title = "Future Vision";

    return (
        <section
            className="
      min-h-screen
      bg-black
      flex
      items-center
      justify-center
      overflow-hidden
      px-10
      "
            style={{
                perspective: "1000px",
            }}
        >
            <h1
                ref={text}
                className="
        text-white
        text-[10vw]
        uppercase
        font-black
        tracking-[-0.06em]
        flex
        flex-wrap
        "
            >
                {title.split("").map((char, index) => (
                    <span
                        key={index}
                        className="inline-block"
                    >
            {char === " "
                ? "\u00A0"
                : char}
          </span>
                ))}
            </h1>
        </section>
    );
}