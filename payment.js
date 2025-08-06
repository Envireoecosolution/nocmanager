// Payment Section

// Currency formatting function
function formatCurrency(num) {
  if (!num || isNaN(num)) return '';
  return `₹${Number(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}


async function payments() {
  [
    '#formContainer', '.table-wrapper', '#authContainer',
    '#dashboardSection', '.stats-grid', '.charts-grid',
    '#filterPanel', '.expiring-table', '#paymentSection'
  ].forEach(selector => {
    document.querySelectorAll(selector).forEach(el => el.style.display = 'none');
  });

  const paymentSection = document.getElementById('paymentSection');
  if (paymentSection) paymentSection.style.display = 'block';

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

  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="text-align: center;">${row.number ?? ''}</td>
      <td>${row.invoiceno ?? ''}</td>
      <td>${formatDateToDDMMYYYY(row.invoicedate)}</td>
      <td>${row.clientname ?? ''}</td>
      <td style="text-align: right;">${formatCurrency(row.ibt)}</td>
      <td style="text-align: right;">${formatCurrency(row.gst)}</td>
      <td style="text-align: right;">${formatCurrency(row.tds)}</td>
      <td style="text-align: right;">${formatCurrency(row.amount)}</td>
      <td style="text-align: right;">${formatCurrency(row.SigningAmt)}</td>
      <td style="text-align: right;">${formatCurrency(row["1streceived"])}</td>
      <td>${formatDateToDDMMYYYY(row.dateofrec)}</td>
      <td style="text-align: right;">${formatCurrency(row.pending)}</td>
      <td>${formatDateToDDMMYYYY(row.dateofpay)}</td>
      <td>${row.Remarks ?? ''}</td>
    `;
    tableBody.appendChild(tr);
  });
}

// Export functionality using SheetJS
function exportPaymentToExcel() {
  const table = document.getElementById('paymentTable');
  if (!table) return;

  const workbook = XLSX.utils.table_to_book(table, { sheet: "Payments" });
  XLSX.writeFile(workbook, `Payment_Tracker_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

document.getElementById('exportPaymentBtn')?.addEventListener('click', exportPaymentToExcel);



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
