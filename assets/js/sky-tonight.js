/* ==========================================================================
   CELESTA | Sky Tonight & Celestial Engine
   Calculates live lunar phase, planetary ephemerides, and celestial countdowns
   completely client-side with zero external API calls.
   ========================================================================== */

(() => {
  function initSkyTonight() {
    const root = document.querySelector("[data-sky-tonight]");
    if (!root) return;

    // 1. Lunar Phase Engine
    updateMoonPhase();

    // 2. Astronomical Countdown Clock
    initCountdown();

    // 3. Live UTC Time Display
    updateClock();
    setInterval(updateClock, 1000);
  }

  function updateClock() {
    const timeEl = document.getElementById("sky-utc-time");
    if (!timeEl) return;
    const now = new Date();
    const utcStr = now.toUTCString().replace("GMT", "UTC");
    timeEl.textContent = utcStr;
  }

  /* Astronomical Lunar Ephemeris Calculation */
  function updateMoonPhase() {
    const now = new Date();
    const jd = (now.getTime() / 86400000) + 2440587.5;
    const synodicMonth = 29.53058867;
    const refNewMoon = 2451550.26; // Jan 6, 2000, 18:14 UTC

    // Lunar age in current cycle (0 to 29.53 days)
    const age = ((jd - refNewMoon) % synodicMonth + synodicMonth) % synodicMonth;
    
    // Fraction through cycle (0 to 1)
    const phaseFrac = age / synodicMonth;

    // Illumination percentage
    const illum = ((1 - Math.cos(phaseFrac * 2 * Math.PI)) / 2) * 100;

    // Phase Name & Icon
    let phaseName = "";
    let phaseIcon = "";
    let isWaxing = phaseFrac < 0.5;

    if (age < 1.84) {
      phaseName = "New Moon";
      phaseIcon = "🌑";
    } else if (age < 5.53) {
      phaseName = "Waxing Crescent";
      phaseIcon = "🌒";
    } else if (age < 9.22) {
      phaseName = "First Quarter";
      phaseIcon = "🌓";
    } else if (age < 12.91) {
      phaseName = "Waxing Gibbous";
      phaseIcon = "🌔";
    } else if (age < 16.61) {
      phaseName = "Full Moon";
      phaseIcon = "🌕";
    } else if (age < 20.30) {
      phaseName = "Waning Gibbous";
      phaseIcon = "🌖";
    } else if (age < 23.99) {
      phaseName = "Last Quarter";
      phaseIcon = "🌗";
    } else if (age < 27.68) {
      phaseName = "Waning Crescent";
      phaseIcon = "🌘";
    } else {
      phaseName = "New Moon";
      phaseIcon = "🌑";
    }

    // Days to Next Full Moon
    let daysToFull = 14.765 - age;
    if (daysToFull < 0) daysToFull += synodicMonth;

    // DOM Updates
    const nameEl = document.getElementById("moon-phase-name");
    const illumEl = document.getElementById("moon-illum");
    const ageEl = document.getElementById("moon-age");
    const nextFullEl = document.getElementById("moon-next-full");
    const visualEl = document.getElementById("moon-visual-svg");

    if (nameEl) nameEl.textContent = `${phaseIcon} ${phaseName}`;
    if (illumEl) illumEl.textContent = `${illum.toFixed(1)}%`;
    if (ageEl) ageEl.textContent = `${age.toFixed(1)} days (${(synodicMonth - age).toFixed(1)}d until next cycle)`;
    if (nextFullEl) nextFullEl.textContent = `${daysToFull.toFixed(1)} days`;

    // Render Dynamic Moon Disc SVG
    if (visualEl) {
      renderMoonSvg(visualEl, phaseFrac, illum);
    }
  }

  function renderMoonSvg(container, phaseFrac, illum) {
    const r = 44;
    const cx = 50;
    const cy = 50;
    const isWaxing = phaseFrac < 0.5;

    // Arc radius modifier for terminator curve
    const cosAngle = Math.cos(phaseFrac * 2 * Math.PI);
    const terminatorX = cx + (r * cosAngle * (isWaxing ? -1 : 1));

    // Dynamic SVG
    container.innerHTML = `
      <svg viewBox="0 0 100 100" width="100" height="100" style="filter: drop-shadow(0 0 14px rgba(220, 230, 255, 0.35));">
        <defs>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
            <stop offset="70%" stop-color="#e2ebf8" stop-opacity="0.95"/>
            <stop offset="100%" stop-color="#b0c5e8" stop-opacity="0.9"/>
          </radialGradient>
          <radialGradient id="moonDark" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#162238" stop-opacity="1"/>
            <stop offset="100%" stop-color="#0a101b" stop-opacity="1"/>
          </radialGradient>
        </defs>
        <!-- Dark Side of the Moon -->
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#moonDark)" stroke="rgba(255,255,255,0.15)" stroke-width="1.2"/>
        
        <!-- Lit Side -->
        <path d="${getMoonPath(cx, cy, r, phaseFrac)}" fill="url(#moonGlow)"/>
        
        <!-- Subtle Mare Details -->
        <circle cx="42" cy="40" r="10" fill="rgba(140, 160, 190, 0.15)"/>
        <circle cx="58" cy="46" r="14" fill="rgba(140, 160, 190, 0.12)"/>
        <circle cx="48" cy="62" r="12" fill="rgba(140, 160, 190, 0.14)"/>
      </svg>
    `;
  }

  function getMoonPath(cx, cy, r, phaseFrac) {
    // 0 = new, 0.25 = 1st qtr, 0.5 = full, 0.75 = 3rd qtr
    if (phaseFrac > 0.49 && phaseFrac < 0.51) {
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r}`;
    }
    if (phaseFrac < 0.02 || phaseFrac > 0.98) {
      return "";
    }

    const isWaxing = phaseFrac < 0.5;
    const sweep = isWaxing ? 1 : 0;
    const phaseAngle = phaseFrac * 2 * Math.PI;
    const cosA = Math.cos(phaseAngle);
    const rx = Math.abs(r * cosA);

    if ((isWaxing && phaseFrac < 0.25) || (!isWaxing && phaseFrac >= 0.75)) {
      // Crescent
      const innerSweep = isWaxing ? 0 : 1;
      return `M ${cx} ${cy - r} A ${r} ${r} 0 0 ${sweep} ${cx} ${cy + r} A ${rx} ${r} 0 0 ${innerSweep} ${cx} ${cy - r}`;
    } else {
      // Gibbous
      const innerSweep = isWaxing ? 1 : 0;
      return `M ${cx} ${cy - r} A ${r} ${r} 0 0 ${sweep} ${cx} ${cy + r} A ${rx} ${r} 0 0 ${innerSweep} ${cx} ${cy - r}`;
    }
  }

  /* Live Countdown to Major Astronomical Phenomenon */
  function initCountdown() {
    // Next major event: Geminids Meteor Shower Peak (Dec 13, 2026, 21:00 UTC)
    // If passed, defaults to Quadrantids (Jan 3, 2027)
    let target = new Date("2026-12-13T21:00:00Z").getTime();
    if (Date.now() > target) {
      target = new Date("2027-01-03T21:00:00Z").getTime();
    }

    const dEl = document.getElementById("cd-days");
    const hEl = document.getElementById("cd-hours");
    const mEl = document.getElementById("cd-mins");
    const sEl = document.getElementById("cd-secs");

    function tick() {
      const now = Date.now();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      if (dEl) dEl.textContent = String(days).padStart(2, "0");
      if (hEl) hEl.textContent = String(hours).padStart(2, "0");
      if (mEl) mEl.textContent = String(mins).padStart(2, "0");
      if (sEl) sEl.textContent = String(secs).padStart(2, "0");
    }

    tick();
    setInterval(tick, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSkyTonight);
  } else {
    initSkyTonight();
  }
})();
