import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { pricingPlans as pricingPlansSchema } from "@/lib/db/schema";
import { isRecurringPaymentType } from "@/lib/payments/provider-utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { PriceListActions } from "./PriceListActions";

type PricingPlan = typeof pricingPlansSchema.$inferSelect;

export const columns: ColumnDef<PricingPlan>[] = [
  {
    accessorKey: "environment",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Environment
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const environment = row.getValue("environment") as string;
      const variant = environment === "live" ? "default" : "secondary";
      return (
        <Badge variant={variant} className="capitalize">
          {environment}
        </Badge>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "cardTitle",
    header: "Title",
    minSize: 200,
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("cardTitle")}</span>
    ),
  },
  {
    accessorKey: "groupSlug",
    header: "Group",
    minSize: 100,
    cell: ({ row }) => {
      const groupSlug = row.getValue("groupSlug") as string;
      return (
        <Badge variant="outline" className="font-mono text-xs">
          {groupSlug}
        </Badge>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return isActive ? (
        <Badge variant="default">Active</Badge>
      ) : (
        <Badge variant="destructive">Inactive</Badge>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "provider",
    header: "Provider",
    minSize: 100,
    cell: ({ row }) => {
      const plan = row.original;
      const provider = plan.provider;

      if (!provider || provider === "none") {
        return <span className="text-muted-foreground text-sm">-</span>;
      }

      return (
        <Badge variant="outline" className="capitalize">
          {provider}
        </Badge>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "priceIdOrProductId",
    header: "Price ID or Product ID",
    minSize: 200,
    cell: ({ row }) => {
      const plan = row.original;
      const provider = plan.provider;
      const stripePriceId = plan.stripePriceId;
      const creemProductId = plan.creemProductId;
      const environment = plan.environment;

      if (!provider || provider === "none") {
        return <span className="text-muted-foreground text-sm">-</span>;
      }

      const stripeLink =
        provider === "stripe" && stripePriceId
          ? `https://dashboard.stripe.com/${
              environment === "live" ? "" : "test/"
            }prices/${stripePriceId}`
          : null;

      const creemLink =
        provider === "creem" && creemProductId
          ? `https://www.creem.io/dashboard/products`
          : null;

      return (
        <div className="flex flex-col gap-1">
          {stripeLink && (
            <Link
              href={stripeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs"
            >
              {stripePriceId}{" "}
              <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
            </Link>
          )}
          {creemLink && (
            <Link
              href={creemLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs"
            >
              {creemProductId}{" "}
              <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
            </Link>
          )}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "price",
    header: "Price",
    minSize: 200,
    cell: ({ row }) => {
      const plan = row.original;
      const displayPrice = plan.displayPrice;
      const originalPrice = plan.originalPrice;
      const currency = plan.currency;

      if (!displayPrice) {
        return <span className="text-muted-foreground">-</span>;
      }

      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            {originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {originalPrice}
              </span>
            )}
            <span className="font-medium">{displayPrice}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {currency && (
              <span className="text-xs text-muted-foreground">
                {currency.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "promoCode",
    header: "Promo Code",
    minSize: 100,
    cell: ({ row }) => {
      const plan = row.original;
      const stripeCouponId = plan.stripeCouponId;
      const creemDiscountCode = plan.creemDiscountCode;
      const provider = plan.provider;

      const couponOrDiscountCode =
        provider === "stripe"
          ? stripeCouponId
          : provider === "creem"
            ? creemDiscountCode
            : null;

      if (!couponOrDiscountCode) {
        return <span className="text-muted-foreground">-</span>;
      }

      return (
        <Badge variant="outline" className="text-xs">
          {couponOrDiscountCode}
        </Badge>
      );
    },
  },
  {
    accessorKey: "paymentType",
    header: "Payment Type",
    minSize: 150,
    cell: ({ row }) => {
      const paymentType = row.getValue("paymentType") as string | null;
      const interval = row.original.recurringInterval;

      if (!paymentType) {
        return <span className="text-muted-foreground">-</span>;
      }

      // Only show interval for recurring payment types
      if (isRecurringPaymentType(paymentType) && interval) {
        return (
          <span className="text-sm">
            {paymentType}({interval})
          </span>
        );
      }

      return <span className="text-sm">{paymentType}</span>;
    },
  },
  {
    accessorKey: "features",
    header: "Features",
    cell: ({ row }) => {
      const features = row.getValue("features") as unknown[] | null;
      if (!features || !Array.isArray(features) || features.length === 0) {
        return <span className="text-muted-foreground text-sm">-</span>;
      }
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="text-xs">
                {features.length} feature{features.length > 1 ? "s" : ""}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <div className="space-y-1">
                {features.slice(0, 5).map((feature: any, idx: number) => (
                  <div key={idx} className="text-xs">
                    {typeof feature === "string"
                      ? feature
                      : feature?.text || JSON.stringify(feature)}
                  </div>
                ))}
                {features.length > 5 && (
                  <div className="text-xs text-muted-foreground">
                    +{features.length - 5} more
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "displayOrder",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-center w-full justify-center"
        >
          Order
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("displayOrder")}</div>;
    },
    enableSorting: true,
    size: 50,
  },
  {
    accessorKey: "benefitsJsonb",
    header: "Benefits",
    minSize: 200,
    cell: ({ row }) => {
      const benefits = row.getValue("benefitsJsonb") as object | null;
      const benefitsCount =
        benefits && typeof benefits === "object"
          ? Object.keys(benefits).length
          : 0;

      if (benefitsCount === 0) {
        return <span className="text-muted-foreground text-sm">-</span>;
      }

      const benefitsString = JSON.stringify(benefits);
      const displayString =
        benefitsString.length > 40
          ? benefitsString.substring(0, 37) + "..."
          : benefitsString;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="text-xs">
                {benefitsCount} benefit{benefitsCount > 1 ? "s" : ""}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(benefits, null, 2)}
              </pre>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableSorting: false,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const plan = row.original;

      return <PriceListActions plan={plan as PricingPlan} />;
    },
    enableSorting: false,
    enableHiding: false,
  },
];
