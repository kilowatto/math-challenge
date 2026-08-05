# Lean 4 local spike

This directory is a non-production experiment for issue #424. It deliberately
contains no Worker route, no model call, no user-submitted code path, and no
deployment configuration.

## Run locally

Install a pinned Lean 4 toolchain separately, then run:

```sh
lean Main.lean
```

The command must exit successfully for the two theorems in `Main.lean`. If the
project later adopts dependencies such as mathlib, use a pinned Lake project
and run `lake env lean Main.lean`; do not resolve packages during a player
request.

## Findings

Workers AI is suitable for generating a candidate proof or explaining a
compiler error. It is text generation, even when the selected model supports
structured output; it is not the final mathematical verifier. The final
verdict must come from Lean compiling the submitted term.

Lean's standard build tool is Lake, which builds Lean sources and dependencies.
That makes a local or isolated service the natural place for verification, not
the current Worker runtime. A future service would need a pinned toolchain,
allowlisted imports, no network, an ephemeral filesystem, a CPU/memory limit,
and a hard compile timeout. The service must return only a bounded diagnostic
and verdict, never execute arbitrary generated binaries.

## Comparison

| Option | Strength | Risk or cost | Decision |
|---|---|---|---|
| Workers AI | Already integrated; pay-per-use; useful for proof drafts and explanations | Model output is untrusted text; current model availability and limits can change | Assistive only |
| Lean in a local sandbox | Deterministic proof verdict; exact compiler diagnostics | Toolchain image, isolation, cold starts and authoring cost | Prototype target |
| Managed Lean verifier | Can centralize sandbox operations and telemetry | New vendor, data boundary, recurring cost and dependency | Do not select yet |

## Decision

Keep the Lean path additive and off by default. Do not add a provider, create a
Cloudflare resource, send child work to a model, or deploy a verifier from this
spike. The next decision requires measured compile time and resource usage from
a pinned sandbox against a small authored corpus; until then, existing
auto-gradable N11–N12 formats remain the product path.

References: [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/),
[Workers AI model catalog](https://developers.cloudflare.com/workers-ai/models/),
and [Lean Lake](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Lake/).
