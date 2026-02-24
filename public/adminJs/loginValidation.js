document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("adminLoginForm");
  const email = document.getElementById("adminEmail");
  const password = document.getElementById("adminPassword");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;

  // Helper functions for validation UI
  function showError(input, errorElement, message) {
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");

    // Add red border to input
    input.classList.remove("border-gray-300", "dark:border-[#3b4754]");
    input.classList.add("border-red-500", "dark:border-red-500");

    // Add red border to icon container sibling if exists
    const iconContainer = input.nextElementSibling;
    if (iconContainer) {
      iconContainer.classList.remove("border-gray-300", "dark:border-[#3b4754]");
      iconContainer.classList.add("border-red-500", "dark:border-red-500");
    }
  }

  function hideError(input, errorElement) {
    errorElement.textContent = "";
    errorElement.classList.add("hidden");

    // Remove red border from input
    input.classList.remove("border-red-500", "dark:border-red-500");
    input.classList.add("border-gray-300", "dark:border-[#3b4754]");

    // Remove red border from icon container sibling if exists
    const iconContainer = input.nextElementSibling;
    if (iconContainer) {
      iconContainer.classList.remove("border-red-500", "dark:border-red-500");
      iconContainer.classList.add("border-gray-300", "dark:border-[#3b4754]");
    }
  }

  function validateEmailFormat(value) {
    // Simple email validation regex
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  }

  // Validation logic for individual fields
  function validateEmail() {
    const value = email.value.trim();
    if (value === "") {
      showError(email, emailError, "Email is required");
      return false;
    } else if (!validateEmailFormat(value)) {
      showError(email, emailError, "Enter a valid email address");
      return false;
    }
    hideError(email, emailError);
    return true;
  }

  function validatePassword() {
    const value = password.value.trim();
    if (value === "") {
      showError(password, passwordError, "Password is required");
      return false;
    } else if (value.length < 6) {
      showError(password, passwordError, "Password must be at least 6 characters");
      return false;
    }
    hideError(password, passwordError);
    return true;
  }

  // Live validation (on input and blur)
  email.addEventListener("input", validateEmail);
  email.addEventListener("blur", validateEmail);

  password.addEventListener("input", validatePassword);
  password.addEventListener("blur", validatePassword);

  // Form Submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate all fields
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) {
      return; // Do nothing if validation fails
    }

    // Disable button & show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = "Logging in...";
    submitBtn.classList.add("opacity-70", "cursor-not-allowed");

    try {
      // Send AJAX POST request to backend
      const response = await fetch("/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.value.trim(),
          password: password.value.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to /admin/dashboard on success
        window.location.href = "/admin/dashboard";
      } else {
        // Show error under password field on failure
        showError(password, passwordError, data.message || "Invalid credentials");
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        submitBtn.classList.remove("opacity-70", "cursor-not-allowed");
      }

    } catch (error) {
      // Handle network and unexpected errors properly
      showError(password, passwordError, "Something went wrong. Try again.");
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      submitBtn.classList.remove("opacity-70", "cursor-not-allowed");
    }
  });
});
