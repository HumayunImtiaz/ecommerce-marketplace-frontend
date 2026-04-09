"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Search, MessageCircle, Phone, Mail } from "lucide-react"

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const categories = [
    { id: "all", name: "All Questions" },
    { id: "orders", name: "Orders & Shipping" },
    { id: "returns", name: "Returns & Refunds" },
    { id: "account", name: "Account & Profile" },
    { id: "payment", name: "Payment & Billing" },
    { id: "products", name: "Products & Inventory" },
    { id: "technical", name: "Technical Support" },
  ]

  const faqs = [
    {
      id: "1",
      category: "orders",
      question: "How long does shipping take?",
      answer:
        "Standard shipping typically takes 3-7 business days. Express shipping takes 1-3 business days. Free shipping is available on orders over $50 and takes 5-7 business days.",
    },
    {
      id: "2",
      category: "orders",
      question: "Can I track my order?",
      answer:
        "Yes! Once your order ships, you'll receive a tracking number via email. You can also track your order by logging into your account and visiting the 'My Orders' section.",
    },
    {
      id: "3",
      category: "orders",
      question: "Can I change or cancel my order?",
      answer:
        "You can modify or cancel your order within 1 hour of placing it. After that, if the order hasn't shipped yet, please contact our customer service team for assistance.",
    },
    {
      id: "4",
      category: "returns",
      question: "What is your return policy?",
      answer:
        "We offer a 30-day return policy for most items. Items must be in original condition with tags attached. Some restrictions apply to certain product categories like electronics and personal care items.",
    },
    {
      id: "5",
      category: "returns",
      question: "How do I return an item?",
      answer:
        "To return an item, log into your account, go to 'My Orders', find the order, and click 'Return Item'. Follow the instructions to print a return label and drop off the package at any authorized location.",
    },
    {
      id: "6",
      category: "returns",
      question: "When will I receive my refund?",
      answer:
        "Refunds are processed within 3-5 business days after we receive your returned item. The refund will be credited to your original payment method.",
    },
    {
      id: "7",
      category: "account",
      question: "How do I create an account?",
      answer:
        "Click 'Sign Up' in the top right corner of our website. Fill in your details including name, email, and password. You'll receive a confirmation email to verify your account.",
    },
    {
      id: "8",
      category: "account",
      question: "I forgot my password. How do I reset it?",
      answer:
        "Click 'Forgot Password' on the login page. Enter your email address and we'll send you a password reset link. Follow the instructions in the email to create a new password.",
    },
    {
      id: "9",
      category: "account",
      question: "How do I update my profile information?",
      answer:
        "Log into your account and go to 'My Account' > 'Profile'. Here you can update your personal information, shipping addresses, and communication preferences.",
    },
    {
      id: "10",
      category: "payment",
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, and Google Pay. All payments are processed securely using industry-standard encryption.",
    },
    {
      id: "11",
      category: "payment",
      question: "Is my payment information secure?",
      answer:
        "Yes, absolutely. We use SSL encryption and comply with PCI DSS standards to protect your payment information. We never store your full credit card details on our servers.",
    },
    {
      id: "12",
      category: "payment",
      question: "Can I use multiple payment methods for one order?",
      answer:
        "Currently, we only support one payment method per order. However, you can use gift cards in combination with other payment methods.",
    },
    {
      id: "13",
      category: "products",
      question: "How do I know if an item is in stock?",
      answer:
        "Stock availability is shown on each product page. If an item is out of stock, you can sign up for restock notifications to be alerted when it becomes available again.",
    },
    {
      id: "14",
      category: "products",
      question: "Do you offer product warranties?",
      answer:
        "Many of our products come with manufacturer warranties. Warranty information is displayed on the product page. We also offer extended warranty options for electronics and appliances.",
    },
    {
      id: "15",
      category: "products",
      question: "Can I get product recommendations?",
      answer:
        "Yes! Our AI-powered recommendation engine suggests products based on your browsing history and preferences. You can also contact our customer service for personalized recommendations.",
    },
    {
      id: "16",
      category: "technical",
      question: "The website is not loading properly. What should I do?",
      answer:
        "Try clearing your browser cache and cookies, or try accessing the site from a different browser. If the problem persists, please contact our technical support team.",
    },
    {
      id: "17",
      category: "technical",
      question: "I'm having trouble placing an order. What should I do?",
      answer:
        "Make sure all required fields are filled out correctly and that your payment information is valid. If you continue to have issues, try using a different browser or contact our support team.",
    },
    {
      id: "18",
      category: "technical",
      question: "Do you have a mobile app?",
      answer:
        "Yes! Our mobile app is available for both iOS and Android devices. You can download it from the App Store or Google Play Store for a better mobile shopping experience.",
    },
  ]

  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Find answers to common questions about shopping, orders, returns, and more. Can't find what you're looking
          for? Contact our support team.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === category.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="text-center mb-8">
        <p className="text-gray-600">
          Showing {filteredFAQs.length} {filteredFAQs.length === 1 ? "question" : "questions"}
          {searchQuery && ` for "${searchQuery}"`}
        </p>
      </div>

      {/* FAQ Items */}
      <div className="max-w-4xl mx-auto">
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MessageCircle className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No questions found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search terms or browse different categories.</p>
            <button
              onClick={() => {
                setSearchQuery("")
                setActiveCategory("all")
              }}
              className="btn-primary"
            >
              Show All Questions
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-xl shadow-md border border-gray-200">
                <button
                  onClick={() => toggleExpanded(faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  {expandedItems.includes(faq.id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {expandedItems.includes(faq.id) && (
                  <div className="px-6 pb-4">
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Support */}
      <div className="mt-16 bg-gray-50 rounded-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-gray-600">
            Can't find the answer you're looking for? Our customer support team is here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-gray-600 text-sm mb-4">Chat with our support team in real-time</p>
            <button className="btn-primary w-full">Start Chat</button>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Phone Support</h3>
            <p className="text-gray-600 text-sm mb-4">Call us Mon-Fri, 8am-6pm EST</p>
            <a href="tel:+1234567890" className="btn-secondary w-full block text-center">
              +1 (234) 567-8900
            </a>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Email Support</h3>
            <p className="text-gray-600 text-sm mb-4">Send us an email and we'll respond within 24 hours</p>
            <a href="/contact" className="btn-secondary w-full block text-center">
              Contact Form
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
