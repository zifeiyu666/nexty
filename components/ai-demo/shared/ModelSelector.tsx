"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AI_PROVIDERS } from "@/config/ai-providers";

interface ModelOption {
  provider: string;
  id: string;
  name: string;
}

interface ModelSelectorProps {
  models: ModelOption[];
  value: { provider: string; modelId: string } | null;
  onChange: (value: { provider: string; modelId: string }) => void;
  disabled?: boolean;
  className?: string;
}

const constructValue = (provider: string, modelId: string) =>
  `${provider}/${modelId}`;

const parseValue = (value: string) => {
  const parts = value.split("/");
  const provider = parts[0];
  const modelId = parts.slice(1).join("/");
  return { provider, modelId };
};

function groupByProvider(models: ModelOption[]): Record<string, ModelOption[]> {
  return models.reduce(
    (acc, model) => {
      if (!acc[model.provider]) acc[model.provider] = [];
      acc[model.provider].push(model);
      return acc;
    },
    {} as Record<string, ModelOption[]>
  );
}

export default function ModelSelector({
  models,
  value,
  onChange,
  disabled,
  className,
}: ModelSelectorProps) {
  const grouped = groupByProvider(models);
  const providers = Object.keys(grouped);
  const selectedValue = value
    ? constructValue(value.provider, value.modelId)
    : undefined;

  const currentModel = value
    ? models.find((m) => m.provider === value.provider && m.id === value.modelId)
    : null;

  return (
    <Select
      value={selectedValue}
      onValueChange={(v) => onChange(parseValue(v))}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select a model">
          {currentModel?.name || "Select a model"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {providers.map((providerId, index) => (
          <SelectGroup key={providerId}>
            <SelectLabel className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
              {AI_PROVIDERS[providerId]?.name || providerId}
            </SelectLabel>
            {grouped[providerId].map((model) => (
              <SelectItem
                key={constructValue(model.provider, model.id)}
                value={constructValue(model.provider, model.id)}
                className="pl-4"
              >
                {model.name}
              </SelectItem>
            ))}
            {index < providers.length - 1 && <SelectSeparator className="my-1" />}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
