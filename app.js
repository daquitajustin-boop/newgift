const questions = [ "Hola",  
"¿Qué estás haciendo ahora?", 
"Ya casi han pasado semanas desde nuestra última conversación ¿cómo has estado?",
"Acabo de probar algunas cosas que hice para ver si funcionan, ¿qué te parece la interfaz? ", 
"Es algo al azar, pero… ¿me extrañas?"];
 

let currentQuestion = 0;

const landing = document.getElementById("landing");
const readyScreen = document.getElementById("readyScreen");
const logo = document.querySelector(".logo");

// Create a canvas on top of everything for the logo explosion
const logoCanvas = document.createElement("canvas");
logoCanvas.style.position = "absolute";
logoCanvas.style.top = 0;
logoCanvas.style.left = 0;
logoCanvas.style.width = "100%";
logoCanvas.style.height = "100%";
logoCanvas.style.pointerEvents = "none"; // allow clicks through
logoCanvas.width = window.innerWidth;
logoCanvas.height = window.innerHeight;
document.body.appendChild(logoCanvas);
const lctx = logoCanvas.getContext("2d");

function logoExplode(x, y) {
  const particles = [];
  for (let i = 0; i < 40; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      alpha: 1,
      color: `hsl(${Math.random() * 360}, 80%, 60%)`
    });
  }

  function animate() {
    lctx.clearRect(0, 0, logoCanvas.width, logoCanvas.height); // clear each frame

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.03;
      lctx.globalAlpha = p.alpha;
      lctx.fillStyle = p.color;
      lctx.beginPath();
      lctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      lctx.fill();
      lctx.globalAlpha = 1;

      if (p.alpha <= 0) particles.splice(i, 1);
    }

    if (particles.length > 0) {
      requestAnimationFrame(animate);
    } else {
      // Clear the canvas completely after explosion ends
      lctx.clearRect(0, 0, logoCanvas.width, logoCanvas.height);
    }
  }

  animate();
}

// Landing -> Ready with explosion
logo.addEventListener("click", () => {
  const rect = logo.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  logoExplode(x, y);

  // Immediately hide landing screen (so the explosion is visible on top)
  landing.classList.add("hidden");
  readyScreen.classList.remove("hidden");
});

const questionsScreen = document.getElementById("questionsScreen");
const finalScreen = document.getElementById("finalScreen");

const startBtn = document.getElementById("startBtn");
const questionLabel = document.getElementById("questionLabel");
const answerInput = document.getElementById("answer");
const statusDiv = document.getElementById("status");
const form = document.getElementById("emailForm");

const finalForm = document.getElementById("finalForm");
const herMessageInput = document.getElementById("herMessage");
const finalStatus = document.getElementById("finalStatus");

// Landing -> Ready
document.querySelector(".logo").addEventListener("click", () => {
  landing.classList.add("hidden");
  readyScreen.classList.remove("hidden");
});

// Ready -> Questions
startBtn.addEventListener("click", () => {
  readyScreen.classList.add("hidden");
  questionsScreen.classList.remove("hidden");
  showQuestion();
});

// Show current question
function showQuestion() {
  if (currentQuestion < questions.length) {
    questionLabel.textContent = questions[currentQuestion];
    answerInput.value = "";
    statusDiv.textContent = "";
  } else {
    // All questions done -> show final screen
    questionsScreen.classList.add("hidden");
    finalScreen.classList.remove("hidden");
  }
}

// Submit question answer
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const answer = answerInput.value.trim();
  if (!answer) return;

  const question = questions[currentQuestion];

  try {
    const res = await fetch("/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer }),
    });

    const data = await res.json();

    if (res.ok) {
      statusDiv.textContent = "✅ Answer sent!";
      statusDiv.className = "success";
      currentQuestion++;
      showQuestion();
    } else {
      statusDiv.textContent = "❌ Failed: " + (data.error || res.status);
      statusDiv.className = "error";
    }
  } catch (err) {
    statusDiv.textContent = "❌ Error: " + err.message;
    statusDiv.className = "error";
  }
});

// ... previous code remains the same

// Submit her final message
// Submit her final message
finalForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = herMessageInput.value.trim();
  if (!message) return;

  try {
    const res = await fetch("/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "Her message for me", answer: message }),
    });

    const data = await res.json();

    if (res.ok) {
      // Hide the form
      finalForm.style.display = "none";
      finalStatus.textContent = "";
      
      // Show message in the center
      const msgDiv = document.createElement("div");
      msgDiv.textContent = "I got it on my Gmail :>";
      msgDiv.style.color = "#ff69b4";
      msgDiv.style.fontSize = "24px";
      msgDiv.style.fontWeight = "bold";
      msgDiv.style.textAlign = "center";
      msgDiv.style.marginTop = "20px";
      finalScreen.appendChild(msgDiv);

      // Show fireworks canvas
      startFireworks(10000); // 10 seconds

    } else {
      finalStatus.textContent = "❌ Failed: " + (data.error || res.status);
      finalStatus.className = "error";
    }
  } catch (err) {
    finalStatus.textContent = "❌ Error: " + err.message;
    finalStatus.className = "error";
  }
});

// ---------------- FIREWORKS ----------------
const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.pointerEvents = "none"; // allow clicks through canvas

function startFireworks(duration = 5000) {
  canvas.classList.remove("hidden");

  const fireworks = [];
  const particles = [];

  const isMobile = window.innerWidth <= 768;
  const particleCount = isMobile ? 15 : 30; // fewer particles on mobile

  class Firework {
    constructor(x, y, targetY) {
      this.x = x;
      this.y = y;
      this.targetY = targetY;
      this.speed = 4 + Math.random() * 4; // speed varies
      this.radius = 2;
    }
    update() {
      this.y -= this.speed;
      if (this.y <= this.targetY) {
        explode(this.x, this.y);
        return true;
      }
      return false;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#ff69b4";
      ctx.fill();
    }
  }

  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 6;
      this.vy = (Math.random() - 0.5) * 6;
      this.alpha = 1;
      this.color = color;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= 0.02;
    }
    draw() {
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function explode(x, y) {
    const colors = ["#ff69b4", "#ff1493", "#ffb6c1", "#ff4500", "#ff6347"];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(x, y, colors[Math.floor(Math.random() * colors.length)]));
    }
  }

  function animate() {
    ctx.fillStyle = "rgba(17,17,17,0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    fireworks.forEach((f, i) => {
      if (f.update()) fireworks.splice(i, 1);
      f.draw();
    });

    particles.forEach((p, i) => {
      p.update();
      p.draw();
      if (p.alpha <= 0) particles.splice(i, 1);
    });

    requestAnimationFrame(animate);
  }

  function launchFirework() {
    const startX = Math.random() * canvas.width;
    const targetY = 50 + Math.random() * (canvas.height - 100); // anywhere on screen
    fireworks.push(new Firework(startX, canvas.height, targetY));
  }

  const interval = setInterval(launchFirework, 300);
  animate();

  setTimeout(() => {
    clearInterval(interval);
    // hide canvas after fireworks
    setTimeout(() => { canvas.classList.add("hidden"); }, 2000);
  }, duration);
}
