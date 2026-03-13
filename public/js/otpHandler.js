document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.otp-input');
    const form = document.getElementById('otpForm');
    const userEmailSpan = document.getElementById('userEmail');
    const resendBtn = document.getElementById('resendBtn');
    const timerSpan = document.getElementById('timer');
    const otpError = document.getElementById('otpError');

    // Get email from query params
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const type = urlParams.get('type');

    if (email) {
        userEmailSpan.textContent = email;
    } else {
        // Fallback or redirect if no email
        userEmailSpan.textContent = "unknown";
        // window.location.href = '/register'; 
    }

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
    // Resend Logic
    resendBtn.addEventListener('click', async () => {
        if (timeLeft > 0) return;

        try {
            resendBtn.textContent = "Sending...";

            let resendUrl = '/resend-otp';
            if (type === 'forgot') {
                resendUrl = '/resend-forgot-otp';
            }

            const response = await fetch(resendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const result = await response.json();

            if (result.success) {
                startTimer();
                otpError.classList.add('hidden');

                // Show success message temporarily
                const originalText = resendBtn.textContent;
                resendBtn.textContent = "OTP Resent!";
                setTimeout(() => {
                    resendBtn.textContent = "Resend Code"; // Will be overwritten by timer loop if active, but good fallback
                }, 2000);
            } else {
                otpError.textContent = result.message;
                otpError.classList.remove('hidden');
                resendBtn.textContent = "Resend Code";
            }
        } catch (error) {
            console.error(error);
            otpError.textContent = "Failed to resend OTP";
            otpError.classList.remove('hidden');
            resendBtn.textContent = "Resend Code";
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
                // Handle pasting or fast typing if it somehow bypasses other checks
                // We'll take the first char for this input
                e.target.value = value[0];
                // And try to distribute the rest? 
                // Better handled in paste event, but let's just focus next for now
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

        try {
            let verifyUrl = '/verify-otp';
            if (type === 'forgot') {
                verifyUrl = '/verify-forgot-otp';
            }

            const response = await fetch(verifyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });

            const result = await response.json();

            if (result.success) {
                // Redirect to home or login logic
                if (type === 'forgot') {
                    window.location.href = `/reset-password?email=${encodeURIComponent(email)}`;
                } else {
                    window.location.href = '/login';
                }
            } else {
                otpError.textContent = result.message;
                otpError.classList.remove('hidden');
                // Clear inputs on failure? Optional
                // inputs.forEach(input => input.value = '');
                // inputs[0].focus();
            }
        } catch (error) {
            console.error(error);
            otpError.textContent = "An error occurred during verification";
            otpError.classList.remove('hidden');
        }
    });
});
