const API_BASE = "http://localhost:5000/api";

// ========== REGISTER ==========
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const fullName    = document.getElementById("registerName").value.trim();
        const email       = document.getElementById("registerEmail").value.trim().toLowerCase();
        const phone       = document.getElementById("registerPhone").value.trim();
        const password    = document.getElementById("registerPassword").value;
        const confirmPass = document.getElementById("confirmPassword").value;
        const msg         = document.getElementById("registerMessage");

        // ── Client-side validation ────────────────────────────────────────
        if (!fullName || !email || !phone || !password || !confirmPass) {
            msg.className = "message error";
            msg.textContent = "Please fill in all fields.";
            return;
        }
        if (password !== confirmPass) {
            msg.className = "message error";
            msg.textContent = "Passwords do not match.";
            return;
        }
        if (password.length < 6) {
            msg.className = "message error";
            msg.textContent = "Password must be at least 6 characters.";
            return;
        }

        const phoneRegex = /^[\+\d\s\-\(\)]{7,20}$/;
        if (!phoneRegex.test(phone)) {
            msg.className = "message error";
            msg.textContent = "Please enter a valid phone number.";
            return;
        }

        // ── Split full name into first / last ─────────────────────────────
        const nameParts = fullName.split(" ");
        const firstName = nameParts[0] || "";
        const lastName  = nameParts.slice(1).join(" ") || "";

        // ── Call API ──────────────────────────────────────────────────────
        try {
            const res = await fetch(`${API_BASE}/users/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, email, phone, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                msg.className = "message error";
                msg.textContent = data.message || "Registration failed.";
                return;
            }

            msg.className = "message success";
            msg.textContent = "Account created! Redirecting to login…";

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1200);

        } catch (err) {
            msg.className = "message error";
            msg.textContent = "Could not connect to server. Please try again.";
        }
    });
}

// ========== LOGIN ==========
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email    = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;
        const msg      = document.getElementById("loginMessage");

        if (!email || !password) {
            msg.className = "message error";
            msg.textContent = "Please enter your email and password.";
            return;
        }

        // ── Call API ──────────────────────────────────────────────────────
        try {
            const res = await fetch(`${API_BASE}/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                msg.className = "message error";
                msg.textContent = data.message || "Invalid email or password.";
                return;
            }

            // ── Persist JWT + user snapshot ───────────────────────────────
            localStorage.setItem("ecoroam_token", data.token);
            localStorage.setItem("ecoroam_user",  JSON.stringify({
                _id      : data._id,
                firstName: data.firstName,
                lastName : data.lastName,
                email    : data.email,
                phone    : data.phone,
                avatar   : data.avatar,
            }));

            msg.className = "message success";
            msg.textContent = "Login successful! Redirecting…";

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 800);

        } catch (err) {
            msg.className = "message error";
            msg.textContent = "Could not connect to server. Please try again.";
        }
    });
}
