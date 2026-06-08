"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ImageSequence() {
    const canvas = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const frameCount = 48;

        const currentFrame = (index: number) =>
            `/sequence/ezgif-frame-${String(index + 1).padStart(3, "0")}.jpg`;

        const images: HTMLImageElement[] = [];

        const imageSeq = {
            frame: 0,
        };

        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            images.push(img);
        }

        const context =
            canvas.current?.getContext("2d");

        canvas.current!.width = window.innerWidth;
        canvas.current!.height = window.innerHeight;

        const render = () => {
            context?.clearRect(
                0,
                0,
                canvas.current!.width,
                canvas.current!.height
            );

            context?.drawImage(
                images[imageSeq.frame],
                0,
                0,
                canvas.current!.width,
                canvas.current!.height
            );
        };

        images[0].onload = render;

        gsap.to(imageSeq, {
            frame: frameCount - 1,
            snap: "frame",
            ease: "none",
            scrollTrigger: {
                scrub: true,
                pin: true,
                trigger: canvas.current,
                start: "top top",
                end: "+=3000",
            },
            onUpdate: render,
        });
    }, []);

    return (
        <section className="bg-black">
            <canvas
                ref={canvas}
                className="w-full h-screen"
            />
        </section>
    );
}