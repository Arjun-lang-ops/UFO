document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");

  const fullname = document.getElementById("fullname");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");
  const referralCodeInput = document.getElementById("referralCode"); // reference the element, not its value

  // Populate referral code from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const refParam = urlParams.get('ref');
  if (refParam && referralCodeInput) {
    referralCodeInput.value = refParam.toUpperCase();
  }

  const nameError = document.getElementById("nameError");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");
  const confirmError = document.getElementById("confirmPasswordError");
  const referralError = document.getElementById("referralError");

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
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!pattern.test(password.value)) {
      showError(
        passwordError,
        "Password must be at least 8 characters and include uppercase, lowercase and a number",
      );
      return false;
    }
    hideError(passwordError);
    return true;
  }

  function validateConfirmPassword() {
    if (
      confirmPassword.value !== password.value ||
      confirmPassword.value === ""
    ) {
      showError(confirmError, "Passwords do not match");
      return false;
    }
    hideError(confirmError);
    return true;
  }

  // ✅ Moved inside as a function, reads value at call time
  function validateReferralCode() {
    const val = referralCodeInput.value.trim();
    hideError(referralError);
    if (val && !/^[A-Za-z0-9]{4,20}$/.test(val)) {
      showError(
        referralError,
        "Referral code must be 4–20 letters/numbers only.",
      );
      return false;
    }
    return true;
  }

  function showError(element, message) {
    element.textContent = message;
    element.classList.remove("hidden");
  }

  function hideError(element) {
    element.textContent = "";
    element.classList.add("hidden");
  }

  fullname.addEventListener("input", validateName);
  email.addEventListener("input", validateEmail);
  password.addEventListener("input", () => {
    validatePassword();
    validateConfirmPassword();
  });
  confirmPassword.addEventListener("input", validateConfirmPassword);
  referralCodeInput.addEventListener("input", validateReferralCode); // ✅ live validation

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const generalError = document.getElementById("generalError");
    if (generalError) {
      generalError.textContent = "";
      generalError.classList.add("hidden");
    }

    const isValid =
      validateName() &&
      validateEmail() &&
      validatePassword() &&
      validateConfirmPassword() &&
      validateReferralCode(); // ✅ included in submit check

    if (!isValid) return;

    const data = {
      fullname: fullname.value.trim(),
      email: email.value.trim(),
      password: password.value,
      confirmPassword: confirmPassword.value,
      referralCode: referralCodeInput.value.trim(), // ✅ sent to backend (empty string if skipped)
    };

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      const generalMessage = document.getElementById("generalMessage");

      if (response.ok && result.success) {
        generalMessage.textContent = result.message || "OTP sent successfully";
        generalMessage.classList.remove("hidden", "error-message");
        generalMessage.classList.add("success-message");

        setTimeout(() => {
          window.location.href = `/otp?email=${encodeURIComponent(data.email)}`;
        }, 2000);
      } else {
        if (generalMessage) {
          generalMessage.textContent = result.message || "Registration failed";
          generalMessage.classList.remove("hidden", "success-message");
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
