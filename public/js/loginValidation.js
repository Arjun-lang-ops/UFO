document.addEventListener('DOMContentLoaded', () => {
    // Select the form and inputs
    const form = document.querySelector('form');
    // We target inputs by type since modifying HTML to add IDs is restricted
    const emailInput = form ? form.querySelector('input[type="email"]') : null;
    const passwordInput = form ? form.querySelector('input[type="password"]') : null;
    const submitButton = form ? form.querySelector('button[type="submit"]') : null;

    if (!form || !emailInput || !passwordInput || !submitButton) {
        console.error('Login form elements not found');
        return;
    }

    // Helper to show error
    const showError = (input, message) => {
        const inputContainer = input.parentElement; // div.relative
        const label = inputContainer.parentElement; // label

        // Check for existing error message
        let errorEl = inputContainer.nextElementSibling;

        // If the next element is not our error message, create one
        if (!errorEl || !errorEl.classList.contains('error-message')) {
            errorEl = document.createElement('p');
            errorEl.className = 'error-message text-red-500 text-xs mt-1 pl-1 font-medium';
            // Insert after input container
            inputContainer.insertAdjacentElement('afterend', errorEl);
        }

        errorEl.textContent = message;

        // Add error styles to input (red border)
        input.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
        input.classList.remove('focus:border-primary', 'focus:ring-primary'); // Remove primary focus styles to prevent clash
    };

    // Helper to clear error
    const clearError = (input) => {
        const inputContainer = input.parentElement;
        const errorEl = inputContainer.nextElementSibling;

        if (errorEl && errorEl.classList.contains('error-message')) {
            errorEl.remove();
        }

        // Remove error styles
        input.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
        input.classList.add('focus:border-primary', 'focus:ring-primary'); // Restore primary focus styles
    };

    // Clear all global form errors
    const clearGlobalErrors = () => {
        const globalErrors = form.querySelectorAll('.form-global-message');
        globalErrors.forEach(el => el.remove());
    };

    // Validate Email Regex
    const isValidEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    // Handle Form Re-submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Clear previous state
        clearGlobalErrors();
        let isValid = true;
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Validate Email
        if (!email) {
            showError(emailInput, 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false; 
        } else {
            clearError(emailInput);
        }

        // Validate Password
        if (!password) {
            showError(passwordInput, 'Password is required');
            isValid = false;
        } else if (password.length < 8) {
            showError(passwordInput, 'Password must be at least 8 characters');
            isValid = false;
        } else {
            clearError(passwordInput);
        }

        if (!isValid) return;

        // Show loading state
        const originalBtnContent = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <div class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Logging in...</span>
            </div>
        `;
        submitButton.classList.add('opacity-80', 'cursor-not-allowed');

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Success: Show animated card with login icon & spinner, and redirect
                const successDiv = document.createElement('div');
                successDiv.className = 'form-global-message flex items-center justify-center gap-3 w-full p-4 mb-4 text-sm rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium shadow-sm transition-all duration-300';
                successDiv.innerHTML = `
                    <span class="material-symbols-outlined text-emerald-500 text-2xl">check_circle</span>
                    <div class="flex items-center gap-2">
                        <span class="font-semibold text-base">Login Successful!</span>
                        <span class="text-xs opacity-80">Redirecting...</span>
                        <svg class="animate-spin h-4 w-4 text-emerald-500 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                `;
                form.prepend(successDiv);

                submitButton.innerHTML = `
                    <div class="flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined text-xl">sports_soccer</span>
                        <span>Redirecting...</span>
                        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                `;

                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = data.redirectUrl || '/';
                }, 1000);
            } else {
                // Server Error
                const errorDiv = document.createElement('div');
                errorDiv.className = 'form-global-message flex items-center justify-center gap-2 w-full p-4 mb-4 text-sm rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 font-medium shadow-sm';
                errorDiv.innerHTML = `
                    <span class="material-symbols-outlined text-red-500 text-xl">error</span>
                    <span>${data.message || 'Login failed. Please check your credentials.'}</span>
                `;
                form.prepend(errorDiv);

                // Re-enable button
                submitButton.disabled = false;
                submitButton.innerHTML = originalBtnContent;
                submitButton.classList.remove('opacity-75', 'cursor-not-allowed');
            }

        } catch (error) {
            console.error('Login Error:', error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-global-message flex items-center justify-center gap-2 w-full p-4 mb-4 text-sm rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 font-medium shadow-sm';
            errorDiv.innerHTML = `
                <span class="material-symbols-outlined text-red-500 text-xl">wifi_off</span>
                <span>Network error. Please try again later.</span>
            `;
            form.prepend(errorDiv);

            // Re-enable button
            submitButton.disabled = false;
            submitButton.innerHTML = originalBtnContent;
            submitButton.classList.remove('opacity-75', 'cursor-not-allowed');
        }
    });

    // Real-time validation (optional, clears error on typing)
    emailInput.addEventListener('input', () => clearError(emailInput));
    passwordInput.addEventListener('input', () => clearError(passwordInput));
});
