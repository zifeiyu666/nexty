"use client";

import { banUser, unbanUser, UserWithSource } from "@/actions/users/admin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

type UserType = UserWithSource;

const BanUserDialog = ({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserType;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [banReason, setBanReason] = useState("");

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setBanReason("");
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban user</DialogTitle>
          <DialogDescription>
            This will immediately ban {user.email || user.id}. You can provide
            an optional reason.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor={`ban-reason-${user.id}`}>Reason (optional)</Label>
          <Textarea
            id={`ban-reason-${user.id}`}
            placeholder="Reason for ban..."
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const res = await banUser({
                  userId: user.id,
                  reason: banReason || undefined,
                });
                if (res.success) {
                  toast.success("User banned");
                  onOpenChange(false);
                  router.refresh();
                } else {
                  toast.error("Failed to ban", {
                    description: res.error,
                  });
                }
              });
            }}
          >
            Confirm ban
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const UnbanUserDialog = ({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserType;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unban user</DialogTitle>
          <DialogDescription>
            Are you sure you want to unban {user.email || user.id}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const res = await unbanUser({ userId: user.id });
                if (res.success) {
                  toast.success("User unbanned");
                  onOpenChange(false);
                  router.refresh();
                } else {
                  toast.error("Failed to unban", {
                    description: res.error,
                  });
                }
              });
            }}
          >
            Unban
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ActionsCell = ({ user }: { user: UserType }) => {
  const [openBan, setOpenBan] = useState(false);
  const [openUnban, setOpenUnban] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(user.id);
              toast.success("Copied to clipboard");
            }}
          >
            Copy user ID
          </DropdownMenuItem>
          {user.banned ? (
            <DropdownMenuItem onClick={() => setOpenUnban(true)}>
              Unban user
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => {
                if (user.role === "admin") {
                  toast.error("Cannot ban admin users");
                  return;
                }
                setOpenBan(true);
              }}
            >
              Ban user
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <BanUserDialog open={openBan} onOpenChange={setOpenBan} user={user} />
      <UnbanUserDialog
        open={openUnban}
        onOpenChange={setOpenUnban}
        user={user}
      />
    </>
  );
};

export const columns: ColumnDef<UserType>[] = [
  {
    id: "user",
    header: "User",
    cell: ({ row }) => {
      const { image, name, email, role } = row.original;
      const displayName = name || email;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={image || undefined} alt={displayName} />
            <AvatarFallback>{displayName[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-medium">{name || ""}</span>
              {role === "admin" && (
                <span className="text-xs capitalize text-primary font-medium">
                  ({role})
                </span>
              )}
            </div>
            <span
              className="text-sm text-muted-foreground cursor-pointer hover:underline"
              onClick={() => {
                navigator.clipboard.writeText(email);
                toast.success("Copied to clipboard");
              }}
            >
              {email}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "affCode",
    header: "Affiliate Code",
    cell: ({ row }) => {
      const affCode = row.original.affCode;
      return (
        <span className="text-sm text-muted-foreground">{affCode || "-"}</span>
      );
    },
  },
  {
    id: "utm",
    header: "UTM",
    cell: ({ row }) => {
      const { utmSource, utmMedium, utmCampaign, utmTerm, utmContent } =
        row.original;

      const utmParts: string[] = [];
      if (utmSource) utmParts.push(`source: ${utmSource}`);
      if (utmMedium) utmParts.push(`medium: ${utmMedium}`);
      if (utmCampaign) utmParts.push(`campaign: ${utmCampaign}`);
      if (utmTerm) utmParts.push(`term: ${utmTerm}`);
      if (utmContent) utmParts.push(`content: ${utmContent}`);

      if (utmParts.length === 0) {
        return <span className="text-sm text-muted-foreground">-</span>;
      }

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-sm max-w-[200px] truncate cursor-default">
                {utmSource || utmMedium || utmCampaign || "-"}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <div className="space-y-1 text-xs">
                {utmParts.map((part, idx) => (
                  <div key={idx}>{part}</div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "referrer",
    header: "Referrer",
    cell: ({ row }) => {
      const referrer = row.original.referrer;
      if (!referrer) {
        return <span className="text-sm text-muted-foreground">-</span>;
      }
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm max-w-[150px] truncate block cursor-default">
                {referrer}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-md break-all">
              <p>{referrer}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "countryCode",
    header: "Country",
    cell: ({ row }) => {
      const countryCode = row.original.countryCode;
      return (
        <span className="text-sm text-muted-foreground">
          {countryCode || "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "browser",
    header: "Browser",
    cell: ({ row }) => {
      const browser = row.original.browser;
      return (
        <span className="text-sm text-muted-foreground">{browser || "-"}</span>
      );
    },
  },
  {
    accessorKey: "os",
    header: "OS",
    cell: ({ row }) => {
      const os = row.original.os;
      return <span className="text-sm text-muted-foreground">{os || "-"}</span>;
    },
  },
  {
    id: "device",
    header: "Device",
    cell: ({ row }) => {
      const { deviceType, deviceBrand, deviceModel } = row.original;

      const deviceParts: string[] = [];
      if (deviceType) deviceParts.push(deviceType);
      if (deviceBrand) deviceParts.push(deviceBrand);
      if (deviceModel) deviceParts.push(deviceModel);

      if (deviceParts.length === 0) {
        return <span className="text-sm text-muted-foreground">-</span>;
      }

      const displayText = deviceParts[0];
      const fullText = deviceParts.join(" / ");

      return <span className="text-sm text-muted-foreground">{fullText}</span>;
    },
  },
  {
    accessorKey: "language",
    header: "Language",
    cell: ({ row }) => {
      const language = row.original.language;
      return (
        <span className="text-sm text-muted-foreground">{language || "-"}</span>
      );
    },
  },
  {
    accessorKey: "stripeCustomerId",
    header: "Stripe Customer ID",
    cell: ({ row }) => (
      <span
        className="cursor-pointer"
        onClick={() => {
          navigator.clipboard.writeText(row.original.stripeCustomerId || "");
          toast.success("Copied to clipboard");
        }}
      >
        {row.original.stripeCustomerId || "-"}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => dayjs(row.original.createdAt).format("YYYY-MM-DD HH:mm"),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ActionsCell user={row.original} />,
  },
];
