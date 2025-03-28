function renderProfiles() {
    petList.innerHTML = '';
    petProfiles.forEach((profile, index) => {
        const petCard = document.createElement("div");
        petCard.classList.add("petCard");

        // Set the cover photo as the background of the profile header
        const coverPhotoUrl = profile.gallery[profile.coverPhotoIndex];
        const profileHeaderStyle = coverPhotoUrl ? `style="background-image: url('${coverPhotoUrl}');"` : '';

        petCard.innerHTML = `
            <div class="profile-header" ${profileHeaderStyle}>
                <h3>${profile.name}</h3>
                <p class="countdown">${getCountdown(profile.birthday)}</p>
            </div>
            <div class="profile-details">
                <p><strong>Breed:</strong> ${profile.breed}</p>
                <p><strong>DOB:</strong> ${profile.dob}</p>
                <p><strong>Next Birthday:</strong> ${profile.birthday}</p>
            </div>
            <div class="gallery-grid">
                ${profile.gallery.map((img, imgIndex) => `
                    <div class="gallery-item">
                        <img src="${img}" alt="Pet Photo">
                        <button class="cover-btn ${imgIndex === profile.coverPhotoIndex ? 'active' : ''}"
                                data-index="${imgIndex}">★</button>
                    </div>
                `).join('')}
            </div>
            <div class="mood-tracker">
                <div class="mood-buttons">
                    <span>Log Mood:</span>
                    <button class="mood-btn" data-mood="happy">😊</button>
                    <button class="mood-btn" data-mood="neutral">😐</button>
                    <button class="mood-btn" data-mood="sad">😞</button>
                </div>
                <div class="mood-history">
                    ${renderMoodHistory(profile)}
                </div>
            </div>
            <div class="action-buttons">
                <button class="editBtn">✏️ Edit</button>
                <button class="deleteBtn">🗑️ Delete</button>
                <button class="printBtn">🖨️ Print</button>
            </div>
        `;

        petCard.querySelector(".editBtn").addEventListener("click", () => openEditForm(index));
        petCard.querySelector(".deleteBtn").addEventListener("click", () => deleteProfile(index));
        petCard.querySelector(".printBtn").addEventListener("click", () => printProfile(profile));

        petCard.querySelectorAll(".mood-btn").forEach(btn => {
            btn.addEventListener("click", () => logMood(index, btn.dataset.mood));
        });

        petCard.querySelectorAll(".cover-btn").forEach(btn => {
            btn.addEventListener("click", () => setCoverPhoto(index, parseInt(btn.dataset.index)));
        });

        petList.appendChild(petCard);
    });
}
