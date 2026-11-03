/* ==========================================================================
   CELESTA | Constitution & Member Portal Script
   - Salted SHA-256 Club ID Gate
   - Portal Tab Switching (ID Badge, Constitution, MoM Archive)
   - Interactive 3D Glassmorphic Holographic Badge with Mouse Tracking
   - Crisp High-Res Official Identification Card (.PNG) Canvas Generator
   - Minutes of Meetings (MoM) Archive Viewer
   ========================================================================== */

(() => {
  const KEY = "celesta-club-id";                 // remembered for this browser tab only
  const MAX_TRIES = 5;                           // wrong tries before a short pause
  const PAUSE_SECONDS = 20;

  const gate = document.querySelector("[data-gate]");
  const panel = document.querySelector("[data-gate-panel]");
  const form = document.querySelector("[data-gate-form]");
  const input = document.querySelector("#club-id");
  const submit = form && form.querySelector("button[type='submit']");
  const message = document.querySelector("[data-gate-message]");
  const doc = document.querySelector("[data-constitution]");
  const lead = document.querySelector("[data-lead]");
  if (!gate || !panel || !form || !input || !doc) return;

  let currentMember = null;
  let currentRawId = "";

  const normalize = (value) => String(value || "").trim().toLowerCase();

  async function sha256Hash(rawId, salt) {
    const text = normalize(rawId) + (salt || (window.CELESTA_DATA && window.CELESTA_DATA.salt) || "celesta_astro_2026");
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    return normalize(rawId);
  }

  // Returns matching object { id, name, member } or null
  async function findId(value) {
    const typed = String(value || "").trim();
    if (!typed) return null;

    // Check encrypted SHA-256 hash in CELESTA_DATA
    if (window.CELESTA_DATA && Array.isArray(window.CELESTA_DATA.members)) {
      try {
        const hash = await sha256Hash(typed, window.CELESTA_DATA.salt);
        const member = window.CELESTA_DATA.members.find((m) => m.clubIdHash === hash);
        if (member) return { id: typed, name: member.firstName || member.name, member: member };
      } catch (err) { /* fallback */ }
    }

    // Legacy fallback in SITE.clubIds
    const legacy = (window.SITE && SITE.clubIds || []).find((id) => normalize(id) === normalize(typed));
    if (legacy) {
      const matchedMember = (window.CELESTA_DATA && window.CELESTA_DATA.members || []).find(
        (m) => normalize(m.name).replace(/\s+/g, "").includes(normalize(firstName(legacy)))
      );
      return { id: legacy, name: firstName(legacy), member: matchedMember || null };
    }

    return null;
  }

  const remember = (id) => { try { sessionStorage.setItem(KEY, id); } catch (e) { /* private mode */ } };
  const recall = () => { try { return sessionStorage.getItem(KEY); } catch (e) { return null; } };
  const forget = () => { try { sessionStorage.removeItem(KEY); } catch (e) { /* private mode */ } };

  // "AradhyaHaldikar123" becomes "Aradhya"
  const firstName = (id) => String(id || "").replace(/\d+$/, "").replace(/([a-z])([A-Z])/g, "$1 $2").split(" ")[0];

  function setLead(nameOrId) {
    if (!lead) return;
    if (!nameOrId) { lead.textContent = lead.dataset.locked; return; }
    const name = typeof nameOrId === "object" ? nameOrId.name : (nameOrId.includes(" ") ? nameOrId : firstName(nameOrId));
    lead.textContent = (name ? `Welcome, ${name}. ` : "Welcome. ") + lead.dataset.open;
  }


  /* ==========================================================================
     PORTAL TABS & NAVIGATION
     ========================================================================== */
  function initPortalTabs() {
    const tabButtons = document.querySelectorAll("[data-portal-tab]");
    const portalViews = document.querySelectorAll(".portal-view");

    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-portal-tab");
        tabButtons.forEach((b) => b.classList.toggle("is-active", b === btn));

        portalViews.forEach((view) => {
          const isTarget = view.id === `portal-${targetTab}`;
          view.classList.toggle("is-active", isTarget);
        });

        if (targetTab === "constitution") {
          setUpContents();
        }
      });
    });
  }


  /* ==========================================================================
     INTERACTIVE 3D HOLOGRAPHIC CARD (Tilt & Shimmer)
     ========================================================================== */
  function initHoloTilt() {
    const card = document.getElementById("holo-card");
    const container = card && card.closest(".badge-scene");
    const shimmer = card && card.querySelector(".holo-shimmer");
    if (!card || !container) return;

    let rafId = null;

    container.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const normX = Math.max(-1, Math.min(1, (x / rect.width - 0.5) * 2));
      const normY = Math.max(-1, Math.min(1, (y / rect.height - 0.5) * 2));

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rotX = -normY * 16;
        const rotY = normX * 16;
        card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

        if (shimmer) {
          const angle = 115 + normX * 45;
          shimmer.style.background = `linear-gradient(${angle}deg, transparent 15%, rgba(255, 255, 255, 0.16) 35%, rgba(0, 210, 255, 0.28) 48%, rgba(255, 0, 128, 0.22) 58%, transparent 75%)`;
          shimmer.style.opacity = "1";
        }
      });
    });

    container.addEventListener("mouseleave", () => {
      if (rafId) cancelAnimationFrame(rafId);
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      if (shimmer) shimmer.style.opacity = "0.7";
    });
  }


  /* ==========================================================================
     POPULATE MEMBER ID BADGE
     ========================================================================== */
  function populateBadge(member, rawId) {
    const fallbackMember = {
      id: normalize(firstName(rawId) || "member"),
      name: firstName(rawId) ? `${firstName(rawId)} (Celesta Member)` : "Celesta Member",
      role: "Club Member",
      tier: "member",
      avatar: "assets/img/members/def1.png",
      joinYear: 2025,
      focus: ["Astronomy", "Citizen Science", "Observation"]
    };

    const m = member || fallbackMember;

    // Name & Role
    const nameEl = document.getElementById("badge-name");
    const roleEl = document.getElementById("badge-role");
    const codeEl = document.getElementById("badge-code");
    const validEl = document.getElementById("badge-valid-year");
    const avatarEl = document.getElementById("badge-avatar");
    const tierBadgeEl = document.getElementById("badge-tier-badge");
    const adminLink = document.getElementById("link-admin-studio");

    if (nameEl) nameEl.textContent = m.name;
    if (roleEl) roleEl.textContent = m.role;

    // Reg Code
    const hashNum = Math.abs(m.name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 900 + 100;
    const regCode = `CEL-${m.joinYear || 2025}-${String(hashNum).padStart(3, "0")}`;
    if (codeEl) codeEl.textContent = regCode;

    // Valid Years
    const joinY = m.joinYear || 2025;
    if (validEl) validEl.textContent = `${joinY}–${joinY + 2}`;

    // Avatar
    if (avatarEl) {
      avatarEl.src = m.avatar || (m.gender === "female" ? "assets/img/members/def2.png" : "assets/img/members/def1.png");
      avatarEl.alt = `${m.name} Photo`;
    }

    // Tier Badge Pill
    if (tierBadgeEl) {
      tierBadgeEl.className = "badge";
      if (m.tier === "lead") {
        tierBadgeEl.classList.add("badge--gold");
        tierBadgeEl.textContent = "Lead";
      } else if (m.tier === "intern") {
        tierBadgeEl.classList.add("badge--bronze");
        tierBadgeEl.textContent = "Intern";
      } else {
        tierBadgeEl.classList.add("badge--silver");
        tierBadgeEl.textContent = "Member";
      }
    }


    // Show Moderator Studio link if Lead
    if (adminLink) {
      adminLink.hidden = m.tier !== "lead";
    }

    // Render Scannable QR Code
    const qrContainer = document.getElementById("badge-qr-container");
    if (qrContainer && typeof QRCode !== "undefined") {
      qrContainer.innerHTML = "";
      const verifyUrl = `${window.location.origin}/members.html#${m.id || ""}`;
      try {
        new QRCode(qrContainer, {
          text: verifyUrl,
          width: 68,
          height: 68,
          colorDark: "#070c14",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.M
        });
      } catch (err) {
        console.warn("QR code render failed:", err);
      }
    }

    // Set up Copy Verification Link Button
    const copyBtn = document.getElementById("btn-copy-verify");
    if (copyBtn) {
      copyBtn.onclick = async () => {
        const verifyUrl = `${window.location.origin}/members.html#${m.id || ""}`;
        try {
          await navigator.clipboard.writeText(verifyUrl);
          const orig = copyBtn.textContent;
          copyBtn.textContent = "Verification Link Copied!";
          setTimeout(() => { copyBtn.textContent = orig; }, 2200);
        } catch (e) {
          prompt("Copy your verification link:", verifyUrl);
        }
      };
    }

    // Set up Download Button
    const dlBtn = document.getElementById("btn-download-badge");
    if (dlBtn) {
      dlBtn.onclick = () => downloadOfficialCard(m, regCode);
    }
  }


  /* ==========================================================================
     DOWNLOAD CRISP OFFICIAL IDENTIFICATION CARD (.PNG)
     Draws a professional, print-ready 1200x750 card on #export-canvas.
     ========================================================================== */
  function loadImage(src) {
    return new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  async function downloadOfficialCard(member, regCode) {
    const canvas = document.getElementById("export-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = 1200;
    const height = 750;

    // Reset canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Preload card assets
    const [bannerLogo, avatarImg, sealImg, fallbackLogo] = await Promise.all([
      loadImage("assets/img/bannerlogo_transparent.png"),
      loadImage(member.avatar || (member.gender === "female" ? "assets/img/members/def2.png" : "assets/img/members/def1.png")),
      loadImage("assets/img/seal.png"),
      loadImage("assets/img/logo_transparent.png")
    ]);

    // Active seal image (uploaded seal.png or fallback to transparent logo)
    const officialSeal = sealImg || fallbackLogo;

    // 1. Base Dark Background (Clean professional dark slate card, no ambient glow)
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#080c15");
    bgGrad.addColorStop(0.5, "#0b1220");
    bgGrad.addColorStop(1, "#060910");
    ctx.fillStyle = bgGrad;
    roundRect(ctx, 0, 0, width, height, 32);
    ctx.fill();

    // 3. Official Card Borders
    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
    ctx.lineWidth = 3;
    roundRect(ctx, 1.5, 1.5, width - 3, height - 3, 32);
    ctx.stroke();

    ctx.strokeStyle = "rgba(58, 123, 213, 0.35)";
    ctx.lineWidth = 1;
    roundRect(ctx, 14, 14, width - 28, height - 28, 24);
    ctx.stroke();

    // 4. Header Bar
    if (bannerLogo) {
      // Draw banner logo
      ctx.drawImage(bannerLogo, 60, 42, 250, 58);
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px 'Space Grotesk', -apple-system, sans-serif";
      ctx.fillText("CELESTA", 60, 80);
    }

    // Top Right Credential Metadata
    ctx.textAlign = "right";
    ctx.fillStyle = "#8ea5c8";
    ctx.font = "bold 14px 'Space Grotesk', -apple-system, sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("OFFICIAL IDENTIFICATION CARD", 1140, 62);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px monospace";
    ctx.fillText(regCode || "CEL-2025-001", 1140, 88);

    // Separator line
    const lineGrad = ctx.createLinearGradient(60, 0, 1140, 0);
    lineGrad.addColorStop(0, "rgba(0, 210, 255, 0.85)");
    lineGrad.addColorStop(0.5, "rgba(58, 123, 213, 0.6)");
    lineGrad.addColorStop(1, "rgba(255, 255, 255, 0.1)");
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, 122);
    ctx.lineTo(1140, 122);
    ctx.stroke();

    // 5. Left Column: Avatar Photo (Clips into rounded rect)
    const photoX = 64;
    const photoY = 158;
    const photoW = 240;
    const photoH = 280;
    const photoR = 18;

    ctx.save();
    roundRect(ctx, photoX, photoY, photoW, photoH, photoR);
    ctx.clip();
    if (avatarImg) {
      // Aspect fill photo
      const imgRatio = avatarImg.width / avatarImg.height;
      const boxRatio = photoW / photoH;
      let drawW, drawH, drawX, drawY;
      if (imgRatio > boxRatio) {
        drawH = photoH;
        drawW = photoH * imgRatio;
        drawX = photoX - (drawW - photoW) / 2;
        drawY = photoY;
      } else {
        drawW = photoW;
        drawH = photoW / imgRatio;
        drawX = photoX;
        drawY = photoY - (drawH - photoH) / 2;
      }
      ctx.drawImage(avatarImg, drawX, drawY, drawW, drawH);
    } else {
      ctx.fillStyle = "#162338";
      ctx.fillRect(photoX, photoY, photoW, photoH);
    }
    ctx.restore();

    // Photo Border
    const tierColor = member.tier === "lead" ? "#e5b84c" : (member.tier === "intern" ? "#cd7f32" : "#9bb5d6");
    ctx.strokeStyle = tierColor;
    ctx.lineWidth = 3;
    roundRect(ctx, photoX, photoY, photoW, photoH, photoR);
    ctx.stroke();

    // Status Pill below photo
    const pillY = photoY + photoH + 24;
    ctx.fillStyle = "rgba(46, 204, 113, 0.15)";
    roundRect(ctx, photoX, pillY, photoW, 40, 12);
    ctx.fill();
    ctx.strokeStyle = "#2ecc71";
    ctx.lineWidth = 1.5;
    roundRect(ctx, photoX, pillY, photoW, 40, 12);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = "#2ecc71";
    ctx.font = "bold 14px -apple-system, sans-serif";
    ctx.fillText("● ACTIVE CREDENTIAL", photoX + photoW / 2, pillY + 25);

    // Membership Validity Box
    const valY = pillY + 58;
    ctx.textAlign = "left";
    ctx.fillStyle = "#7b93b8";
    ctx.font = "12px 'Space Grotesk', -apple-system, sans-serif";
    ctx.fillText("VALIDITY PERIOD", photoX, valY);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px -apple-system, sans-serif";
    const joinYr = member.joinYear || 2025;
    ctx.fillText(`${joinYr} – ${joinYr + 2}`, photoX, valY + 22);

    ctx.fillStyle = "#7b93b8";
    ctx.font = "12px 'Space Grotesk', -apple-system, sans-serif";
    ctx.fillText("ORGANIZATION", photoX + 130, valY);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px -apple-system, sans-serif";
    ctx.fillText("Celesta India", photoX + 130, valY + 22);

    // 6. Center Identity Details
    const detailsX = 350;

    // Full Name
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px 'Space Grotesk', -apple-system, sans-serif";
    ctx.fillText(member.name, detailsX, 205);

    // Role
    ctx.fillStyle = "#9dbbe8";
    ctx.font = "600 24px -apple-system, sans-serif";
    ctx.fillText(member.role, detailsX, 246);

    // Tier Badge Pill
    const tierText = member.tier === "lead" ? "LEADERSHIP" : (member.tier === "intern" ? "RESEARCH INTERN" : "CORE MEMBER");
    const tierPillWidth = ctx.measureText(tierText).width + 36;
    ctx.fillStyle = member.tier === "lead" ? "rgba(229, 184, 76, 0.16)" : "rgba(255, 255, 255, 0.1)";
    roundRect(ctx, detailsX, 268, tierPillWidth, 34, 10);
    ctx.fill();
    ctx.strokeStyle = tierColor;
    ctx.lineWidth = 1.5;
    roundRect(ctx, detailsX, 268, tierPillWidth, 34, 10);
    ctx.stroke();

    ctx.fillStyle = tierColor;
    ctx.font = "bold 14px 'Space Grotesk', -apple-system, sans-serif";
    ctx.fillText(tierText, detailsX + 18, 290);

    // Metadata Grid
    const gridY = 346;

    // Organization & Affiliation
    ctx.fillStyle = "#7b93b8";
    ctx.font = "13px 'Space Grotesk', -apple-system, sans-serif";
    ctx.fillText("ORGANIZATION & AFFILIATION", detailsX, gridY);

    ctx.fillStyle = "#ffffff";
    ctx.font = "500 19px -apple-system, sans-serif";
    ctx.fillText("Celesta Astronomy Club", detailsX, gridY + 28);

    ctx.fillStyle = "#9dbbe8";
    ctx.font = "400 15px -apple-system, sans-serif";
    ctx.fillText("Student-Led Astronomy, Research & STEM Initiatives", detailsX, gridY + 54);

    // Security & Cryptography Note
    ctx.fillStyle = "#7b93b8";
    ctx.font = "13px 'Space Grotesk', -apple-system, sans-serif";
    ctx.fillText("AUTHENTICATION", detailsX, gridY + 160);

    ctx.fillStyle = "#9dbbe8";
    ctx.font = "15px monospace";
    ctx.fillText("Salted SHA-256 Gated Club Verification Protocol", detailsX, gridY + 186);

    // 7. Celesta Official Seal Watermark
    if (officialSeal) {
      ctx.save();
      ctx.globalAlpha = 0.88;
      ctx.drawImage(officialSeal, 720, 480, 150, 150);
      ctx.restore();
    }

    // 8. Bottom-Right QR Code Box
    const qrContainer = document.getElementById("badge-qr-container");
    const qrImg = qrContainer && (qrContainer.querySelector("canvas") || qrContainer.querySelector("img"));

    const qrBoxX = 940;
    const qrBoxY = 460;
    const qrBoxW = 200;
    const qrBoxH = 220;

    // White Card Background for QR
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, qrBoxX, qrBoxY, qrBoxW, qrBoxH, 18);
    ctx.fill();

    if (qrImg) {
      ctx.drawImage(qrImg, qrBoxX + 25, qrBoxY + 20, 150, 150);
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "#070c14";
    ctx.font = "bold 13px 'Space Grotesk', -apple-system, sans-serif";
    ctx.fillText("SCAN TO VERIFY", qrBoxX + qrBoxW / 2, qrBoxY + 195);

    // 9. Card Footer Authorization
    ctx.textAlign = "left";
    ctx.fillStyle = "#4a6385";
    ctx.font = "12px 'Space Grotesk', -apple-system, sans-serif";
    ctx.fillText("AUTHORIZED STUDENT CREDENTIAL  |  ISSUED BY CELESTA EXECUTIVE COUNCIL", detailsX, 700);

    // Trigger Download
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      const cleanName = member.name.replace(/[^a-zA-Z0-9]/g, "_");
      downloadLink.download = `Celesta_ID_${cleanName}.png`;
      downloadLink.href = dataUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (e) {
      console.error("Export download failed:", e);
      alert("Failed to export ID Card. Please try again.");
    }
  }


  /* ==========================================================================
     MINUTES OF MEETINGS (MoM) VIEWER
     ========================================================================== */
  function renderMoMs() {
    const list = document.getElementById("portal-mom-list");
    const countEl = document.getElementById("portal-mom-count");
    if (!list) return;

    const moms = (window.CELESTA_DATA && Array.isArray(window.CELESTA_DATA.moms)) ? window.CELESTA_DATA.moms : [];
    if (countEl) countEl.textContent = String(moms.length);

    if (moms.length === 0) {
      list.innerHTML = `<div class="mom-card glass spot"><p style="color:var(--cream-dim); margin:0;">No meeting minutes recorded yet.</p></div>`;
      return;
    }

    list.innerHTML = moms.map((mom) => `
      <article class="mom-card glass spot" id="${mom.id}">
        <div class="mom-card-head">
          <div>
            <h3>${mom.title}</h3>
            <span class="mom-date">${mom.date} &nbsp;•&nbsp; Attendees: ${(mom.attendees || []).join(", ")}</span>
          </div>
        </div>

        <div class="mom-grid">
          <div class="mom-block">
            <h4>Agenda & Discussion</h4>
            <p>${mom.agenda}</p>
          </div>
          <div class="mom-block">
            <h4>Decisions & Resolutions</h4>
            <p>${mom.decisions}</p>
          </div>
        </div>

        ${Array.isArray(mom.actionItems) && mom.actionItems.length ? `
          <div class="mom-block" style="margin-top: 14px;">
            <h4>Action Items</h4>
            <ul class="mom-actions-list">
              ${mom.actionItems.map((item) => `
                <li>
                  <span class="mom-status-pill" style="${item.done ? '' : 'background:rgba(230,126,34,.15); color:#e67e22; border-color:rgba(230,126,34,.3);'}">
                    ${item.done ? 'Done' : 'In Progress'}
                  </span>
                  <span><strong>${item.assignee}:</strong> ${item.task}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
      </article>
    `).join("");
  }


  /* ==========================================================================
     CONSTITUTION CONTENTS OBSERVER
     ========================================================================== */
  let tocReady = false;
  function setUpContents() {
    if (tocReady) return;
    tocReady = true;
    const links = [...doc.querySelectorAll(".doc-toc a")];
    const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    const mark = (id) => links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + id));
    if (sections[0]) mark(sections[0].id);
    if (!("IntersectionObserver" in window)) return;
    const watcher = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) mark(entry.target.id); });
    }, { rootMargin: "-25% 0px -65% 0px" });
    sections.forEach((section) => watcher.observe(section));
  }


  /* ==========================================================================
     GATE: UNLOCK & LOCK
     ========================================================================== */
  function showDocument(animate) {
    gate.hidden = true;
    doc.hidden = false;
    if (animate && !(window.REDUCED)) doc.classList.add("is-entering");
    initPortalTabs();
    initHoloTilt();
    renderMoMs();
    setUpContents();
  }

  function unlock(match) {
    currentRawId = match.id || match;
    currentMember = match.member || null;
    const displayName = match.name || firstName(currentRawId);

    remember(currentRawId);
    setLead(displayName);
    populateBadge(currentMember, currentRawId);

    message.textContent = "";
    panel.classList.remove("is-error");
    panel.classList.add("is-open");                       // padlock opens

    if (window.REDUCED) { showDocument(false); return; }
    setTimeout(() => gate.classList.add("is-leaving"), 750);
    setTimeout(() => showDocument(true), 1200);
  }

  function lock() {
    forget();
    currentMember = null;
    currentRawId = "";
    doc.hidden = true;
    doc.classList.remove("is-entering");
    gate.hidden = false;
    gate.classList.remove("is-leaving");
    panel.classList.remove("is-open", "is-error");
    input.value = "";
    message.textContent = "";
    setLead(null);
    window.scrollTo({ top: 0, behavior: "instant" });
    input.focus({ preventScroll: true });
  }


  /* ==========================================================================
     GATE: WRONG ID REJECTION & RATE LIMIT
     ========================================================================== */
  let fails = 0;
  function reject(typed) {
    fails += 1;
    panel.classList.add("is-error");
    message.textContent = normalize(typed) ? "Club ID not found. Check it and try again." : "Enter your Club ID.";
    panel.classList.remove("is-shaking");
    void panel.offsetWidth;                               // restart the shake
    panel.classList.add("is-shaking");
    if (navigator.vibrate) navigator.vibrate([70, 50, 70]);
    input.focus();
    input.select();
    if (fails >= MAX_TRIES) pause();
  }

  function pause() {
    let left = PAUSE_SECONDS;
    input.disabled = true;
    submit.disabled = true;
    const tick = () => {
      if (left <= 0) {
        clearInterval(timer);
        input.disabled = false;
        submit.disabled = false;
        fails = 0;
        message.textContent = "";
        panel.classList.remove("is-error");
        input.focus();
        return;
      }
      message.textContent = `Too many tries. Please wait ${left}s.`;
      left -= 1;
    };
    const timer = setInterval(tick, 1000);
    tick();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const match = await findId(input.value);
    if (match) unlock(match); else reject(input.value);
  });

  input.addEventListener("input", () => {
    if (input.disabled) return;
    panel.classList.remove("is-error");
    message.textContent = "";
  });
  panel.addEventListener("animationend", () => panel.classList.remove("is-shaking"));

  doc.querySelectorAll("[data-print]").forEach((button) => button.addEventListener("click", () => window.print()));
  doc.querySelectorAll("[data-lock]").forEach((button) => button.addEventListener("click", lock));


  /* ==========================================================================
     ON LOAD: AUTO-UNLOCK IF SESSION SAVED
     ========================================================================== */
  (async () => {
    const saved = await findId(recall());
    if (saved) {
      currentRawId = saved.id;
      currentMember = saved.member;
      setLead(saved.name);
      populateBadge(currentMember, currentRawId);
      panel.classList.add("is-open");
      showDocument(false);
    } else {
      forget();
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) input.focus({ preventScroll: true });
    }
  })();
})();
