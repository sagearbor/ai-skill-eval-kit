# AIQ Assessment Decision Flow

```mermaid
flowchart TD
    subgraph START[" "]
        Q{{"What's your<br/>assessment purpose?"}}
    end

    %% Three main paths
    Q -->|"Personal Development"| PD[Personal Dev Path]
    Q -->|"Performance Review<br/>or Team Calibration"| PR[Standard Path]
    Q -->|"Hiring Decision<br/>or Promotion"| HP[Verified Path]

    %% ===== LEVEL 1: SELF (Easiest) =====
    subgraph L1["LEVEL 1: SELF"]
        direction LR
        SA["Self-Assessment<br/>------------------<br/>Time: 5 minutes<br/>Evidence: 0.70x multiplier"]
        SA_E["Evidence Needed:<br/>- Honest self-rating<br/>- Mental inventory of skills<br/>- No artifacts required"]
    end

    PD --> L1
    PR --> L1
    HP --> L1

    %% ===== LEVEL 2: PEER (Standard) =====
    subgraph L2["LEVEL 2: PEER"]
        direction LR
        MC["Peer/Manager Validation<br/>------------------<br/>Time: 30 minutes<br/>Evidence: 0.85x multiplier"]
        MC_E["Evidence Needed:<br/>- Work samples (GitHub, docs)<br/>- Peer feedback<br/>- Manager validation<br/>- Basic artifacts"]
    end

    L1 -->|"Personal Dev<br/>STOPS HERE"| DONE1((Done))
    L1 -->|"Continue for<br/>Reviews/Hiring"| L2

    %% ===== LEVEL 3: AUTO/AUDIT (Most Rigorous) =====
    subgraph L3["LEVEL 3: AUTO/AUDIT"]
        direction LR
        VER["Automated Verification<br/>OR Full Audit<br/>------------------<br/>Time: 2+ hours<br/>Evidence: 1.0x multiplier"]
        VER_E["Evidence Needed:<br/>- Automated tool logs<br/>- Git history analysis<br/>- Quantified impact metrics<br/>- Third-party validation<br/>- ROI documentation"]
    end

    L2 -->|"Standard Review<br/>STOPS HERE"| DONE2((Done))
    L2 -->|"Continue for<br/>Critical Decisions"| L3

    L3 --> DONE3((Done))

    %% ===== CONFIDENCE OUTCOMES =====
    subgraph CONF["Confidence Outcomes"]
        C1["LOW Confidence<br/>(Self-report only)"]
        C2["MEDIUM Confidence<br/>(Peer validated)"]
        C3["HIGH Confidence<br/>(Verified + Measured)"]
    end

    DONE1 -.-> C1
    DONE2 -.-> C2
    DONE3 -.-> C3

    %% Styling
    classDef startStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef level1 fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    classDef level2 fill:#fff9c4,stroke:#f9a825,stroke-width:2px
    classDef level3 fill:#ffcdd2,stroke:#c62828,stroke-width:2px
    classDef endpoint fill:#f5f5f5,stroke:#616161,stroke-width:1px
    classDef confidence fill:#e8eaf6,stroke:#3f51b5,stroke-width:1px

    class Q startStyle
    class L1,SA,SA_E level1
    class L2,MC,MC_E level2
    class L3,VER,VER_E level3
    class DONE1,DONE2,DONE3 endpoint
    class CONF,C1,C2,C3 confidence
```

## How to Read

1. **Start at top** - Identify your assessment purpose
2. **Green (Level 1: Self)** - Quick self-assessment (0.70x), sufficient for personal development
3. **Yellow (Level 2: Peer)** - Peer/manager validation (0.85x), standard rigor for performance reviews
4. **Red (Level 3: Auto/Audit)** - Automated verification or full audit (1.0x), maximum rigor for high-stakes decisions

## Rendering

Works in: GitHub, VS Code (Mermaid extension), [Mermaid Live Editor](https://mermaid.live), Notion, Confluence
