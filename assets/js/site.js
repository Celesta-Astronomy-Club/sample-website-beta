/* ==========================================================================
   CELESTA | shared script (every page loads this file)

   1. SETTINGS ......... links, navigation, numbers. Edit these, nothing else.
   2. Layout ........... builds the header and footer so they are identical on
                         every page and only need changing once.
   3. Effects .......... star field, cursor, scrolling text, glass light.
   4. Pop-up cards ..... any element marked data-modal opens as a pop-up.
   ========================================================================== */


/* 1. SETTINGS ------------------------------------------------------------- */

const SITE = {
  name: "Celesta",
  tagline: "Astronomy, Technology and Access",
  founded: 2025,

  // Pages in the navigation. "id" must match <body data-page="..."> on that page.
  // An item with "children" becomes a dropdown on large screens.
  nav: [
    { id: "home", label: "Home", href: "index.html" },
    { id: "about", label: "About", href: "about.html", children: [
      { id: "about",   label: "About us", href: "about.html" },
      { id: "members", label: "Members",  href: "members.html" },
    ] },
    { id: "events",  label: "Events",  href: "events.html" },
    { id: "blog",    label: "Blog",    href: "blog.html" },
    { id: "magazine", label: "Magazine", href: "magazine.html" },
    { id: "constitution", label: "Dashboard", href: "constitution.html", lock: true, children: [
      { id: "constitution", label: "Dashboard", href: "constitution.html", lock: true },
      { id: "admin", label: "Admin Portal", href: "admin.html", lock: true, footer: false },
    ] },
    { id: "contact", label: "Contact", href: "contact.html" },
  ],

  // Paste full web addresses between the quotes.
  // Anything left empty ("") is hidden everywhere it appears, so nothing breaks.
  links: {
    discord:    "https://disboard.org/server/1425502035800883304",
    instagram:  "https://www.instagram.com/celestaastronomy/",
    youtube:    "https://www.youtube.com/@CelestaAstronomyClub",
    linkedin:   "https://www.linkedin.com/company/celestaclub/",
    devpost:    "https://celesta-exoplanet-challenge.devpost.com/",  // swap in your Devpost profile if you have one
    celestagpt: "https://celestagpt.carrd.co",
    exoplanet:  "https://celesta-exoplanet-challenge.devpost.com/",  // "Know more" on the Events page
    blog:       "https://www.blogger.com",                           // "More blogs" button: your blog's address
    internship: "https://forms.gle/NvyiH7amfoEnEa2b7",                          // "Apply now" on the Members page: your form
    email:      "celestaclub@gmail.com",                             // address only, no mailto:
  },

  // Club IDs that open the Constitution page. One per line, in quotes, with a comma after each.
  // To add someone, add a line. To remove someone, delete their line.
  // Capital letters do not matter when a member types their ID.
  // Note: this keeps casual visitors out. It is not real security, because anyone who views the
  // page source can see this list. Do not put anything sensitive on the Constitution page.
  clubIds: [
    "AradhyaHaldikar123",
    "MrunalSayam456",
    "ArnavVenkatesh789",
  ],

  // Numbers used in the page text. Change them here and every page updates.
  discord: { members: "88", asOf: "August 2026" },

  // Effects. Set to false to switch one off.
  effects: { stars: true, cursor: true },
};


/* 2. Layout --------------------------------------------------------------- */

const ICON_CHEVRON = '<svg viewBox="0 0 8 14" fill="none" aria-hidden="true"><path d="M1 1l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_DOWN = '<svg viewBox="0 0 9 6" fill="none" aria-hidden="true"><path d="M1 1l3.5 3.5L8 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const ICON_LOCK = '<svg class="lock-icon" viewBox="0 0 11 13" fill="none" aria-hidden="true"><rect x="1" y="5.5" width="9" height="7" rx="2" fill="currentColor"/><path d="M3 5.5V4a2.5 2.5 0 0 1 5 0v1.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg><span class="sr-only"> (members only)</span>';

// Every page in one flat list (dropdown children included). Used by the phone menu and the footer.
const flatNav = () => SITE.nav.flatMap((n) => (n.children ? n.children : [n]));

function renderHeader() {
  const host = document.querySelector('[data-layout="header"]');
  if (!host) return;
  const page = document.body.dataset.page;
  const link = (n) => `<a href="${n.href}"${n.id === page ? ' aria-current="page"' : ""}>${n.label}${n.lock ? ICON_LOCK : ""}</a>`;

  const desktopItem = (n) => {
    if (!n.children) return `<li>${link(n)}</li>`;
    const current = n.id === page || n.children.some((c) => c.id === page);
    return `
      <li class="has-sub${current ? " is-current" : ""}">
        <a href="${n.href}">${n.label}${n.lock ? ICON_LOCK : ""}${ICON_DOWN}</a>
        <ul class="subnav glass">${n.children.map((c) => `<li>${link(c)}</li>`).join("")}</ul>
      </li>`;
  };

  host.className = "site-header";
  host.innerHTML = `
    <nav class="nav glass" aria-label="Main">
      <a class="nav-brand" href="index.html" aria-label="${SITE.name} home">
        <img src="assets/img/bannerlogo_transparent.png" alt="${SITE.name}" width="124" height="30">
      </a>
      <ul class="nav-links">${SITE.nav.map(desktopItem).join("")}</ul>
      <a class="btn btn-primary btn-sm nav-cta" data-link="discord" href="#">Join the Discord</a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-sheet">
        <span class="sr-only">Menu</span><i></i><i></i>
      </button>
    </nav>
    <div class="nav-sheet glass" id="nav-sheet">
      <ul>${flatNav().filter((n) => !n.href.includes("#")).map((n) => `<li>${link(n)}</li>`).join("")}</ul>
      <a class="btn btn-primary" data-link="discord" href="#">Join the Discord</a>
    </div>`;
}

function renderFooter() {
  const host = document.querySelector('[data-layout="footer"]');
  if (!host) return;
  const social = [
    ["discord", "Discord"], ["youtube", "YouTube"], ["instagram", "Instagram"],
    ["linkedin", "LinkedIn"], ["devpost", "Devpost"],
  ];

  host.className = "site-footer";
  host.innerHTML = `
    <div class="wrap footer-grid">
      <div class="footer-brand">
        <img src="assets/img/bannerlogo_transparent.png" alt="${SITE.name}" width="141" height="34">
        <p>${SITE.tagline}</p>
      </div>
      <nav class="footer-pages" aria-label="Pages">
        <h2>Pages</h2>
        <ul>${flatNav().filter((n) => n.footer !== false && !n.href.includes("#")).map((n) => `<li><a href="${n.href}">${n.footerLabel || n.label}</a></li>`).join("")}</ul>
      </nav>
      <nav class="footer-community" aria-label="Community">
        <h2>Community</h2>
        <ul>${social.map(([key, label]) => `<li><a data-link="${key}" href="#">${label}</a></li>`).join("")}</ul>
      </nav>
    </div>
    <div class="wrap footer-base">
      <p>&copy; ${new Date().getFullYear()} ${SITE.name}. Founded in ${SITE.founded}.</p>
    </div>`;
}

// Fills in every [data-link="name"] with the address from SETTINGS, and every
// [data-site="members"] style placeholder with its number.
function bindContent() {
  document.querySelectorAll("[data-link]").forEach((el) => {
    const key = el.dataset.link;
    const value = (SITE.links[key] || "").trim();
    if (!value) { (el.closest("li") || el).hidden = true; return; }
    el.href = key === "email" ? "mailto:" + value : value;
    if (/^https?:/i.test(value)) { el.target = "_blank"; el.rel = "noopener"; }
  });

  document.querySelectorAll("[data-site]").forEach((el) => {
    const map = { members: SITE.discord.members, membersDate: SITE.discord.asOf };
    if (map[el.dataset.site] != null) el.textContent = map[el.dataset.site];
  });
}

function initNav() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const toggle = header.querySelector(".nav-toggle");
  const setOpen = (open) => {
    header.dataset.open = open ? "true" : "false";
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", () => setOpen(header.dataset.open !== "true"));
  header.querySelectorAll(".nav-sheet a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  document.addEventListener("click", (e) => { if (!header.contains(e.target)) setOpen(false); });

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}


/* 3. Effects -------------------------------------------------------------- */

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
let cursorEl = null; // the custom pointer, once it exists

/* Star field. Positions are seeded, so the sky looks the same on every page. */
function initStars() {
  if (!SITE.effects.stars) return;

  const canvas = document.createElement("canvas");
  canvas.className = "sky";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");

  const seeded = (seed) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  let W = 0, H = 0, stars = [], mx = 0, my = 0;
  let constellationMode = false;

  const CONSTELLATIONS = [
    {
      name: "ORION",
      sub: "The Hunter",
      stars: [
        { id: "bet", name: "Betelgeuse", x: 0.28, y: 0.32, color: "255,160,110", r: 2.8 },
        { id: "bel", name: "Bellatrix", x: 0.37, y: 0.30, color: "200,225,255", r: 2.2 },
        { id: "aln", name: "Alnitak", x: 0.31, y: 0.41, color: "210,230,255", r: 2.0 },
        { id: "alm", name: "Alnilam", x: 0.33, y: 0.415, color: "210,230,255", r: 2.1 },
        { id: "min", name: "Mintaka", x: 0.35, y: 0.42, color: "210,230,255", r: 2.0 },
        { id: "sai", name: "Saiph", x: 0.30, y: 0.52, color: "210,230,255", r: 2.1 },
        { id: "rig", name: "Rigel", x: 0.38, y: 0.50, color: "185,215,255", r: 2.8 }
      ],
      lines: [
        ["bet", "bel"], ["bet", "aln"], ["bel", "min"],
        ["aln", "alm"], ["alm", "min"], ["aln", "sai"], ["min", "rig"]
      ],
      label: { x: 0.33, y: 0.26 }
    },
    {
      name: "URSA MAJOR",
      sub: "Big Dipper / Saptarishi",
      stars: [
        { id: "dub", name: "Dubhe", x: 0.70, y: 0.22, color: "255,230,190", r: 2.4 },
        { id: "mer", name: "Merak", x: 0.69, y: 0.28, color: "215,235,255", r: 2.2 },
        { id: "phe", name: "Phecda", x: 0.76, y: 0.29, color: "215,235,255", r: 2.1 },
        { id: "meg", name: "Megrez", x: 0.77, y: 0.23, color: "215,235,255", r: 1.9 },
        { id: "ali", name: "Alioth", x: 0.82, y: 0.21, color: "215,235,255", r: 2.3 },
        { id: "miz", name: "Mizar", x: 0.86, y: 0.18, color: "215,235,255", r: 2.2 },
        { id: "alk", name: "Alkaid", x: 0.90, y: 0.19, color: "190,215,255", r: 2.4 }
      ],
      lines: [
        ["dub", "mer"], ["mer", "phe"], ["phe", "meg"], ["meg", "dub"],
        ["meg", "ali"], ["ali", "miz"], ["miz", "alk"]
      ],
      label: { x: 0.78, y: 0.16 }
    },
    {
      name: "CASSIOPEIA",
      sub: "The Queen's W",
      stars: [
        { id: "cap", name: "Caph", x: 0.12, y: 0.16, color: "255,240,210", r: 2.2 },
        { id: "sch", name: "Schedar", x: 0.15, y: 0.20, color: "255,210,160", r: 2.4 },
        { id: "nav", name: "Navi", x: 0.18, y: 0.17, color: "200,225,255", r: 2.5 },
        { id: "ruc", name: "Ruchbah", x: 0.21, y: 0.22, color: "215,235,255", r: 2.2 },
        { id: "seg", name: "Segin", x: 0.24, y: 0.19, color: "200,220,255", r: 2.0 }
      ],
      lines: [
        ["cap", "sch"], ["sch", "nav"], ["nav", "ruc"], ["ruc", "seg"]
      ],
      label: { x: 0.18, y: 0.11 }
    },
    {
      name: "CYGNUS",
      sub: "The Northern Cross",
      stars: [
        { id: "den", name: "Deneb", x: 0.52, y: 0.60, color: "215,235,255", r: 2.6 },
        { id: "sad", name: "Sadr", x: 0.52, y: 0.69, color: "255,240,220", r: 2.2 },
        { id: "alb", name: "Albireo", x: 0.52, y: 0.79, color: "255,190,110", r: 2.3 },
        { id: "gie", name: "Gienah", x: 0.46, y: 0.67, color: "210,230,255", r: 2.1 },
        { id: "faw", name: "Fawaris", x: 0.58, y: 0.71, color: "210,230,255", r: 2.1 }
      ],
      lines: [
        ["den", "sad"], ["sad", "alb"], ["gie", "sad"], ["sad", "faw"]
      ],
      label: { x: 0.52, y: 0.56 }
    },
    {
      name: "CANIS MAJOR",
      sub: "The Great Dog",
      stars: [
        { id: "sir", name: "Sirius", x: 0.76, y: 0.60, color: "220,240,255", r: 3.2 },
        { id: "mur", name: "Murzim", x: 0.72, y: 0.64, color: "200,225,255", r: 2.2 },
        { id: "mul", name: "Muliphein", x: 0.80, y: 0.63, color: "210,230,255", r: 1.8 },
        { id: "wez", name: "Wezen", x: 0.78, y: 0.73, color: "255,230,190", r: 2.3 },
        { id: "adh", name: "Adhara", x: 0.75, y: 0.79, color: "200,225,255", r: 2.4 },
        { id: "alu", name: "Aludra", x: 0.82, y: 0.81, color: "210,230,255", r: 2.1 }
      ],
      lines: [
        ["sir", "mur"], ["sir", "mul"], ["sir", "wez"], ["wez", "adh"], ["wez", "alu"], ["adh", "alu"]
      ],
      label: { x: 0.76, y: 0.55 }
    },
    {
      name: "TAURUS",
      sub: "The Bull",
      stars: [
        { id: "ald", name: "Aldebaran", x: 0.18, y: 0.72, color: "255,160,110", r: 2.8 },
        { id: "eln", name: "Elnath", x: 0.24, y: 0.62, color: "205,225,255", r: 2.2 },
        { id: "tia", name: "Tianguan", x: 0.22, y: 0.76, color: "210,230,255", r: 2.0 },
        { id: "hya", name: "Hyadum", x: 0.14, y: 0.71, color: "255,230,190", r: 2.0 },
        { id: "ain", name: "Ain", x: 0.15, y: 0.67, color: "255,235,210", r: 2.1 },
        { id: "ple", name: "Pleiades", x: 0.10, y: 0.63, color: "190,220,255", r: 2.5 }
      ],
      lines: [
        ["ald", "eln"], ["ald", "tia"], ["ald", "hya"], ["hya", "ain"], ["ain", "ald"], ["ain", "ple"]
      ],
      label: { x: 0.17, y: 0.58 }
    }
  ];

  function build() {
    const rnd = seeded(2025);
    const count = Math.min(240, Math.round((W * H) / 8200));
    stars = Array.from({ length: count }, () => {
      const z = rnd();                 // 0 = far away, 1 = close
      const bright = rnd() > 0.94;
      const tint = rnd();
      return {
        x: rnd() * W, y: rnd() * H, z,
        r: bright ? 1.15 + z * 0.8 : 0.4 + z * 0.75,
        a: bright ? 0.95 : 0.26 + z * 0.5,
        c: tint < 0.12 ? "185,203,239" : tint > 0.92 ? "242,217,180" : "234,230,218",
        glow: bright,
        phase: rnd() * 6.283, speed: 0.35 + rnd() * 0.9,
      };
    });
  }

  // Random Meteor Shower State
  let meteors = [];
  let nextMeteorTime = 0;

  function spawnMeteor(now) {
    if (REDUCED) return;
    const angle = Math.PI * (0.68 + Math.random() * 0.14); // ~30-40 deg trajectory
    const speed = 14 + Math.random() * 9;
    meteors.push({
      x: W * 0.2 + Math.random() * W * 0.9,
      y: Math.random() * H * 0.45,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len: 70 + Math.random() * 70,
      life: 1.0,
      decay: 0.016 + Math.random() * 0.016,
      size: 1.1 + Math.random() * 0.9
    });
    // Intermittent interval: 3.5s to 7.5s, with occasional 1.5s burst
    nextMeteorTime = now + (Math.random() < 0.25 ? 1400 : 3800 + Math.random() * 4200);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mx = W / 2; my = H / 2;
    build();
    draw(0);
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const sy = REDUCED ? 0 : window.scrollY;
    for (const s of stars) {
      // Nearer stars drift further as the page scrolls and the pointer moves.
      const y = (((s.y - sy * (0.015 + s.z * 0.085)) % H) + H) % H;
      const x = s.x + (REDUCED ? 0 : (mx - W / 2) * s.z * 0.012);
      const twinkle = REDUCED ? 1 : 0.8 + 0.2 * Math.sin(t * 0.001 * s.speed + s.phase);
      const a = s.a * twinkle;
      if (s.glow) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, s.r * 7);
        g.addColorStop(0, `rgba(${s.c},${a * 0.32})`);
        g.addColorStop(1, `rgba(${s.c},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, s.r * 7, 0, 6.283); ctx.fill();
      }
      ctx.fillStyle = `rgba(${s.c},${a})`;
      ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.283); ctx.fill();
    }

    // Render Random Meteor Shower in background
    if (t > nextMeteorTime) {
      spawnMeteor(t);
    }
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx;
      m.y += m.vy;
      m.life -= m.decay;
      if (m.life <= 0 || m.x < -100 || m.y > H + 100) {
        meteors.splice(i, 1);
        continue;
      }
      const dist = Math.hypot(m.vx, m.vy) || 1;
      const tailX = m.x - (m.vx / dist) * m.len;
      const tailY = m.y - (m.vy / dist) * m.len;

      const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
      grad.addColorStop(0, "rgba(255, 255, 255, 0)");
      grad.addColorStop(0.7, `rgba(220, 240, 255, ${m.life * 0.35})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${m.life * 0.85})`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = m.size;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(m.x, m.y);
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 255, 255, ${m.life * 0.9})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render Constellations when active (subtle, quiet, no star text clutter)
    if (constellationMode) {
      const syConst = REDUCED ? 0 : window.scrollY * 0.04;
      const maxLineDist = Math.min(W, H) * 0.35;

      const drawConstellation = (c, anchorY, renderCY) => {
        const starPos = {};
        c.stars.forEach((st) => {
          const sx = st.x * W;
          const sy = renderCY + (st.y - anchorY) * H;
          starPos[st.id] = { x: sx, y: sy, color: st.color, r: st.r };
        });

        // Connecting lines: subtle faint white, no neon blue
        ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        c.lines.forEach(([id1, id2]) => {
          const p1 = starPos[id1];
          const p2 = starPos[id2];
          if (p1 && p2) {
            // Guard against edge wrap stretching
            if (Math.hypot(p1.x - p2.x, p1.y - p2.y) <= maxLineDist) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        });
        ctx.setLineDash([]);

        // Star Nodes: subtle solid points, no star text labels
        Object.values(starPos).forEach((p) => {
          if (p.y >= -30 && p.y <= H + 30) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(1.5, p.r * 0.8), 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Constellation Name: understated standard UI font, soft opacity
        const lx = c.label.x * W;
        const ly = renderCY + (c.label.y - anchorY) * H;
        if (ly >= -20 && ly <= H + 20) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
          ctx.font = "500 9px Inter, -apple-system, BlinkMacSystemFont, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(c.name, lx, ly);
        }
      };

      CONSTELLATIONS.forEach((c) => {
        // Compute centroid anchor of the constellation
        let sumY = 0;
        c.stars.forEach((st) => { sumY += st.y; });
        const anchorY = sumY / c.stars.length;

        // Move constellation as a single rigid body
        const cy = (((anchorY * H - syConst) % H) + H) % H;

        // Draw primary instance
        drawConstellation(c, anchorY, cy);

        // Seamless wrap at top and bottom boundaries without splitting stars
        if (cy < 220) {
          drawConstellation(c, anchorY, cy + H);
        } else if (cy > H - 220) {
          drawConstellation(c, anchorY, cy - H);
        }
      });
    }
  }

  let running = false;
  function loop(t) {
    if (document.hidden) { running = false; return; }
    draw(t);
    requestAnimationFrame(loop);
  }
  function start() { if (!running && !REDUCED) { running = true; requestAnimationFrame(loop); } }

  // Constellation Mode Toggle Button (Top Right Corner with Constellation SVG Logo)
  const cBtn = document.createElement("button");
  cBtn.type = "button";
  cBtn.className = "constellation-toggle glass";
  cBtn.id = "btn-constellation-mode";
  cBtn.setAttribute("aria-label", "Toggle Constellations");
  cBtn.innerHTML = `
    <span class="constellation-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
        <circle cx="5" cy="6" r="1.8" fill="currentColor"/>
        <circle cx="12" cy="4" r="1.8" fill="currentColor"/>
        <circle cx="19" cy="9" r="1.8" fill="currentColor"/>
        <circle cx="14" cy="18" r="1.8" fill="currentColor"/>
        <circle cx="7" cy="15" r="1.8" fill="currentColor"/>
        <line x1="5" y1="6" x2="12" y2="4"/>
        <line x1="12" y1="4" x2="19" y2="9"/>
        <line x1="19" y1="9" x2="14" y2="18"/>
        <line x1="14" y1="18" x2="7" y2="15"/>
        <line x1="7" y1="15" x2="5" y2="6"/>
      </svg>
    </span>
    <span class="constellation-label" id="constellation-tip">Constellations: Off</span>
  `;
  document.body.appendChild(cBtn);

  cBtn.addEventListener("click", () => {
    constellationMode = !constellationMode;
    cBtn.classList.toggle("is-active", constellationMode);
    const tip = cBtn.querySelector("#constellation-tip");
    if (tip) tip.textContent = constellationMode ? "Constellations: On" : "Constellations: Off";
    draw(0);
  });

  resize();
  let resizeTimer;
  window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 120); });
  window.addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  document.addEventListener("visibilitychange", start);
  if (REDUCED) window.addEventListener("scroll", () => draw(0), { passive: true });
  start();
}

/* Pointer. A small dot that wraps itself around buttons and links, like the
   pointer on an iPad. Over a large card it becomes a ring. Mouse and trackpad only. */
function initCursor() {
  if (!SITE.effects.cursor) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const root = document.documentElement;
  const dot = document.createElement("div");
  dot.className = "cursor";
  dot.setAttribute("aria-hidden", "true");
  document.body.appendChild(dot);
  cursorEl = dot;

  const HOVER = 'a[href], button, summary, [role="button"], [data-cursor]';
  const TEXT = 'input, textarea, select, [contenteditable="true"]';
  const MAGNET = ".btn, .nav-links a";

  let px = -100, py = -100;                 // where the pointer really is
  let x = px, y = py, w = 10, h = 10, r = 5; // what is drawn
  let target = null, targetRadius = 0, shown = false;
  let tx = 0, ty = 0;                        // current magnet offset of the target

  function setTarget(next) {
    if (next === target) return;
    if (target) { target.style.translate = ""; }
    target = next; tx = 0; ty = 0;
    if (target) targetRadius = parseFloat(getComputedStyle(target).borderTopLeftRadius) || 0;
  }

  function onMove(e) {
    px = e.clientX; py = e.clientY;
    if (!shown) { shown = true; x = px; y = py; root.classList.add("cursor-on"); dot.classList.add("on"); }
    const el = e.target instanceof Element ? e.target : null;
    const typing = !!(el && el.closest(TEXT));
    dot.classList.toggle("hide", typing);

    let hit = !typing && el ? el.closest(HOVER) : null;
    if (hit) hit = hit.closest("[data-cursor-area]") || hit; // cards count as one target
    setTarget(hit);

    if (target && target.matches(MAGNET) && !REDUCED) {
      const b = target.getBoundingClientRect();
      const cx = b.left - tx + b.width / 2, cy = b.top - ty + b.height / 2;
      tx = clamp((px - cx) * 0.12, -6, 6);
      ty = clamp((py - cy) * 0.2, -5, 5);
      target.style.translate = `${tx}px ${ty}px`;
    }
  }

  function frame() {
    let gx = px, gy = py, gw = 10, gh = 10, gr = 5, morph = false, ring = false;

    if (target && target.isConnected) {
      const b = target.getBoundingClientRect();
      if (b.width < 720 && b.height < 120) {
        const pad = 7;
        gw = b.width + pad * 2; gh = b.height + pad * 2;
        gx = b.left + b.width / 2 + (px - (b.left + b.width / 2)) * 0.08;
        gy = b.top + b.height / 2 + (py - (b.top + b.height / 2)) * 0.14;
        gr = Math.min(gh / 2, targetRadius + pad);
        morph = true;
      } else { gw = gh = 34; gr = 17; ring = true; }
    }

    const k = REDUCED ? 1 : 0.24;
    x += (gx - x) * k; y += (gy - y) * k;
    w += (gw - w) * k; h += (gh - h) * k; r += (gr - r) * k;

    dot.style.width = w + "px"; dot.style.height = h + "px";
    dot.style.borderRadius = r + "px";
    dot.style.transform = `translate3d(${x - w / 2}px, ${y - h / 2}px, 0)`;
    dot.classList.toggle("morph", morph);
    dot.classList.toggle("ring", ring);
    requestAnimationFrame(frame);
  }

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", () => dot.classList.add("down"));
  window.addEventListener("pointerup", () => dot.classList.remove("down"));
  document.documentElement.addEventListener("mouseleave", () => { dot.classList.remove("on"); setTarget(null); });
  document.documentElement.addEventListener("mouseenter", () => { if (shown) dot.classList.add("on"); });
  requestAnimationFrame(frame);
}

/* Statement text. Words light up one by one as the paragraph scrolls through
   the screen. Add data-scrub to any paragraph to use it. */
function initScrub() {
  document.querySelectorAll("[data-scrub]").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    const spans = words.map((word) => {
      const s = document.createElement("span");
      s.className = "w";
      s.textContent = word + " ";
      el.appendChild(s);
      return s;
    });
    if (REDUCED) { spans.forEach((s) => (s.style.opacity = 1)); return; }

    const n = spans.length, spread = 7;
    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = el.getBoundingClientRect();
      const start = window.innerHeight * 0.86, end = window.innerHeight * 0.42;
      const p = clamp((start - rect.top) / (rect.height + (start - end)), 0, 1);
      spans.forEach((s, i) => {
        const t = clamp((p * (n + spread) - i) / spread, 0, 1);
        s.style.opacity = (0.2 + 0.8 * t).toFixed(3);
      });
    };
    const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    update();
  });
}

/* Glass light. Elements with class "glass spot" get a soft highlight that
   follows the pointer. */
function initGlassLight() {
  document.addEventListener("pointermove", (e) => {
    const el = e.target instanceof Element ? e.target.closest(".spot") : null;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", e.clientX - r.left + "px");
    el.style.setProperty("--my", e.clientY - r.top + "px");
  }, { passive: true });
}

/* Orbit animations pause for people who ask for less motion. */
function initOrbits() {
  if (!REDUCED) return;
  document.querySelectorAll("svg.orbits").forEach((svg) => svg.pauseAnimations && svg.pauseAnimations());
}


/* 4. Pop-up cards ---------------------------------------------------------- */

/* Any element with data-modal opens as a pop-up when it is clicked. Inside it:
     [data-modal-title]  required. The pop-up heading, usually the card's own button.
     [data-modal-kind]   optional. A small line above the heading.
     [data-modal-media]  optional. A picture or graphic, copied to the top of the pop-up.
     [data-modal-more]   optional. Hidden extra content shown in the pop-up.
   Close with the cross, the Esc key, or a click outside the pop-up. */
function initModals() {
  const cards = document.querySelectorAll("[data-modal]");
  if (!cards.length) return;

  const dialog = document.createElement("dialog");
  dialog.className = "modal";
  dialog.setAttribute("aria-labelledby", "modal-title");
  dialog.innerHTML = `
    <div class="modal-panel glass">
      <button class="modal-close" type="button" aria-label="Close">
        <svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
      </button>
      <div class="modal-scroll">
        <div class="modal-media"></div>
        <div class="modal-text">
          <p class="modal-kind"></p>
          <h2 class="modal-title" id="modal-title"></h2>
          <div class="modal-body"></div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(dialog);

  const root = document.documentElement;
  const panel = dialog.querySelector(".modal-panel");
  const scroller = dialog.querySelector(".modal-scroll");
  const mediaEl = dialog.querySelector(".modal-media");
  const kindEl = dialog.querySelector(".modal-kind");
  const titleEl = dialog.querySelector(".modal-title");
  const bodyEl = dialog.querySelector(".modal-body");
  let closing = false;

  function fill(card) {
    const find = (selector) => card.querySelector(selector);
    const title = find("[data-modal-title]"), kind = find("[data-modal-kind]");
    const media = find("[data-modal-media]"), more = find("[data-modal-more]");

    dialog.dataset.variant = card.dataset.modal || "";
    titleEl.textContent = title ? title.textContent.trim() : "";
    kindEl.textContent = kind ? kind.textContent.trim() : "";
    kindEl.hidden = !kind;

    mediaEl.replaceChildren();
    if (media) {
      const copy = media.cloneNode(true);
      copy.removeAttribute("data-modal-media");
      mediaEl.appendChild(copy);
    }
    mediaEl.hidden = !media;

    bodyEl.replaceChildren();
    if (more) more.childNodes.forEach((node) => bodyEl.appendChild(node.cloneNode(true)));
  }

  function open(card) {
    fill(card);
    const box = card.getBoundingClientRect();
    dialog.showModal();
    root.classList.add("modal-open");
    scroller.scrollTop = 0;
    // The pop-up grows out of the card that was clicked.
    panel.style.transformOrigin =
      `${box.left + box.width / 2 - panel.offsetLeft}px ${box.top + box.height / 2 - panel.offsetTop}px`;
    if (cursorEl) dialog.appendChild(cursorEl); // keep the custom pointer above the pop-up
  }

  function close() {
    if (closing || !dialog.open) return;
    closing = true;
    dialog.classList.add("is-closing");
    setTimeout(() => {
      dialog.close();
      dialog.classList.remove("is-closing");
      root.classList.remove("modal-open");
      if (cursorEl) document.body.appendChild(cursorEl);
      closing = false;
    }, REDUCED ? 0 : 230);
  }

  cards.forEach((card) => {
    card.addEventListener("click", (e) => { if (!e.target.closest("a")) open(card); });
  });
  dialog.querySelector(".modal-close").addEventListener("click", close);
  dialog.addEventListener("click", (e) => { if (e.target === dialog) close(); });
  dialog.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
}

/* 5. Site Assistant ------------------------------------------------------- */

function initSiteAssistant() {
  const QA = {
    about: {
      title: "About Celesta",
      text: "Celesta is an astronomy-focused organization built around education, research, technical projects, outreach and hands-on STEM learning.",
      link: "about.html",
      label: "About Celesta →"
    },
    sky: {
      title: "The Sky Tonight",
      text: "Real-time astronomical ephemerides, lunar illumination percentage, and planetary observing guide computed client-side.",
      link: "index.html#sky-tonight",
      label: "View Sky Tonight →"
    },
    intern: {
      title: "Internship Program",
      text: "Our research and software internship operates on rolling admissions for students passionate about contributing to computational space science.",
      link: "https://forms.gle/NvyiH7amfoEnEa2b7",
      label: "Apply for Internship →"
    },
    gpt: {
      title: "CelestaGPT AI",
      text: "A specialized AI assistant and astronomy mentor, built to make space science engaging and accessible worldwide.",
      link: "https://celestagpt.carrd.co",
      label: "Try CelestaGPT ↗"
    },
    portal: {
      title: "Dashboard",
      text: "Celesta members can access their verified credential badge, the official constitution, and archived minutes of meetings.",
      link: "constitution.html",
      label: "Open Dashboard →"
    },
    contact: {
      title: "Contact & Discord",
      text: "Join our active Discord community of stargazers and researchers, or reach out directly to the club leads.",
      link: "contact.html",
      label: "Contact Team →"
    }
  };

  const wrap = document.createElement("div");
  wrap.className = "site-assistant-root";
  wrap.innerHTML = `
    <button type="button" class="assistant-trigger glass" id="btn-assistant-trigger" aria-label="Open Celesta Guide" title="Celesta Quick Guide">
      <svg class="assistant-sparkle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor" fill-opacity="0.2"/>
        <path d="M19 16L19.8 18.6L22.4 19.4L19.8 20.2L19 22.8L18.2 20.2L15.6 19.4L18.2 18.6L19 16Z" fill="currentColor" fill-opacity="0.2"/>
        <path d="M5 4L5.6 5.8L7.4 6.4L5.6 7L5 8.8L4.4 7L2.6 6.4L4.4 5.8L5 4Z" fill="currentColor" fill-opacity="0.2"/>
      </svg>
      <span class="assistant-trigger-label">Guide</span>
    </button>

    <div class="assistant-panel glass" id="assistant-panel" hidden role="dialog" aria-modal="true" aria-label="Celesta Guide">
      <div class="assistant-panel-head">
        <div class="assistant-title-group">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16">
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/>
          </svg>
          <span class="assistant-title">Celesta Guide</span>
        </div>
        <button type="button" class="assistant-close-btn" id="btn-assistant-close" aria-label="Close Guide">✕</button>
      </div>

      <p class="assistant-prompt">Select a topic for instant guidance:</p>
      <div class="assistant-chips">
        <button type="button" class="assistant-chip is-active" data-topic="about">What is Celesta?</button>
        <button type="button" class="assistant-chip" data-topic="sky">Sky Tonight</button>
        <button type="button" class="assistant-chip" data-topic="intern">Internships</button>
        <button type="button" class="assistant-chip" data-topic="gpt">CelestaGPT</button>
        <button type="button" class="assistant-chip" data-topic="portal">Dashboard</button>
        <button type="button" class="assistant-chip" data-topic="contact">Contact</button>
      </div>

      <div class="assistant-answer" id="assistant-answer-box">
        <h4 id="assistant-ans-title">${QA.about.title}</h4>
        <p id="assistant-ans-text">${QA.about.text}</p>
        <a id="assistant-ans-link" class="btn btn-primary btn-sm" href="${QA.about.link}">${QA.about.label}</a>
      </div>
    </div>
  `;

  document.body.appendChild(wrap);

  const trigger = wrap.querySelector("#btn-assistant-trigger");
  const panel = wrap.querySelector("#assistant-panel");
  const closeBtn = wrap.querySelector("#btn-assistant-close");
  const chips = wrap.querySelectorAll(".assistant-chip");
  const ansTitle = wrap.querySelector("#assistant-ans-title");
  const ansText = wrap.querySelector("#assistant-ans-text");
  const ansLink = wrap.querySelector("#assistant-ans-link");

  function setTopic(key) {
    const item = QA[key];
    if (!item) return;
    chips.forEach((c) => c.classList.toggle("is-active", c.dataset.topic === key));
    if (ansTitle) ansTitle.textContent = item.title;
    if (ansText) ansText.textContent = item.text;
    if (ansLink) {
      ansLink.href = item.link;
      ansLink.textContent = item.label;
      if (/^https?:/i.test(item.link)) {
        ansLink.target = "_blank";
        ansLink.rel = "noopener";
      } else {
        ansLink.removeAttribute("target");
        ansLink.removeAttribute("rel");
      }
    }
  }

  function toggleOpen() {
    const isHidden = panel.hidden;
    panel.hidden = !isHidden;
    trigger.setAttribute("aria-expanded", String(isHidden));
  }

  trigger.addEventListener("click", toggleOpen);
  if (closeBtn) closeBtn.addEventListener("click", () => {
    panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  });

  chips.forEach((chip) => {
    chip.addEventListener("click", () => setTopic(chip.dataset.topic));
  });

  window.addEventListener("keydown", (e) => {
    if (!panel.hidden && e.key === "Escape") {
      panel.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    }
  });
}


/* Start ------------------------------------------------------------------- */

renderHeader();
renderFooter();
bindContent();
initNav();
initScrub();
initGlassLight();
initOrbits();
initStars();
initCursor();
initModals();
initSiteAssistant();
