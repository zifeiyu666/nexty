---
name: nexty-new-component
description: Create React components in NEXTY.DEV template. Use when building UI components, client components with hooks, or extending shadcn/ui. Covers component structure, props typing, and composition patterns.
---

# Creating React Components in NEXTY.DEV

## Component Organization

```
components/
├── ui/             # shadcn/ui primitives (Button, Input, Dialog...)
├── shared/         # Reusable components across features
├── auth/           # Auth-related components
├── cms/            # Blog/CMS components
├── pricing/        # Pricing-related components
├── header/         # Header and navigation
├── footer/         # Footer components
└── [feature]/      # Feature-specific components
```

## Component Templates

### Server Component (Default)

```typescript
// components/my-feature/MyComponent.tsx
import { cn } from '@/lib/utils';

interface MyComponentProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function MyComponent({
  title,
  description,
  className,
  children,
}: MyComponentProps) {
  return (
    <div className={cn('p-4 rounded-lg border', className)}>
      <h3 className="font-semibold">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  );
}
```

### Client Component with State

```typescript
// components/my-feature/MyInteractiveComponent.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface MyInteractiveComponentProps {
  initialValue?: string;
  onSubmit: (value: string) => Promise<void>;
}

export function MyInteractiveComponent({
  initialValue = '',
  onSubmit,
}: MyInteractiveComponentProps) {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!value.trim()) {
      toast.error('Value is required');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(value);
      toast.success('Saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter value..."
        disabled={isLoading}
      />
      <Button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );
}
```

### Form Component with Server Action

```typescript
// components/my-feature/MyForm.tsx
'use client';

import { createItem } from '@/actions/my-feature';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';

interface MyFormProps {
  onSuccess?: () => void;
}

export function MyForm({ onSuccess }: MyFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setIsLoading(true);
    try {
      const result = await createItem({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
      });

      if (result.success) {
        toast.success('Created successfully');
        onSuccess?.();
      } else {
        toast.error(result.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create'}
      </Button>
    </form>
  );
}
```

### Data Table Column Definition

```typescript
// app/[locale]/(protected)/dashboard/(admin)/my-feature/Columns.tsx
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

export type MyItem = {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: Date;
};

export const columns: ColumnDef<MyItem>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge variant={status === 'active' ? 'default' : 'secondary'}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDistanceToNow(new Date(row.getValue('createdAt')), {
          addSuffix: true,
        })}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Button variant="ghost" size="sm">
        Edit
      </Button>
    ),
  },
];
```

### Dialog Component

```typescript
// components/my-feature/MyDialog.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface MyDialogProps {
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function MyDialog({
  trigger,
  title,
  description,
  children,
}: MyDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Open</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
```

## Common UI Components

Import from `@/components/ui/`:

- `Button` - Primary action buttons
- `Input`, `Textarea` - Form inputs
- `Label` - Form labels
- `Select` - Dropdown selections
- `Dialog` - Modal dialogs
- `Card` - Content containers
- `Badge` - Status indicators
- `Table` - Data tables
- `Tabs` - Tab navigation
- `Toast` - Use `toast` from `sonner`
- `Skeleton` - Loading placeholders

## Styling Patterns

### Using cn() for conditional classes

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  'base-class',
  isActive && 'active-class',
  variant === 'large' && 'text-lg',
  className // Allow overrides from props
)} />
```

### Responsive design

```typescript
<div className="
  flex flex-col     // Mobile default
  md:flex-row       // Tablet and up
  lg:gap-8          // Desktop spacing
" />
```

## Checklist

1. Decide: Server or Client Component
2. Define props interface with TypeScript
3. Use `cn()` for className composition
4. Add `'use client'` only when needed
5. Handle loading and error states
6. Use shadcn/ui components when available
7. Follow existing naming conventions

