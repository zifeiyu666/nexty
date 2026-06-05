import { apiResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth/server";
import { getErrorMessage } from "@/lib/error-utils";
import { getPayPalPlan, isPayPalEnabled } from "@/lib/paypal";

interface VerifyPlanRequest {
  planId: string;
}

/**
 * Verify whether a PayPal Billing Plan ID is valid.
 * POST /api/admin/paypal/verify-plan
 */
export async function POST(req: Request) {
  // 1. Make sure the user is signed in
  const session = await getSession();
  const user = session?.user;
  if (!user) {
    return apiResponse.unauthorized();
  }

  // 2. Make sure the user is an admin
  if (user.role !== "admin") {
    return apiResponse.forbidden("Admin access required.");
  }

  // 3. Make sure PayPal is enabled
  if (!isPayPalEnabled) {
    return apiResponse.serverError("PayPal is not configured.");
  }

  // 4. Parse the request body
  let requestData: VerifyPlanRequest;
  try {
    requestData = await req.json();
  } catch (error) {
    console.error("[PayPal Verify Plan] Invalid request body:", error);
    return apiResponse.badRequest("Invalid request body.");
  }

  const { planId } = requestData;

  if (!planId) {
    return apiResponse.badRequest("Missing planId.");
  }

  try {
    // 5. Call the PayPal API to verify the Plan ID
    const plan = await getPayPalPlan(planId);

    // 6. Return the plan details
    return apiResponse.success({
      id: plan.id,
      name: plan.name,
      status: plan.status,
      description: plan.description,
      billingCycles: plan.billing_cycles.map((cycle) => ({
        frequency: cycle.frequency,
        tenureType: cycle.tenure_type,
        sequence: cycle.sequence,
        totalCycles: cycle.total_cycles,
        price: cycle.pricing_scheme.fixed_price,
      })),
    });
  } catch (error) {
    console.error("[PayPal Verify Plan] Error:", error);

    // The ApiError thrown by the PayPal SDK carries a statusCode directly
    const statusCode =
      error && typeof error === "object" && "statusCode" in error
        ? (error as { statusCode?: number }).statusCode
        : undefined;

    if (statusCode === 404) {
      const env = process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT === "live" ? "live" : "sandbox";
      return apiResponse.notFound(
        `PayPal Plan "${planId}" not found in ${env} environment. Please check the Plan ID and make sure NEXT_PUBLIC_PAYPAL_ENVIRONMENT matches where the plan was created.`
      );
    }

    const errorMessage = getErrorMessage(error) || `PayPal API error (status ${statusCode ?? "unknown"})`;
    return apiResponse.serverError(`Failed to verify PayPal plan: ${errorMessage}`);
  }
}
