# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

The **Universal AIQ Framework** - a standardized, evidence-based system for measuring individual AI competency. Features:
- Five SCOREs dimensions: Study, Copy, Output, Research, Ethical security (S-C-O-R-Es)
- Time-decay modeling for AI skills
- Role-based performance weighting
- Evidence multipliers for confidence ratings

The Markdown-to-DOCX pipeline is infrastructure to produce stakeholder-ready documents; the **framework content itself** is the primary deliverable.

## Repository Organization

**Keep the root directory minimal.** Configuration and build artifacts belong in subdirectories.

```
docs/                          # All documentation content
├── ai_mastery_eval.md        # THE SOURCE OF TRUTH - edit this
├── aiq_assessment_diagrams.md # Visual diagrams (Mermaid + ASCII)
└── templates/
    └── reference.docx        # Pandoc styling template (auto-generated)

build/                         # Generated outputs (DO NOT EDIT)
└── ai_mastery_eval.docx

.github/workflows/
└── doc_pipeline.yml          # CI/CD automation
```

## Build Commands

### Local Build (requires Pandoc)
```bash
pandoc docs/ai_mastery_eval.md --reference-doc docs/templates/reference.docx -o build/ai_mastery_eval.docx
```

### Import Existing DOCX to Markdown
```bash
pandoc -s "your_file.docx" -t markdown -o docs/ai_mastery_eval.md
```

### Lint Markdown
```bash
npx markdownlint-cli2 "docs/*.md"
```

## CI/CD Pipeline

The workflow (`.github/workflows/doc_pipeline.yml`) runs on push to main/master:

1. **Lint** - Validates Markdown via markdownlint
2. **Generate reference.docx** - Creates styling template with table borders via python-docx
3. **Convert** - Runs Pandoc in Docker to produce DOCX
4. **Post-process** - Applies table borders directly to all tables (fallback fix)
5. **Commit** - Auto-commits artifacts back to repo

**Triggers:** Push (docs/*.md changes), daily at 2 AM UTC, manual dispatch

## Table Borders Fix

Pandoc doesn't natively support table borders. The pipeline uses a three-layer approach:
1. Creates a custom "Table" style (Pandoc looks for exactly this name)
2. Updates "Table Grid" style as fallback
3. Post-processes the DOCX to apply borders directly to all table/cell XML

## Framework Content Structure

The main document (`docs/ai_mastery_eval.md`) contains:
- **Parts I-V:** Five dimensions, role weighting, evidence multipliers, time decay, production learning bonus
- **Parts VI-VIII:** Quality controls, implementation levels, appropriate use

**Key design goals for the framework:**
- Self-assessment should be instant (5 min, no prep)
- Higher rigor levels should be as automated as possible
- Avoid institutional bottlenecks (project codes, percentage negotiations)
- Simplicity over precision where tradeoffs exist
