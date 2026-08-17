# ViSearch JavaScript SDK

Type-passthrough SDK for the ViSearch/Rezolve product search API — it declares the shape of backend search responses but does not transform, validate, or otherwise act on them at runtime.

## Language

**Product**:
A single search result item returned by the backend, identified by `product_id`.
_Avoid_: Item, result (ambiguous with a response's `result` list)

**Alternatives**:
Other `Product` entries paired with a result by pairing-rule search APIs (e.g. outfit recommendations, complementary search).
_Avoid_: Variants (a different mechanism, see below)

**Variants**:
Other `Product` entries collapsed into a result by a separate backend deduping mechanism. Same shape as `alternatives`, populated differently.
_Avoid_: Confusing with `alternatives` (pairing-rule APIs, not deduping); confusing with this SDK's own `group_by_key` → `group_results` feature (an unrelated, older mechanism that groups the top-level response list, not individual products); confusing with an A/B-test "variant" (an experiment arm) — a concept this SDK doesn't have, but some consumers (e.g. bazooka-web) do.
