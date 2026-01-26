/**
 * AIQ Assessment Tools - Shared Utilities
 * Common constants and functions used across all assessment levels
 * Version 1.1 - Adds dual scoring (Personal Readiness + Corporate Impact)
 */

// =============================================================================
// ROLES & COMPANY TYPES (v1.1)
// =============================================================================

const ROLES = [
  'General',
  'Developer',
  'Researcher',
  'Support',
  'Leader'
];

const COMPANY_TYPES = [
  'Startup',
  'Enterprise',
  'Aspirational'
];

// =============================================================================
// FALLBACK ROLE WEIGHTS (used before config loads)
// These are the "combined" weights for backwards compatibility
// =============================================================================

const ROLE_WEIGHTS = {
  'General': { study: 0.20, copy: 0.30, output: 0.30, research: 0.05, ethical: 0.15 },
  'Developer': { study: 0.10, copy: 0.25, output: 0.40, research: 0.15, ethical: 0.10 },
  'Researcher': { study: 0.15, copy: 0.25, output: 0.25, research: 0.25, ethical: 0.10 },
  'Support': { study: 0.25, copy: 0.20, output: 0.30, research: 0.10, ethical: 0.15 },
  'Leader': { study: 0.30, copy: 0.15, output: 0.20, research: 0.10, ethical: 0.25 }
};

// =============================================================================
// CONFIG CACHING
// =============================================================================

let weightsConfig = null;
let levelDescriptions = null;
let configLoadPromise = null;
let descriptionsLoadPromise = null;

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
// CONFIG LOADING FUNCTIONS
// =============================================================================

/**
 * Get the base path for config files
 * @returns {string} Base path
 */
function getConfigBasePath() {
  const basePath = window.location.pathname.replace(/\/[^\/]*$/, '');
  return `${window.location.origin}${basePath}`;
}

/**
 * Load weights configuration from config file
 * @returns {Promise<object>} Weights configuration
 */
async function loadWeightsConfig() {
  if (weightsConfig) return weightsConfig;

  if (configLoadPromise) return configLoadPromise;

  configLoadPromise = (async () => {
    try {
      const response = await fetch(`${getConfigBasePath()}/config/weights-config.json`);
      if (!response.ok) {
        console.warn('Could not load weights config, using defaults');
        return null;
      }
      weightsConfig = await response.json();
      return weightsConfig;
    } catch (error) {
      console.warn('Error loading weights config:', error);
      return null;
    }
  })();

  return configLoadPromise;
}

/**
 * Load level descriptions from config file
 * @returns {Promise<object>} Level descriptions
 */
async function loadLevelDescriptions() {
  if (levelDescriptions) return levelDescriptions;

  if (descriptionsLoadPromise) return descriptionsLoadPromise;

  descriptionsLoadPromise = (async () => {
    try {
      const response = await fetch(`${getConfigBasePath()}/config/level-descriptions.json`);
      if (!response.ok) {
        console.warn('Could not load level descriptions, using defaults');
        return null;
      }
      levelDescriptions = await response.json();
      return levelDescriptions;
    } catch (error) {
      console.warn('Error loading level descriptions:', error);
      return null;
    }
  })();

  return descriptionsLoadPromise;
}

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

// =============================================================================
// COMPANY MODIFIER FUNCTIONS (v1.1)
// =============================================================================

/**
 * Apply company type modifier to role weights
 * @param {object} roleWeights - Base role weights { study, copy, output, research, ethical }
 * @param {string} companyType - Company type (Startup, Enterprise, Aspirational) or null
 * @returns {object} Modified weights (renormalized to sum to 1.0)
 */
function applyCompanyModifier(roleWeights, companyType) {
  if (!companyType || !weightsConfig?.companyModifiers?.[companyType]) {
    return roleWeights;
  }

  const modifiers = weightsConfig.companyModifiers[companyType].modifiers;

  // Apply multipliers
  const modified = {};
  let total = 0;

  for (const dim of Object.keys(roleWeights)) {
    modified[dim] = roleWeights[dim] * (modifiers[dim] || 1.0);
    total += modified[dim];
  }

  // Renormalize to sum to 1.0
  for (const dim of Object.keys(modified)) {
    modified[dim] = modified[dim] / total;
  }

  return modified;
}

/**
 * Get weights for a specific score type and role
 * @param {string} scoreType - 'personal', 'corporate', or 'combined'
 * @param {string} role - Role name
 * @param {string} companyType - Company type or null
 * @returns {object} Weights object { study, copy, output, research, ethical }
 */
function getWeightsForScoreType(scoreType, role, companyType) {
  let baseWeights;

  if (weightsConfig?.scoreTypes?.[scoreType]?.roles?.[role]) {
    baseWeights = { ...weightsConfig.scoreTypes[scoreType].roles[role] };
  } else {
    // Fallback to combined weights
    baseWeights = { ...(ROLE_WEIGHTS[role] || ROLE_WEIGHTS['General']) };
  }

  return applyCompanyModifier(baseWeights, companyType);
}

// =============================================================================
// DUAL SCORING FUNCTIONS (v1.1)
// =============================================================================

/**
 * Calculate a single score (personal, corporate, or combined)
 * @param {object} levels - Object with dimension levels { study: 3, copy: 2, ... }
 * @param {object} weights - Weights for each dimension
 * @param {number} evidenceMultiplier - Evidence multiplier (0.6, 0.8, or 1.0)
 * @returns {object} Score details { rawTotal, normalizedScore, scoreBand }
 */
function calculateSingleScore(levels, weights, evidenceMultiplier) {
  let rawWeightedTotal = 0;
  let maxPossible = 0;

  for (const [dimKey, dimLevel] of Object.entries(levels)) {
    const rawPoints = getPointsForLevel(dimKey, dimLevel);
    const weight = weights[dimKey] || 0;
    rawWeightedTotal += rawPoints * weight;
    maxPossible += getMaxPointsForDimension(dimKey) * weight;
  }

  // Apply evidence multiplier
  const finalWeightedScore = rawWeightedTotal * evidenceMultiplier;

  // Normalize to 0-100
  const normalizedScore = maxPossible > 0
    ? Math.round((finalWeightedScore / maxPossible) * 100)
    : 0;

  const scoreBand = getScoreBand(normalizedScore);

  return {
    rawTotal: Math.round(rawWeightedTotal * 100) / 100,
    normalizedScore,
    scoreBand: scoreBand.name
  };
}

/**
 * Get gap interpretation based on personal - corporate gap
 * @param {number} gap - personalScore - corporateScore
 * @returns {object} { meaning, action }
 */
function getGapInterpretation(gap) {
  if (weightsConfig?.gapInterpretation) {
    const gi = weightsConfig.gapInterpretation;

    if (gap > gi.highPositive.threshold) {
      return { meaning: gi.highPositive.meaning, action: gi.highPositive.action };
    } else if (gap >= gi.moderatePositive.minThreshold) {
      return { meaning: gi.moderatePositive.meaning, action: gi.moderatePositive.action };
    } else if (gap >= gi.balanced.minThreshold) {
      return { meaning: gi.balanced.meaning, action: gi.balanced.action };
    } else {
      return { meaning: gi.negative.meaning, action: gi.negative.action };
    }
  }

  // Fallback defaults
  if (gap > 30) {
    return { meaning: 'High individual readiness, low org enablement', action: 'Advocate for AI pilot projects' };
  } else if (gap >= 10) {
    return { meaning: 'Moderate gap', action: 'Seek deployment opportunities' };
  } else if (gap >= -10) {
    return { meaning: 'Balanced', action: 'Continue current trajectory' };
  } else {
    return { meaning: 'Org ahead of individual', action: 'Invest in learning/upskilling' };
  }
}

/**
 * Calculate dual scores (Personal Readiness + Corporate Impact + Combined)
 * @param {object} levels - Object with dimension levels { study: 3, copy: 2, ... }
 * @param {string} role - The role name
 * @param {string} companyType - Company type or null
 * @param {number} assessmentLevel - The assessment level (1, 2, or 3)
 * @returns {object} Complete dual score breakdown
 */
function calculateDualScores(levels, role, companyType, assessmentLevel) {
  const evidenceData = EVIDENCE_MULTIPLIERS[assessmentLevel] || EVIDENCE_MULTIPLIERS[1];
  const evidenceMultiplier = evidenceData.multiplier;
  const confidence = evidenceData.confidence;

  // Get weights for each score type
  const personalWeights = getWeightsForScoreType('personal', role, companyType);
  const corporateWeights = getWeightsForScoreType('corporate', role, companyType);
  const combinedWeights = getWeightsForScoreType('combined', role, companyType);

  // Calculate each score
  const personalScore = calculateSingleScore(levels, personalWeights, evidenceMultiplier);
  const corporateScore = calculateSingleScore(levels, corporateWeights, evidenceMultiplier);
  const combinedScore = calculateSingleScore(levels, combinedWeights, evidenceMultiplier);

  // Calculate gap
  const gap = personalScore.normalizedScore - corporateScore.normalizedScore;
  const gapInterpretation = getGapInterpretation(gap);

  // Build dimension details (using combined weights for the dimensions breakdown)
  const dimensions = {};
  for (const [dimKey, dimLevel] of Object.entries(levels)) {
    const rawPoints = getPointsForLevel(dimKey, dimLevel);
    const weight = combinedWeights[dimKey];
    dimensions[dimKey] = {
      level: dimLevel,
      rawPoints,
      weight,
      weightedScore: rawPoints * weight,
      levelDescription: DIMENSIONS[dimKey].levels.find(l => l.level === dimLevel)?.description || ''
    };
  }

  return {
    personalScore,
    corporateScore,
    combinedScore,
    gap,
    gapInterpretation,
    evidenceMultiplier,
    confidence,
    dimensions,
    // Legacy fields for compatibility
    rawWeightedTotal: combinedScore.rawTotal,
    finalWeightedScore: combinedScore.rawTotal * evidenceMultiplier,
    normalizedScore: combinedScore.normalizedScore,
    scoreBand: getScoreBand(combinedScore.normalizedScore)
  };
}

/**
 * Calculate weighted score for a single dimension (legacy support)
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
 * Calculate the maximum possible weighted score for a role (legacy support)
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
 * Normalize raw weighted score to 0-100 scale (legacy support)
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
 * Calculate total AIQ score (legacy function - now uses dual scoring internally)
 * @param {object} levels - Object with dimension levels { study: 3, copy: 2, output: 4, research: 1, ethical: 3 }
 * @param {string} role - The role name
 * @param {number} assessmentLevel - The assessment level (1, 2, or 3)
 * @param {string} companyType - Optional company type
 * @returns {object} Complete score breakdown (v1.1 format with dual scores)
 */
function calculateAIQScore(levels, role, assessmentLevel, companyType = null) {
  return calculateDualScores(levels, role, companyType, assessmentLevel);
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
 * Remove URL parameter without page reload
 * @param {string} name - Parameter name
 */
function removeUrlParam(name) {
  const url = new URL(window.location);
  url.searchParams.delete(name);
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
 * Populate a select element with company type options
 * @param {HTMLSelectElement} selectElement - The select element to populate
 * @param {string} selectedType - Optional type to pre-select
 * @param {boolean} includeNone - Whether to include a "None" option
 */
function populateCompanyTypeSelect(selectElement, selectedType = '', includeNone = true) {
  selectElement.innerHTML = '';

  if (includeNone) {
    const noneOption = document.createElement('option');
    noneOption.value = '';
    noneOption.textContent = '-- None (standard weights) --';
    if (!selectedType) {
      noneOption.selected = true;
    }
    selectElement.appendChild(noneOption);
  }

  for (const type of COMPANY_TYPES) {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    if (type === selectedType) {
      option.selected = true;
    }
    selectElement.appendChild(option);
  }
}

/**
 * Get level description for a dimension and level
 * Uses role-specific descriptions for output, research, ethical if available
 * @param {string} dimension - Dimension key
 * @param {number} level - Level number (0-5)
 * @param {string} role - Optional role for role-specific descriptions
 * @returns {string} Level description
 */
function getLevelDescription(dimension, level, role = null) {
  // Check for role-specific description in loaded config
  if (levelDescriptions && role) {
    const roleSpecific = levelDescriptions.roleSpecific?.[dimension]?.[role];
    if (roleSpecific) {
      const levelData = roleSpecific.find(l => l.level === level);
      if (levelData) return levelData.description;
    }
  }

  // Check for universal description in loaded config
  if (levelDescriptions) {
    const universal = levelDescriptions.universal?.[dimension];
    if (universal) {
      const levelData = universal.find(l => l.level === level);
      if (levelData) return levelData.description;
    }
  }

  // Fallback to DIMENSIONS constant
  const dim = DIMENSIONS[dimension];
  if (!dim) return '';
  const levelData = dim.levels.find(l => l.level === level);
  return levelData ? levelData.description : '';
}

/**
 * Create a basic AIQ report object structure (v1.1 format)
 * @param {object} params - Report parameters
 * @returns {object} Report object matching schema
 */
function createReportObject(params) {
  const {
    assesseeName = '',
    assesseeEmail = '',
    role = 'General',
    companyType = null,
    levels = {},
    assessmentLevel = 1,
    validatorName = '',
    validatorEmail = '',
    notes = ''
  } = params;

  const score = calculateDualScores(levels, role, companyType, assessmentLevel);

  const report = {
    schemaVersion: '1.1',
    reportType: assessmentLevel === 1 ? 'self-assessment' : (assessmentLevel === 2 ? 'peer-validation' : 'full-verification'),
    reportId: generateReportId(),
    generatedAt: formatISOTimestamp(),
    assessmentLevel,
    assessee: {
      name: assesseeName,
      email: assesseeEmail || '',
      role
    },
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
    calculation: {
      personalScore: {
        rawTotal: score.personalScore.rawTotal,
        normalizedScore: score.personalScore.normalizedScore,
        scoreBand: score.personalScore.scoreBand
      },
      corporateScore: {
        rawTotal: score.corporateScore.rawTotal,
        normalizedScore: score.corporateScore.normalizedScore,
        scoreBand: score.corporateScore.scoreBand
      },
      gap: score.gap,
      combinedScore: {
        rawTotal: score.combinedScore.rawTotal,
        normalizedScore: score.combinedScore.normalizedScore,
        scoreBand: score.combinedScore.scoreBand
      },
      evidenceMultiplier: score.evidenceMultiplier,
      confidence: score.confidence
    }
  };

  // Add companyType if provided
  if (companyType) {
    report.assessee.companyType = companyType;
  }

  // Add notes if provided
  if (notes) {
    report.notes = notes;
  }

  return report;
}

// =============================================================================
// JSON SCHEMA VALIDATION
// =============================================================================

// Cache for the loaded schema
let cachedSchema = null;
let cachedAjvInstance = null;

/**
 * Validate a report object against the AIQ JSON Schema
 * @param {object} report - The report object to validate
 * @returns {Promise<{valid: boolean, errors: string[]}>} Validation result with user-friendly errors
 */
async function validateReportSchema(report) {
  // Graceful fallback if Ajv is not loaded
  if (typeof Ajv === 'undefined') {
    console.warn('Ajv library not loaded - skipping schema validation');
    return { valid: true, errors: [] };
  }

  try {
    // Fetch and cache the schema if not already loaded
    if (!cachedSchema) {
      const schemaUrl = getSchemaUrl();
      const response = await fetch(schemaUrl);
      if (!response.ok) {
        console.error('Failed to fetch schema:', response.status);
        return { valid: true, errors: [] }; // Graceful fallback
      }
      cachedSchema = await response.json();
    }

    // Create Ajv instance if not already created
    if (!cachedAjvInstance) {
      cachedAjvInstance = new Ajv({
        allErrors: true,
        strict: false
      });
    }

    // Compile and validate
    const validate = cachedAjvInstance.compile(cachedSchema);
    const valid = validate(report);

    if (valid) {
      return { valid: true, errors: [] };
    }

    // Convert Ajv errors to user-friendly messages
    const errors = formatValidationErrors(validate.errors);

    // Log full errors to console for debugging
    console.error('Schema validation errors:', validate.errors);

    return { valid: false, errors };
  } catch (error) {
    console.error('Schema validation error:', error);
    return { valid: true, errors: [] }; // Graceful fallback on error
  }
}

/**
 * Get the schema URL (works both locally and on GitHub Pages)
 * @returns {string} The URL to the schema file
 */
function getSchemaUrl() {
  // Get base path from current location
  const basePath = window.location.pathname.replace(/\/[^\/]*$/, '');
  return `${window.location.origin}${basePath}/schemas/aiq-report-v1.schema.json`;
}

/**
 * Convert Ajv errors to user-friendly messages
 * @param {Array} ajvErrors - Array of Ajv error objects
 * @returns {string[]} Array of user-friendly error messages
 */
function formatValidationErrors(ajvErrors) {
  if (!ajvErrors || ajvErrors.length === 0) {
    return [];
  }

  const friendlyMessages = [];
  const seenPaths = new Set();

  for (const error of ajvErrors) {
    const path = error.instancePath || 'root';

    // Avoid duplicate messages for the same path
    const msgKey = `${path}:${error.keyword}`;
    if (seenPaths.has(msgKey)) continue;
    seenPaths.add(msgKey);

    let message = '';
    const fieldName = path.split('/').pop() || 'Report';

    switch (error.keyword) {
      case 'required':
        message = `Missing required field: ${error.params.missingProperty}`;
        break;
      case 'minLength':
        message = `"${fieldName}" cannot be empty`;
        break;
      case 'type':
        message = `"${fieldName}" has incorrect type (expected ${error.params.type})`;
        break;
      case 'enum':
        message = `"${fieldName}" has invalid value. Allowed values: ${error.params.allowedValues.join(', ')}`;
        break;
      case 'minimum':
      case 'maximum':
        message = `"${fieldName}" value is out of range`;
        break;
      case 'format':
        message = `"${fieldName}" has invalid format (expected ${error.params.format})`;
        break;
      case 'additionalProperties':
        message = `Unexpected property: ${error.params.additionalProperty}`;
        break;
      case 'const':
        message = `"${fieldName}" must be ${error.params.allowedValue}`;
        break;
      default:
        message = `Validation error at ${path}: ${error.message}`;
    }

    friendlyMessages.push(message);
  }

  return friendlyMessages;
}

/**
 * Display validation errors in the UI
 * @param {string[]} errors - Array of error messages
 * @param {HTMLElement} container - Container element to show errors in (or create one)
 * @param {HTMLElement} [anchorElement] - Element to insert error display near (if container not found)
 */
function displayValidationErrors(errors, container, anchorElement) {
  // Remove any existing error display
  const existingError = document.getElementById('schema-validation-error');
  if (existingError) {
    existingError.remove();
  }

  if (!errors || errors.length === 0) {
    return;
  }

  // Create error display element
  const errorDiv = document.createElement('div');
  errorDiv.id = 'schema-validation-error';
  errorDiv.className = 'alert alert-error';
  errorDiv.innerHTML = `
    <span class="alert-icon">!</span>
    <div class="alert-content">
      <div class="alert-title">Report Validation Failed</div>
      <ul style="margin: 0.5rem 0 0 1rem; padding: 0;">
        ${errors.map(e => `<li>${escapeHtmlForValidation(e)}</li>`).join('')}
      </ul>
      <p style="margin-top: 0.5rem; font-size: 0.875rem; opacity: 0.8;">
        Please fix these issues before downloading. Check the browser console for details.
      </p>
    </div>
  `;

  // Insert the error display
  if (container) {
    container.insertBefore(errorDiv, container.firstChild);
  } else if (anchorElement) {
    anchorElement.parentNode.insertBefore(errorDiv, anchorElement);
  } else {
    // Fallback: insert at top of main content
    const main = document.querySelector('main') || document.body;
    main.insertBefore(errorDiv, main.firstChild);
  }

  // Scroll to error
  errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Clear any displayed validation errors
 */
function clearValidationErrors() {
  const existingError = document.getElementById('schema-validation-error');
  if (existingError) {
    existingError.remove();
  }
}

/**
 * Helper to escape HTML for validation error display
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtmlForValidation(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize shared module - load configs
 */
async function initShared() {
  await Promise.all([
    loadWeightsConfig(),
    loadLevelDescriptions()
  ]);
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShared);
  } else {
    initShared();
  }
}

// =============================================================================
// EXPORT TO GLOBAL SCOPE
// =============================================================================

// Make everything available globally for non-module usage
window.ROLE_WEIGHTS = ROLE_WEIGHTS;
window.ROLES = ROLES;
window.COMPANY_TYPES = COMPANY_TYPES;
window.DIMENSIONS = DIMENSIONS;
window.SCORE_BANDS = SCORE_BANDS;
window.EVIDENCE_MULTIPLIERS = EVIDENCE_MULTIPLIERS;
window.AI_TOOLS = AI_TOOLS;

window.loadWeightsConfig = loadWeightsConfig;
window.loadLevelDescriptions = loadLevelDescriptions;
window.getPointsForLevel = getPointsForLevel;
window.getMaxPointsForDimension = getMaxPointsForDimension;
window.calculateDimensionScore = calculateDimensionScore;
window.getMaxWeightedScore = getMaxWeightedScore;
window.normalizeScore = normalizeScore;
window.getScoreBand = getScoreBand;
window.applyCompanyModifier = applyCompanyModifier;
window.getWeightsForScoreType = getWeightsForScoreType;
window.calculateSingleScore = calculateSingleScore;
window.calculateDualScores = calculateDualScores;
window.getGapInterpretation = getGapInterpretation;
window.calculateAIQScore = calculateAIQScore;
window.formatISODate = formatISODate;
window.formatISOTimestamp = formatISOTimestamp;
window.generateReportId = generateReportId;
window.encodeState = encodeState;
window.decodeState = decodeState;
window.getUrlParam = getUrlParam;
window.setUrlParam = setUrlParam;
window.removeUrlParam = removeUrlParam;
window.populateRoleSelect = populateRoleSelect;
window.populateCompanyTypeSelect = populateCompanyTypeSelect;
window.getLevelDescription = getLevelDescription;
window.createReportObject = createReportObject;
window.validateReportSchema = validateReportSchema;
window.displayValidationErrors = displayValidationErrors;
window.clearValidationErrors = clearValidationErrors;
window.initShared = initShared;
