# ai-skill-eval-kit
The Universal AIQ Framework : A standardized, evidence-based system for measuring individual AI competency. Features time-decay modeling for AI skills, and role-based performance weighting.  This repository uses Pandoc-flavor Markdown as the source of truth for the Universal AIQ Framework. It is designed to maintain a high-fidelity documentation pipeline that automatically generates stakeholder-ready outputs.

📂 Repository Structure

.
├── docs/
│   └── ai_mastery_eval.md    # THE SOURCE OF TRUTH (Edit this file)
├── build/
│   └── ai_mastery_eval.docx  # AUTOMATED OUTPUT (Do not edit manually)
├── .github/workflows/
│   └── doc_pipeline.yml      # Automation logic (GitHub Actions)
├── .gitignore                # Python-based ignore rules
└── README.md                 # This file


🚀 Workflow

This repo follows a "Docs-as-Code" methodology:

Edit: All changes should be made directly to the Markdown file in docs/ai_mastery_eval.md.

Commit: When you push your changes to the main or master branch, a GitHub Action is triggered.

Build: The pipeline uses Pandoc to convert the Markdown into a professionally formatted .docx file.

Sync: The action automatically commits the updated .docx file back to the build/ folder.

🛠 Manual Conversion (Local)

If you need to generate the document locally (e.g., for testing formatting):

Prerequisite: Install Pandoc.

# Run from the root of the repo to generate the Word doc
pandoc -s docs/ai_mastery_eval.md -o build/ai_mastery_eval.docx


📥 Importing your original DOCX

To transition your original draft into this framework:

Place your existing .docx in the root folder.

Run the following command to create your new source-of-truth:

pandoc -s "your_original_file.docx" -t markdown -o docs/ai_mastery_eval.md


Clean up the Markdown and commit it to start the automation.

⚖️ Key Framework Concepts

Five Dimensions: KNOW, TEST, SHIP, CREATE, GUARD.

Time Decay: Automatic depreciation of skills ($15 \times 0.5^{years/half-life}$).

Role Weighting: Scores are normalized based on specific professional roles.

Evidence Multiplier: Verified impact yields higher confidence scores.

Universal AIQ Framework v4.0 | 2025 Edition
