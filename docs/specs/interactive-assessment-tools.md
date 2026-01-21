# Interactive Assessment Tools - MVP Specification

**Version:** 1.0
**Date:** 2025-01-20
**Status:** Ready for Implementation

---

## Overview

Transform the AIQ Framework landing page into an interactive assessment platform with three verification levels, each accessible via one-click "easy buttons."

### Goals
- Users can complete self-assessment in 5 minutes
- Zero backend required (pure static site)
- Works on desktop and mobile
- Professional, enterprise-ready appearance
- Each level is standalone (doesn't require completing previous levels)
- **All outputs are machine-readable (JSON) for org-wide aggregation**
- **Schema versioned for future compatibility**

---

## Site Structure

```
docs/
├── index.html              # Landing page (redesigned)
├── level1.html             # Self-Assessment survey
├── level2.html             # Peer Validation (assessee entry)
├── level2-validate.html    # Peer Validation (validator entry, opened via shared URL)
├── level3.html             # Evidence Collection guides (role-based)
├── css/
│   └── styles.css          # Shared styles (new design system)
├── js/
│   ├── assessment.js       # L1 survey logic
│   ├── peer-form.js        # L2 form generation + URL encoding
│   ├── pdf-generator.js    # PDF creation (html2pdf wrapper)
│   ├── json-export.js      # JSON report generation (all levels)
│   └── shared.js           # Common utilities
├── schemas/
│   └── aiq-report-v1.schema.json  # Formal JSON Schema for validation
├── tools/
│   ├── aggregate.py        # Python aggregator script
│   ├── dashboard.html      # Visual dashboard (reads CSV)
│   └── README.md           # Usage instructions for org admins
└── assets/
    └── (any images/icons)
```

---

## Design System

### Visual Direction
- **Style:** Clean corporate (Stripe/Notion/Linear aesthetic)
- **Feel:** Professional, trustworthy, minimal, lots of white space

### Color Palette
| Role | Color | Hex |
|------|-------|-----|
| Primary | Slate/Navy | `#0f172a` |
| Secondary | Slate Gray | `#475569` |
| Accent (CTA) | Indigo | `#4f46e5` |
| Accent Hover | Indigo Dark | `#4338ca` |
| Success | Emerald | `#10b981` |
| Warning | Amber | `#f59e0b` |
| Error | Rose | `#f43f5e` |
| Background | White/Gray | `#ffffff` / `#f8fafc` |
| Border | Light Gray | `#e2e8f0` |

### Typography
- **Font:** System font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)
- **Headings:** Bold, larger sizes, tight line-height
- **Body:** 16px base, comfortable line-height (1.6)

### Components
- Buttons: Rounded (8px), solid backgrounds, hover states
- Cards: White background, subtle shadow, 12px border-radius
- Forms: Large touch targets, clear labels, inline validation

---

## Data Format & Schema

### Design Principles
1. **JSON is the primary output** - PDFs are human-readable views derived from JSON
2. **Schema versioned** - Every report includes `schemaVersion` for future compatibility
3. **All levels output JSON** - Enables org-wide aggregation across L1, L2, L3
4. **Empty strings for missing data** - Not "N/A" (breaks numeric calculations)

### JSON Report Structure (All Levels)

```json
{
  "schemaVersion": "1.0",
  "reportType": "self-assessment",  // "self-assessment" | "peer-validation" | "full-verification"
  "assessmentLevel": 1,             // 1, 2, or 3
  "generatedAt": "2025-01-20T14:30:00Z",

  "assessee": {
    "name": "Jane Smith",
    "role": "Software Engineer",
    "email": ""                     // Optional, empty if not provided
  },

  "dimensions": {
    "study": {
      "level": 3,
      "points": 10.5,
      "weight": 0.10,
      "weightedScore": 1.05
    },
    "copy": { ... },
    "output": { ... },
    "research": { ... },
    "ethical": { ... }
  },

  "calculation": {
    "rawTotal": 49.2,
    "evidenceMultiplier": 0.6,
    "finalScore": 29.5,
    "normalizedScore": 52,          // 0-100 scale
    "scoreBand": "Practitioner",
    "confidence": "LOW"
  },

  // Level 2+ only
  "validation": {
    "validatorName": "John Manager",
    "validatorRelationship": "Manager",
    "validatedAt": "2025-01-21T09:00:00Z",
    "dimensionConfirmations": {
      "study": { "confirmed": true, "adjustedLevel": null },
      "copy": { "confirmed": false, "adjustedLevel": 2 },
      ...
    }
  },

  // Level 3 only
  "evidence": {
    "tools": {
      "claudeCode": {
        "completed": true,
        "monthlyTokens": 1250000,
        "sessionsPerMonth": 45,
        "dailyStats": {
          "min": 0,
          "max": 85000,
          "avg": 41666
        },
        "exportFilename": "claude_usage_202501.json"
      },
      "chatgpt": {
        "completed": true,
        "conversationCount": 234,
        "exportFilename": "chatgpt_export.zip"
      },
      "githubCopilot": {
        "completed": false,
        "monthlyTokens": "",
        "exportFilename": ""
      }
    },
    "auditNotes": "Reviewed Git history showing Copilot-assisted commits..."
  }
}
```

### Schema Versioning Strategy

| Version | Status | Notes |
|---------|--------|-------|
| 1.0 | Current | Initial release |
| 1.x | Future | Backwards-compatible additions (new optional fields) |
| 2.0 | Future | Breaking changes (field renames, structure changes) |

**Compatibility rules:**
- Aggregator tools MUST handle all 1.x schemas
- New optional fields can be added without version bump
- Field removal or rename requires major version bump
- Old reports remain valid indefinitely

### Formal JSON Schema

File: `schemas/aiq-report-v1.schema.json`

Provides:
- Field validation (types, required fields, enums)
- Documentation of all fields
- Tooling support (IDE autocomplete, form generation)

Orgs can validate reports:
```bash
# Using ajv-cli
npx ajv validate -s aiq-report-v1.schema.json -d report.json

# Using Python jsonschema
python -c "import jsonschema, json; jsonschema.validate(json.load(open('report.json')), json.load(open('aiq-report-v1.schema.json')))"
```

---

## Landing Page (index.html)

### Hero Section
1. **Headline:** "Measure Your AI Skills"
2. **Subhead:** "Get a standardized AIQ score in minutes. Choose your validation level."
3. **Privacy Badge:** "Your data never leaves your browser. No tracking. No accounts."

### Quick Start Buttons (3 prominent CTAs)
| Button | Icon | Label | Links To |
|--------|------|-------|----------|
| 1 | ✓ (checkmark) | "Quick Self-Check" | level1.html |
| 2 | 👥 (people) | "Peer Validation" | level2.html |
| 3 | 📊 (chart) | "Full Verification" | level3.html |

- Buttons should be large, prominent, horizontally arranged on desktop
- Stack vertically on mobile
- Each shows time estimate (5 min / 30 min / 1+ hr)

### Existing Accordions
- Keep current accordion structure below quick-start buttons
- Each accordion (Level 1, 2, 3) expands to show details
- Add "Start" button inside each expanded accordion that links to respective page

### Collapsible Diagram Section

At bottom of page, before footer, add collapsible assessment flow diagram:

```html
<details class="diagram-section">
  <summary>View Assessment Flow Diagram</summary>
  <div class="mermaid">
    flowchart TD
      subgraph START[" "]
        Q{{"What's your<br/>assessment purpose?"}}
      end
      Q -->|"Personal Development"| PD[Personal Dev Path]
      Q -->|"Performance Review"| PR[Standard Path]
      Q -->|"Hiring/Promotion"| HP[Verified Path]

      subgraph L1["LEVEL 1: SELF"]
        SA["Self-Assessment<br/>5 min · 0.6x"]
      end
      PD --> L1
      PR --> L1
      HP --> L1

      subgraph L2["LEVEL 2: PEER"]
        MC["Peer Validation<br/>30 min · 0.8x"]
      end
      L1 -->|"Personal Dev STOPS"| DONE1((Done))
      L1 -->|"Continue"| L2

      subgraph L3["LEVEL 3: AUTO/AUDIT"]
        VER["Full Verification<br/>1+ hr · 1.0x"]
      end
      L2 -->|"Reviews STOP"| DONE2((Done))
      L2 -->|"Continue"| L3
      L3 --> DONE3((Done))

      classDef level1 fill:#c8e6c9,stroke:#2e7d32
      classDef level2 fill:#fff9c4,stroke:#f9a825
      classDef level3 fill:#ffcdd2,stroke:#c62828
      class L1,SA level1
      class L2,MC level2
      class L3,VER level3
  </div>
</details>
```

**Mermaid.js Integration:**

```html
<!-- Before closing </body> -->
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
  mermaid.initialize({
    startOnLoad: true,
    theme: 'neutral',
    flowchart: { useMaxWidth: true }
  });

  // Re-render when details opens (diagram hidden initially)
  document.querySelector('details.diagram-section')?.addEventListener('toggle', (e) => {
    if (e.target.open) {
      mermaid.contentLoaded();
    }
  });
</script>
```

**Styling:**
```css
.diagram-section {
  margin: 30px 0;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.diagram-section summary {
  padding: 15px 20px;
  background: #f8fafc;
  cursor: pointer;
  font-weight: 500;
  color: #475569;
}

.diagram-section summary:hover {
  background: #f1f5f9;
}

.diagram-section .mermaid {
  padding: 20px;
  background: white;
}
```

### Footer
- Link to GitHub repo
- Link to full framework documentation (ai_mastery_eval.md)

---

## Level 1: Self-Assessment (level1.html)

### Page Structure
1. **Header:** "AIQ Self-Assessment" + back link to landing
2. **Role Selection:** Dropdown at top (required before proceeding)
3. **Assessment Form:** All 5 SCOREs dimensions visible on one page
4. **Submit Button:** Calculate score
5. **Results Section:** Appears after submission
6. **Download Options:** Multiple export formats

### Role Selection
Dropdown with all 7 roles from framework:
- General (default)
- Software Engineer
- Data / ML Engineer
- Product Manager
- Research Scientist
- Executive / Leader
- Operations / Support
- Legal / Compliance

### Assessment Form
For each of the 5 dimensions (S, C, O, R, Es):

**Display:**
- Dimension name + full description
- Core question from framework
- Radio button group with all 6 levels (0-5)
- Each radio shows: Level number + Points range + Description text

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ S - Study (Information & Fluency)                       │
│ "Where do you learn about AI?"                          │
├─────────────────────────────────────────────────────────┤
│ ○ Level 0 (0 pts) - No AI awareness. Avoids or fears... │
│ ○ Level 1 (1-4 pts) - Mainstream news only...           │
│ ○ Level 2 (5-8 pts) - LinkedIn influencers...           │
│ ○ Level 3 (9-12 pts) - Developer blogs, release notes...│
│ ○ Level 4 (13-16 pts) - Technical reports, GitHub...    │
│ ○ Level 5 (17-20 pts) - ArXiv papers, model weights...  │
└─────────────────────────────────────────────────────────┘
```

### Gaming Prevention
If user selects Level 4 or 5 on ALL dimensions, show warning:
> "Scores this high are rare (top 5% of AI practitioners). Consider getting peer validation to increase your confidence multiplier from 0.6x to 0.8x."

Not blocking - just informational.

### Score Calculation
1. Apply point values based on selected levels (use midpoint of range)
2. Apply role-based weights
3. Apply 0.6x evidence multiplier (self-report)
4. Calculate final AIQ (0-100)
5. Determine score band (Unaware/User/Practitioner/Builder/Architect/Pioneer)
6. Set confidence to "LOW"

### Results Display
```
┌─────────────────────────────────────────────────────────┐
│                    Your AIQ Score                        │
│                        52                                │
│                   PRACTITIONER                           │
│              Confidence: LOW (0.6x)                      │
├─────────────────────────────────────────────────────────┤
│  Dimension Breakdown            Role: Software Engineer  │
│  ─────────────────────────────────────────────────────  │
│  Study:    12 pts (×10%)  →  1.2                        │
│  Copy:     8 pts  (×25%)  →  2.0                        │
│  Output:   15 pts (×40%)  →  6.0                        │
│  Research: 5 pts  (×15%)  →  0.75                       │
│  Ethical:  9 pts  (×10%)  →  0.9                        │
│  ─────────────────────────────────────────────────────  │
│  Raw Total: 10.85 × 0.6 = 6.51 (normalized to 52/100)   │
└─────────────────────────────────────────────────────────┘
```

### Download Options

**Primary Output (for org aggregation):**
- **"Download Report (JSON)"** - Machine-readable, schema-validated, primary format for org collection

**Human-Readable Options:**
1. **"Download Summary (PDF)"**
   - 1-page PDF with score + breakdown
   - Clean, printable format

2. **"Download Full Report (PDF)"**
   - Multi-page PDF with:
     - Score + breakdown
     - Personalized next steps based on lowest dimensions
     - Improvement suggestions

3. **"Download for Peer Review (PDF)"**
   - Formatted for L2 validation
   - Includes signature line, date fields
   - Checkboxes for peer to confirm each dimension

**Note:** All PDF options also generate accompanying JSON. Users submitting to org should share the JSON file.

### PDF Generation
- Use html2pdf.js via CDN
- Simple HTML template (no flexbox/grid) for reliable conversion:
  - Table-based layouts
  - Explicit font sizes (px, not rem)
  - Solid colors only
  - Black text on white background
  - Explicit width/height on all elements

---

## Level 2: Peer Validation (level2.html + level2-validate.html)

### Overview
Level 2 uses **URL-encoded state** to pass data between assessee and validator without any backend. Both parties complete web forms; both get JSON output.

### Two-Page Flow

**Page 1: level2.html (Assessee Entry)**
1. Assessee enters their claimed scores
2. System generates a shareable URL with scores encoded
3. Assessee copies URL and sends to validator (email, Slack, etc.)

**Page 2: level2-validate.html (Validator Entry)**
1. Validator opens the shared URL
2. URL decodes to show assessee's claims
3. Validator confirms or adjusts each dimension
4. Both parties can download the validated JSON report

### Page 1: Assessee Form (level2.html)

**Fields:**
```
┌─────────────────────────────────────────────────────────┐
│ Request Peer Validation                                  │
├─────────────────────────────────────────────────────────┤
│ Your Name: [text input]                                 │
│ Your Role: [dropdown - 7 roles]                         │
│ Your Email: [optional - for validator reference]        │
├─────────────────────────────────────────────────────────┤
│ Your Claimed Scores:                                    │
│ Study (S):     [dropdown 0-5]                           │
│ Copy (C):      [dropdown 0-5]                           │
│ Output (O):    [dropdown 0-5]                           │
│ Research (R):  [dropdown 0-5]                           │
│ Ethical (Es):  [dropdown 0-5]                           │
├─────────────────────────────────────────────────────────┤
│ Context/Notes: [textarea - optional]                    │
└─────────────────────────────────────────────────────────┘

[Generate Validation Link] button
```

**Output:**
- Displays shareable URL: `https://sagearbor.github.io/ai-skill-eval-kit/level2-validate.html?d=eyJuYW1lIjoiSmFuZ...`
- Copy button for easy sharing
- Also generates "pending validation" JSON (assessmentLevel: 2, validation: null)

### Page 2: Validator Form (level2-validate.html)

**On Load:**
- Reads URL parameter `?d=...`
- Decodes base64 JSON to extract assessee claims
- Displays assessee info and claimed scores

**Display:**
```
┌─────────────────────────────────────────────────────────┐
│ Validate AI Skills Assessment                            │
├─────────────────────────────────────────────────────────┤
│ Assessee: Jane Smith (Software Engineer)                │
│ Requested: 2025-01-20                                   │
├─────────────────────────────────────────────────────────┤
│ Review Each Dimension:                                  │
│                                                         │
│ Study: Claimed Level 3 (9-12 pts)                       │
│ "Developer blogs, release notes, AI-focused newsletters"│
│ [✓] Confirm  [ ] Adjust to: [dropdown 0-5]              │
│                                                         │
│ Copy: Claimed Level 4 (13-16 pts)                       │
│ "Automated evals. LLM-as-Judge. Quantified metrics."    │
│ [ ] Confirm  [✓] Adjust to: [2 ▼]                       │
│ Reason: [text input - required if adjusting]            │
│                                                         │
│ ... (repeat for all 5 dimensions)                       │
├─────────────────────────────────────────────────────────┤
│ Your Information:                                       │
│ Your Name: [text input]                                 │
│ Relationship: [Manager / Peer / Other ▼]                │
└─────────────────────────────────────────────────────────┘

[Complete Validation] button
```

**Output:**
- Validated JSON report (assessmentLevel: 2, validation: {...})
- Recalculated score with 0.8x multiplier
- Download buttons: JSON (primary) + PDF (human-readable)
- Option to copy a "completed validation" URL to share back with assessee

### URL Encoding Details

**Encoding:**
```javascript
const data = { name, role, email, dimensions, notes, timestamp };
const encoded = btoa(JSON.stringify(data));
const url = `${baseUrl}/level2-validate.html?d=${encoded}`;
```

**Size limits:**
- URLs safe up to ~2000 characters
- Base64 of typical assessment data: ~300-500 characters
- Plenty of headroom for notes up to ~1000 characters

**Fallback for long data:**
If notes exceed safe URL length, truncate with message: "Full notes available in downloaded JSON"

---

## Level 3: Evidence Collection (level3.html)

### Page Structure
1. **Header:** "Full Verification Evidence Guide" + back link
2. **Intro Text:** Explains what L3 verification means
3. **Role Selector:** Tabs or buttons for each role
4. **Role-Specific Guide:** Evidence collection instructions
5. **Tool-Specific Instructions:** Collapsible sections for each AI tool
6. **Future App Note:** Brief mention of potential desktop app

### Intro Text
> "Level 3 verification achieves 1.0x confidence through automated logs or comprehensive audit. Select your role below for specific evidence collection instructions."

### Role Tabs (7 roles)
- Software Engineer
- Data / ML Engineer
- Product Manager
- Research Scientist
- Executive / Leader
- Operations / Support
- Legal / Compliance

### Per-Role Guide Structure
Each role shows:
1. **Role Overview:** What evidence is most relevant
2. **By Dimension:** Specific evidence types for each SCOREs dimension
3. **Tools Section:** Links to tool-specific instructions

### Tool Instructions (Collapsible Sections)
10 tools total, categorized:

**Consumer Tools:**
- ChatGPT
- Claude.ai
- Microsoft Copilot
- Google Gemini
- Perplexity

**Developer Tools:**
- GitHub Copilot
- Claude Code
- OpenAI API
- Cursor
- Replit AI

Each tool section includes:
- How to access usage/history
- What to export
- Screenshot instructions
- Command-line commands (for developer tools)

#### Example: ChatGPT
```
### ChatGPT (chat.openai.com)

**Access your data:**
1. Go to Settings → Data Controls
2. Click "Export Data"
3. Wait for email with download link
4. Download ZIP containing full chat history

**What this proves:**
- Conversation volume and frequency
- Topics and complexity of usage
- Date range of activity

**For CLI users (if applicable):**
No CLI available for consumer ChatGPT.
```

#### Example: Claude Code
```
### Claude Code (CLI)

**Access your usage:**
Run in terminal:
```bash
npx ccusage
```

**What this shows:**
- Monthly token usage
- Session counts
- API calls

**Export data:**
Run: `npx ccusage --export json > claude_usage.json`
```

### L3 Form & JSON Output

After reviewing evidence collection instructions, user fills out a form:

```
┌─────────────────────────────────────────────────────────┐
│ Record Your Evidence                                     │
├─────────────────────────────────────────────────────────┤
│ Your Name: [text input]                                 │
│ Your Role: [dropdown - 7 roles]                         │
├─────────────────────────────────────────────────────────┤
│ Tool Evidence (check all that apply):                   │
│                                                         │
│ [✓] Claude Code                                         │
│     Monthly tokens: [1250000]                           │
│     Sessions/month: [45]                                │
│     Daily min: [0] max: [85000] avg: [41666]            │
│     Export file: [claude_usage.json]                    │
│                                                         │
│ [✓] ChatGPT                                             │
│     Conversation count: [234]                           │
│     Export file: [chatgpt_export.zip]                   │
│                                                         │
│ [ ] GitHub Copilot (not used)                           │
│                                                         │
│ ... (all 10 tools)                                      │
├─────────────────────────────────────────────────────────┤
│ Audit Notes: [textarea]                                 │
│ "Additional context about your evidence..."             │
└─────────────────────────────────────────────────────────┘

[Generate L3 Report] button
```

**JSON Output includes:**
- All dimension scores (user enters based on evidence)
- Per-tool completion status
- Numeric metrics where available (tokens, sessions, counts)
- Daily stats (min/max/avg) for usage patterns
- Filenames of exported evidence (org stores separately)
- Audit notes

### Future Desktop App Section
```
┌─────────────────────────────────────────────────────────┐
│ Potential Future Development                             │
├─────────────────────────────────────────────────────────┤
│ We're exploring a cross-platform desktop application    │
│ that could automatically scan for AI tool usage and     │
│ generate verification reports with real metrics.        │
│                                                         │
│ This would enable true "one-click" Level 3 validation.  │
│ No timeline has been set for this development.          │
└─────────────────────────────────────────────────────────┘
```

---

## Org Aggregation Tools (tools/)

### Overview
Organizations collect JSON reports from employees (all levels) and use these tools to aggregate and visualize.

**Workflow:**
```
employees/
├── 2025-Q1/
│   ├── alice_l1.json
│   ├── bob_l2.json
│   ├── charlie_l3.json
│   └── ...
├── 2025-Q2/
│   └── ...
└── tools/
    ├── aggregate.py
    ├── dashboard.html
    └── README.md
```

### Python Aggregator (aggregate.py)

**Usage:**
```bash
# Aggregate single period
python aggregate.py ./2025-Q1/

# Aggregate multiple periods (for trends)
python aggregate.py ./2025-Q1/ ./2025-Q2/ ./2025-Q3/

# Output to specific location
python aggregate.py ./2025-Q1/ --output ./reports/
```

**Outputs:**
1. `aiq_summary.csv` - One row per person, all scores
2. `aiq_stats.json` - Org-wide statistics
3. `aiq_combined.json` - All reports in one file (for dashboard)

**CSV Structure:**
| Column | Type | Notes |
|--------|------|-------|
| name | string | Assessee name |
| role | string | Role selected |
| assessment_level | int | 1, 2, or 3 |
| period | string | Folder name (e.g., "2025-Q1") |
| study_level | int | 0-5 |
| study_points | float | |
| copy_level | int | |
| copy_points | float | |
| output_level | int | |
| output_points | float | |
| research_level | int | |
| research_points | float | |
| ethical_level | int | |
| ethical_points | float | |
| raw_total | float | |
| evidence_multiplier | float | 0.6, 0.8, or 1.0 |
| final_score | float | |
| normalized_score | int | 0-100 |
| score_band | string | |
| confidence | string | LOW/MEDIUM/HIGH |
| validator_name | string | Empty if L1 |
| validated_at | string | ISO date, empty if L1 |
| ... (tool metrics) | varies | Empty if not L3 or not provided |

**Empty strings for missing data** - enables numeric operations on columns where data exists.

**Stats JSON Structure:**
```json
{
  "generatedAt": "2025-01-20T...",
  "periods": ["2025-Q1", "2025-Q2"],
  "totalReports": 156,
  "byLevel": { "1": 89, "2": 52, "3": 15 },
  "byRole": { "Software Engineer": 45, "PM": 23, ... },
  "scoreDistribution": {
    "0-20": 5,
    "21-40": 23,
    "41-60": 78,
    "61-80": 42,
    "81-100": 8
  },
  "dimensionAverages": {
    "study": 2.8,
    "copy": 2.1,
    "output": 3.2,
    "research": 1.4,
    "ethical": 2.9
  },
  "lowestDimension": "research",
  "periodTrends": {
    "2025-Q1": { "avgScore": 48, "count": 78 },
    "2025-Q2": { "avgScore": 52, "count": 78 }
  }
}
```

### Visual Dashboard (dashboard.html)

Self-contained HTML file that reads `aiq_combined.json` from same folder.

**How to use:**
1. Place `dashboard.html` and `aiq_combined.json` in same folder
2. Open `dashboard.html` in browser
3. Dashboard loads and visualizes data

**Views (tabs):**

#### 1. Score Distribution
- Histogram of normalized scores (0-100)
- Color-coded by score band
- Filter by role, level, period

#### 2. Skill Gaps
- Bar chart of dimension averages
- Highlights lowest dimension org-wide
- Breakdown by role
- Recommendations based on gaps

#### 3. Leaderboard
- Sortable table of individuals
- Columns: Name, Role, Score, Band, Confidence
- Optional anonymization toggle
- Export to CSV

#### 4. Trends Over Time
- Line chart showing average score per period
- Separate lines per role (optional)
- Requires multiple periods in data

**Technical:**
- Uses Chart.js from CDN for visualizations
- Loads JSON via fetch() or FileReader
- Pure client-side, no server needed
- Responsive for tablet/desktop (not phone-optimized)

### README.md for Org Admins

```markdown
# AIQ Report Aggregation Tools

## Quick Start

1. Collect JSON reports from employees into period folders:
   ```
   assessments/
   ├── 2025-Q1/
   │   ├── alice.json
   │   └── bob.json
   ```

2. Run aggregator:
   ```bash
   python aggregate.py ./assessments/2025-Q1/
   ```

3. View dashboard:
   - Open `dashboard.html` in browser
   - Dashboard reads `aiq_combined.json` from same folder

## Requirements
- Python 3.8+
- No external dependencies (uses stdlib only)

## Folder Structure for Trends
Use folder names as period identifiers:
- `2025-Q1/`, `2025-Q2/` for quarterly
- `2025-01/`, `2025-02/` for monthly
- Any consistent naming works

## Validating Reports
Reports should match the AIQ JSON Schema:
```bash
pip install jsonschema
python -c "import jsonschema, json, sys; ..."
```
```

---

## Technical Requirements

### Dependencies (CDN)
- html2pdf.js - PDF generation
- Chart.js - Dashboard visualizations
- Mermaid.js - Diagram rendering on landing page

### Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

### Accessibility
- All form inputs have labels
- Color contrast meets WCAG AA
- Keyboard navigable
- Focus indicators visible
- Radio buttons and dropdowns are native HTML (no custom)

### Mobile Responsiveness
- Breakpoints: 768px (tablet), 480px (phone)
- Stack horizontal layouts vertically on mobile
- Touch targets minimum 44px
- No horizontal scroll

### Performance
- Page load < 2 seconds on 3G
- PDF generation < 5 seconds
- No layout shift during load

---

## File Size Estimates
| File | Estimated Size |
|------|----------------|
| index.html | ~15 KB |
| level1.html | ~20 KB |
| level2.html | ~15 KB |
| level2-validate.html | ~15 KB |
| level3.html | ~35 KB (lots of content) |
| styles.css | ~10 KB |
| All JS combined | ~20 KB (excluding CDN libs) |
| aiq-report-v1.schema.json | ~5 KB |
| aggregate.py | ~8 KB |
| dashboard.html | ~25 KB |
| **Total (excluding CDN)** | ~170 KB |

---

## Implementation Notes

### PDF Template Strategy
To ensure reliable html2pdf conversion:
1. Create a hidden `<div id="pdf-template">` on page
2. Populate with assessment data using simple HTML
3. Use only:
   - `<table>` for layout
   - Inline styles or simple classes
   - `font-size` in px
   - Solid `background-color`
   - `border` for lines
4. Avoid:
   - Flexbox/Grid
   - `rem`/`em` units
   - Gradients
   - Complex CSS selectors
   - Transparency

### State Management
- No persistence (fully stateless)
- Assessment answers stored in JS variables during session
- Lost on page refresh (by design - privacy)
- Optional: Use URL params to pre-fill L2 form

### Error Handling
- Required fields validated before submit
- Clear error messages inline
- PDF generation has try/catch with user-friendly error

---

## Testing Checklist

### Functional
- [ ] L1 calculates correct score with role weights
- [ ] L1 shows warning for all high scores
- [ ] L1 JSON download contains all required fields
- [ ] L1 PDF downloads work (all 3 types)
- [ ] L2 URL encoding works (generates valid shareable link)
- [ ] L2 validator page decodes URL correctly
- [ ] L2 validation produces JSON with 0.8x multiplier
- [ ] L3 role tabs work, show correct content
- [ ] L3 form captures tool metrics
- [ ] L3 JSON includes all evidence fields
- [ ] All links work (back buttons, cross-navigation)

### JSON Schema
- [ ] L1 output validates against schema
- [ ] L2 output validates against schema
- [ ] L3 output validates against schema
- [ ] Empty strings used (not "N/A") for missing data

### Aggregator (aggregate.py)
- [ ] Reads single folder of JSON files
- [ ] Reads multiple folders (multi-period)
- [ ] Outputs valid CSV
- [ ] Outputs stats JSON with correct calculations
- [ ] Handles mixed L1/L2/L3 reports
- [ ] Skips invalid JSON files gracefully

### Dashboard
- [ ] Loads aiq_combined.json from same folder
- [ ] Score distribution chart renders
- [ ] Skill gaps chart renders
- [ ] Leaderboard table sortable
- [ ] Trends chart works with multi-period data
- [ ] Filters work (role, level, period)

### Cross-Browser
- [ ] Chrome desktop
- [ ] Firefox desktop
- [ ] Safari desktop
- [ ] Chrome mobile
- [ ] Safari mobile (iOS)

### Accessibility
- [ ] Tab through all forms
- [ ] Screen reader can read all content
- [ ] Color contrast passes

### Edge Cases
- [ ] All zeros submitted (valid, should work)
- [ ] All fives submitted (shows warning, still works)
- [ ] Refresh mid-form (data lost, expected)
- [ ] Very long notes in L2 (should truncate or handle)

---

## Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| Backend needed? | No - pure client-side |
| Offline support? | No - CDN dependencies require internet |
| User accounts? | No - anonymous, no storage |
| L3 scanner for MVP? | No - role-based guides + form instead |
| Mobile support? | Yes - must work on mobile |
| Primary output format? | JSON (machine-readable); PDFs are secondary |
| Schema versioning? | Yes - `schemaVersion` field in all outputs |
| L2 peer flow? | URL-encoded state, both parties use web forms |
| Org aggregation? | Python script + dashboard HTML |
| Missing data representation? | Empty strings (not "N/A") |
| Trends over time? | Folder-per-period convention |

---

## Future Considerations (Post-MVP)

1. **L3 Desktop App:** Electron/Tauri signed app for automated file system scanning
2. **Benchmark Data:** Anonymous industry-wide statistics (would require opt-in backend)
3. **Time Decay Calculator:** Input past assessments, see current adjusted score with decay applied
4. **Real-time Dashboard:** Live updating dashboard (requires backend/database)
5. **Integration with HR Systems:** API endpoints for pulling data into Workday, SAP, etc.
6. **Schema 2.0:** Breaking changes based on org feedback after MVP adoption

---

*End of Specification*
