"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function VelocityText() {
    const text = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        let proxy = { skew: 0 };

        const clamp = gsap.utils.clamp(-20, 20);

        ScrollTrigger.create({
            onUpdate: (self) => {
                const skew = clamp(self.getVelocity() / -300);

                gsap.to(proxy, {
                    skew: skew,
                    duration: 0.6,
                    ease: "power3.out",
                    overwrite: true,
                    onUpdate: () => {
                        gsap.set(text.current, {
                            skewX: proxy.skew,
                        });
                    },
                });
            },
        });
    }, []);

    return (
        <section className="min-h-screen bg-white flex items-center justify-center overflow-hidden px-10">
            <h1
                ref={text}
                className="
        text-[10vw]
        uppercase
        font-black
        text-black
        leading-none
        tracking-[-0.06em]
        "
            >
                Velocity
            </h1>
        </section>
    );
}