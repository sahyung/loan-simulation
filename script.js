document.addEventListener("DOMContentLoaded", function () {
    // Set the default date to today
    const today = new Date();
    document.getElementById("startDate").valueAsDate = today;
    generateSimulation();

    // Attach event listeners to trigger generateSimulation on Enter key press
    const inputs = document.querySelectorAll('#loanAmount, #dailyPayment, #dailyInterestRate, #startDate');
    inputs.forEach(input => {
        input.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                generateSimulation();
            }
        });
    });
});

// This function makes the date picker show when clicking anywhere on the input
function focusDatePicker() {
    document.getElementById("startDate").focus();
}

function formatCurrency(input) {
    let value = input.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    if (value) {
        input.value = "Rp " + parseInt(value).toLocaleString("en-US");
    } else {
        input.value = "";
    }
}

function parseCurrency(value) {
    return parseInt(value.replace(/[^0-9]/g, ''));
}

function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function generateSimulation() {
    const loanAmount = parseCurrency(document.getElementById('loanAmount').value);
    const dailyPayment = parseCurrency(document.getElementById('dailyPayment').value);
    const dailyInterestRate = parseFloat(document.getElementById('dailyInterestRate').value) / 100; // Convert percentage to decimal
    const startDate = new Date(document.getElementById('startDate').value);

    let balance = loanAmount;
    let totalInterest = 0;  // Initialize totalInterest properly
    let days = 0;
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = ""; // Clear previous results

    if (isNaN(loanAmount) || isNaN(dailyPayment) || isNaN(dailyInterestRate) || !startDate) {
        alert("Please enter valid input values.");
        return;
    }

    let table = `<table><tr><th>Day</th><th>Date</th><th>Remaining Debt (Rp)</th><th>Interest for the Day (Rp)</th><th>Payment (Rp)</th><th>New Debt Balance (Rp)</th></tr>`;
    
    let currentDate = new Date(startDate);
    while (balance > 0) {
        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isFirstDay = days === 0;
        const dailyInterest = isWeekend || isFirstDay ? 0 : balance * dailyInterestRate;
        
        const payment = isFirstDay ? 0 : Math.min(dailyPayment, balance + dailyInterest);
        const previousBalance = balance;
        balance = balance + dailyInterest - payment;
        totalInterest += dailyInterest;  // Accumulate total interest correctly

        // Alternate row color
        const rowClass = (days % 2 === 0) ? 'alternate-row' : '';
        
        table += `<tr class="${rowClass}">
            <td>${days}</td>
            <td>${formatDate(currentDate)}</td>
            <td>Rp ${parseCurrency(previousBalance.toFixed(0)).toLocaleString("en-US")}</td>
            <td>Rp ${parseCurrency(dailyInterest.toFixed(0)).toLocaleString("en-US")}</td>
            <td>Rp ${parseCurrency(payment.toFixed(0)).toLocaleString("en-US")}</td>
            <td>Rp ${parseCurrency(Math.max(balance, 0).toFixed(0)).toLocaleString("en-US")}</td>
        </tr>`;
        
        currentDate.setDate(currentDate.getDate() + 1);
        days++;
    }

    table += "</table>";

    const endDate = new Date(currentDate.setDate(currentDate.getDate() - 1));
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const remainingDays = days % 30;

    resultDiv.innerHTML = `
    <div class="result-summary">
        <h2>Simulation Result</h2>
        <p><span class="label">Initial Loan:</span> <span class="value">Rp ${loanAmount.toLocaleString("en-US")}</span></p>
        <p><span class="label">Daily Interest Rate:</span> <span class="value highlight">Rp ${parseCurrency((loanAmount * dailyInterestRate).toFixed(0)).toLocaleString("en-US")} (${(dailyInterestRate * 100).toFixed(2)}%)</span></p>
        <p><span class="label">Total Interest Paid:</span> <span class="value highlight">Rp ${parseCurrency(totalInterest.toFixed(0)).toLocaleString("en-US")}</span></p>
        <p><span class="label">Start Date:</span> <span class="value">${formatDate(startDate)}</span></p>
        <p><span class="label">End Date:</span> <span class="value">${formatDate(endDate)}</span></p>
        <p><span class="label">Total Duration:</span> <span class="value">${years} years, ${months} months, ${remainingDays} days (${days} days total)</span></p>
    </div>
    <div class="table-container">
        ${table}
    </div>
`;
}
