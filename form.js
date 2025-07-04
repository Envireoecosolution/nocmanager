
// ========== Reusable Application Form ==========

function renderAppForm(mode, client = {}) {
  const container = document.getElementById('formContainer');
  const tableWrapper = document.querySelector('.table-wrapper');
  if (tableWrapper) tableWrapper.style.display = 'none';
    const dashboard = document.getElementById("dashboardSection");
  if (dashboard) dashboard.classList.add("hidden");

    toggleExcelButton(false);

  const isUpdate = mode === 'update';
  const heading = isUpdate ? 'Update Application Details' : 'Add New Application';
  const disabledAttr = isUpdate ? 'disabled' : '';
  const buttonLabel = isUpdate ? 'Update' : 'Submit';

  container.innerHTML = `
    <div class="dark-form">
      <h2>${heading}</h2>
      <form id="clientForm">
        <label>Application No.:
          <input type="text" name="appno" value="${client.appno || ''}" ${disabledAttr} required>
        </label><br>
        <label for="clientname">Client Name:
          <input type="text" id="clientname" name="clientname" autocomplete="on" value="${client.clientname || ''}" required>
        </label><br>
        <label>Status:
        <select name="status" style="width: 100%; background-color: black; color: white; border: 1px solid #444; padding: 8px; border-radius: 4px; font-size: 14px;">
        <option value="" style="background-color: black; color: white;">-- Select Status --</option>
        <option value="Merged" style="background-color: black; color: white;">Merged</option>
        <option value="On Hold" style="background-color: black; color: white;">On Hold</option>
        <option value="Closed" style="background-color: black; color: white;">Closed</option>
        <option value="Working" style="background-color: black; color: white;">Working</option>
        </select>
        </label><br>
        <label>Application Type:
        <select name="apptype" style="width: 100%; background-color: black; color: white; border: 1px solid #444; padding: 8px; border-radius: 4px; font-size: 14px;">
        <option value="" style="background-color: black; color: white;">-- Select Type --</option>
        <option value="New" style="background-color: black; color: white;">New</option>
        <option value="Renewal" style="background-color: black; color: white;">Renewal</option>
        </select>
        </label><br>
        <label>Login ID:
          <input type="text" name="loginid" value="${client.loginid || ''}" required>
        </label><br>
        <label>Password:
          <input type="text" name="password" value="${client.password || ''}" required>
        </label><br>
        <label>Handled By:
          <input type="text" name="handledby" value="${client.handledby || ''}">
        </label><br>
        <label>NOC Date:
          <input type="date" name="nocdate" value="${client.nocdate || ''}">
        </label><br>
        <label>NOC Expiry Date:
          <input type="date" name="nocexpirydate" value="${client.nocexpirydate || ''}">
        </label><br>
        <label>Application Status:
  <select name="appstatus" required style="width: 100%; background-color: black; color: white; border: 1px solid #444; padding: 8px; border-radius: 4px; font-size: 14px;">
    <option value="" style="background-color: black; color: white;">-- Select Application Status --</option>
    <option value="Application Submitted fees not paid" style="background-color: black; color: white;">Application Submitted fees not paid</option>
    <option value="Application Submitted fees paid" style="background-color: black; color: white;">Application Submitted fees paid</option>
    <option value="Approval Pending for payment of Tariff" style="background-color: black; color: white;">Approval Pending for payment of Tariff</option>
    <option value="Marked to Applicant to upload signed Application" style="background-color: black; color: white;">Marked to Applicant to upload signed Application</option>
    <option value="Permission Certificate Issued" style="background-color: black; color: white;">Permission Certificate Issued</option>
    <option value="Observation raised by Authority" style="background-color: black; color: white;">Observation raised by Authority</option>
    <option value="Observation raised by CTO to Applicant" style="background-color: black; color: white;">Observation raised by CTO to Applicant</option>
    <option value="Recommended to Authority" style="background-color: black; color: white;">Recommended to Authority</option>
    <option value="Recommended to Technical Committee" style="background-color: black; color: white;">Recommended to Technical Committee</option>
    <option value="Rejected by Authority" style="background-color: black; color: white;">Rejected by Authority</option>
    <option value="Reply to Observation Submitted" style="background-color: black; color: white;">Reply to Observation Submitted</option>
    <option value="Return with Approved by Competent Authority" style="background-color: black; color: white;">Return with Approved by Competent Authority</option>
    <option value="Returned with Observation by Competent Authority for reviewed." style="background-color: black; color: white;">Returned with Observation by Competent Authority for reviewed.</option>
    <option value="Signed Application Uploaded by Applicant" style="background-color: black; color: white;">Signed Application Uploaded by Applicant</option>
    <option value="Under Observation" style="background-color: black; color: white;">Under Observation</option>
  </select>
</label><br>
        <div class="form-row">
          <label>Remarks:</label>
          <textarea name="remarks" rows="4">${client.remarks || ''}</textarea>
        </div> 
        <button type="submit">${buttonLabel}</button>
      </form>
    </div>
  `;

  container.style.display = 'block';

  document.getElementById('clientForm').addEventListener('submit', async function (e) {
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
        getData();
      }
    }
  });
}

function addApp() {
  renderAppForm('add');
}
window.addApp = addApp;

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

    renderAppForm('update', record);

  } catch (err) {
    console.error('Error in updateApp:', err.message);
    alert('Failed to load the application for update.');
  }
}
window.updateApp = updateApp;

document.addEventListener('click', function (e) {
  if (e.target && e.target.classList.contains('edit-icon')) {
    const appno = e.target.dataset.appno;
    if (appno) {
      updateApp({ appno });
    } else {
      alert('Missing app number.');
    }
  }
});

// ========== Login / Sign-Up Form ==========

function showLoginForm() {
  const container = document.getElementById('formContainer');
  const tableWrapper = document.querySelector('.table-wrapper');
  if (tableWrapper) tableWrapper.style.display = 'none';

   toggleExcelButton(false); 

  container.innerHTML = `
    <div class="login-form">
      <h2 id="authTitle">Login</h2>
      <form id="authForm">
        <label for="email">Email</label>
        <input type="email" name="email" required>
        <label for="password">Password</label>
        <input type="password" name="password" required>
        <button type="submit">Login</button>
      </form>
      <div class="signup-link" id="toggleLink" style="cursor:pointer;">New user? <span>Sign up here</span></div>
    </div>
  `;

  container.style.display = 'block';
  let isLoginMode = true;

  function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('authTitle').textContent = isLoginMode ? 'Login' : 'Sign Up';
    document.querySelector('#authForm button').textContent = isLoginMode ? 'Login' : 'Sign Up';
    document.getElementById('toggleLink').innerHTML = isLoginMode
      ? 'New user? <span>Sign up here</span>'
      : 'Already have an account? <span>Login</span>';
  }

  document.getElementById('toggleLink').addEventListener('click', toggleAuthMode);

  document.getElementById('authForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const credentials = Object.fromEntries(new FormData(e.target).entries());

    try {
      const { data, error } = isLoginMode
        ? await supabase.auth.signInWithPassword(credentials)
        : await supabase.auth.signUp({ email: credentials.email, password: credentials.password });

      if (error) {
        alert((isLoginMode ? 'Login' : 'Signup') + " failed: " + error.message);
        return;
      }

      alert((isLoginMode ? 'Login' : 'Signup') + " successful!");
      container.style.display = 'none';
      getData();
    } catch (err) {
      alert("Something went wrong. Try again.");
      console.error("Auth Error:", err);
    }
  });
}
window.showLoginForm = showLoginForm;
