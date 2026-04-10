document.addEventListener("DOMContentLoaded", function () {
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const navItems = document.querySelectorAll(".nav-item");
  const sectionViews = document.querySelectorAll(".section-view");
  
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // --- Redirect if not logged in (on dashboard) ---
  if (window.location.pathname.includes('dashboard.html') && (!user || !token)) {
    window.location.href = "login.html";
    return;
  }

  // --- DASHBOARD NAVIGATION ---
  if (navItems.length > 0 && user) {
    document.getElementById("userNameSub").textContent = user.name;
    document.getElementById("userEmailSub").textContent = user.email;
    document.getElementById("avatarLetter").textContent = user.name.charAt(0).toUpperCase();

    navItems.forEach(item => {
      item.addEventListener("click", function(e) {
        e.preventDefault();
        const sectionId = this.dataset.section;
        navItems.forEach(n => n.classList.remove("active"));
        this.classList.add("active");
        sectionViews.forEach(v => v.classList.remove("active"));
        document.getElementById(sectionId).classList.add("active");

        if (sectionId === "dashboard") loadAIJobs();
        if (sectionId === "browse") loadAllJobs();
      });
    });
    loadAIJobs();
  }

  function loadAIJobs() {
    const grid = document.getElementById("jobsGrid");
    grid.innerHTML = '<div class="loading">Finding matches...</div>';
    
    fetch(`http://localhost:3000/jobs/recommend`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(jobs => renderJobs(jobs, grid, true))
      .catch(() => grid.innerHTML = 'Error loading matches.');
  }

  function loadAllJobs() {
    const grid = document.getElementById("allJobsGrid");
    grid.innerHTML = '<div class="loading">Loading jobs...</div>';
    fetch("http://localhost:3000/jobs")
      .then(res => res.json())
      .then(jobs => renderJobs(jobs, grid, false));
  }

  function renderJobs(jobs, container, showAI) {
    container.innerHTML = jobs.length === 0 ? "No jobs found." : "";
    jobs.forEach(job => {
      const card = document.createElement("div");
      card.className = "job-card";
      card.innerHTML = `
        <div class="card-top">
          <div><div class="job-title">${job.title}</div><div class="job-info">FutureCorp</div></div>
          <div class="company-logo">${job.title.charAt(0)}</div>
        </div>
        <div class="skill-tags">${job.skills_required.split(',').map(s => `<span class="tag">${s.trim()}</span>`).join('')}</div>
        ${showAI ? `<div class="ai-match-v2"><div class="match-stats"><span>AI Match</span><span>${job.match}%</span></div><div class="pb-bg"><div class="pb-fill" style="width: ${job.match}%"></div></div></div>` : ''}
        <button class="apply-btn-v2" onclick="applyToJob(${job.id})">Quick Apply</button>
      `;
      container.appendChild(card);
    });
  }

  // --- LOGIN ---
  if (loginBtn) {
    loginBtn.addEventListener("click", function () {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("token", data.token);
          window.location.href = "dashboard.html";
        } else {
          showToast(data.message);
        }
      });
    });
  }

  // --- REGISTER ---
  if (registerBtn) {
    registerBtn.addEventListener("click", function () {
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const skills = document.getElementById("skills").value;

      fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, skills })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast("Registered! Redirecting...");
          setTimeout(() => window.location.href = "login.html", 1500);
        } else {
          showToast(data.message);
        }
      });
    });
  }
});

function applyToJob(jobId) {
  const token = localStorage.getItem("token");
  fetch("http://localhost:3000/jobs/apply", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ job_id: jobId })
  })
  .then(res => res.json())
  .then(data => showToast("Applied!"))
  .catch(() => showToast("Error'"));
}

function showToast(msg) {
    alert(msg); // Placeholder for a toast system
}