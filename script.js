
// Supabase configuration via CDN
const supabaseUrl = 'https://uewuhdigjdrbfcuasibe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVld3VoZGlnamRyYmZjdWFzaWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NTEzMTAsImV4cCI6MjA2NTEyNzMxMH0.yTTRgpMlumq5gyblYxfqfIvJDsmn0THY6rj1pflUQ-k';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let allClients = [];

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

// Define this near the top or before you assign the button click handler
function searchClients() {
  document.getElementById('formContainer').style.display = 'none';

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
    if (!filtered.length) alert("No matching records found.");
  });
}




// Search triggers
document.getElementById('searchButton')?.addEventListener('click', searchClients);
document.getElementById('searchBar')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') searchClients();
});


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

function populateTable(data) {
  const tableBody = document.getElementById('clientTable') || document.getElementById('table-body');
  if (!tableBody) return;
  tableBody.innerHTML = '';
  const showPen = true; // Set to true to show edit icons
      data.forEach(client => {
    tableBody.innerHTML += renderTableRow(client, showPen);
  });

  document.addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('edit-icon')) {
      const appno = e.target.dataset.appno;
      if (appno) updateApp({ appno });
      else alert('Missing app number.');
    }
  });
}

async function updateApp({ appno }) {
  try {
    const { data: record, error } = await supabase
      .from('Appdata')
      .select('*')
      .eq('appno', appno)
      .single();

    if (error || !record) {
      throw new Error('Could not fetch application data.');
    }

    renderAppForm('update', record); // ✅ this will now prefill correctly
  } catch (err) {
    console.error('Error in updateApp:', err.message);
    alert('Failed to load the application for update.');
  }
}


async function getData() {
  const { data, error } = await supabase.from('Appdata').select('*');
  if (error) return console.error("Error fetching data:", error);
  allClients = data;
  populateTable(data);
  renderFilterPanel();

  const total = data.length;
  const closed = data.filter(c => c.status?.toLowerCase() === 'closed').length;
  const inProgress = data.filter(c => c.status?.toLowerCase() === 'working').length;
  const expiringSoon = data.filter(c => {
    const expiry = new Date(c.nocexpirydate);
    const today = new Date();
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysLeft <= 90 && daysLeft >= 0;
  }).length;

  ["totalApps", "closedApps", "inProgressApps", "expiringApps"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = 0;
  });

  setTimeout(() => {
    animateCount("totalApps", total);
    animateCount("closedApps", closed);
    animateCount("inProgressApps", inProgress);
    animateCount("expiringApps", expiringSoon);
  }, 10);
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let count = 0;
  const increment = target / 40;
  const interval = setInterval(() => {
    count += increment;
    if (count >= target) {
      count = target;
      clearInterval(interval);
    }
    el.textContent = Math.floor(count);
  }, 15);
}

function goHome() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (document.activeElement) document.activeElement.blur();
  [
    '#formContainer', '.table-wrapper', '#applicationSection', '.modal', '.toast',
    '#searchSection', '.login-form', '.filter-results', '.main-panel table'
  ].forEach(selector => {
    const el = document.querySelector(selector);
    if (el) el.style.display = 'none';
  });
  const checkboxes = document.querySelectorAll('#filterPanel input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = false);
  if (typeof filters !== 'undefined') {
    filters.status = [];
    filters.handledBy = [];
    filters.expiry = [];
  }
  const dashboard = document.getElementById("dashboardSection");
  if (dashboard) {
    dashboard.classList.remove("hidden");
    dashboard.style.display = 'block';
    dashboard.classList.add("fade-in");
  }
  ['.stats-grid', '.charts-grid', '.expiring-table'].forEach(sel => {
    const el = document.querySelector(sel);
    if (el) el.removeAttribute("style");
  });
  const filterPanel = document.getElementById("filterPanel");
  if (filterPanel) filterPanel.style.display = 'block';
  getData();
}




document.addEventListener('DOMContentLoaded', getData);
document.getElementById('companyName').addEventListener('click', goHome);

window.updateApp = updateApp;




