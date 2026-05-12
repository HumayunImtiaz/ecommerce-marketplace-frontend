"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Star, ThumbsUp, User, Loader2, Sparkles, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/contexts/ToastContext"
import { productApi } from "@/lib/api"

interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  comment: string
  date: string
}

interface ProductReviewsProps {
  productId: string
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)

  const { user } = useAuth()
  const { addToast } = useToast()

  const fetchReviews = async () => {
    try {
      setIsLoadingReviews(true)
      const { data, success } = await productApi.getReviews(productId)
      if (success && Array.isArray(data)) setReviews(data)
    } catch { /* Silent fail */ }
    finally { setIsLoadingReviews(false) }
  }

  useEffect(() => { if (productId) fetchReviews() }, [productId])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { addToast("Please login to submit a review", "error"); return }
    if (!newReview.comment.trim()) { addToast("Please write a review comment", "error"); return }
    setIsSubmitting(true)
    try {
      const { success, message } = await productApi.addReview(productId, { rating: newReview.rating, comment: newReview.comment })
      if (!success) { addToast(message || "Failed to submit review", "error"); return }
      addToast("Review submitted successfully!", "success")
      setNewReview({ rating: 5, comment: "" })
      setShowReviewForm(false)
      await fetchReviews()
    } catch { addToast("Failed to connect to server", "error") }
    finally { setIsSubmitting(false) }
  }

  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100 : 0,
  }))

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px w-8 bg-[#eb9a05]"></div>
            <p className="text-[10px] font-black tracking-[0.4em] uppercase text-[#eb9a05]">Testimonials</p>
          </div>
          <h3 className="text-4xl font-playfair font-black text-[#002147]">Connoisseur Feedback</h3>
        </div>
        {user && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="btn-secondary py-4 px-10 text-[10px] font-black uppercase tracking-widest shadow-xl transform hover:scale-105 active:scale-95"
          >
            Share Your Experience
          </button>
        )}
      </div>

      {/* Review Summary */}
      {reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 p-12 bg-[#f8f9fa] rounded-[2.5rem] border border-gray-50 shadow-sm">
          <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left">
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-7xl font-playfair font-black text-[#002147]">{averageRating.toFixed(1)}</span>
              <div className="flex flex-col">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(averageRating) ? "fill-[#eb9a05] text-[#eb9a05]" : "text-gray-200"}`} />
                  ))}
                </div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-40">Average Rating</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 italic">Based on {reviews.length} verified purchases</p>
          </div>

          <div className="space-y-4">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-6 group">
                <span className="text-[10px] font-black text-gray-400 w-6">{rating}★</span>
                <div className="flex-1 bg-white rounded-full h-1.5 overflow-hidden shadow-inner border border-gray-50">
                  <div className="bg-[#eb9a05] h-full transition-all duration-1000 group-hover:bg-[#002147]" style={{ width: `${percentage}%` }} />
                </div>
                <span className="text-[10px] font-black text-[#002147] w-6 opacity-40">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-[#002147] p-12 rounded-[2.5rem] shadow-2xl animate-fade-in-up relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#eb9a05]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <h4 className="text-2xl font-playfair font-bold text-white mb-10">Record Your Impression</h4>
          <form onSubmit={handleSubmitReview} className="space-y-10">
            <div>
              <label className="block text-[10px] font-black tracking-widest uppercase text-[#eb9a05] mb-6">Rate Your Purchase</label>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setNewReview((prev) => ({ ...prev, rating: star }))}
                    className="transform transition-transform hover:scale-125"
                  >
                    <Star className={`w-10 h-10 transition-colors ${star <= (hoveredStar || newReview.rating) ? "fill-[#eb9a05] text-[#eb9a05]" : "text-white/10"}`} />
                  </button>
                ))}
                <span className="ml-6 text-sm font-bold uppercase tracking-[0.2em] text-[#eb9a05]">
                  {["", "Exceedingly Poor", "Below Standards", "Satisfactory", "Distinguished", "Exemplary"][hoveredStar || newReview.rating]}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black tracking-widest uppercase text-[#eb9a05] mb-4">Your Narrative</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="w-full bg-white/5 border-2 border-white/10 rounded-[1.5rem] px-8 py-6 text-white focus:outline-none focus:border-[#eb9a05] focus:bg-white/10 transition-all text-lg placeholder:text-white/20"
                placeholder="Share the details of your experience..."
                required
              />
            </div>

            <div className="flex gap-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-secondary py-5 px-12 flex items-center gap-4 group disabled:opacity-20"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                <span className="text-xs font-black tracking-widest uppercase">{isSubmitting ? "Submitting..." : "Publish Narrative"}</span>
              </button>
              <button
                type="button"
                onClick={() => { setShowReviewForm(false); setNewReview({ rating: 5, comment: "" }) }}
                className="px-10 py-5 rounded-2xl border-2 border-white/10 text-white hover:bg-white/5 font-black text-[10px] tracking-widest uppercase transition-all"
              >
                Discard
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {isLoadingReviews ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#eb9a05] mb-4" />
          <p className="text-[10px] font-black tracking-widest uppercase opacity-40">Collating Experiences...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-24 bg-[#f8f9fa] rounded-[3.5rem] border-2 border-dashed border-[#eb9a05]/20">
          <Sparkles className="w-16 h-16 text-gray-200 mx-auto mb-6" />
          <h3 className="text-2xl font-playfair font-black text-[#002147] mb-2">Pristine Collection</h3>
          <p className="text-gray-400 text-sm font-medium italic">Be the first to leave your mark on this masterpiece.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {reviews.map((review) => (
            <div key={review.id} className="group p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-start gap-8">
                <div className="w-16 h-16 bg-[#f8f9fa] rounded-2xl flex items-center justify-center flex-shrink-0 border border-gray-50 shadow-inner group-hover:bg-[#002147] transition-all duration-500">
                  <User className="w-8 h-8 text-gray-300 group-hover:text-[#eb9a05] transition-all duration-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-lg font-playfair font-black text-[#002147] tracking-tight">{review.userName}</h5>
                    <span className="text-[10px] font-black tracking-widest text-[#eb9a05] opacity-60">
                      {new Date(review.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-[#eb9a05] text-[#eb9a05]" : "text-gray-100"}`} />
                    ))}
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed italic pr-12">&quot;{review.comment}&quot;</p>

                  <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
                    <button className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase opacity-20 hover:opacity-100 transition-opacity">
                      <ThumbsUp className="w-3 h-3" />
                      Helpful Appreciation
                    </button>
                    <span className="text-[10px] font-black tracking-widest uppercase text-green-600 flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Verified Purchase
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}