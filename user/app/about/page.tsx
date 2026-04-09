"use client"
import Image from "next/image"
import * as Icons from "lucide-react"
import { useSettings } from "@/contexts/SettingsContext"

export default function AboutPage() {
  const { settings } = useSettings()

  const aboutSettings = settings?.about || {
    title: "About LuxeCart",
    content: "We're more than just an e-commerce platform. We're your trusted partner in discovering amazing products that enhance your lifestyle and bring joy to your everyday moments.",
    image: "/placeholder.svg?height=500&width=600",
    stats: [],
    values: [],
    team: [],
    milestones: [],
    mission: {
      title: "Our Mission",
      content: [
        "At LuxeCart, our mission is to democratize access to quality products by creating an inclusive, user-friendly platform that connects customers with the items they love. We believe everyone deserves access to products that improve their lives, regardless of their location or budget.",
        "We're committed to building lasting relationships with our customers through exceptional service, competitive pricing, and a carefully curated selection of products that meet the highest standards of quality and value."
      ],
      image: "/placeholder.svg?height=400&width=500"
    },
    sustainability: { title: "", description: "", image: "", bullets: [] }
  } as any

  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName]
    return IconComponent || Icons.Star
  }

  const stats = aboutSettings.stats || []
  const values = aboutSettings.values || []
  const team = aboutSettings.team || []
  const milestones = aboutSettings.milestones || []
  const sustainability = aboutSettings.sustainability || {
    title: "Committed to Sustainability",
    description: "We believe in doing business responsibly. That's why we've implemented comprehensive sustainability initiatives across our operations.",
    image: "/placeholder.svg?height=400&width=500",
    bullets: [
      "100% recyclable packaging materials",
      "Carbon-neutral shipping options",
      "Partnership with eco-conscious brands",
      "Renewable energy in our facilities",
    ],
  }
  const mission = aboutSettings.mission || {
    title: "Our Mission",
    content: [
      "At LuxeCart, our mission is to democratize access to quality products by creating an inclusive, user-friendly platform that connects customers with the items they love. We believe everyone deserves access to products that improve their lives, regardless of their location or budget.",
      "We're committed to building lasting relationships with our customers through exceptional service, competitive pricing, and a carefully curated selection of products that meet the highest standards of quality and value."
    ],
    image: "/placeholder.svg?height=400&width=500"
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">{aboutSettings.title}</h1>
              <div className="text-xl mb-8 text-blue-100 whitespace-pre-wrap leading-relaxed">
                {aboutSettings.content}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                  Our Story
                </button>
                <button className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                  Join Our Team
                </button>
              </div>
            </div>
            <div className="relative h-[400px] lg:h-[500px]">
              <Image
                src={aboutSettings.image}
                alt="About Us"
                fill
                className="rounded-xl shadow-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat: any, index: number) => {
              const Icon = getIcon(stat.icon)
              return (
                <div key={index} className="text-center">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <Icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">{mission.title}</h2>
              {(mission.content || []).map((paragraph: string, index: number) => (
                <p key={index} className="text-gray-700 mb-6 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="relative">
              <Image
                src={mission.image || "/placeholder.svg?height=400&width=500"}
                alt={mission.title}
                width={500}
                height={400}
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do and shape the way we serve our customers and community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value: any, index: number) => {
              const Icon = getIcon(value.icon)
              return (
                <div key={index} className="bg-white rounded-xl shadow-md p-6 text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From a small startup to a global e-commerce platform, here are the key milestones in our journey.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200"></div>

            <div className="space-y-12">
              {milestones.map((milestone: any, index: number) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}>
                    <div className="bg-white rounded-xl shadow-md p-6">
                      <div className="text-blue-600 font-bold text-lg mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold mb-3">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-md"></div>
                  </div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Behind LuxeCart is a passionate team of individuals dedicated to creating the best shopping experience
              for our customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member: any, index: number) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="relative h-64">
                  <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <Image
                src={sustainability.image || "/placeholder.svg?height=400&width=500"}
                alt="Sustainability"
                width={500}
                height={400}
                className="rounded-xl shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">{sustainability.title}</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {sustainability.description}
              </p>
              <ul className="space-y-3 mb-6">
                {(sustainability.bullets || []).map((bullet: string, i: number) => (
                  <li key={i} className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">{bullet}</span>
                  </li>
                ))}
              </ul>
              <button className="btn-primary">Learn More About Our Initiatives</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join Our Community?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Discover amazing products, enjoy exceptional service, and become part of the LuxeCart family today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              Start Shopping
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Subscribe to Newsletter
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
