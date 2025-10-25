// Sidebar functionality
document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const menuItems = document.querySelectorAll('.menu-item');
  const submenuToggles = document.querySelectorAll('.submenu-toggle');
  const submenuItems = document.querySelectorAll('.submenu-item');
  const searchInput = document.querySelector('.sidebar-search input');

  // Sidebar toggle functionality
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        // Mobile behavior
        sidebar?.classList.toggle('open');
      } else {
        // Desktop behavior
        sidebar?.classList.toggle('collapsed');
        localStorage.setItem('sidebarCollapsed', sidebar?.classList.contains('collapsed') ? 'true' : 'false');
      }
    });
  }

  // Restore sidebar state on page load
  const sidebarCollapsed = localStorage.getItem('sidebarCollapsed');
  if (sidebarCollapsed === 'true') {
    sidebar?.classList.add('collapsed');
  }

  // Helper: Close other open submenus
  function closeOtherSubmenus(except) {
    menuItems.forEach(function(item) {
      if (item !== except && item.classList.contains('has-submenu')) {
        item.classList.remove('open');
      }
    });
  }

  // Helper: Re-apply search state if searching
  function enforceSearchState() {
    if (searchInput && searchInput.value.trim() !== '') {
      applyMenuSearch(searchInput.value);
    }
  }

  // Submenu toggle functionality (via chevron)
  submenuToggles.forEach(function(toggle) {
    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      e.preventDefault();
      const menuItem = toggle.closest('.menu-item');
      if (!menuItem) return;
      closeOtherSubmenus(menuItem);
      menuItem.classList.toggle('open');
      enforceSearchState(); // Keep behavior consistent during search
    });
  });

  // Also handle clicks on the menu-link (parent menu item area)
  document.querySelectorAll('.menu-link').forEach(function(menuLink) {
    menuLink.addEventListener('click', function(e) {
      e.stopPropagation();
      e.preventDefault();
      const menuItem = this.closest('.menu-item');
      if (!menuItem) return;
      closeOtherSubmenus(menuItem);
      menuItem.classList.toggle('open');
      enforceSearchState(); // Keep behavior consistent during search
    });
  });

  // Save active menu state
  function saveActiveMenuState(activeItem, isSubmenu = false) {
    const linkEl = activeItem.querySelector('a');
    const href = linkEl ? linkEl.getAttribute('href') : '';
    const activeData = {
      type: isSubmenu ? 'submenu' : 'menu',
      href,
      text: activeItem.textContent.trim()
    };
    localStorage.setItem('activeMenuState', JSON.stringify(activeData));
  }

  // Restore active menu state
  function restoreActiveMenuState() {
    const savedState = localStorage.getItem('activeMenuState');
    if (savedState) {
      const activeData = JSON.parse(savedState);

      // Clear all active
      menuItems.forEach(mi => mi.classList.remove('active'));
      submenuItems.forEach(si => si.classList.remove('active'));

      let found = false;

      if (activeData.type === 'submenu') {
        submenuItems.forEach(function(subItem) {
          const link = subItem.querySelector('a');
          if (link && link.getAttribute('href') === activeData.href) {
            subItem.classList.add('active');
            const parent = subItem.closest('.menu-item');
            if (parent) {
              parent.classList.add('open');
              parent.classList.remove('active');
            }
            found = true;
          }
        });
      } else {
        menuItems.forEach(function(menuItem) {
          const link = menuItem.querySelector('a');
          if (link && link.getAttribute('href') === activeData.href) {
            menuItem.classList.add('active');
            found = true;
          }
        });
      }

      if (!found) {
        localStorage.removeItem('activeMenuState');
        // Default to dashboard.html if present
        menuItems.forEach(function(menuItem) {
          const link = menuItem.querySelector('a');
          if (link && link.getAttribute('href') === 'dashboard.html') {
            menuItem.classList.add('active');
          }
        });
      }
    } else {
      // Default to dashboard.html if present
      menuItems.forEach(function(menuItem) {
        const link = menuItem.querySelector('a');
        if (link && link.getAttribute('href') === 'dashboard.html') {
          menuItem.classList.add('active');
        }
      });
    }
  }

  // Menu item click functionality (no-submenu items)
  menuItems.forEach(function(item) {
    if (!item.classList.contains('has-submenu')) {
      const link = item.querySelector('a');
      if (link) {
        link.addEventListener('click', function() {
          menuItems.forEach(mi => mi.classList.remove('active'));
          submenuItems.forEach(si => si.classList.remove('active'));
          item.classList.add('active');
          saveActiveMenuState(item, false);
        });
      }
    }
  });

  // Submenu item click functionality
  submenuItems.forEach(function(subItem) {
    const link = subItem.querySelector('a');
    if (link) {
      link.addEventListener('click', function() {
        menuItems.forEach(mi => mi.classList.remove('active'));
        submenuItems.forEach(si => si.classList.remove('active'));
        subItem.classList.add('active');
        const parent = subItem.closest('.menu-item');
        if (parent) parent.classList.remove('active');
        saveActiveMenuState(subItem, true);
      });
    }
  });

  // Update menu-section visibility when searching (hide if no visible items under it)
  function updateMenuSectionsVisibility() {
    const sections = document.querySelectorAll('.menu-section');
    sections.forEach(section => {
      let next = section.nextElementSibling;
      let visibleFound = false;
      while (next && !next.classList.contains('menu-section')) {
        if (next.classList.contains('menu-item') && next.style.display !== 'none') {
          visibleFound = true;
          break;
        }
        next = next.nextElementSibling;
      }
      section.style.display = visibleFound ? '' : 'none';
    });
  }

  // Reset search effects
  function resetMenuSearch() {
    document.querySelectorAll('.menu-item, .submenu-item, .menu-section').forEach(el => {
      el.style.removeProperty('display');
    });
    updateMenuSectionsVisibility();
  }

  // Apply search: show parent if parent or any child matches, and show ALL its children
  function applyMenuSearch(rawTerm) {
    const term = (rawTerm || '').trim().toLowerCase();
    if (!term) {
      resetMenuSearch();
      return;
    }

    document.querySelectorAll('.menu-item').forEach(item => {
      const isParent = item.classList.contains('has-submenu');

      if (isParent) {
        const parentText = (item.querySelector('.menu-link')?.textContent || '').toLowerCase();
        const subs = item.querySelectorAll('.submenu-item');

        const childMatch = Array.from(subs).some(sub => sub.textContent.toLowerCase().includes(term));
        const parentMatch = parentText.includes(term);

        if (parentMatch || childMatch) {
          // Show and open parent
          item.style.display = '';
          item.classList.add('open');
          // Show ALL children
          subs.forEach(sub => sub.style.removeProperty('display'));
        } else {
          item.style.display = 'none';
          item.classList.remove('open');
        }
      } else {
        // Single menu item (no submenu)
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(term) ? '' : 'none';
      }
    });

    updateMenuSectionsVisibility();
  }

  // Restore active menu state on page load
  restoreActiveMenuState();

  // Close submenus when clicking outside (disabled while searching), and close mobile sidebar
  document.addEventListener('click', function(e) {
    const searchActive = !!(searchInput && searchInput.value.trim());
    if (!e.target.closest('.menu-item')) {
      if (!searchActive) {
        menuItems.forEach(function(item) {
          if (item.classList.contains('has-submenu')) {
            const hasActiveSubmenu = item.querySelector('.submenu-item.active');
            if (!hasActiveSubmenu) {
              item.classList.remove('open');
            }
          }
        });
      }
    }
    // Close mobile sidebar when clicking outside
    if (window.innerWidth <= 768 && !e.target.closest('.sidebar') && !e.target.closest('.sidebar-toggle')) {
      sidebar?.classList.remove('open');
    }
  });

  // Search functionality: open matched parents and show full submenu
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      applyMenuSearch(this.value);
    });

    // Clear search and restore when empty
    const clearIfEmpty = () => {
      if (!searchInput.value.trim()) {
        resetMenuSearch();
      }
    };
    searchInput.addEventListener('blur', clearIfEmpty);
    searchInput.addEventListener('search', clearIfEmpty); // for inputs with clear (if type="search")
  }

  // Dashboard Header -> User Dropdown Start
  const userBtn = document.querySelector('.user-btn');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  
  if (userBtn && dropdownMenu) {
    
    // Toggle dropdown on click
    userBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Toggle the show class
      if (dropdownMenu.classList.contains('show')) {
        dropdownMenu.classList.remove('show');
      } else {
        dropdownMenu.classList.add('show');
      }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.user-dropdown')) {
        dropdownMenu.classList.remove('show');
      }
    });
    
    // Handle dropdown item clicks
    const dropdownItems = dropdownMenu.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(function(item) {
      item.addEventListener('click', function(e) {
        // Don't prevent default - let the link work naturally
        // e.preventDefault();
        e.stopPropagation();
        
        const href = this.getAttribute('href');
        
        // Close dropdown after action
        dropdownMenu.classList.remove('show');
      });
    });
  } else {
    // console.log('User dropdown elements not found:', { userBtn, dropdownMenu });
  }
  // Dashboard Header -> User Dropdown End

  // Dashboard Main Page -> Earning Statistics Chart Start
  const earningCtx = document.getElementById('earningChart');
  if (earningCtx) {
    new Chart(earningCtx.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Inhouse',
            data: [1.2, 1.8, 0.8, 2.1, 1.5, 2.3, 2.8, 1.9, 1.2, 2.5, 1.8, 2.9],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            pointStyle: 'rectRounded',
            radius: 4,
            fill: false
          },
          {
            label: 'Vendor',
            data: [1.5, 1.9, 1.2, 0.8, 2.0, 2.8, 2.5, 2.2, 1.9, 2.3, 1.6, 2.1],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            pointStyle: 'rectRounded',
            radius: 4,
            fill: false
          },
          {
            label: 'Commission',
            data: [0.3, 0.4, 0.2, 0.5, 0.3, 0.6, 0.4, 0.5, 0.3, 0.4, 0.2, 0.5],
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            pointStyle: 'rectRounded',
            radius: 4,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              usePointStyle: true, 
              pointStyle: 'rectRounded' 
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            stepSize: 1,
            ticks: {
              callback: function (value) {
                return '$' + value;
              },
              stepSize: 1,           
              precision: 0
            }
          }
        }
      }
    });
  }
   // Dashboard Main Page -> Earning Statistics Chart End

   // Dashboard Main Page -> User Overview Chart Start
  const userCtx = document.getElementById('userChart');
  if (userCtx) {
    new Chart(userCtx.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Total customer (8)', 'Total vendor (10)', 'Total delivery man (4)'],
        datasets: [{
          data: [8, 10, 4],
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 12
              }
            }
          }
        }
      }
    });
  }
  // Dashboard Main Page -> User Overview Chart End

  // --- All Order Page-> Toggle Filter Section Start ---
  const toggleFilterBtn = document.getElementById('toggleFilterBtn');
  const orderFilterSection = document.getElementById('orderFilterSection');

  if (!toggleFilterBtn || !orderFilterSection) return;

  const STORAGE = sessionStorage; // if you want use localStorage
  const toogleSTORAGE_KEY = 'orderFilterVisible';

  const VISIBLE_DISPLAY = orderFilterSection.dataset.visibleDisplay || 'block';

  const saved = STORAGE.getItem(toogleSTORAGE_KEY);
  let isVisible = saved !== null
    ? saved === '1'
    : (getComputedStyle(orderFilterSection).display !== 'none');

  function apply() {
    orderFilterSection.style.display = isVisible ? VISIBLE_DISPLAY : 'none';
    toggleFilterBtn.setAttribute('aria-expanded', String(isVisible));
    toggleFilterBtn.setAttribute('aria-controls', orderFilterSection.id);
  }

  apply();

  toggleFilterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isVisible = !isVisible;
    STORAGE.setItem(toogleSTORAGE_KEY, isVisible ? '1' : '0');
    apply();
  });
  // --- All Order Page-> Toggle Filter Section End ---

  // --- All Order Page-> "See All" button + Search Functionality Start ---
  const STORAGE_KEY = 'seeAllExpandedState';
  const SEE_ALL_TEXT = 'See all <i class="fa fa-chevron-down"></i>';
  const SEE_LESS_TEXT = 'Show less <i class="fa fa-chevron-up"></i>';

  // Only these columns will be searched
  const SEARCH_SELECTORS = [
    '.order-id',           // order ID cell
    '.customer-name',      // customer name cell
    '.status',
    // '.order-code',
    // 'td:nth-child(2)',   // example: second column
  ];
  const FALLBACK_TO_ALL_TDS = false; // set true to fall back to all cells if none of the selectors exist

  const seeAllBtn = document.getElementById('seeAllBtn');
  const ordersearchInput = document.getElementById('orderIdSearch');
  const tableBody = document.getElementById('orderTableBody');
  const searchBtn = document.querySelector('.search-input-group .btn');

  const isExpanded = () => sessionStorage.getItem(STORAGE_KEY) === 'true';
  const setExpanded = (val) => val
    ? sessionStorage.setItem(STORAGE_KEY, 'true')
    : sessionStorage.removeItem(STORAGE_KEY);

  function updateSeeAllButton() {
    if (!seeAllBtn) return;
    seeAllBtn.innerHTML = isExpanded() ? SEE_LESS_TEXT : SEE_ALL_TEXT;
  }

  function getRowText(row) {
    // Collect text only from specified selectors
    let nodes = [];
    SEARCH_SELECTORS.forEach(sel => {
      nodes = nodes.concat(Array.from(row.querySelectorAll(sel)));
    });

    if (nodes.length === 0 && FALLBACK_TO_ALL_TDS) {
      nodes = Array.from(row.querySelectorAll('td'));
    }

    return nodes
      .map(n => (n.textContent || n.innerText || '').trim().toLowerCase())
      .join(' ');
  }

  function applyRowVisibility() {
    if (!tableBody) return;
    const query = (ordersearchInput?.value || '').toLowerCase().trim();
    const expanded = isExpanded();
    const rows = tableBody.querySelectorAll('tr');

    rows.forEach(row => {
      const isHiddenRow = row.classList.contains('hidden-row');
      const matches = query ? getRowText(row).includes(query) : true;

      let show;
      if (query) {
        // During search, show only matches (even if it was a hidden-row)
        show = matches;
      } else {
        // No search → respect See All state
        show = !isHiddenRow || expanded;
      }

      row.style.display = show ? 'table-row' : 'none'; // force-visible when needed
    });
  }

  // See All button
  if (seeAllBtn) {
    updateSeeAllButton();
    seeAllBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setExpanded(!isExpanded());
      updateSeeAllButton();
      applyRowVisibility();
    });
  }

  // Search handlers
  if (ordersearchInput) {
    ordersearchInput.addEventListener('input', applyRowVisibility);
    // Optional: ESC clears input
    ordersearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        ordersearchInput.value = '';
        applyRowVisibility();
      }
    });
  }
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      applyRowVisibility();
    });
  }

  // Initial render
  applyRowVisibility();
    // --- All Order Page-> "See All" button + Search Functionality End ---

  // ----------------------- IMAGE UPLOAD / DRAG & DROP / RESET Start--------------------------
  const box = document.getElementById('uploadBox');
  const input = document.getElementById('imageInput');
  const preview = document.getElementById('previewImg');
  const resetBtn = document.getElementById('resetBtn');

  // click to open
  box.addEventListener('click', () => input.click());

  // drag & drop events
  ['dragenter','dragover'].forEach(ev => {
      box.addEventListener(ev, e => {
      e.preventDefault(); e.stopPropagation();
      box.classList.add('hover');
      }, false);
  });
  ['dragleave','drop'].forEach(ev => {
      box.addEventListener(ev, e => {
      e.preventDefault(); e.stopPropagation();
      box.classList.remove('hover');
      }, false);
  });
  box.addEventListener('drop', e => {
      const files = e.dataTransfer?.files;
      if (files && files[0]) handleFile(files[0]);
  });

  // file input change
  input.addEventListener('change', () => {
      if (input.files && input.files[0]) handleFile(input.files[0]);
  });

  function handleFile(file){
      // validate type
      if (!/^image\/(jpe?g|png)$/i.test(file.type)) {
      alert('Please select a JPG or PNG image.');
      return;
      }
      // validate size (<= 2MB)
      if (file.size > 2 * 1024 * 1024) {
      alert('Max file size is 2 MB.');
      return;
      }
      const reader = new FileReader();
      reader.onload = e => {
      preview.src = e.target.result;
      box.classList.add('has-image');
      };
      reader.readAsDataURL(file);
  }

  // reset
  resetBtn.addEventListener('click', () => {
      input.value = '';
      preview.src = '';
      box.classList.remove('has-image');
  });
   // ----------------------- IMAGE UPLOAD / DRAG & DROP / RESET End--------------------------
});

// for select2 initialization Start
$(document).ready(function() {
    $('.select2').select2();
    $('#addFundModal').on('shown.bs.modal', function () {
      $('.customer').select2({
          dropdownParent: $('#addFundModal')   
      });
  });
});
// for select2 initialization End