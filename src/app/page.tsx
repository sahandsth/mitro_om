"use client";
import HeroSection from "@/components/Herosection";
import Services from "@/components/Services";
import {useEffect} from "react";
import Portfolio from "@/components/Portfolio";

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
            <section id="about" className="site-section site-section--about" />
            <section id="contacts" className="site-section site-section--contacts" />
        </main>
    );
}
