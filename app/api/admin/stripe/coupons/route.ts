import { apiResponse } from "@/lib/api-response";
import { isAdmin } from "@/lib/auth/server";
import { getErrorMessage } from "@/lib/error-utils";
import { stripe } from "@/lib/stripe";
import { NextRequest } from "next/server";
import Stripe from "stripe";

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return apiResponse.forbidden("Admin privileges required.");
  }

  if (!stripe) {
    return apiResponse.serverError('Stripe is not initialized. Please check your environment variables.');
  }

  try {
    let coupons: Stripe.Coupon[] = [];
    let hasMore = true;
    let startingAfter: string | undefined = undefined;

    while (hasMore) {
      const response: Stripe.ApiList<Stripe.Coupon> =
        await stripe.coupons.list({
          limit: 100,
          starting_after: startingAfter,
        });

      coupons = coupons.concat(response.data);
      hasMore = response.has_more;
      if (hasMore) {
        startingAfter = response.data[response.data.length - 1].id;
      }
    }

    const validCoupons = coupons.filter((c) => c.valid);

    return apiResponse.success({ coupons: validCoupons });
  } catch (error) {
    console.error("Error fetching Stripe coupons:", error);
    const errorMessage = getErrorMessage(error);
    return apiResponse.serverError(errorMessage);
  }
} 