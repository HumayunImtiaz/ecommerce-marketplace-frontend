

// Generic API Fetcher

async function fetcher<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; success: boolean; message: string; status: number }> {
  try {
    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    }

    const response = await fetch(endpoint, defaultOptions)
    const result = await response.json()

    return {
      ...result,
      data: result.data || null,
      success: result.success || response.ok,
      message: result.message || "",
      status: response.status,
    }
  } catch (error: any) {
    console.error(`API Error [${endpoint}]:`, error)
    return {
      data: null,
      success: false,
      message: error.message || "Network error occurred",
      status: 500,
    }
  }
}


// Auth APIs

export const authApi = {
  getMe: () => fetcher("/api/auth/me", { cache: "no-store" }),

  login: (credentials: any) =>
    fetcher("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData: any) =>
    fetcher("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  logout: () => fetcher("/api/auth/logout", { method: "POST" }),

  socialLogin: (data: any) =>
    fetcher("/api/auth/social-login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyEmail: (token: string) => fetcher(`/api/auth/verify-email?token=${token}`),
  forgotPassword: (email: string) =>
    fetcher("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, data: any) =>
    fetcher("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, ...data }),
    }),
}


//  * Product & Category APIs

export const productApi = {
  getProducts: (options: any = {}) => {
    const params = new URLSearchParams();
    if (options.activeOnly) params.append("activeOnly", "true");
    if (options.search) params.append("search", options.search);
    if (options.category) params.append("category", options.category);
    if (options.priceRange?.[0] !== undefined) params.append("minPrice", options.priceRange[0].toString());
    if (options.priceRange?.[1] !== undefined) params.append("maxPrice", options.priceRange[1].toString());
    if (options.rating) params.append("rating", options.rating.toString());
    if (options.inStock) params.append("inStock", "true");
    if (options.sortBy) params.append("sortBy", options.sortBy);
    if (options.isFeatured) params.append("isFeatured", "true");
    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());

    const queryString = params.toString();
    return fetcher(`/api/products${queryString ? `?${queryString}` : ""}`, { cache: "no-store" });
  },

  getCategories: (hideEmpty: boolean = false) => 
    fetcher(`/api/categories${hideEmpty ? "?hideEmpty=true" : ""}`, { cache: "no-store" }),

  getProductBySlug: (slug: string) => fetcher(`/api/products/${slug}`, { cache: "no-store" }),

  // Custom Reviews (via product detail logic)
  getReviews: (productId: string) => fetcher(`/api/reviews/${productId}`),

  addReview: (productId: string, reviewData: any) =>
    fetcher(`/api/reviews/${productId}`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    }),
}

// Cart Api
export const cartApi = {
  getCart: () => fetcher("/api/cart"),

  addToCart: (data: { productId: string; quantity: number; selectedColor?: string; selectedSize?: string }) =>
    fetcher("/api/cart", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateQuantity: (itemId: string, quantity: number) =>
    fetcher("/api/cart", {
      method: "PATCH",
      body: JSON.stringify({ itemId, quantity }),
    }),

  removeFromCart: (itemId: string) => fetcher(`/api/cart?itemId=${itemId}`, { method: "DELETE" }),

  clearCart: () => fetcher("/api/cart?clear=true", { method: "DELETE" }),
}


//   Order APIs

export const orderApi = {
  getOrders: () => fetcher("/api/orders", { cache: "no-store" }),

  createOrder: (orderData: any) =>
    fetcher("/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    }),

  createPaymentIntent: (data: any) =>
    fetcher("/api/orders/payment-intent", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  confirmPayment: (orderId: string, paymentIntentId: string) =>
    fetcher(`/api/orders/${orderId}/confirm-payment`, {
      method: "POST",
      body: JSON.stringify({ paymentIntentId }),
    }),
}

// Wishlist APIs

export const wishlistApi = {
  getWishlist: () => fetcher("/api/wishlist", { cache: "no-store" }),

  addToWishlist: (productId: string) =>
    fetcher("/api/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId }),
    }),

  removeFromWishlist: (productId: string) =>
    fetcher(`/api/wishlist/${productId}`, {
      method: "DELETE",
    }),

  clearWishlist: () => fetcher("/api/wishlist", { method: "DELETE" }),

  syncWishlist: (productIds: string[]) =>
    fetcher("/api/wishlist/sync", {
      method: "POST",
      body: JSON.stringify({ productIds }),
    }),
}

// Contact API
export const contactApi = {
  sendInquiry: (data: any) =>
    fetcher("/api/contact", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Site Settings API
export const siteApi = {
  getSettings: () => fetcher("/api/settings", { cache: "no-store" }),
}