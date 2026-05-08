"use client"
import React from "react"
import Image from "next/image"
import * as Icons from "lucide-react"
import { useSettings } from "@/contexts/SettingsContext"
import { Sparkles, ArrowRight, ShieldCheck, Globe, Zap, Heart } from "lucide-react"
import { getImageUrl } from "@/lib/utils"

export default function AboutPage() {
  const { settings } = useSettings()

  const aboutSettings = settings?.about || {
    title: "Our Story",
    content: "We provide the best curated selection of products from around the world. Our platform is a gateway to excellence and modern distinction.",
    image: "/placeholder.svg",
    stats: [
      { label: "Elite Members", value: "50K+", icon: "Users" },
      { label: "Global Sanctuaries", value: "12", icon: "Globe" },
      { label: "Curated Artifacts", value: "5K+", icon: "Package" },
      { label: "Customer Approved ", value: "99%", icon: "ShieldCheck" }
    ],
    values: [
      { title: "Artisanal Integrity", description: "Every selection undergoes rigorous verification by our council of connoisseurs.", icon: "ShieldCheck" },
      { title: "Modern Distinction", description: "We define the boundary between the ordinary and the exceptional.", icon: "Sparkles" },
      { title: "Distinguished Service", description: "Our customer support team is available to assist you with every order.", icon: "Zap" },
      { title: "Global Heritage", description: "Connecting world-class craftsmanship with discerning individuals.", icon: "Globe" }
    ],
    team: [],
    milestones: [
      { year: "2020", title: "The Inception", description: "LuxeCart was founded on the principle of curated prestige." },
      { year: "2022", title: "Global Expansion", description: "Established our presence across three continents." },
      { year: "2024", title: "Modern Renaissance", description: "Reimagined the digital luxury experience for the next generation." }
    ],
    mission: {
      title: "Our Mission",
      content: [
        "LuxeCart provides a premium e-commerce experience. We are dedicated to offering high-quality products with exceptional convenience, ensuring every purchase is special.",
        "We believe that true luxury is not defined by price, but by the intentionality of creation and the resonance it finds with the individual soul."
      ],
      image: "/placeholder.svg"
    },
    sustainability: {
      title: "Sustainable Legacy",
      description: "Our commitment to excellence extends to the planet we inhabit. We implement artisanal practices that honor both craft and nature.",
      bullets: ["Circular Economy Integration", "Carbon-Neutral Logistics", "Ethical Material Sourcing", "Renewable Energy Sanctuaries"],
      image: "/placeholder.svg"
    },
    cta: {
      heading: "Become a Connoisseur of Prestige Today",
      subtitle: "Join The Inner Circle",
      primaryButtonText: "Start Shopping",
      primaryButtonLink: "/shop",
      secondaryButtonText: "Private Briefing",
      secondaryButtonLink: "/contact",
    }
  } as any

  const getIcon = (iconName: string) => {
    if (!iconName) return Icons.Star
    // Try CamelCase first
    let IconComponent = (Icons as any)[iconName]

    // If not found, try to capitalize first letter
    if (!IconComponent) {
      const capitalized = iconName.charAt(0).toUpperCase() + iconName.slice(1)
      IconComponent = (Icons as any)[capitalized]
    }

    return IconComponent || Icons.Star
  }

  const stats = aboutSettings.stats || []
  const values = aboutSettings.values || []
  const milestones = aboutSettings.milestones || []
  const team = aboutSettings.team || []
  const mission = aboutSettings.mission || { title: "Our Mission", content: [], image: "/placeholder.svg" }
  const sustainability = aboutSettings.sustainability || { title: "Committed to Sustainability", description: "", bullets: [], image: "/placeholder.svg" }
  const cta = aboutSettings.cta || {
    heading: "Become a Connoisseur of Prestige Today",
    subtitle: "Join The Inner Circle",
    primaryButtonText: "Start Shopping",
    primaryButtonLink: "/shop",
    secondaryButtonText: "Private Briefing",
    secondaryButtonLink: "/contact",
  }

  return (
    <div className="bg-[#f8f9fa] overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden bg-[#002147]">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[120%] bg-[#eb9a05] opacity-10 rotate-12 blur-3xl rounded-full"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[100%] bg-[#eb9a05] opacity-5 -rotate-12 blur-3xl rounded-full"></div>

          {/* Background Image if available */}
          {aboutSettings.image && (
            <div
              className="absolute inset-0 opacity-40 bg-cover bg-center transition-opacity duration-1000"
              style={{ backgroundImage: `url(${getImageUrl(aboutSettings.image)})` }}
            />
          )}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl animate-fade-in-up">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px w-12 bg-[#eb9a05]"></div>
              <p className="text-sm font-bold tracking-[0.3em] uppercase text-[#eb9a05]">
                The Heritage
              </p>
            </div>

            <h1 className="text-6xl md:text-8xl font-playfair font-black text-white leading-tight mb-8">
              {aboutSettings.title}
            </h1>

            <p className="text-lg md:text-xl text-white/70 mb-12 max-w-xl leading-relaxed">
              {aboutSettings.content}
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <a href="/shop" className="btn-secondary group flex items-center justify-center gap-3 py-5 px-10 text-base font-bold tracking-widest uppercase shadow-2xl">
                Explore History
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
              </a>

              <a href="/contact" className="flex items-center justify-center gap-3 py-5 px-10 text-white font-bold tracking-widest uppercase border border-white/20 rounded-xl hover:bg-white/10 transition-all hover:border-[#eb9a05]">
                Join Council
              </a>
            </div>
          </div>
        </div>

        {/* Side Decorative Text */}
        <div className="hidden lg:block absolute right-[-5rem] top-1/2 -translate-y-1/2 rotate-90 opacity-5 pointer-events-none">
          <span className="text-[12rem] font-black text-white whitespace-nowrap">LUXE HERITAGE</span>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {(stats || []).map((stat: any, index: number) => {
              const Icon = getIcon(stat.icon)
              return (
                <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-[#eb9a05]/10 transform hover:-translate-y-2 transition-all duration-500">
                    <div className="w-16 h-16 bg-[#002147]/5 rounded-2xl flex items-center justify-center text-[#eb9a05] mx-auto mb-6">
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="text-4xl font-playfair font-black text-[#002147] mb-2">{stat.value}</div>
                    <div className="text-[10px] font-black tracking-widest uppercase text-[#eb9a05]">{stat.label}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4">
          {/* Section Heading - Centered */}
          <div className="text-center mb-20">
            <h2 className="text-[10px] font-black tracking-[0.5em] uppercase text-[#eb9a05] mb-4">Our Intent</h2>
            <h3 className="text-5xl font-playfair font-black text-[#002147]">Our Mission</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative h-[400px] rounded-[4rem] overflow-hidden shadow-2xl">
              <Image src={getImageUrl(mission.image)} alt="Mission" fill className="object-cover" unoptimized />
            </div>
            <div className="animate-fade-in-up">
              <h4 className="text-3xl font-playfair font-black text-[#002147] mb-8 leading-tight">
                {mission.title}
              </h4>
              <div className="space-y-8">
                {(mission.content || []).map((p: string, i: number) => (
                  <p key={i} className="text-gray-500 text-lg italic leading-relaxed">{p}</p>
                ))}
              </div>
              <div className="mt-12">
                <a href="/shop" className="btn-primary py-5 px-12 text-sm font-black tracking-widest uppercase flex items-center gap-4 group w-fit">
                  Explore Collection <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32 bg-[#002147] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#eb9a05]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[150px]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-[10px] font-black tracking-[0.6em] uppercase text-[#eb9a05] mb-6">Foundational Pillars</h2>
            <h3 className="text-5xl font-playfair font-black text-white">Our Core Ethos</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {(values || []).map((value: any, index: number) => {
              const Icon = getIcon(value.icon)
              return (
                <div key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[3rem] group hover:bg-[#eb9a05] transition-all duration-700">
                  <div className="w-16 h-16 bg-[#eb9a05]/10 rounded-2xl flex items-center justify-center text-[#eb9a05] mb-8 group-hover:bg-[#002147] group-hover:text-white transition-all">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-playfair font-black text-white mb-4 group-hover:text-[#002147] transition-all">{value.title}</h4>
                  <p className="text-white/40 text-sm italic leading-relaxed group-hover:text-[#002147]/60 transition-all">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-[10px] font-black tracking-[0.5em] uppercase text-[#eb9a05] mb-6">The Chronicle</h2>
            <h3 className="text-5xl font-playfair font-black text-[#002147]">A Legacy in Motion</h3>
          </div>
          <div className="max-w-5xl mx-auto relative">
            {/* Vertical Line - only visible on desktop */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-[#eb9a05]/20 hidden md:block"></div>

            <div className="space-y-24">
              {(milestones || []).map((m: any, i: number) => (
                <div key={i} className="relative">
                  {/* Timeline Dot - only visible on desktop */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#eb9a05] rounded-full border-4 border-white shadow-xl z-10 hidden md:block"></div>

                  <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-12`}>
                    {/* Left Column (Desktop) */}
                    <div className={`w-full md:w-1/2 ${i % 2 === 0 ? 'order-1' : 'order-2 md:order-1'}`}>
                      {i % 2 === 0 ? (
                        <div className="bg-white p-10 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-gray-50 text-center md:text-right transform hover:-translate-y-2 transition-all duration-500">
                          <span className="text-3xl md:text-4xl font-playfair font-black text-[#eb9a05] mb-4 block">{m.year}</span>
                          <h4 className="text-xl md:text-2xl font-playfair font-black text-[#002147] mb-4">{m.title}</h4>
                          <p className="text-gray-400 italic text-sm leading-relaxed">{m.description}</p>
                        </div>
                      ) : (
                        <div className="hidden md:block" />
                      )}
                    </div>

                    {/* Right Column (Desktop) */}
                    <div className={`w-full md:w-1/2 ${i % 2 === 0 ? 'order-2' : 'order-1 md:order-2'}`}>
                      {i % 2 !== 0 ? (
                        <div className="bg-white p-10 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-gray-50 text-center md:text-left transform hover:-translate-y-2 transition-all duration-500">
                          <span className="text-3xl md:text-4xl font-playfair font-black text-[#eb9a05] mb-4 block">{m.year}</span>
                          <h4 className="text-xl md:text-2xl font-playfair font-black text-[#002147] mb-4">{m.title}</h4>
                          <p className="text-gray-400 italic text-sm leading-relaxed">{m.description}</p>
                        </div>
                      ) : (
                        <div className="hidden md:block" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      {team && team.length > 0 && (
        <section className="py-32 bg-[#f8f9fa]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-[10px] font-black tracking-[0.6em] uppercase text-[#eb9a05] mb-4">The Curators</h2>
              <h3 className="text-5xl font-playfair font-black text-[#002147]">Our Expert Council</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {team.map((member: any, index: number) => (
                <div key={index} className="group bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 animate-fade-in-up transition-all duration-500 hover:-translate-y-4" style={{ animationDelay: `${index * 100}ms` }}>
                  {/* Image container with taller height and zoom effect */}
                  <div className="relative h-[450px] overflow-hidden">
                    <Image
                      src={getImageUrl(member.image)}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      unoptimized
                    />
                    {/* Premium Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#002147] via-[#002147]/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>

                    {/* Name and Role on Image for premium feel */}
                    <div className="absolute bottom-8 left-8 right-8 transform transition-transform duration-500 group-hover:-translate-y-2">
                      <p className="text-[#eb9a05] text-[10px] font-black tracking-widest uppercase mb-2">{member.role}</p>
                      <h4 className="text-3xl font-playfair font-black text-white">{member.name}</h4>
                    </div>
                  </div>

                  {/* Bio with elegant slide-up effect */}
                  <div className="p-10 bg-white">
                    {member.bio && (
                      <p className="text-gray-500 italic text-sm leading-relaxed border-l-2 border-[#eb9a05]/30 pl-6">
                        "{member.bio}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sustainability Section */}
      <section className="py-32 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Centered heading above the card */}
          <div className="text-center mb-16">
            <h2 className="text-[10px] font-black tracking-[0.5em] uppercase text-[#eb9a05] mb-4">Earthly Harmony</h2>
            <h3 className="text-5xl font-playfair font-black text-[#002147]">
              {sustainability.title || "Committed to Sustainability"}
            </h3>
          </div>
          <div className="bg-[#002147] rounded-[4rem] overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative h-[500px] lg:h-auto min-h-[500px] lg:min-h-[650px]">
                <Image src={getImageUrl(sustainability.image)} alt="Sustainability" fill className="object-cover object-center" unoptimized />
              </div>
              <div className="p-16 md:p-24 flex flex-col justify-center">
                <h4 className="text-sm font-black tracking-[0.3em] uppercase text-[#eb9a05] mb-6">Committed to Sustainability</h4>
                <p className="text-white/60 text-lg italic leading-relaxed mb-10">{sustainability.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                  {(sustainability.bullets || []).map((b: string, i: number) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-[#eb9a05]"></div>
                      <span className="text-xs font-black tracking-widest uppercase text-white/80">{b}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative text-center overflow-hidden bg-[#002147]">
        <div className="absolute inset-0 bg-[#eb9a05]/10 -z-10"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#eb9a05]/20 blur-[120px] rounded-full"></div>

        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-sm font-black tracking-[0.3em] uppercase text-[#eb9a05] mb-10 block max-w-3xl mx-auto leading-relaxed">
            {cta.subtitle}
          </h2>
          <h3 className="text-5xl md:text-7xl font-playfair font-black text-white mb-16 leading-tight max-w-4xl mx-auto">
            {cta.heading.split('<br />').map((text: string, i: number) => (
              <React.Fragment key={i}>
                {text}
                {i < cta.heading.split('<br />').length - 1 && <br />}
              </React.Fragment>
            ))}
          </h3>
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            {cta.primaryButtonText && (
              <a href={cta.primaryButtonLink} className="btn-secondary py-6 px-16 text-sm font-black tracking-widest uppercase shadow-2xl inline-block hover:scale-105 transition-transform">
                {cta.primaryButtonText}
              </a>
            )}
            {cta.secondaryButtonText && (
              <a href={cta.secondaryButtonLink} className="px-16 py-6 rounded-2xl border-2 border-white/20 text-white font-black text-xs tracking-widest uppercase hover:bg-white hover:text-[#002147] transition-all inline-block">
                {cta.secondaryButtonText}
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
