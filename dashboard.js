// ✅ Fixed dashboard.js with case-insensitive first-letter match for 'handledBy'

// const supabase = window.supabaseClient;


document.addEventListener('DOMContentLoaded', async () => {
  const { data, error } = await supabase.from('Appdata').select('*');
  if (!data) {
    console.error('No data returned from Appdata:', error);
    return;
  }
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
  Himanshi: 0
};

workingData.forEach(app => {
  const rawName = app.handledby || app.handledBy || "";
  if (!rawName) return;
  const name = rawName.trim().toLowerCase();

  if (name.includes("akshay")) {
    associateCounts.Akshay++;
  } else if (name.includes("garima")) {
    associateCounts.Garima++;
  } else if (name.includes("himanshi")) {
    associateCounts.Himanshi++;
  } 
  // else if (name.includes("anchal")) {
  //   associateCounts.Anchal++;
  // }
});

  renderAssociatePieChart(associateCounts);
  renderMonthlyBarChart(data);
});

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`Element with id "${id}" not found.`);
    return;
  }

  let count = 0;
  const step = Math.ceil(target / 50);
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
      labels: ['Garima', 'Himanshi', 'Akshay'],
      datasets: [{
        data: [
          data['Garima'],
          data['Himanshi'],
          data['Akshay'],
        ],
        backgroundColor: ['#006acdff', '#fd5113ff', '#00ff15ff', '#e9c407ff' ]
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
