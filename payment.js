// Payment Section

let isPaymentUpdate = false;
let paymentToUpdate = null;


// Currency formatting function
function formatCurrency(num) {
  if (!num || isNaN(num)) return '';
  return `₹${Number(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}


async function payments() {
  // Hide all unrelated sections
  [
    '#formContainer', '.table-wrapper', '#authContainer',
    '#dashboardSection', '.stats-grid', '.charts-grid',
    '#filterPanel', '.expiring-table', '#paymentSection'
  ].forEach(selector => {
    document.querySelectorAll(selector).forEach(el => el.style.display = 'none');
  });

  // Show payment section
  const paymentSection = document.getElementById('paymentSection');
  if (paymentSection) paymentSection.style.display = 'block';

  // Hide the Add New Bill form
  const addBillForm = document.getElementById('addBillForm');
  if (addBillForm) addBillForm.style.display = 'none';

  // Show the table wrapper (with the payment table)
  const tableWrapper = document.querySelector('.payment-table-wrapper');
  if (tableWrapper) tableWrapper.style.display = 'block';

  // Show Add and Export buttons
  const addBtn = document.getElementById('AddBillBtn');
  const exportBtn = document.getElementById('exportPaymentBtn');
  if (addBtn) addBtn.style.display = 'inline-block';
  if (exportBtn) exportBtn.style.display = 'inline-block';

  // Load payment data
  await loadPaymentData();
}


async function loadPaymentData() {
  const { data, error } = await supabase.from('Payment').select('*');
  const tableBody = document.getElementById('paymentBody');

  if (!tableBody) {
    console.error("paymentBody element not found.");
    return;
  }

  if (error) {
    console.error("Error loading payment data:", error.message);
    tableBody.innerHTML = `<tr><td colspan="16">Error loading data</td></tr>`;
    return;
  }

  if (!data || data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="16">No payment records found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = ''; // Clear any existing rows

  data.forEach((row, index) => {

    const tr = document.createElement('tr');
    tr.setAttribute('data-id', row.invoiceno);

    tr.innerHTML = `
      <td>${row.invoiceno ?? ''}</td>
      <td>${formatDateToDDMMYYYY(row.invoicedate)}</td>
      <td>${row.clientname ?? ''}</td>
      <td style="text-align: right;">${formatCurrency(row.signingAmt)}</td>
      <td style="text-align: right;">${formatCurrency(row.ibt)}</td>
      <td style="text-align: right;">${formatCurrency(row.gst)}</td>
      <td style="text-align: right;">${formatCurrency(row.tds)}</td>
      <td style="text-align: right;">${formatCurrency(row.amount)}</td>
      
      <td style="text-align: right;">${formatCurrency(row["1streceived"])}</td>
      <td>${formatDateToDDMMYYYY(row.dateofrec)}</td>
      <td style="text-align: right;">${formatCurrency(row.pending)}</td>
      <td>${formatDateToDDMMYYYY(row.dateofpay)}</td>
      <td>
      ${row.remarks || ''}
      <br>
      <span class="edit-payment" style="cursor:pointer; color:blue; margin-right:10px;">Edit</span><br><br>
      <span class="delete-payment" style="cursor:pointer; color:red;">Delete</span>
    </td>
    `;
    tableBody.appendChild(tr);
  });
}

document.getElementById("AddBillBtn").addEventListener("click", () => {
  const form = document.getElementById("addBillForm");
  const tableWrapper = document.querySelector(".payment-table-wrapper");
  const exportBtn = document.getElementById("exportPaymentBtn");
  const addBtn = document.getElementById("AddBillBtn");

  const isFormVisible = form.style.display === "block";

  if (!isFormVisible) {
    form.style.display = "block";
    if (tableWrapper) tableWrapper.style.display = "none";
    if (exportBtn) exportBtn.style.display = "none";
    if (addBtn) addBtn.style.display = "none";
  } else {
    form.style.display = "none";
    if (tableWrapper) tableWrapper.style.display = "block";
    if (exportBtn) exportBtn.style.display = "inline-block";
    if (addBtn) addBtn.style.display = "inline-block";
  }
});



document.addEventListener('click', async function (e) {
  if (e.target.classList.contains('edit-payment')) {
    const tr = e.target.closest('tr');
    const number = tr?.getAttribute('data-id')?.trim();

    console.log("Editing invoiceno:", number);


    const { data, error } = await supabase
      .from('Payment')
      .select('*')
      .eq('invoiceno', number)
      .maybeSingle();

    if (error || !data) {
      alert('Error fetching payment details.');
      return;
    }

    // Set form to update mode
    isPaymentUpdate = true;
    paymentToUpdate = number;

    document.querySelector('#addBillForm h1').innerHTML = "Update Bill Details";
    document.getElementById("addBillForm").style.display = "block";
    document.querySelector('.payment-table-wrapper').style.display = "none";
    document.getElementById('exportPaymentBtn').style.display = "none";
    document.getElementById('AddBillBtn').style.display = "none";

    // Fill form fields
    document.getElementById('bill-invoiceno').value = data.invoiceno ?? '';
    document.getElementById('bill-invoicedate').value = data.invoicedate ?? '';
    document.getElementById('bill-clientname').value = data.clientname ?? '';
    document.getElementById('bill-ibt').value = data.ibt ?? '';
    document.getElementById('bill-gst').value = data.gst ?? '';
    document.getElementById('bill-tds').value = data.tds ?? '';
    document.getElementById('bill-amount').value = data.amount ?? '';
    document.getElementById('bill-signing').value = data.signingAmt ?? '';
    document.getElementById('bill-1streceived').value = data["1streceived"] ?? '';
    document.getElementById('bill-dateofrec').value = data.dateofrec ?? '';
    document.getElementById('bill-pending').value = data.pending ?? '';
    document.getElementById('bill-dateofpay').value = data.dateofpay ?? '';
    document.getElementById('bill-remarks').value = data.remarks ?? '';
  }
});

document.addEventListener('click', async function (e) {
  // Edit handler (already present)
  if (e.target.classList.contains('edit-payment')) {
    // your edit logic...
    return;
  }

  // DELETE handler
  if (e.target.classList.contains('delete-payment')) {
    const tr = e.target.closest('tr');
    const number = tr.getAttribute('data-id');

    const confirmDelete = confirm("Are you sure you want to delete this payment?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from('Payment')
      .delete()
      .eq('invoiceno', number)

    if (error) {
      alert("❌ Error deleting payment: " + error.message);
    } else {
      showNotification("🗑️ Payment deleted successfully!");
      loadPaymentData(); // reloads updated table
    }
  }
});



// Export functionality using SheetJS
function exportPaymentToExcel() {
  const table = document.getElementById('paymentTable');
  if (!table) return;

  const workbook = XLSX.utils.table_to_book(table, { sheet: "Payments" });
  XLSX.writeFile(workbook, `Payment_Tracker_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

document.getElementById('exportPaymentBtn')?.addEventListener('click', exportPaymentToExcel);



document.getElementById('addBillForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const formValues = Object.fromEntries(formData.entries());

  // Handle type conversions
  formValues.ibt = parseFloat(formValues.ibt) || 0;
  formValues.gst = parseFloat(formValues.gst) || 0;
  formValues.tds = parseFloat(formValues.tds) || 0;
  formValues.amount = parseFloat(formValues.amount) || 0;
  formValues.signingAmt = parseFloat(formValues.signingAmt) || 0;
  formValues["1streceived"] = parseFloat(formValues["1streceived"]) || 0;
  formValues.pending = parseFloat(formValues.pending) || 0;

  formValues.invoicedate = formValues.invoicedate || null;
  formValues.dateofrec = formValues.dateofrec || null;
  formValues.dateofpay = formValues.dateofpay || null;

  if (isPaymentUpdate && paymentToUpdate) {
    const { error } = await supabase
      .from('Payment')
      .update(formValues)
      .eq('invoiceno', paymentToUpdate);

    if (error) {
      alert("Error updating payment: " + error.message);
    } else {
      showNotification("✅ Payment added successfully!");

      resetPaymentForm();
      loadPaymentData();
    }
  } else {
    const { error } = await supabase.from('Payment').insert([formValues]);

    if (error) {
      showNotification("❌ Error updating payment: " + error.message, "error");

    } else {
      showNotification("✅ Payment added successfully!");
      resetPaymentForm();
      loadPaymentData();
    }
  }
});


function resetPaymentForm() {
  document.getElementById('addBillForm').reset();
  document.querySelector('#addBillForm h1').innerHTML = "Add New Bill";
  isPaymentUpdate = false;
  paymentToUpdate = null;

  document.getElementById("addBillForm").style.display = "none";
  document.querySelector('.payment-table-wrapper').style.display = "block";
  document.getElementById('exportPaymentBtn').style.display = "inline-block";
  document.getElementById('AddBillBtn').style.display = "inline-block";
}


function showNotification(message, type = 'success') {
  const notif = document.getElementById('notification');
  notif.textContent = message;
  notif.style.backgroundColor = type === 'error' ? '#e74c3c' : '#4BB543';
  notif.style.display = 'block';
  notif.style.opacity = '1';

  setTimeout(() => {
    notif.style.opacity = '0';
    setTimeout(() => {
      notif.style.display = 'none';
    }, 300);
  }, 3000);
}
