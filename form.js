
// ✅ Define dropdown options once (moved out of filters.js)
const statusOptions = ["Merged", "On Hold", "Closed", "Working", "Recommended"];
const appTypeOptions = ["New", "Renewal"];
const handlerOptions = [
  "Sachit Aggarwal", "Tina Jain Aggarwal", "Rajesh Makker",
   "Garima Singh", "Himanshi Awasthi", "Akshay"
];
const appStatusOptions = [
  "Application Submitted fees not paid",
  "Application Submitted fees paid",
  "Approval Pending for payment of Tariff",
  "Marked to Applicant to upload signed Application",
  "Permission Certificate Issued",
  "Observation raised by Authority",
  "Observation raised by CTO to Applicant",
  "Recommended to Authority",
  "Recommended to Technical Committee",
  "Rejected by Authority",
  "Approval pending subject to removal of condition decided by Authority",
  "Reply to Observation Submitted",
  "Return with Approved by Competent Authority",
  "Return with Approve by Competent Authority with Condition",
  "Returned with Observation by Competent Authority for reviewed.",
  "Signed Application Uploaded by Applicant",
  "Under Observation"
];


// ✅ Robust dropdown renderer
function renderDropdown(id, options, selectedValue) {
  const select = document.getElementById(id);
  if (!select) return;

  select.innerHTML = "";
  let defaultLabel = "-- Select --";
  if (id === 'status') defaultLabel = "-- Select Status --";
  if (id === 'apptype') defaultLabel = "-- Select Type --";
  if (id === 'handledby') defaultLabel = "-- Select Handler --";
  if (id === 'appstatus') defaultLabel = "-- Select Application Status --";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = defaultLabel;
  select.appendChild(defaultOption);

  options.forEach(opt => {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
  });

  // Set selected value immediately after options are appended
  select.value = selectedValue || "";
}

// ✅ Main Form Renderer
async function renderAppForm(mode, client = {}) {
  window._debugClient = client; // for console debugging

  const container = document.getElementById('formContainer');
  const tableWrapper = document.querySelector('.table-wrapper');
  if (tableWrapper) tableWrapper.style.display = 'none';

  const dashboard = document.getElementById("dashboardSection");
  if (dashboard) dashboard.classList.add("hidden");

  const filterPanel = document.getElementById("filterPanel");
  if (filterPanel) filterPanel.style.display = 'none';

  container.style.display = 'block';
  container.scrollIntoView({ behavior: 'smooth' });

  const darkForm = document.querySelector('.dark-form');
  if (darkForm) darkForm.style.display = 'block';

  const isUpdate = mode === 'update';

  document.getElementById('formHeading').textContent = isUpdate ? 'Update Application' : 'Add New Application';
  document.getElementById('formSubmitBtn').textContent = isUpdate ? 'Update' : 'Submit';

  const oldForm = document.getElementById('clientForm');
  const newForm = oldForm.cloneNode(true);
  oldForm.parentNode.replaceChild(newForm, oldForm);

  // ✅ Render dropdowns first
  renderDropdown("status", statusOptions, client.status || "");
  renderDropdown("apptype", appTypeOptions, client.apptype || "");
  renderDropdown("handledby", handlerOptions, client.handledby || "");
  renderDropdown("appstatus", appStatusOptions, client.appstatus || "");

  // ✅ Fill other fields
  document.getElementById('appno').value = client.appno || '';
  document.getElementById('appno').disabled = isUpdate;
  document.getElementById('clientname').value = client.clientname || '';
  document.getElementById('loginid').value = client.loginid || '';
  document.getElementById('passsword').value = client.password || '';
  document.getElementById('hepclogin').value = client.hepclogin || '';
  document.getElementById('hepcpassword').value = client.hepcpassword || '';
  document.getElementById('cafno').value = client.cafno || '';
  document.getElementById('nocdate').value = client.nocdate || '';
  document.getElementById('nocexpirydate').value = client.nocexpirydate || '';
  document.getElementById('remarks').value = client.remarks || '';

  newForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formValues = Object.fromEntries(formData.entries());

    formValues.nocdate = formValues.nocdate.trim() === "" ? null : formValues.nocdate;
    formValues.nocexpirydate = formValues.nocexpirydate.trim() === "" ? null : formValues.nocexpirydate;
    if (isUpdate) formValues.appno = client.appno;

    if (isUpdate) {
  const { error } = await supabase.from('Appdata').update(formValues).eq('appno', formValues.appno);
  if (error) {
    alert("Error updating application: " + error.message);
  } else {
  showNotification("Application updated successfully!");
  goHome(); // Go back to homepage
  getData(); // Refresh data
  const role = localStorage.getItem('userRole');
const email = localStorage.getItem('userEmail');
if (role && typeof applyRoleBasedUI === 'function') {
  applyRoleBasedUI(role, email);
}
}

} else {
  // Duplicate check before inserting
  const { data: existingApp, error: checkError } = await supabase
    .from('Appdata')
    .select('appno')
    .eq('appno', formValues.appno)
    .maybeSingle(); // Optional: makes response easier to handle

  if (checkError) {
    alert('Error checking application number: ' + checkError.message);
    return;
  }

  if (existingApp) {
    alert('❌ Application number already exists. Please check Application number and try again.');
    return;
  }

  // Proceed to insert
  const { error } = await supabase.from('Appdata').insert([formValues]);
  if (error) {
    alert("Error saving Application: " + error.message);
  } else {
  showNotification("✅ Application added successfully!");
  e.target.reset();
  goHome(); // Navigate to homepage and reset UI
  getData(); // Refresh data (optional if goHome already calls it)

  // ✅ Reapply role-based UI after data refresh
const role = localStorage.getItem('userRole');
const email = localStorage.getItem('userEmail');
if (role && typeof applyRoleBasedUI === 'function') {
  applyRoleBasedUI(role, email);
}
}

}
  }); // <-- This closes the newForm.addEventListener, not renderAppForm
}

// ✅ Global triggers
function addApp() {
  renderAppForm('add');
}


document.addEventListener('DOMContentLoaded', () => {
  const addAppBtn = document.getElementById('addAppBtn');

  if (addAppBtn) {
    addAppBtn.addEventListener('click', function (e) {
      e.preventDefault();

      const role = localStorage.getItem('userRole'); // 🔐 Get stored role

      // ✅ Hide welcome-container if role is 'associate'
      if (role === 'associate') {
        const welcomeContainer = document.querySelector('.welcome-container');
        if (welcomeContainer) welcomeContainer.style.display = 'none';
      }

      // Proceed with showing the form
      addApp();
    });
  }
});

window.renderAppForm = renderAppForm;

window.statusOptions = statusOptions;
window.handledByOptions = handlerOptions;
window.expiryOptions = ["90"]; 

