document.addEventListener("DOMContentLoaded", () => {
    const petList = document.getElementById("petList");

    let petProfiles = JSON.parse(localStorage.getItem('petProfiles')) || []; // Load saved profiles

    // Function to render profiles
    function renderProfiles() {
        petList.innerHTML = ''; // Clear the list
        petProfiles.forEach(profile => {
            const petCard = document.createElement("div");
            petCard.classList.add("petCard");
            petCard.innerHTML = `
                <h3>${profile.name}</h3>
                <p>Breed: ${profile.breed}</p>
                <p>DOB: ${profile.dob}</p>
                <p>Birthday: ${profile.birthday}</p>
                <div class="image-gallery">
                    ${profile.gallery.map(img => `<img src="${img}" alt="Pet Photo" class="profile-image">`).join('')}
                </div>
                <button class="deleteBtn">Delete</button>
                <button class="printBtn">Print</button>
            `;

            petCard.querySelector(".deleteBtn").addEventListener("click", () => {
                petProfiles = petProfiles.filter(pet => pet.name !== profile.name); // Remove profile from array
                localStorage.setItem('petProfiles', JSON.stringify(petProfiles)); // Save to localStorage
                renderProfiles(); // Re-render the profiles
            });

            petCard.querySelector(".printBtn").addEventListener("click", () => {
                // Clone the specific pet profile content for printing
                const printContent = petCard.cloneNode(true);
                printContent.querySelector(".deleteBtn").style.display = "none"; // Hide delete button in print
                printContent.querySelector(".printBtn").style.display = "none"; // Hide print button in print

                // Ensure the images fit the page on print
                const printWindow = window.open('', '', 'height=500,width=800');
                printWindow.document.write('<html><head><title>Print Profile</title><style>');
                printWindow.document.write(`
                    .profile-image {
                        width: 100%;
                        max-width: 500px;
                        height: auto;
                    }
                    body {
                        font-family: Arial, sans-serif;
                    }
                    h3 {
                        color: #6a0dad;
                    }
                    p {
                        font-size: 14px;
                        color: #333;
                    }
                `);
                printWindow.document.write('</style></head><body>');
                printWindow.document.write(printContent.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.print();
            });

            petList.appendChild(petCard);
        });
    }

    // Initial rendering of profiles (if any)
    if (petProfiles.length > 0) {
        renderProfiles();
    }
});
