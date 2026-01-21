# AIQ Report Aggregation Tools

Tools for aggregating and analyzing AIQ assessment reports across your organization.

## Quick Start

### 1. Collect Reports

Have employees download their JSON reports and submit them to a shared location:

```
assessments/
├── 2025-Q1/
│   ├── alice_l1.json
│   ├── bob_l2.json
│   ├── charlie_l3.json
│   └── ...
├── 2025-Q2/
│   └── ...
```

**Folder naming convention:** Use consistent period names (e.g., `2025-Q1`, `2025-Q2` for quarterly, or `2025-01`, `2025-02` for monthly).

### 2. Run the Aggregator

```bash
# Single period
python aggregate.py ./assessments/2025-Q1/

# Multiple periods (for trend analysis)
python aggregate.py ./assessments/2025-Q1/ ./assessments/2025-Q2/

# Custom output location
python aggregate.py ./assessments/2025-Q1/ --output ./reports/
```

### 3. View the Dashboard

1. Open `dashboard.html` in a web browser
2. Load `aiq_combined.json` when prompted (or place both files in same folder)
3. Explore the four dashboard views:
   - **Score Distribution**: Histogram of AIQ scores
   - **Skill Gaps**: Dimension-level analysis
   - **Leaderboard**: Individual rankings
   - **Trends**: Score changes over time

## Output Files

| File | Description |
|------|-------------|
| `aiq_summary.csv` | One row per person, all scores - ideal for Excel/Sheets |
| `aiq_stats.json` | Org-wide statistics and aggregates |
| `aiq_combined.json` | All reports in one file (feeds the dashboard) |

## Requirements

- **Python 3.8+** (no external packages needed)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## CSV Columns

The summary CSV includes these columns:

| Column | Description |
|--------|-------------|
| name | Assessee name |
| role | Job role |
| assessment_level | 1, 2, or 3 |
| period | Folder/period name |
| study_level | Study dimension level (0-5) |
| study_points | Study dimension points |
| copy_level | Copy dimension level |
| copy_points | Copy dimension points |
| output_level | Output dimension level |
| output_points | Output dimension points |
| research_level | Research dimension level |
| research_points | Research dimension points |
| ethical_level | Ethical dimension level |
| ethical_points | Ethical dimension points |
| raw_total | Sum of weighted scores |
| evidence_multiplier | 0.6, 0.8, or 1.0 |
| final_score | Normalized score (0-100) |
| score_band | Unaware/User/Practitioner/Builder/Architect/Pioneer |
| confidence | LOW/MEDIUM/HIGH |
| validator_name | Validator name (L2+) |
| validated_at | Validation timestamp (L2+) |

Empty strings are used for missing data (not "N/A").

## Validating Reports

Validate individual reports against the JSON Schema before aggregation:

```bash
# Using Python
pip install jsonschema
python -c "
import jsonschema, json
schema = json.load(open('../schemas/aiq-report-v1.schema.json'))
report = json.load(open('report.json'))
jsonschema.validate(report, schema)
print('Valid!')
"

# Using ajv-cli (Node.js)
npx ajv validate -s ../schemas/aiq-report-v1.schema.json -d report.json
```

## Privacy Considerations

- Reports may contain employee names and performance data
- Use anonymization features in the dashboard for presentations
- Ensure proper data handling per your organization's policies
- Consider access controls for the assessment data folders

## Troubleshooting

### "No valid reports found"
- Ensure JSON files have `"schemaVersion": "1.0"` at the root
- Check that files are valid JSON (no syntax errors)
- Verify the folder path is correct

### Dashboard won't load data
- Check browser console for errors
- Ensure `aiq_combined.json` is in the same folder or use file upload
- Large files (1000+ reports) may take a moment to render

### Missing columns in CSV
- The aggregator handles schema variations gracefully
- Missing fields appear as empty strings
- Check source JSON files if specific data is missing

## Schema Versioning

The tools support schema version 1.x reports:
- Version 1.0 is the current release
- Minor version updates (1.1, 1.2) add optional fields
- Backwards compatibility is maintained

## Support

- [Framework Documentation](../ai_mastery_eval.md)
- [JSON Schema](../schemas/aiq-report-v1.schema.json)
- [GitHub Issues](https://github.com/sagearbor/ai-skill-eval-kit/issues)
