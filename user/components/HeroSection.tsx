"use client"

import { useSettings } from "@/contexts/SettingsContext"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getImageUrl } from "@/lib/utils"

export default function HeroSection() {
  const { settings } = useSettings()

  const hero = settings?.hero || {
    title: "Define Your Signature Style",
    subtitle: "Discover a world of refined elegance. Our latest collection blends timeless sophistication with modern luxury.",
    image: "",
    buttonText: "Shop Collection",
    buttonLink: "/products"
  }

  return (
    <section className="relative h-[85vh] flex items-center overflow-hidden bg-[#002147]">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[120%] bg-[#eb9a05] opacity-10 rotate-12 blur-3xl rounded-full"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[100%] bg-[#eb9a05] opacity-5 -rotate-12 blur-3xl rounded-full"></div>

        {/* Background Image if available */}
        {hero.image && (
          <div
            className="absolute inset-0 opacity-40 bg-cover bg-center transition-opacity duration-1000"
            style={{ backgroundImage: `url(${getImageUrl(hero.image)})` }}
          />
        )}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl animate-fade-in-up">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-12 bg-[#eb9a05]"></div>
            <p className="text-sm font-bold tracking-[0.3em] uppercase text-[#eb9a05]">
              Exclusive Collection 2026
            </p>
          </div>

          <h1 className="text-6xl md:text-7xl font-playfair font-black text-white leading-tight mb-8">
            {hero.title.includes("<br />") ? (
              <span dangerouslySetInnerHTML={{ __html: hero.title }} />
            ) : (
              hero.title
            )}
          </h1>

          <p className="text-lg md:text-xl text-white/70 mb-12 max-w-xl leading-relaxed">
            {hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-6">
            <Link
              href={hero.buttonLink || "/products"}
              className="btn-secondary group flex items-center justify-center gap-3 py-5 px-10 text-base font-bold tracking-widest uppercase shadow-2xl"
            >
              {hero.buttonText || "Shop Collection"}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
            </Link>

            <Link
              href="/about"
              className="flex items-center justify-center gap-3 py-5 px-10 text-white font-bold tracking-widest uppercase border border-white/20 rounded-xl hover:bg-white/10 transition-all hover:border-[#eb9a05]"
            >
              Our Story
            </Link>
          </div>
        </div>
      </div>

      {/* Side Decorative Text */}
      <div className="hidden lg:block absolute right-[-5rem] top-1/2 -translate-y-1/2 rotate-90 opacity-5 pointer-events-none">
        <span className="text-[12rem] font-black text-white whitespace-nowrap">MODERN PRESTIGE</span>
      </div>
    </section>
  )
}
