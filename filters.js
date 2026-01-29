
// const supabase = window.supabaseClient;


const filters = {
  status: [],
  handledBy: [],
  expiry: [],
  appstatus: [] // ✅ NEW FILTER
};


function renderFilterPanel() {
  const panel = document.getElementById('filterPanel');
  if (!panel) return;

  panel.innerHTML = `

  <button id="downloadall">Download All<br>Applications Data</button><br><br>
  <h1>Filters✨</h1><br>
  <h3><u>Status:</u></h3>
    ${renderCheckboxGroup('status', statusOptions)}

    <br><h3><u>Handled By:</u></h3>
    ${renderCheckboxGroup('handledBy', handledByOptions)}

    <br> <h3><u>Expiry:</u></h3>
    ${renderCheckboxGroup('expiry', expiryOptions, true)}

    <br><h3><u>Application Status:</u></h3> <!-- ✅ NEW SECTION -->
    ${renderCheckboxGroup('appstatus', appStatusOptions)}

  `;

  panel.innerHTML = `
  <button id="downloadall">Download All<br>Applications Data</button><br><br>
  <h1>Filters✨</h1><br>
  <h3><u>Status:</u></h3>
    ${renderCheckboxGroup('status', statusOptions)}

    <br><h3><u>Handled By:</u></h3>
    ${renderCheckboxGroup('handledBy', handledByOptions)}

    <br> <h3><u>Expiry:</u></h3>
    ${renderCheckboxGroup('expiry', expiryOptions, true)}
`;

// attach listener immediately after rendering
document.getElementById("downloadall")
  ?.addEventListener("click", exportAllApplicationsToExcel);


  // Attach listeners after injecting
  document.querySelectorAll('.filter-checkbox').forEach(cb => {
    cb.addEventListener('change', handleFilterChange);
  });
}


function renderCheckboxGroup(name, options, numeric = false) {
  return options.map(option => {
    const className = getCheckboxClass(name, option);

    return `
      <div>
        <label class="${className}">
          <input type="checkbox" class="filter-checkbox" data-type="${name}" value="${option}">
          ${numeric ? `Next ${option} Days` : option}
        </label>
      </div>
    `;
  }).join('');
}


function getCheckboxClass(group, value) {
  if (group === 'status') {
    switch (value.toLowerCase()) {
      case 'merged': return 'status-merged';
      case 'on hold': return 'status-onhold';
      case 'closed': return 'status-closed';
      case 'working': return 'status-working';
    }
  }

    if (group === 'handledBy') {
    switch (value.toLowerCase()) {
      case 'sachit aggarwal': return 'handled-sachit';
      case 'tina jain aggarwal': return 'handled-tina';
      case 'rajesh makker': return 'handled-rajesh';
      case 'garima singh': return 'handled-garima';
      case 'himanshi awasthi': return 'handled-himanshi';
      case 'akshay': return 'handled-akshay';
    }
  }

  return '';
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
  // Ensure global filters object exists
  if (typeof filters === 'undefined') {
    console.warn("⚠️ 'filters' is not defined.");
    return;
  }

  const isAnyFilterActive =
    filters.status.length > 0 ||
    filters.handledBy.length > 0 ||
    filters.expiry.length > 0;

  const dashboardSection = document.getElementById("dashboardSection");
  const tableWrapperEl = document.querySelector(".table-wrapper");

  if (!isAnyFilterActive) {
    if (dashboardSection) dashboardSection.classList.remove("hidden");
    if (tableWrapperEl) tableWrapperEl.style.display = "none";
    return; // ✅ Exit early — no filters active
  }

  const filtered = allClients.filter(client => {
    const handled = (client.handledby || "").trim().toLowerCase();
    const status = (client.status || "").trim().toLowerCase();
    const expiryDate = client.nocexpirydate ? new Date(client.nocexpirydate) : null;

    const handledMatch =
      filters.handledBy.length === 0 ||
      filters.handledBy.some(h => handled === h.toLowerCase());

    const statusMatch =
      filters.status.length === 0 ||
      filters.status.some(s => status === s.toLowerCase());

    const expiryMatch = (() => {
      if (filters.expiry.length === 0) return true;
      if (!expiryDate || isNaN(expiryDate)) return false;

      const today = new Date();
      const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

      return filters.expiry.some(days => {
        const range = parseInt(days);
        if (range === 90) return diffDays >= 0 && diffDays <= 90;
        if (range === 15) return diffDays >= 0 && diffDays <= 15;
        return false;
      });
    })();

    return handledMatch && statusMatch && expiryMatch;
  });

  const tableWrapper = document.querySelector('.table-wrapper');
  const formContainer = document.getElementById('formContainer');

  if (tableWrapper) tableWrapper.style.display = 'block';
  if (dashboardSection) dashboardSection.style.display = 'none';
  if (formContainer) formContainer.style.display = 'none';

  populateTable(filtered);
}


document.querySelectorAll('#filterPanel input[type="checkbox"]').forEach(checkbox => {
  checkbox.addEventListener('change', function (e) {
    const { name, value, checked } = e.target;

    if (!filters[name]) filters[name] = [];

    if (checked) {
      if (!filters[name].includes(value)) filters[name].push(value);
    } else {
      filters[name] = filters[name].filter(v => v !== value);
    }

    applyFilters();
  });
});


function exportAllApplicationsToExcel() {
  if (!allClients || allClients.length === 0) {
    alert("No application data available to export.");
    return;
  }
  const worksheet = XLSX.utils.json_to_sheet(allClients);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "All Applications");
  XLSX.writeFile(workbook, `All_Applications_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

