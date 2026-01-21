# Universal AIQ Framework

A standardized, evidence-based system for measuring individual AI competency.

[![Try the Assessment](https://img.shields.io/badge/Try_the_Assessment-Live_Site-blue?style=for-the-badge)](https://sagearbor.github.io/ai-skill-eval-kit/)

> **Take the AIQ Assessment now:** https://sagearbor.github.io/ai-skill-eval-kit/

## What is AIQ?

A single 0-100 score that answers: *"Can this person actually use AI well, safely, and productively?"*

### Key Features
- **Five SCOREs Dimensions:** Study, Copy, Output, Research, Ethical Security (S-C-O-R-Es)
- **Time-Decay Modeling:** Skills depreciate as AI evolves (tool-specific: 1yr half-life → foundational: 10yr)
- **Role-Based Weighting:** Engineers, PMs, Executives, etc. have different skill priorities
- **Evidence Multipliers:** Self-report (0.6x) → Peer-validated (0.8x) → Auto/Audit verified (1.0x)

## Interactive Assessment Tools

The GitHub Pages site provides three verification levels:

| Level | Time | Confidence | What You Get |
|-------|------|------------|--------------|
| **1. Self** | 5 min | LOW (0.6x) | Quick self-assessment with downloadable JSON/PDF report |
| **2. Peer** | 30 min | MEDIUM (0.8x) | Shareable validation link for peer/manager review |
| **3. Auto/Audit** | 1+ hr | HIGH (1.0x) | Evidence collection guides + metrics capture |

### For Organizations

Collect JSON reports from employees and aggregate them:

```bash
# Aggregate reports from a quarter
python tools/aggregate.py ./assessments/2025-Q1/

# View visual dashboard
# Open tools/dashboard.html (reads aiq_combined.json from same folder)
```

Outputs: CSV summary, org-wide statistics, visual dashboard with score distribution, skill gaps, leaderboard, and trends.

## Repository Structure

```
docs/                              # GitHub Pages site + documentation
├── index.html                     # Landing page with level selection
├── level1.html                    # Self-assessment survey
├── level2.html                    # Peer validation (assessee entry)
├── level2-validate.html           # Peer validation (validator entry)
├── level3.html                    # Evidence collection guides
├── ai_mastery_eval.md             # Framework specification (source of truth)
├── css/                           # Stylesheets
├── js/                            # Client-side logic
├── schemas/
│   └── aiq-report-v1.schema.json  # JSON Schema for report validation
├── tools/
│   ├── aggregate.py               # Python aggregator script
│   ├── dashboard.html             # Visual analytics dashboard
│   └── README.md                  # Org admin instructions
└── specs/
    └── interactive-assessment-tools.md  # Implementation specification

build/                             # Generated outputs (auto-committed)
└── ai_mastery_eval.docx           # Stakeholder-ready Word document

.github/workflows/
└── doc_pipeline.yml               # CI/CD automation
```

## Local Development

### Run the Site Locally
```bash
# Any static file server works
cd docs && python -m http.server 8000
# Visit http://localhost:8000
```

### Build the DOCX (requires Pandoc)
```bash
pandoc docs/ai_mastery_eval.md --reference-doc docs/templates/reference.docx -o build/ai_mastery_eval.docx
```

### Lint Markdown
```bash
npx markdownlint-cli2 "docs/*.md"
```

## Framework Quick Reference

### The Five Dimensions (SCOREs)

| Dimension | What It Measures | Core Question |
|-----------|------------------|---------------|
| **S = Study** | Information diet, conceptual fluency | Where do you learn? |
| **C = Copy** | Evaluation skill, scientific rigor | How do you validate? |
| **O = Output** | Deployment capability, reliability | What have you built? |
| **R = Research** | Innovation, novel methods | What's new because of you? |
| **Es = Ethical Security** | Safety practices, compliance | Are you trustworthy? |

### Score Bands

| Score | Level | Meaning |
|-------|-------|---------|
| 0-20 | Unaware | No meaningful AI adoption |
| 21-40 | User | Basic usage, needs supervision |
| 41-60 | Practitioner | Daily productive use, ~25% efficiency gain |
| 61-80 | Builder | Deploys reliable systems, creates business value |
| 81-95 | Architect | Advances practices, mentors others |
| 96-100 | Pioneer | Industry-recognized contribution |

## Contributing

1. Framework content: Edit `docs/ai_mastery_eval.md`
2. Assessment tools: See `docs/specs/interactive-assessment-tools.md` for implementation details
3. CI/CD auto-generates DOCX on push to main

## License

MIT

---

**Universal AIQ Framework v4.0** | 2025 Edition
