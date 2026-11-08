# Feature ownership

Feature code is grouped by business workflow. Shared UI primitives belong in
`src/components/ui`, while shared HTTP configuration belongs in `src/services`.

## Vu Duc Loc

- `fees/management`: create, update, and delete fee UI.
- `transactions/services`: shared transaction retrieval and response normalization.

## Hoang Minh Tuan

- `fees/payment-selection`: choose an apartment and select its unpaid fee entries for review.
- `transactions/query-request`: view pending/paid fee entries and totals for an apartment.

The current backend only supports apartment/fee retrieval for Accountant/Admin. It
does not expose a resident profile, a payment endpoint, or a persisted query-request
endpoint. The two new screens therefore provide read-only selection and lookup;
they do not mark fees as paid or submit requests.

Each UI feature keeps page-level components in `pages`, reusable local
components in `components`, and feature-specific API calls in `services`.
