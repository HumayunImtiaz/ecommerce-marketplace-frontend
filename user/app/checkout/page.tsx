"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  CreditCard, Truck, Shield, ArrowLeft, Loader2, Package, CheckCircle
} from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements, PaymentElement, useStripe, useElements,
} from "@stripe/react-stripe-js"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/contexts/ToastContext"
import type { Address } from "@/lib/types"

let stripePromise: Promise<any> | null = null;
const getStripe = () => {
  if (!stripePromise && typeof window !== "undefined") {
    stripePromise = fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/config/stripe`)
      .then((res) => res.json())
      .then((data) => {
        const key = data?.data?.publishableKey;
        if (key) {
          return loadStripe(key);
        }
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

import { orderApi } from "@/lib/api"

// ─── Stripe Form ──────────────────────────────────────────────────────────────
function StripePaymentForm({ onSuccess, isProcessing, setIsProcessing }: {
  onSuccess: (id: string) => void
  isProcessing: boolean
  setIsProcessing: (v: boolean) => void
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
      confirmParams: { return_url: window.location.origin + "/order-confirmation" },
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
    <form onSubmit={handleSubmit}>
      <PaymentElement className="mb-6" />
      <button type="submit" disabled={!stripe || !elements || isProcessing}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 transition-all">
        {isProcessing
          ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Processing...</span></>
          : <><CreditCard className="w-4 h-4" /><span>Pay Now</span></>}
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
      <label className="block text-sm font-medium mb-1.5 text-gray-700">{label} *</label>
      <input
        type="text"
        value={(address as any)[key]}
        onChange={(e) => onChange({ ...address, [key]: e.target.value })}
        placeholder={placeholder}
        className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 transition-all ${errors[key] ? "border-red-400 focus:ring-red-300 bg-red-50" : "border-gray-300 focus:ring-blue-500"
          }`}
      />
      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {f("name", "Full Name", "John Doe", true)}
      {f("street", "Street Address", "123 Main St", true)}
      {f("city", "City", "Karachi")}
      {f("state", "State / Province", "Sindh")}
      {f("zipCode", "ZIP / Postal Code", "75500")}
      <div>
        <label className="block text-sm font-medium mb-1.5 text-gray-700">Country *</label>
        <select value={address.country} onChange={(e) => onChange({ ...address, country: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
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
  const { items, getCartTotal, clearCart } = useCart()
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

  const subtotal = getCartTotal()
  const tax = subtotal * 0.08
  const shipping = subtotal > 50 ? 0 : 9.99
  const total = subtotal + tax + shipping

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
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <button onClick={() => router.push("/products")} className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-semibold">
          Continue Shopping
        </button>
      </div>
    )
  }

  const STEPS = ["Shipping", "Billing", "Payment", "Done"]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-gray-800 mr-4">
          <ArrowLeft className="w-5 h-5 mr-1" />Back
        </button>
        <h1 className="text-3xl font-bold">Checkout</h1>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center mb-10">
        {STEPS.map((label, i) => {
          const step = i + 1
          return (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step < currentStep ? "bg-green-500 text-white" : step === currentStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                  {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
                <span className={`text-xs mt-1 ${step === currentStep ? "text-blue-600 font-semibold" : "text-gray-400"}`}>{label}</span>
              </div>
              {step < 4 && <div className={`w-16 h-1 mx-2 mb-4 rounded ${step < currentStep ? "bg-green-400" : "bg-gray-200"}`} />}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-6">
                <Truck className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold">Shipping Address</h2>
              </div>
              <AddressForm address={shippingAddress} onChange={setShippingAddress} errors={shippingErrors} />
              <button onClick={handleShippingNext} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold">
                Continue to Billing
              </button>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Billing Address</h2>
              <label className="flex items-center mb-6 cursor-pointer">
                <input type="checkbox" checked={sameAsShipping} onChange={(e) => setSameAsShipping(e.target.checked)} className="mr-3 w-4 h-4" />
                <span className="font-medium">Same as shipping address</span>
              </label>
              {!sameAsShipping && <AddressForm address={billingAddress} onChange={setBillingAddress} errors={billingErrors} />}
              <div className="flex space-x-4 mt-6">
                <button onClick={() => setCurrentStep(1)} className="flex-1 border border-gray-300 hover:bg-gray-50 py-3 rounded-xl font-semibold">Back</button>
                <button onClick={handleBillingNext} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold">Continue to Payment</button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-6">
                <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold">Payment Method</h2>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button onClick={() => setPaymentMethod("stripe")} className={`p-4 border-2 rounded-xl flex flex-col items-center space-y-2 transition-all ${paymentMethod === "stripe" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <CreditCard className={`w-6 h-6 ${paymentMethod === "stripe" ? "text-blue-600" : "text-gray-400"}`} />
                  <span className={`font-semibold text-sm ${paymentMethod === "stripe" ? "text-blue-600" : "text-gray-600"}`}>Card / Stripe</span>
                  <span className="text-xs text-gray-400">Visa, Mastercard</span>
                </button>
                <button onClick={() => setPaymentMethod("cod")} className={`p-4 border-2 rounded-xl flex flex-col items-center space-y-2 transition-all ${paymentMethod === "cod" ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <Package className={`w-6 h-6 ${paymentMethod === "cod" ? "text-green-600" : "text-gray-400"}`} />
                  <span className={`font-semibold text-sm ${paymentMethod === "cod" ? "text-green-600" : "text-gray-600"}`}>Cash on Delivery</span>
                  <span className="text-xs text-gray-400">Pay when delivered</span>
                </button>
              </div>

              <div className="flex space-x-4 mt-6">
                <button onClick={() => setCurrentStep(2)} className="flex-1 border border-gray-300 hover:bg-gray-50 py-3 rounded-xl font-semibold">Back</button>
                <button onClick={proceedToComplete} disabled={isProcessing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 disabled:opacity-50">
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>{paymentMethod === "stripe" ? "Proceed to Payment" : "Place Order"}</span>}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Stripe Payment */}
          {currentStep === 4 && paymentMethod === "stripe" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-6">
                <Shield className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-xl font-semibold">Complete Payment</h2>
              </div>
              
              {clientSecret ? (
                <Elements stripe={getStripe()} options={{ clientSecret, appearance: { theme: "stripe" } }}>
                  <StripePaymentForm 
                    onSuccess={async (paymentIntentId) => {
                      // Confirm payment on backend (mark order as paid + processing)
                      if (createdOrderId) {
                        try {
                          await orderApi.confirmPayment(createdOrderId, paymentIntentId)
                        } catch (err) {
                          console.error("confirmPayment error:", err)
                        }
                      }
                      clearCart()
                      router.push(`/order-confirmation?order=${createdOrderNumber}`)
                    }}
                    isProcessing={isProcessing} 
                    setIsProcessing={setIsProcessing} 
                  />
                </Elements>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                  <span className="text-gray-500">Loading secure payment form...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <Image src={item.product.image || "/placeholder.svg"} alt={item.product.name} width={48} height={48} className="rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{item.product.name}</h4>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{shipping === 0 ? "Free 🎉" : `$${shipping.toFixed(2)}`}</span></div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
            <div className="mt-4 bg-green-50 p-3 rounded-xl flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-700">Secure & encrypted checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}