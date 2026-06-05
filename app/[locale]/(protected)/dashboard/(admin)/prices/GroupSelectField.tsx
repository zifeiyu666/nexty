"use client";

import { createPricingGroupAction } from "@/actions/prices/groups";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SLUG_REGEX } from "@/lib/pricing/slug";
import { cn } from "@/lib/utils";
import { usePricingGroupStore } from "@/stores/pricingGroupStore";
import { PricingPlanGroup } from "@/types/pricing";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

interface GroupSelectFieldProps {
  form: UseFormReturn<any>;
  disabled?: boolean;
}

export function GroupSelectField({ form, disabled }: GroupSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  const { groups, isLoading, fetchGroups, addGroup } = usePricingGroupStore();

  // Initial load
  useEffect(() => {
    fetchGroups();
  }, []);

  const selectedGroupSlug = form.watch("groupSlug");
  const selectedGroup = groups.find((g) => g.slug === selectedGroupSlug);

  const handleSelectGroup = (group: PricingPlanGroup) => {
    form.setValue("groupSlug", group.slug, { shouldValidate: true });
    setOpen(false);
    setSearchTerm("");
  };

  const handleCreateGroup = async () => {
    const trimmedSlug = searchTerm.trim().toLowerCase();

    if (!trimmedSlug) return;

    if (!SLUG_REGEX.test(trimmedSlug)) {
      toast.error(
        "Slug can only contain lowercase letters, numbers, and hyphens."
      );
      return;
    }

    if (groups.some((g) => g.slug === trimmedSlug)) {
      toast.info(`Group "${trimmedSlug}" already exists.`);
      return;
    }

    startTransition(async () => {
      try {
        const result = await createPricingGroupAction({ slug: trimmedSlug });
        if (result.success) {
          if (result.data) {
            addGroup(result.data);
            form.setValue("groupSlug", result.data.slug, {
              shouldValidate: true,
            });
            setSearchTerm("");
            setOpen(false);
          } else {
            toast.error("Failed to create group: No data returned.");
          }
        } else {
          toast.error("Failed to create group.", { description: result.error });
        }
      } catch (error) {
        toast.error("Failed to create group.");
        console.error("Failed to create group:", error);
      }
    });
  };

  // Filter groups based on search term
  const filteredGroups = groups.filter((group) =>
    group.slug.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  // Check if search term is a valid new slug
  const isValidNewSlug =
    searchTerm.trim() !== "" &&
    SLUG_REGEX.test(searchTerm.trim().toLowerCase()) &&
    !groups.some(
      (g) => g.slug.toLowerCase() === searchTerm.trim().toLowerCase()
    );

  return (
    <FormField
      control={form.control}
      name="groupSlug"
      render={({ field }) => (
        <FormItem className="rounded-md border p-4">
          <FormLabel>Group</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    "w-full justify-between font-mono",
                    !field.value && "text-muted-foreground"
                  )}
                  disabled={disabled || isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </span>
                  ) : selectedGroup ? (
                    selectedGroup.slug
                  ) : field.value ? (
                    field.value
                  ) : (
                    "Select group..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search or create group..."
                  value={searchTerm}
                  onValueChange={(value) => setSearchTerm(value.toLowerCase())}
                />
                <CommandList>
                  {filteredGroups.length === 0 && !isValidNewSlug && (
                    <CommandEmpty>No groups found.</CommandEmpty>
                  )}

                  {isValidNewSlug && (
                    <CommandGroup>
                      <CommandItem
                        onSelect={handleCreateGroup}
                        className="cursor-pointer"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create "{searchTerm.trim().toLowerCase()}"
                        {isPending && (
                          <Loader2 className="ml-2 h-3 w-3 animate-spin" />
                        )}
                      </CommandItem>
                    </CommandGroup>
                  )}

                  {filteredGroups.length > 0 && (
                    <CommandGroup heading="Available Groups">
                      {filteredGroups.map((group) => (
                        <CommandItem
                          key={group.slug}
                          value={group.slug}
                          onSelect={() => handleSelectGroup(group)}
                          className="cursor-pointer font-mono"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value === group.slug
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {group.slug}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormDescription>
            Select or create a group to organize this pricing plan.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
