# Pedro Operations & Agents Hub

A bilingual (English / Portuguese) Next.js application serving as the Single Source of Truth (SSOT) for **Project Pedro**. This repository houses Pedro's paid media workflows (Google Ads, Meta Ads, GTM), operational rules, and the blueprint registry for future AI agents and automations.

---

## 🎯 Project Goals

1. **Centralize Documentation:** Replace scattered Claude chats and client spreadsheets with version-controlled, clean local documentation (the "Fichas" and Rules).
2. **Bilingual Support:** Full support for English (`en`) and Portuguese (`pt`) workflows.
3. **Agent & Automation Blueprint:** Clearly define inputs, outputs, tech stack, and autonomy levels for every repetitive task so they can be systematically automated or handed off to AI agents.
4. **Local-First Architecture:** All docs, rules, and agent definitions live directly in the repository under `/content`, minimizing external database dependencies for the documentation phase.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router, Server Components)
- **Styling:** Tailwind CSS + Radix UI primitives
- **Localization:** `next-intl` (URL-based routing: `/en/...` and `/pt/...`)
- **Icons:** `lucide-react`
- **Data Source:** Local static JSON files stored in `/content`
- **Package Manager:** `pnpm`

---

## 📁 Repository Structure

```text
├── content/                     # SSOT for documentation, agents, and rules
│   ├── agents/                  # AI Agents & Automation registries (en.json, pt.json)
│   ├── docs/                    # Workflow Fichas organized by locale (en/ and pt/)
│   └── rules/                   # SMKT Strict Rules and Contradiction matrices
├── src/
│   ├── app/                     # Next.js App Router (bilingual [locale] routes)
│   ├── components/              # Reusable UI components (AgentCard, etc.)
│   └── lib/                     # Content readers and utility functions
├── i18n/                        # Internationalization routing config
└── messages/                    # UI translation strings (en.json, pt.json)
```
