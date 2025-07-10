
const filters = {
  status: [],
  handledBy: [],
  expiry: []
};

const handledByOptions = [
  "Sachit Aggarwal", "Tina Jain Aggarwal", "Rajesh Makker",
  "Anchal Aggarwal", "Garima Singh", "Prashant", "Akshay Kumar"
];

const statusOptions = ["Working", "On hold", "Closed", "Merged"];
const expiryOptions = ["30", "90"];

function renderFilterPanel() {
  const panel = document.getElementById('filterPanel');
  if (!panel) return;

  panel.innerHTML = `
    <h3>Status</h3>
    ${renderCheckboxGroup('status', statusOptions)}

    <h3>Handled By</h3>
    ${renderCheckboxGroup('handledBy', handledByOptions)}

    <h3>Expiry</h3>
    ${renderCheckboxGroup('expiry', expiryOptions, true)}
  `;

  // Attach listeners after injecting
  document.querySelectorAll('.filter-checkbox').forEach(cb => {
    cb.addEventListener('change', handleFilterChange);
  });
}


function renderCheckboxGroup(name, options, numeric = false) {
  return options.map(option => `
    <div>
      <label>
        <input type="checkbox" class="filter-checkbox" data-type="${name}" value="${option}">
        ${numeric ? `Next ${option} Days` : option}
      </label>
    </div>
  `).join('');
}

function handleFilterChange() {
  const type = this.getAttribute('data-type');
  const value = this.value;

  // Multi-select logic
  if (this.checked) {
    if (!filters[type].includes(value)) {
      filters[type].push(value);
    }
  } else {
    filters[type] = filters[type].filter(v => v !== value);
  }

  applyFilters();
}

function applyFilters() {
  const isAnyFilterActive =
  filters.status.length > 0 ||
  filters.handledBy.length > 0 ||
  filters.expiry.length > 0;

const dashboardSection = document.getElementById("dashboardSection");
const tableWrapperEl = document.querySelector(".table-wrapper");

if (!isAnyFilterActive) {
  if (dashboardSection) dashboardSection.classList.remove("hidden");
  if (tableWrapperEl) tableWrapperEl.style.display = "none";
  return; // ✅ Exit early, don’t populate the table
}

  const filtered = allClients.filter(client => {
    const handled = (client.handledby || "").trim().toLowerCase();
    const status = (client.status || "").trim().toLowerCase();
    const expiryDate = client.nocexpirydate ? new Date(client.nocexpirydate) : null;

    const handledMatch = filters.handledBy.length === 0 ||
      filters.handledBy.map(h => h.toLowerCase()).includes(handled);

    const statusMatch = filters.status.length === 0 ||
      filters.status.map(s => s.toLowerCase()).includes(status);

    const expiryMatch = (() => {
      if (filters.expiry.length === 0) return true;
      if (!expiryDate || isNaN(expiryDate)) return false;

      const today = new Date();
      const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      return filters.expiry.some(days => diffDays >= 0 && diffDays <= parseInt(days));
    })();

    return handledMatch && statusMatch && expiryMatch;
  });

  const tableWrapper = document.querySelector('.table-wrapper');
  const dashboardSectionEl = document.getElementById('dashboardSection');
  const formContainer = document.getElementById('formContainer');

  if (tableWrapper) tableWrapper.style.display = 'block';
  if (dashboardSectionEl) dashboardSectionEl.style.display = 'none';
  if (formContainer) formContainer.style.display = 'none';

  populateTable(filtered);
}


document.addEventListener('DOMContentLoaded', renderFilterPanel);
