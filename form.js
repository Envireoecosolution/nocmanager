async function renderAppForm(mode, client = {}) {
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

  // Set heading and button label
  document.getElementById('formHeading').textContent = isUpdate ? 'Update Application' : 'Add New Application';
  document.getElementById('formSubmitBtn').textContent = isUpdate ? 'Update' : 'Submit';

  // Populate form fields
  document.getElementById('appno').value = client.appno || '';
  document.getElementById('appno').disabled = isUpdate;
  document.getElementById('clientname').value = client.clientname || '';
  document.getElementById('status').value = client.status || '';
  document.getElementById('apptype').value = client.apptype || '';
  document.getElementById('loginid').value = client.loginid || '';
  document.getElementById('password').value = client.password || '';
  document.getElementById('handledby').value = client.handledby || '';
  document.getElementById('nocdate').value = client.nocdate || '';
  document.getElementById('nocexpirydate').value = client.nocexpirydate || '';
  document.getElementById('appstatus').value = client.appstatus || '';
  document.getElementById('remarks').value = client.remarks || '';

  // Fix: Prevent multiple submit event listeners
  const oldForm = document.getElementById('clientForm');
  const newForm = oldForm.cloneNode(true);
  oldForm.parentNode.replaceChild(newForm, oldForm);

  newForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formValues = Object.fromEntries(formData.entries());

    formValues.nocdate = formValues.nocdate.trim() === "" ? null : formValues.nocdate;
    formValues.nocexpirydate = formValues.nocexpirydate.trim() === "" ? null : formValues.nocexpirydate;

    if (isUpdate) formValues.appno = client.appno;

    if (isUpdate) {
      const { error } = await supabase
        .from('Appdata')
        .update(formValues)
        .eq('appno', formValues.appno);

      if (error) {
        alert("Error updating application: " + error.message);
        console.error(error);
      } else {
        alert("Application updated successfully!");
        container.style.display = 'none';
        if (filterPanel) filterPanel.style.display = 'block';
        getData();
      }
    } else {
      const { data: existing, error: checkError } = await supabase
        .from('Appdata')
        .select('appno')
        .eq('appno', formValues.appno);

      if (checkError) {
        alert('Error checking existing application number.');
        console.error(checkError);
        return;
      }

      if (existing && existing.length > 0) {
        alert('Application number already exists!!');
        return;
      }

      const { error } = await supabase.from('Appdata').insert([formValues]);

      if (error) {
        alert("Error saving Application: " + error.message);
        console.error(error);
      } else {
        alert("Application added successfully!");
        e.target.reset();
        container.style.display = 'none';
        if (filterPanel) filterPanel.style.display = 'block';
        getData();
      }
    }
  });
}


// Utility Functions
function addApp() {
  renderAppForm('add');
}

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  const addAppBtn = document.getElementById('addAppBtn');
  if (addAppBtn) {
    addAppBtn.addEventListener('click', function (e) {
      e.preventDefault();
      addApp();
    });
  }
});

// Export for global access
window.addApp = addApp;
window.updateApp({ appno });

