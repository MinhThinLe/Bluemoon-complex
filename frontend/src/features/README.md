# Feature ownership

Feature code is grouped by business workflow. Shared UI primitives belong in
`src/components/ui`, while shared HTTP configuration belongs in `src/services`.

## Vu Duc Loc

- `fees/management`: create, update, and delete fee UI.
- `transactions/services`: transaction retrieval API integration.

## Hoang Minh Tuan

- `fees/payment-selection`: fee selection and payment preparation UI.
- `transactions/query-request`: transaction query request UI.

Each UI feature keeps page-level components in `pages`, reusable local
components in `components`, and feature-specific API calls in `services`.
