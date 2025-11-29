// Supabase configuration via CDN
const supabaseUrl = 'https://uewuhdigjdrbfcuasibe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVld3VoZGlnamRyYmZjdWFzaWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NTEzMTAsImV4cCI6MjA2NTEyNzMxMH0.yTTRgpMlumq5gyblYxfqfIvJDsmn0THY6rj1pflUQ-k';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let allClients = [];

  // Map associate email to name
  const associateMap = {
    'akshay1.envireoeco@gmail.com': 'Akshay',
    'anchal04aggarwal@gmail.com': 'Anchal Aggarwal',
    'itsgarima1796@gmail.com': 'Garima Singh',
    'himanshi.envireoeco@gmail.com': 'Himanshi Awasthi'
  };


  (async () => {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user || !user.email) {
    console.warn("⚠️ No user logged in.");
    return;
  }

  const { data: profile, error: roleError } = await supabase
    .from("userprofiles")
    .select("role")
    .eq("email", user.email)
    .maybeSingle();

  if (roleError || !profile) {
    console.warn("⚠️ Role not found for user:", user.email);
    return;
  }

  const role = profile.role;
  const email = user.email;

  if (role && email) {
    localStorage.setItem('userRole', role);
    localStorage.setItem('userEmail', email);
    applyRoleBasedUI(role, email);
  }

  console.log("👤 Role:", role);
})();

function applyRoleBasedUI(role, email) {
  if (role === 'owner') {
    const paymentNavItem = document.getElementById('paymentNavItem');
    const paymentsSection = document.getElementById('paymentsSection');

    if (paymentNavItem) paymentNavItem.style.display = 'inline-block';
    if (paymentsSection) paymentsSection.style.display = 'block';
    renderAllPayments();
  }

  else if (role === 'admin') {
    const paymentNav = document.getElementById('paymentNavItem');
    if (paymentNav) paymentNav.style.display = 'none';
  }

  else if (role === 'associate') {

  const name = associateMap[email] || email;
  console.log("Associate Name:", name);
  window.loggedInAssociateName = name;

  const selectorsToHide = [
    "#paymentNavItem",
    "#searchBar",
    "#searchButton",
    "#home",
    "#filterPanel",
    "#dashboardSection",
    ".stats-grid",
    ".charts-grid"
  ];

  // 🔥 Hide these immediately on login
  selectorsToHide.forEach(selector => {
    const el = document.querySelector(selector);
    if (el) el.style.display = "none";
    else console.warn(`⚠️ Missing element: ${selector}`);
  });

  // ✅ Show associate home
  const associateHome = document.getElementById("associateHome");
  if (associateHome) associateHome.style.display = "block";

  // 🔁 Set up company name click to do the same hide/show
  const companyNameEl = document.getElementById("companyName");
  if (companyNameEl) {
    companyNameEl.addEventListener("click", () => {
      selectorsToHide.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) el.style.display = "none";
      });

      if (associateHome) associateHome.style.display = "block";

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
}

document.getElementById("logoutLink").addEventListener("click", async () => {
  await supabase.auth.signOut();
  showNotification("You have been logged out.");
  location.reload();
});

async function getData() {
  const { data, error } = await supabase.from('Appdata').select('*');
  if (error) return console.error("Error fetching data:", error);
  allClients = data;
  populateTable(data);
  renderFilterPanel();

  const total = data.length;
  const closed = data.filter(c => c.status?.toLowerCase() === 'closed').length;
  const inProgress = data.filter(c => c.status?.toLowerCase() === 'working').length;
  const onHold = data.filter(c => c.status?.toLowerCase() === 'on hold').length;

  ["totalApps", "closedApps", "inProgressApps", "onHoldApps"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = 0;
  });

  setTimeout(() => {
    animateCount("totalApps", total);
    animateCount("closedApps", closed);
    animateCount("inProgressApps", inProgress);
    animateCount("onHoldApps", onHold);
  }, 2);
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
  }, 25);
}

function goHome() {
  // Ensure main app is visible
  const mainContent = document.querySelector(".filter-and-main");
  if (mainContent) mainContent.style.display = "flex";

  const paymentSection = document.getElementById('paymentSection');
  if (paymentSection) paymentSection.style.display = 'none';

  // Hide login/auth form if it's open
  const authBox = document.getElementById("authContainer");
  if (authBox) authBox.style.display = "none";
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



  let isLogin = true;
  const authContainerEl = document.getElementById("authContainer");
  const filterMainEl = document.querySelector(".filter-and-main");
  const authFormEl = document.getElementById("authForm");
  const authTitleEl = document.getElementById("authTitle");
  const toggleLinkEl = document.getElementById("toggleLink");
  const authBtnEl = authFormEl.querySelector("button");

  function syncAuthUI() {
    authTitleEl.textContent = isLogin ? "Login" : "Sign Up";
    authBtnEl.textContent = isLogin ? "Log In" : "Sign Up";
    toggleLinkEl.textContent = isLogin
      ? "New user? Sign up here"
      : "Already have an account? Login here";
  }

  function showAuthForm() {
    authContainerEl.style.display = "flex";
    filterMainEl.style.display = "none";
    const center = document.querySelector(".navbar-center");
  const right = document.querySelector(".navbar-right");
  if (center) center.style.display = "none";
  if (right) right.style.display = "none";
    syncAuthUI();
  }

  function closeAuthBox() {
  const authContainerEl = document.getElementById("authContainer");
  const filterMainEl = document.querySelector(".filter-and-main");

  if (authContainerEl) authContainerEl.style.display = "none";
  if (filterMainEl) filterMainEl.style.display = "flex"; // not block
  }

    const logout = document.getElementById("logoutLink");
  if (logout) logout.style.display = "inline-block";

  toggleLinkEl.addEventListener("click", () => {
    isLogin = !isLogin;
    syncAuthUI();
  });


  document.getElementById("logoutLink").addEventListener("click", async () => {
  // Hide app, show login
  document.querySelector(".filter-and-main").style.display = "none";
  document.getElementById("logoutLink").style.display = "none";
  document.getElementById("authContainer").style.display = "flex";
  isLogin = true;
  syncAuthUI();
});


authFormEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target.email.value.trim();
  const password = e.target.password.value.trim();

  if (!email || !password) {
    alert("Email and password are required.");
    return;
  }

  if (isLogin) {
    // 🔐 LOGIN section
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Login failed: " + error.message);
      return;
    }

    const { user } = data;

    // ✅ Place this check here
    if (!user.email_confirmed_at) {
      alert("Please verify your email before logging in.");
      return;
    }

    // ✅ Now hide login form and show dashboard
    closeAuthBox();
    location.reload();


  } else {
    // 🆕 SIGNUP section
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      alert("Signup failed: " + signUpError.message);
      return;
    }

    const user = signUpData?.user;

    if (!user || !user.id) {
      alert("Signup succeeded. Please check your mail to verify before logging in.");
      return;
    }

    const { error: profileError } = await supabase.from("userprofiles").insert([
      {
        id: user.id,
        email: user.email,
        role: "associate"
      }
    ]);

    if (profileError) {
      alert("User created. Please check your email to verify before logging in.");
    } else {
      alert("Signup successful! Please check your email to verify before logging in.");
      isLogin = true;
      syncAuthUI(); // switch to login view
    }
  }
});



  async function renderAllPayments() {
  const { data, error } = await supabase
    .from('Payment')
    .select('*');

  if (error) {
    console.error("Error fetching payments:", error);
    return;
  }

  const paymentBody = document.getElementById('paymentBody');
  paymentBody.innerHTML = ''; // Clear old rows

  data.forEach((payment) => {
  const row = document.createElement('tr');
  row.setAttribute('data-id', payment.invoiceno || '');



  row.innerHTML = `
    <td>${payment.pinumber || ''}</td>
    <td>${payment.pidate || ''}</td>
    <td>${payment.clientname || ''}</td>
    <td>${payment.ibt || ''}</td>
    <td>${payment.gst || ''}</td>
    <td>${payment.tds || ''}</td>
    <td>${payment.amount || ''}</td>
    <td>${payment.signingAmt || ''}</td>  
    <td>${payment['1streceived'] || ''}</td>
    <td>${payment.dateofrec || ''}</td>
    <td>${payment.pending || ''}</td>
    <td>${payment.dateofpay || ''}</td>
    <td>
      ${payment.Remarks || ''}
      <br>
      <span class="edit-payment" style="cursor:pointer; color:blue; margin-right:10px;">Edit</span><br><br>
      <span class="delete-payment" style="cursor:pointer; color:red;">Delete</span>
    </td>
  `;

  paymentBody.appendChild(row);
});

}


supabase.auth.getSession().then(async ({ data: { session } }) => {
  const navbarLeft = document.querySelector(".navbar-left");
  const navbarCenter = document.querySelector(".navbar-center");
  const navbarRight = document.querySelector(".navbar-right");
  const companyName = document.getElementById("companyName");

  if (session?.user?.email_confirmed_at) {
    closeAuthBox();
    // checkUserRole();

    // ✅ Show all parts
    navbarLeft.style.display = "flex";
    navbarCenter.style.display = "flex";
    navbarRight.style.display = "flex";

    // ✅ Make company name clickable
    companyName.style.pointerEvents = "auto";
    companyName.style.cursor = "pointer";

    document.getElementById("logoutLink").style.display = "inline-block";
  } else {
    showAuthForm();

    // ✅ Show only logo + name
    navbarLeft.style.display = "flex";
    navbarCenter.style.display = "none";
    navbarRight.style.display = "none";

    // ❌ Make company name unclickable and gray
    companyName.style.pointerEvents = "none";
    companyName.style.cursor = "default";

    document.getElementById("logoutLink").style.display = "none";
  }
});



async function fetchUserRole() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("User not found or not logged in");
    return;
  }

  const { email } = user;

  // Now fetch role from UserProfiles table
  const { data, error } = await client
    .from('UserProfiles')
    .select('role')
    .eq('email', email)
    .single();

  if (error) {
    console.error("Error fetching role:", error);
    return;
  }

  const role = data.role;

  // ✅ Move these lines inside the function, using the actual `role` and `email`
  localStorage.setItem('userRole', role);
  localStorage.setItem('userEmail', email);

  console.log("Logged-in role:", role);
}


// async function renderAllApplications() {
//   const { data, error } = await supabase
//     .from('Appdata')
//     .select('*');

//   if (error) {
//     console.error("Error fetching all applications:", error);
//     return;
//   }

//   populateTable(data); // This should be function to render rows
// }

async function renderApplicationsByHandledBy(name) {
  const { data, error } = await client
    .from('Appdata')
    .select('*')
    .ilike('handledBy', `%${name}%`); // Case-insensitive, partial match

  if (error) {
    console.error(`Error fetching applications for ${name}:`, error);
    return;
  }

  populateTable(data);
}






// only for associates

async function loadAssociateApplications(associateName) {
  try {
    // Fetch data from Supabase where handledby = associateName and status = 'Working'
    const { data, error } = await supabase
      .from('Appdata')
      .select('*')
      .eq('handledby', associateName)
      .eq('status', 'Working');

    if (error) {
      console.error("❌ Error fetching associate applications:", error.message);
      return;
    }

    console.log(`📦 Fetched ${data.length} application(s) for ${associateName}`);
    renderAssociateTable(data);
  } catch (err) {
    console.error("❌ Unexpected error:", err);
  }
}


function renderAssociateTable(applications) {
  const tableWrapper = document.querySelector('.table-wrapper');
  const tbody = document.getElementById('clientTable');

  if (!tableWrapper || !tbody) {
    console.error("❌ Missing table structure in DOM");
    return;
  }

  // Clear previous data
  tbody.innerHTML = "";

  if (applications.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11">No applications found.</td></tr>`;
    tableWrapper.style.display = "block";
    return;
  }

  // Populate filtered data
  applications.forEach(app => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${app.appno || ''}</td>
      <td>${app.clientname || ''}</td>
      <td>${app.status || ''}</td>
      <td>${app.apptype || ''}</td>
      <td>${app.loginid || ''}</td>
      <td>${app.password || ''}</td>
      <td>${app.handledby || ''}</td>
      <td>${app.nocdate || ''}</td>
      <td>${app.nocexpirydate || ''}</td>
      <td>${app.appstatus || ''}</td>
      <td>${app.remarks || ''}
  <br>
  <span class="edit-icon" style="cursor:pointer; color:#1a73e8;" title="Edit" data-appno="${app.appno}"> Edit </span>
</td>

    `;
    tbody.appendChild(row);
  });

  // Show table
  tableWrapper.style.display = "block";
}


window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const btn = document.getElementById('showApplicationsBtn');
    if (btn) {
      btn.classList.add('shake-xy');
      
      // Optional: keep shaking every 4 seconds
      setInterval(() => {
        btn.classList.remove('shake-xy');
        void btn.offsetWidth; // reflow to restart animation
        btn.classList.add('shake-xy');
      }, 4000);
    }
  }, 2000);
});




document.getElementById('showApplicationsBtn')?.addEventListener('click', () => {
  if (window.loggedInAssociateName) {
    loadAssociateApplications(window.loggedInAssociateName);
  } else {
    alert("Associate name not found.");
  }



   // Add a fade-out effect to associateHome
  const associateHomeEl = document.getElementById("associateHome");
  if (associateHomeEl) {
    associateHomeEl.classList.add("fade-out");
    setTimeout(() => {
      associateHomeEl.style.display = "none";
      associateHomeEl.classList.remove("fade-out");
    }, 300); // match the fade-out duration
  }

  

  // Hide everything
  const elementsToHide = [
    "#associateHome",
    "#filterPanel",
    "#dashboardSection",
    ".stats-grid",
    ".charts-grid",
    ".expiring-table",
    "#searchSection",
    "#formContainer",
    "#applicationSection"
  ];

  elementsToHide.forEach(selector => {
    const el = document.querySelector(selector);
    if (el) el.style.display = "none";
  });
});





  // Attach click handler to all edit icons
  document.querySelectorAll('.edit-icon').forEach(icon => {
    icon.addEventListener('click', e => {
      const appno = e.target.dataset.appno;
      if (appno) updateApp({ appno });
    });
  });


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
        ${showPen ? `<br><span class="edit-icon" style="cursor:pointer; color:#1a73e8;" title="Edit" data-appno="${client.appno}"> Edit </span>` : ''}
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


document.addEventListener('DOMContentLoaded', getData);
document.getElementById('companyName').addEventListener('click', goHome);

window.updateApp = updateApp;