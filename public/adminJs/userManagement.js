document.addEventListener("DOMContentLoaded", () => {
  // Select all 'more_vert' buttons in the user table

  const optionsButtons = document.querySelectorAll(
    ".material-symbols-outlined",
  );

  // We only want the ones in the table rows
  const tableOptionsButtons = Array.from(optionsButtons).filter(
    (btn) => btn.textContent.trim() === "more_vert" && btn.closest("tr"),
  );

  let activeDropdown = null;

  tableOptionsButtons.forEach((icon) => {
    const button = icon.closest("button");
    if (!button) return;

    button.addEventListener("click", (e) => {
      e.stopPropagation();

      // Close existing dropdown if any
      if (activeDropdown) {
        activeDropdown.remove();
        if (activeDropdown.sourceButton === button) {
          activeDropdown = null;
          return; // Toggle off
        }
      }

      const tr = button.closest("tr");
      if (!tr) return;

      // Find the status badge in this row
      const statusCell = tr.querySelector("td:nth-child(4)"); // 4th column is Status
      if (!statusCell) return;

      const statusBadge = statusCell.querySelector("span");
      if (!statusBadge) return;

      const isBlocked =
        statusBadge.textContent.trim().toLowerCase() === "suspended" ||
        statusBadge.textContent.trim().toLowerCase() === "blocked";

      // Create dropdown menu
      const dropdown = document.createElement("div");
      dropdown.className =
        "absolute right-0 mt-2 w-40 bg-white dark:bg-[#111418] border border-slate-200 dark:border-[#3b4754] rounded-lg shadow-lg z-50 overflow-hidden text-sm font-medium";
      // Position it relative to the button
      const buttonRect = button.getBoundingClientRect();
      // Since the button's parent td has text-right, we can append the dropdown to the td and position it absolutely, or just format it nicely.
      // Let's ensure the parent td has relative positioning so our absolute dropdown works.
      const td = button.closest("td");
      td.style.position = "relative";

      // Setting position to absolute right-0 top-full inside the td
      dropdown.style.top = "100%";
      dropdown.style.right = "1rem";

      const actionBtn = document.createElement("button");
      actionBtn.className = `w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-[#283039] transition-colors flex items-center gap-2 ${isBlocked ? "text-emerald-500" : "text-red-500"}`;

      const iconSpan = document.createElement("span");
      iconSpan.className = "material-symbols-outlined text-[18px]";
      iconSpan.textContent = isBlocked ? "check_circle" : "block";

      const textSpan = document.createElement("span");
      textSpan.textContent = isBlocked ? "Unblock User" : "Block User";

      actionBtn.appendChild(iconSpan);
      actionBtn.appendChild(textSpan);
      dropdown.appendChild(actionBtn);

      // Handle the action click
      actionBtn.addEventListener("click", async (e) => {
        e.stopPropagation();

        const tr = button.closest("tr");
        const userId = tr.dataset.userId;

        // Close dropdown before showing modal
        dropdown.remove();
        activeDropdown = null;

        const actionTitle = isBlocked ? "Unblock User?" : "Block User?";
        const actionMessage = isBlocked
          ? "Are you sure you want to unblock this user?"
          : "Are you sure you want to block this user?";
        const confirmBtnColor = isBlocked ? "#10b981" : "#ef4444";
        const confirmBtnText = isBlocked ? "Yes, unblock" : "Yes, block";

        const result = await Swal.fire({
          title: actionTitle,
          text: actionMessage,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: confirmBtnColor,
          cancelButtonColor: "#6b7280",
          confirmButtonText: confirmBtnText,
          cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;

        try {
          const response = await fetch(`/admin/block-user/${userId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
            }),
          });

          const data = await response.json();
          console.log(data);
          if (data.success) {
            const badge = tr.querySelector(".status-badge");

            if (isBlocked) {
              // User was blocked, now unblocked
              badge.textContent = "Active";
              badge.classList.remove("bg-amber-100", "text-amber-700");
              badge.classList.add("bg-emerald-100", "text-emerald-700");

              Swal.fire({
                title: "Unblocked!",
                text: "User has been unblocked successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              // User was active, now blocked
              badge.textContent = "Blocked";
              badge.classList.remove("bg-emerald-100", "text-emerald-700");
              badge.classList.add("bg-amber-100", "text-amber-700");

              Swal.fire({
                title: "Blocked!",
                text: "User has been blocked successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            }
          } else {
            Swal.fire({
              title: "Error!",
              text: data.message || "Failed to update user status.",
              icon: "error",
            });
          }
        } catch (error) {
          console.error("Error:", error);
          Swal.fire({
            title: "Error!",
            text: "Something went wrong. Please try again.",
            icon: "error",
          });
        }
      });

      td.appendChild(dropdown);
      dropdown.sourceButton = button;
      activeDropdown = dropdown;
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", () => {
    if (activeDropdown) {
      activeDropdown.remove();
      activeDropdown = null;
    }
  });
});
