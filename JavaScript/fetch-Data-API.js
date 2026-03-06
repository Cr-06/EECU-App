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

document.getElementById("career-dropdown").addEventListener("change", function(event) {
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
fetchData("https://eecu-data-server.vercel.app/data/2023");