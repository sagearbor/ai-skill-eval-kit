# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

The **Universal AIQ Framework** - a standardized, evidence-based system for measuring individual AI competency. Features:
- Five SCOREs dimensions: Study, Copy, Output, Research, Ethical security (S-C-O-R-Es)
- Time-decay modeling for AI skills
- Role-based performance weighting
- Evidence multipliers for confidence ratings

**Two deliverables:**
1. **Framework documentation** (`docs/ai_mastery_eval.md`) - the specification itself
2. **Interactive assessment tools** (GitHub Pages site) - web-based tools for taking assessments

## Repository Organization

**Keep the root directory minimal.** Configuration and build artifacts belong in subdirectories.

```
docs/                              # GitHub Pages site + all documentation
├── index.html                     # Landing page with level selection
├── level1.html                    # Self-assessment survey
├── level2.html                    # Peer validation (assessee entry)
├── level2-validate.html           # Peer validation (validator entry)
├── level3.html                    # Evidence collection guides + form
├── ai_mastery_eval.md             # THE SOURCE OF TRUTH for framework content
├── css/
│   └── styles.css                 # Shared styles (clean corporate design)
├── js/
│   ├── assessment.js              # L1 survey logic + scoring
│   ├── peer-form.js               # L2 URL encoding/decoding
│   ├── pdf-generator.js           # html2pdf wrapper
│   ├── json-export.js             # JSON report generation
│   └── shared.js                  # Common utilities
├── schemas/
│   └── aiq-report-v1.schema.json  # Formal JSON Schema for validation
├── tools/
│   ├── aggregate.py               # Python script for org-wide aggregation
│   ├── dashboard.html             # Visual analytics dashboard
│   └── README.md                  # Org admin instructions
├── specs/
│   └── interactive-assessment-tools.md  # Full implementation spec
└── templates/
    └── reference.docx             # Pandoc styling template

build/                             # Generated outputs (DO NOT EDIT)
└── ai_mastery_eval.docx

.github/workflows/
└── doc_pipeline.yml               # CI/CD automation
```

## Key Technical Decisions

### Data Format
- **JSON is the primary output** - all three levels output machine-readable JSON
- **Schema versioned** - every report has `schemaVersion: "1.0"` for future compatibility
- **Empty strings for missing data** - not "N/A" (enables numeric aggregation)
- PDFs are secondary human-readable views derived from JSON

### Level 2 Peer Validation
- Uses **URL-encoded state** to pass data without a backend
- Assessee fills form → gets shareable URL with scores encoded
- Validator opens URL → sees claims → confirms/adjusts → both get JSON

### Org Aggregation
- `aggregate.py` reads JSON files from folder(s), outputs CSV + stats
- `dashboard.html` visualizes combined data (Chart.js)
- Folder-per-period convention for trends (`2025-Q1/`, `2025-Q2/`)

## Build Commands

### Run Site Locally
```bash
cd docs && python -m http.server 8000 --bind localhost
```

### Build DOCX (requires Pandoc)
```bash
pandoc docs/ai_mastery_eval.md --reference-doc docs/templates/reference.docx -o build/ai_mastery_eval.docx
```

### Lint Markdown
```bash
npx markdownlint-cli2 "docs/*.md"
```

### Validate JSON Report
```bash
npx ajv validate -s docs/schemas/aiq-report-v1.schema.json -d report.json
```

## CI/CD Pipeline

The workflow (`.github/workflows/doc_pipeline.yml`) runs on push to main/master:

1. **Lint** - Validates Markdown via markdownlint
2. **Generate reference.docx** - Creates styling template with table borders
3. **Convert** - Runs Pandoc in Docker to produce DOCX
4. **Post-process** - Applies table borders directly to all tables
5. **Commit** - Auto-commits artifacts back to repo

**Triggers:** Push (docs/*.md changes), daily at 2 AM UTC, manual dispatch

## Framework Design Goals

- Self-assessment should be instant (5 min, no prep)
- Higher rigor levels should be as automated as possible
- Avoid institutional bottlenecks (project codes, percentage negotiations)
- Simplicity over precision where tradeoffs exist
- All outputs must be machine-readable for org aggregation

## Working with the Assessment Tools

### Adding a New AI Tool to L3
1. Add tool info to `level3.html` in the appropriate section (Consumer/Developer)
2. Add evidence fields to the L3 form
3. Update JSON schema if new metric types needed
4. Update `aggregate.py` to handle new fields in CSV output

### Changing the JSON Schema
1. For backwards-compatible changes (new optional fields): update schema, bump minor version
2. For breaking changes: create new major version, update all generators/consumers
3. Always update `aggregate.py` to handle both old and new versions

## Implementation Spec

See `docs/specs/interactive-assessment-tools.md` for complete specification including:
- JSON schema structure
- UI mockups for all pages
- URL encoding details for L2
- Aggregator output formats
- Dashboard views
- Testing checklist

### 📝 Session Wrapup
When user says **"wrapup"**, write YAML to `.claude/wrapups/YYYYMMDD-HH-description.yaml` with session summary, changes, discoveries, and next steps. See existing wrapups for schema.
