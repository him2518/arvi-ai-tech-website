/* ---------- Year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Loader ---------- */
window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("loader").classList.add("done"), 1500);
});

/* ---------- 3D Neural-net wave ---------- */
(() => {
  const canvas = document.getElementById("neural");
  const ctx = canvas.getContext("2d");
  let w, h, nodes, dpr;
  const mouse = { x: -999, y: -999 };
  let time = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    const count = Math.min(180, Math.floor((innerWidth * innerHeight) / 8000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random() * 300 + 50, // Depth
      vx: (Math.random() - 0.5) * 0.5 * dpr,
      vy: (Math.random() - 0.5) * 0.5 * dpr,
      vz: (Math.random() - 0.5) * 0.5,
      r: (Math.random() * 2 + 0.8) * dpr,
      baseY: Math.random() * h // Base for wave
    }));
  }

  const COL = { cyan: "56,243,255", violet: "139,92,255" };

  function draw() {
    ctx.clearRect(0, 0, w, h);
    time += 0.01;
    
    // Depth sort for back-to-front rendering
    nodes.sort((a, b) => b.z - a.z);
    const fov = 400;
    
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.x += n.vx; n.baseY += n.vy; n.z += n.vz;
      
      // Vertical wave displacement
      n.y = n.baseY + Math.sin(time + n.x * 0.005) * 30 * dpr;

      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.baseY < 0 || n.baseY > h) n.vy *= -1;
      if (n.z < 50 || n.z > 350) n.vz *= -1;

      // Mouse repel in 3D
      const mdx = n.x - mouse.x, mdy = n.y - mouse.y;
      const md = Math.hypot(mdx, mdy);
      if (md < 200 * dpr && md > 0) {
        n.x += (mdx / md) * 1.5;
        n.baseY += (mdy / md) * 1.5;
      }

      // Pseudo-3D Projection
      const scale = fov / (fov + n.z);
      const projX = (n.x - w/2) * scale + w/2;
      const projY = (n.y - h/2) * scale + h/2;

      // Draw connections
      const linkDist = 180 * dpr;
      for (let j = i + 1; j < nodes.length; j++) {
        const m = nodes[j];
        const dx = n.x - m.x;
        const dy = n.y - m.y;
        const dz = n.z - m.z;
        const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        if (d < linkDist) {
          const a = (1 - d / linkDist) * 0.5 * scale;
          const mScale = fov / (fov + m.z);
          const mProjX = (m.x - w/2) * mScale + w/2;
          const mProjY = (m.y - h/2) * mScale + h/2;

          ctx.strokeStyle = `rgba(${COL.violet},${a})`;
          ctx.lineWidth = 0.8 * dpr * scale;
          ctx.beginPath();
          ctx.moveTo(projX, projY);
          ctx.lineTo(mProjX, mProjY);
          ctx.stroke();
        }
      }
      
      // Draw node point
      ctx.beginPath();
      ctx.arc(projX, projY, n.r * scale, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COL.cyan},${0.3 + 0.7 * scale})`;
      ctx.shadowBlur = 12 * dpr * scale;
      ctx.shadowColor = `rgba(${COL.cyan},0.8)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    requestAnimationFrame(draw);
  }

  addEventListener("resize", resize);
  addEventListener("mousemove", (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; });
  addEventListener("mouseout", () => { mouse.x = -999; mouse.y = -999; });
  resize();
  draw();
})();


/* ---------- Magnetic buttons ---------- */
document.querySelectorAll("[data-magnetic]").forEach((el) => {
  el.addEventListener("mousemove", (e) => {
    const r = el.getBoundingClientRect();
    const mx = e.clientX - r.left - r.width / 2;
    const my = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${mx * 0.25}px, ${my * 0.35}px)`;
  });
  el.addEventListener("mouseleave", () => (el.style.transform = ""));
});

/* ---------- 3D tilt & spotlight cards ---------- */
document.querySelectorAll(".tilt").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    card.style.transform = `perspective(800px) rotateY(${(px - 0.5) * 12}deg) rotateX(${(0.5 - py) * 12}deg) translateY(-4px)`;
    card.style.setProperty("--mx", px * 100 + "%");
    card.style.setProperty("--my", py * 100 + "%");
    card.style.setProperty("--x", (e.clientX - r.left) + "px");
    card.style.setProperty("--y", (e.clientY - r.top) + "px");
  });
  card.addEventListener("mouseleave", () => (card.style.transform = ""));
});

/* ---------- Scroll Timeline & Marquee Effects ---------- */
const timeline = document.querySelector(".timeline");
const tLineFill = document.createElement("div");
tLineFill.className = "t-line-fill";
const tLine = document.querySelector(".t-line");
if (tLine) tLine.appendChild(tLineFill);

const marquee = document.querySelector(".marquee");
let lastScrollY = window.scrollY;

addEventListener("scroll", () => {
  // Timeline fill
  if (timeline && tLineFill) {
    const r = timeline.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (window.innerHeight * 0.7 - r.top) / r.height));
    tLineFill.style.width = (progress * 100) + "%";
    
    // Light up nodes based on progress
    document.querySelectorAll(".t-step").forEach((step, i) => {
      const stepProg = i / (document.querySelectorAll(".t-step").length - 1);
      if (progress >= stepProg - 0.05) {
        step.classList.add("active");
      } else {
        step.classList.remove("active");
      }
    });
  }
  
  // Marquee skew based on velocity
  if (marquee) {
    const currentScroll = window.scrollY;
    const diff = currentScroll - lastScrollY;
    lastScrollY = currentScroll;
    const skew = Math.max(-10, Math.min(10, diff * 0.15));
    marquee.style.transform = `skewY(${skew}deg)`;
  }
});

/* ---------- Nav ---------- */
const nav = document.getElementById("nav");
addEventListener("scroll", () => {
  if (nav) nav.classList.toggle("scrolled", window.scrollY > 20);
});
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => navLinks.classList.remove("open")));
}

/* ---------- Reveal on scroll ---------- */
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }),
  { threshold: 0.12 }
);
document.querySelectorAll("[data-reveal]").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 5) * 70}ms`;
  io.observe(el);
});

/* ---------- Counters ---------- */
const cObs = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.count;
    let cur = 0; const step = Math.max(1, Math.ceil(target / 45));
    const tick = () => {
      cur = Math.min(target, cur + step);
      el.textContent = cur + "+";
      if (cur < target) requestAnimationFrame(tick);
    };
    tick(); cObs.unobserve(el);
  }),
  { threshold: 0.6 }
);
document.querySelectorAll("[data-count]").forEach((c) => cObs.observe(c));

/* ---------- Headline rotator ---------- */
(() => {
  const el = document.getElementById("rotator");
  const words = ["intelligent games", "AI agents", "generative tools", "smart systems", "winning products"];
  let wi = 0, ci = 0, deleting = false;
  function type() {
    const word = words[wi];
    el.textContent = word.slice(0, ci);
    if (!deleting && ci < word.length) { ci++; setTimeout(type, 90); }
    else if (!deleting && ci === word.length) { deleting = true; setTimeout(type, 1600); }
    else if (deleting && ci > 0) { ci--; setTimeout(type, 45); }
    else { deleting = false; wi = (wi + 1) % words.length; setTimeout(type, 280); }
  }
  type();
})();

/* ---------- Contact form ---------- */
const form = document.getElementById("contactForm");
const note = document.getElementById("formNote");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!form.checkValidity()) { form.reportValidity(); return; }
  
  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;
  btn.innerHTML = "Transmitting... <span>→</span>";
  btn.disabled = true;

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      note.hidden = false;
      note.style.color = "var(--cyan)";
      note.textContent = "✦ Message received successfully! We will be in touch.";
      btn.innerHTML = "Sent ✦";
      setTimeout(() => {
        form.reset();
        btn.innerHTML = originalText;
        btn.disabled = false;
        note.hidden = true;
      }, 5000);
    } else {
      throw new Error("Server rejected request");
    }
  } catch (err) {
    note.hidden = false;
    note.style.color = "var(--pink)";
    note.textContent = "✦ Error sending message. Please try again or email us directly.";
    btn.innerHTML = "Error ✦";
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 3000);
  }
});

/* ---------- App Launch Popup ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('appLaunchPopup');
  const closeBtn = document.getElementById('closeAppPopup');
  
  if (!popup || !closeBtn) return;
  
  // Check if it's already been shown in this session
  if (!sessionStorage.getItem('arrowPopupShown')) {
    // Show popup after 2.5 seconds
    setTimeout(() => {
      popup.classList.add('active');
      sessionStorage.setItem('arrowPopupShown', 'true');
    }, 2500);
  }

  // Close when clicking the X button
  closeBtn.addEventListener('click', () => {
    popup.classList.remove('active');
  });

  // Close when clicking outside the modal content
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      popup.classList.remove('active');
    }
  });
});
