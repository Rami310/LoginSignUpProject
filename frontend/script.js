const API_URL = "https://loginsignupproject-production.up.railway.app/api/auth";

async function signup() {
  const username = document.getElementById("signupUsername").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  const response = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, email, password })
  });

  const data = await response.json();
  const message = document.getElementById("signupMessage");

  if (response.ok) {
    message.style.color = "green";
    message.textContent = data.message;
  } else {
    message.style.color = "red";
    message.textContent = data.error;
  }
}

async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  const message = document.getElementById("loginMessage");

  if (response.ok) {
    localStorage.setItem("token", data.token);
    message.style.color = "green";
    message.textContent = "Login successful";
    window.location.href = "profile.html";
  } else {
    message.style.color = "red";
    message.textContent = data.error;
  }
}

async function loadProfile() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const response = await fetch(`${API_URL}/profile`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (response.ok) {
    document.getElementById("username").textContent = data.user.username;
    document.getElementById("email").textContent = data.user.email;
  } else {
    window.location.href = "login.html";
  }
}

function logout() {
  console.log("Logout clicked");
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

if (window.location.pathname.includes("profile.html")) {
  loadProfile();

  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
}