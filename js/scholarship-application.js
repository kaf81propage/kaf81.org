// Scholarship application form handling with Supabase integration

(function() {
  'use strict';

  // Supabase configuration
  const SUPABASE_CONFIG = {
    url: window.SUPABASE_URL || '',
    anonKey: window.SUPABASE_ANON_KEY || ''
  };

  /**
   * Initialize scholarship application form
   */
  function initScholarshipForm() {
    const form = document.getElementById('scholarship-application-form');
    if (!form) {
      return;
    }

    // Initialize form validation
    if (window.FormValidation) {
      window.FormValidation.initFormValidation(form);
    }

    // Add custom validation for IIT-BHU email
    const emailIitBhu = form.querySelector('#email_iit_bhu');
    if (emailIitBhu) {
      emailIitBhu.addEventListener('blur', function() {
        validateIitBhuEmail(this);
      });
    }

    // Add custom validation for funding sources checkbox group
    const fundingCheckboxes = form.querySelectorAll('input[name="funding_sources"]');
    fundingCheckboxes.forEach(function(checkbox) {
      checkbox.addEventListener('change', function() {
        validateCheckboxGroup('funding_sources', 1, 7);
      });
    });

    // Add custom validation for previous KAF81 scholarship checkbox group
    const previousKaf81Checkboxes = form.querySelectorAll('input[name="previous_kaf81_scholarship"]');
    previousKaf81Checkboxes.forEach(function(checkbox) {
      checkbox.addEventListener('change', function() {
        validateCheckboxGroup('previous_kaf81_scholarship', 1, 7);
      });
    });

    // Handle form submission
    form.addEventListener('submit', handleFormSubmit);

    // Setup live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.id = 'form-announcements';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'visually-hidden';
    form.appendChild(liveRegion);
  }

  /**
   * Validate IIT-BHU email format
   * @param {HTMLElement} field - Email input field
   * @returns {boolean} - True if valid
   */
  function validateIitBhuEmail(field) {
    const value = field.value.trim();
    const iitBhuPattern = /^[^\s@]+@itbhu\.ac\.in$/;

    if (field.hasAttribute('required') && !value) {
      if (window.FormValidation) {
        window.FormValidation.showError(field, 'This field is required');
      }
      return false;
    }

    if (value && !iitBhuPattern.test(value)) {
      if (window.FormValidation) {
        window.FormValidation.showError(field, 'Email must be an @itbhu.ac.in address');
      }
      return false;
    }

    if (window.FormValidation) {
      window.FormValidation.clearError(field);
    }
    return true;
  }

  /**
   * Validate checkbox group
   * @param {string} name - Checkbox name attribute
   * @param {number} min - Minimum required selections
   * @param {number} max - Maximum allowed selections
   * @returns {boolean} - True if valid
   */
  function validateCheckboxGroup(name, min, max) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]`);
    const checked = Array.from(checkboxes).filter(function(cb) {
      return cb.checked;
    });

    const groupContainer = checkboxes[0].closest('.checkbox-group');
    const errorId = name + '-error';
    let errorElement = document.getElementById(errorId);

    // Remove existing error
    if (errorElement) {
      errorElement.remove();
    }

    // Validate
    if (checked.length < min) {
      errorElement = document.createElement('span');
      errorElement.id = errorId;
      errorElement.className = 'error-message';
      errorElement.setAttribute('role', 'alert');
      errorElement.textContent = `Please select at least ${min} option${min > 1 ? 's' : ''}.`;
      if (groupContainer) {
        groupContainer.appendChild(errorElement);
      }
      return false;
    }

    if (checked.length > max) {
      errorElement = document.createElement('span');
      errorElement.id = errorId;
      errorElement.className = 'error-message';
      errorElement.setAttribute('role', 'alert');
      errorElement.textContent = `Please select maximum of ${max} options.`;
      if (groupContainer) {
        groupContainer.appendChild(errorElement);
      }
      return false;
    }

    return true;
  }

  /**
   * Get checkbox values
   * @param {string} name - Checkbox name attribute
   * @returns {Array<string>} - Array of checked values
   */
  function getCheckboxValues(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(function(cb) {
      return cb.value;
    });
  }

  /**
   * Handle form submission
   * @param {Event} event - Submit event
   */
  async function handleFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const liveRegion = document.getElementById('form-announcements');
    const messagesContainer = document.getElementById('form-messages');

    // Validate checkbox groups
    const fundingValid = validateCheckboxGroup('funding_sources', 1, 7);
    const previousKaf81Valid = validateCheckboxGroup('previous_kaf81_scholarship', 1, 7);

    if (!fundingValid || !previousKaf81Valid) {
      announce(liveRegion, 'Please fix the errors in the form before submitting.');
      showMessage(messagesContainer, 'Please fix the errors in the form before submitting.', 'error');
      return;
    }

    // Validate form
    if (window.FormValidation && !window.FormValidation.validateForm(form)) {
      announce(liveRegion, 'Please fix the errors in the form before submitting.');
      showMessage(messagesContainer, 'Please fix the errors in the form before submitting.', 'error');
      return;
    }

    // Validate IIT-BHU email
    const emailIitBhu = form.querySelector('#email_iit_bhu');
    if (emailIitBhu && !validateIitBhuEmail(emailIitBhu)) {
      announce(liveRegion, 'Please fix the errors in the form before submitting.');
      showMessage(messagesContainer, 'Please fix the errors in the form before submitting.', 'error');
      return;
    }

    // Check Supabase configuration
    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
      showMessage(messagesContainer, 'Application form is not properly configured. Please contact us directly at info@kaf81.org', 'error');
      announce(liveRegion, 'Form configuration error. Please contact us directly.');
      return;
    }

    // Disable submit button
    setLoadingState(form, true);

    // Collect form data
    const formData = {
      scholarship_name: form.querySelector('[name="scholarship_name"]').value.trim(),
      first_name: form.querySelector('[name="first_name"]').value.trim(),
      surname: form.querySelector('[name="surname"]').value.trim(),
      roll_number: form.querySelector('[name="roll_number"]').value.trim(),
      age: parseInt(form.querySelector('[name="age"]').value, 10),
      gender: form.querySelector('[name="gender"]').value.trim(),
      nationality: form.querySelector('[name="nationality"]').value.trim(),
      postal_address: form.querySelector('[name="postal_address"]').value.trim(),
      pin_code: form.querySelector('[name="pin_code"]').value.trim(),
      category: form.querySelector('[name="category"]').value.trim(),
      mobile_no: form.querySelector('[name="mobile_no"]').value.trim(),
      email_iit_bhu: form.querySelector('[name="email_iit_bhu"]').value.trim(),
      email_other: form.querySelector('[name="email_other"]').value.trim() || null,
      course_name: form.querySelector('[name="course_name"]').value.trim(),
      branch: form.querySelector('[name="branch"]').value.trim(),
      year: form.querySelector('[name="year"]').value.trim(),
      jee_admission: form.querySelector('[name="jee_admission"]').value.trim(),
      jee_scst_rank: parseInt(form.querySelector('[name="jee_scst_rank"]').value, 10) || null,
      jee_obcgen_rank: parseInt(form.querySelector('[name="jee_obcgen_rank"]').value, 10) || null,
      jee_total_marks: parseInt(form.querySelector('[name="jee_total_marks"]').value, 10) || null,
      cpi_score: parseFloat(form.querySelector('[name="cpi_score"]').value) || null,
      fail_grade: form.querySelector('[name="fail_grade"]').value.trim(),
      family_income: form.querySelector('[name="family_income"]').value.trim(),
      funding_sources: getCheckboxValues('funding_sources').join(', '),
      has_other_scholarship: form.querySelector('[name="has_other_scholarship"]').value.trim(),
      previous_kaf81_scholarship: getCheckboxValues('previous_kaf81_scholarship').join(', ')
    };

    // Convert 0 values to null for optional fields
    if (formData.jee_scst_rank === 0) {
      formData.jee_scst_rank = null;
    }
    if (formData.jee_obcgen_rank === 0) {
      formData.jee_obcgen_rank = null;
    }
    if (formData.jee_total_marks === 0) {
      formData.jee_total_marks = null;
    }
    if (formData.cpi_score === 0) {
      formData.cpi_score = null;
    }

    try {
      // Submit to Supabase
      const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/scholarship_applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_CONFIG.anonKey,
          'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(function() {
          return { message: 'Failed to submit application' };
        });
        throw new Error(errorData.message || 'Failed to submit application');
      }

      // Success
      showMessage(messagesContainer, 'Thank you! Your application has been submitted successfully. We will review it and get back to you soon.', 'success');
      announce(liveRegion, 'Your application has been submitted successfully. We will review it and get back to you soon.');
      form.reset();

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error('Error submitting application:', error);
      let errorMessage = 'Sorry, there was an error submitting your application. Please try again or contact us directly at info@kaf81.org';
      
      // Check for duplicate application error
      if (error.message && error.message.includes('duplicate') || error.message.includes('unique')) {
        errorMessage = 'An application with this email or roll number already exists. If you need to submit another application, please contact us at info@kaf81.org';
      }

      showMessage(messagesContainer, errorMessage, 'error');
      announce(liveRegion, 'Error submitting application. Please try again or contact us directly.');
    } finally {
      setLoadingState(form, false);
    }
  }

  /**
   * Show message to user
   * @param {HTMLElement} container - Container element
   * @param {string} message - Message text
   * @param {string} type - Message type ('success' or 'error')
   */
  function showMessage(container, message, type) {
    if (!container) {
      return;
    }

    // Clear existing messages
    container.innerHTML = '';

    // Add message
    const messageElement = document.createElement('div');
    messageElement.className = type === 'success' ? 'success-message' : 'error-message';
    messageElement.setAttribute('role', 'alert');
    if (type === 'error') {
      messageElement.style.cssText = 'padding: 1rem; background-color: #fee; border: 1px solid #fcc; border-radius: 4px; margin-bottom: 1rem;';
    }
    messageElement.textContent = message;
    container.appendChild(messageElement);

    // Remove message after 10 seconds for success, keep error until user dismisses
    if (type === 'success') {
      setTimeout(function() {
        if (messageElement.parentNode) {
          messageElement.remove();
        }
      }, 10000);
    }
  }

  /**
   * Set loading state
   * @param {HTMLFormElement} form - Form element
   * @param {boolean} isLoading - Loading state
   */
  function setLoadingState(form, isLoading) {
    const submitButton = form.querySelector('button[type="submit"]');
    const fields = form.querySelectorAll('input, textarea, select, button');

    if (isLoading) {
      form.classList.add('loading');
      submitButton.disabled = true;
      submitButton.textContent = 'Submitting...';
      fields.forEach(function(field) {
        field.disabled = true;
      });
    } else {
      form.classList.remove('loading');
      submitButton.disabled = false;
      submitButton.textContent = 'Submit';
      fields.forEach(function(field) {
        field.disabled = false;
      });
    }
  }

  /**
   * Announce message to screen readers
   * @param {HTMLElement} liveRegion - Live region element
   * @param {string} message - Message to announce
   */
  function announce(liveRegion, message) {
    if (liveRegion) {
      liveRegion.textContent = message;
      // Clear after a moment so the message can be announced again if needed
      setTimeout(function() {
        liveRegion.textContent = '';
      }, 1000);
    }
  }

  // Initialize on DOM load
  document.addEventListener('DOMContentLoaded', function() {
    initScholarshipForm();
  });
})();

