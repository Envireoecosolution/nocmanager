// ✅ Fixed dashboard.js with case-insensitive first-letter match for 'handledBy'

document.addEventListener('DOMContentLoaded', async () => {
  const { data, error } = await supabase.from('Appdata').select('*');
  if (error) return console.error('Error loading dashboard data:', error);

  const total = data.length;
  const closed = data.filter(d => d.status?.toLowerCase() === 'closed').length;
  const working = data.filter(d => d.status?.toLowerCase() === 'working').length;

  const today = new Date();
  const next90 = new Date(today);
  next90.setDate(today.getDate() + 90);

  const onHold = data.filter(d => d.status?.toLowerCase() === 'on hold').length;


  animateCount('totalApps', total);
  animateCount('closedApps', closed);
  animateCount('inProgressApps', working);
  animateCount('onHoldApps', onHold);

  // ✅ Only include applications where status is "working"
const workingData = data.filter(d => d.status?.toLowerCase() === 'working');

const associateCounts = {
  Akshay: 0,
  Garima: 0,
  Anchal: 0,
  Prashant: 0
};

workingData.forEach(app => {
  const rawName = app.handledby || app.handledBy || "";
  if (!rawName) return;
  const name = rawName.trim().toLowerCase();

  if (name.includes("akshay")) {
    associateCounts.Akshay++;
  } else if (name.includes("garima")) {
    associateCounts.Garima++;
  } else if (name.includes("prashant")) {
    associateCounts.Prashant++;
  } else if (name.includes("anchal")) {
    associateCounts.Anchal++;
  }
});

  renderAssociatePieChart(associateCounts);
  renderMonthlyBarChart(data);
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

function renderAssociatePieChart(data) {
  const ctx = document.getElementById('associatePieChart');

  if (!ctx) {
    console.error('Canvas for associatePieChart not found');
    return;
  }

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Anchal', 'Garima', 'Prashant', 'Akshay'],
      datasets: [{
        data: [
          data['Anchal'],
          data['Garima'],
          data['Prashant'],
          data['Akshay'],
        ],
        backgroundColor: ['#006400', '#ff1493', '#0000cd', '#ffd700']
      }]
    },

    options: {
  plugins: {
    legend: {
      display: false   // ⛔ hide default legend
    },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.label}: ${ctx.parsed}`
      }
    }
  }
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

function formatDateToDDMMYYYY(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
}
