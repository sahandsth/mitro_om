"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function StickyGallery() {
    const section = useRef<HTMLElement>(null);

    const image1 = useRef<HTMLImageElement>(null);
    const image2 = useRef<HTMLImageElement>(null);
    const image3 = useRef<HTMLImageElement>(null);

    useEffect(() => {
        gsap.set(image2.current, {
            opacity: 0,
        });

        gsap.set(image3.current, {
            opacity: 0,
        });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section.current,
                start: "top top",
                end: "+=3000",
                scrub: true,
                pin: true,
            },
        });

        tl.to(image1.current, {
            opacity: 0,
            duration: 1,
        });

        tl.to(
            image2.current,
            {
                opacity: 1,
                duration: 1,
            },
            0
        );

        tl.to(image2.current, {
            opacity: 0,
            duration: 1,
        });

        tl.to(
            image3.current,
            {
                opacity: 1,
                duration: 1,
            },
            1
        );
    }, []);

    return (
        <section
            ref={section}
            className="h-screen bg-black overflow-hidden relative"
        >
            <div className="absolute inset-0 flex items-center justify-center">

                <img
                    ref={image1}
                    src="/images/1.jpg"
                    className="absolute w-[50vw] h-[90vh] object-cover rounded-3xl"
                    alt="" 
                />

                <img
                    ref={image2}
                    src="/images/2.jpg"
                    className="absolute w-[50vw] h-[90vh] object-cover rounded-3xl"
                    alt=""
                />

                <img
                    ref={image3}
                    src="/images/3.jpg"
                    className="absolute w-[50vw] h-[90vh] object-cover rounded-3xl"
                    alt=""
                />

            </div>
        </section>
    );
}