// Contact Form Handler with Validation and Google Sheets Integration
// Add this script to your HTML file before the closing </body> tag

(function() {
    'use strict';

    // Configuration
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAHbp-Nh8Yq6zdod5sYRtGZnFVjhIfkXi9Mn1QVhgRjaix3rLK0wHyd2qxVcHJoPhX6w/exec';
    
    // Get form elements
    const contactForm = document.querySelector('.contact-form');
    const nameInput = contactForm.querySelector('input[type="text"]');
    const emailInput = contactForm.querySelector('input[type="email"]');
    const messageInput = contactForm.querySelector('textarea');
    const submitBtn = contactForm.querySelector('input[type="submit"]');

    // Validation patterns
    const patterns = {
        name: /^[a-zA-Z\s]{2,50}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: /^.{10,500}$/
    };

    // Error messages
    const errorMessages = {
        name: 'Name must be 2-50 characters and contain only letters',
        email: 'Please enter a valid email address',
        message: 'Message must be between 10-500 characters',
        required: 'This field is required'
    };

    // Create error element
    function createErrorElement(message) {
        const error = document.createElement('small');
        error.className = 'text-danger d-block mt-1';
        error.style.fontSize = '0.875rem';
        error.textContent = message;
        return error;
    }

    // Remove existing errors
    function removeError(input) {
        const parent = input.closest('.form-group');
        const existingError = parent.querySelector('.text-danger');
        if (existingError) {
            existingError.remove();
        }
        input.classList.remove('is-invalid');
        input.classList.remove('is-valid');
    }

    // Show error
    function showError(input, message) {
        removeError(input);
        input.classList.add('is-invalid');
        const error = createErrorElement(message);
        input.closest('.form-group').appendChild(error);
    }

    // Show success
    function showSuccess(input) {
        removeError(input);
        input.classList.add('is-valid');
    }

    // Validate single field
    function validateField(input, pattern, fieldName) {
        const value = input.value.trim();
        
        if (!value) {
            showError(input, errorMessages.required);
            return false;
        }
        
        if (pattern && !pattern.test(value)) {
            showError(input, errorMessages[fieldName]);
            return false;
        }
        
        showSuccess(input);
        return true;
    }

    // Real-time validation
    nameInput.addEventListener('blur', () => {
        validateField(nameInput, patterns.name, 'name');
    });

    emailInput.addEventListener('blur', () => {
        validateField(emailInput, patterns.email, 'email');
    });

    messageInput.addEventListener('blur', () => {
        validateField(messageInput, patterns.message, 'message');
    });

    // Clear validation on input
    [nameInput, emailInput, messageInput].forEach(input => {
        input.addEventListener('input', () => {
            if (input.classList.contains('is-invalid') || input.classList.contains('is-valid')) {
                removeError(input);
            }
        });
    });

    // Show notification
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="close" data-dismiss="alert">
                <span>&times;</span>
            </button>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Submit to Google Sheets
    async function submitToGoogleSheets(formData) {
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            // Note: With no-cors mode, we can't read the response
            // We'll assume success if no error is thrown
            return { success: true };
        } catch (error) {
            console.error('Submission error:', error);
            return { success: false, error: error.message };
        }
    }

    // Handle form submission
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate all fields
        const isNameValid = validateField(nameInput, patterns.name, 'name');
        const isEmailValid = validateField(emailInput, patterns.email, 'email');
        const isMessageValid = validateField(messageInput, patterns.message, 'message');

        if (!isNameValid || !isEmailValid || !isMessageValid) {
            showNotification('Please fix the errors before submitting', 'danger');
            return;
        }

        // Disable submit button and show loading state
        const originalBtnValue = submitBtn.value;
        submitBtn.value = 'Sending...';
        submitBtn.disabled = true;

        // Prepare form data
        const formData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            message: messageInput.value.trim(),
            timestamp: new Date().toISOString(),
            source: 'Portfolio Website'
        };

        try {
            // Submit to Google Sheets
            const result = await submitToGoogleSheets(formData);
            
            if (result.success !== false) {
                // Success
                showNotification('Thank you! Your message has been sent successfully.', 'success');
                contactForm.reset();
                
                // Remove validation classes
                [nameInput, emailInput, messageInput].forEach(input => {
                    removeError(input);
                });
            } else {
                // Error
                showNotification('Sorry, something went wrong. Please try again later.', 'danger');
            }
        } catch (error) {
            showNotification('Sorry, something went wrong. Please try again later.', 'danger');
            console.error('Form submission error:', error);
        } finally {
            // Re-enable submit button
            submitBtn.value = originalBtnValue;
            submitBtn.disabled = false;
        }
    });

    // Add custom validation styles
    const style = document.createElement('style');
    style.textContent = `
        .form-control.is-invalid {
            border-color: #dc3545;
            padding-right: calc(1.5em + 0.75rem);
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23dc3545' viewBox='0 0 12 12'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right calc(0.375em + 0.1875rem) center;
            background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
        }
        
        .form-control.is-valid {
            border-color: #28a745;
            padding-right: calc(1.5em + 0.75rem);
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3e%3cpath fill='%2328a745' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right calc(0.375em + 0.1875rem) center;
            background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
        }
        
        .form-control.is-invalid:focus {
            border-color: #dc3545;
            box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        }
        
        .form-control.is-valid:focus {
            border-color: #28a745;
            box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
        }
    `;
    document.head.appendChild(style);

})();