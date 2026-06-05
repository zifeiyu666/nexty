"use client";

import { Badge } from "@/components/ui/badge";
import { getOrderTypeLabel } from "@/lib/payments/provider-utils";
import dayjs from "dayjs";

export const columns = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }: any) => {
      const id = row.getValue("id") as string;
      return <div className="max-w-[200px] truncate">{id}</div>;
    },
  },
  {
    accessorKey: "provider",
    header: "Provider",
    cell: ({ row }: any) => {
      return <span className="font-mono">{row.original.provider}</span>;
    },
  },
  {
    accessorKey: "providerOrderId",
    header: "Provider Order ID",
    cell: ({ row }: any) => {
      const providerOrderId = row.getValue("providerOrderId") as string;
      return <div className="max-w-[200px] truncate">{providerOrderId}</div>;
    },
  },
  {
    accessorKey: "amountTotal",
    header: "Amount",
    cell: ({ row }: any) => (
      <div className="flex flex-col w-[120px]">
        <span>
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: row.original.currency,
          }).format(Number(row.original.amountTotal))}
        </span>
        {row.original.amountDiscount ? (
          <span className="text-xs text-muted-foreground">
            Discount:{" "}
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: row.original.currency,
            }).format(Number(row.original.amountDiscount))}
          </span>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: "orderType",
    header: "Type",
    cell: ({ row }: any) => (
      <Badge variant="outline">
        {getOrderTypeLabel(row.original.orderType)}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.original.status as string;
      let variant: "secondary" | "destructive" | "outline" = "outline";
      if (status === "succeeded") {
        variant = "secondary";
      } else if (status === "refunded" || status === "partially_refunded") {
        variant = "destructive";
      } else {
        variant = "outline";
      }
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }: any) => {
      const date = row.getValue("createdAt") as string | Date;
      try {
        return date ? (
          <div className="w-[180px]">
            {dayjs(date).format("YYYY-MM-DD HH:mm:ss")}
          </div>
        ) : (
          "-"
        );
      } catch {
        return "-";
      }
    },
  },
] satisfies any;
