document.addEventListener('DOMContentLoaded', () => {
    // --- Modal Elements ---
    const addAddressModal = document.getElementById('addAddressModal');
    const openBtns = document.querySelectorAll('.add-address-btn');
    const closeBtn = document.getElementById('closeAddAddressModal');
    const cancelBtn = document.getElementById('cancelAddAddressBtn');

    // --- Form Elements ---
    const form = document.getElementById('addAddressForm');
    const submitBtn = document.getElementById('submitAddressBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    // --- Input Elements & Error Displays ---
    const fields = {
        fullname: { input: document.getElementById('fullname'), error: document.getElementById('fullnameError') },
        phone: { input: document.getElementById('phone'), error: document.getElementById('phoneError') },
        street: { input: document.getElementById('street'), error: document.getElementById('streetError') },
        apartment: { input: document.getElementById('apartment'), error: document.getElementById('apartmentError') },
        state: { input: document.getElementById('state'), error: document.getElementById('stateError') },
        country: { input: document.getElementById('country'), error: document.getElementById('countryError') },
        pincode: { input: document.getElementById('pincode'), error: document.getElementById('pincodeError') },
        isDefault: { input: document.getElementById('isDefault') }
    };

    // --- Modal Control Functions ---
    const openModal = () => {
        addAddressModal.classList.remove('hidden');
        addAddressModal.classList.add('flex');
        // Small delay to allow display block to apply before changing opacity
        setTimeout(() => {
            addAddressModal.classList.remove('opacity-0');
            const modalContent = addAddressModal.firstElementChild;
            modalContent.classList.remove('scale-95');
            modalContent.classList.add('scale-100');
        }, 10);
    };

    const closeModal = () => {
        addAddressModal.classList.add('opacity-0');
        const modalContent = addAddressModal.firstElementChild;
        modalContent.classList.remove('scale-100');
        modalContent.classList.add('scale-95');

        setTimeout(() => {
            addAddressModal.classList.add('hidden');
            addAddressModal.classList.remove('flex');
            form.reset();
            clearAllErrors();
        }, 300); // match transition duration
    };

    // --- Event Listeners for Modal ---
    openBtns.forEach(btn => btn.addEventListener('click', openModal));
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Close on backdrop click
    addAddressModal.addEventListener('click', (e) => {
        if (e.target === addAddressModal) {
            closeModal();
        }
    });

    // --- Validation Functions ---
    const showError = (field, message) => {
        field.input.classList.add('border-red-500', 'focus:ring-red-500');
        field.input.classList.remove('border-slate-300', 'dark:border-slate-700', 'focus:ring-primary');
        field.error.textContent = message;
        field.error.classList.remove('hidden');
    };

    const clearError = (field) => {
        field.input.classList.remove('border-red-500', 'focus:ring-red-500');
        field.input.classList.add('border-slate-300', 'dark:border-slate-700', 'focus:ring-primary');
        field.error.textContent = '';
        field.error.classList.add('hidden');
    };

    const clearAllErrors = () => {
        Object.values(fields).forEach(field => {
            if (field.error) clearError(field);
        });
    };

    const validateForm = () => {
        let isValid = true;
        clearAllErrors();

        const fullnameValue = fields.fullname.input.value.trim();
        const phoneValue = fields.phone.input.value.trim();
        const streetValue = fields.street.input.value.trim();
        const stateValue = fields.state.input.value.trim();
        const countryValue = fields.country.input.value.trim();
        const pincodeValue = fields.pincode.input.value.trim();

        // Fullname validation (letters and spaces only, min 3 chars)
        const nameRegex = /^[a-zA-Z\s]{3,50}$/;
        if (!fullnameValue) {
            showError(fields.fullname, 'Full name is required');
            isValid = false;
        } else if (!nameRegex.test(fullnameValue)) {
            showError(fields.fullname, 'Enter a valid full name (letters only, min 3 characters)');
            isValid = false;
        }

        // Phone validation (10 to 15 digits, optional + prefix)
        const phoneRegex = /^\+?[\d\s-]{10,15}$/;
        if (!phoneValue) {
            showError(fields.phone, 'Phone number is required');
            isValid = false;
        } else if (!phoneRegex.test(phoneValue.replace(/\s+/g, ''))) {
            showError(fields.phone, 'Enter a valid phone number');
            isValid = false;
        }

        // Street validation
        if (!streetValue) {
            showError(fields.street, 'Street address is required');
            isValid = false;
        } else if (streetValue.length < 5) {
            showError(fields.street, 'Street address is too short');
            isValid = false;
        }

        // State validation
        if (!stateValue) {
            showError(fields.state, 'State/Province is required');
            isValid = false;
        }

        // Country validation
        if (!countryValue) {
            showError(fields.country, 'Country is required');
            isValid = false;
        }

        // Pincode validation (assuming numeric, min 4 max 10 for global)
        const pinRegex = /^[a-zA-Z0-9\s-]{4,10}$/;
        if (!pincodeValue) {
            showError(fields.pincode, 'ZIP/Pincode is required');
            isValid = false;
        } else if (!pinRegex.test(pincodeValue)) {
            showError(fields.pincode, 'Enter a valid ZIP/Pincode');
            isValid = false;
        }

        return isValid;
    };

    // --- Form Submission Handling ---
    const setLoading = (isLoading) => {
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
            btnText.classList.add('hidden');
            btnLoader.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
        }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        const formData = {
            fullname: fields.fullname.input.value.trim(),
            phone: fields.phone.input.value.trim(),
            street: fields.street.input.value.trim(),
            apartment: fields.apartment.input.value.trim(),
            state: fields.state.input.value.trim(),
            country: fields.country.input.value.trim(),
            pincode: fields.pincode.input.value.trim(),
            isDefault: fields.isDefault.input.checked
        };

        try {
            const response = await fetch('/profile/address/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if(data.success){
                window.location.href=data.redirectUrl
            }

            if (response.ok) {
                closeModal();
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: data.message || 'Address added successfully.',
                    confirmButtonColor: '#137fec',
                    background: document.documentElement.classList.contains('dark') ? '#101922' : '#ffffff',
                    color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000',
                }).then(() => {
                    window.location.reload();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: data.message || 'Failed to add address. Please try again.',
                    confirmButtonColor: '#137fec',
                    background: document.documentElement.classList.contains('dark') ? '#101922' : '#ffffff',
                    color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000',
                });
            }
        } catch (error) {
            console.error('Error adding address:', error);
            Swal.fire({
                icon: 'error',
                title: 'Server Error',
                text: 'Something went wrong. Please try again later.',
                confirmButtonColor: '#137fec',
                background: document.documentElement.classList.contains('dark') ? '#101922' : '#ffffff',
                color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000',
            });
        } finally {
            setLoading(false);
        }
    });

    // --- Real-time Validation (Optional but good UX) ---
    Object.values(fields).forEach(field => {
        if (field.input.type !== 'checkbox') {
            field.input.addEventListener('input', () => {
                if (!field.error.classList.contains('hidden')) {
                    clearError(field);
                }
            });
        }
    });
});

        // Helper to open the Add Address modal
        function openAddAddressModal() {
            const modal = document.getElementById('addAddressModal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            // Trigger animation
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                modal.querySelector('[class*="scale-95"]')?.classList.remove('scale-95');
            }, 10);
        }

        // Permanent "Add New Address" button (top right)
        document.getElementById('openAddAddressModal')?.addEventListener('click', openAddAddressModal);

        // Empty-state "Add New Address" button
        document.getElementById('openAddAddressModalEmpty')?.addEventListener('click', openAddAddressModal);

        let addressToDelete = null;

        // Open modal on Remove click
        document.querySelectorAll('.delete-address').forEach(btn => {
            btn.addEventListener('click', function () {
                addressToDelete = this.dataset.id;
                document.getElementById('deleteModal').classList.remove('hidden');
                document.getElementById('deleteModal').classList.add('flex');
            });
        });

        // No button — close modal
        document.getElementById('noBtn').addEventListener('click', function () {
            document.getElementById('deleteModal').classList.add('hidden');
            document.getElementById('deleteModal').classList.remove('flex');
            addressToDelete = null;
        });

        // Yes button — AJAX delete
        document.getElementById('yesBtn').addEventListener('click', async function () {
            if (!addressToDelete) return;

            document.getElementById('deleteModal').classList.add('hidden');
            document.getElementById('deleteModal').classList.remove('flex');

            try {
                const res = await fetch(`/profile/address/remove/${addressToDelete}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await res.json();

                if (res.ok && data.success) {
                    // Remove the card from the DOM
                    const card = document.querySelector(`button[data-id="${addressToDelete}"]`)?.closest('[class*="rounded-xl"]');
                    if (card) card.remove();
                    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Address removed', showConfirmButton: false, timer: 2500 });
                } else {
                    Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: data.message || 'Failed to remove', showConfirmButton: false, timer: 2500 });
                }
            } catch (err) {
                Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Something went wrong', showConfirmButton: false, timer: 2500 });
            }

            addressToDelete = null;
        });

        // Set as Default AJAX
        document.querySelectorAll('.set-default-address').forEach(btn => {
            btn.addEventListener('click', async function () {
                const addressId = this.dataset.id;
                try {
                    const res = await fetch(`/profile/address/default/${addressId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    const data = await res.json();

                    if (res.ok && data.success) {
                        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: data.message || 'Default address updated', showConfirmButton: false, timer: 2500 });
                        setTimeout(() => window.location.reload(), 1000);
                    } else {
                        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: data.message || 'Failed to update', showConfirmButton: false, timer: 2500 });
                    }
                } catch (err) {
                    Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Something went wrong', showConfirmButton: false, timer: 2500 });
                }
            });
        });
    
