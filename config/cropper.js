
let cropper;
let currentInput;
let currentIndex;

// Open crop modal
function handleImageSelect(event, idx) {
  const file = event.target.files[0];
  if (!file) return;

  currentInput = event.target;
  currentIndex = idx;

  const reader = new FileReader();
  reader.onload = function (e) {
    document.getElementById("cropModal").classList.remove("hidden");
    const img = document.getElementById("cropImage");
    img.src = e.target.result;

    if (cropper) cropper.destroy();

    cropper = new Cropper(img, {
      aspectRatio: 1, // square (change if needed)
      viewMode: 1,
    });
  };

  reader.readAsDataURL(file);
}

// Crop and replace file
function cropImage() {
  const canvas = cropper.getCroppedCanvas({
    width: 500,
    height: 500,
  });

  canvas.toBlob((blob) => {
    const file = new File([blob], "cropped.jpg", {
      type: "image/jpeg",
    });

    const dt = new DataTransfer();
    dt.items.add(file);

    currentInput.files = dt.files;

    previewImages(currentInput, currentIndex); // your existing preview

    closeCrop();
  });
}

// Close modal
function closeCrop() {
  document.getElementById("cropModal").classList.add("hidden");
  if (cropper) cropper.destroy();
}
