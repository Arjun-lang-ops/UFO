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
        submitButton.innerHTML = '<span class="truncate">Logging in...</span>';
        submitButton.classList.add('opacity-75', 'cursor-not-allowed');

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
                // Success: Show message and redirect
                const successDiv = document.createElement('div');
                successDiv.className = 'form-global-message w-full p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 font-medium text-center';
                successDiv.textContent = 'Login successful! Redirecting...';
                form.prepend(successDiv);

                // Optional: Redirect after a short delay
                setTimeout(() => {
                    window.location.href = data.redirectUrl || '/';
                }, 1000);
            } else {
                // Server Error
                const errorDiv = document.createElement('div');
                errorDiv.className = 'form-global-message w-full p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 font-medium text-center';
                errorDiv.textContent = data.message || 'Login failed. Please check your credentials.';
                form.prepend(errorDiv);

                // Re-enable button
                submitButton.disabled = false;
                submitButton.innerHTML = originalBtnContent;
                submitButton.classList.remove('opacity-75', 'cursor-not-allowed');
            }

        } catch (error) {
            console.error('Login Error:', error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-global-message w-full p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 font-medium text-center';
            errorDiv.textContent = 'Network error. Please try again later.';
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
