// Supabase configuration via CDN
const supabaseUrl = 'https://uewuhdigjdrbfcuasibe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVld3VoZGlnamRyYmZjdWFzaWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NTEzMTAsImV4cCI6MjA2NTEyNzMxMH0.yTTRgpMlumq5gyblYxfqfIvJDsmn0THY6rj1pflUQ-k';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// ========== Utility Functions ==========

// Format YYYY-MM-DD to DD-MM-YYYY
function formatDateToDDMMYYYY(dateString) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
}

// Format expiry display with days remaining
function formatDaysRemaining(nocexpirydate) {
  const formattedDate = formatDateToDDMMYYYY(nocexpirydate);
  if (!nocexpirydate) return "";

  const expiry = new Date(nocexpirydate);
  const today = new Date();
  const timeDiff = expiry - today;
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  if (daysRemaining > 90 || daysRemaining < 0) return formattedDate;

  const color = daysRemaining <= 15 ? 'red' : 'inherit';
  const suffix = `<br><span style="color:${color};">(${daysRemaining} days left)</span>`;

  return formattedDate + suffix;
}

// Show/hide download button
function toggleExcelButton(show) {
  const btn = document.getElementById('excelDownloadBtn');
  if (btn) btn.style.display = show ? 'inline-block' : 'none';
}

// Render a single row of client data
function renderTableRow(client, showPen = false) {
  const formattedNocDate = formatDateToDDMMYYYY(client.nocdate);
  const expiryDisplay = formatDaysRemaining(client.nocexpirydate);

  return `
    <tr>
      <td>${client.appno || ''}</td>
      <td>${client.clientname || ''}</td>
      <td>${client.status || ''}</td>
      <td>${client.apptype || ''}</td>
      <td>${client.loginid || ''}</td>
      <td>${client.password || ''}</td>
      <td>${client.handledby || ''}</td>
      <td>${formattedNocDate || ''}</td>
      <td>${expiryDisplay || ''}</td>
      <td>${client.appstatus || ''}</td>
      <td>${client.remarks || ''}
      ${showPen ? `<span class="edit-icon" style="cursor:pointer;" title="Edit" data-appno="${client.appno}"> ✏️</span>` : ''}
      </td>
    </tr>
  `;
}

// Populate table from data array
function populateTable(data) {
  const tableBody = document.getElementById('clientTable') || document.getElementById('table-body');
  if (!tableBody) return;
  tableBody.innerHTML = '';

  data.forEach(client => {
    const showPen = client.status?.toLowerCase() === 'working';
    tableBody.innerHTML += renderTableRow(client, showPen);
  });

  document.querySelectorAll('.edit-icon').forEach(icon => {
    icon.addEventListener('click', (e) => {
      const appno = e.target.getAttribute('data-appno');
      addApp(appno);
    });
  });

  toggleExcelButton(true); // Show button when table is populated
}

// ========== Main Functional Code ==========

async function getData() {
  const { data, error } = await supabase.from('Appdata').select('*');
  if (error) return console.error("Error fetching data:", error);
  populateTable(data);
}

function searchClients() {

  // Hide form and table when searching
  document.getElementById('formContainer').style.display = 'none';

// Hide dashboard when any navbar item except companyName is clicked
  const dashboard = document.getElementById("dashboardSection");
  if (dashboard) dashboard.classList.add("hidden");
  const statsGrid = document.querySelector('.stats-grid');
  const chartsGrid = document.querySelector('.charts-grid');
  const expiringTable = document.querySelector('.expiring-table');
  if (statsGrid) statsGrid.style.display = 'none';
  if (chartsGrid) chartsGrid.style.display = 'none';
  if (expiringTable) expiringTable.style.display = 'none';

  const query = document.getElementById('searchBar')?.value.trim().toLowerCase() || '';
  if (!query) return getData();

  supabase.from('Appdata').select('*').then(({ data, error }) => {
    if (error) return console.error('Search Error:', error);

    const filtered = data.filter(client =>
      (client.appno?.toString().toLowerCase().includes(query)) ||
      (client.clientname?.toLowerCase().includes(query))
    );

    populateTable(filtered);
    document.querySelector('.table-wrapper').style.display = filtered.length ? 'block' : 'none';
    toggleExcelButton(filtered.length > 0);
    if (!filtered.length) alert("No matching records found.");
  });
}

function filterOngoing() {
  document.getElementById('formContainer').style.display = 'none';

  supabase.from('Appdata').select('*').eq('status', 'Working').then(({ data, error }) => {
    if (error) return console.error('Error fetching ongoing NOCs:', error);

    if (!data.length) {
      alert('No ongoing NOCs found.');
      document.querySelector('.table-wrapper').style.display = 'none';
      toggleExcelButton(false);
      return;
    }

    populateTable(data);
    document.querySelector('.table-wrapper').style.display = 'block';
  });
}
window.filterOngoing = filterOngoing;

function filterExpiring() {
  document.getElementById('formContainer').style.display = 'none';

  const today = new Date();
  const ninetyDaysLater = new Date();
  ninetyDaysLater.setDate(today.getDate() + 90);

  supabase.from('Appdata').select('*').then(({ data, error }) => {
    if (error) return console.error('Error fetching data:', error);

    const filtered = data.filter(client => {
      const expiryDate = new Date(client.nocexpirydate);
      return expiryDate >= today && expiryDate <= ninetyDaysLater;
    });

    if (!filtered.length) {
      alert("No NOCs found expiring in the next 90 days.");
      document.querySelector('.table-wrapper').style.display = 'none';
      toggleExcelButton(false);
      return;
    }

    populateTable(filtered);
    document.querySelector('.table-wrapper').style.display = 'block';
  });
}
window.filterExpiring = filterExpiring;

// Hide dashboard when any navbar item except companyName is clicked
window.addEventListener('DOMContentLoaded', () => {
  ['filterOngoing', 'filterExpiring', 'addApp', 'showLoginForm'].forEach(fnName => {
    const originalFn = window[fnName];
    if (typeof originalFn === 'function') {
      window[fnName] = function (...args) {
        const dashboard = document.getElementById("dashboardSection");
        if (dashboard) dashboard.classList.add("hidden");
        originalFn(...args); // Call the original function
      };
    }
  });
});


// Initialize the dashboard on page load
document.querySelectorAll('.navbar *').forEach(elem => {
  elem.addEventListener('click', () => {
    const statsGrid = document.querySelector('.stats-grid');
    const chartsGrid = document.querySelector('.charts-grid');
    const expiringTable = document.querySelector('.expiring-table');
    if (statsGrid) statsGrid.style.display = 'grid';
    if (chartsGrid) chartsGrid.style.display = 'flex';
    if (expiringTable) expiringTable.style.display = 'block';
  });
});


// Search triggers
document.getElementById('searchButton')?.addEventListener('click', searchClients);
document.getElementById('searchBar')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') searchClients();
});

// Water quote + button setup
document.addEventListener('DOMContentLoaded', () => {
  

  const quoteContainer = document.getElementById('quoteButtonContainer');
  const quoteDiv = document.getElementById('welcomeNote');

  if (quoteDiv) {
    quoteDiv.textContent = `"${quotes[new Date().getDate() % quotes.length]}"`;
  }

  const existingBtn = document.getElementById('excelDownloadBtn');
  if (!quoteContainer || existingBtn) return;

  const btn = document.createElement('button');
  btn.id = 'excelDownloadBtn';
  btn.textContent = 'Download as Excel';
  btn.style.cssText = `
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s ease;
    display: none;
  `;
  btn.onmouseover = () => btn.style.backgroundColor = "#0056b3";
  btn.onmouseout = () => btn.style.backgroundColor = "#007bff";

  btn.onclick = function () {
    const table = document.querySelector('.table-wrapper table');
    if (!table) return alert("No table found!");
    const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
    XLSX.writeFile(wb, 'noc_data.xlsx');
  };

  quoteContainer.appendChild(btn);
  toggleExcelButton(false); // Initially hidden
});

// Hide form & table when company name is clicked (like reset) & display dashboard
document.getElementById('companyName').addEventListener('click', () => {
  const formContainer = document.getElementById('formContainer');
  if (formContainer) formContainer.style.display = 'none';

  const tableWrapper = document.querySelector('.table-wrapper');
  if (tableWrapper) tableWrapper.style.display = 'none';

  const searchInput = document.querySelector('input[type="search"], input[name="search"]');
  if (searchInput) searchInput.value = '';

  toggleExcelButton(false); // Hide download button


   const dashboard = document.getElementById("dashboardSection");
  if (dashboard) dashboard.classList.remove("hidden");

  // Show dashboard sections
    const statsGrid = document.querySelector('.stats-grid');
    const chartsGrid = document.querySelector('.charts-grid');
    const expiringTable = document.querySelector('.expiring-table');
    if (statsGrid) statsGrid.style.display = 'flex';
    if (chartsGrid) chartsGrid.style.display = 'flex';
    if (expiringTable) expiringTable.style.display = 'block';
});




function goHome() {
  // Hide form and table
  const formContainer = document.getElementById('formContainer');
  if (formContainer) formContainer.style.display = 'none';

  const tableWrapper = document.querySelector('.table-wrapper');
  if (tableWrapper) tableWrapper.style.display = 'none';

  // Hide Excel download button
  toggleExcelButton(false);

  // Show dashboard container
  const dashboard = document.getElementById("dashboardSection");
  if (dashboard) dashboard.classList.remove("hidden");

  // Reset individual dashboard parts to their proper layout
  const statsGrid = document.querySelector('.stats-grid');
  const chartsGrid = document.querySelector('.charts-grid');
  const expiringTable = document.querySelector('.expiring-table');

  if (statsGrid) statsGrid.style.removeProperty('display');     // use flex to match CSS
  if (chartsGrid) chartsGrid.style.removeProperty('display');
  if (expiringTable) expiringTable.style.removeProperty('display');
}
