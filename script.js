
function toggleTheme() {
    const current = document.body.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    document.body.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
}

function calculateDays(start, end) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.max(1, Math.round((end - start) / oneDay));
}

function addRecord() {
    const client = document.getElementById("client").value;
    const fullName = document.getElementById("fullName").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;
    const dailyRate = parseFloat(document.getElementById("dailyRate").value);
    const payment = parseFloat(document.getElementById("payment").value) || 0;
    const note = document.getElementById("note").value;

    if (!client || !fullName || !startDate || !endDate || isNaN(dailyRate)) {
        alert("Lütfen gerekli tüm alanları doldurun.");
        return;
    }

    const days = calculateDays(new Date(startDate), new Date(endDate));
    const total = days * dailyRate;
    const remaining = total - payment;

    const tbody = document.querySelector("#records tbody");
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${client}</td>
        <td>${fullName}</td>
        <td>${startDate} ${startTime}</td>
        <td>${endDate} ${endTime}</td>
        <td>${days}</td>
        <td>₺${dailyRate.toFixed(2)}</td>
        <td>₺${total.toFixed(2)}</td>
        <td>₺${payment.toFixed(2)}</td>
        <td>₺${remaining.toFixed(2)}</td>
        <td>${note}</td>
        <td><button onclick="removeRow(this)">❌</button></td>
    `;
    tbody.appendChild(tr);
    clearForm();
    saveToLocalStorage();
    updateTotals();
}

function clearForm() {
    ["client", "fullName", "startDate", "endDate", "startTime", "endTime", "dailyRate", "payment", "note"].forEach(id => {
        document.getElementById(id).value = "";
    });
}

function removeRow(btn) {
    btn.closest("tr").remove();
    saveToLocalStorage();
    updateTotals();
}

function saveToLocalStorage() {
    const rows = document.querySelectorAll("#records tbody tr");
    const data = Array.from(rows).map(row => Array.from(row.children).map(td => td.innerText));
    localStorage.setItem("rentacarData", JSON.stringify(data));
}

function loadFromLocalStorage() {
    const data = JSON.parse(localStorage.getItem("rentacarData") || "[]");
    const tbody = document.querySelector("#records tbody");
    data.forEach(cols => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${cols[0]}</td>
            <td>${cols[1]}</td>
            <td>${cols[2]}</td>
            <td>${cols[3]}</td>
            <td>${cols[4]}</td>
            <td>${cols[5]}</td>
            <td>${cols[6]}</td>
            <td>${cols[7]}</td>
            <td>${cols[8]}</td>
            <td>${cols[9]}</td>
            <td><button onclick="removeRow(this)">❌</button></td>
        `;
        tbody.appendChild(tr);
    });
    updateTotals();
}

function updateTotals() {
    const rows = document.querySelectorAll("#records tbody tr");
    const summary = {};

    rows.forEach(row => {
        const client = row.children[0].innerText;
        const total = parseFloat(row.children[6].innerText.replace("₺", "")) || 0;
        const paid = parseFloat(row.children[7].innerText.replace("₺", "")) || 0;
        const remain = total - paid;

        if (!summary[client]) summary[client] = { total: 0, paid: 0, remain: 0 };
        summary[client].total += total;
        summary[client].paid += paid;
        summary[client].remain += remain;
    });

    const totalsDiv = document.getElementById("totals");
    totalsDiv.innerHTML = Object.entries(summary).map(([client, val]) =>
        `<div><strong>${client}</strong> ➤ Toplam: <span style="color:#00f">₺${val.total.toFixed(2)}</span> | Alınan: <span style="color:green">₺${val.paid.toFixed(2)}</span> | Kalan: <span style="color:red">₺${val.remain.toFixed(2)}</span></div>`
    ).join("");
}

function filterByClient() {
    const val = document.getElementById("clientFilter").value;
    const rows = document.querySelectorAll("#records tbody tr");
    rows.forEach(row => {
        row.style.display = (val === "" || row.children[0].innerText === val) ? "" : "none";
    });
}

function exportExcel() {
    const table = document.getElementById("records");
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(table);
    XLSX.utils.book_append_sheet(wb, ws, "Rentacar");
    XLSX.writeFile(wb, "rentacar_takip.xlsx");
}

window.onload = () => {
    loadFromLocalStorage();
    const theme = localStorage.getItem("theme") || "dark";
    document.body.setAttribute("data-theme", theme);
};
