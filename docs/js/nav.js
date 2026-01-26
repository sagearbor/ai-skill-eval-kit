/**
 * AIQ Framework - Side Navigation
 * Injects consistent navigation across all pages
 */

(function() {
  'use strict';

  // Detect current page from URL
  function getCurrentPage() {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path.includes('reference')) {
      // Map hash to nav item id
      if (hash === '#weights') return 'weights';
      if (hash === '#matrix') return 'matrix';
      if (hash === '#rubrics') return 'rubrics';
      return 'reference';
    }
    if (path.endsWith('index.html') || path.endsWith('/') || path.endsWith('/docs/')) return 'home';
    if (path.includes('level1')) return 'level1';
    if (path.includes('level2-validate')) return 'level2-validate';
    if (path.includes('level2')) return 'level2';
    if (path.includes('level3')) return 'level3';
    if (path.includes('dashboard')) return 'dashboard';
    if (path.includes('aggregate')) return 'aggregate';
    return 'home';
  }

  // Get base path for links (handle subdirectories like /tools/)
  function getBasePath() {
    const path = window.location.pathname;
    if (path.includes('/tools/')) {
      return '../';
    }
    return '';
  }

  // Build navigation HTML
  function buildNavHTML() {
    const current = getCurrentPage();
    const base = getBasePath();

    const navItems = [
      { section: 'Start', items: [
        { id: 'home', label: 'Home', icon: '🏠', href: base + 'index.html' },
      ]},
      { section: 'Assess', items: [
        { id: 'level1', label: 'Level 1: Self', icon: '①', href: base + 'level1.html', badge: '0.6x' },
        { id: 'level2', label: 'Level 2: Peer', icon: '②', href: base + 'level2.html', badge: '0.8x' },
        { id: 'level3', label: 'Level 3: Verified', icon: '③', href: base + 'level3.html', badge: '1.0x' },
      ]},
      { section: 'Reference', items: [
        { id: 'reference', label: 'Framework Overview', icon: '📖', href: base + 'reference.html#overview' },
        { id: 'weights', label: 'Weight Tables', icon: '⚖️', href: base + 'reference.html#weights' },
        { id: 'matrix', label: 'Validation Matrix', icon: '✓', href: base + 'reference.html#matrix' },
        { id: 'rubrics', label: 'Full Rubrics', icon: '📋', href: base + 'reference.html#rubrics' },
      ]},
      { section: 'Analytics', items: [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', href: base + 'tools/dashboard.html' },
      ]},
    ];

    let html = `
      <button class="mobile-nav-toggle" onclick="toggleMobileNav()" aria-label="Toggle navigation">☰</button>
      <div class="sidebar-overlay" onclick="toggleMobileNav()"></div>
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <a href="${base}index.html" class="sidebar-logo">
            <span class="sidebar-logo-icon">🎯</span>
            <span>AIQ Framework</span>
          </a>
        </div>
        <nav class="sidebar-nav">
    `;

    for (const section of navItems) {
      html += `
        <div class="nav-section">
          <div class="nav-section-title">${section.section}</div>
      `;
      for (const item of section.items) {
        const isActive = item.id === current ||
          (item.id === 'home' && current === 'home' && !item.href.includes('#'));
        const activeClass = isActive ? ' active' : '';
        const badge = item.badge ? `<span class="nav-item-badge">${item.badge}</span>` : '';
        html += `
          <a href="${item.href}" class="nav-item${activeClass}">
            <span class="nav-item-icon">${item.icon}</span>
            <span>${item.label}</span>
            ${badge}
          </a>
        `;
      }
      html += '</div>';
    }

    html += `
        </nav>
        <div class="sidebar-footer">
          <div style="margin-bottom: 0.5rem;">
            <a href="https://github.com/sagearbor/ai-skill-eval-kit" target="_blank">GitHub</a>
            <span style="margin: 0 0.5rem;">·</span>
            <a href="${base}ai_mastery_eval.md" target="_blank">Spec</a>
          </div>
          <div style="opacity: 0.7;">v1.1 · SCOREs Framework</div>
        </div>
      </aside>
    `;

    return html;
  }

  // Wrap existing content in main-content div
  function wrapContent() {
    const body = document.body;
    const children = Array.from(body.children);

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'app-layout';

    // Create main content area
    const main = document.createElement('div');
    main.className = 'main-content';

    // Move all existing children to main
    for (const child of children) {
      // Skip if it's a script tag at the end
      if (child.tagName === 'SCRIPT') continue;
      main.appendChild(child);
    }

    // Build nav and add to wrapper
    wrapper.innerHTML = buildNavHTML();
    wrapper.appendChild(main);

    // Insert wrapper at beginning of body
    body.insertBefore(wrapper, body.firstChild);
  }

  // Toggle mobile navigation
  window.toggleMobileNav = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  };

  // Close mobile nav when clicking a link
  function setupMobileNavClose() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('open');
          overlay.classList.remove('open');
        }
      });
    });
  }

  // Handle hash links for scrolling to sections
  function setupHashLinks() {
    const navItems = document.querySelectorAll('.nav-item[href*="#"]');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const href = item.getAttribute('href');
        const hashIndex = href.indexOf('#');
        if (hashIndex > -1) {
          const targetId = href.substring(hashIndex + 1);
          const targetEl = document.getElementById(targetId);
          if (targetEl) {
            e.preventDefault();
            // Expand if it's a collapsible
            const collapsible = targetEl.closest('.collapsible');
            if (collapsible) {
              collapsible.classList.add('expanded');
            }
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Update URL without reload
            history.pushState(null, '', href);
          }
        }
      });
    });
  }

  // Initialize when DOM is ready
  function init() {
    wrapContent();
    setupMobileNavClose();
    setupHashLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
