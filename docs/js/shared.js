/**
 * AIQ Assessment Tools - Shared Utilities
 * Common constants and functions used across all assessment levels
 */

// =============================================================================
// ROLE WEIGHTS
// =============================================================================

const ROLE_WEIGHTS = {
  'General': { study: 0.20, copy: 0.20, output: 0.30, research: 0.15, ethical: 0.15 },
  'Software Engineer': { study: 0.10, copy: 0.25, output: 0.40, research: 0.15, ethical: 0.10 },
  'Data / ML Engineer': { study: 0.15, copy: 0.30, output: 0.25, research: 0.20, ethical: 0.10 },
  'Product Manager': { study: 0.25, copy: 0.25, output: 0.30, research: 0.10, ethical: 0.10 },
  'Research Scientist': { study: 0.15, copy: 0.20, output: 0.10, research: 0.45, ethical: 0.10 },
  'Executive / Leader': { study: 0.30, copy: 0.15, output: 0.20, research: 0.10, ethical: 0.25 },
  'Operations / Support': { study: 0.20, copy: 0.15, output: 0.40, research: 0.10, ethical: 0.15 },
  'Legal / Compliance': { study: 0.25, copy: 0.15, output: 0.15, research: 0.10, ethical: 0.35 }
};

// =============================================================================
// ROLES LIST
// =============================================================================

const ROLES = [
  'General',
  'Software Engineer',
  'Data / ML Engineer',
  'Product Manager',
  'Research Scientist',
  'Executive / Leader',
  'Operations / Support',
  'Legal / Compliance'
];

// =============================================================================
// DIMENSION DATA
// =============================================================================

const DIMENSIONS = {
  study: {
    name: 'Study',
    fullName: 'S - Study (Information & Fluency)',
    question: 'Where do you learn about AI? Can you explain why things work or fail?',
    levels: [
      { level: 0, points: 0, description: 'No AI awareness. Avoids or fears the technology.' },
      { level: 1, minPoints: 1, maxPoints: 4, midpoint: 2.5, description: 'Mainstream news only. Passive consumption of hype/fear cycles.' },
      { level: 2, minPoints: 5, maxPoints: 8, midpoint: 6.5, description: 'LinkedIn influencers, YouTube "Top 10 Tools" content.' },
      { level: 3, minPoints: 9, maxPoints: 12, midpoint: 10.5, description: 'Developer blogs, release notes, AI-focused newsletters.' },
      { level: 4, minPoints: 13, maxPoints: 16, midpoint: 14.5, description: 'Technical reports, GitHub repos. Can explain why models fail.' },
      { level: 5, minPoints: 17, maxPoints: 20, midpoint: 18.5, description: 'ArXiv papers, model weights, source code. Predicts capability shifts.' }
    ]
  },
  copy: {
    name: 'Copy',
    fullName: 'C - Copy (Evaluation & Rigor)',
    question: 'How do you know if AI output is good? Can you prove it?',
    levels: [
      { level: 0, points: 0, description: 'No validation. Blind trust: "It looks right to me."' },
      { level: 1, minPoints: 1, maxPoints: 4, midpoint: 2.5, description: '"Vibes check." Runs prompt once, manually reviews.' },
      { level: 2, minPoints: 5, maxPoints: 8, midpoint: 6.5, description: 'Maintains test cases. Systematic manual Pass/Fail grading.' },
      { level: 3, minPoints: 9, maxPoints: 12, midpoint: 10.5, description: 'A/B tests models. Comparative benchmarks. Uses eval tools.' },
      { level: 4, minPoints: 13, maxPoints: 16, midpoint: 14.5, description: 'Automated evals. LLM-as-Judge. Quantified metrics (precision, recall).' },
      { level: 5, minPoints: 17, maxPoints: 20, midpoint: 18.5, description: 'Statistical confidence intervals. CI/CD for prompts. Regression testing.' }
    ]
  },
  output: {
    name: 'Output',
    fullName: 'O - Output (Deployment & Impact)',
    question: 'What have you built that others actually use? What value did it create?',
    levels: [
      { level: 0, points: 0, description: 'Chat interface only. No deployment or workflow integration.' },
      { level: 1, minPoints: 1, maxPoints: 5, midpoint: 3, description: 'Personal productivity (Copilot, ChatGPT Plus). Time savings only.' },
      { level: 2, minPoints: 6, maxPoints: 10, midpoint: 8, description: 'Simple wrapper apps. Basic API integration. Likely negative ROI.' },
      { level: 3, minPoints: 11, maxPoints: 15, midpoint: 13, description: 'Internal tools used by team. RAG pipelines. $10k+ verified savings.' },
      { level: 4, minPoints: 16, maxPoints: 20, midpoint: 18, description: 'Production agentic systems. Revenue-generating. External users.' },
      { level: 5, minPoints: 21, maxPoints: 25, midpoint: 23, description: 'Vertical AI platform. Fine-tuned models. $100k+ verified value.' }
    ]
  },
  research: {
    name: 'Research',
    fullName: 'R - Research (Innovation & Contribution)',
    question: 'Do you advance the field or just consume it?',
    levels: [
      { level: 0, points: 0, description: 'Treats AI as magic. No understanding of mechanisms.' },
      { level: 1, minPoints: 1, maxPoints: 4, midpoint: 2.5, description: 'Conceptual understanding: tokens, temperature, context windows.' },
      { level: 2, minPoints: 5, maxPoints: 8, midpoint: 6.5, description: 'Architectural knowledge. Understands Transformers. Implements papers.' },
      { level: 3, minPoints: 9, maxPoints: 12, midpoint: 10.5, description: 'Contributes: fine-tunes models, publishes weights, shares methods.' },
      { level: 4, minPoints: 13, maxPoints: 16, midpoint: 14.5, description: 'Researches: novel architectures, publishes at conferences.' },
      { level: 5, minPoints: 17, maxPoints: 20, midpoint: 18.5, description: 'Invents: paradigm-shifting discoveries. Industry-recognized impact.' }
    ]
  },
  ethical: {
    name: 'Ethical',
    fullName: 'Es - Ethical Security (Safety & Responsibility)',
    question: 'Can you be trusted with AI? Do you use it safely?',
    levels: [
      { level: 0, points: 0, description: 'Dangerous. Pastes PII into public models. Ignores bias.' },
      { level: 1, minPoints: 1, maxPoints: 3, midpoint: 2, description: 'Compliant. Follows rules. Uses only sanctioned tools.' },
      { level: 2, minPoints: 4, maxPoints: 6, midpoint: 5, description: 'Cautious. Fact-checks outputs. Human-in-the-loop for decisions.' },
      { level: 3, minPoints: 7, maxPoints: 9, midpoint: 8, description: 'Proactive. Tests for hallucinations. Documents failure modes.' },
      { level: 4, minPoints: 10, maxPoints: 12, midpoint: 11, description: 'Guardian. Catches risks in others\' work. Designs safety protocols.' },
      { level: 5, minPoints: 13, maxPoints: 15, midpoint: 14, description: 'Leader. Shapes org policies. Trains others on safe practices.' }
    ]
  }
};

// =============================================================================
// SCORE BANDS
// =============================================================================

const SCORE_BANDS = [
  { min: 0, max: 20, name: 'Unaware', description: 'No meaningful AI adoption. At risk of displacement.' },
  { min: 21, max: 40, name: 'User', description: 'Basic AI usage. Follows instructions. Needs supervision.' },
  { min: 41, max: 60, name: 'Practitioner', description: 'Daily productive use. Can evaluate quality. ~25% efficiency gain.' },
  { min: 61, max: 80, name: 'Builder', description: 'Deploys reliable systems. Creates measurable business value.' },
  { min: 81, max: 95, name: 'Architect', description: 'Advances practices. Mentors others. Trusted for critical work.' },
  { min: 96, max: 100, name: 'Pioneer', description: 'Industry-recognized contribution. Shapes how AI is used.' }
];

// =============================================================================
// EVIDENCE MULTIPLIERS
// =============================================================================

const EVIDENCE_MULTIPLIERS = {
  1: { multiplier: 0.6, confidence: 'LOW', description: 'Self-report only' },
  2: { multiplier: 0.8, confidence: 'MEDIUM', description: 'Peer/manager validated' },
  3: { multiplier: 1.0, confidence: 'HIGH', description: 'Auto/Audit verified' }
};

// =============================================================================
// AI TOOLS LIST (for Level 3)
// =============================================================================

const AI_TOOLS = {
  consumer: [
    { id: 'chatgpt', name: 'ChatGPT', provider: 'OpenAI' },
    { id: 'claudeai', name: 'Claude.ai', provider: 'Anthropic' },
    { id: 'copilot', name: 'Microsoft Copilot', provider: 'Microsoft' },
    { id: 'gemini', name: 'Google Gemini', provider: 'Google' },
    { id: 'perplexity', name: 'Perplexity', provider: 'Perplexity AI' }
  ],
  developer: [
    { id: 'githubCopilot', name: 'GitHub Copilot', provider: 'GitHub/Microsoft' },
    { id: 'claudeCode', name: 'Claude Code', provider: 'Anthropic' },
    { id: 'openaiApi', name: 'OpenAI API', provider: 'OpenAI' },
    { id: 'cursor', name: 'Cursor', provider: 'Anysphere' },
    { id: 'replitAi', name: 'Replit AI', provider: 'Replit' }
  ]
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get points for a given level in a dimension (uses midpoint for ranges)
 * @param {string} dimension - The dimension key (study, copy, output, research, ethical)
 * @param {number} level - The level (0-5)
 * @returns {number} The points value for that level
 */
function getPointsForLevel(dimension, level) {
  const dim = DIMENSIONS[dimension];
  if (!dim) {
    console.error(`Unknown dimension: ${dimension}`);
    return 0;
  }

  const levelData = dim.levels.find(l => l.level === level);
  if (!levelData) {
    console.error(`Unknown level ${level} for dimension ${dimension}`);
    return 0;
  }

  // Level 0 has explicit points, others use midpoint
  if (level === 0) {
    return levelData.points;
  }
  return levelData.midpoint;
}

/**
 * Get the maximum possible points for a dimension (level 5 midpoint)
 * @param {string} dimension - The dimension key
 * @returns {number} Maximum points for this dimension
 */
function getMaxPointsForDimension(dimension) {
  return getPointsForLevel(dimension, 5);
}

/**
 * Calculate weighted score for a single dimension
 * @param {string} dimension - The dimension key
 * @param {number} level - The level (0-5)
 * @param {string} role - The role name
 * @returns {object} { rawPoints, weight, weightedScore }
 */
function calculateDimensionScore(dimension, level, role) {
  const weights = ROLE_WEIGHTS[role] || ROLE_WEIGHTS['General'];
  const rawPoints = getPointsForLevel(dimension, level);
  const weight = weights[dimension];
  const weightedScore = rawPoints * weight;

  return {
    rawPoints,
    weight,
    weightedScore
  };
}

/**
 * Calculate the maximum possible weighted score for a role
 * @param {string} role - The role name
 * @returns {number} Maximum weighted score
 */
function getMaxWeightedScore(role) {
  const weights = ROLE_WEIGHTS[role] || ROLE_WEIGHTS['General'];
  let maxScore = 0;

  for (const dimension of Object.keys(DIMENSIONS)) {
    const maxPoints = getMaxPointsForDimension(dimension);
    maxScore += maxPoints * weights[dimension];
  }

  return maxScore;
}

/**
 * Normalize raw weighted score to 0-100 scale
 * @param {number} rawWeightedTotal - The raw weighted total
 * @param {string} role - The role name (needed to calculate max possible)
 * @returns {number} Normalized score (0-100)
 */
function normalizeScore(rawWeightedTotal, role) {
  const maxPossible = getMaxWeightedScore(role);
  if (maxPossible === 0) return 0;
  return Math.round((rawWeightedTotal / maxPossible) * 100);
}

/**
 * Get score band from normalized score
 * @param {number} normalizedScore - Score from 0-100
 * @returns {object} The matching score band { min, max, name, description }
 */
function getScoreBand(normalizedScore) {
  for (const band of SCORE_BANDS) {
    if (normalizedScore >= band.min && normalizedScore <= band.max) {
      return band;
    }
  }
  // Fallback to first band if score is somehow out of range
  return SCORE_BANDS[0];
}

/**
 * Calculate total AIQ score
 * @param {object} levels - Object with dimension levels { study: 3, copy: 2, output: 4, research: 1, ethical: 3 }
 * @param {string} role - The role name
 * @param {number} assessmentLevel - The assessment level (1, 2, or 3)
 * @returns {object} Complete score breakdown
 */
function calculateAIQScore(levels, role, assessmentLevel) {
  const dimensions = {};
  let rawWeightedTotal = 0;

  // Calculate each dimension
  for (const [dimKey, dimLevel] of Object.entries(levels)) {
    const dimScore = calculateDimensionScore(dimKey, dimLevel, role);
    dimensions[dimKey] = {
      level: dimLevel,
      rawPoints: dimScore.rawPoints,
      weight: dimScore.weight,
      weightedScore: dimScore.weightedScore,
      levelDescription: DIMENSIONS[dimKey].levels.find(l => l.level === dimLevel)?.description || ''
    };
    rawWeightedTotal += dimScore.weightedScore;
  }

  // Get evidence multiplier
  const evidenceData = EVIDENCE_MULTIPLIERS[assessmentLevel] || EVIDENCE_MULTIPLIERS[1];
  const evidenceMultiplier = evidenceData.multiplier;
  const confidence = evidenceData.confidence;

  // Apply evidence multiplier to get final weighted score
  const finalWeightedScore = rawWeightedTotal * evidenceMultiplier;

  // Normalize to 0-100
  // We apply the multiplier before normalization so it affects the final percentage
  const maxPossible = getMaxWeightedScore(role);
  const normalizedScore = Math.round((finalWeightedScore / maxPossible) * 100);

  // Get score band
  const scoreBand = getScoreBand(normalizedScore);

  return {
    rawWeightedTotal: Math.round(rawWeightedTotal * 100) / 100,
    evidenceMultiplier,
    finalWeightedScore: Math.round(finalWeightedScore * 100) / 100,
    normalizedScore,
    scoreBand,
    confidence,
    dimensions
  };
}

/**
 * Format date as ISO string (YYYY-MM-DD)
 * @param {Date} date - Date object (defaults to now)
 * @returns {string} ISO date string
 */
function formatISODate(date = new Date()) {
  return date.toISOString().split('T')[0];
}

/**
 * Format date as full ISO timestamp
 * @param {Date} date - Date object (defaults to now)
 * @returns {string} ISO timestamp string
 */
function formatISOTimestamp(date = new Date()) {
  return date.toISOString();
}

/**
 * Generate unique report ID
 * Format: AIQ-YYYYMMDD-XXXXXX (where X is random alphanumeric)
 * @returns {string} Unique report ID
 */
function generateReportId() {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `AIQ-${dateStr}-${random}`;
}

/**
 * Base64 encode data for URL state
 * @param {object} data - Object to encode
 * @returns {string} Base64 encoded string (URL-safe)
 */
function encodeState(data) {
  try {
    const jsonStr = JSON.stringify(data);
    // Use btoa for base64, then make URL-safe
    const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
    // Make URL-safe: replace + with -, / with _, remove =
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    console.error('Error encoding state:', e);
    return '';
  }
}

/**
 * Base64 decode URL state back to data
 * @param {string} encoded - Base64 encoded string (URL-safe)
 * @returns {object|null} Decoded object or null if invalid
 */
function decodeState(encoded) {
  try {
    // Restore from URL-safe: replace - with +, _ with /
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonStr = decodeURIComponent(escape(atob(base64)));
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Error decoding state:', e);
    return null;
  }
}

/**
 * Get URL parameter by name
 * @param {string} name - Parameter name
 * @returns {string|null} Parameter value or null
 */
function getUrlParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * Set URL parameter without page reload
 * @param {string} name - Parameter name
 * @param {string} value - Parameter value
 */
function setUrlParam(name, value) {
  const url = new URL(window.location);
  url.searchParams.set(name, value);
  window.history.replaceState({}, '', url);
}

/**
 * Populate a select element with role options
 * @param {HTMLSelectElement} selectElement - The select element to populate
 * @param {string} selectedRole - Optional role to pre-select
 */
function populateRoleSelect(selectElement, selectedRole = 'General') {
  selectElement.innerHTML = '';
  for (const role of ROLES) {
    const option = document.createElement('option');
    option.value = role;
    option.textContent = role;
    if (role === selectedRole) {
      option.selected = true;
    }
    selectElement.appendChild(option);
  }
}

/**
 * Get level description for a dimension and level
 * @param {string} dimension - Dimension key
 * @param {number} level - Level number (0-5)
 * @returns {string} Level description
 */
function getLevelDescription(dimension, level) {
  const dim = DIMENSIONS[dimension];
  if (!dim) return '';
  const levelData = dim.levels.find(l => l.level === level);
  return levelData ? levelData.description : '';
}

/**
 * Create a basic AIQ report object structure
 * @param {object} params - Report parameters
 * @returns {object} Report object matching schema
 */
function createReportObject(params) {
  const {
    assesseeName = '',
    assesseeEmail = '',
    role = 'General',
    levels = {},
    assessmentLevel = 1,
    validatorName = '',
    validatorEmail = '',
    notes = ''
  } = params;

  const score = calculateAIQScore(levels, role, assessmentLevel);

  return {
    schemaVersion: '1.0',
    reportId: generateReportId(),
    generatedAt: formatISOTimestamp(),
    assessmentLevel,
    assessee: {
      name: assesseeName,
      email: assesseeEmail,
      role
    },
    validator: assessmentLevel >= 2 ? {
      name: validatorName,
      email: validatorEmail
    } : undefined,
    scores: {
      dimensions: Object.fromEntries(
        Object.entries(score.dimensions).map(([key, val]) => [
          key,
          {
            level: val.level,
            points: val.rawPoints,
            weight: val.weight,
            weightedScore: val.weightedScore
          }
        ])
      ),
      rawTotal: score.rawWeightedTotal,
      evidenceMultiplier: score.evidenceMultiplier,
      confidence: score.confidence,
      finalScore: score.normalizedScore,
      band: score.scoreBand.name
    },
    notes: notes || undefined
  };
}

// =============================================================================
// EXPORT TO GLOBAL SCOPE
// =============================================================================

// Make everything available globally for non-module usage
window.ROLE_WEIGHTS = ROLE_WEIGHTS;
window.ROLES = ROLES;
window.DIMENSIONS = DIMENSIONS;
window.SCORE_BANDS = SCORE_BANDS;
window.EVIDENCE_MULTIPLIERS = EVIDENCE_MULTIPLIERS;
window.AI_TOOLS = AI_TOOLS;

window.getPointsForLevel = getPointsForLevel;
window.getMaxPointsForDimension = getMaxPointsForDimension;
window.calculateDimensionScore = calculateDimensionScore;
window.getMaxWeightedScore = getMaxWeightedScore;
window.normalizeScore = normalizeScore;
window.getScoreBand = getScoreBand;
window.calculateAIQScore = calculateAIQScore;
window.formatISODate = formatISODate;
window.formatISOTimestamp = formatISOTimestamp;
window.generateReportId = generateReportId;
window.encodeState = encodeState;
window.decodeState = decodeState;
window.getUrlParam = getUrlParam;
window.setUrlParam = setUrlParam;
window.populateRoleSelect = populateRoleSelect;
window.getLevelDescription = getLevelDescription;
window.createReportObject = createReportObject;
