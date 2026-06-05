# Money Calculation Safety

JavaScript uses IEEE 754 floats, causing precision loss. **Always use integers (cents).**

## Core Rules

```typescript
// ❌ Wrong: floats
const total = 19.99 * 3; // 59.97000000000001

// ✅ Correct: integers (cents)
const totalCents = 1999 * 3; // 5997
```

## Conversions

```typescript
import { toCurrencyAmount, toCents } from '@/lib/payments/webhook-helpers';

toCurrencyAmount(1999); // "19.99"
toCents("19.99");       // 1999
```

## Common Pitfalls

| Pitfall | Wrong | Correct |
|---------|-------|---------|
| Comparison | `0.1 + 0.2 === 0.3` (false!) | Compare integers |
| Percentage | `99.99 * 0.15` | `Math.round(9999 * 15 / 100)` |
| Division | `100 / 3` | `Math.floor(10000 / 3)` + remainder |
| Accumulation | `sum += item.price` | `sum += item.priceCents` |

## Database

- Use `integer` type for amount fields (in cents)
- Naming: `amountCents`, `totalCents`

## Payment Providers

- **Stripe**: Uses cents natively, no conversion needed
- **Creem**: May return strings, use `toCents()` to convert
