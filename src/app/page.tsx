"use client";
import HeroSection from "@/components/Herosection";
import Services from "@/components/Services";
import {useEffect} from "react";
import Portfolio from "@/components/Portfolio";
import About from "@/components/About";

export default function Home() {

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.history.scrollRestoration = "manual";
        }
    }, []);

    return (
        <main>
            <HeroSection/>
            <Services/>
            <Portfolio/>
            <About/>
        </main>
    );
}
