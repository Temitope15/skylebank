# Milestone 3 Report: Wallet Provisioning & Dashboard UI

**Status:** Completed  
**Completed Date:** 2026-07-05  

---

## Completed Work

### 1. Database Schema
- **Flyway Migration `V4__create_wallets_table.sql`**: Added `wallets` table referencing the `users` table via `UUID` constraint.
  - Implemented NGN as default currency code.
  - Configured standard starter balance of `1,000,000.00` NGN for development testing.
  - Configured status string defaulted to `ACTIVE`.

### 2. Backend Provisioning Architecture
- **Wallet Entity & Repository (`Wallet.java`, `WalletRepository.java`)**: Configured standard JPA mappings, lifecycle event hooks (`@PrePersist`, `@PreUpdate` auditing), and email lookup queries.
- **NUBAN Generator (`NubanGenerator.java`)**: Implements the CBN algorithm utilizing mock bank code `000101`, standard weights `[3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3]`, and calculating check digit.
- **Wallet Provisioning Listener (`WalletProvisioningListener.java`)**: Listens for the backend registration `UserRegisteredEvent` to automatically generate unique 10-digit NUBAN numbers, handling collision retries.
- **Wallet Service & Controller (`WalletService.java`, `WalletController.java`)**: Exposes REST endpoints to fetch logged-in user wallet details (`GET /api/v1/wallet`) and wallet balance (`GET /api/v1/wallet/balance`).

### 3. Frontend Dashboard & Wallet Screens
- **Wallet State Services (`wallet.ts`, `walletService.ts`)**: Integrated Axios client request hooks and type definitions.
- **High-Fidelity Dashboard Page (`Dashboard.tsx`)**: Displays:
  - Welcome greeting: "Hello, Adejare 👋"
  - Visually stunning credit card mockup featuring available Naira balance (₦1,000,000.00) with a show/hide toggle.
  - Formatted NUBAN number (`583 244 2394`) and click-to-copy button.
  - Account Limits widget (KYC status Tier 1 Savings, Daily Limit ₦50,000.00).
- **Wallet Details Screen (`Wallet.tsx`)**: Integrates direct deposit banking instructions, sandbox warnings, and future multi-currency/virtual debit card placeholders.

---

## Technical Decisions Made

1. **UUID Constraint**: Fixed `user_id` type in migration file to match the user primary key `UUID` (instead of long/bigint), avoiding referential errors.
2. **Automated Event-driven Wallet Creation**: Leveraged Spring Boot event-listeners (`UserRegisteredEvent`) to encapsulate user registrations from wallet creations.
3. **Show/Hide Balance Toggle**: Added balance visibility toggle to protect user privacy.

---

## Verification Run Commands

To verify compile compliance and unit testing of the wallet modules:

```bash
# Verify Backend Compilation & Launch Dev Server
./run-backend.sh dev

# Verify Frontend Server
cd skylebank-frontend
npm run build
```
