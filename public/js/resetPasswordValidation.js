document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("resetPasswordForm");
  const passwordInput = document.getElementById("new-password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const messageBox = document.getElementById("message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    const email = localStorage.getItem("forgotPasswordEmail");

    messageBox.innerHTML = "";

    // PASSWORD REGEX
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=])[A-Za-z\d!@#$%^&*()_\-+=]{8,}$/;

    // VALIDATION
    if (!passwordRegex.test(password)) {
      messageBox.innerHTML = "Password must be at least 8 characters and include letters, numbers, and symbols.";
      messageBox.style.color = "red";
      return;
    }

    if (password !== confirmPassword) {
      messageBox.innerHTML = "Passwords do not match.";
      messageBox.style.color = "red";
      return;
    }

    if (!email) {
      messageBox.innerHTML = "Session expired. Please restart the reset process.";
      messageBox.style.color = "red";
      return;
    }

    try {

      const response = await fetch("/reset-forgot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          newPassword:password,
          confirmPassword
        })
      });

      const data = await response.json();
      console.log(data)

      if (data.success) {

        messageBox.style.color = "green";
        messageBox.innerHTML = "Password reset successfully.";

        localStorage.removeItem("forgotPasswordEmail");

        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);

      } else {
        messageBox.style.color = "red";
        messageBox.innerHTML = data.message;
      }

    } catch (error) {

      messageBox.style.color = "red";
      messageBox.innerHTML = "Something went wrong. Try again.";

    }

  });

});