"use client";

import type { CreditLog } from "@/actions/usage/logs";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";

const formatLogType = (type: string, t: (key: string) => string) => {
  switch (type) {
    case "one_time_purchase":
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          {t("type_one_time_purchase")}
        </Badge>
      );
    case "subscription_grant":
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          {t("type_subscription_grant")}
        </Badge>
      );
    case "feature_usage":
      return <Badge variant="secondary">{t("type_feature_usage")}</Badge>;
    case "refund_revoke":
      return <Badge variant="destructive">{t("type_refund_revoke")}</Badge>;
    case "subscription_ended_revoke":
      return (
        <Badge variant="destructive">
          {t("type_subscription_ended_revoke")}
        </Badge>
      );
    case "welcome_bonus":
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          {t("type_welcome_bonus")}
        </Badge>
      );
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

export const getColumns = (
  t: (key: string) => string
): ColumnDef<CreditLog>[] => [
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => (
      <div>
        {dayjs(row.getValue("createdAt")).format("YYYY-MM-DD HH:mm:ss")}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => formatLogType(row.getValue("type"), t),
  },
  {
    accessorKey: "notes",
    header: "Details",
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="max-w-[200px] truncate">
              {row.getValue("notes")}
            </div>
          </TooltipTrigger>
          <TooltipContent>{row.getValue("notes")}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = amount > 0 ? `+${amount}` : amount.toString();
      return (
        <div
          className={`font-medium ${
            amount > 0 ? "text-green-600" : "text-destructive"
          }`}
        >
          {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: "oneTimeCreditsSnapshot",
    header: "One-Time Balance After",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {row.getValue("oneTimeCreditsSnapshot")}
      </div>
    ),
  },
  {
    accessorKey: "subscriptionCreditsSnapshot",
    header: "Subscription Balance After",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {row.getValue("subscriptionCreditsSnapshot")}
      </div>
    ),
  },
];
