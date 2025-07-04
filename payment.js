async function payments() {
  // Hide all other sections (replace these with your actual IDs)
  document.getElementById("nocDashboardSection").style.display = "none";
  document.getElementById("nocTableSection").style.display = "none";

  // Show payment tracker section
  const paymentTableSection = document.getElementById("paymentTableSection");
  paymentTableSection.style.display = "block";

  const { data, error } = await supabase
    .from('payment_tracker')
    .select('*')
    .order('date', { ascending: false });

  const tbody = document.querySelector("#paymentTable tbody");
  tbody.innerHTML = ''; // Clear old rows

  if (error) {
    console.error("Error loading payment tracker:", error);
    tbody.innerHTML = `<tr><td colspan="11">Error loading data</td></tr>`;
    return;
  }

  data.forEach((entry, index) => {
    const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${entry.date || ''}</td>
        <td>${entry.invoice_no || ''}</td>
        <td>${entry.client_name || ''}</td>
        <td>${entry.invoice_before_tax || ''}</td>
        <td>${entry.gst_18_percent || ''}</td>
        <td>${entry.tds_10_percent || ''}</td>
        <td>${entry.amount_receivable || ''}</td>
        <td>${entry.actual_amount_received || ''}</td>
        <td>${entry.date_of_payment || ''}</td>
        <td>${entry.remarks || ''}</td>
      </tr>
    `;
    tbody.insertAdjacentHTML('beforeend', row);
  });
}
