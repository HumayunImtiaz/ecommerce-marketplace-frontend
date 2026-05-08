"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  CreditCard, Truck, Shield, ArrowLeft, Loader2, Package, CheckCircle, Ticket, X, Sparkles, ChevronRight
} from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements, PaymentElement, useStripe, useElements,
} from "@stripe/react-stripe-js"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/contexts/ToastContext"
import type { Address } from "@/lib/types"
import { getImageUrl } from "@/lib/utils"
import { orderApi } from "@/lib/api"

let stripePromise: Promise<any> | null = null;
const getStripe = () => {
  if (!stripePromise && typeof window !== "undefined") {
    stripePromise = fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/config/stripe`)
      .then((res) => res.json())
      .then((data) => {
        const key = data?.data?.publishableKey;
        if (key) return loadStripe(key);
        return null;
      })
      .catch((err) => {
        console.error("Failed to fetch Stripe key from backend:", err);
        return null;
      });
  }
  return stripePromise;
};

type AddressErrors = Partial<Record<keyof Address, string>>

const validateAddress = (addr: Address): AddressErrors => {
  const errors: AddressErrors = {}
  if (!addr.name.trim()) errors.name = "Full name is required"
  if (!addr.street.trim()) errors.street = "Street address is required"
  if (!addr.city.trim()) errors.city = "City is required"
  if (!addr.state.trim()) errors.state = "State is required"
  if (!addr.zipCode.trim()) errors.zipCode = "ZIP code is required"
  return errors
}

// ─── Stripe Form ──────────────────────────────────────────────────────────────
function StripePaymentForm({ onSuccess, isProcessing, setIsProcessing, createdOrderNumber, createdOrderId }: {
  onSuccess: (id: string) => void
  isProcessing: boolean
  setIsProcessing: (v: boolean) => void
  createdOrderNumber: string | null
  createdOrderId: string | null
}) {
  const stripe = useStripe()
  const elements = useElements()
  const { addToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setIsProcessing(true)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { 
        return_url: `${window.location.origin}/order-confirmation?order=${createdOrderNumber}&orderId=${createdOrderId}` 
      },
      redirect: "if_required",
    })

    if (error) {
      addToast(error.message || "Payment failed", "error")
      setIsProcessing(false)
      return
    }
    if (paymentIntent?.status === "succeeded") onSuccess(paymentIntent.id)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up">
      <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <PaymentElement className="mb-6" />
      </div>
      <button type="submit" disabled={!stripe || !elements || isProcessing}
        className="w-full btn-primary py-6 flex items-center justify-center gap-4 group"
      >
        {isProcessing ? (
          <><Loader2 className="w-5 h-5 animate-spin" /><span>Verifying Assets...</span></>
        ) : (
          <><CreditCard className="w-6 h-6" /><span className="text-sm font-black tracking-[0.2em] uppercase">Authorize Payment</span></>
        )}
      </button>
    </form>
  )
}

// ─── Address Form ─────────────────────────────────────────────────────────────
function AddressForm({ address, onChange, errors }: {
  address: Address
  onChange: (a: Address) => void
  errors: AddressErrors
}) {
  const f = (key: keyof Address, label: string, placeholder?: string, full = false) => (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-[10px] font-black tracking-widest uppercase mb-2 opacity-40">{label}</label>
      <input
        type="text"
        value={(address as any)[key]}
        onChange={(e) => onChange({ ...address, [key]: e.target.value })}
        placeholder={placeholder}
        className={`w-full bg-[#f8f9fa] border-2 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#eb9a05] focus:bg-white focus:shadow-xl transition-all font-bold text-sm ${errors[key] ? "border-red-400" : "border-gray-50"}`}
      />
      {errors[key] && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase tracking-widest">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {f("name", "Full Name", "E.g. Alexander Knight", true)}
      {f("street", "Street Address", "E.g. 123 Luxury Ave", true)}
      {f("city", "City", "E.g. London")}
      {f("state", "State / Province", "E.g. West End")}
      {f("zipCode", "ZIP / Postal Code", "E.g. SW1A 1AA")}
      <div>
        <label className="block text-[10px] font-black tracking-widest uppercase mb-2 opacity-40">Country</label>
        <select value={address.country} onChange={(e) => onChange({ ...address, country: e.target.value })}
          className="w-full bg-[#f8f9fa] border-2 border-gray-50 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#eb9a05] focus:bg-white focus:shadow-xl transition-all font-bold text-sm">
          <option>Pakistan</option>
          <option>United States</option>
          <option>United Kingdom</option>
          <option>Canada</option>
          <option>UAE</option>
        </select>
      </div>
    </div>
  )
}

// ─── Checkout Page ────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter()
  const { 
    items, 
    getCartTotal, 
    clearCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount 
  } = useCart()
  const { user } = useAuth()
  const { addToast } = useToast()

  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null)
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "cod">("stripe")

  const [shippingAddress, setShippingAddress] = useState<Address>({
    name: user?.name || "", street: "", city: "", state: "", zipCode: "", country: "Pakistan",
  })
  const [shippingErrors, setShippingErrors] = useState<AddressErrors>({})

  const [billingAddress, setBillingAddress] = useState<Address>({
    name: user?.name || "", street: "", city: "", state: "", zipCode: "", country: "Pakistan",
  })
  const [billingErrors, setBillingErrors] = useState<AddressErrors>({})
  const [sameAsShipping, setSameAsShipping] = useState(true)

  const [couponInput, setCouponInput] = useState("")
  const [isApplying, setIsApplying] = useState(false)
  const [publicCoupons, setPublicCoupons] = useState<any[]>([])

  useEffect(() => {
    const fetchPublicCoupons = async () => {
      try {
        const result = await orderApi.getPublicCoupons()
        if (result.success && Array.isArray(result.data)) setPublicCoupons(result.data)
      } catch (error) { console.error("Failed to fetch public coupons:", error) }
    }
    fetchPublicCoupons()
  }, [])

  const subtotal = getCartTotal()
  const tax = subtotal * 0.08
  const shipping = subtotal > 50 ? 0 : 9.99
  const total = Math.max(0, subtotal + tax + shipping - discountAmount)

  useEffect(() => { setClientSecret(null) }, [paymentMethod])

  const handleShippingNext = () => {
    const errs = validateAddress(shippingAddress)
    if (Object.keys(errs).length > 0) { setShippingErrors(errs); return }
    setShippingErrors({})
    setCurrentStep(2)
  }

  const handleBillingNext = () => {
    if (!sameAsShipping) {
      const errs = validateAddress(billingAddress)
      if (Object.keys(errs).length > 0) { setBillingErrors(errs); return }
      setBillingErrors({})
    }
    setCurrentStep(3)
  }

  const proceedToComplete = async () => {
    setIsProcessing(true)
    try {
      const result = await orderApi.createOrder({
        items: items.map((i) => ({
          productId: i.product.id, name: i.product.name, image: i.product.image,
          price: i.product.price, quantity: i.quantity,
          selectedColor: i.selectedColor, selectedSize: i.selectedSize,
        })),
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        subtotal, tax, shippingCost: shipping, total,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        discountAmount,
      })
      if (!result?.success) {
        addToast(result?.message || "Failed to place order", "error");
        setIsProcessing(false)
        return
      }

      setCreatedOrderNumber(result.data?.orderNumber)
      setCreatedOrderId(result.data?.orderId)

      if (paymentMethod === "stripe") {
        setClientSecret(result.data?.clientSecret)
        setCurrentStep(4)
        setIsProcessing(false)
      } else {
        clearCart()
        router.push(`/order-confirmation?order=${result.data?.orderNumber}`)
      }
    } catch {
      addToast("Failed to connect to server", "error")
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center bg-[#f8f9fa]">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
          <Package className="w-10 h-10 text-gray-200" />
        </div>
        <h1 className="text-4xl font-playfair font-black mb-6" style={{ color: 'var(--primary)' }}>Awaiting Your Selection</h1>
        <p className="text-gray-500 mb-10 max-w-md mx-auto italic">Your cart is currently empty. Our curated collections are waiting for your discovery.</p>
        <button onClick={() => router.push("/products")} className="btn-primary py-4 px-12 uppercase tracking-widest text-sm font-black">
          Explore The Collection
        </button>
      </div>
    )
  }

  const STEPS = ["Discovery", "Billing", "Sanctuary", "Finalize"]

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
          <div className="flex items-center gap-6">
            <button onClick={() => router.back()} className="p-4 rounded-2xl bg-white shadow-lg border border-gray-100 hover:text-[#eb9a05] transition-all transform hover:scale-110">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-5xl font-playfair font-black leading-tight" style={{ color: 'var(--primary)' }}>Checkout</h1>
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#eb9a05] mt-2">Secure Checkout</p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-4 bg-white p-6 rounded-[2rem] shadow-xl border border-[#eb9a05]/10">
            {STEPS.map((label, i) => {
              const step = i + 1
              return (
                <div key={step} className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all ${step < currentStep ? "bg-green-500 text-white shadow-lg" : step === currentStep ? "bg-[#002147] text-[#eb9a05] shadow-2xl scale-110" : "bg-gray-100 text-gray-400"}`}>
                      {step < currentStep ? <CheckCircle className="w-6 h-6" /> : step}
                    </div>
                  </div>
                  {step < 4 && <div className={`w-8 h-1 rounded-full transition-all ${step < currentStep ? "bg-green-500" : "bg-gray-100"}`} />}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          <div className="lg:col-span-2">
            {/* Step 1: Shipping */}
            {currentStep === 1 && (
              <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-[#eb9a05]/10 animate-fade-in-up">
                <div className="flex items-center gap-6 mb-12">
                  <div className="p-4 rounded-2xl bg-[#eb9a05]/10 text-[#eb9a05]">
                    <Truck className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-playfair font-black" style={{ color: 'var(--primary)' }}>Logistics</h2>
                </div>
                <AddressForm address={shippingAddress} onChange={setShippingAddress} errors={shippingErrors} />
                <button onClick={handleShippingNext} className="mt-16 w-full btn-primary py-6 flex items-center justify-center gap-4 group">
                  <span className="text-sm font-black tracking-[0.2em] uppercase">Proceed to Billing</span>
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                </button>
              </div>
            )}

            {/* Step 2: Billing */}
            {currentStep === 2 && (
              <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-[#eb9a05]/10 animate-fade-in-up">
                <div className="flex items-center gap-6 mb-12">
                  <div className="p-4 rounded-2xl bg-[#eb9a05]/10 text-[#eb9a05]">
                    <Shield className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-playfair font-black" style={{ color: 'var(--primary)' }}>Billing Details</h2>
                </div>
                <label className="flex items-center gap-4 mb-12 p-6 rounded-3xl bg-[#f8f9fa] border-2 border-dashed border-[#eb9a05]/30 cursor-pointer hover:border-[#eb9a05] transition-all">
                  <input type="checkbox" checked={sameAsShipping} onChange={(e) => setSameAsShipping(e.target.checked)} className="w-5 h-5 rounded accent-[#002147]" />
                  <span className="font-bold text-[#002147] tracking-widest uppercase text-xs">Identical to Shipping Logistics</span>
                </label>
                {!sameAsShipping && <AddressForm address={billingAddress} onChange={setBillingAddress} errors={billingErrors} />}
                <div className="flex gap-6 mt-16">
                  <button onClick={() => setCurrentStep(1)} className="flex-1 py-6 rounded-2xl border-2 border-gray-100 font-black text-xs tracking-widest uppercase hover:bg-gray-50 transition-all">Previous</button>
                  <button onClick={handleBillingNext} className="flex-1 btn-primary py-6 flex items-center justify-center gap-4 group">
                    <span className="text-sm font-black tracking-[0.2em] uppercase">Advance to Payment</span>
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Choice */}
            {currentStep === 3 && (
              <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-[#eb9a05]/10 animate-fade-in-up">
                <div className="flex items-center gap-6 mb-12">
                  <div className="p-4 rounded-2xl bg-[#eb9a05]/10 text-[#eb9a05]">
                    <CreditCard className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-playfair font-black" style={{ color: 'var(--primary)' }}>Authorized Method</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                  <button onClick={() => setPaymentMethod("stripe")} className={`p-10 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all hover:scale-105 ${paymentMethod === "stripe" ? "border-[#002147] bg-[#002147] text-white shadow-2xl" : "border-gray-50 bg-[#f8f9fa] opacity-60"}`}>
                    <CreditCard className={`w-10 h-10 ${paymentMethod === "stripe" ? "text-[#eb9a05]" : "text-gray-300"}`} />
                    <span className="font-black text-xs tracking-[0.2em] uppercase">Secure Card</span>
                  </button>
                  <button onClick={() => setPaymentMethod("cod")} className={`p-10 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all hover:scale-105 ${paymentMethod === "cod" ? "border-[#eb9a05] bg-[#002147] text-white shadow-2xl" : "border-gray-50 bg-[#f8f9fa] opacity-60"}`}>
                    <Package className={`w-10 h-10 ${paymentMethod === "cod" ? "text-[#eb9a05]" : "text-gray-300"}`} />
                    <span className="font-black text-xs tracking-[0.2em] uppercase">Private Courier (COD)</span>
                  </button>
                </div>

                <div className="flex gap-6 mt-16">
                  <button onClick={() => setCurrentStep(2)} className="flex-1 py-6 rounded-2xl border-2 border-gray-100 font-black text-xs tracking-widest uppercase hover:bg-gray-50 transition-all">Back</button>
                  <button onClick={proceedToComplete} disabled={isProcessing}
                    className="flex-1 btn-primary py-6 flex items-center justify-center gap-4 group">
                    {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                      <>
                        <span className="text-sm font-black tracking-[0.2em] uppercase">{paymentMethod === "stripe" ? "Finalize Payment" : "Place Order"}</span>
                        <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Stripe UI */}
            {currentStep === 4 && paymentMethod === "stripe" && (
              <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-[#eb9a05]/10 animate-fade-in-up">
                <div className="flex items-center gap-6 mb-12">
                  <div className="p-4 rounded-2xl bg-green-50 text-green-600">
                    <Shield className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-playfair font-black" style={{ color: 'var(--primary)' }}>Authorized Payment</h2>
                </div>

                {clientSecret ? (
                  <Elements stripe={getStripe()} options={{ clientSecret, appearance: { theme: "luxury" as any, variables: { colorPrimary: '#002147' } } }}>
                    <StripePaymentForm
                      createdOrderNumber={createdOrderNumber}
                      createdOrderId={createdOrderId}
                      onSuccess={async (paymentIntentId) => {
                        setIsProcessing(true)
                        if (createdOrderId) {
                          try {
                            const result = await orderApi.confirmPayment(createdOrderId, paymentIntentId)
                            if (result.success) { clearCart(); router.push(`/order-confirmation?order=${createdOrderNumber}`) }
                            else { addToast(result.message || "Failed to sync assets.", "error"); router.push(`/order-confirmation?order=${createdOrderNumber}`) }
                          } catch (err) { console.error("confirmPayment error:", err); router.push(`/order-confirmation?order=${createdOrderNumber}`) }
                        } else { clearCart(); router.push(`/order-confirmation?order=${createdOrderNumber}`) }
                      }}
                      isProcessing={isProcessing}
                      setIsProcessing={setIsProcessing}
                    />
                  </Elements>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-[#eb9a05] mb-4" />
                    <span className="text-[10px] font-black tracking-widest uppercase opacity-40">Connecting to Private Vault...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-[3rem] p-10 shadow-2xl border border-[#eb9a05]/10">
              <h2 className="text-2xl font-playfair font-black mb-10" style={{ color: 'var(--primary)' }}>Order Summary</h2>
              
              <div className="space-y-6 mb-10 max-h-80 overflow-y-auto pr-4 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="relative w-20 h-24 rounded-2xl overflow-hidden bg-[#f8f9fa] border border-gray-100 flex-shrink-0">
                      <Image src={getImageUrl(item.product.image)} alt={item.product.name} fill className="object-cover transition-transform group-hover:scale-110" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-playfair font-bold text-sm leading-tight text-[#002147] line-clamp-2">{item.product.name}</h4>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Qty: {item.quantity}</span>
                        <span className="font-black text-[#002147]">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t border-gray-50 pt-8 mb-10">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-40"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-40"><span>Logistics</span><span>{shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}</span></div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-[#eb9a05]">
                    <span className="flex items-center gap-2"><Ticket className="w-3 h-3" /> Privilege Code</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-[#002147]/5 pt-6 flex justify-between items-baseline">
                  <span className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: 'var(--primary)' }}>Final Value</span>
                  <span className="text-4xl font-playfair font-black text-[#002147]">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="bg-[#f8f9fa] p-8 rounded-[2rem] border border-gray-50">
                <div className="flex items-center gap-3 mb-6">
                  <Ticket className="w-4 h-4 text-[#eb9a05]" />
                  <h3 className="text-[10px] font-black tracking-widest uppercase text-[#002147]">Privilege Entry</h3>
                </div>

                {!appliedCoupon ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="CODE"
                        className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-black focus:border-[#eb9a05] outline-none uppercase font-mono tracking-widest"
                      />
                      <button
                        onClick={async () => { setIsApplying(true); await applyCoupon(couponInput); setIsApplying(false); setCouponInput("") }}
                        disabled={isApplying || !couponInput.trim()}
                        className="bg-[#002147] text-[#eb9a05] px-5 py-3 rounded-xl text-[10px] font-black hover:bg-[#002b5c] transition-all disabled:opacity-20"
                      >
                        Apply
                      </button>
                    </div>
                    {publicCoupons.length > 0 && (
                      <div className="pt-4 space-y-3">
                        <p className="text-[8px] font-black tracking-[0.3em] uppercase opacity-30 text-center">Available Privileges</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {publicCoupons.slice(0, 2).map((coupon) => (
                            <button
                              key={coupon._id}
                              onClick={() => applyCoupon(coupon.code)}
                              className="px-3 py-1.5 rounded-lg bg-white border border-[#eb9a05]/20 text-[8px] font-black tracking-widest uppercase text-[#eb9a05] hover:bg-[#eb9a05] hover:text-white transition-all"
                            >
                              {coupon.code}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#002147] p-5 rounded-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[8px] font-black tracking-widest uppercase text-[#eb9a05] opacity-60">Status: Applied</p>
                        <p className="text-sm font-black text-white tracking-widest uppercase">{appliedCoupon.code}</p>
                      </div>
                      <button onClick={removeCoupon} className="p-2 text-white/40 hover:text-red-500"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}