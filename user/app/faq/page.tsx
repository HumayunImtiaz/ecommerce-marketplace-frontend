"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Search, MessageCircle, Phone, Mail, Sparkles, HelpCircle } from "lucide-react"

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const categories = [
    { id: "all", name: "All Narratives" },
    { id: "orders", name: "Orders" },
    { id: "returns", name: "Dissolutions" },
    { id: "account", name: "Identity" },
    { id: "payment", name: "Exchanges" },
    { id: "products", name: "Masterpieces" },
  ]

  const faqs = [
    { id: "1", category: "orders", question: "What is the delivery timeline?", answer: "Standard shipping typically takes 3-7 business days. We also offer expedited 1-3 day delivery. Free shipping is available for all orders over $50." },
    { id: "2", category: "orders", question: "How can I track my order?", answer: "Once your order ships, a tracking number will be sent to your email. You can also track your order in the 'Order History' section of your account." },
    { id: "4", category: "returns", question: "What is your return policy?", answer: "We offer a 30-day return window for most orders. Items must be in their original condition with all tags attached. Certain categories like electronics have specific return requirements." },
    { id: "7", category: "account", question: "How do I establish a private identity?", answer: "Select the 'Create Identity' option in our sanctuary's header. Provide your distinguished credentials and verify your electronic address to activate your access." },
    { id: "10", category: "payment", question: "Which exchange methods are recognized?", answer: "We recognize all premier credit institutions (Visa, MasterCard, Amex), PayPal, and secure digital wallets. All exchanges are shielded by high-fidelity encryption." },
    { id: "13", category: "products", question: "How do I verify artifact availability?", answer: "The current curation status is displayed on each masterpiece's individual page. For artifacts currently out of sanctuary, you may request a private notification for when they return." },
  ]

  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-20 px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#eb9a05]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px]"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#eb9a05]/10 border border-[#eb9a05]/20 text-[#eb9a05] mb-8">
            <HelpCircle className="w-4 h-4" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase">The Compendium</span>
          </div>
          <h1 className="text-6xl font-playfair font-black text-[#002147] mb-6">Common Inquiries</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto italic leading-relaxed">
            Consult our artisanal knowledge base for immediate clarity. Should your query remain unresolved, our private concierge remains at your disposal.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-16 relative group">
          <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-[#eb9a05] w-5 h-5 transition-transform group-hover:scale-110" />
          <input
            type="text"
            placeholder="Search the archives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-[#eb9a05]/10 rounded-[2rem] pl-16 pr-8 py-5 focus:outline-none focus:border-[#eb9a05] focus:shadow-2xl transition-all font-bold text-sm shadow-xl shadow-[#002147]/5"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-8 py-3 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-500 ${
                activeCategory === category.id ? "bg-[#002147] text-[#eb9a05] shadow-2xl scale-110" : "bg-white text-gray-400 hover:text-[#002147] border border-gray-50"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-6">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-[3rem] shadow-xl border border-gray-50">
              <Sparkles className="w-16 h-16 text-gray-200 mx-auto mb-6" />
              <h3 className="text-2xl font-playfair font-black text-[#002147] mb-2">No Resonance Found</h3>
              <p className="text-gray-400 text-sm italic">Adjust your search parameters for a clearer perspective.</p>
            </div>
          ) : (
            filteredFAQs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-700 border border-[#eb9a05]/5 overflow-hidden group">
                <button
                  onClick={() => toggleExpanded(faq.id)}
                  className="w-full px-10 py-8 text-left flex items-center justify-between transition-colors"
                >
                  <h3 className={`text-lg font-playfair font-black transition-colors ${expandedItems.includes(faq.id) ? 'text-[#eb9a05]' : 'text-[#002147]'}`}>{faq.question}</h3>
                  <div className={`p-2 rounded-xl transition-all duration-500 ${expandedItems.includes(faq.id) ? 'bg-[#002147] text-[#eb9a05] rotate-180' : 'bg-gray-50 text-gray-300'}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-700 ${expandedItems.includes(faq.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-10 pb-10">
                    <div className="border-t border-gray-50 pt-8">
                      <p className="text-gray-500 leading-relaxed italic text-sm">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Contact Support */}
        <div className="mt-32 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-playfair font-black text-[#002147] mb-4">Unyielding Support</h2>
            <p className="text-gray-400 italic">Should clarity remain elusive, our pathways of assistance are perpetually open.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
             {[
               { icon: MessageCircle, title: "Live Dialogue", desc: "Immediate resonance with a human representative.", btn: "Initiate Chat", color: "bg-[#002147]/5 text-[#eb9a05]" },
               { icon: Phone, title: "Voice Pathway", desc: "Available for direct conversation Mon-Fri.", btn: "+1 (234) 567-8900", color: "bg-[#eb9a05]/5 text-[#002147]" },
               { icon: Mail, title: "Electronic Inquiry", desc: "Transmit your narrative for a 24h response.", btn: "Contact Form", color: "bg-gray-50 text-gray-400" }
             ].map((item, i) => (
               <div key={i} className="bg-white rounded-[2.5rem] p-10 text-center shadow-xl border border-gray-50 hover:-translate-y-2 transition-all duration-500">
                 <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg`}>
                   <item.icon className="w-7 h-7" />
                 </div>
                 <h3 className="text-xl font-playfair font-black text-[#002147] mb-4">{item.title}</h3>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-8 leading-relaxed px-4">{item.desc}</p>
                 <button className="w-full py-4 rounded-xl border-2 border-gray-50 text-[10px] font-black tracking-widest uppercase text-[#002147] hover:bg-[#002147] hover:text-white transition-all shadow-sm">{item.btn}</button>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}
