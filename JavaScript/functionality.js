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

document.getElementById("career-dropdown").addEventListener("change", function (event) {
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
        
        nameSpan.textContent = selectedCareer.Occupation;
        salarySpan.textContent = "$" + salary.toLocaleString();

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

        const formatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
        
        fedSpan.textContent = "$" + federalTax.toLocaleString(undefined, formatOptions);
        medSpan.textContent = "$" + medicare.toLocaleString(undefined, formatOptions);
        ssSpan.textContent = "$" + socialSecurity.toLocaleString(undefined, formatOptions);
        stSpan.textContent = "$" + stateTax.toLocaleString(undefined, formatOptions);
        monthlySpan.textContent = "$" + monthlyNet.toLocaleString(undefined, formatOptions);

    } else {
        [nameSpan, salarySpan, monthlySpan, fedSpan, medSpan, ssSpan, stSpan].forEach(el => el.textContent = "N/A");
    }
});