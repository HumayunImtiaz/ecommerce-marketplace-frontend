"use client"
import Link from "next/link"
import Image from "next/image"
import { useSettings } from "@/contexts/SettingsContext"
import { getImageUrl } from "@/lib/utils"

export default function HeroSection() {
  const { settings } = useSettings()

  const hero = settings?.hero || {
    title: "Discover Amazing Products",
    subtitle: "Shop the latest trends and get up to 50% off.",
    image: "/placeholder.svg?height=500&width=600",
    buttonText: "Shop Now",
    buttonLink: "/products",
  }

  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white min-h-[500px] flex items-center">
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              {hero.title}
            </h1>
            <p className="text-xl mb-8 text-blue-100 max-w-lg">
              {hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={hero.buttonLink}
                className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-center shadow-lg"
              >
                {hero.buttonText}
              </Link>
              <Link
                href="/categories"
                className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors text-center"
              >
                Browse Categories
              </Link>
            </div>
          </div>
          <div className="relative h-[400px] lg:h-[500px]">
            <Image
              src={getImageUrl(hero.image)}
              alt="Hero Image"
              fill
              className="rounded-xl shadow-2xl object-cover"
            />
            {!settings?.hero?.image && (
               <div className="absolute -top-4 -right-4 bg-yellow-400 text-black px-4 py-2 rounded-full font-bold shadow-lg">
                50% OFF
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
