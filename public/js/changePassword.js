/**
 * changePassword.js
 * Production-level vanilla JS for the Change Password page.
 * Handles: AJAX submit, client-side validation, loading state,
 *          success/error alerts, password toggle, strength indicator.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ─────────────────────────────────────────────
    // 1. DOM REFERENCES
    // ─────────────────────────────────────────────
    const form = document.querySelector('form');
    const inputs = form ? [...form.querySelectorAll('input[type="password"]')] : [];
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    const toggleBtns = form ? [...form.querySelectorAll('.password-toggle')] : [];
    const strengthEl = form ? form.querySelector('.strength-label') : null; // dynamic ref (see EJS tweak)

    // Guard — abort if essential elements are missing
    if (!form || inputs.length < 3 || !submitBtn) {
        console.error('[changePassword] Required form elements not found.');
        return;
    }

    // Named references for clarity
    const currentPwdInput = inputs[0];
    const newPwdInput = inputs[1];
    const confirmPwdInput = inputs[2];

    // ─────────────────────────────────────────────
    // 2. INJECT REQUIRED STYLES (transitions, spinner, alerts)
    // ─────────────────────────────────────────────
    const style = document.createElement('style');
    style.textContent = `
    /* ── Error message slide-in ── */
    .error-message {
      overflow: hidden;
      max-height: 0;
      opacity: 0;
      transition: max-height 0.25s ease, opacity 0.25s ease, margin-top 0.25s ease;
      margin-top: 0;
    }
    .error-message.visible {
      max-height: 40px;
      opacity: 1;
      margin-top: 4px;
    }

    /* ── Global alert fade-in ── */
    .global-alert {
      opacity: 0;
      transform: translateY(-6px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    .global-alert.visible {
      opacity: 1;
      transform: translateY(0);
    }

    /* ── Loading spinner ── */
    @keyframes cp-spin {
      to { transform: rotate(360deg); }
    }
    .cp-spinner {
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: cp-spin 0.7s linear infinite;
      vertical-align: middle;
    }

    /* ── Strength bar ── */
    .strength-bar-track {
      height: 4px;
      border-radius: 9999px;
      background: #e2e8f0;
      overflow: hidden;
      margin-top: 6px;
    }
    .dark .strength-bar-track { background: #283039; }
    .strength-bar-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.35s ease, background-color 0.35s ease;
      width: 0%;
    }
  `;
    document.head.appendChild(style);

    // ─────────────────────────────────────────────
    // 3. PASSWORD STRENGTH INDICATOR
    //    Hooks onto the existing static <p> that shows strength text.
    //    We enhance it with a colour-coded bar beneath.
    // ─────────────────────────────────────────────

    /**
     * Calculates password strength score (0–4).
     * @param {string} pwd
     * @returns {{ score: number, label: string, color: string, width: string }}
     */
    const getStrength = (pwd) => {
        let score = 0;
        if (pwd.length >= 6) score++;
        if (pwd.length >= 10) score++;
        if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        const levels = [
            { label: '─', color: '#94a3b8', width: '0%' },  // empty
            { label: 'Weak', color: '#ef4444', width: '25%' },
            { label: 'Fair', color: '#f97316', width: '50%' },
            { label: 'Good', color: '#eab308', width: '75%' },
            { label: 'Strong', color: '#22c55e', width: '90%' },
            { label: 'Very Strong', color: '#16a34a', width: '100%' },
        ];
        return levels[Math.min(score, 5)];
    };

    // Find the existing static strength <p> (has class: text-[10px] text-slate-500 ...)
    const staticStrengthP = newPwdInput
        .closest('.flex.flex-col.gap-1\\.5')
        ?.querySelector('p');

    // Build the bar element and inject it after the strength text
    let strengthBarFill = null;
    if (staticStrengthP) {
        const barTrack = document.createElement('div');
        barTrack.className = 'strength-bar-track';
        strengthBarFill = document.createElement('div');
        strengthBarFill.className = 'strength-bar-fill';
        barTrack.appendChild(strengthBarFill);
        staticStrengthP.insertAdjacentElement('afterend', barTrack);
    }

    /**
     * Updates the strength label & bar on input.
     */
    const updateStrength = () => {
        const pwd = newPwdInput.value;
        const result = pwd.length === 0
            ? { label: '─', color: '#94a3b8', width: '0%' }
            : getStrength(pwd);

        // Update the <span> inside the static <p>
        if (staticStrengthP) {
            const span = staticStrengthP.querySelector('span');
            if (span) {
                span.textContent = result.label;
                span.style.color = result.color;
            }
        }

        // Update bar
        if (strengthBarFill) {
            strengthBarFill.style.width = result.width;
            strengthBarFill.style.backgroundColor = result.color;
        }
    };

    newPwdInput.addEventListener('input', updateStrength);
    updateStrength(); // Init to empty state

    // ─────────────────────────────────────────────
    // 4. PASSWORD VISIBILITY TOGGLE
    //    Each .password-toggle button toggles its sibling input.
    // ─────────────────────────────────────────────

    /**
     * Toggles a password input between text/password visibility.
     * @param {HTMLInputElement} input
     * @param {HTMLButtonElement} btn
     */
    const toggleVisibility = (input, btn) => {
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';

        // Swap the Material Symbol icon
        const icon = btn.querySelector('.material-symbols-outlined');
        if (icon) {
            icon.textContent = isHidden ? 'visibility_off' : 'visibility';
        }
    };

    // Wire up each toggle button to its adjacent input
    toggleBtns.forEach((btn, i) => {
        if (inputs[i]) {
            btn.addEventListener('click', () => toggleVisibility(inputs[i], btn));
        }
    });

    // ─────────────────────────────────────────────
    // 5. INLINE ERROR HELPERS
    // ─────────────────────────────────────────────

    /**
     * Shows an animated error message below a given input wrapper.
     * @param {HTMLInputElement} input
     * @param {string} message
     */
    const showError = (input, message) => {
        const wrapper = input.parentElement; // div.relative
        let errorEl = wrapper.nextElementSibling;

        // Reuse existing error element if present, else create one
        if (!errorEl || !errorEl.classList.contains('error-message')) {
            errorEl = document.createElement('p');
            errorEl.className = 'error-message text-red-500 text-xs pl-1 font-medium';
            wrapper.insertAdjacentElement('afterend', errorEl);
        }

        errorEl.textContent = message;

        // Add error border to input
        input.classList.add('!border-red-500', '!ring-red-500');

        // Trigger animation on next frame
        requestAnimationFrame(() => errorEl.classList.add('visible'));
    };

    /**
     * Clears the error state for an input.
     * @param {HTMLInputElement} input
     */
    const clearError = (input) => {
        const wrapper = input.parentElement;
        const errorEl = wrapper.nextElementSibling;

        if (errorEl && errorEl.classList.contains('error-message')) {
            errorEl.classList.remove('visible');
            // Remove from DOM after transition
            errorEl.addEventListener('transitionend', () => errorEl.remove(), { once: true });
        }

        input.classList.remove('!border-red-500', '!ring-red-500');
    };

    // Clear errors on input (real-time feedback)
    inputs.forEach(input => {
        input.addEventListener('input', () => clearError(input));
    });

    // ─────────────────────────────────────────────
    // 6. GLOBAL ALERT (success / server error)
    // ─────────────────────────────────────────────

    /**
     * Shows a dismissible global alert above the form.
     * @param {'success'|'error'} type
     * @param {string} message
     * @param {number} [autoDismissMs] - ms to auto-hide (0 = never)
     */
    const showGlobalAlert = (type, message, autoDismissMs = 0) => {
        // Remove any existing alerts
        form.querySelectorAll('.global-alert').forEach(el => el.remove());

        const isSuccess = type === 'success';
        const alert = document.createElement('div');
        alert.className = [
            'global-alert',
            'flex items-center gap-3 p-4 mb-2 rounded-lg text-sm font-medium border',
            isSuccess
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/40'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/40',
        ].join(' ');

        const iconName = isSuccess ? 'check_circle' : 'error';
        alert.innerHTML = `
      <span class="material-symbols-outlined text-[20px] shrink-0">${iconName}</span>
      <span class="flex-1">${message}</span>
    `;

        form.prepend(alert);

        // Trigger fade-in
        requestAnimationFrame(() => {
            requestAnimationFrame(() => alert.classList.add('visible'));
        });

        // Auto-dismiss
        if (autoDismissMs > 0) {
            setTimeout(() => {
                alert.classList.remove('visible');
                alert.addEventListener('transitionend', () => alert.remove(), { once: true });
            }, autoDismissMs);
        }
    };

    // ─────────────────────────────────────────────
    // 7. LOADING STATE HELPERS
    // ─────────────────────────────────────────────

    const originalBtnHTML = submitBtn.innerHTML;

    /** Puts the submit button into loading state. */
    const setLoading = (loading) => {
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span class="cp-spinner"></span><span class="ml-2">Updating...</span>`;
            submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
            submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        }
    };

    // ─────────────────────────────────────────────
    // 8. CLIENT-SIDE VALIDATION
    // ─────────────────────────────────────────────

    /**
     * Validates all fields before submission.
     * @returns {boolean} true if all valid
     */
    const validateForm = () => {
        let isValid = true;

        const current = currentPwdInput.value;
        const newPwd = newPwdInput.value;
        const confirm = confirmPwdInput.value;

        // Current password
        if (!current.trim()) {
            showError(currentPwdInput, 'Current password is required.');
            isValid = false;
        } else {
            clearError(currentPwdInput);
        }

        // New password
        if (!newPwd) {
            showError(newPwdInput, 'New password is required.');
            isValid = false;
        } else if (newPwd.length < 6) {
            showError(newPwdInput, 'New password must be at least 6 characters.');
            isValid = false;
        } else {
            clearError(newPwdInput);
        }

        // Confirm password
        if (!confirm) {
            showError(confirmPwdInput, 'Please confirm your new password.');
            isValid = false;
        } else if (confirm !== newPwd) {
            showError(confirmPwdInput, 'Passwords do not match.');
            isValid = false;
        } else {
            clearError(confirmPwdInput);
        }

        return isValid;
    };

    // ─────────────────────────────────────────────
    // 9. FORM SUBMISSION — AJAX with fetch()
    // ─────────────────────────────────────────────

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent full page reload

        // Remove any stale global alerts
        form.querySelectorAll('.global-alert').forEach(el => el.remove());

        // Run validation first
        if (!validateForm()) return;

        const currentPassword = currentPwdInput.value;
        const newPassword = newPwdInput.value;
        const confirmNewPassword = confirmPwdInput.value;

        // Enter loading state
        setLoading(true);

        try {
            const response = await fetch('/profile/update-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials:"include",
                body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                // ── SUCCESS ──────────────────────────────
                showGlobalAlert('success', data.message || 'Password updated successfully!', 3000);

                // Clear all inputs
                inputs.forEach(input => {
                    input.value = '';
                    // Reset visibility to hidden
                    input.type = 'password';
                });

                // Reset eye icons
                toggleBtns.forEach(btn => {
                    const icon = btn.querySelector('.material-symbols-outlined');
                    if (icon) icon.textContent = 'visibility';
                });

                // Reset strength indicator
                updateStrength();

            } else {
                // ── SERVER ERROR ─────────────────────────
                showGlobalAlert('error', data.message || 'Something went wrong. Please try again.');
            }

        } catch (err) {
            // ── NETWORK ERROR ──────────────────────────
            console.error('[changePassword] Network error:', err);
            showGlobalAlert('error', 'Network error. Please check your connection and try again.');

        } finally {
            // Always restore the button
            setLoading(false);
        }
    });

}); // end DOMContentLoaded
