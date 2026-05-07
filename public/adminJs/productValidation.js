// productValidation.js
// Handles frontend validation and AJAX for admin product add form

document.addEventListener("DOMContentLoaded", () => {
  const productForm = document.getElementById("addProductForm");
  let variantCount = 1;
  const variantsContainer = document.getElementById("variantsContainer");

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const showError = (elementId, message) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = message;
      el.classList.remove("hidden");
    }
  };

  const clearError = (elementId) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = "";
      el.classList.add("hidden");
    }
  };

  const clearAllErrors = () => {
    document.querySelectorAll(".error-msg").forEach((el) => {
      el.textContent = "";
      el.classList.add("hidden");
    });
  };

  // ─── Validate general fields ─────────────────────────────────────────────────

  const validateGeneralInfo = (name, category, description) => {
    let isValid = true;

    if (!name.trim()) {
      showError("nameError", "Product name is required");
      isValid = false;
    } else if (name.trim().length < 3) {
      showError("nameError", "Product name must be at least 3 characters");
      isValid = false;
    } else if (name.trim().length > 100) {
      showError("nameError", "Product name cannot exceed 100 characters");
      isValid = false;
    }

    if (!category || category === "") {
      showError("categoryError", "Please select a category");
      isValid = false;
    }

    if (!description.trim()) {
      showError("descriptionError", "Description is required");
      isValid = false;
    } else if (description.trim().length < 10) {
      showError(
        "descriptionError",
        "Description must be at least 10 characters",
      );
      isValid = false;
    }

    return isValid;
  };

  // ─── Validate variants ───────────────────────────────────────────────────────

  const validateVariants = () => {
    let isValid = true;
    const variantBoxes = document.querySelectorAll(".variant-box");

    if (variantBoxes.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Variants",
        text: "Please add at least one product variant.",
        confirmButtonColor: "#137fec",
      });
      return false;
    }

    variantBoxes.forEach((box, index) => {
      const idx = box.dataset.index;

      const sku = box.querySelector(`#sku_${idx}`)?.value || "";
      const stock = box.querySelector(`#stock_${idx}`)?.value || "";
      const color = box.querySelector(`#color_${idx}`)?.value || "";
      const size = box.querySelector(`#size_${idx}`)?.value || "";
      const price = box.querySelector(`#price_${idx}`)?.value || "";
      const discPrice =
        box.querySelector(`#discountedPrice_${idx}`)?.value || "";

      if (!sku.trim()) {
        showError(`skuError_${idx}`, "SKU is required");
        isValid = false;
      } else if (!/^[a-zA-Z0-9\-_]+$/.test(sku.trim())) {
        showError(
          `skuError_${idx}`,
          "SKU may only contain letters, numbers, hyphens, or underscores",
        );
        isValid = false;
      }

      if (stock === "" || isNaN(stock)) {
        showError(`stockError_${idx}`, "Stock quantity is required");
        isValid = false;
      } else if (parseInt(stock) < 0) {
        showError(`stockError_${idx}`, "Stock cannot be negative");
        isValid = false;
      }

      if (!color.trim()) {
        showError(`colorError_${idx}`, "Color is required");
        isValid = false;
      }

      if (!size.trim()) {
        showError(`sizeError_${idx}`, "Size is required");
        isValid = false;
      }

      if (price === "" || isNaN(price)) {
        showError(`priceError_${idx}`, "Price is required");
        isValid = false;
      } else if (parseFloat(price) <= 0) {
        showError(`priceError_${idx}`, "Price must be greater than 0");
        isValid = false;
      }

      if (discPrice !== "") {
        if (isNaN(discPrice) || parseFloat(discPrice) < 0) {
          showError(
            `discountedPriceError_${idx}`,
            "Enter a valid discounted price",
          );
          isValid = false;
        } else if (parseFloat(discPrice) >= parseFloat(price)) {
          showError(
            `discountedPriceError_${idx}`,
            "Discounted price must be less than original price",
          );
          isValid = false;
        }
      }

      // Image validation
      const imageInput = box.querySelector(`#variantImages_${idx}`);
      if (imageInput && imageInput.files.length === 0) {
        showError(
          `imagesError_${idx}`,
          "Please upload at least 1 image for this variant",
        );
        isValid = false;
      } else if (imageInput && imageInput.files.length > 3) {
        showError(`imagesError_${idx}`, "Maximum 3 images allowed per variant");
        isValid = false;
      }
    });

    return isValid;
  };

  // ─── Build variant HTML ──────────────────────────────────────────────────────

  const createVariantHTML = (idx) => `
        <div class="variant-box bg-[#1c2632]/30 border border-[#1c2632] rounded-xl overflow-hidden p-6 space-y-6" data-index="${idx}">
            <div class="flex justify-between items-center">
                <span class="text-xs font-black uppercase tracking-widest text-primary">Variant ${idx}</span>
                <button type="button" onclick="removeVariant(this)" class="text-slate-500 hover:text-red-500 transition-colors">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- SKU -->
                <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">SKU</label>
                    <input id="sku_${idx}" name="sku_${idx}" class="w-full bg-[#101922] border border-[#1c2632] rounded-lg focus:ring-primary focus:border-primary text-white text-sm px-3 py-2" placeholder="FB-GLV-001" type="text" />
                    <p id="skuError_${idx}" class="error-msg hidden text-red-400 text-xs mt-1"></p>
                </div>
                <!-- Stock -->
                <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Quantity</label>
                    <input id="stock_${idx}" name="stock_${idx}" class="w-full bg-[#101922] border border-[#1c2632] rounded-lg focus:ring-primary focus:border-primary text-white text-sm px-3 py-2" placeholder="100" type="number" min="0" />
                    <p id="stockError_${idx}" class="error-msg hidden text-red-400 text-xs mt-1"></p>
                </div>
                <!-- Color -->
                <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Color</label>
                    <input id="color_${idx}" name="color_${idx}" class="w-full bg-[#101922] border border-[#1c2632] rounded-lg focus:ring-primary focus:border-primary text-white text-sm px-3 py-2" placeholder="e.g. Neon Green" type="text" />
                    <p id="colorError_${idx}" class="error-msg hidden text-red-400 text-xs mt-1"></p>
                </div>
                <!-- Size -->
                <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Size</label>
                    <input id="size_${idx}" name="size_${idx}" class="w-full bg-[#101922] border border-[#1c2632] rounded-lg focus:ring-primary focus:border-primary text-white text-sm px-3 py-2" placeholder="e.g. 9" type="text" />
                    <p id="sizeError_${idx}" class="error-msg hidden text-red-400 text-xs mt-1"></p>
                </div>
                <!-- Price -->
                <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Price (₹)</label>
                    <input id="price_${idx}" name="price_${idx}" class="w-full bg-[#101922] border border-[#1c2632] rounded-lg focus:ring-primary focus:border-primary text-white text-sm px-3 py-2" placeholder="49.99" type="number" min="0" step="0.01" />
                    <p id="priceError_${idx}" class="error-msg hidden text-red-400 text-xs mt-1"></p>
                </div>
                <!-- Discounted Price -->
                <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Discounted Price (₹)</label>
                    <input id="discountedPrice_${idx}" name="discountedPrice_${idx}" class="w-full bg-[#101922] border border-[#1c2632] rounded-lg focus:ring-primary focus:border-primary text-white text-sm px-3 py-2" placeholder="39.99" type="number" min="0" step="0.01" />
                    <p id="discountedPriceError_${idx}" class="error-msg hidden text-red-400 text-xs mt-1"></p>
                </div>
            </div>

            <!-- Variant Images -->
            <div class="space-y-3 pt-4 border-t border-[#1c2632]">
                <div class="flex flex-col gap-1">
                    <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Variant Images</label>
                    <p class="text-[10px] text-slate-500 uppercase tracking-widest font-black">Max 3 images for this variant</p>
                </div>
                <div class="relative">
                    <label for="variantImages_${idx}"
                        class="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-[#1c2632] rounded-lg cursor-pointer hover:bg-[#1c2632]/40 transition-colors group">
                        <span class="material-symbols-outlined text-slate-500 group-hover:text-primary">add_a_photo</span>
                        <span class="text-xs font-bold text-slate-500 group-hover:text-primary mt-1">CLICK TO UPLOAD</span>
                    </label>
                    <input id="variantImages_${idx}" name="variantImages_${idx}" type="file" accept="image/*" multiple class="hidden" onchange="previewImages(this, ${idx})" />
                </div>
                <div id="imagePreview_${idx}" class="grid grid-cols-4 gap-3 mt-2"></div>
                <p id="imagesError_${idx}" class="error-msg hidden text-red-400 text-xs mt-1"></p>
            </div>
        </div>
    `;

  // ─── Add Variant ─────────────────────────────────────────────────────────────

  window.addVariant = () => {
    variantCount++;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = createVariantHTML(variantCount).trim();
    variantsContainer.insertBefore(
      wrapper.firstChild,
      document.getElementById("addVariantBtn"),
    );
  };

  // ─── Remove Variant ──────────────────────────────────────────────────────────

  window.removeVariant = (btn) => {
    const box = btn.closest(".variant-box");
    const allBoxes = document.querySelectorAll(".variant-box");
    if (allBoxes.length <= 1) {
      Swal.fire({
        icon: "warning",
        title: "Cannot Remove",
        text: "At least one variant is required.",
        confirmButtonColor: "#137fec",
      });
      return;
    }
    box.remove();
  };

  // ─── Image Preview ───────────────────────────────────────────────────────────

  const variantImageStore = {}; // store images per variant

  window.previewImages = (input, idx) => {
    const previewContainer = document.getElementById(`imagePreview_${idx}`);
    const errorEl = document.getElementById(`imagesError_${idx}`);

    if (!variantImageStore[idx]) {
      variantImageStore[idx] = [];
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp","image/avif",'image/jpg'];

const newFiles = Array.from(input.files);

// validate file types
for (let file of newFiles) {
  if (!allowedTypes.includes(file.type)) {
    showError(`imagesError_${idx}`, "Only JPG, PNG, JPG, AVIF and WEBP images are allowed");
    input.value = ""; // reset input
    return;
  }
}

    // pass validated files to cropper if available
    if (window.openCropQueue && newFiles.length > 0) {
      window.openCropQueue(newFiles, (croppedFiles) => {
        if (croppedFiles && croppedFiles.length > 0) {
          processValidatedFiles(croppedFiles);
        } else {
          input.value = ""; // reset if cancelled or empty
        }
      });
    } else {
      processValidatedFiles(newFiles);
    }

    function processValidatedFiles(processedFiles) {
      // merge old + new files
      let totalFiles = [...variantImageStore[idx], ...processedFiles];

      // limit to 3 images
      if (totalFiles.length > 3) {
        showError(`imagesError_${idx}`, "Maximum 3 images allowed per variant");
        return;
      } else {
        clearError(`imagesError_${idx}`);
      }

      variantImageStore[idx] = totalFiles;

      // clear preview
      previewContainer.innerHTML = "";

      // show all images
      variantImageStore[idx].forEach((file, i) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          const div = document.createElement("div");
          div.className = "relative";

          div.innerHTML = `
              <div class="aspect-square rounded-lg bg-cover bg-center border border-[#1c2632]"
                   style="background-image: url('${e.target.result}')">
              </div>

              <button type="button"
                  onclick="removeImage(${idx}, ${i})"
                  class="absolute top-1 right-1 bg-black/70 text-white text-xs px-1 rounded hover:bg-red-500">
                  ✕
              </button>
          `;

          previewContainer.appendChild(div);
        };

        reader.readAsDataURL(file);
      });

      // IMPORTANT: update input files
      const dataTransfer = new DataTransfer();
      variantImageStore[idx].forEach((file) => dataTransfer.items.add(file));
      input.files = dataTransfer.files;
    }
  };

  //remove images
  window.removeImage = (idx, imageIndex) => {
    const input = document.getElementById(`variantImages_${idx}`);
    const previewContainer = document.getElementById(`imagePreview_${idx}`);

    // remove from store
    variantImageStore[idx].splice(imageIndex, 1);

    // rebuild FileList
    const dataTransfer = new DataTransfer();
    variantImageStore[idx].forEach((file) => dataTransfer.items.add(file));
    input.files = dataTransfer.files;

    // re-render manually (DON'T call previewImages)
    previewContainer.innerHTML = "";

    variantImageStore[idx].forEach((file, i) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const div = document.createElement("div");
        div.className = "relative";

        div.innerHTML = `
                <div class="aspect-square rounded-lg bg-cover bg-center border border-[#1c2632]"
                     style="background-image: url('${e.target.result}')">
                </div>

                <button type="button"
                    onclick="removeImage(${idx}, ${i})"
                    class="absolute top-1 right-1 bg-black/70 text-white text-xs px-1 rounded hover:bg-red-500">
                    ✕
                </button>
            `;

        previewContainer.appendChild(div);
      };

      reader.readAsDataURL(file);
    });
  };

  // ─── Form Submission ─────────────────────────────────────────────────────────

  if (productForm) {
    productForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearAllErrors();

      const name = document.getElementById("productName").value;
      const category = document.getElementById("productCategory").value;
      const description = document.getElementById("productDescription").value;

      const generalValid = validateGeneralInfo(name, category, description);
      const variantsValid = validateVariants();

      if (!generalValid || !variantsValid) return;

      // Build FormData (supports file uploads)
      const formData = new FormData(productForm);

      // Collect variant metadata
      const variantBoxes = document.querySelectorAll(".variant-box");
      const variantCount = variantBoxes.length;
      formData.append("variantCount", variantCount);

      // Disable submit button to prevent double submission
      const submitBtn = document.getElementById("submitProductBtn");
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="material-symbols-outlined text-sm animate-spin">autorenew</span> Saving...`;

      try {
        const response = await fetch("/admin/product-added", {
          method: "POST",
          body: formData, // multipart/form-data (no Content-Type header needed)
        });

        const result = await response.json();

        if (response.ok && result.success !== false) {
          Swal.fire({
            icon: "success",
            title: "Product Added!",
            text: result.message || "Product has been saved successfully.",
            confirmButtonColor: "#137fec",
          }).then(() => {
            window.location.href = "/admin/products";
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Failed",
            text: result.message || "Could not save product. Please try again.",
            confirmButtonColor: "#137fec",
          });
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span class="material-symbols-outlined text-sm font-bold">save</span> SAVE PRODUCT`;
        }
      } catch (error) {
        console.error("Error adding product:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An unexpected error occurred. Please try again.",
          confirmButtonColor: "#137fec",
        });
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span class="material-symbols-outlined text-sm font-bold">save</span> SAVE PRODUCT`;
      }
    });
  }

  // ─── Live clear errors on input ──────────────────────────────────────────────

  document
    .getElementById("productName")
    ?.addEventListener("input", () => clearError("nameError"));
  document
    .getElementById("productCategory")
    ?.addEventListener("change", () => clearError("categoryError"));
  document
    .getElementById("productDescription")
    ?.addEventListener("input", () => clearError("descriptionError"));
});
