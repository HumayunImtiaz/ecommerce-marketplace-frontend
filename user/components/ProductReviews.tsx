"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Star, ThumbsUp, User, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/contexts/ToastContext"

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
  reviews?: Review[] // optional — ab API se fetch karte hain
}

import { productApi } from "@/lib/api"

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)

  const { user } = useAuth()
  const { addToast } = useToast()

  // ── Reviews fetch karo ────────────────────────────────────────────────────
  const fetchReviews = async () => {
    try {
      setIsLoadingReviews(true)
      const { data, success } = await productApi.getReviews(productId)
      if (success && Array.isArray(data)) {
        setReviews(data)
      }
    } catch {
      // silent fail
    } finally {
      setIsLoadingReviews(false)
    }
  }

  useEffect(() => {
    if (productId) fetchReviews()
  }, [productId])

  // ── Review submit karo ────────────────────────────────────────────────────
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      addToast("Please login to submit a review", "error")
      return
    }

    if (!newReview.comment.trim()) {
      addToast("Please write a review comment", "error")
      return
    }

    setIsSubmitting(true)

    try {
      const { success, message } = await productApi.addReview(productId, {
        rating: newReview.rating,
        comment: newReview.comment,
      })

      if (!success) {
        addToast(message || "Failed to submit review", "error")
        return
      }

      addToast("Review submitted successfully!", "success")
      setNewReview({ rating: 5, comment: "" })
      setShowReviewForm(false)
      // Reviews reload karo
      await fetchReviews()
    } catch {
      addToast("Failed to connect to server", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100
        : 0,
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Customer Reviews</h3>
        {user && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Summary */}
      {reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 p-6 bg-gray-50 rounded-xl">
          <div>
            <div className="flex items-center mb-2">
              <span className="text-5xl font-bold mr-4">{averageRating.toFixed(1)}</span>
              <div>
                <div className="flex items-center mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(averageRating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 text-sm">Based on {reviews.length} reviews</p>
              </div>
            </div>
          </div>

          <div>
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center mb-2">
                <span className="text-sm w-8 text-gray-600">{rating}★</span>
                <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-6">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl mb-8">
          <h4 className="font-semibold mb-4 text-lg">Write Your Review</h4>
          <form onSubmit={handleSubmitReview}>
            {/* Star Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Your Rating
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setNewReview((prev) => ({ ...prev, rating: star }))}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoveredStar || newReview.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm text-gray-500 ml-2">
                  {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                    hoveredStar || newReview.rating
                  ]}
                </span>
              </div>
            </div>

            {/* Comment */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Your Review
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) =>
                  setNewReview((prev) => ({ ...prev, comment: e.target.value }))
                }
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Share your experience with this product..."
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 flex items-center space-x-2 transition-colors"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isSubmitting ? "Submitting..." : "Submit Review"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false)
                  setNewReview({ rating: 5, comment: "" })
                }}
                className="border border-gray-300 hover:bg-gray-50 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {isLoadingReviews ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No reviews yet</p>
          <p className="text-gray-400 text-sm mt-1">Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-semibold text-gray-900">{review.userName}</h5>
                    <span className="text-sm text-gray-400">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}