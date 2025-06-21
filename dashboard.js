
// dashboard.js - requires Chart.js and your existing Supabase client

document.addEventListener('DOMContentLoaded', async () => {
  const { data, error } = await supabase.from('Appdata').select('*');
  if (error) return console.error('Error loading dashboard data:', error);

  const total = data.length;
  const closed = data.filter(d => d.status?.toLowerCase() === 'closed').length;
  const working = data.filter(d => d.status?.toLowerCase() === 'working').length;
  const today = new Date();
  const next90 = new Date(today);
  next90.setDate(today.getDate() + 90);
  const expiring = data.filter(d => {
    const exp = new Date(d.nocexpirydate);
    return exp >= today && exp <= next90;
  }).length;

  animateCount('totalApps', total);
  animateCount('closedApps', closed);
  animateCount('inProgressApps', working);
  animateCount('expiringApps', expiring);

  renderStatusPieChart(closed, working, total - closed - working);
  renderMonthlyBarChart(data);
  populateExpiringTable(data);
});

function animateCount(id, target) {
  let count = 0;
  const step = Math.ceil(target / 50);
  const el = document.getElementById(id);
  const interval = setInterval(() => {
    count += step;
    if (count >= target) {
      el.textContent = target;
      clearInterval(interval);
    } else {
      el.textContent = count;
    }
  }, 30);
}

// Removed incomplete Chart initialization. Use renderStatusPieChart or other chart functions as needed.

function renderStatusPieChart(closed, working, others) {
  new Chart(document.getElementById('statusPieChart'), {
    type: 'pie',
    data: {
      labels: ['Closed', 'Working', 'Others'],
      datasets: [{
        data: [closed, working, others],
        backgroundColor: ['#28a745', '#ffc107', '#dc3545']
      }]
    }
  });
}

function renderMonthlyBarChart(data) {
  const months = Array(12).fill(0);
  data.forEach(d => {
    if (d.nocdate) {
      const month = new Date(d.nocdate).getMonth();
      months[month] += 1;
    }
  });
  new Chart(document.getElementById('monthlyBarChart'), {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Applications',
        data: months,
        backgroundColor: '#007bff'
      }]
    }
  });
}

function populateExpiringTable(data) {
  const tbody = document.getElementById('expiringTableBody');
  const today = new Date();
  const next90 = new Date();
  next90.setDate(today.getDate() + 90);

  const expiring = data.filter(d => {
    const exp = new Date(d.nocexpirydate);
    return exp >= today && exp <= next90;
  });

  tbody.innerHTML = '';
  expiring.forEach(d => {
    const tr = document.createElement('tr');
    const formattedDate = formatDateToDDMMYYYY(d.nocexpirydate);
    tr.innerHTML = `
      <td>${d.clientname || ''}</td>
      <td>${formattedDate}</td>
      <td>${d.status || ''}</td>
    `;
    tbody.appendChild(tr);
  });
}

function formatDateToDDMMYYYY(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
}
