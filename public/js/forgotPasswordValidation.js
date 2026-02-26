
document.addEventListener("DOMContentLoaded", () => {

  const form = document.querySelector("form");
  const emailInput = form.querySelector("input[type='email']");
  const submitBtn = form.querySelector("button[type='submit']");

  /* -------------------------
     ERROR HANDLING
  --------------------------*/
  function showError(message) {
    let errorDiv = document.getElementById("email-error");

    if (!errorDiv) {
      errorDiv = document.createElement("p");
      errorDiv.id = "email-error";
      errorDiv.className = "text-red-500 text-sm mt-2";
      form.insertBefore(errorDiv, submitBtn);
    }

    errorDiv.textContent = message;
  }

  function clearError() {
    const errorDiv = document.getElementById("email-error");
    if (errorDiv) errorDiv.remove();
  }

  /* -------------------------
     EMAIL VALIDATION
  --------------------------*/
  function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /* -------------------------
     FORM SUBMIT (AJAX)
  --------------------------*/
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();

    const email = emailInput.value.trim();

    // Frontend validation
    if (!email) {
      showError("Email address is required.");
      return;
    }

    if (!isValidEmail(email)) {
      showError("Please enter a valid email address.");
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      const response = await fetch("/forgotPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to OTP page
        window.location.href = "/forgotPassword/otp";
      } else {
        showError(data.message || "Failed to send OTP.");
      }

    } catch (error) {
      showError("Network error. Please try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send OTP";
    }
  });

});
