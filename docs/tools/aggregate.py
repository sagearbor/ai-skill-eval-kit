#!/usr/bin/env python3
"""
AIQ Report Aggregator

Aggregates AIQ assessment JSON reports from one or more folders,
producing summary CSV, statistics JSON, and combined JSON outputs
for organizational analytics.

Usage:
    python aggregate.py ./2025-Q1/
    python aggregate.py ./2025-Q1/ ./2025-Q2/ ./2025-Q3/
    python aggregate.py ./2025-Q1/ --output ./reports/

Requirements: Python 3.8+ (stdlib only)
"""

import argparse
import csv
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from statistics import mean
from typing import Any, Dict, List, Optional, Tuple


# CSV column headers (v1.1 with dual scoring)
CSV_HEADERS = [
    "name",
    "role",
    "company_type",
    "assessment_level",
    "period",
    "study_level",
    "study_points",
    "copy_level",
    "copy_points",
    "output_level",
    "output_points",
    "research_level",
    "research_points",
    "ethical_level",
    "ethical_points",
    "personal_score",
    "corporate_score",
    "gap",
    "combined_score",
    "score_band",
    "evidence_multiplier",
    "confidence",
    "validator_name",
    "validated_at",
]

# Dimension keys in order
DIMENSIONS = ["study", "copy", "output", "research", "ethical"]


def parse_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Aggregate AIQ assessment reports for organizational analytics.",
        epilog="Example: python aggregate.py ./2025-Q1/ ./2025-Q2/ --output ./reports/",
    )
    parser.add_argument(
        "folders",
        nargs="+",
        type=Path,
        help="One or more folders containing AIQ JSON reports",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        default=Path("."),
        help="Output directory for generated files (default: current directory)",
    )
    return parser.parse_args()


def find_json_files(folder: Path) -> List[Path]:
    """Recursively find all JSON files in a folder."""
    json_files = []
    if not folder.exists():
        print(f"Warning: Folder does not exist: {folder}", file=sys.stderr)
        return json_files

    for root, _, files in os.walk(folder):
        for filename in files:
            if filename.endswith(".json"):
                json_files.append(Path(root) / filename)

    return json_files


def load_report(filepath: Path) -> Optional[Dict[str, Any]]:
    """Load and validate a single JSON report file."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Validate it has schemaVersion (required for AIQ reports)
        if "schemaVersion" not in data:
            print(f"Warning: Skipping {filepath} - missing schemaVersion", file=sys.stderr)
            return None

        return data

    except json.JSONDecodeError as e:
        print(f"Warning: Skipping {filepath} - invalid JSON: {e}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"Warning: Skipping {filepath} - error: {e}", file=sys.stderr)
        return None


def load_reports(folder_paths: List[Path]) -> List[Tuple[Dict[str, Any], str]]:
    """
    Load all valid JSON reports from the given folders.

    Returns a list of (report, period) tuples where period is the folder name.
    """
    reports = []

    for folder in folder_paths:
        period = folder.name
        json_files = find_json_files(folder)

        folder_count = 0
        for filepath in json_files:
            report = load_report(filepath)
            if report is not None:
                reports.append((report, period))
                folder_count += 1

        if folder_count > 0:
            print(f"Processing {period}: {folder_count} reports")

    return reports


def safe_get(data: Dict[str, Any], *keys, default: Any = "") -> Any:
    """Safely navigate nested dictionary keys, returning default if any key is missing."""
    current = data
    for key in keys:
        if isinstance(current, dict) and key in current:
            current = current[key]
        else:
            return default
    return current if current is not None else default


def extract_row(report: Dict[str, Any], period: str) -> Dict[str, Any]:
    """Extract a CSV row from a report dictionary.

    Handles both v1.0 and v1.1 schema formats.
    """
    schema_version = safe_get(report, "schemaVersion", default="1.0")

    row = {
        "name": safe_get(report, "assessee", "name"),
        "role": safe_get(report, "assessee", "role"),
        "company_type": safe_get(report, "assessee", "companyType", default=""),
        "assessment_level": safe_get(report, "assessmentLevel", default=""),
        "period": period,
    }

    # Extract dimension scores - v1.1 uses "dimensions" at root, v1.0 uses "scores.dimensions"
    if schema_version == "1.1":
        dimensions = safe_get(report, "dimensions", default={})
    else:
        dimensions = safe_get(report, "scores", "dimensions", default={})

    for dim in DIMENSIONS:
        dim_data = dimensions.get(dim, {})
        row[f"{dim}_level"] = safe_get(dim_data, "level", default="")
        row[f"{dim}_points"] = safe_get(dim_data, "points", default="")

    # Extract scores - v1.1 uses "calculation" with dual scores, v1.0 uses "scores"
    if schema_version == "1.1":
        calc = safe_get(report, "calculation", default={})
        row["personal_score"] = safe_get(calc, "personalScore", "normalizedScore", default="")
        row["corporate_score"] = safe_get(calc, "corporateScore", "normalizedScore", default="")
        row["gap"] = safe_get(calc, "gap", default="")
        row["combined_score"] = safe_get(calc, "combinedScore", "normalizedScore", default="")
        row["score_band"] = safe_get(calc, "combinedScore", "scoreBand", default="")
        row["evidence_multiplier"] = safe_get(calc, "evidenceMultiplier", default="")
        row["confidence"] = safe_get(calc, "confidence", default="")
    else:
        # v1.0 format
        scores = safe_get(report, "scores", default={})
        row["personal_score"] = ""
        row["corporate_score"] = ""
        row["gap"] = ""
        row["combined_score"] = safe_get(scores, "finalScore", default="")
        row["score_band"] = safe_get(scores, "band", default="")
        row["evidence_multiplier"] = safe_get(scores, "evidenceMultiplier", default="")
        row["confidence"] = safe_get(scores, "confidence", default="")

    # Extract validation info (L2/L3 only)
    validation = safe_get(report, "validation", default={})
    row["validator_name"] = safe_get(validation, "validatorName", default="")
    row["validated_at"] = safe_get(validation, "validatedAt", default="")

    return row


def calculate_stats(reports: List[Tuple[Dict[str, Any], str]]) -> Dict[str, Any]:
    """Calculate organization-wide statistics from all reports."""
    stats = {
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "periods": [],
        "totalReports": len(reports),
        "byLevel": {},
        "byRole": {},
        "byCompanyType": {},
        "scoreDistribution": {
            "0-20": 0,
            "21-40": 0,
            "41-60": 0,
            "61-80": 0,
            "81-100": 0,
        },
        "dimensionAverages": {},
        "lowestDimension": "",
        "periodTrends": {},
        "gapAnalysis": {
            "avgGap": 0,
            "positiveGaps": 0,
            "negativeGaps": 0,
            "balanced": 0,
        },
    }

    # Track unique periods
    periods_seen = set()

    # Track dimension levels for averaging
    dimension_levels = {dim: [] for dim in DIMENSIONS}

    # Track scores by period
    period_scores: Dict[str, List[int]] = {}

    # Track gaps for v1.1
    gaps: List[int] = []

    for report, period in reports:
        periods_seen.add(period)
        schema_version = safe_get(report, "schemaVersion", default="1.0")

        # Count by assessment level
        level = safe_get(report, "assessmentLevel", default=None)
        if level is not None:
            level_str = str(level)
            stats["byLevel"][level_str] = stats["byLevel"].get(level_str, 0) + 1

        # Count by role
        role = safe_get(report, "assessee", "role", default="")
        if role:
            stats["byRole"][role] = stats["byRole"].get(role, 0) + 1

        # Count by company type (v1.1)
        company_type = safe_get(report, "assessee", "companyType", default="")
        if company_type:
            stats["byCompanyType"][company_type] = stats["byCompanyType"].get(company_type, 0) + 1

        # Score distribution - handle both v1.0 and v1.1
        # v1.1 uses personalScore as primary (individual readiness)
        if schema_version == "1.1":
            final_score = safe_get(report, "calculation", "personalScore", "normalizedScore", default=None)
            gap = safe_get(report, "calculation", "gap", default=None)
            if gap is not None and isinstance(gap, (int, float)):
                gaps.append(int(gap))
                if gap > 10:
                    stats["gapAnalysis"]["positiveGaps"] += 1
                elif gap < -10:
                    stats["gapAnalysis"]["negativeGaps"] += 1
                else:
                    stats["gapAnalysis"]["balanced"] += 1
        else:
            final_score = safe_get(report, "scores", "finalScore", default=None)

        if final_score is not None and isinstance(final_score, (int, float)):
            score = int(final_score)
            if 0 <= score <= 20:
                stats["scoreDistribution"]["0-20"] += 1
            elif 21 <= score <= 40:
                stats["scoreDistribution"]["21-40"] += 1
            elif 41 <= score <= 60:
                stats["scoreDistribution"]["41-60"] += 1
            elif 61 <= score <= 80:
                stats["scoreDistribution"]["61-80"] += 1
            elif 81 <= score <= 100:
                stats["scoreDistribution"]["81-100"] += 1

            # Track for period trends
            if period not in period_scores:
                period_scores[period] = []
            period_scores[period].append(score)

        # Dimension levels for averaging - handle both v1.0 and v1.1
        if schema_version == "1.1":
            dimensions = safe_get(report, "dimensions", default={})
        else:
            dimensions = safe_get(report, "scores", "dimensions", default={})

        for dim in DIMENSIONS:
            level_val = safe_get(dimensions, dim, "level", default=None)
            if level_val is not None and isinstance(level_val, (int, float)):
                dimension_levels[dim].append(float(level_val))

    # Calculate dimension averages
    for dim in DIMENSIONS:
        if dimension_levels[dim]:
            stats["dimensionAverages"][dim] = round(mean(dimension_levels[dim]), 1)
        else:
            stats["dimensionAverages"][dim] = 0.0

    # Find lowest dimension
    if stats["dimensionAverages"]:
        lowest = min(stats["dimensionAverages"].items(), key=lambda x: x[1])
        stats["lowestDimension"] = lowest[0]

    # Calculate average gap (v1.1 reports only)
    if gaps:
        stats["gapAnalysis"]["avgGap"] = round(mean(gaps))

    # Period trends
    for period, scores in period_scores.items():
        if scores:
            stats["periodTrends"][period] = {
                "avgScore": round(mean(scores)),
                "count": len(scores),
            }

    # Sort and store periods
    stats["periods"] = sorted(periods_seen)

    return stats


def write_csv(rows: List[Dict[str, Any]], output_path: Path) -> None:
    """Write CSV file with all report rows."""
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_HEADERS)
        writer.writeheader()
        writer.writerows(rows)


def write_json(data: Any, output_path: Path) -> None:
    """Write JSON file with pretty formatting."""
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def main() -> int:
    """Main entry point."""
    args = parse_args()

    # Ensure output directory exists
    args.output.mkdir(parents=True, exist_ok=True)

    # Load all reports
    print(f"Searching for reports in {len(args.folders)} folder(s)...")
    reports_with_periods = load_reports(args.folders)

    if not reports_with_periods:
        print("Error: No valid reports found.", file=sys.stderr)
        return 1

    print(f"\nFound {len(reports_with_periods)} valid reports across {len(set(p for _, p in reports_with_periods))} period(s)")

    # Extract CSV rows
    rows = [extract_row(report, period) for report, period in reports_with_periods]

    # Calculate statistics
    stats = calculate_stats(reports_with_periods)

    # Prepare combined JSON
    combined = {
        "generatedAt": stats["generatedAt"],
        "reports": [report for report, _ in reports_with_periods],
    }

    # Write output files
    csv_path = args.output / "aiq_summary.csv"
    stats_path = args.output / "aiq_stats.json"
    combined_path = args.output / "aiq_combined.json"

    write_csv(rows, csv_path)
    write_json(stats, stats_path)
    write_json(combined, combined_path)

    print(f"\nWritten:")
    print(f"  - {csv_path} ({len(rows)} rows)")
    print(f"  - {stats_path}")
    print(f"  - {combined_path}")

    # Print summary stats
    print(f"\nStats:")

    # Calculate overall average score
    # v1.1 uses personalScore, v1.0 uses scores.finalScore
    all_scores = []
    for report, _ in reports_with_periods:
        schema_version = report.get("schemaVersion", "1.0")
        if schema_version == "1.1":
            score = safe_get(report, "calculation", "personalScore", "normalizedScore", default=None)
        else:
            score = safe_get(report, "scores", "finalScore", default=None)
        if score is not None and isinstance(score, (int, float)):
            all_scores.append(int(score))

    if all_scores:
        print(f"  Average Score: {round(mean(all_scores))}")

    if stats["lowestDimension"]:
        lowest_dim = stats["lowestDimension"]
        lowest_avg = stats["dimensionAverages"].get(lowest_dim, 0)
        print(f"  Lowest Dimension: {lowest_dim} (avg level: {lowest_avg})")

    # Level distribution
    level_parts = []
    for level in ["1", "2", "3"]:
        count = stats["byLevel"].get(level, 0)
        if count > 0:
            level_parts.append(f"L{level}={count}")
    if level_parts:
        print(f"  Level Distribution: {', '.join(level_parts)}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
