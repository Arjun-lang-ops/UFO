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
    if (password.value.length < 8) {
      showError(passwordError, "Password must be at least 8 characters");
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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Reset general error
    const generalError = document.getElementById("generalError");
    if (generalError) {
      generalError.textContent = "";
      generalError.classList.add("hidden");
    }

    const isValid =
      validateName() &&
      validateEmail() &&
      validatePassword() &&
      validateConfirmPassword();

    if (!isValid) return;

    const data = {
      fullname: fullname.value.trim(),
      email: email.value.trim(),
      password: password.value,
      confirmPassword: confirmPassword.value // Include if backend expects it, though typically not needed
    };

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();

     const generalMessage = document.getElementById("generalMessage");

if (response.ok && result.success) {

  // Show success message
  generalMessage.textContent = result.message || "OTP sent successfully";
  generalMessage.classList.remove("hidden");
  generalMessage.classList.remove("error-message");
  generalMessage.classList.add("success-message");

  // Redirect after 2 seconds
  setTimeout(() => {
    window.location.href = `/otp?email=${encodeURIComponent(data.email)}`;
  }, 2000);

} else {
  if (generalMessage) {
    generalMessage.textContent = result.message || "Registration failed";
    generalMessage.classList.remove("hidden");
    generalMessage.classList.remove("success-message");
    generalMessage.classList.add("error-message");
  }
}


    } catch (err) {
      console.error(err);
      if (generalError) {
        generalError.textContent = "Server error. Please try again.";
        generalError.classList.remove("hidden");
      }
    }
  });

});
