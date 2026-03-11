let allCareers = [];

async function fetchData(url) {
    try {
        const response = await fetch(url);
        allCareers = await response.json();

        const dropdown = document.getElementById("career-dropdown");

        allCareers.forEach((career, index) => {
            const option = document.createElement("option");
            option.value = index;
            // FIX: The API uses "Occupation", not "name"
            option.textContent = career.Occupation;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

document.getElementById("career-dropdown").addEventListener("change", function (event) {
    const selectedIndex = event.target.value;
    const nameSpan = document.getElementById("display-name");
    const salarySpan = document.getElementById("display-salary");

    // Check if a valid index was selected (not the placeholder)
    if (selectedIndex !== "") {
        const selectedCareer = allCareers[selectedIndex];

        // FIX: Match the exact keys from the JSON data
        nameSpan.textContent = selectedCareer.Occupation;
        // Optional: format the salary so it looks nice
        salarySpan.textContent = "$" + Number(selectedCareer.Salary).toLocaleString();
    } else {
        nameSpan.textContent = "N/A";
        salarySpan.textContent = "N/A";
    }
});

// Estimated Monthly After Taxes


// Run the fetch
fetchData("https://eecu-data-server.vercel.app/data");

let currentChart = new Chart(canvas,
    {
        type: "doughnut",
        data: {
            labels: ["House", "Transport", "Education", "Food", "Savings"],
            datasets: [{ label: "$", data: [0, 0, 0, 0, 0] }]
        },
        options: {
            plugins: {
                title: { display: true, text: `Expenses by Catagory` }
            }
        }
    }
)

getCareers();
save();
function calcSaveChart() {

    const savedExpenses = {};
    let house = 0;
    let transport = 0; //variables for chart and totals
    let education = 0;
    let food = 0;
    let savings = 0;

    let total = 0;
    inputs.forEach(input => {
        total += Number(input.value.replace(/[^0-9]/g, '')) || 0; //adds input value to sum, only takes integers
        savedExpenses[input.id] = Number(input.value.replace(/[^0-9]/g, '')) || 0; //adds input to object

        if (input.classList.contains("house")) {
            house += Number(input.value.replace(/[^0-9]/g, '')) || 0; //checks class list, if match, add to class total
        }
        else if (input.classList.contains("transport")) {
            transport += Number(input.value.replace(/[^0-9]/g, '')) || 0;
        }
        else if (input.classList.contains("education")) {
            education += Number(input.value.replace(/[^0-9]/g, '')) || 0;
        }
        else if (input.classList.contains("food")) {
            food += Number(input.value.replace(/[^0-9]/g, '')) || 0;
        }
        else if (input.classList.contains("savings")) {
            savings += Number(input.value.replace(/[^0-9]/g, '')) || 0;
        }
    });
    localStorage.setItem("savedExpenses", JSON.stringify(savedExpenses)); //saving object

    if (currentChart) currentChart.destroy(); //destroy chart
    currentChart = new Chart(canvas, //new chart
        {
            type: "doughnut",
            data: {
                labels: ["House", "Transport", "Education", "Food", "Savings"],
                datasets: [{ label: "$", data: [house, transport, education, food, savings] }]
            },
            options: {
                plugins: {
                    title: { display: true, text: `Expenses by Catagory` }
                }
            }
        }
    )
}

function save() {
    const pullExpenses = JSON.parse(localStorage.getItem("savedExpenses")); //grab object
    inputs.forEach(input => {
        if (pullExpenses) {
            if (pullExpenses[input.id]) {
                input.value = pullExpenses[input.id] //grab object and insert saved values in textbox
            }
        }
        calcSaveChart();
    })
}
calculator.addEventListener("input", () => {
    calcSaveChart(); //for any input, run calculations, save, and chart
})


function doFederalTaxes() {
    federalTax = 0;
    const salary = Number(document.getElementById("display-salary").textContent.replace(/[^0-9]/g, '')) || 0;
    if (salary > 50400) {
        federalTax += (salary - 50400) * 0.22; // 22% for income above $50,400
        console.log("High Bracket", federalTax); // 22% for income above $50,400
    }
    if (salary > 12400) {
        if (salary > 50400) { // If salary is above $50,400, only tax the portion between $12,401 and $50,400 at 12%
            federalTax += (50400 - 12400) * 0.12; // 12% for income between $12,401 to $50,400
        } else {
            federalTax += (salary - 12400) * 0.12; // 12% for income between $12,401 to $50,400
        }
        console.log("Mid Bracket", federalTax); // 12% for income between $12,401 to $50,400
    }
    federalTax += Math.min(salary, 12400) * 0.10; // 10% for income up to $12,400
    console.log("Low Bracket", federalTax); // 10% for income up to $12,400
    const taxRate = 0.25; // Example tax rate
    const afterTax = salary * (1 - taxRate);
    document.getElementById("taxes").textContent = "$" + taxes.toLocaleString(); // Display after-tax income with formatting
}
doFederalTaxes();
console.log(federalTax);

function generalTaxes() {
    const salary = document.getElementById("display-salary");
    medicareTax = salary * 0.0145; // Medicare tax is 1.45% of salary
    SS = salary * 0.062; // Social Security tax is 6.2% of salary
    stateTax = salary * 0.04; // Example state tax rate of 4%
    document.getElementById("display-medicare").textContent = "$" + medicareTax.toLocaleString(); // Display Medicare tax with formatting
    document.getElementById("display-ss").textContent = "$" + SS.toLocaleString(); // Display Social Security tax with formatting
    document.getElementById("display-state").textContent = "$" + stateTax.toLocaleString(); // Display state tax with formatting
}
generalTaxes();

