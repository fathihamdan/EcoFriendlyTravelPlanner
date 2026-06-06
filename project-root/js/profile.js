// ========== CONFIG ==========
const API_BASE = "http://localhost:5000/api";

// ========== AUTH HELPERS ==========

function getToken() {
    return localStorage.getItem("ecoroam_token");
}

function clearSession() {
    localStorage.removeItem("ecoroam_token");
    localStorage.removeItem("ecoroam_user");
}

async function apiFetch(path, options = {}, skipAuthRedirect = false) {
    const token = getToken();
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });

    if (res.status === 401 && !skipAuthRedirect) {
        clearSession();
        window.location.href = "login.html";
        return null;
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
}

// ========== LOAD PROFILE DATA ==========

async function loadProfileData() {
    if (!getToken()) {
        window.location.href = "login.html";
        return;
    }

    try {
        const user = await apiFetch("/users/profile");
        if (!user) return;

        // Cache locally so other pages can read the name quickly
        localStorage.setItem("ecoroam_user", JSON.stringify(user));

        // Populate form fields
        document.getElementById("firstName").value  = user.firstName || "";
        document.getElementById("lastName").value   = user.lastName  || "";
        document.getElementById("phoneField").value = user.phone     || "";
        document.getElementById("emailField").value = user.email     || "";

        // Avatar display section
        const fullName = `${user.firstName} ${user.lastName}`.trim();
        document.getElementById("displayName").textContent  =
            fullName || user.email.split("@")[0];
        document.getElementById("displayPhone").textContent =
            user.phone || "Not provided";

        if (user.avatar) {
            const avatarDiv = document.getElementById("avatarPlaceholder");
            avatarDiv.innerHTML =
                `<img src="${user.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            avatarDiv.classList.remove("avatar-placeholder");
        }
    } catch (err) {
        showToast(err.message || "Failed to load profile.", "error");
    }
}

// ========== SAVE PROFILE ==========

async function saveProfile() {
    const firstName = document.getElementById("firstName").value.trim();
    const lastName  = document.getElementById("lastName").value.trim();
    const phone     = document.getElementById("phoneField").value.trim();

    if (!firstName) { showToast("Please enter your first name.", "error"); return; }
    if (!lastName)  { showToast("Please enter your last name.", "error");  return; }
    if (!phone)     { showToast("Please enter your phone number.", "error"); return; }

    const phoneRegex = /^[\+\d\s\-\(\)]{7,20}$/;
    if (!phoneRegex.test(phone)) {
        showToast("Please enter a valid phone number.", "error");
        return;
    }

    try {
        const updated = await apiFetch("/users/profile", {
            method: "PUT",
            body: JSON.stringify({ firstName, lastName, phone }),
        });

        // Keep local cache in sync
        localStorage.setItem("ecoroam_user", JSON.stringify(updated));

        document.getElementById("displayName").textContent  = `${firstName} ${lastName}`;
        document.getElementById("displayPhone").textContent = phone;
        showToast("Profile updated successfully!", "success");
    } catch (err) {
        showToast(err.message || "Could not update profile.", "error");
    }
}

// ========== AVATAR ==========

function triggerAvatarUpload() {
    document.getElementById("avatarUpload").click();
}

function uploadAvatar(input) {
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];

    if (!file.type.startsWith("image/")) {
        showToast("Please select an image file.", "error");
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        showToast("Image must be smaller than 2 MB.", "error");
        return;
    }

    const reader = new FileReader();
    reader.onload = async function (e) {
        const avatarUrl = e.target.result;

        try {
            const updated = await apiFetch("/users/profile", {
                method: "PUT",
                body: JSON.stringify({ avatar: avatarUrl }),
            });

            localStorage.setItem("ecoroam_user", JSON.stringify(updated));

            const avatarDiv = document.getElementById("avatarPlaceholder");
            avatarDiv.innerHTML =
                `<img src="${avatarUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            avatarDiv.classList.remove("avatar-placeholder");

            showToast("Profile picture updated!", "success");
        } catch (err) {
            showToast(err.message || "Could not save avatar.", "error");
        }
    };
    reader.readAsDataURL(file);
}

// ========== CHANGE PASSWORD ==========

async function changePassword() {
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword     = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmNewPassword").value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast("Please fill in all password fields.", "error");
        return;
    }
    if (newPassword !== confirmPassword) {
        showToast("New password and confirmation do not match.", "error");
        return;
    }
    if (newPassword.length < 6) {
        showToast("New password must be at least 6 characters.", "error");
        return;
    }

    try {
        await apiFetch("/users/change-password", {
            method: "PUT",
            body: JSON.stringify({ currentPassword, newPassword }),
        }, true);  // <-- true = don't auto-logout on 401

        showToast("Password changed successfully!", "success");
        document.getElementById("currentPassword").value    = "";
        document.getElementById("newPassword").value        = "";
        document.getElementById("confirmNewPassword").value = "";
        closeModal("passwordModal");

    } catch (err) {
        // Wrong current password (401) or any other error — just show the message
        // Clear only the current password field so they can re-enter it
        document.getElementById("currentPassword").value = "";
        document.getElementById("currentPassword").focus();
        showToast(err.message || "Current password is incorrect. Please try again.", "error");
    }
}

function logout() {
    if (!confirm("Are you sure you want to log out?")) return;
    
    clearSession();
    showToast("Logged out successfully!", "success");
    setTimeout(() => { window.location.href = "login.html"; }, 600);
}

async function deactivateAccount() {
    if (!confirm("Are you sure you want to deactivate your account? This cannot be undone.")) return;

    const confirmText = prompt('Type "DEACTIVATE" to confirm:');
    if (confirmText !== "DEACTIVATE") {
        if (confirmText !== null) alert("Deactivation cancelled — incorrect confirmation text.");
        return;
    }

    try {
        await apiFetch("/users/profile", { method: "DELETE" });

        clearSession();
        showToast("Your account has been deactivated. We're sad to see you go!", "success");
        setTimeout(() => { window.location.href = "login.html"; }, 1500);
    } catch (err) {
        showToast(err.message || "Could not deactivate account.", "error");
    }
}

// ========== UI HELPERS ==========

function showToast(message, type = "success") {
    const existing = document.querySelector(".toast-notification");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = `toast-notification${type === "error" ? " error" : ""}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

function openModal(id) {
    document.getElementById(id).classList.add("active");
}

function closeModal(id) {
    document.getElementById(id).classList.remove("active");
    if (id === "passwordModal") {
        document.getElementById("currentPassword").value    = "";
        document.getElementById("newPassword").value        = "";
        document.getElementById("confirmNewPassword").value = "";
    }
}

// Close modal when clicking the backdrop
document.querySelectorAll(".modal-overlay").forEach(el => {
    el.addEventListener("click", e => {
        if (e.target === el) {
            el.classList.remove("active");
            if (el.id === "passwordModal") {
                document.getElementById("currentPassword").value    = "";
                document.getElementById("newPassword").value        = "";
                document.getElementById("confirmNewPassword").value = "";
            }
        }
    });
});

// ========== NAVIGATION ==========

function navigateTo(page) {
    const routes = {
        dashboard : "dashboard.html",
        search    : "search.html",
        itinerary : "itinerary.html",
        weather   : "weather.html",
    };
    if (routes[page]) window.location.href = routes[page];
}

// ========== INIT ==========
loadProfileData();
