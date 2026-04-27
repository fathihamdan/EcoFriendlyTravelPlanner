// ========== REGISTER ==========
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const fullName    = document.getElementById('registerName').value.trim();
    const email       = document.getElementById('registerEmail').value.trim().toLowerCase();
    const phone       = document.getElementById('registerPhone').value.trim();
    const password    = document.getElementById('registerPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;
    const msg         = document.getElementById('registerMessage');

    // Basic validation
    if (!fullName || !email || !phone || !password || !confirmPass) {
      msg.className = 'message error';
      msg.textContent = 'Please fill in all fields.';
      return;
    }

    if (password !== confirmPass) {
      msg.className = 'message error';
      msg.textContent = 'Passwords do not match.';
      return;
    }

    if (password.length < 6) {
      msg.className = 'message error';
      msg.textContent = 'Password must be at least 6 characters.';
      return;
    }

    // Phone basic validation
    const phoneRegex = /^[\+\d\s\-\(\)]{7,20}$/;
    if (!phoneRegex.test(phone)) {
      msg.className = 'message error';
      msg.textContent = 'Please enter a valid phone number.';
      return;
    }

    // Split full name into first / last
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName  = nameParts.slice(1).join(' ') || '';

    // Check for duplicate email
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
      msg.className = 'message error';
      msg.textContent = 'An account with this email already exists.';
      return;
    }

    // Save new user
    const newUser = {
      firstName,
      lastName,
      email,
      phone,
      password,
      avatar: null
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    msg.className = 'message success';
    msg.textContent = 'Account created! Redirecting to login…';

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1200);
  });
}

// ========== LOGIN ==========
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const email    = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const msg      = document.getElementById('loginMessage');

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user  = users.find(u => u.email === email && u.password === password);

    if (!user) {
      msg.className = 'message error';
      msg.textContent = 'Invalid email or password.';
      return;
    }

    // Persist session
    localStorage.setItem('loggedInEmail', user.email);
    sessionStorage.setItem('currentUser', JSON.stringify(user));

    msg.className = 'message success';
    msg.textContent = 'Login successful! Redirecting…';

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 800);
  });
}
