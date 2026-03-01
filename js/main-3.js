// Form validation utilities

(function() {
  'use strict';

  // Email validation regex
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Phone validation regex (international format)
  const PHONE_REGEX = /^[\d\s\-\+\(\)]+$/;

  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {boolean} - True if valid
   */
  function validateEmail(email) {
    return EMAIL_REGEX.test(email.trim());
  }

  /**
   * Validate phone number
   * @param {string} phone - Phone to validate
   * @returns {boolean} - True if valid
   */
  function validatePhone(phone) {
    if (!phone || phone.trim().length === 0) {
      return false;
    }
    const digits = phone.replace(/\D/g, '');
    return PHONE_REGEX.test(phone) && digits.length >= 10;
  }

  /**
   * Validate required field
   * @param {string} value - Value to validate
   * @returns {boolean} - True if not empty
   */
  function validateRequired(value) {
    return value && value.trim().length > 0;
  }

  /**
   * Show error message for a field
   * @param {HTMLElement} field - Input field
   * @param {string} message - Error message
   */
  function showError(field, message) {
    field.setAttribute('aria-invalid', 'true');
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentElement.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }

    // Add new error message
    const errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.id = field.id + '-error';
    errorElement.setAttribute('role', 'alert');
    errorElement.textContent = message;
    field.setAttribute('aria-describedby', errorElement.id);
    field.parentElement.appendChild(errorElement);
  }

  /**
   * Clear error message for a field
   * @param {HTMLElement} field - Input field
   */
  function clearError(field) {
    field.removeAttribute('aria-invalid');
    field.classList.remove('error');
    field.removeAttribute('aria-describedby');
    
    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
      errorElement.remove();
    }
  }

  /**
   * Validate a form field
   * @param {HTMLElement} field - Input field to validate
   * @returns {boolean} - True if valid
   */
  function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');
    
    // Clear previous errors
    clearError(field);

    // Check required fields
    if (required && !validateRequired(value)) {
      showError(field, 'This field is required');
      return false;
    }

    // Skip further validation if field is empty and not required
    if (!required && value.length === 0) {
      return true;
    }

    // Type-specific validation
    if (type === 'email' && value.length > 0 && !validateEmail(value)) {
      showError(field, 'Please enter a valid email address');
      return false;
    }

    if (type === 'tel' && value.length > 0 && !validatePhone(value)) {
      showError(field, 'Please enter a valid phone number');
      return false;
    }

    // Min length validation
    const minLength = field.getAttribute('minlength');
    if (minLength && value.length > 0 && value.length < parseInt(minLength)) {
      showError(field, 'This field must be at least ' + minLength + ' characters');
      return false;
    }

    // Max length validation
    const maxLength = field.getAttribute('maxlength');
    if (maxLength && value.length > parseInt(maxLength)) {
      showError(field, 'This field must be no more than ' + maxLength + ' characters');
      return false;
    }

    return true;
  }

  /**
   * Validate entire form
   * @param {HTMLFormElement} form - Form to validate
   * @returns {boolean} - True if form is valid
   */
  function validateForm(form) {
    const fields = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;

    fields.forEach(function(field) {
      if (!validateField(field)) {
        isValid = false;
        // Focus on first invalid field
        if (isValid === false) {
          field.focus();
        }
      }
    });

    return isValid;
  }

  /**
   * Initialize form validation
   * @param {HTMLFormElement} form - Form to initialize
   */
  function initFormValidation(form) {
    // Validate on blur
    const fields = form.querySelectorAll('input, textarea, select');
    fields.forEach(function(field) {
      field.addEventListener('blur', function() {
        validateField(this);
      });

      // Clear error on input
      field.addEventListener('input', function() {
        if (this.classList.contains('error')) {
          clearError(this);
        }
      });
    });

    // Validate on submit
    form.addEventListener('submit', function(event) {
      if (!validateForm(form)) {
        event.preventDefault();
        event.stopPropagation();
        
        // Focus on first invalid field
        const firstError = form.querySelector('[aria-invalid="true"]');
        if (firstError) {
          firstError.focus();
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        return false;
      }
    });
  }

  // Export functions
  window.FormValidation = {
    validateField: validateField,
    validateForm: validateForm,
    initFormValidation: initFormValidation,
    showError: showError,
    clearError: clearError,
    validateEmail: validateEmail,
    validatePhone: validatePhone,
    validateRequired: validateRequired
  };
})();

