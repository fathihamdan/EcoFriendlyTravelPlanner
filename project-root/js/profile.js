// ========== USER DATA MANAGEMENT ==========

/**
 * Returns the currently logged-in user object from localStorage,
 * or null if no session is found.
 */
function getLoggedInUser() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const loggedInEmail = localStorage.getItem('loggedInEmail');
    if (!loggedInEmail) return null;
    return users.find(user => user.email === loggedInEmail) || null;
}

/**
 * Merges updatedData into the current user's record in localStorage
 * and refreshes the sessionStorage snapshot.
 */
function updateUserData(updatedData) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const loggedInEmail = localStorage.getItem('loggedInEmail');
    const userIndex = users.findIndex(user => user.email === loggedInEmail);

    if (userIndex === -1) return false;

    users[userIndex] = { ...users[userIndex], ...updatedData };
    localStorage.setItem('users', JSON.stringify(users));
    sessionStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
    return true;
}

// ========== LOAD PROFILE DATA ==========

/**
 * Populates all profile fields from the logged-in user's stored data.
 * Falls back to splitting the `name` field if firstName/lastName were
 * not stored separately (e.g. registered with the old auth flow).
 */
function loadProfileData() {
    const user = getLoggedInUser();

    if (!user) {
        // Not logged in — redirect to login
        window.location.href = 'login.html';
        return;
    }

    // ── Resolve first / last name ──────────────────────────────────────────
    // Newer registrations store firstName / lastName directly.
    // Older registrations may only have a combined `name` field.
    let firstName = user.firstName || '';
    let lastName  = user.lastName  || '';

    if (!firstName && !lastName && user.name) {
        const parts = user.name.trim().split(' ');
        firstName = parts[0] || '';
        lastName  = parts.slice(1).join(' ') || '';
    }

    // ── Populate form fields ───────────────────────────────────────────────
    document.getElementById('firstName').value  = firstName;
    document.getElementById('lastName').value   = lastName;
    document.getElementById('phoneField').value = user.phone || '';
    document.getElementById('emailField').value = user.email || '';

    // ── Update avatar display section ─────────────────────────────────────
    const fullName = `${firstName} ${lastName}`.trim();
    document.getElementById('displayName').textContent =
        fullName || user.email.split('@')[0];

    document.getElementById('displayPhone').textContent =
        user.phone || 'Not provided';

    // ── Restore saved avatar if present ───────────────────────────────────
    if (user.avatar) {
        const avatarDiv = document.getElementById('avatarPlaceholder');
        avatarDiv.innerHTML =
            `<img src="${user.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
        avatarDiv.classList.remove('avatar-placeholder');
    }
}

// ========== PROFILE FUNCTIONS ==========

/** Save first name, last name and phone number. */
function saveProfile() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName  = document.getElementById('lastName').value.trim();
    const phone     = document.getElementById('phoneField').value.trim();

    if (!firstName) {
        showToast('Please enter your first name.', 'error');
        return;
    }
    if (!lastName) {
        showToast('Please enter your last name.', 'error');
        return;
    }
    if (!phone) {
        showToast('Please enter your phone number.', 'error');
        return;
    }

    const phoneRegex = /^[\+\d\s\-\(\)]{7,20}$/;
    if (!phoneRegex.test(phone)) {
        showToast('Please enter a valid phone number.', 'error');
        return;
    }

    const success = updateUserData({ firstName, lastName, phone });

    if (success) {
        document.getElementById('displayName').textContent  = `${firstName} ${lastName}`;
        document.getElementById('displayPhone').textContent = phone;
        showToast('Profile updated successfully!', 'success');
    } else {
        showToast('Could not update profile. Please log in again.', 'error');
    }
}

// ── Avatar ──────────────────────────────────────────────────────────────────

function triggerAvatarUpload() {
    document.getElementById('avatarUpload').click();
}

function uploadAvatar(input) {
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file.', 'error');
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        showToast('Image must be smaller than 2 MB.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const avatarUrl = e.target.result;
        updateUserData({ avatar: avatarUrl });

        const avatarDiv = document.getElementById('avatarPlaceholder');
        avatarDiv.innerHTML =
            `<img src="${avatarUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
        avatarDiv.classList.remove('avatar-placeholder');

        showToast('Profile picture updated!', 'success');
    };
    reader.readAsDataURL(file);
}

// ========== PASSWORD FUNCTIONS ==========

function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword     = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Please fill in all password fields.', 'error');
        return;
    }
    if (newPassword !== confirmPassword) {
        showToast('New password and confirmation do not match.', 'error');
        return;
    }
    if (newPassword.length < 6) {
        showToast('New password must be at least 6 characters.', 'error');
        return;
    }

    const user = getLoggedInUser();
    if (!user) {
        showToast('Session expired. Please log in again.', 'error');
        return;
    }
    if (user.password !== currentPassword) {
        showToast('Current password is incorrect.', 'error');
        return;
    }

    const success = updateUserData({ password: newPassword });

    if (success) {
        showToast('Password changed successfully!', 'success');
        // Clear fields and close modal
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value     = '';
        document.getElementById('confirmNewPassword').value = '';
        closeModal('passwordModal');
    } else {
        showToast('Could not update password. Please log in again.', 'error');
    }
}

// ========== ACCOUNT FUNCTIONS ==========

function deactivateAccount() {
    if (!confirm('Are you sure you want to deactivate your account? This cannot be undone.')) return;

    const confirmText = prompt('Type "DEACTIVATE" to confirm:');
    if (confirmText !== 'DEACTIVATE') {
        if (confirmText !== null) alert('Deactivation cancelled — incorrect confirmation text.');
        return;
    }

    const users         = JSON.parse(localStorage.getItem('users') || '[]');
    const loggedInEmail = localStorage.getItem('loggedInEmail');
    const updatedUsers  = users.filter(u => u.email !== loggedInEmail);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.removeItem('loggedInEmail');
    sessionStorage.clear();

    showToast("Your account has been deactivated. We're sad to see you go!", 'success');
    setTimeout(() => { window.location.href = 'login.html'; }, 1500);
}

function logout() {
    if (!confirm('Are you sure you want to log out?')) return;

    localStorage.removeItem('loggedInEmail');
    sessionStorage.clear();

    showToast('Logged out successfully!', 'success');
    setTimeout(() => { window.location.href = 'login.html'; }, 600);
}

// ========== UI HELPER FUNCTIONS ==========

function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification${type === 'error' ? ' error' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    if (id === 'passwordModal') {
        document.getElementById('currentPassword').value    = '';
        document.getElementById('newPassword').value        = '';
        document.getElementById('confirmNewPassword').value = '';
    }
}

// Close modal when clicking the backdrop
document.querySelectorAll('.modal-overlay').forEach(el => {
    el.addEventListener('click', e => {
        if (e.target === el) {
            el.classList.remove('active');
            if (el.id === 'passwordModal') {
                document.getElementById('currentPassword').value    = '';
                document.getElementById('newPassword').value        = '';
                document.getElementById('confirmNewPassword').value = '';
            }
        }
    });
});

// ========== NAVIGATION ==========

function navigateTo(page) {
    localStorage.setItem('currentPage', page);
    const routes = {
        dashboard : 'dashboard.html',
        search    : 'search.html',
        itinerary : 'itinerary.html',
        weather   : 'weather.html'
    };
    if (routes[page]) window.location.href = routes[page];
}

// ========== INIT ==========
loadProfileData();
