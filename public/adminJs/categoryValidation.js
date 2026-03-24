// adminJs.js
// Handles frontend validation and AJAX for admin category management

document.addEventListener('DOMContentLoaded', () => {

    const addCategoryModal = document.getElementById('addCategoryModal');
    const editCategoryModal = document.getElementById('editCategoryModal');
    
    const addCategoryForm = document.getElementById('addCategoryForm');
    const editCategoryForm = document.getElementById('editCategoryForm');

    // Make modal toggle functions globally available
    window.openAddCategoryModal = () => {
        addCategoryForm.reset();
        clearErrors('addCategory');
        addCategoryModal.classList.remove('hidden');
    };

    window.closeAddCategoryModal = () => {
        addCategoryModal.classList.add('hidden');
    };

    window.openEditCategoryModal = (id, name, description, isListed) => {
        const form = document.getElementById('editCategoryForm');
        form.id.value = id;
        form.name.value = name;
        form.description.value = description;
        form.isListed.value = isListed.toString();
        
        clearErrors('editCategory');
        editCategoryModal.classList.remove('hidden');
    };

    window.closeEditCategoryModal = () => {
        editCategoryModal.classList.add('hidden');
    };

    // Close modals on clicking outside
    [addCategoryModal, editCategoryModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });

    // Validation configuration
    const validateCategory = (name, description, prefix) => {
        let isValid = true;
        clearErrors(prefix);

        if (!name.trim()) {
            showError(`${prefix}NameError`, 'Category name is required');
            isValid = false;
        } else if (name.trim().length < 3) {
            showError(`${prefix}NameError`, 'Category name must be at least 3 characters');
            isValid = false;
        } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(name.trim())) {
            showError(`${prefix}NameError`, 'Category name contains invalid characters');
            isValid = false;
        }

        if (!description.trim()) {
            showError(`${prefix}DescriptionError`, 'Description is required');
            isValid = false;
        } else if (description.trim().length < 10) {
            showError(`${prefix}DescriptionError`, 'Description must be at least 10 characters');
            isValid = false;
        }

        return isValid;
    };

    const showError = (elementId, message) => {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = message;
            el.classList.remove('hidden');
        }
    };

    const clearErrors = (prefix) => {
        const nameError = document.getElementById(`${prefix}NameError`);
        const descError = document.getElementById(`${prefix}DescriptionError`);
        if (nameError) { nameError.textContent = ''; nameError.classList.add('hidden'); }
        if (descError) { descError.textContent = ''; descError.classList.add('hidden'); }
    };

    // Handle Add Form Submission
    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(addCategoryForm);
            const data = Object.fromEntries(formData.entries());
            data.isListed = data.isListed === 'true'; // Convert to boolean

            if (!validateCategory(data.name, data.description, 'addCategory')) {
                return;
            }

            try {
                // Adjust route if needed
                const response = await fetch('/admin/addCategory', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok && result.success !== false) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: result.message || 'Category added successfully',
                        confirmButtonColor: '#137fec'
                    }).then(() => {
                        window.location.reload();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: result.message || 'Failed to add category',
                        confirmButtonColor: '#137fec'
                    });
                }
            } catch (error) {
                console.error('Error adding category:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An unexpected error occurred. Please try again.',
                    confirmButtonColor: '#137fec'
                });
            }
        });
    }

    // Handle Edit Form Submission
    if (editCategoryForm) {
        editCategoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(editCategoryForm);
            const data = Object.fromEntries(formData.entries());
            const categoryId = data.id;
            data.isListed = data.isListed === 'true';

            if (!validateCategory(data.name, data.description, 'editCategory')) {
                return;
            }

            try {
                // Using PUT or PATCH for edit. Adjust according to backend api
                const response = await fetch(`/admin/editCategory/${categoryId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: data.name,
                        description: data.description,
                        isListed: data.isListed
                    })
                });

                const result = await response.json();

                if (response.ok && result.success !== false) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: result.message || 'Category updated successfully',
                        confirmButtonColor: '#137fec'
                    }).then(() => {
                        window.location.reload();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: result.message || 'Failed to update category',
                        confirmButtonColor: '#137fec'
                    });
                }
            } catch (error) {
                console.error('Error updating category:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An unexpected error occurred. Please try again.',
                    confirmButtonColor: '#137fec'
                });
            }
        });
    }
});
