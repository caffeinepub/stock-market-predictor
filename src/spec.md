# Specification

## Summary
**Goal:** Fix prediction data loading issues and expand stock search coverage to include 100+ NSE-traded stocks.

**Planned changes:**
- Fix prediction data retrieval logic to properly fetch and display predictions when users search for stocks
- Add proper loading and error state handling for prediction data queries
- Expand stock autocomplete list from 30 to 100+ NSE-traded stocks across various sectors
- Populate backend predictions map with valid sample data for all stocks in the expanded autocomplete list
- Ensure each prediction includes score, confidence level, timestamp, and contributing factors

**User-visible outcome:** Users can search for a much wider range of NSE stocks (100+) and see prediction data load reliably for any selected stock, with proper loading indicators and error messages when applicable.
