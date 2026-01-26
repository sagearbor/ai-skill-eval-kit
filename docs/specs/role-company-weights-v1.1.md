# AIQ Role & Company Weights Specification v1.1

**Status:** Draft
**Date:** 2025-01-25
**Authors:** Interview session with colleague feedback

---

## Overview

This spec defines the role-based weights and company-type modifiers for AIQ v1.1. Key changes from v1.0:

1. **Reduced roles**: 8 → 5 roles
2. **Added company type modifiers**: Startup, Enterprise, Aspirational
3. **Multiplier-based scaling**: Company types use multipliers (not additive deltas)
4. **Role-specific level descriptions**: Output, Research, Ethical dimensions get role-tailored text
5. **External config file**: Weights moved from `shared.js` to `weights-config.json`
6. **Multi-score display**: Optional toggle to show scores under all 3 company profiles
7. **Dual scoring: Personal vs Corporate**: Separates individual readiness from organizational enablement

---

## 1. Roles (5 total)

| Role | Description | Replaces (from v1.0) |
|------|-------------|----------------------|
| **General** | Default for unknown/mixed roles | General |
| **Developer** | Ships code, builds systems | Software Engineer |
| **Researcher** | Deep technical, ML, research | Data/ML Engineer + Research Scientist |
| **Support** | Enables others (PM, Ops, Legal, HR) | Product Manager + Operations/Support + Legal/Compliance |
| **Leader** | Strategy, governance, executive | Executive/Leader |

---

## 2. Dual Scoring: Personal vs Corporate

### Philosophy

The framework now produces **two scores** to separate individual capability from organizational opportunity:

| Score Type | Measures | Key Question |
|------------|----------|--------------|
| **Personal Readiness** | Individual knowledge, skills, productivity | "Am I ready to deliver AI value?" |
| **Corporate Impact** | Deployed systems, business outcomes, governance | "Has the org enabled AI delivery?" |

This solves the problem of skilled developers getting low scores because their organization hasn't funded AI initiatives.

### Weight Profiles

#### Personal Readiness Weights
Emphasizes knowledge acquisition, evaluation skills, and personal productivity.

| Role | Study | Copy | Output | Research | Ethical |
|------|-------|------|--------|----------|---------|
| **General** | 30% | 30% | 20% | 10% | 10% |
| **Developer** | 25% | 35% | 25% | 10% | 5% |
| **Researcher** | 20% | 30% | 15% | 30% | 5% |
| **Support** | 35% | 25% | 25% | 5% | 10% |
| **Leader** | 40% | 20% | 15% | 10% | 15% |

**Output interpretation for Personal**: Levels 0-2 (personal productivity, prototypes) count fully. Levels 3-5 still measurable but not the focus.

#### Corporate Impact Weights
Emphasizes deployed value, governance, and organizational outcomes.

| Role | Study | Copy | Output | Research | Ethical |
|------|-------|------|--------|----------|---------|
| **General** | 10% | 15% | 45% | 5% | 25% |
| **Developer** | 5% | 15% | 55% | 10% | 15% |
| **Researcher** | 10% | 20% | 35% | 20% | 15% |
| **Support** | 10% | 15% | 45% | 5% | 25% |
| **Leader** | 15% | 10% | 30% | 5% | 40% |

**Output interpretation for Corporate**: Levels 3-5 ($10k+ value, production systems) are the focus. Levels 0-2 contribute minimally.

### UI Display

Results page shows both scores:

```
┌────────────────────────────────────────────────────────┐
│  Personal Readiness: 72        Corporate Impact: 28   │
│  ████████████████░░░░░░░░      ██████░░░░░░░░░░░░░░░  │
│  Practitioner                  User                    │
│                                                        │
│  Gap: 44 points                                        │
│  → You're ready for more AI responsibility             │
└────────────────────────────────────────────────────────┘
```

### Gap Interpretation

| Gap (Personal - Corporate) | Meaning | Recommended Action |
|---------------------------|---------|-------------------|
| > 30 points | High individual readiness, low org enablement | Advocate for AI pilot projects |
| 10-30 points | Moderate gap | Seek deployment opportunities |
| -10 to 10 points | Balanced | Continue current trajectory |
| < -10 points | Org ahead of individual | Invest in learning/upskilling |

### Config Structure

Add to `weights-config.json`:

```json
{
  "schemaVersion": "1.1",
  "scoreTypes": {
    "personal": {
      "description": "Individual readiness to deliver AI value",
      "roles": {
        "General": { "study": 0.30, "copy": 0.30, "output": 0.20, "research": 0.10, "ethical": 0.10 },
        "Developer": { "study": 0.25, "copy": 0.35, "output": 0.25, "research": 0.10, "ethical": 0.05 },
        "Researcher": { "study": 0.20, "copy": 0.30, "output": 0.15, "research": 0.30, "ethical": 0.05 },
        "Support": { "study": 0.35, "copy": 0.25, "output": 0.25, "research": 0.05, "ethical": 0.10 },
        "Leader": { "study": 0.40, "copy": 0.20, "output": 0.15, "research": 0.10, "ethical": 0.15 }
      }
    },
    "corporate": {
      "description": "Organizational AI deployment and governance",
      "roles": {
        "General": { "study": 0.10, "copy": 0.15, "output": 0.45, "research": 0.05, "ethical": 0.25 },
        "Developer": { "study": 0.05, "copy": 0.15, "output": 0.55, "research": 0.10, "ethical": 0.15 },
        "Researcher": { "study": 0.10, "copy": 0.20, "output": 0.35, "research": 0.20, "ethical": 0.15 },
        "Support": { "study": 0.10, "copy": 0.15, "output": 0.45, "research": 0.05, "ethical": 0.25 },
        "Leader": { "study": 0.15, "copy": 0.10, "output": 0.30, "research": 0.05, "ethical": 0.40 }
      }
    }
  },
  "companyModifiers": {
    "Startup": { "study": 1.0, "copy": 0.7, "output": 1.4, "research": 1.2, "ethical": 0.7 },
    "Enterprise": { "study": 1.0, "copy": 1.2, "output": 0.8, "research": 1.0, "ethical": 1.0 },
    "Aspirational": { "study": 0.8, "copy": 0.8, "output": 1.0, "research": 1.2, "ethical": 1.2 }
  }
}
```

### Schema Updates for Dual Scoring

Add to `calculation` object in schema:

```json
"calculation": {
  "type": "object",
  "properties": {
    "personalScore": {
      "type": "object",
      "properties": {
        "rawTotal": { "type": "number" },
        "normalizedScore": { "type": "integer", "minimum": 0, "maximum": 100 },
        "scoreBand": { "type": "string" }
      }
    },
    "corporateScore": {
      "type": "object",
      "properties": {
        "rawTotal": { "type": "number" },
        "normalizedScore": { "type": "integer", "minimum": 0, "maximum": 100 },
        "scoreBand": { "type": "string" }
      }
    },
    "gap": {
      "type": "integer",
      "description": "personalScore - corporateScore. Positive = ready for more responsibility."
    },
    "evidenceMultiplier": { "type": "number", "enum": [0.6, 0.8, 1.0] },
    "confidence": { "type": "string", "enum": ["LOW", "MEDIUM", "HIGH"] }
  }
}
```

### Backward Compatibility

- Single "combined" score still available for v1.0 compatibility
- `?scoreType=combined` URL param uses original weights (Section 3 below)
- Default display shows dual scores; toggle available for combined view

---

## 3. Base Weights by Role (Combined Score - Legacy)

For backward compatibility and orgs that prefer a single score.

All weights sum to 100%.

| Role | Study | Copy | Output | Research | Ethical |
|------|-------|------|--------|----------|---------|
| **General** | 20% | 30% | 30% | 5% | 15% |
| **Developer** | 10% | 25% | 40% | 15% | 10% |
| **Researcher** | 15% | 25% | 25% | 25% | 10% |
| **Support** | 25% | 20% | 30% | 10% | 15% |
| **Leader** | 30% | 15% | 20% | 10% | 25% |

---

## 4. Company Type Modifiers

Company type applies **multipliers** to base weights, then renormalizes to 100%.

Modifiers apply to **both** Personal and Corporate scores.

| Profile | Study | Copy | Output | Research | Ethical | Philosophy |
|---------|-------|------|--------|----------|---------|------------|
| **Startup** | 1.0 | 0.7 | 1.4 | 1.2 | 0.7 | "Ship it, learn, iterate" |
| **Enterprise** | 1.0 | 1.2 | 0.8 | 1.0 | 1.0 | "Reliable, scalable, governed" |
| **Aspirational** | 0.8 | 0.8 | 1.0 | 1.2 | 1.2 | "Build AI the right way" |

### Calculation Example

**Developer + Startup (Personal Score):**

| Dimension | Base | × Multiplier | Raw | Normalized |
|-----------|------|--------------|-----|------------|
| Study | 25% | × 1.0 | 25 | 24% |
| Copy | 35% | × 0.7 | 24.5 | 24% |
| Output | 25% | × 1.4 | 35 | 34% |
| Research | 10% | × 1.2 | 12 | 12% |
| Ethical | 5% | × 0.7 | 3.5 | 3% |
| **Total** | 100% | | 100 | **100%** |

---

## 5. Config File Structure

Create `docs/config/weights-config.json`:

```json
{
  "schemaVersion": "1.1",
  "scoreTypes": {
    "personal": {
      "description": "Individual readiness to deliver AI value",
      "roles": {
        "General": { "study": 0.30, "copy": 0.30, "output": 0.20, "research": 0.10, "ethical": 0.10 },
        "Developer": { "study": 0.25, "copy": 0.35, "output": 0.25, "research": 0.10, "ethical": 0.05 },
        "Researcher": { "study": 0.20, "copy": 0.30, "output": 0.15, "research": 0.30, "ethical": 0.05 },
        "Support": { "study": 0.35, "copy": 0.25, "output": 0.25, "research": 0.05, "ethical": 0.10 },
        "Leader": { "study": 0.40, "copy": 0.20, "output": 0.15, "research": 0.10, "ethical": 0.15 }
      }
    },
    "corporate": {
      "description": "Organizational AI deployment and governance",
      "roles": {
        "General": { "study": 0.10, "copy": 0.15, "output": 0.45, "research": 0.05, "ethical": 0.25 },
        "Developer": { "study": 0.05, "copy": 0.15, "output": 0.55, "research": 0.10, "ethical": 0.15 },
        "Researcher": { "study": 0.10, "copy": 0.20, "output": 0.35, "research": 0.20, "ethical": 0.15 },
        "Support": { "study": 0.10, "copy": 0.15, "output": 0.45, "research": 0.05, "ethical": 0.25 },
        "Leader": { "study": 0.15, "copy": 0.10, "output": 0.30, "research": 0.05, "ethical": 0.40 }
      }
    },
    "combined": {
      "description": "Legacy single score (v1.0 compatible)",
      "roles": {
        "General": { "study": 0.20, "copy": 0.30, "output": 0.30, "research": 0.05, "ethical": 0.15 },
        "Developer": { "study": 0.10, "copy": 0.25, "output": 0.40, "research": 0.15, "ethical": 0.10 },
        "Researcher": { "study": 0.15, "copy": 0.25, "output": 0.25, "research": 0.25, "ethical": 0.10 },
        "Support": { "study": 0.25, "copy": 0.20, "output": 0.30, "research": 0.10, "ethical": 0.15 },
        "Leader": { "study": 0.30, "copy": 0.15, "output": 0.20, "research": 0.10, "ethical": 0.25 }
      }
    }
  },
  "companyModifiers": {
    "Startup": { "study": 1.0, "copy": 0.7, "output": 1.4, "research": 1.2, "ethical": 0.7 },
    "Enterprise": { "study": 1.0, "copy": 1.2, "output": 0.8, "research": 1.0, "ethical": 1.0 },
    "Aspirational": { "study": 0.8, "copy": 0.8, "output": 1.0, "research": 1.2, "ethical": 1.2 }
  }
}
```

---

## 6. Schema Updates (v1.1)

Add to `aiq-report-v1.schema.json`:

### New fields in `assessee` object:

```json
"companyType": {
  "type": "string",
  "enum": ["Startup", "Enterprise", "Aspirational"],
  "description": "Company culture profile that modifies role weights."
}
```

### Update role description:

```json
"role": {
  "type": "string",
  "enum": ["General", "Developer", "Researcher", "Support", "Leader"],
  "description": "Job role category that determines base dimension weights."
}
```

### Updated calculation object:

```json
"calculation": {
  "type": "object",
  "required": ["personalScore", "corporateScore", "gap", "evidenceMultiplier", "confidence"],
  "properties": {
    "personalScore": {
      "type": "object",
      "required": ["rawTotal", "normalizedScore", "scoreBand"],
      "properties": {
        "rawTotal": { "type": "number", "minimum": 0 },
        "normalizedScore": { "type": "integer", "minimum": 0, "maximum": 100 },
        "scoreBand": { "type": "string", "enum": ["Unaware", "User", "Practitioner", "Builder", "Architect", "Pioneer"] }
      }
    },
    "corporateScore": {
      "type": "object",
      "required": ["rawTotal", "normalizedScore", "scoreBand"],
      "properties": {
        "rawTotal": { "type": "number", "minimum": 0 },
        "normalizedScore": { "type": "integer", "minimum": 0, "maximum": 100 },
        "scoreBand": { "type": "string", "enum": ["Unaware", "User", "Practitioner", "Builder", "Architect", "Pioneer"] }
      }
    },
    "gap": {
      "type": "integer",
      "description": "personalScore.normalizedScore - corporateScore.normalizedScore"
    },
    "combinedScore": {
      "type": "object",
      "description": "Legacy single score for v1.0 compatibility",
      "properties": {
        "rawTotal": { "type": "number" },
        "normalizedScore": { "type": "integer", "minimum": 0, "maximum": 100 },
        "scoreBand": { "type": "string" }
      }
    },
    "evidenceMultiplier": { "type": "number", "enum": [0.6, 0.8, 1.0] },
    "confidence": { "type": "string", "enum": ["LOW", "MEDIUM", "HIGH"] }
  }
}
```

### Bump schema version:

```json
"schemaVersion": {
  "type": "string",
  "enum": ["1.0", "1.1"],
  "description": "Schema version. 1.1 adds companyType, role enum, and dual scoring."
}
```

### Backward compatibility:

- Reports with `schemaVersion: "1.0"` remain valid
- `companyType` is optional (defaults to no modifier applied)
- Old freeform role strings map to "General" if not in enum
- `combinedScore` provides single-number compatibility

---

## 7. UI Changes

### 7.1 Assessment Form (L1, L2)

Add **Company Type** dropdown after Role selection:

```
Role: [Developer ▼]
Company Type: [Startup ▼]  (optional - defaults to no modifier)
```

Hint text: "Company type adjusts how dimensions are weighted. Leave blank for standard role weights."

### 7.2 Results Page - Dual Score Display (Default)

```
┌────────────────────────────────────────────────────────────────┐
│                        Your AIQ Results                        │
├───────────────────────────┬────────────────────────────────────┤
│   PERSONAL READINESS      │      CORPORATE IMPACT              │
│                           │                                    │
│          72               │            28                      │
│     ████████████░░░░      │       ███░░░░░░░░░░░░              │
│      Practitioner         │          User                      │
│                           │                                    │
│  "Am I ready to deliver   │  "Has my org enabled               │
│   AI value?"              │   AI delivery?"                    │
├───────────────────────────┴────────────────────────────────────┤
│  GAP: +44 points                                               │
│  → You're ready for more AI responsibility.                    │
│    Consider advocating for AI pilot projects.                  │
└────────────────────────────────────────────────────────────────┘

☐ Show combined score (legacy)
☐ Show scores for all company profiles
```

### 7.3 URL Parameters

- `?companyType=Startup` - pre-select company type
- `?showAll=true` - enable multi-company-profile view
- `?scoreType=combined` - show legacy single score instead of dual
- Checkboxes update URL for shareability/bookmarking

---

## 8. Role-Specific Level Descriptions

**Scope:** 102 total descriptions
- Study: 6 (universal)
- Copy: 6 (universal)
- Output: 30 (6 levels × 5 roles)
- Research: 30 (6 levels × 5 roles)
- Ethical: 30 (6 levels × 5 roles)

### 8.1 Output Dimension by Role

#### General
| Level | Description |
|-------|-------------|
| 0 | No AI usage in any workflow. |
| 1 | Occasional ChatGPT/Copilot use for personal tasks. |
| 2 | Regular AI assistance in daily work. Basic integrations. |
| 3 | AI tools embedded in team workflows. Measurable efficiency gains. |
| 4 | AI-powered processes producing business outcomes. |
| 5 | AI-first approach across multiple workflows. Quantified value. |

#### Developer
| Level | Description |
|-------|-------------|
| 0 | Chat interface only. No deployment or workflow integration. |
| 1 | Personal productivity (Copilot, ChatGPT Plus). Time savings only. |
| 2 | Simple wrapper apps. Basic API integration. ROI not yet quantified. |
| 3 | Internal tools used by team. RAG pipelines. $10k+ verified savings. |
| 4 | Production agentic systems. Revenue-generating. External users. |
| 5 | Vertical AI platform. Fine-tuned models. $100k+ verified value. |

#### Researcher
| Level | Description |
|-------|-------------|
| 0 | No practical AI tool usage. |
| 1 | Uses AI for literature review and summarization. |
| 2 | AI-assisted data analysis and experiment design. |
| 3 | Custom pipelines for research workflows. Reproducible results. |
| 4 | Novel AI methods deployed in production research systems. |
| 5 | Research infrastructure used by others. Published benchmarks. |

#### Support
| Level | Description |
|-------|-------------|
| 0 | No AI tools in support workflows. |
| 1 | Uses AI chatbots for personal research and drafting. |
| 2 | AI-assisted documentation, ticketing, or process automation. |
| 3 | AI tools deployed for team-wide support operations. Metrics tracked. |
| 4 | AI-powered support systems serving customers. Measured satisfaction gains. |
| 5 | AI-first support organization. Industry-recognized efficiency. |

#### Leader
| Level | Description |
|-------|-------------|
| 0 | No awareness of AI's business applications. |
| 1 | Understands AI use cases. Encourages team exploration. |
| 2 | Approved AI tool budgets. Pilot projects underway. |
| 3 | Sponsored AI initiative with measurable outcomes. $10k+ value. |
| 4 | Championed production AI program. $100k+ organizational value. |
| 5 | AI-first organizational strategy. $1M+ documented impact. |

### 8.2 Research Dimension by Role

#### General
| Level | Description |
|-------|-------------|
| 0 | Treats AI as magic. No understanding of mechanisms. |
| 1 | Conceptual understanding: tokens, temperature, context windows. |
| 2 | Knows model architectures. Can explain transformer basics. |
| 3 | Follows AI research developments. Understands recent papers. |
| 4 | Applies research findings to practical problems. |
| 5 | Contributes to AI knowledge sharing within organization. |

#### Developer
| Level | Description |
|-------|-------------|
| 0 | Treats AI as magic. No understanding of mechanisms. |
| 1 | Conceptual understanding: tokens, temperature, context windows. |
| 2 | Architectural knowledge. Understands Transformers. Implements papers. |
| 3 | Contributes: fine-tunes models, publishes weights, shares methods. |
| 4 | Researches: novel architectures, publishes at conferences. |
| 5 | Invents: paradigm-shifting discoveries. Industry-recognized impact. |

#### Researcher
| Level | Description |
|-------|-------------|
| 0 | No AI/ML research background. |
| 1 | Familiar with foundational papers (Attention Is All You Need, etc.). |
| 2 | Replicates published results. Understands methodological nuances. |
| 3 | Publishes incremental improvements. Active in research community. |
| 4 | Novel contributions accepted at top venues (NeurIPS, ICML, etc.). |
| 5 | Field-defining work. H-index impact. Cited by thousands. |

#### Support
| Level | Description |
|-------|-------------|
| 0 | No understanding of how AI works. |
| 1 | Basic concepts: what AI can and cannot do reliably. |
| 2 | Understands limitations relevant to support context. |
| 3 | Can evaluate AI tool capabilities for support use cases. |
| 4 | Contributes to best practices documentation for AI in support. |
| 5 | Recognized expert in AI-augmented support methodologies. |

#### Leader
| Level | Description |
|-------|-------------|
| 0 | No understanding of AI capabilities or limitations. |
| 1 | General awareness of AI trends and business implications. |
| 2 | Can evaluate vendor AI claims. Understands hype vs. reality. |
| 3 | Funded internal AI research or innovation programs. |
| 4 | Organization contributes to AI research (papers, open source, data). |
| 5 | Shapes industry AI research direction. Advisory board positions. |

### 8.3 Ethical Dimension by Role

#### General
| Level | Description |
|-------|-------------|
| 0 | Dangerous. Pastes PII into public models. Ignores bias. |
| 1 | Compliant. Follows rules. Uses only sanctioned tools. |
| 2 | Cautious. Fact-checks outputs. Human-in-the-loop for decisions. |
| 3 | Proactive. Tests for hallucinations. Documents failure modes. |
| 4 | Guardian. Catches risks in others' work. Designs safety protocols. |
| 5 | Leader. Shapes org policies. Trains others on safe practices. |

#### Developer
| Level | Description |
|-------|-------------|
| 0 | Ships AI code without safety considerations. Ignores edge cases. |
| 1 | Basic input validation. Follows team security guidelines. |
| 2 | Implements content filtering. Logs AI decisions for audit. |
| 3 | Designs for failure. Graceful degradation. Bias testing in CI. |
| 4 | Security-first AI architecture. Red team exercises. Incident response. |
| 5 | Publishes AI safety tooling. Contributes to industry standards. |

#### Researcher
| Level | Description |
|-------|-------------|
| 0 | Ignores ethical implications of research. No IRB awareness. |
| 1 | Follows institutional ethics guidelines for AI research. |
| 2 | Documents model limitations. Considers dual-use implications. |
| 3 | Proactive bias analysis. Mechanistic interpretability investigations. |
| 4 | Publishes safety-focused research. Responsible disclosure practices. |
| 5 | Shapes AI safety research agenda. Policy advisory roles. |

#### Support
| Level | Description |
|-------|-------------|
| 0 | Shares customer data with AI tools without consent. |
| 1 | Uses only approved AI tools. Follows data handling policies. |
| 2 | Verifies AI responses before sharing with customers. |
| 3 | Escalates AI failures appropriately. Documents edge cases. |
| 4 | Designs support workflows with AI guardrails. Trains team. |
| 5 | Recognized for AI ethics in customer-facing operations. |

#### Leader
| Level | Description |
|-------|-------------|
| 0 | Deploys AI without governance. Ignores regulatory requirements. |
| 1 | Aware of AI risks. Delegates compliance to legal/IT. |
| 2 | Established basic AI usage policies for organization. |
| 3 | Comprehensive AI governance framework. Regular audits. Training programs. |
| 4 | Organization-wide responsible AI culture. Board-level reporting. |
| 5 | Industry leader in AI governance. Shapes regulatory frameworks. |

---

## 9. Implementation Checklist

### Phase 1: Config & Calculation
- [ ] Create `docs/config/weights-config.json` with all three score types
- [ ] Update `shared.js` to load weights from config file
- [ ] Implement `calculateDualScores(levels, role, companyType)` function
- [ ] Implement `applyCompanyModifier(roleWeights, companyType)` function
- [ ] Add normalization logic (multiply then divide by sum)
- [ ] Calculate gap and generate interpretation text
- [ ] Unit tests for weight calculations

### Phase 2: Schema
- [ ] Update `aiq-report-v1.schema.json` to v1.1
- [ ] Add `companyType` optional field
- [ ] Add role enum (with backward compat for freeform strings)
- [ ] Add `personalScore`, `corporateScore`, `gap` to calculation object
- [ ] Test schema validation with v1.0 and v1.1 reports

### Phase 3: UI
- [ ] Add Company Type dropdown to L1 form
- [ ] Add Company Type dropdown to L2 form
- [ ] Implement dual-score results display (default)
- [ ] Add "Show combined score" toggle for legacy view
- [ ] Add "Show all profiles" checkbox to results
- [ ] Implement multi-score card display
- [ ] Add gap interpretation messaging
- [ ] URL parameter support (`?companyType=`, `?showAll=`, `?scoreType=`)
- [ ] Update PDF export to include both scores and gap

### Phase 4: Descriptions
- [ ] Create `docs/config/level-descriptions.json`
- [ ] Populate Output descriptions (30)
- [ ] Populate Research descriptions (30)
- [ ] Populate Ethical descriptions (30)
- [ ] Update assessment forms to show role-appropriate descriptions

### Phase 5: Testing
- [ ] Test all 15 role × company combinations for both score types
- [ ] Verify no weights go below 0% or above 100%
- [ ] Test backward compatibility with v1.0 reports
- [ ] Cross-browser testing
- [ ] Aggregator script handles v1.0 and v1.1 reports

---

## 10. Migration Notes

### For existing v1.0 reports:
- `schemaVersion: "1.0"` remains valid
- Old role strings (e.g., "Software Engineer") map to "Developer"
- No `companyType` means no modifier applied (equivalent to multipliers of 1.0)
- v1.0 reports display `combinedScore` only; dual scores not available

### Role mapping from v1.0:
| v1.0 Role | v1.1 Role |
|-----------|-----------|
| General | General |
| Software Engineer | Developer |
| Data / ML Engineer | Researcher |
| Product Manager | Support |
| Research Scientist | Researcher |
| Executive / Leader | Leader |
| Operations / Support | Support |
| Legal / Compliance | Support |

---

## 11. Open Questions

1. **Default company type**: Should form default to "None" (no modifier) or require selection?
2. **Aggregator updates**: Does `aggregate.py` need changes for v1.1 fields?
3. **Dashboard**: Should dashboard show breakdown by company type?
4. **Gap thresholds**: Are the 30/10/-10 point thresholds for gap interpretation correct?
5. **HR reporting**: Which score should be primary for performance reviews - Personal, Corporate, or Combined?

---

## Appendix A: Full Weight Matrix (Combined Score)

All 15 role × company combinations after applying modifiers:

### Developer
| Company | Study | Copy | Output | Research | Ethical |
|---------|-------|------|--------|----------|---------|
| (none) | 10% | 25% | 40% | 15% | 10% |
| Startup | 9% | 16% | 51% | 16% | 6% |
| Enterprise | 10% | 30% | 32% | 15% | 10% |
| Aspirational | 8% | 21% | 42% | 19% | 13% |

### Researcher
| Company | Study | Copy | Output | Research | Ethical |
|---------|-------|------|--------|----------|---------|
| (none) | 15% | 25% | 25% | 25% | 10% |
| Startup | 14% | 16% | 32% | 27% | 6% |
| Enterprise | 15% | 30% | 20% | 25% | 10% |
| Aspirational | 12% | 21% | 26% | 31% | 12% |

### Support
| Company | Study | Copy | Output | Research | Ethical |
|---------|-------|------|--------|----------|---------|
| (none) | 25% | 20% | 30% | 10% | 15% |
| Startup | 24% | 13% | 39% | 11% | 10% |
| Enterprise | 25% | 24% | 24% | 10% | 15% |
| Aspirational | 21% | 17% | 31% | 12% | 19% |

### Leader
| Company | Study | Copy | Output | Research | Ethical |
|---------|-------|------|--------|----------|---------|
| (none) | 30% | 15% | 20% | 10% | 25% |
| Startup | 29% | 10% | 27% | 12% | 17% |
| Enterprise | 30% | 18% | 16% | 10% | 25% |
| Aspirational | 25% | 12% | 21% | 12% | 31% |

### General
| Company | Study | Copy | Output | Research | Ethical |
|---------|-------|------|--------|----------|---------|
| (none) | 20% | 30% | 30% | 5% | 15% |
| Startup | 19% | 20% | 40% | 6% | 10% |
| Enterprise | 20% | 36% | 24% | 5% | 15% |
| Aspirational | 17% | 25% | 31% | 6% | 19% |

---

## Appendix B: Example Score Calculation

**Scenario**: Developer at a startup, L1 self-assessment

**Dimension Levels Selected**:
- Study: 4 (reads technical reports, explains failures)
- Copy: 3 (A/B tests, comparative benchmarks)
- Output: 2 (simple wrapper apps, ROI not quantified)
- Research: 2 (architectural knowledge, implements papers)
- Ethical: 3 (designs for failure, bias testing)

**Personal Score Calculation** (Developer + Startup weights):

| Dimension | Level | Points | Weight | Weighted |
|-----------|-------|--------|--------|----------|
| Study | 4 | 14.5 | 24% | 3.48 |
| Copy | 3 | 10.5 | 24% | 2.52 |
| Output | 2 | 8.0 | 34% | 2.72 |
| Research | 2 | 6.5 | 12% | 0.78 |
| Ethical | 3 | 8.0 | 3% | 0.24 |
| **Total** | | | | **9.74** |

Max possible (all level 5): ~17.5
Normalized: 9.74 / 17.5 × 100 = **56%**
After L1 multiplier (0.6): **34%** → User band

**Corporate Score Calculation** (Developer + Startup weights for corporate):

| Dimension | Level | Points | Weight | Weighted |
|-----------|-------|--------|--------|----------|
| Study | 4 | 14.5 | 5% | 0.73 |
| Copy | 3 | 10.5 | 10% | 1.05 |
| Output | 2 | 8.0 | 70% | 5.60 |
| Research | 2 | 6.5 | 10% | 0.65 |
| Ethical | 3 | 8.0 | 5% | 0.40 |
| **Total** | | | | **8.43** |

Max possible: ~19.0
Normalized: 8.43 / 19.0 × 100 = **44%**
After L1 multiplier (0.6): **26%** → User band

**Result Display**:
```
Personal Readiness: 34 (User)
Corporate Impact: 26 (User)
Gap: +8 points → Balanced, continue current trajectory
```

This developer has solid personal skills but hasn't deployed at scale - the small gap indicates their org is providing some opportunity but there's room for bigger projects.
