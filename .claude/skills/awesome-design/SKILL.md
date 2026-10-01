---
name: awesome-design
description: Apply a real brand's design system (colors, typography, spacing, components) from the awesome-design-md collection. Use when asked to build or restyle UI "like Stripe/Linear/Vercel/Revolut…", to pick a visual direction, or to write a DESIGN.md for this app.
---

# Awesome Design (DESIGN.md library)

Source: [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) (MIT). Files are fetched on demand, not vendored.

## How to use

1. Pick the brand(s) matching the request. If none is named, suggest 2–3 that fit a budgeting/fintech app (e.g. `revolut`, `wise`, `stripe`, `linear.app`) and let the user choose.
2. Fetch the design system with WebFetch:
   `https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/<brand>/DESIGN.md`
3. Map its tokens onto this project's existing styling setup (theme/CSS variables, Tailwind config, component library) instead of hard-coding values in components.
4. Keep accessibility intact: WCAG AA contrast, visible focus states, and existing semantics.

To create a DESIGN.md for this app, use a fetched file as the template and fill it with this project's actual tokens.

## Available brands

`airbnb`, `airtable`, `apple`, `binance`, `bmw`, `bmw-m`, `bugatti`, `cal`, `claude`, `clay`, `clickhouse`, `cohere`, `coinbase`, `composio`, `cursor`, `dell-1996`, `elevenlabs`, `expo`, `ferrari`, `figma`, `framer`, `hashicorp`, `hp`, `ibm`, `intercom`, `kraken`, `lamborghini`, `linear.app`, `lovable`, `mastercard`, `meta`, `minimax`, `mintlify`, `miro`, `mistral.ai`, `mongodb`, `nike`, `nintendo-2001`, `notion`, `nvidia`, `ollama`, `opencode.ai`, `pinterest`, `playstation`, `posthog`, `raycast`, `renault`, `replicate`, `resend`, `revolut`, `runwayml`, `sanity`, `sentry`, `shopify`, `slack`, `spacex`, `spotify`, `starbucks`, `stripe`, `supabase`, `superhuman`, `tesla`, `theverge`, `together.ai`, `uber`, `vercel`, `vodafone`, `voltagent`, `warp`, `webflow`, `wired`, `wise`, `x.ai`, `zapier`
