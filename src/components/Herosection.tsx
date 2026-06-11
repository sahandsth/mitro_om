"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroContent, { HeroFonts } from "@/components/HeroContent";
import { FRAME_COUNT, framePath, SEQUENCE_SOURCE } from "@/lib/sequenceConfig";
import {
    getPhoneScreenRect,
    isViewportFullscreenScreen,
    phoneRectToViewport,
} from "@/lib/phoneScreenKeyframes";

gsap.registerPlugin(ScrollTrigger);

const SCROLL_WORDS = [
    "Creativity",
    "Innovation",
    "Vision",
    "Passion",
    "Brilliance",
    "Artistry",
    "Mastery",
    "Excellence",
    "Elegance",
    "Imagination",
    "Ambition",
    "Precision",
    "Craftsmanship",
    "Strategy",
    "Ingenuity",
    "Originality",
    "Boldness",
    "Purpose",
];

const TOTAL_WORDS = SCROLL_WORDS.length;
const SCROLL_PER_WORD_VH = 0.08;
const SEQUENCE_SCROLL_VH = 3.2;
const DESKTOP_MIN_WIDTH = 1024;

const WORDS_SCROLL_VH = TOTAL_WORDS * SCROLL_PER_WORD_VH + 1;

/**
 * ابعاد واقعی محدوده‌ی چیدمان (بدون scrollbar).
 * window.innerWidth شامل پهنای scrollbar است ولی stage/hero-layer نیستند،
 * پس باید از clientWidth استفاده کنیم تا hole و canvas و محتوا هم‌تراز بمانند.
 */
function getViewport() {
    const doc = document.documentElement;
    return {
        vw: doc.clientWidth || window.innerWidth,
        vh: doc.clientHeight || window.innerHeight,
    };
}

/** کادر مشکی گوشی (bezel) دور سوراخ صفحه — برای حس «گوشی» وقتی کوچک است */
function drawPhoneBezel(
    ctx: CanvasRenderingContext2D,
    screen: { x: number; y: number; w: number; h: number; r: number },
    bezel: number
) {
    if (bezel <= 0.5) return;

    const x = screen.x - bezel;
    const y = screen.y - bezel;
    const w = screen.w + bezel * 2;
    const h = screen.h + bezel * 2;
    const r = screen.r + bezel;

    ctx.save();
    ctx.fillStyle = "#0b0b0d";
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
        ctx.roundRect(x, y, w, h, r);
    } else {
        ctx.rect(x, y, w, h);
    }
    ctx.fill();
    ctx.restore();
}

function drawCover(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    width: number,
    height: number
) {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    if (!iw || !ih) return;

    const scale = Math.max(width / iw, height / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (width - dw) / 2;
    const dy = (height - dh) / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, dx, dy, dw, dh);
}

function punchScreenHole(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "#000";

    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
        ctx.roundRect(x, y, w, h, r);
    } else {
        ctx.rect(x, y, w, h);
    }
    ctx.fill();
    ctx.restore();
}

function applyHeroScreenTransform(
    heroEl: HTMLElement,
    clipEl: HTMLElement | null,
    screen: { x: number; y: number; w: number; h: number; r: number },
    vw: number,
    vh: number
) {
    const scale = Math.max(screen.w / vw, screen.h / vh);
    const x = screen.x + screen.w / 2 - vw / 2;
    const y = screen.y + screen.h / 2 - vh / 2;

    gsap.set(heroEl, {
        x,
        y,
        scale,
        transformOrigin: "center center",
        force3D: true,
    });

    // محتوا را دقیقاً به ناحیه‌ی صفحه گوشی (hole) ببُر تا بیرون نزند.
    // (هنگام cover-fit در viewportهای پهن‌تر از 16:10 لایه بزرگ‌تر از hole می‌شود.)
    if (clipEl) {
        const top = Math.max(0, screen.y);
        const left = Math.max(0, screen.x);
        const right = Math.max(0, vw - (screen.x + screen.w));
        const bottom = Math.max(0, vh - (screen.y + screen.h));
        gsap.set(clipEl, {
            clipPath: `inset(${top}px ${right}px ${bottom}px ${left}px round ${Math.max(0, screen.r)}px)`,
        });
    }
}

/** برداشتن clip — وقتی صفحه تمام‌صفحه است */
function clearHeroClip(clipEl: HTMLElement | null) {
    if (clipEl) gsap.set(clipEl, { clipPath: "inset(0px)" });
}

export default function HeroSection() {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const heroClipRef = useRef<HTMLDivElement>(null);
    const heroLayerRef = useRef<HTMLDivElement>(null);
    const hintRef = useRef<HTMLDivElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);

    const [wordIndex, setWordIndex] = useState(0);
    const [done, setDone] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [sequenceReady, setSequenceReady] = useState(false);

    const totalVh = isDesktop
        ? SEQUENCE_SCROLL_VH + WORDS_SCROLL_VH
        : WORDS_SCROLL_VH;

    useLayoutEffect(() => {
        const mq = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`);
        const sync = () => setIsDesktop(mq.matches);
        sync();
        setMounted(true);
        mq.addEventListener("change", sync);
        return () => mq.removeEventListener("change", sync);
    }, []);

    useLayoutEffect(() => {
        if (!mounted || !isDesktop) return;

        const heroLayer = heroLayerRef.current;
        if (!heroLayer) return;

        const applyInitial = () => {
            const { vw, vh } = getViewport();
            const screen = phoneRectToViewport(
                getPhoneScreenRect(0, vw, vh),
                SEQUENCE_SOURCE.width,
                SEQUENCE_SOURCE.height,
                vw,
                vh
            );
            applyHeroScreenTransform(heroLayer, heroClipRef.current, screen, vw, vh);
        };

        applyInitial();
        window.addEventListener("resize", applyInitial);
        return () => window.removeEventListener("resize", applyInitial);
    }, [mounted, isDesktop]);

    useEffect(() => {
        if (!mounted || !isDesktop) return;

        const images: HTMLImageElement[] = [];
        let loaded = 0;

        const markLoaded = () => {
            loaded += 1;
            if (loaded >= FRAME_COUNT) setSequenceReady(true);
        };

        for (let i = 1; i <= FRAME_COUNT; i++) {
            const img = new Image();
            img.decoding = "async";
            img.src = framePath(i);
            img.onload = markLoaded;
            img.onerror = markLoaded;
            images.push(img);
        }

        imagesRef.current = images;
    }, [mounted, isDesktop]);

    useEffect(() => {
        if (!mounted || isDesktop) return;

        const handleScroll = () => {
            const wrapper = wrapperRef.current;
            if (!wrapper) return;

            const wrapperTop = wrapper.getBoundingClientRect().top;
            const scrolledIntoWrapper = -wrapperTop;
            const totalScrollDistance = wrapper.offsetHeight - window.innerHeight;

            if (scrolledIntoWrapper < 0) {
                setWordIndex(0);
                setDone(false);
                return;
            }

            if (scrolledIntoWrapper >= totalScrollDistance) {
                setWordIndex(TOTAL_WORDS - 1);
                setDone(true);
                return;
            }

            setDone(false);
            const progress = scrolledIntoWrapper / totalScrollDistance;
            const idx = Math.min(
                Math.floor(progress * TOTAL_WORDS),
                TOTAL_WORDS - 1
            );
            setWordIndex((prev) => (prev !== idx ? idx : prev));
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, [mounted, isDesktop]);

    useEffect(() => {
        if (!mounted || !isDesktop || !sequenceReady) return;

        const wrapper = wrapperRef.current;
        const stage = stageRef.current;
        const canvas = canvasRef.current;
        const heroLayer = heroLayerRef.current;
        const hint = hintRef.current;

        if (!wrapper || !stage || !canvas || !heroLayer) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let introRatio =
            SEQUENCE_SCROLL_VH / (SEQUENCE_SCROLL_VH + WORDS_SCROLL_VH);

        const resizeCanvas = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const { vw: w, vh: h } = getViewport();
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const drawSequenceFrame = (frameIdx: number) => {
            const images = imagesRef.current;
            if (!images.length) return;

            const img = images[frameIdx];
            if (!img?.complete || !img.naturalWidth) return;

            const { vw, vh } = getViewport();

            drawCover(ctx, img, vw, vh);

            const phoneRect = getPhoneScreenRect(frameIdx, vw, vh);
            const screen = phoneRectToViewport(
                phoneRect,
                img.naturalWidth,
                img.naturalHeight,
                vw,
                vh
            );

            const coverScale = Math.max(screen.w / vw, screen.h / vh);

            // کادر مشکی گوشی: وقتی کوچک است پررنگ، با بزرگ شدن صفحه محو می‌شود
            const bezel =
                Math.min(screen.h * 0.12, 48) * Math.max(0, 1 - coverScale);
            drawPhoneBezel(ctx, screen, bezel);

            punchScreenHole(ctx, screen.x, screen.y, screen.w, screen.h, screen.r);

            if (isViewportFullscreenScreen(screen, vw, vh) || coverScale >= 0.96) {
                gsap.set(heroLayer, {
                    x: 0,
                    y: 0,
                    scale: 1,
                    transformOrigin: "center center",
                    force3D: true,
                });
                clearHeroClip(heroClipRef.current);
            } else {
                applyHeroScreenTransform(
                    heroLayer,
                    heroClipRef.current,
                    screen,
                    vw,
                    vh
                );
            }
        };

        const applyFrame = (progress: number) => {
            if (progress <= introRatio) {
                const seqT = progress / introRatio;
                const frameIdx = Math.min(
                    FRAME_COUNT - 1,
                    Math.floor(seqT * (FRAME_COUNT - 1))
                );

                drawSequenceFrame(frameIdx);

                const fullscreen = frameIdx >= FRAME_COUNT - 1;
                // کانواس اسکچ (سفید) باید قبل از چند فریم آخر کامل محو شود،
                // تا زوم نهایی روی پس‌زمینه‌ی تیره stage انجام شود نه روی سفیدی اسکچ.
                const canvasFadeStart = 0.74;
                const canvasFadeEnd = 0.9;
                const canvasOpacity =
                    fullscreen || seqT >= canvasFadeEnd
                        ? 0
                        : seqT > canvasFadeStart
                          ? 1 -
                            (seqT - canvasFadeStart) /
                                (canvasFadeEnd - canvasFadeStart)
                          : 1;

                gsap.set(canvas, { opacity: canvasOpacity });
                gsap.set(heroLayer, { opacity: 1 });
                gsap.set(hint, {
                    opacity: seqT < 0.08 ? 1 : Math.max(0, 1 - seqT * 4),
                });

                setWordIndex(0);
                setDone(!fullscreen && seqT < 0.995);
                return;
            }

            gsap.set(canvas, { opacity: 0 });
            gsap.set(heroLayer, {
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
            });
            clearHeroClip(heroClipRef.current);
            gsap.set(hint, { opacity: 0 });

            const wordProgress = (progress - introRatio) / (1 - introRatio);
            const idx = Math.min(
                Math.floor(wordProgress * TOTAL_WORDS),
                TOTAL_WORDS - 1
            );
            setWordIndex((prev) => (prev !== idx ? idx : prev));
            setDone(wordProgress >= 0.995);
        };

        resizeCanvas();
        drawSequenceFrame(0);
        applyFrame(0);

        const ctx_gsap = gsap.context(() => {
            ScrollTrigger.create({
                trigger: wrapper,
                start: "top top",
                end: () =>
                    `+=${(SEQUENCE_SCROLL_VH + WORDS_SCROLL_VH) * window.innerHeight}`,
                pin: stage,
                pinSpacing: true,
                scrub: 2,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => applyFrame(self.progress),
            });
        }, wrapper);

        const handleResize = () => {
            introRatio =
                SEQUENCE_SCROLL_VH / (SEQUENCE_SCROLL_VH + WORDS_SCROLL_VH);
            resizeCanvas();
            ScrollTrigger.refresh();
            const st = ScrollTrigger.getAll().find((t) => t.trigger === wrapper);
            if (st) applyFrame(st.progress);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            ctx_gsap.revert();
        };
    }, [mounted, isDesktop, sequenceReady]);

    return (
        <>
            <HeroFonts />

            <div
                id="home"
                ref={wrapperRef}
                className="hero-wrapper"
                style={{ height: `${totalVh * 100}vh` }}
            >
                {isDesktop ? (
                    <div ref={stageRef} className="hero-stage">
                        <div ref={heroClipRef} className="hero-clip">
                            <div ref={heroLayerRef} className="hero-layer">
                                <HeroContent
                                    scrollWord={SCROLL_WORDS[wordIndex]}
                                    showScrollHint
                                    hintHidden={done}
                                />
                            </div>
                        </div>

                        <canvas
                            ref={canvasRef}
                            className="sequence-canvas"
                            aria-hidden
                        />

                        <div ref={hintRef} className="sequence-scroll-hint">
                            <span>Scroll to enter</span>
                            <i />
                        </div>
                    </div>
                ) : (
                    <div className="hero-sticky-wrapper">
                        <HeroContent
                            scrollWord={SCROLL_WORDS[wordIndex]}
                            showScrollHint
                            hintHidden={done}
                        />
                    </div>
                )}
            </div>

            <style jsx>{`
                .hero-wrapper {
                    position: relative;
                }

                .hero-stage {
                    position: relative;
                    width: 100%;
                    height: 100vh;
                    overflow: hidden;
                    background: #141414;
                }

                .hero-clip {
                    position: absolute;
                    inset: 0;
                    z-index: 1;
                    will-change: clip-path;
                }

                .hero-layer {
                    position: absolute;
                    inset: 0;
                    will-change: transform;
                }

                .sequence-canvas {
                    position: absolute;
                    inset: 0;
                    z-index: 2;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                }

                .sequence-scroll-hint {
                    position: absolute;
                    bottom: 36px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 3;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    color: rgba(255, 255, 255, 0.75);
                    font-family: var(--font-geist-sans), sans-serif;
                    font-size: 12px;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    pointer-events: none;
                    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.6);
                }

                .sequence-scroll-hint i {
                    display: block;
                    width: 16px;
                    height: 16px;
                    border-right: 1.5px solid rgba(255, 255, 255, 0.65);
                    border-bottom: 1.5px solid rgba(255, 255, 255, 0.65);
                    transform: rotate(45deg);
                    animation: seq-bounce 1.6s ease-in-out infinite;
                }

                @keyframes seq-bounce {
                    0%,
                    100% {
                        transform: rotate(45deg) translateY(0);
                    }
                    50% {
                        transform: rotate(45deg) translateY(5px);
                    }
                }

                .hero-sticky-wrapper {
                    position: sticky;
                    top: 0;
                    width: 100%;
                    height: 100vh;
                    overflow: hidden;
                }
            `}</style>
        </>
    );
}
