document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.otp-input');
    const form = document.querySelector('form');

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
});
