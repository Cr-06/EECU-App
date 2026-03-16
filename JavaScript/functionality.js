let allCareers = [];
// here fetches everything for the calculations
async function fetchData(url) {
    try {
        const response = await fetch(url);
        allCareers = await response.json();

        const dropdown = document.getElementById("career-dropdown");
        if (dropdown) {
            allCareers.forEach((career, index) => {
                const option = document.createElement("option");
                option.value = index;
                option.textContent = career.Occupation;
                dropdown.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}
// the logic for all calculations and displaying the results when a career is selected
const careerDropdown = document.getElementById("career-dropdown");
if (careerDropdown) {
    careerDropdown.addEventListener("change", function (event) {
        const selectedIndex = event.target.value;
        const nameSpan = document.getElementById("display-name");
        const salarySpan = document.getElementById("display-salary");
        const fedSpan = document.getElementById("display-federal");
        const medSpan = document.getElementById("display-medicare");
        const ssSpan = document.getElementById("display-ss");
        const stSpan = document.getElementById("display-state");
        const monthlySpan = document.getElementById("display-monthly");

        if (selectedIndex !== "") {
            const selectedCareer = allCareers[selectedIndex];
            const salary = Number(selectedCareer.Salary);
            const formatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };


            const socialSecurity = salary * 0.062;
            const medicare = salary * 0.0145;
            const stateTax = salary * 0.04;

            const standardDeduction = 16100;
            let remainingTaxable = Math.max(0, salary - standardDeduction);
            let federalTax = 0;

            if (remainingTaxable > 50400) {
                federalTax += (remainingTaxable - 50400) * 0.22;
                remainingTaxable = 50400;
            }
            if (remainingTaxable > 12400) {
                federalTax += (remainingTaxable - 12400) * 0.12;
                remainingTaxable = 12400;
            }
            federalTax += remainingTaxable * 0.10;

            const totalAnnualTax = federalTax + socialSecurity + medicare + stateTax;
            const monthlyNet = (salary - totalAnnualTax) / 12;
            const monthlyTaxAmount = totalAnnualTax / 12;

            localStorage.setItem("monthlyNetIncome", monthlyNet);
            localStorage.setItem("monthlyTax", monthlyTaxAmount);

            if (nameSpan) nameSpan.textContent = selectedCareer.Occupation;
            if (salarySpan) salarySpan.textContent = "$" + salary.toLocaleString();
            if (fedSpan) fedSpan.textContent = "$" + federalTax.toLocaleString(undefined, formatOptions);
            if (medSpan) medSpan.textContent = "$" + medicare.toLocaleString(undefined, formatOptions);
            if (ssSpan) ssSpan.textContent = "$" + socialSecurity.toLocaleString(undefined, formatOptions);
            if (stSpan) stSpan.textContent = "$" + stateTax.toLocaleString(undefined, formatOptions);
            if (monthlySpan) monthlySpan.textContent = "$" + monthlyNet.toLocaleString(undefined, formatOptions);

        } else {
            [nameSpan, salarySpan, monthlySpan, fedSpan, medSpan, ssSpan, stSpan].forEach(el => {
                if (el) el.textContent = "N/A";
            });
        }
    });
}

fetchData("https://eecu-data-server.vercel.app/data");
// chart stuff
let budgetChart;

function initChart() {
    const canvas = document.getElementById('budgetChart');
    if (!canvas) return;

    const monthlyNet = parseFloat(localStorage.getItem("monthlyNetIncome")) || 0;
    const monthlyTax = parseFloat(localStorage.getItem("monthlyTax")) || 0;
    const taxInput = document.getElementById('tax-input');
    const incomeInput = document.getElementById('income-input');

    if (taxInput) taxInput.value = monthlyTax.toFixed(2);
    if (incomeInput) incomeInput.value = monthlyNet.toFixed(2);

    const ctx = canvas.getContext('2d');
    budgetChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Loans', 'Housing', 'Essentials', 'Lifestyle', 'Future', 'Taxes', 'Remaining'],
            datasets: [{ //the pie slices right here
                data: [0, 0, 0, 0, 0, monthlyTax, monthlyNet],
                backgroundColor: ['#C50000', '#FF5A00', '#2B00FF', '#812E96', '#FFE100', '#555555', '#487451']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const dataset = context.dataset.data;
                            const total = dataset.reduce((acc, value) => acc + value, 0);
                            const currentValue = context.raw;

                            const percentage = total > 0
                                ? ((currentValue / total) * 100).toFixed(1)
                                : 0;

                            return `${context.label}: ${percentage}% ($${currentValue.toLocaleString()})`;
                        }
                    }
                }
            }
        }
    });

    updateChart();
}

function updateChart() {
    const inputs = document.querySelectorAll('.expense-input');
    if (inputs.length === 0 || !budgetChart) return;

    const values = Array.from(inputs).map(input => parseFloat(input.value) || 0);
    const userExpenses = values.slice(0, 5); // Loans, Housing, Essentials, Lifestyle, Future-Proofing

    const monthlyNet = parseFloat(localStorage.getItem("monthlyNetIncome")) || 0;
    const monthlyTax = parseFloat(localStorage.getItem("monthlyTax")) || 0;

    const totalSpent = userExpenses.reduce((a, b) => a + b, 0);
    const remainingBalance = monthlyNet - totalSpent;
    // updates the slices
    budgetChart.data.datasets[0].data = [...userExpenses, monthlyTax, Math.max(0, remainingBalance)];
    budgetChart.update();

    const surplusBox = document.getElementById('surplus-box');
    if (surplusBox) {
        surplusBox.textContent = (remainingBalance < 0 ? "Shortfall: $" : "Surplus: $") + Math.abs(remainingBalance).toLocaleString(undefined, { minimumFractionDigits: 2 });
        surplusBox.style.fontWeight = "bold";
        surplusBox.style.color = remainingBalance < 0 ? "#C50000" : "#487451";
    }
    const tipBox = document.getElementById('wise-up-tip');
    if (tipBox) {
        const futureSavings = values[4];
        if (futureSavings < (monthlyNet * 0.10) && monthlyNet > 0) {
            tipBox.textContent = "Wise-Up Tip: Try to save at least 10% ($" + (monthlyNet * 0.1).toFixed(2) + ") for your future!";
            tipBox.style.color = "#FF5A00";
            tipBox.style.fontWeight = "bold";
        } else {
            tipBox.textContent = "Excellent saving for your future!";
            tipBox.style.color = "#487451";
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initChart();
    document.querySelectorAll('.expense-input').forEach(i => {
        i.addEventListener('input', updateChart);
    });
});