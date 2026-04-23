// ========== USER DATA MANAGEMENT ==========

// Get logged in user from localStorage
function getLoggedInUser() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const loggedInEmail = localStorage.getItem('loggedInEmail');
    return users.find(user => user.email === loggedInEmail);
}

// Update user data in localStorage
function updateUserData(updatedData) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const loggedInEmail = localStorage.getItem('loggedInEmail');
    const userIndex = users.findIndex(user => user.email === loggedInEmail);
    
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updatedData };
        localStorage.setItem('users', JSON.stringify(users));
        
        // Also update session for current user
        sessionStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
        
        showToast('Profile updated successfully!', 'success');
        return true;
    }
    return false;
}

// Load profile data
function loadProfileData() {
    const user = getLoggedInUser();
    
    if (user) {
        // Set form fields
        document.getElementById('firstName').value = user.firstName || '';
        document.getElementById('lastName').value = user.lastName || '';
        document.getElementById('phoneField').value = user.phone || '';
        document.getElementById('emailField').value = user.email || '';
        
        // Update display fields
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        document.getElementById('displayName').textContent = fullName || user.email.split('@')[0];
        document.getElementById('displayPhone').textContent = user.phone || 'Not provided';
        
        // Load avatar if exists
        if (user.avatar) {
            const avatarDiv = document.getElementById('avatarPlaceholder');
            avatarDiv.innerHTML = `<img src="${user.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            avatarDiv.classList.remove('avatar-placeholder');
        }
    } else {
        // If no user logged in, redirect to login
        window.location.href = 'login.html';
    }
}

// ========== PROFILE FUNCTIONS ==========

// Save profile (first name, last name, phone number)
function saveProfile() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phone = document.getElementById('phoneField').value.trim();
    
    // Validation
    if (!firstName) {
        showToast('Please enter your first name', 'error');
        return;
    }
    
    if (!lastName) {
        showToast('Please enter your last name', 'error');
        return;
    }
    
    if (!phone) {
        showToast('Please enter your phone number', 'error');
        return;
    }
    
    // Phone number validation (basic)
    const phoneRegex = /^[\+\d\s\-\(\)]{8,20}$/;
    if (!phoneRegex.test(phone)) {
        showToast('Please enter a valid phone number', 'error');
        return;
    }
    
    // Update user data
    const success = updateUserData({
        firstName: firstName,
        lastName: lastName,
        phone: phone
    });
    
    if (success) {
        // Update display fields
        const fullName = `${firstName} ${lastName}`;
        document.getElementById('displayName').textContent = fullName;
        document.getElementById('displayPhone').textContent = phone;
    }
}

// Avatar upload
function triggerAvatarUpload() {
    document.getElementById('avatarUpload').click();
}

function uploadAvatar(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            return;
        }
        
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showToast('Image size should be less than 2MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatarUrl = e.target.result;
            
            // Update user data with avatar
            updateUserData({ avatar: avatarUrl });
            
            // Update avatar display
            const avatarDiv = document.getElementById('avatarPlaceholder');
            avatarDiv.innerHTML = `<img src="${avatarUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            avatarDiv.classList.remove('avatar-placeholder');
            
            showToast('Profile picture updated!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

// ========== PASSWORD FUNCTIONS ==========

function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Please fill in all password fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('New password and confirm password do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('New password must be at least 6 characters long', 'error');
        return;
    }
    
    // Get current user
    const user = getLoggedInUser();
    
    if (user && user.password !== currentPassword) {
        showToast('Current password is incorrect', 'error');
        return;
    }
    
    // Update password
    const success = updateUserData({ password: newPassword });
    
    if (success) {
        showToast('Password changed successfully!', 'success');
        
        // Clear password fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        // Close modal
        closeModal('passwordModal');
    }
}

// ========== ACCOUNT FUNCTIONS ==========

function deactivateAccount() {
    if (confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) {
        const confirmText = prompt('Type "DEACTIVATE" to confirm account deactivation:');
        if (confirmText === 'DEACTIVATE') {
            // Remove user data
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const loggedInEmail = localStorage.getItem('loggedInEmail');
            const updatedUsers = users.filter(user => user.email !== loggedInEmail);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            
            // Clear session
            localStorage.removeItem('loggedInEmail');
            sessionStorage.clear();
            
            showToast('Your account has been deactivated. We\'re sad to see you go!', 'success');
            
            // Redirect to login after short delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else if (confirmText !== null) {
            alert('Account deactivation cancelled - incorrect confirmation text');
        }
    }
}

function logout() {
    if (confirm('Are you sure you want to log out?')) {
        // Clear session data
        localStorage.removeItem('loggedInEmail');
        sessionStorage.clear();
        
        showToast('Logged out successfully!', 'success');
        
        // Redirect to login page
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 500);
    }
}

// ========== UI HELPER FUNCTIONS ==========

// Toast notification
function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type === 'error' ? 'error' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Modal functions
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    // Clear password fields when closing modal
    if (id === 'passwordModal') {
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    }
}

// Close modal on backdrop click
document.querySelectorAll('.modal-overlay').forEach(el => {
    el.addEventListener('click', e => {
        if (e.target === el) {
            el.classList.remove('active');
            // Clear password fields
            if (el.id === 'passwordModal') {
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
            }
        }
    });
});

// ========== NAVIGATION FUNCTIONS ==========

function navigateTo(page) {
    localStorage.setItem('currentPage', page);
    switch(page) {
        case 'dashboard': window.location.href = 'dashboard.html'; break;
        case 'search': window.location.href = 'search.html'; break;
        case 'itinerary': window.location.href = 'itinerary.html'; break;
        case 'weather': window.location.href = 'weather.html'; break;
    }
}