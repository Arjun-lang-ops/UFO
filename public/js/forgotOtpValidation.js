document.addEventListener("DOMContentLoaded", () => {
  // --- Email Display ---
  const displayEmail = document.getElementById("display-email");
  const storedEmail = localStorage.getItem("forgotPasswordEmail");

  if (storedEmail && displayEmail) {
    displayEmail.textContent = storedEmail;
  }

  // --- OTP Input Navigation & Paste ---
  const form = document.querySelector("form");
  const inputs = document.querySelectorAll("input[type='text'][inputmode='numeric']");
  const submitBtn = form.querySelector("button[type='submit']");
  
  inputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      if (e.target.value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && e.target.value === "" && index > 0) {
        inputs[index - 1].focus();
      }
    });
    
    // Auto-select text on focus
    input.addEventListener("focus", (e) => {
      e.target.select();
    });

    // Handle Paste
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text").trim();
      
      // Check if it's exactly 6 digits
      if (/^\d{6}$/.test(pastedData)) {
        inputs.forEach((inp, idx) => {
          inp.value = pastedData[idx];
        });
        // Focus on the last input or automatically submit
        inputs[5].focus();
      }
    });

  });

  // --- Resend Timer Validation ---
  const resendBtn = document.getElementById("resend-btn");
  const timerDisplay = document.getElementById("timer");

  let timeLeft = 60;
  let timerId;

  function startTimer() {
    timeLeft = 60;
    resendBtn.disabled = true;
    resendBtn.classList.add("disabled:opacity-50", "disabled:cursor-not-allowed");

    timerId = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(timerId);
        timerDisplay.innerHTML = "00:00";
        resendBtn.disabled = false;
        resendBtn.classList.remove("disabled:opacity-50", "disabled:cursor-not-allowed");
      } else {
        const seconds = timeLeft.toString().padStart(2, "0");
        timerDisplay.innerHTML = `00:${seconds}`;
      }
    }, 1000);
  }

  // Start the 60 seconds timer immediately
  startTimer();

  // --- Helpers for showing messages ---
  function showMessage(type, message) {
    // Remove existing
    const existingMsg = document.getElementById("otp-message");
    if (existingMsg) existingMsg.remove();

    const msgDiv = document.createElement("p");
    msgDiv.id = "otp-message";
    msgDiv.className = `text-sm mt-2 font-medium text-center ${type === 'error' ? 'text-red-500' : 'text-emerald-500'}`;
    msgDiv.textContent = message;
    
    form.insertBefore(msgDiv, submitBtn.parentElement);
  }

  // --- Resend Button Fetch ---
  resendBtn.addEventListener("click", async () => {
    if (resendBtn.disabled) return;

    if (!storedEmail) {
      showMessage("error", "Email not found. Please try starting over.");
      return;
    }

    try {
      resendBtn.textContent = "Sending...";
      resendBtn.disabled = true;

      const response = await fetch("/resend-forgot-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: storedEmail })
      });
      console.log('stored Eamial: ',storedEmail)

      const data = await response.json();

      if (data.success) {
        showMessage("success", data.message || "OTP resent successfully.");
        // Re-start the timer upon success
        startTimer();
      } else {
        showMessage("error", data.message || "Failed to resend OTP.");
        resendBtn.disabled = false;
      }

    } catch (error) {
      console.error(error);
      showMessage("error", "Network error. Please try again.");
      resendBtn.disabled = false;
    } finally {
      resendBtn.textContent = "Resend Code";
    }
  });


  // --- Submit OTP Fetch ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Gather OTP from inputs
    let otp = "";
    inputs.forEach(input => {
      otp += input.value;
    });

    if (otp.length !== 6) {
      showMessage("error", "Please enter all 6 digits of the OTP.");
      return;
    }

    if (!storedEmail) {
      showMessage("error", "Email not found. Please try starting over.");
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Verifying...";

      // NOTE: Using a hypothetical endpoint (/verify-forgot-otp)
      // Change to the actual backend endpoint you have set up!
      const response = await fetch("/verify-forgot-otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: storedEmail,
            otp: otp
        })
      });

      const data = await response.json();

      if (data.success) {
        showMessage("success", "OTP verified successfully.");
        // Change window location to reset password form or appropriately
        window.location.href = data.redirect || "/forgotPassword/otp"; 
        // e.g. window.location.href = "/reset-password";
      } else {
        showMessage("error", data.message || "Invalid OTP.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Verify OTP";
      }

    } catch (error) {
      console.error(error);
      showMessage("error", "Network error. Please try again.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Verify OTP";
    }

  });

});
