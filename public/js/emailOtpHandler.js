document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.otp-input');
    const form = document.getElementById('emailOtpForm');
    const resendBtn = document.getElementById('resendBtn');
    const timerSpan = document.getElementById('timer');
    const otpError = document.getElementById('otpError');
    const submitBtn = document.getElementById('submitBtn');

    // Timer Logic
    let timeLeft = 60; // 1 minute
    let timerId = null;

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    function startTimer() {
        clearInterval(timerId);
        timeLeft = 60;
        timerSpan.textContent = formatTime(timeLeft);
        resendBtn.disabled = true;

        timerId = setInterval(() => {
            timeLeft--;
            timerSpan.textContent = formatTime(timeLeft);

            if (timeLeft <= 0) {
                clearInterval(timerId);
                resendBtn.disabled = false;
            }
        }, 1000);
    }

    // Start timer on load
    startTimer();

    // Resend Logic
    resendBtn.addEventListener('click', async () => {
        if (timeLeft > 0) return;

        try {
            resendBtn.textContent = "Sending...";

            const response = await fetch('/profile/resend-email-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newEmail: "" }) // Handled by server session if needed, or modify if email is required
            });
            const result = await response.json();

            if (result.success) {
                startTimer();
                otpError.classList.add('hidden');

                // Show success message temporarily
                const originalText = resendBtn.textContent;
                resendBtn.textContent = "OTP Resent!";
                setTimeout(() => {
                    resendBtn.textContent = "Resend OTP";
                }, 2000);
            } else {
                otpError.textContent = result.message || "Failed to resend OTP";
                otpError.classList.remove('hidden');
                resendBtn.textContent = "Resend OTP";
            }
        } catch (error) {
            console.error(error);
            otpError.textContent = "Failed to resend OTP";
            otpError.classList.remove('hidden');
            resendBtn.textContent = "Resend OTP";
        }
    });

    // Input Logic
    inputs.forEach((input, index) => {
        // Handle input content
        input.addEventListener('input', (e) => {
            // Allow only numbers
            e.target.value = e.target.value.replace(/[^0-9]/g, '');

            const value = e.target.value;

            if (value.length === 1) {
                // Move to next input if executed
                if (index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            } else if (value.length > 1) {
                e.target.value = value[0];
                if (index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            }
        });

        // Handle navigation (Backspace, Arrow keys)
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                if (input.value === '' && index > 0) {
                    inputs[index - 1].focus();
                }
            } else if (e.key === 'ArrowLeft' && index > 0) {
                inputs[index - 1].focus();
            } else if (e.key === 'ArrowRight' && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        // Handle paste
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');

            if (pasteData) {
                // Distribute pasted data starting from current index
                for (let i = 0; i < pasteData.length; i++) {
                    if (index + i < inputs.length) {
                        inputs[index + i].value = pasteData[i];
                        // Focus the last filled input or the next empty one
                        if (index + i === inputs.length - 1 || i === pasteData.length - 1) {
                            inputs[index + i].focus();
                        } else if (index + i + 1 < inputs.length) {
                            inputs[index + i + 1].focus();
                        }
                    }
                }
            }
        });
    });

    // Verification Logic
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        let otp = '';
        inputs.forEach(input => {
            otp += input.value;
        });

        if (otp.length < 6) {
            otpError.textContent = "Please enter the complete 6-digit code";
            otpError.classList.remove('hidden');
            return;
        }

        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `<svg class="animate-spin w-5 h-5 inline mr-2 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Verifying...`;

        try {
            const response = await fetch('/profile/email-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                window.location.href = '/profile';
            } else {
                otpError.textContent = result.message || "Invalid OTP";
                otpError.classList.remove('hidden');
            }
        } catch (error) {
            console.error(error);
            otpError.textContent = "An error occurred during verification";
            otpError.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
});
