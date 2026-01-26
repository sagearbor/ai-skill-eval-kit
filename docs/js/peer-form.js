/**
 * AIQ Assessment Tools - Peer Validation Form Logic
 * Handles Level 2 peer validation flow:
 * - Assessee entry (level2.html)
 * - Validator entry (level2-validate.html)
 * Version 1.1 - Dual scoring support
 */

// =============================================================================
// ASSESSEE FORM (level2.html)
// =============================================================================

/**
 * Initialize the assessee form
 * Called on DOMContentLoaded for level2.html
 */
async function initAssesseeForm() {
  // Wait for shared config to load
  await initShared();

  // Populate role dropdown
  const roleSelect = document.getElementById('assesseeRole');
  if (roleSelect) {
    populateRoleSelect(roleSelect, 'General');
  }

  // Populate company type dropdown
  const companyTypeSelect = document.getElementById('assesseeCompanyType');
  if (companyTypeSelect) {
    populateCompanyTypeSelect(companyTypeSelect, '', true);
  }

  // Create dimension score dropdowns
  createDimensionScoreInputs();

  // Check for prefill data from L1
  const prefillEncoded = getUrlParam('prefill');
  if (prefillEncoded) {
    const prefillData = decodeState(prefillEncoded);
    if (prefillData && prefillData.fromL1) {
      // Prefill name
      if (prefillData.name) {
        const nameInput = document.getElementById('assesseeName');
        if (nameInput) nameInput.value = prefillData.name;
      }
      // Prefill email
      if (prefillData.email) {
        const emailInput = document.getElementById('assesseeEmail');
        if (emailInput) emailInput.value = prefillData.email;
      }
      // Prefill role
      if (prefillData.role && roleSelect) {
        roleSelect.value = prefillData.role;
      }
      // Prefill company type
      if (prefillData.companyType && companyTypeSelect) {
        companyTypeSelect.value = prefillData.companyType;
      }
      // Prefill dimension scores
      if (prefillData.levels) {
        for (const [dimKey, level] of Object.entries(prefillData.levels)) {
          const select = document.getElementById(`score_${dimKey}`);
          if (select) {
            select.value = level;
            // Trigger change event to update hint
            select.dispatchEvent(new Event('change'));
          }
        }
      }
    }
  }

  // Set up form submit handler
  const form = document.getElementById('assesseeForm');
  if (form) {
    form.addEventListener('submit', generateValidationLink);
  }
}

/**
 * Create score dropdowns for each dimension
 */
function createDimensionScoreInputs() {
  const container = document.getElementById('dimensionScores');
  if (!container) return;

  container.innerHTML = '';

  for (const [dimKey, dimData] of Object.entries(DIMENSIONS)) {
    const dimensionGroup = document.createElement('div');
    dimensionGroup.className = 'dimension-section mb-6';

    // Dimension header
    const header = document.createElement('div');
    header.className = 'dimension-header';
    header.innerHTML = `
      <div class="dimension-letter">${dimData.name.charAt(0)}</div>
      <div>
        <div class="dimension-title">${dimData.fullName}</div>
        <div class="dimension-subtitle">${dimData.question}</div>
      </div>
    `;
    dimensionGroup.appendChild(header);

    // Score dropdown
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';

    const label = document.createElement('label');
    label.className = 'form-label form-label-required';
    label.setAttribute('for', `score_${dimKey}`);
    label.textContent = `Your ${dimData.name} Level`;
    formGroup.appendChild(label);

    const select = document.createElement('select');
    select.className = 'form-select';
    select.id = `score_${dimKey}`;
    select.name = `score_${dimKey}`;
    select.required = true;

    // Add default option
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = 'Select your level...';
    select.appendChild(defaultOpt);

    // Add level options (0-5)
    for (const levelData of dimData.levels) {
      const option = document.createElement('option');
      option.value = levelData.level;
      option.textContent = `Level ${levelData.level}: ${levelData.description}`;
      select.appendChild(option);
    }

    formGroup.appendChild(select);

    // Add description display
    const hint = document.createElement('p');
    hint.className = 'form-hint';
    hint.id = `hint_${dimKey}`;
    hint.textContent = '';
    formGroup.appendChild(hint);

    // Update hint when selection changes
    select.addEventListener('change', (e) => {
      const level = parseInt(e.target.value);
      if (!isNaN(level)) {
        hint.textContent = getLevelDescription(dimKey, level);
        hint.style.color = 'var(--color-accent)';
      } else {
        hint.textContent = '';
      }
    });

    dimensionGroup.appendChild(formGroup);
    container.appendChild(dimensionGroup);
  }
}

/**
 * Handle form submission - generate validation link
 * @param {Event} event - Form submit event
 */
function generateValidationLink(event) {
  event.preventDefault();

  // Collect form data
  const name = document.getElementById('assesseeName').value.trim();
  const role = document.getElementById('assesseeRole').value;
  const companyType = document.getElementById('assesseeCompanyType')?.value || '';
  const email = document.getElementById('assesseeEmail').value.trim();
  const notes = document.getElementById('assesseeNotes').value.trim();

  // Collect dimension scores
  const dimensions = {};
  for (const dimKey of Object.keys(DIMENSIONS)) {
    const select = document.getElementById(`score_${dimKey}`);
    if (select && select.value !== '') {
      dimensions[dimKey] = parseInt(select.value);
    } else {
      // Show validation error
      select.classList.add('is-invalid');
      select.focus();
      return;
    }
  }

  // Create data object
  const data = {
    name,
    role,
    companyType,
    email,
    dimensions,
    notes,
    timestamp: new Date().toISOString()
  };

  // Encode state
  const encoded = encodeState(data);

  // Build URL
  const baseUrl = window.location.origin + window.location.pathname.replace('level2.html', '');
  const validationUrl = `${baseUrl}level2-validate.html?d=${encoded}`;

  // Display the URL
  document.getElementById('generatedUrl').value = validationUrl;
  document.getElementById('previewValidatorLink').href = validationUrl;
  document.getElementById('generatedUrlSection').classList.remove('hidden');

  // Scroll to the URL section
  document.getElementById('generatedUrlSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Copy generated URL to clipboard
 */
function copyToClipboard() {
  const urlInput = document.getElementById('generatedUrl');
  const feedback = document.getElementById('copyFeedback');

  navigator.clipboard.writeText(urlInput.value).then(() => {
    feedback.classList.remove('hidden');
    setTimeout(() => {
      feedback.classList.add('hidden');
    }, 3000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    // Fallback: select the text
    urlInput.select();
    document.execCommand('copy');
    feedback.classList.remove('hidden');
    setTimeout(() => {
      feedback.classList.add('hidden');
    }, 3000);
  });
}

/**
 * Reset the form to start over
 */
function resetForm() {
  document.getElementById('assesseeForm').reset();
  document.getElementById('generatedUrlSection').classList.add('hidden');

  // Clear any invalid states
  document.querySelectorAll('.is-invalid').forEach(el => {
    el.classList.remove('is-invalid');
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================================================
// VALIDATOR FORM (level2-validate.html)
// =============================================================================

// Store the assessee data globally for use in validation
let assesseeData = null;
let validatedReport = null;

/**
 * Initialize the validator form
 * Called on DOMContentLoaded for level2-validate.html
 */
async function initValidatorForm() {
  // Wait for shared config to load
  await initShared();

  // First, check for ?r= parameter (completed report)
  const completedReportEncoded = getUrlParam('r');
  if (completedReportEncoded) {
    const report = decodeState(completedReportEncoded);
    if (report && report.schemaVersion && report.calculation) {
      displayCompletedReport(report);
      return;
    }
  }

  // Otherwise, check for ?d= parameter (initial validation request)
  const encoded = getUrlParam('d');

  if (!encoded) {
    showError();
    return;
  }

  // Decode the data
  const data = decodeState(encoded);

  if (!data || !data.name || !data.dimensions) {
    showError();
    return;
  }

  // Store for later use
  assesseeData = data;

  // Show the validation content
  document.getElementById('validationContent').classList.remove('hidden');

  // Populate assessee info
  populateAssesseeInfo(data);

  // Render claimed scores with validation options
  renderClaimedScores(data);

  // Set up form submit handler
  const form = document.getElementById('validatorForm');
  if (form) {
    form.addEventListener('submit', completeValidation);
  }
}

/**
 * Display a completed report loaded from URL (?r= parameter)
 * @param {object} report - The completed report object
 */
function displayCompletedReport(report) {
  // Store the report for download functions
  validatedReport = report;

  // Hide error state and validation form
  document.getElementById('errorState').classList.add('hidden');
  document.getElementById('validationContent').classList.add('hidden');

  // Show results section
  const resultsSection = document.getElementById('resultsSection');
  resultsSection.classList.remove('hidden');

  // Display dual scores (v1.1)
  if (report.calculation.personalScore) {
    // v1.1 report with dual scoring
    displayDualScoreResults(report);
  } else {
    // v1.0 report - legacy display
    displayLegacyResults(report);
  }
}

/**
 * Display dual score results (v1.1)
 * @param {object} report - The report object
 */
function displayDualScoreResults(report) {
  // Update the results display for dual scores
  const resultsContainer = document.querySelector('#resultsSection .results-container');
  if (resultsContainer) {
    // Create dual score display HTML
    const dualScoreHtml = `
      <h2 class="text-center mb-6">Validated AIQ Results</h2>

      <!-- Dual Score Cards -->
      <div class="dual-score-container">
        <div class="score-card">
          <div class="score-card-title">Personal Readiness</div>
          <div class="score-card-value">${report.calculation.personalScore.normalizedScore}</div>
          <div class="score-card-band band-${report.calculation.personalScore.scoreBand.toLowerCase()}">${report.calculation.personalScore.scoreBand}</div>
        </div>
        <div class="score-card">
          <div class="score-card-title">Corporate Impact</div>
          <div class="score-card-value">${report.calculation.corporateScore.normalizedScore}</div>
          <div class="score-card-band band-${report.calculation.corporateScore.scoreBand.toLowerCase()}">${report.calculation.corporateScore.scoreBand}</div>
        </div>
      </div>

      <!-- Gap Display -->
      <div class="gap-display">
        <div class="gap-value ${report.calculation.gap > 10 ? 'gap-positive' : report.calculation.gap < -10 ? 'gap-negative' : 'gap-balanced'}">
          Gap: ${report.calculation.gap > 0 ? '+' : ''}${report.calculation.gap} points
        </div>
        <div class="gap-interpretation">${getGapInterpretation(report.calculation.gap).meaning}</div>
        <div class="gap-action">Recommended: ${getGapInterpretation(report.calculation.gap).action}</div>
      </div>

      <div class="text-center mb-6">
        <span class="badge badge-${report.calculation.confidence.toLowerCase()}">
          Confidence: ${report.calculation.confidence} (${report.calculation.evidenceMultiplier}x)
        </span>
      </div>
    `;

    // Insert before the breakdown table
    const breakdownCard = resultsContainer.querySelector('.card');
    if (breakdownCard) {
      breakdownCard.insertAdjacentHTML('beforebegin', dualScoreHtml);
    }
  }

  // Hide the old single score display
  const oldScoreDisplay = document.querySelector('.score-display');
  if (oldScoreDisplay) {
    oldScoreDisplay.style.display = 'none';
  }

  // Populate breakdown table
  populateBreakdownTable(report);
}

/**
 * Display legacy single-score results (v1.0)
 * @param {object} report - The report object
 */
function displayLegacyResults(report) {
  // Display score
  document.getElementById('finalScoreValue').textContent = report.calculation.normalizedScore || report.scores?.finalScore;

  // Display band
  const bandBadge = document.getElementById('scoreBandBadge');
  const bandName = report.calculation.scoreBand || report.scores?.band;
  bandBadge.textContent = bandName;
  bandBadge.className = `score-band band-${bandName.toLowerCase()}`;

  // Populate breakdown table
  populateBreakdownTable(report);
}

/**
 * Populate the breakdown table
 * @param {object} report - The report object
 */
function populateBreakdownTable(report) {
  const tbody = document.getElementById('breakdownTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  // Handle both v1.0 and v1.1 report formats
  const validation = report.validation?.dimensions || report.validation?.dimensionConfirmations;

  for (const [dimKey, dimData] of Object.entries(DIMENSIONS)) {
    let claimedLevel, finalLevel, confirmed, weightedScore;

    if (report.validation?.dimensions) {
      // v1.1 format
      const val = report.validation.dimensions[dimKey];
      claimedLevel = val.claimedLevel;
      finalLevel = val.finalLevel;
      confirmed = val.confirmed;
    } else if (report.validation?.dimensionConfirmations) {
      // v1.0 format
      const val = report.validation.dimensionConfirmations[dimKey];
      finalLevel = val.adjustedLevel !== null ? val.adjustedLevel : report.dimensions[dimKey].level;
      claimedLevel = report.dimensions[dimKey].level;
      confirmed = val.confirmed;
    }

    // Get weighted score from dimensions
    if (report.dimensions?.[dimKey]) {
      weightedScore = report.dimensions[dimKey].weightedScore;
    } else if (report.scores?.dimensions?.[dimKey]) {
      weightedScore = report.scores.dimensions[dimKey].weightedScore;
    }

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${dimData.name}</strong></td>
      <td>Level ${claimedLevel}</td>
      <td>Level ${finalLevel}</td>
      <td>${confirmed ?
        '<span class="badge badge-high">Confirmed</span>' :
        '<span class="badge badge-medium">Adjusted</span>'}</td>
      <td class="score-cell">${weightedScore?.toFixed(2) || '--'}</td>
    `;
    tbody.appendChild(row);
  }
}

/**
 * Show error state when data is invalid
 */
function showError() {
  document.getElementById('errorState').classList.remove('hidden');
  document.getElementById('validationContent').classList.add('hidden');
}

/**
 * Populate assessee information display
 * @param {object} data - Decoded assessee data
 */
function populateAssesseeInfo(data) {
  document.getElementById('displayAssesseeName').textContent = data.name;
  document.getElementById('displayAssesseeRole').textContent = data.role;

  // Show company type if present
  const companyTypeEl = document.getElementById('displayAssesseeCompanyType');
  if (companyTypeEl && data.companyType) {
    companyTypeEl.textContent = data.companyType;
    companyTypeEl.parentElement.classList.remove('hidden');
  }

  // Format date
  if (data.timestamp) {
    const date = new Date(data.timestamp);
    document.getElementById('displaySubmittedDate').textContent = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Show notes if present
  if (data.notes && data.notes.trim()) {
    document.getElementById('assesseeNotesSection').classList.remove('hidden');
    document.getElementById('displayAssesseeNotes').textContent = data.notes;
  }
}

/**
 * Render claimed scores with confirm/adjust options
 * @param {object} data - Decoded assessee data
 */
function renderClaimedScores(data) {
  const container = document.getElementById('dimensionValidations');
  if (!container) return;

  container.innerHTML = '';

  for (const [dimKey, dimData] of Object.entries(DIMENSIONS)) {
    const claimedLevel = data.dimensions[dimKey] || 0;
    const levelDesc = getLevelDescription(dimKey, claimedLevel, data.role);

    // Get point range for display
    const levelData = dimData.levels.find(l => l.level === claimedLevel);
    let pointsText = '';
    if (levelData) {
      if (claimedLevel === 0) {
        pointsText = '0 pts';
      } else {
        pointsText = `${levelData.minPoints}-${levelData.maxPoints} pts`;
      }
    }

    const dimensionBlock = document.createElement('div');
    dimensionBlock.className = 'card mb-4';
    dimensionBlock.innerHTML = `
      <div class="card-body">
        <div class="dimension-header mb-4">
          <div class="dimension-letter">${dimData.name.charAt(0)}</div>
          <div>
            <div class="dimension-title">${dimData.fullName}</div>
          </div>
        </div>

        <div class="alert alert-info mb-4">
          <div class="alert-content">
            <div class="alert-title">Claimed: Level ${claimedLevel} (${pointsText})</div>
            <p class="mb-0">${levelDesc}</p>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label form-label-required">Your Assessment</label>
          <div class="radio-group">
            <label class="form-check">
              <input type="radio" class="form-check-input" name="validate_${dimKey}" value="confirm" checked onchange="handleConfirmAdjustChange('${dimKey}', false)">
              <span class="form-check-label">Confirm - I agree with this level</span>
            </label>
            <label class="form-check">
              <input type="radio" class="form-check-input" name="validate_${dimKey}" value="adjust" onchange="handleConfirmAdjustChange('${dimKey}', true)">
              <span class="form-check-label">Adjust - I believe the level should be different</span>
            </label>
          </div>
        </div>

        <div id="adjust_${dimKey}" class="hidden">
          <div class="form-group">
            <label for="adjustLevel_${dimKey}" class="form-label form-label-required">Adjusted Level</label>
            <select id="adjustLevel_${dimKey}" name="adjustLevel_${dimKey}" class="form-select">
              ${dimData.levels.map(l => `
                <option value="${l.level}" ${l.level === claimedLevel ? 'selected' : ''}>
                  Level ${l.level}: ${l.description}
                </option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="adjustReason_${dimKey}" class="form-label form-label-required">Reason for Adjustment</label>
            <textarea id="adjustReason_${dimKey}" name="adjustReason_${dimKey}" class="form-textarea" placeholder="Explain why you believe the level should be adjusted..."></textarea>
          </div>
        </div>
      </div>
    `;

    container.appendChild(dimensionBlock);
  }
}

/**
 * Handle confirm/adjust radio button change
 * @param {string} dimension - Dimension key
 * @param {boolean} isAdjust - Whether adjust is selected
 */
function handleConfirmAdjustChange(dimension, isAdjust) {
  const adjustSection = document.getElementById(`adjust_${dimension}`);
  const reasonField = document.getElementById(`adjustReason_${dimension}`);

  if (isAdjust) {
    adjustSection.classList.remove('hidden');
    reasonField.required = true;
  } else {
    adjustSection.classList.add('hidden');
    reasonField.required = false;
  }
}

/**
 * Complete the validation - form submit handler
 * @param {Event} event - Form submit event
 */
function completeValidation(event) {
  event.preventDefault();

  const validatorName = document.getElementById('validatorName').value.trim();
  const validatorRelationship = document.getElementById('validatorRelationship').value;

  // Validate required fields
  if (!validatorName || !validatorRelationship) {
    return;
  }

  // Collect validation decisions
  const validations = {};
  const adjustments = [];

  for (const dimKey of Object.keys(DIMENSIONS)) {
    const decision = document.querySelector(`input[name="validate_${dimKey}"]:checked`).value;
    const claimedLevel = assesseeData.dimensions[dimKey];

    if (decision === 'confirm') {
      validations[dimKey] = {
        confirmed: true,
        finalLevel: claimedLevel
      };
    } else {
      const adjustedLevel = parseInt(document.getElementById(`adjustLevel_${dimKey}`).value);
      const reason = document.getElementById(`adjustReason_${dimKey}`).value.trim();

      // Validate reason is provided
      if (!reason) {
        document.getElementById(`adjustReason_${dimKey}`).classList.add('is-invalid');
        document.getElementById(`adjustReason_${dimKey}`).focus();
        return;
      }

      validations[dimKey] = {
        confirmed: false,
        claimedLevel,
        finalLevel: adjustedLevel,
        reason
      };

      adjustments.push({
        dimension: DIMENSIONS[dimKey].name,
        from: claimedLevel,
        to: adjustedLevel,
        reason
      });
    }
  }

  // Generate the validated report
  validatedReport = generateValidatedReport(validatorName, validatorRelationship, validations);

  // Display results
  displayResults(validations, adjustments);
}

/**
 * Generate the full L2 validated report object (v1.1 format)
 * @param {string} validatorName - Validator's name
 * @param {string} validatorRelationship - Validator's relationship to assessee
 * @param {object} validations - Validation decisions by dimension
 * @returns {object} Complete L2 report object
 */
function generateValidatedReport(validatorName, validatorRelationship, validations) {
  // Build final levels from validations
  const finalLevels = {};
  for (const [dimKey, val] of Object.entries(validations)) {
    finalLevels[dimKey] = val.finalLevel;
  }

  // Calculate dual scores (assessment level 2 = 0.8x multiplier)
  const score = calculateDualScores(finalLevels, assesseeData.role, assesseeData.companyType || null, 2);

  // Build the report object (v1.1 format)
  const report = {
    schemaVersion: '1.1',
    reportType: 'peer-validation',
    reportId: generateReportId(),
    generatedAt: formatISOTimestamp(),
    assessmentLevel: 2,
    assessee: {
      name: assesseeData.name,
      email: assesseeData.email || '',
      role: assesseeData.role
    },
    validation: {
      validatorName: validatorName,
      validatorRelationship: validatorRelationship,
      validatedAt: formatISOTimestamp(),
      dimensionConfirmations: {}
    },
    dimensions: {},
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

  // Add company type if present
  if (assesseeData.companyType) {
    report.assessee.companyType = assesseeData.companyType;
  }

  // Add validation details per dimension
  report.validation.dimensions = {};
  for (const [dimKey, val] of Object.entries(validations)) {
    report.validation.dimensions[dimKey] = {
      claimedLevel: assesseeData.dimensions[dimKey],
      finalLevel: val.finalLevel,
      confirmed: val.confirmed,
      adjustmentReason: val.reason || undefined
    };

    report.validation.dimensionConfirmations[dimKey] = {
      confirmed: val.confirmed,
      adjustedLevel: val.confirmed ? null : val.finalLevel
    };

    report.dimensions[dimKey] = {
      level: val.finalLevel,
      points: score.dimensions[dimKey].rawPoints,
      weight: score.dimensions[dimKey].weight,
      weightedScore: score.dimensions[dimKey].weightedScore
    };
  }

  // Add notes if present
  if (assesseeData.notes) {
    report.notes = assesseeData.notes;
  }

  return report;
}

/**
 * Display the validation results
 * @param {object} validations - Validation decisions
 * @param {array} adjustments - List of adjustments made
 */
function displayResults(validations, adjustments) {
  // Hide the form
  document.getElementById('validationContent').classList.add('hidden');

  // Show results section
  const resultsSection = document.getElementById('resultsSection');
  resultsSection.classList.remove('hidden');

  // Display dual scores (v1.1)
  displayDualScoreResults(validatedReport);

  // Populate breakdown table
  const tbody = document.getElementById('breakdownTableBody');
  tbody.innerHTML = '';

  for (const [dimKey, dimData] of Object.entries(DIMENSIONS)) {
    const validation = validations[dimKey];
    const scoreData = validatedReport.dimensions[dimKey];

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${dimData.name}</strong></td>
      <td>Level ${assesseeData.dimensions[dimKey]}</td>
      <td>Level ${validation.finalLevel}</td>
      <td>${validation.confirmed ?
        '<span class="badge badge-high">Confirmed</span>' :
        '<span class="badge badge-medium">Adjusted</span>'}</td>
      <td class="score-cell">${scoreData.weightedScore.toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  }

  // Show adjustments summary if any
  if (adjustments.length > 0) {
    const summaryDiv = document.getElementById('adjustmentsSummary');
    const listEl = document.getElementById('adjustmentsList');

    listEl.innerHTML = adjustments.map(adj => `
      <li><strong>${adj.dimension}:</strong> Level ${adj.from} → Level ${adj.to} - "${adj.reason}"</li>
    `).join('');

    summaryDiv.classList.remove('hidden');
  }

  // Generate completed URL for sharing back
  generateCompletedURL();

  // Scroll to results
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Generate the completed validation URL
 */
function generateCompletedURL() {
  const encoded = encodeState(validatedReport);
  const baseUrl = window.location.origin + window.location.pathname.replace('level2-validate.html', '');
  const completedUrl = `${baseUrl}level2-validate.html?r=${encoded}`;

  document.getElementById('completedUrl').value = completedUrl;
}

/**
 * Copy completed URL to clipboard
 */
function copyCompletedUrl() {
  const urlInput = document.getElementById('completedUrl');
  const feedback = document.getElementById('completedCopyFeedback');

  navigator.clipboard.writeText(urlInput.value).then(() => {
    feedback.classList.remove('hidden');
    setTimeout(() => {
      feedback.classList.add('hidden');
    }, 3000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    urlInput.select();
    document.execCommand('copy');
    feedback.classList.remove('hidden');
    setTimeout(() => {
      feedback.classList.add('hidden');
    }, 3000);
  });
}

/**
 * Download the validated report as JSON
 */
async function downloadValidatedJSON() {
  if (!validatedReport) return;

  // Clear any previous validation errors
  clearValidationErrors();

  // Validate against JSON schema
  const validation = await validateReportSchema(validatedReport);
  if (!validation.valid) {
    // Find download options container to show errors near
    const downloadOptions = document.querySelector('.download-options');
    displayValidationErrors(validation.errors, null, downloadOptions);
    return;
  }

  const jsonStr = JSON.stringify(validatedReport, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `aiq-report-${validatedReport.reportId}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download the validated report as PDF (v1.1 dual scoring)
 */
function downloadValidatedPDF() {
  if (!validatedReport) return;

  const report = validatedReport;

  // Build PDF content with dual scores
  const pdfContent = document.getElementById('pdfContent');
  pdfContent.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #0f172a; margin-bottom: 10px;">AIQ Assessment Report</h1>
      <p style="color: #64748b; font-size: 14px;">Level 2: Peer Validated (v1.1 Dual Scoring)</p>
      <p style="color: #64748b; font-size: 12px;">Report ID: ${report.reportId}</p>
      <p style="color: #64748b; font-size: 12px;">Generated: ${new Date(report.generatedAt).toLocaleDateString()}</p>
    </div>

    <!-- Dual Scores -->
    <div style="display: flex; gap: 20px; margin: 20px 0;">
      <div style="flex: 1; text-align: center; background: #f8fafc; padding: 20px; border-radius: 12px;">
        <div style="font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 5px;">Personal Readiness</div>
        <div style="font-size: 36px; font-weight: bold; color: #0f172a;">${report.calculation.personalScore.normalizedScore}</div>
        <div style="display: inline-block; padding: 4px 12px; background: #4f46e5; color: white; border-radius: 6px; margin-top: 8px; font-size: 12px;">
          ${report.calculation.personalScore.scoreBand}
        </div>
      </div>
      <div style="flex: 1; text-align: center; background: #f8fafc; padding: 20px; border-radius: 12px;">
        <div style="font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 5px;">Corporate Impact</div>
        <div style="font-size: 36px; font-weight: bold; color: #0f172a;">${report.calculation.corporateScore.normalizedScore}</div>
        <div style="display: inline-block; padding: 4px 12px; background: #4f46e5; color: white; border-radius: 6px; margin-top: 8px; font-size: 12px;">
          ${report.calculation.corporateScore.scoreBand}
        </div>
      </div>
    </div>

    <!-- Gap -->
    <div style="text-align: center; background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <div style="font-size: 16px; font-weight: bold; color: ${report.calculation.gap > 10 ? '#22c55e' : report.calculation.gap < -10 ? '#f59e0b' : '#4f46e5'};">
        Gap: ${report.calculation.gap > 0 ? '+' : ''}${report.calculation.gap} points
      </div>
      <div style="font-size: 14px; color: #64748b; margin-top: 5px;">${getGapInterpretation(report.calculation.gap).meaning}</div>
    </div>

    <div style="text-align: center; margin: 15px 0; color: #64748b; font-size: 12px;">
      Evidence Multiplier: ${report.calculation.evidenceMultiplier}x (Peer Validated)
    </div>

    <div style="margin-bottom: 20px;">
      <h2 style="color: #0f172a; font-size: 18px; margin-bottom: 15px;">Assessee Information</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">Name</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${report.assessee.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">Role</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${report.assessee.role}</td>
        </tr>
        ${report.assessee.companyType ? `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">Company Type</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${report.assessee.companyType}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <div style="margin-bottom: 20px;">
      <h2 style="color: #0f172a; font-size: 18px; margin-bottom: 15px;">Validator Information</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">Name</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${report.validation.validatorName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">Relationship</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${report.validation.validatorRelationship}</td>
        </tr>
      </table>
    </div>

    <div style="margin-bottom: 20px;">
      <h2 style="color: #0f172a; font-size: 18px; margin-bottom: 15px;">Score Breakdown</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #0f172a; color: white;">
            <th style="padding: 10px; text-align: left;">Dimension</th>
            <th style="padding: 10px; text-align: center;">Claimed</th>
            <th style="padding: 10px; text-align: center;">Validated</th>
            <th style="padding: 10px; text-align: center;">Status</th>
            <th style="padding: 10px; text-align: right;">Points</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(DIMENSIONS).map(([dimKey, dimData]) => {
            const val = report.validation.dimensions[dimKey];
            const scoreData = report.dimensions[dimKey];
            return `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">${dimData.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">Level ${val.claimedLevel}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">Level ${val.finalLevel}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${val.confirmed ? 'Confirmed' : 'Adjusted'}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${scoreData.weightedScore.toFixed(2)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    ${Object.values(report.validation.dimensions).some(v => !v.confirmed) ? `
    <div style="margin-bottom: 20px;">
      <h2 style="color: #0f172a; font-size: 18px; margin-bottom: 15px;">Adjustments</h2>
      <ul style="margin: 0; padding-left: 20px;">
        ${Object.entries(report.validation.dimensions)
          .filter(([_, v]) => !v.confirmed)
          .map(([dimKey, v]) => `
            <li style="margin-bottom: 8px;">
              <strong>${DIMENSIONS[dimKey].name}:</strong> Level ${v.claimedLevel} → Level ${v.finalLevel}
              <br><em>"${v.adjustmentReason}"</em>
            </li>
          `).join('')}
      </ul>
    </div>
    ` : ''}

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px;">
      <p>Universal AIQ Framework - Level 2 Peer Validation Report (v1.1)</p>
      <p>Generated at ${new Date(report.generatedAt).toLocaleString()}</p>
    </div>
  `;

  // Generate PDF
  const opt = {
    margin: 10,
    filename: `aiq-report-${report.reportId}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(pdfContent).save();
}

// =============================================================================
// EXPORT TO GLOBAL SCOPE
// =============================================================================

window.initAssesseeForm = initAssesseeForm;
window.initValidatorForm = initValidatorForm;
window.generateValidationLink = generateValidationLink;
window.copyToClipboard = copyToClipboard;
window.resetForm = resetForm;
window.handleConfirmAdjustChange = handleConfirmAdjustChange;
window.completeValidation = completeValidation;
window.downloadValidatedJSON = downloadValidatedJSON;
window.downloadValidatedPDF = downloadValidatedPDF;
window.copyCompletedUrl = copyCompletedUrl;
