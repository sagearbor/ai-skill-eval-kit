/**
 * AIQ Assessment Tools - Level 1 Self-Assessment
 * Handles the self-assessment survey logic and scoring
 */

// Store current results for download functions
let currentResults = null;
let currentRole = 'General';
let currentLevels = null;
let currentName = '';
let currentEmail = '';

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize the assessment page on DOM ready
 */
function initAssessment() {
  // Populate role dropdown
  const roleSelect = document.getElementById('role-select');
  if (roleSelect) {
    populateRoleSelect(roleSelect, 'General');
    roleSelect.addEventListener('change', function() {
      currentRole = this.value;
    });
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
 * @param {string} dimensionKey - The dimension key (study, copy, etc.)
 * @param {object} dimensionData - The dimension data from DIMENSIONS
 * @returns {string} HTML string for the dimension section
 */
function renderDimensionForm(dimensionKey, dimensionData) {
  const letter = dimensionData.name.charAt(0).toUpperCase();
  const subtitle = dimensionData.fullName.split(' - ')[1] || dimensionData.fullName.split('(')[1]?.replace(')', '') || '';

  let radioCardsHtml = '';
  for (const levelData of dimensionData.levels) {
    const pointsText = levelData.level === 0
      ? '0 pts'
      : `${levelData.minPoints}-${levelData.maxPoints} pts`;

    radioCardsHtml += `
      <label class="radio-card" data-dimension="${dimensionKey}" data-level="${levelData.level}">
        <input type="radio" name="${dimensionKey}" value="${levelData.level}">
        <div class="radio-card-indicator"></div>
        <div class="radio-card-content">
          <div class="radio-card-label">Level ${levelData.level} (${pointsText})</div>
          <div class="radio-card-desc">${escapeHtml(levelData.description)}</div>
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

  // Get name, email, role and answers
  currentName = nameInput.value.trim();
  const emailInput = document.getElementById('assessee-email');
  currentEmail = emailInput ? emailInput.value.trim() : '';
  const roleSelect = document.getElementById('role-select');
  currentRole = roleSelect ? roleSelect.value : 'General';
  currentLevels = collectAnswers();

  // Calculate score (assessment level is always 1 for L1)
  currentResults = calculateAIQScore(currentLevels, currentRole, 1);

  // Render results
  renderResults(currentResults, currentRole);

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
}

/**
 * Render the results display
 * @param {object} scoreData - Score data from calculateAIQScore
 * @param {string} role - Selected role
 */
function renderResults(scoreData, role) {
  // Score value
  const scoreValueEl = document.getElementById('score-value');
  if (scoreValueEl) {
    scoreValueEl.textContent = scoreData.normalizedScore;
  }

  // Score band
  const scoreBandEl = document.getElementById('score-band');
  if (scoreBandEl) {
    const bandClass = `band-${scoreData.scoreBand.name.toLowerCase()}`;
    scoreBandEl.textContent = scoreData.scoreBand.name;
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
    const maxPossible = getMaxWeightedScore(role);
    calcDetailsEl.innerHTML = `
      Raw Total: ${scoreData.rawWeightedTotal.toFixed(2)} &times; ${scoreData.evidenceMultiplier} (evidence multiplier) = ${scoreData.finalWeightedScore.toFixed(2)}<br>
      Normalized: ${scoreData.finalWeightedScore.toFixed(2)} / ${maxPossible.toFixed(2)} (max for ${role}) &times; 100 = <strong>${scoreData.normalizedScore}</strong>
    `;
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
function downloadJSON() {
  if (!currentResults || !currentLevels) {
    alert('Please complete the assessment first.');
    return;
  }

  // Create report object using shared utility
  const report = createReportObject({
    assesseeName: currentName,
    assesseeEmail: currentEmail,
    role: currentRole,
    levels: currentLevels,
    assessmentLevel: 1
  });

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
 * Download PDF summary using html2pdf
 */
function downloadPDF() {
  if (!currentResults || !currentLevels) {
    alert('Please complete the assessment first.');
    return;
  }

  // Create simple HTML template (table-based for PDF compatibility)
  const bandClass = currentResults.scoreBand.name.toLowerCase();
  const reportId = generateReportId();
  const dateStr = formatISODate();

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h1 style="text-align: center; color: #0f172a; margin-bottom: 5px;">AIQ Assessment Report</h1>
      <p style="text-align: center; color: #64748b; margin-top: 0;">Level 1: Self-Assessment</p>

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
      </table>

      <div style="text-align: center; background: #f8fafc; padding: 30px; border-radius: 12px; margin: 20px 0;">
        <div style="font-size: 48px; font-weight: bold; color: #0f172a;">${currentResults.normalizedScore}</div>
        <div style="color: #64748b; margin-top: 5px;">AIQ Score</div>
        <div style="display: inline-block; padding: 8px 16px; background: #4f46e5; color: white; border-radius: 6px; margin-top: 15px; font-weight: 600;">
          ${currentResults.scoreBand.name}
        </div>
        <div style="margin-top: 10px; color: #64748b; font-size: 14px;">
          Confidence: ${currentResults.confidence} (${currentResults.evidenceMultiplier}x)
        </div>
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
          <tr style="font-weight: bold;">
            <td colspan="4" style="padding: 10px; border-top: 2px solid #e2e8f0;">Total (before multiplier)</td>
            <td style="padding: 10px; text-align: right; border-top: 2px solid #e2e8f0;">${currentResults.rawWeightedTotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 30px; padding: 15px; background: #f8fafc; border-radius: 8px; font-size: 14px;">
        <strong>Score Calculation:</strong><br>
        Raw Total (${currentResults.rawWeightedTotal.toFixed(2)}) x Evidence Multiplier (${currentResults.evidenceMultiplier}) = ${currentResults.finalWeightedScore.toFixed(2)}<br>
        Normalized to 0-100 scale = <strong>${currentResults.normalizedScore}</strong>
      </div>

      <div style="margin-top: 30px; text-align: center; color: #64748b; font-size: 12px;">
        <p>Universal AIQ Framework - Level 1 Self-Assessment</p>
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
    levels: currentLevels,
    fromL1: true
  };

  const encoded = encodeState(stateData);
  window.location.href = `level2.html?prefill=${encoded}`;
}

// =============================================================================
// DOCUMENT READY
// =============================================================================

document.addEventListener('DOMContentLoaded', initAssessment);
