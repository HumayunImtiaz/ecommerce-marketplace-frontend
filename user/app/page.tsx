import HeroSection from "@/components/HeroSection"
import FeaturedProducts from "@/components/FeaturedProducts"
import CategoryGrid from "@/components/CategoryGrid"
import TrendingProducts from "@/components/TrendingProducts"
import NewsletterSignup from "@/components/NewsletterSignup"

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <FeaturedProducts />
      <CategoryGrid />
      <TrendingProducts />
      <NewsletterSignup />
    </div>
  )
}
