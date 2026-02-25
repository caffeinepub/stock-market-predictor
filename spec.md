# Specification

## Summary
**Goal:** Fix the "Failed to Load Prediction" error by auditing and patching the backend Motoko actor, frontend query hooks, and prediction UI components to handle missing/empty data gracefully.

**Planned changes:**
- Audit and fix backend Motoko query functions (stock predictions, market calls, daily stock picks, options picks) to safely handle empty/missing states without trapping or runtime errors
- Fix `useQueries.ts` hooks to ensure actor is initialized before queries run, resolve type mismatches between Candid responses and frontend types, and display meaningful error messages on failure
- Add null/undefined guards and loading skeleton states to `PredictionResultsPage.tsx` and all child components (`PredictionCard`, `ContributingFactorsSection`, `DailyOptionsPicksSection`, `FiiDiiChart`, `StockPriceChart`, `MarketCallHistoryChart`)
- Ensure chart components handle empty data arrays without crashing and show empty state messages when no prediction data is available

**User-visible outcome:** The Prediction Results page loads successfully without showing the "Failed to Load Prediction" error, displays loading skeletons while fetching, and shows friendly empty states when no data is available.
