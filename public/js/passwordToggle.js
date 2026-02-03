document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".password-toggle").forEach((btn) => {
    const input = btn.previousElementSibling;
    const icon = btn.querySelector("span");

    if (!input || input.type !== "password") return;

    btn.addEventListener("click", () => {
      input.type = input.type === "password" ? "text" : "password";
      icon.textContent =
        input.type === "password" ? "visibility" : "visibility_off";
    });
  });
});
