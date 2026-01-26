/**
 * AIQ Assessment Tools - Level 1 Self-Assessment
 * Handles the self-assessment survey logic and scoring
 * Version 1.1 - Dual scoring support (Personal Readiness + Corporate Impact)
 */

// Store current results for download functions
let currentResults = null;
let currentRole = 'General';
let currentCompanyType = '';
let currentLevels = null;
let currentName = '';
let currentEmail = '';

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize the assessment page on DOM ready
 */
async function initAssessment() {
  // Wait for shared config to load
  await initShared();

  // Populate role dropdown
  const roleSelect = document.getElementById('role-select');
  if (roleSelect) {
    populateRoleSelect(roleSelect, 'General');
    roleSelect.addEventListener('change', function() {
      currentRole = this.value;
      // Update dimension descriptions for new role
      updateDimensionDescriptions(currentRole);
    });
  }

  // Populate company type dropdown
  const companyTypeSelect = document.getElementById('company-type-select');
  if (companyTypeSelect) {
    populateCompanyTypeSelect(companyTypeSelect, '', true);
    companyTypeSelect.addEventListener('change', function() {
      currentCompanyType = this.value;
    });

    // Check for URL param
    const urlCompanyType = getUrlParam('companyType');
    if (urlCompanyType && COMPANY_TYPES.includes(urlCompanyType)) {
      companyTypeSelect.value = urlCompanyType;
      currentCompanyType = urlCompanyType;
    }
  }

  // Check for ?scoreType=combined URL param
  const scoreType = getUrlParam('scoreType');
  if (scoreType === 'combined') {
    // Will be handled in results display
  }

  // Generate dimension forms
  const container = document.getElementById('dimensions-container');
  if (container) {
    for (const [dimKey, dimData] of Object.entries(DIMENSIONS)) {
      const sectionHtml = renderDimensionForm(dimKey, dimData);
      container.insertAdjacentHTML('beforeend', sectionHtml);
    }

    // Add click handlers for radio cards
    setupRadioCardListeners();
  }

  // Form submission handler
  const form = document.getElementById('assessment-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      calculateAndShowResults();
    });
  }
}

// =============================================================================
// FORM RENDERING
// =============================================================================

/**
 * Render HTML for a single dimension's assessment form
 * Uses role-specific descriptions from level-descriptions.json
 * @param {string} dimensionKey - The dimension key (study, copy, etc.)
 * @param {object} dimensionData - The dimension data from DIMENSIONS
 * @param {string} role - Current role for role-specific descriptions
 * @returns {string} HTML string for the dimension section
 */
function renderDimensionForm(dimensionKey, dimensionData, role = 'General') {
  const letter = dimensionData.name.charAt(0).toUpperCase();
  const subtitle = dimensionData.fullName.split(' - ')[1] || dimensionData.fullName.split('(')[1]?.replace(')', '') || '';

  let radioCardsHtml = '';
  for (const levelData of dimensionData.levels) {
    const pointsText = levelData.level === 0
      ? '0 pts'
      : `${levelData.minPoints}-${levelData.maxPoints} pts`;

    // Get description from level-descriptions.json based on role
    const description = getLevelDescription(dimensionKey, levelData.level, role);

    radioCardsHtml += `
      <label class="radio-card" data-dimension="${dimensionKey}" data-level="${levelData.level}">
        <input type="radio" name="${dimensionKey}" value="${levelData.level}">
        <div class="radio-card-indicator"></div>
        <div class="radio-card-content">
          <div class="radio-card-label">Level ${levelData.level} (${pointsText})</div>
          <div class="radio-card-desc">${escapeHtml(description)}</div>
        </div>
      </label>
    `;
  }

  return `
    <div class="dimension-section" data-dimension="${dimensionKey}">
      <div class="dimension-header">
        <span class="dimension-letter">${letter}</span>
        <div>
          <h3 class="dimension-title">${dimensionData.name}</h3>
          <p class="dimension-subtitle">${subtitle}</p>
        </div>
      </div>
      <p class="question-text">"${escapeHtml(dimensionData.question)}"</p>
      <div class="radio-card-group">
        ${radioCardsHtml}
      </div>
    </div>
  `;
}

/**
 * Re-render all dimension forms with new role-specific descriptions
 * Preserves current selections
 * @param {string} role - The new role
 */
function updateDimensionDescriptions(role) {
  // Save current selections
  const selections = {};
  for (const dimKey of Object.keys(DIMENSIONS)) {
    const selected = document.querySelector(`input[name="${dimKey}"]:checked`);
    if (selected) {
      selections[dimKey] = selected.value;
    }
  }

  // Re-render each dimension's descriptions
  for (const [dimKey, dimData] of Object.entries(DIMENSIONS)) {
    const section = document.querySelector(`.dimension-section[data-dimension="${dimKey}"]`);
    if (!section) continue;

    // Update each radio card's description
    for (const levelData of dimData.levels) {
      const card = section.querySelector(`.radio-card[data-level="${levelData.level}"]`);
      if (!card) continue;

      const descEl = card.querySelector('.radio-card-desc');
      if (descEl) {
        const description = getLevelDescription(dimKey, levelData.level, role);
        descEl.textContent = description;
      }
    }
  }

  // Restore selections
  for (const [dimKey, value] of Object.entries(selections)) {
    const radio = document.querySelector(`input[name="${dimKey}"][value="${value}"]`);
    if (radio) {
      radio.checked = true;
      const card = radio.closest('.radio-card');
      if (card) {
        // Re-apply selected class
        document.querySelectorAll(`.radio-card[data-dimension="${dimKey}"]`).forEach(c => {
          c.classList.remove('selected');
        });
        card.classList.add('selected');
      }
    }
  }
}

/**
 * Set up click handlers for radio card selection
 */
function setupRadioCardListeners() {
  document.querySelectorAll('.radio-card').forEach(card => {
    card.addEventListener('click', function() {
      const dimension = this.dataset.dimension;

      // Remove selected class from all cards in this dimension
      document.querySelectorAll(`.radio-card[data-dimension="${dimension}"]`).forEach(c => {
        c.classList.remove('selected');
      });

      // Add selected class to clicked card
      this.classList.add('selected');

      // Ensure the radio input is checked
      const radio = this.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
      }
    });
  });
}

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// =============================================================================
// FORM COLLECTION & VALIDATION
// =============================================================================

/**
 * Collect all selected levels from the form
 * @returns {object|null} Object with dimension levels, or null if incomplete
 */
function collectAnswers() {
  const levels = {};
  const dimensionKeys = Object.keys(DIMENSIONS);

  for (const dimKey of dimensionKeys) {
    const selected = document.querySelector(`input[name="${dimKey}"]:checked`);
    if (!selected) {
      return null; // Not all questions answered
    }
    levels[dimKey] = parseInt(selected.value, 10);
  }

  return levels;
}

/**
 * Validate that all dimensions have been answered
 * @returns {boolean} True if form is valid
 */
function validateForm() {
  const levels = collectAnswers();
  const errorDiv = document.getElementById('validation-error');
  const errorMessage = document.getElementById('validation-error-message');

  if (!levels) {
    // Find which dimensions are missing
    const missing = [];
    for (const dimKey of Object.keys(DIMENSIONS)) {
      const selected = document.querySelector(`input[name="${dimKey}"]:checked`);
      if (!selected) {
        missing.push(DIMENSIONS[dimKey].name);
      }
    }

    if (errorMessage) {
      errorMessage.textContent = `Please answer the following dimensions: ${missing.join(', ')}`;
    }
    if (errorDiv) {
      errorDiv.classList.remove('hidden');
    }
    return false;
  }

  if (errorDiv) {
    errorDiv.classList.add('hidden');
  }
  return true;
}

// =============================================================================
// SCORE CALCULATION & DISPLAY
// =============================================================================

/**
 * Main calculation function - validates, calculates, and shows results
 */
function calculateAndShowResults() {
  // Validate name field
  const nameInput = document.getElementById('assessee-name');
  if (!nameInput || !nameInput.value.trim()) {
    nameInput?.classList.add('is-invalid');
    nameInput?.focus();
    return;
  }
  nameInput.classList.remove('is-invalid');

  // Validate form
  if (!validateForm()) {
    // Scroll to error message
    document.getElementById('validation-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Get name, email, role, company type and answers
  currentName = nameInput.value.trim();
  const emailInput = document.getElementById('assessee-email');
  currentEmail = emailInput ? emailInput.value.trim() : '';
  const roleSelect = document.getElementById('role-select');
  currentRole = roleSelect ? roleSelect.value : 'General';
  const companyTypeSelect = document.getElementById('company-type-select');
  currentCompanyType = companyTypeSelect ? companyTypeSelect.value : '';
  currentLevels = collectAnswers();

  // Calculate score using dual scoring (assessment level is always 1 for L1)
  currentResults = calculateDualScores(currentLevels, currentRole, currentCompanyType || null, 1);

  // Render results
  renderResults(currentResults, currentRole, currentCompanyType);

  // Check for gaming
  if (checkForGaming(currentLevels)) {
    document.getElementById('gaming-warning')?.classList.remove('hidden');
  } else {
    document.getElementById('gaming-warning')?.classList.add('hidden');
  }

  // Show results section
  const resultsSection = document.getElementById('results-section');
  if (resultsSection) {
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Check for ?scoreType=combined and auto-toggle if needed
  const scoreType = getUrlParam('scoreType');
  if (scoreType === 'combined') {
    const checkbox = document.getElementById('show-combined-score');
    if (checkbox) {
      checkbox.checked = true;
      toggleCombinedScore();
    }
  }
}

/**
 * Render the results display (v1.1 dual scoring)
 * @param {object} scoreData - Score data from calculateDualScores
 * @param {string} role - Selected role
 * @param {string} companyType - Selected company type
 */
function renderResults(scoreData, role, companyType) {
  // Personal score
  const personalValueEl = document.getElementById('personal-score-value');
  if (personalValueEl) {
    personalValueEl.textContent = scoreData.personalScore.normalizedScore;
  }

  const personalBandEl = document.getElementById('personal-score-band');
  if (personalBandEl) {
    personalBandEl.textContent = scoreData.personalScore.scoreBand;
    personalBandEl.className = `score-card-band band-${scoreData.personalScore.scoreBand.toLowerCase()}`;
  }

  // Corporate score
  const corporateValueEl = document.getElementById('corporate-score-value');
  if (corporateValueEl) {
    corporateValueEl.textContent = scoreData.corporateScore.normalizedScore;
  }

  const corporateBandEl = document.getElementById('corporate-score-band');
  if (corporateBandEl) {
    corporateBandEl.textContent = scoreData.corporateScore.scoreBand;
    corporateBandEl.className = `score-card-band band-${scoreData.corporateScore.scoreBand.toLowerCase()}`;
  }

  // Gap display
  const gapValueEl = document.getElementById('gap-value');
  if (gapValueEl) {
    const gapSign = scoreData.gap > 0 ? '+' : '';
    gapValueEl.textContent = `Gap: ${gapSign}${scoreData.gap} points`;

    // Color based on gap
    gapValueEl.classList.remove('gap-positive', 'gap-negative', 'gap-balanced');
    if (scoreData.gap > 10) {
      gapValueEl.classList.add('gap-positive');
    } else if (scoreData.gap < -10) {
      gapValueEl.classList.add('gap-negative');
    } else {
      gapValueEl.classList.add('gap-balanced');
    }
  }

  const gapInterpEl = document.getElementById('gap-interpretation');
  if (gapInterpEl) {
    gapInterpEl.textContent = scoreData.gapInterpretation.meaning;
  }

  const gapActionEl = document.getElementById('gap-action');
  if (gapActionEl) {
    gapActionEl.textContent = `Recommended: ${scoreData.gapInterpretation.action}`;
  }

  // Combined score (legacy)
  const scoreValueEl = document.getElementById('score-value');
  if (scoreValueEl) {
    scoreValueEl.textContent = scoreData.combinedScore.normalizedScore;
  }

  const scoreBandEl = document.getElementById('score-band');
  if (scoreBandEl) {
    const bandClass = `band-${scoreData.combinedScore.scoreBand.toLowerCase()}`;
    scoreBandEl.textContent = scoreData.combinedScore.scoreBand;
    scoreBandEl.className = `score-band ${bandClass}`;
  }

  // Confidence badge
  const confidenceBadgeEl = document.getElementById('confidence-badge');
  if (confidenceBadgeEl) {
    confidenceBadgeEl.textContent = `Confidence: ${scoreData.confidence} (${scoreData.evidenceMultiplier}x)`;
    confidenceBadgeEl.className = `badge badge-${scoreData.confidence.toLowerCase()}`;
  }

  // Role display
  const resultRoleEl = document.getElementById('result-role');
  if (resultRoleEl) {
    resultRoleEl.textContent = role;
  }

  // Company type display
  const resultCompanyTypeEl = document.getElementById('result-company-type');
  if (resultCompanyTypeEl) {
    resultCompanyTypeEl.textContent = companyType ? ` | Company: ${companyType}` : '';
  }

  // Dimension breakdown table
  const tbody = document.getElementById('breakdown-tbody');
  if (tbody) {
    tbody.innerHTML = '';

    let totalWeighted = 0;
    for (const [dimKey, dimData] of Object.entries(scoreData.dimensions)) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${DIMENSIONS[dimKey].name}</strong></td>
        <td>Level ${dimData.level}</td>
        <td>${dimData.rawPoints.toFixed(1)} pts</td>
        <td>${(dimData.weight * 100).toFixed(0)}%</td>
        <td class="score-cell">${dimData.weightedScore.toFixed(2)}</td>
      `;
      tbody.appendChild(row);
      totalWeighted += dimData.weightedScore;
    }

    // Add total row
    const totalRow = document.createElement('tr');
    totalRow.innerHTML = `
      <td colspan="4"><strong>Raw Weighted Total</strong></td>
      <td class="score-cell"><strong>${totalWeighted.toFixed(2)}</strong></td>
    `;
    tbody.appendChild(totalRow);
  }

  // Calculation details
  const calcDetailsEl = document.getElementById('calc-details');
  if (calcDetailsEl) {
    calcDetailsEl.innerHTML = `
      <strong>Dual Scoring (v1.1):</strong><br>
      Personal Readiness: ${scoreData.personalScore.normalizedScore} (${scoreData.personalScore.scoreBand})<br>
      Corporate Impact: ${scoreData.corporateScore.normalizedScore} (${scoreData.corporateScore.scoreBand})<br>
      Gap: ${scoreData.gap > 0 ? '+' : ''}${scoreData.gap} points<br><br>
      <strong>Combined (legacy):</strong> ${scoreData.combinedScore.normalizedScore} &times; ${scoreData.evidenceMultiplier} = <strong>${scoreData.combinedScore.normalizedScore}</strong>
    `;
  }
}

/**
 * Toggle combined score display
 */
function toggleCombinedScore() {
  const checkbox = document.getElementById('show-combined-score');
  const section = document.getElementById('combined-score-section');

  if (checkbox && section) {
    if (checkbox.checked) {
      section.classList.remove('hidden');
      setUrlParam('scoreType', 'combined');
    } else {
      section.classList.add('hidden');
      removeUrlParam('scoreType');
    }
  }
}

/**
 * Check if scores suggest gaming (all levels >= 4)
 * @param {object} levels - Object with dimension levels
 * @returns {boolean} True if gaming is suspected
 */
function checkForGaming(levels) {
  for (const level of Object.values(levels)) {
    if (level < 4) {
      return false;
    }
  }
  return true;
}

// =============================================================================
// DOWNLOAD FUNCTIONS
// =============================================================================

/**
 * Download JSON report
 */
async function downloadJSON() {
  if (!currentResults || !currentLevels) {
    alert('Please complete the assessment first.');
    return;
  }

  // Clear any previous validation errors
  clearValidationErrors();

  // Create report object using shared utility
  const report = createReportObject({
    assesseeName: currentName,
    assesseeEmail: currentEmail,
    role: currentRole,
    companyType: currentCompanyType || null,
    levels: currentLevels,
    assessmentLevel: 1
  });

  // Validate against JSON schema
  const validation = await validateReportSchema(report);
  if (!validation.valid) {
    // Find download options container to show errors near
    const downloadOptions = document.querySelector('.download-options');
    displayValidationErrors(validation.errors, null, downloadOptions);
    return;
  }

  // Create and download blob
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aiq-report-${report.reportId}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download PDF summary using html2pdf (v1.1 dual scoring)
 */
function downloadPDF() {
  if (!currentResults || !currentLevels) {
    alert('Please complete the assessment first.');
    return;
  }

  const reportId = generateReportId();
  const dateStr = formatISODate();

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h1 style="text-align: center; color: #0f172a; margin-bottom: 5px;">AIQ Assessment Report</h1>
      <p style="text-align: center; color: #64748b; margin-top: 0;">Level 1: Self-Assessment (v1.1 Dual Scoring)</p>

      <table style="width: 100%; margin: 30px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Name:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${currentName}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Report ID:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${reportId}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Date:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${dateStr}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Role:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${currentRole}</td>
        </tr>
        ${currentCompanyType ? `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>Company Type:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${currentCompanyType}</td>
        </tr>
        ` : ''}
      </table>

      <!-- Dual Scores -->
      <div style="display: flex; gap: 20px; margin: 20px 0;">
        <div style="flex: 1; text-align: center; background: #f8fafc; padding: 20px; border-radius: 12px;">
          <div style="font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 5px;">Personal Readiness</div>
          <div style="font-size: 36px; font-weight: bold; color: #0f172a;">${currentResults.personalScore.normalizedScore}</div>
          <div style="display: inline-block; padding: 4px 12px; background: #4f46e5; color: white; border-radius: 6px; margin-top: 8px; font-size: 12px;">
            ${currentResults.personalScore.scoreBand}
          </div>
        </div>
        <div style="flex: 1; text-align: center; background: #f8fafc; padding: 20px; border-radius: 12px;">
          <div style="font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 5px;">Corporate Impact</div>
          <div style="font-size: 36px; font-weight: bold; color: #0f172a;">${currentResults.corporateScore.normalizedScore}</div>
          <div style="display: inline-block; padding: 4px 12px; background: #4f46e5; color: white; border-radius: 6px; margin-top: 8px; font-size: 12px;">
            ${currentResults.corporateScore.scoreBand}
          </div>
        </div>
      </div>

      <!-- Gap -->
      <div style="text-align: center; background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <div style="font-size: 16px; font-weight: bold; color: ${currentResults.gap > 10 ? '#22c55e' : currentResults.gap < -10 ? '#f59e0b' : '#4f46e5'};">
          Gap: ${currentResults.gap > 0 ? '+' : ''}${currentResults.gap} points
        </div>
        <div style="font-size: 14px; color: #64748b; margin-top: 5px;">${currentResults.gapInterpretation.meaning}</div>
        <div style="font-size: 12px; color: #94a3b8; margin-top: 3px;">Recommended: ${currentResults.gapInterpretation.action}</div>
      </div>

      <div style="text-align: center; margin: 15px 0; color: #64748b; font-size: 12px;">
        Confidence: ${currentResults.confidence} (${currentResults.evidenceMultiplier}x)
      </div>

      <h3 style="color: #0f172a; margin-top: 30px;">Dimension Breakdown</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f8fafc;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e2e8f0;">Dimension</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e2e8f0;">Level</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e2e8f0;">Points</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e2e8f0;">Weight</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e2e8f0;">Weighted</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(currentResults.dimensions).map(([dimKey, dimData]) => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>${DIMENSIONS[dimKey].name}</strong></td>
              <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e2e8f0;">${dimData.level}</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">${dimData.rawPoints.toFixed(1)}</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">${(dimData.weight * 100).toFixed(0)}%</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">${dimData.weightedScore.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="margin-top: 30px; text-align: center; color: #64748b; font-size: 12px;">
        <p>Universal AIQ Framework - Level 1 Self-Assessment (v1.1)</p>
        <p>For higher confidence scores, complete Level 2 (Peer Validation) or Level 3 (Evidence Collection)</p>
      </div>
    </div>
  `;

  // Create temporary container
  const container = document.createElement('div');
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  // PDF options
  const options = {
    margin: 10,
    filename: `aiq-report-${reportId}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // Generate PDF
  html2pdf().set(options).from(container).save().then(() => {
    document.body.removeChild(container);
  });
}

/**
 * Navigate to Level 2 peer review with pre-filled data
 */
function goToPeerReview() {
  if (!currentResults || !currentLevels) {
    alert('Please complete the assessment first.');
    return;
  }

  // Encode current state for L2
  const stateData = {
    name: currentName,
    email: currentEmail,
    role: currentRole,
    companyType: currentCompanyType,
    levels: currentLevels,
    fromL1: true
  };

  const encoded = encodeState(stateData);
  window.location.href = `level2.html?prefill=${encoded}`;
}

// =============================================================================
// EXPORT TO GLOBAL SCOPE
// =============================================================================

window.toggleCombinedScore = toggleCombinedScore;

// =============================================================================
// DOCUMENT READY
// =============================================================================

document.addEventListener('DOMContentLoaded', initAssessment);
