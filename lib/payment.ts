/**
 * Payment provider abstraction.
 * Currently uses a stub that always succeeds.
 * To integrate Stripe:
 * 1. npm install stripe
 * 2. Create a StripePaymentProvider implementing PaymentProvider
 * 3. Update getPaymentProvider() to return it when STRIPE_SECRET_KEY is set
 */

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  error?: string;
}

export interface PaymentProvider {
  createCheckoutSession(order: {
    id: string;
    total: number;
    email: string;
    name: string;
  }): Promise<PaymentResult>;
}

class StubPaymentProvider implements PaymentProvider {
  async createCheckoutSession(order: {
    id: string;
    total: number;
  }): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `stub_${order.id}_${Date.now()}`,
    };
  }
}

class DisabledPaymentProvider implements PaymentProvider {
  async createCheckoutSession(): Promise<PaymentResult> {
    return {
      success: false,
      transactionId: "",
      error: "Checkout is temporarily unavailable",
    };
  }
}

export function getPaymentProvider(): PaymentProvider {
  // When ready for real payments:
  // if (process.env.STRIPE_SECRET_KEY) {
  //   return new StripePaymentProvider(process.env.STRIPE_SECRET_KEY);
  // }
  if (
    process.env.NODE_ENV !== "production" ||
    process.env.ALLOW_STUB_PAYMENTS === "true"
  ) {
    return new StubPaymentProvider();
  }

  return new DisabledPaymentProvider();
}
