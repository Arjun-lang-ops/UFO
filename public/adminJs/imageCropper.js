// imageCropper.js — shared image crop utility (depends on Cropper.js CDN)
(function () {
  let currentCropper = null;
  let cropQueue = [];
  let cropResults = [];
  let cropAllDoneCallback = null;
  let cropQueueTotal = 0;
  let cropQueueDone = 0;

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("cropCancelBtn")?.addEventListener("click", cancelCropQueue);
    document.getElementById("cropConfirmBtn")?.addEventListener("click", confirmCrop);
    document.getElementById("cropSkipBtn")?.addEventListener("click", skipCrop);
  });

  // ── Public API ────────────────────────────────────────────────────────────────

  /**
   * Open crop modal for an array of File objects.
   * @param {File[]} files
   * @param {function(File[]): void} onAllDone  called with array of (possibly cropped) Files
   */
  window.openCropQueue = function (files, onAllDone) {
    if (!files || files.length === 0) { onAllDone([]); return; }
    cropQueue = Array.from(files);
    cropQueueTotal = cropQueue.length;
    cropQueueDone = 0;
    cropResults = [];
    cropAllDoneCallback = onAllDone;
    processNext();
  };

  /** Called from ratio buttons: setCropAspect(1, this) */
  window.setCropAspect = function (ratio, btn) {
    if (currentCropper) currentCropper.setAspectRatio(isNaN(ratio) ? NaN : ratio);
    document.querySelectorAll(".crop-ratio-btn").forEach((b) => {
      b.classList.remove("!border-primary", "!text-primary", "bg-primary/10");
    });
    if (btn) btn.classList.add("!border-primary", "!text-primary", "bg-primary/10");
  };

  // ── Internal ──────────────────────────────────────────────────────────────────

  function processNext() {
    if (cropQueue.length === 0) {
      closeCropModal();
      if (cropAllDoneCallback) cropAllDoneCallback(cropResults);
      return;
    }

    const file = cropQueue.shift();

    // Update counter badge
    const counter = document.getElementById("cropImageCounter");
    if (counter) {
      if (cropQueueTotal > 1) {
        counter.textContent = `Image ${cropQueueDone + 1} of ${cropQueueTotal}`;
        counter.classList.remove("hidden");
      } else {
        counter.classList.add("hidden");
      }
    }

    const reader = new FileReader();
    reader.onload = (e) => showCropModal(e.target.result, file);
    reader.readAsDataURL(file);
  }

  function showCropModal(src, originalFile) {
    const modal = document.getElementById("cropModal");
    const img = document.getElementById("cropImage");

    if (currentCropper) { currentCropper.destroy(); currentCropper = null; }

    modal._currentFile = originalFile;
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    // Reset ratio buttons — highlight 1:1 by default
    document.querySelectorAll(".crop-ratio-btn").forEach((b) =>
      b.classList.remove("!border-primary", "!text-primary", "bg-primary/10")
    );
    const defaultBtn = document.querySelector(".crop-ratio-btn[data-ratio='1']");
    if (defaultBtn) defaultBtn.classList.add("!border-primary", "!text-primary", "bg-primary/10");

    img.src = "";
    img.onload = () => {
      if (currentCropper) { currentCropper.destroy(); currentCropper = null; }
      currentCropper = new Cropper(img, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 0.85,
        background: false,
        movable: true,
        zoomable: true,
        rotatable: false,
        scalable: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
      });
    };
    img.src = src;
  }

  function confirmCrop() {
    if (!currentCropper) return;
    const btn = document.getElementById("cropConfirmBtn");
    btn.disabled = true;
    btn.innerHTML = `<span class="material-symbols-outlined text-sm animate-spin">autorenew</span> Processing…`;

    const canvas = currentCropper.getCroppedCanvas({
      width: 900, height: 900,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high",
    });

    canvas.toBlob((blob) => {
      const modal = document.getElementById("cropModal");
      const orig = modal._currentFile;
      const baseName = orig.name.replace(/\.[^.]+$/, "");
      const croppedFile = new File([blob], baseName + ".jpg", { type: "image/jpeg" });
      cropResults.push(croppedFile);
      cropQueueDone++;
      btn.disabled = false;
      btn.innerHTML = `<span class="material-symbols-outlined text-sm">check</span> Apply Crop`;
      processNext();
    }, "image/jpeg", 0.92);
  }

  function skipCrop() {
    const modal = document.getElementById("cropModal");
    cropResults.push(modal._currentFile);
    cropQueueDone++;
    processNext();
  }

  function cancelCropQueue() {
    cropQueue = [];
    cropResults = [];
    cropQueueDone = 0;
    closeCropModal();
    // Don't call callback — user explicitly cancelled
  }

  function closeCropModal() {
    const modal = document.getElementById("cropModal");
    if (modal) modal.classList.add("hidden");
    document.body.style.overflow = "";
    if (currentCropper) { currentCropper.destroy(); currentCropper = null; }
  }
})();
