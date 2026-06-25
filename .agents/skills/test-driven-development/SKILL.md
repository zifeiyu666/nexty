---
name: test-driven-development
description: Use when implementing complex business logic, data mutations, bug fixes, async workflows, permissions, payments, or behavior where automated tests materially reduce risk
---

# Test-Driven Development

## Overview

Automated tests are a confidence tool, not a tax on every edit. Use test-first development when the change has real behavioral risk or when a regression would be expensive to find manually. For simple UI-only work, prefer focused visual/manual verification instead of creating brittle tests that only assert markup.

## When to Use

Use TDD or add automated tests for changes involving:

- Complex business logic, calculations, ranking, eligibility, limits, credits, or pricing
- Data mutations, persistence, migrations, transactions, or cache invalidation
- Auth, permissions, roles, billing, payments, subscriptions, or quota enforcement
- Async workflows such as webhooks, queues, retries, status polling, background jobs, or external API adapters
- Parsing, transformation, validation, media generation, file handling, or other deterministic library code
- Bug fixes where a regression test can reproduce the failing behavior
- Refactors that alter shared behavior, cross-module contracts, or public APIs
- Edge cases that are hard to verify by clicking through the app once

Do not default to writing tests for:

- Pure UI layout, spacing, typography, color, animation, responsive polish, or copy changes
- Component composition changes that do not change user-visible behavior beyond presentation
- Static content, marketing sections, icons, images, or translation text updates
- Styling-library or class-name cleanup with no logic change
- Generated code, configuration tweaks, or throwaway prototypes

For UI-only changes, verify with the right lightweight checks: browser inspection, screenshots when useful, responsive viewport checks, lint/typecheck if relevant, and any existing focused tests that already cover the touched area.

## Risk Gate

Before writing implementation code, classify the change:

| Change type | Default testing expectation |
| --- | --- |
| Pure UI/content/style | No new test required; verify visually or manually |
| Small UI interaction | Add a test only if behavior is non-trivial or easy to regress |
| Business/data/auth/payment/async logic | Write or update automated tests |
| Bug fix in behavior | Prefer a failing regression test first |
| Shared refactor | Cover the contract being preserved |

If the classification is mixed, test the behavioral part and keep the visual part verified manually.

## Test-First Flow

When the risk gate says tests are warranted:

1. Write one minimal failing test for the desired behavior.
2. Run that focused test and confirm it fails for the expected reason.
3. Implement the smallest change that makes the test pass.
4. Re-run the focused test.
5. Run the relevant broader checks before declaring the work complete.

The point is to prove the test can catch the missing behavior. If the first run passes, the test is not proving the new requirement; adjust it or choose a better behavioral assertion.

## Writing Good Tests

Prefer tests that describe user-visible or domain-visible behavior.

<Good>
```typescript
test('marks a webhook task as failed after the final retry', async () => {
  await recordWebhookAttempt({ taskId, status: 'failed', attempt: 3 });

  const task = await getTask(taskId);

  expect(task.status).toBe('failed');
  expect(task.retryable).toBe(false);
});
```
Tests an outcome the system promises.
</Good>

<Bad>
```typescript
test('calls setState', () => {
  expect(setState).toHaveBeenCalled();
});
```
Tests implementation mechanics instead of behavior.
</Bad>

Aim for:

- One behavior per test
- Clear names that explain the rule being protected
- Real code paths where practical
- Mocks only at true system boundaries such as payment providers, email services, or remote media APIs
- Edge cases for high-risk logic: empty input, invalid state, duplicate events, retries, permission failures, and race-prone transitions

## UI Change Guidance

For UI-only work, do not manufacture tests just to satisfy a ritual. Instead:

- Open the affected screen or component when practical
- Check desktop and mobile breakpoints when layout changed
- Confirm text does not overflow or overlap
- Verify obvious interactions manually if the change touches hover, menus, drawers, tabs, forms, or media playback
- Run existing tests only when they are already relevant or fast enough to be useful

Add a UI test when the UI change introduces logic, not just presentation. Examples: conditional rendering from permissions, form validation, multi-step state, persisted preferences, optimistic updates, or accessibility-critical keyboard behavior.

## Bug Fix Guidance

For behavioral bugs, write the smallest failing regression test that reproduces the bug before fixing it when feasible. If the bug is visual-only, browser verification or a screenshot is usually the better evidence.

If reproducing the issue requires an external service or expensive setup, isolate the deterministic boundary and test that. Document any part that was verified manually.

## Verification Checklist

Before marking work complete:

- [ ] Classified the change as UI-only, behavioral, or mixed
- [ ] Added or updated tests when the change touched complex behavior
- [ ] Watched new behavioral tests fail before implementing when using TDD
- [ ] Ran the focused test or relevant existing suite
- [ ] For UI-only work, performed appropriate visual/manual verification
- [ ] Reported what was and was not tested

## Common Mistakes

| Mistake | Better move |
| --- | --- |
| Writing brittle tests for static marketing layout | Verify visually and keep tests for real behavior |
| Skipping tests for payment, auth, webhook, or data logic | Add focused behavioral coverage |
| Testing class names instead of outcomes | Assert visible behavior, state, or domain results |
| Adding broad snapshots for every UI tweak | Use screenshots/manual checks unless there is meaningful behavior |
| Mocking everything | Test real code and mock only external boundaries |
| Treating "tests after" as equivalent for bugs | A failing regression test is stronger when the bug is logic-based |

## Testing Anti-Patterns

When adding mocks or test utilities, read `testing-anti-patterns.md` to avoid common pitfalls:

- Testing mock behavior instead of real behavior
- Adding test-only methods to production classes
- Mocking without understanding dependencies

## Final Rule

Match testing effort to risk:

- UI-only polish: verify the experience, no new test by default
- Complex behavior: protect it with automated tests
- Logic bug: prefer a failing regression test first
