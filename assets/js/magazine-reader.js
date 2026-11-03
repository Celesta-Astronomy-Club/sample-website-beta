/* ==========================================================================
   CELESTA | Native Magazine 3D Flipbook Controller
   - 100% Client-Side Local Flipbook (StPageFlip)
   - Pure Black Background & Stage
   - Smooth Controls, Dock, Zoom & Fullscreen
   ========================================================================== */

(() => {
  const TOTAL_PAGES = 25;
  const PAGE_IMAGES = Array.from({ length: TOTAL_PAGES }, (_, i) => {
    const num = String(i + 1).padStart(2, "0");
    return `assets/img/magazine/vol1/page_${num}.jpg`;
  });

  let pageFlip = null;
  let flipbookInitialized = false;
  let currentZoom = 1.0;

  function initMagazineReader() {
    const modal = document.getElementById("mag-reader-modal");
    if (!modal) return;

    const openBtns = document.querySelectorAll("[data-open-flipbook]");
    const closeBtn = document.getElementById("mag-close-btn");
    const zoomInBtn = document.getElementById("mag-zoom-in");
    const zoomOutBtn = document.getElementById("mag-zoom-out");
    const zoomText = document.getElementById("mag-zoom-text");
    const fsBtn = document.getElementById("mag-fs-btn");
    const fsIcon = document.getElementById("mag-fs-icon");

    // Dock and Nav Elements
    const sidePrev = document.getElementById("mag-side-prev");
    const sideNext = document.getElementById("mag-side-next");
    const dockFirst = document.getElementById("dock-btn-first");
    const dockPrev = document.getElementById("dock-btn-prev");
    const dockNext = document.getElementById("dock-btn-next");
    const dockLast = document.getElementById("dock-btn-last");
    const dockText = document.getElementById("mag-dock-page-text");
    const dockSlider = document.getElementById("mag-dock-slider");

    /* ----------------------------------------------------------------------
       1. Modal Open / Close & Cursor Handling
       ---------------------------------------------------------------------- */
    function openModal() {
      modal.hidden = false;
      document.body.style.overflow = "hidden";

      // Initialize flipbook or refresh layout
      if (!flipbookInitialized) {
        setTimeout(() => {
          initFlipbook();
        }, 50);
      } else if (pageFlip) {
        setTimeout(() => {
          pageFlip.update();
        }, 50);
      }
    }

    function closeModal() {
      modal.hidden = true;
      document.body.style.overflow = "";

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setZoom(1.0);
    }

    /* ----------------------------------------------------------------------
       2. Flipbook Engine Initialization (Local St.PageFlip)
       ---------------------------------------------------------------------- */
    function initFlipbook() {
      const bookEl = document.getElementById("mag-book-element");
      const stage = document.getElementById("mag-book-stage");
      if (!bookEl || !stage || !window.St || !window.St.PageFlip) return;

      const stageHeight = stage.clientHeight || 650;
      // Aspect ratio ~0.707 (A4)
      const pageH = Math.min(stageHeight - 20, 800);
      const pageW = Math.round(pageH * 0.707);

      try {
        pageFlip = new window.St.PageFlip(bookEl, {
          width: pageW,
          height: pageH,
          size: "stretch",
          minWidth: 260,
          maxWidth: 900,
          minHeight: 380,
          maxHeight: 1250,
          maxShadowOpacity: 0.5,
          showCover: true,
          usePortrait: true,
          mobileScrollSupport: false,
          useMouseEvents: true,
          clickEventForward: true,
          swipeDistance: 35
        });

        pageFlip.loadFromImages(PAGE_IMAGES);
        flipbookInitialized = true;

        pageFlip.on("flip", (e) => {
          updateDockStatus(e.data);
        });

        pageFlip.on("init", () => {
          updateDockStatus(pageFlip.getCurrentPageIndex());
        });

        pageFlip.on("changeOrientation", () => {
          updateDockStatus(pageFlip.getCurrentPageIndex());
        });
      } catch (err) {
        console.error("Flipbook initialization failed:", err);
      }
    }

    /* ----------------------------------------------------------------------
       3. Page Navigation & Dock Updating
       ---------------------------------------------------------------------- */
    function updateDockStatus(index) {
      if (typeof index !== "number" || index < 0) index = 0;
      const isPortrait = pageFlip ? pageFlip.getOrientation() === "portrait" : false;

      if (dockText) {
        if (index === 0) {
          dockText.textContent = "Cover (Page 1)";
        } else if (index === TOTAL_PAGES - 1) {
          dockText.textContent = `Back Cover (Page ${TOTAL_PAGES})`;
        } else if (isPortrait) {
          dockText.textContent = `Page ${index + 1} of ${TOTAL_PAGES}`;
        } else {
          const secondPage = Math.min(index + 2, TOTAL_PAGES);
          dockText.textContent = `Pages ${index + 1}–${secondPage} of ${TOTAL_PAGES}`;
        }
      }

      if (dockSlider) {
        dockSlider.value = String(index + 1);
      }

      if (dockFirst) dockFirst.disabled = index === 0;
      if (dockPrev) dockPrev.disabled = index === 0;
      if (sidePrev) sidePrev.style.opacity = index === 0 ? "0.3" : "1";

      const isLast = index >= TOTAL_PAGES - 1 || (!isPortrait && index >= TOTAL_PAGES - 2);
      if (dockNext) dockNext.disabled = isLast;
      if (dockLast) dockLast.disabled = isLast;
      if (sideNext) sideNext.style.opacity = isLast ? "0.3" : "1";
    }

    function flipNext() {
      if (pageFlip) pageFlip.flipNext();
    }

    function flipPrev() {
      if (pageFlip) pageFlip.flipPrev();
    }

    function goToPage(target) {
      if (!pageFlip) return;
      const idx = Math.max(0, Math.min(TOTAL_PAGES - 1, target));
      pageFlip.turnToPage(idx);
    }

    /* ----------------------------------------------------------------------
       4. Zoom & Fullscreen
       ---------------------------------------------------------------------- */
    function setZoom(val) {
      currentZoom = Math.max(0.7, Math.min(1.7, Math.round(val * 10) / 10));
      const stage = document.getElementById("mag-book-stage");
      if (stage) {
        stage.style.transform = `scale(${currentZoom})`;
      }
      if (zoomText) {
        zoomText.textContent = `${Math.round(currentZoom * 100)}%`;
      }
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        modal.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }

    document.addEventListener("fullscreenchange", () => {
      if (fsIcon) {
        fsIcon.textContent = document.fullscreenElement ? "🗗" : "⛶";
      }
    });

    /* ----------------------------------------------------------------------
       5. Event Bindings
       ---------------------------------------------------------------------- */
    openBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openModal();
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    if (sidePrev) sidePrev.addEventListener("click", flipPrev);
    if (sideNext) sideNext.addEventListener("click", flipNext);
    if (dockPrev) dockPrev.addEventListener("click", flipPrev);
    if (dockNext) dockNext.addEventListener("click", flipNext);
    if (dockFirst) dockFirst.addEventListener("click", () => goToPage(0));
    if (dockLast) dockLast.addEventListener("click", () => goToPage(TOTAL_PAGES - 1));

    if (dockSlider) {
      dockSlider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10) - 1;
        goToPage(val);
      });
    }

    if (zoomInBtn) zoomInBtn.addEventListener("click", () => setZoom(currentZoom + 0.15));
    if (zoomOutBtn) zoomOutBtn.addEventListener("click", () => setZoom(currentZoom - 0.15));
    if (fsBtn) fsBtn.addEventListener("click", toggleFullscreen);

    // Keyboard navigation
    window.addEventListener("keydown", (e) => {
      if (modal.hidden) return;
      if (e.key === "Escape") {
        closeModal();
      } else if (e.key === "ArrowLeft") {
        flipPrev();
      } else if (e.key === "ArrowRight") {
        flipNext();
      }
    });

    // Resize recalculation
    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!modal.hidden && pageFlip) {
          pageFlip.update();
        }
      }, 150);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMagazineReader);
  } else {
    initMagazineReader();
  }
})();
