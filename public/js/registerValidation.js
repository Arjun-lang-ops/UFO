document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");

  const fullname = document.getElementById("fullname");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");

  const nameError = document.getElementById("nameError");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");
  const confirmError = document.getElementById("confirmPasswordError");

  /* ---------- Validation Functions ---------- */

  function validateName() {
    if (fullname.value.trim().length < 3) {
      showError(nameError, "Full name must be at least 3 characters");
      return false;
    }
    hideError(nameError);
    return true;
  }

  function validateEmail() {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(email.value.trim())) {
      showError(emailError, "Enter a valid email address");
      return false;
    }
    hideError(emailError);
    return true;
  }

  function validatePassword() {
    if (password.value.length < 6) {
      showError(passwordError, "Password must be at least 6 characters");
      return false;
    }
    hideError(passwordError);
    return true;
  }

  function validateConfirmPassword() {
    if (confirmPassword.value !== password.value || confirmPassword.value === "") {
      showError(confirmError, "Passwords do not match");
      return false;
    }
    hideError(confirmError);
    return true;
  }

  /* ---------- Helpers ---------- */

  function showError(element, message) {
    element.textContent = message;
    element.classList.remove("hidden");
  }

  function hideError(element) {
    element.textContent = "";
    element.classList.add("hidden");
  }

  /* ---------- LIVE Validation ---------- */

  fullname.addEventListener("input", validateName);
  email.addEventListener("input", validateEmail);
  password.addEventListener("input", () => {
    validatePassword();
    validateConfirmPassword();
  });
  confirmPassword.addEventListener("input", validateConfirmPassword);

  /* ---------- Submit Validation ---------- */

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const isValid =
      validateName() &
      validateEmail() &
      validatePassword() &
      validateConfirmPassword();

    if (!isValid) return;

    // 🔥 Ready for AJAX / OTP redirect
    // console.log("Form is valid — send data to server");

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          window.location.href = `/otp?email=${encodeURIComponent(data.email)}`;
        } else {
          // Show error (generic or specific)
          // For simplicity, using alert or finding a place to show global error
          // Assuming the individual field errors might be returned or just a general message
          alert(result.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      });

  });
});
