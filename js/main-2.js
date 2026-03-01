(function() {
  'use strict';

  // Configuration - REPLACE THESE WITH ACTUAL VALUES FROM YOUR DEPLOYMENT
  const CONFIG = {
    SITE_ID: 'kaf81', 
    API_URL: 'https://api.example.com', 
    RECAPTCHA_SITE_KEY: 'YOUR_RECAPTCHA_SITE_KEY'
  };

  /**
   * Initialize contact form
   */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) {
      return;
    }

    // Initialize form validation
    if (window.FormValidation) {
      window.FormValidation.initFormValidation(form);
    }

    // Initialize GA4 tracking for contact form
    if (window.GA4FormTracking) {
      window.GA4FormTracking.init(form);
    }

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
   * Handle form submission
   * @param {Event} event - Submit event
   */
  async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const liveRegion = document.getElementById('form-announcements');
    
    // Validate form
    if (window.FormValidation && !window.FormValidation.validateForm(form)) {
      announce(liveRegion, 'Please fix the errors in the form before submitting.');
      return;
    }

    // Disable submit button
    setLoadingState(form, true);

    // Collect form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      // Get reCAPTCHA token
      let token = null;
      if (typeof grecaptcha !== 'undefined') {
        try {
            token = await grecaptcha.execute(CONFIG.RECAPTCHA_SITE_KEY, {action: 'submit'});
        } catch (e) {
            console.error('reCAPTCHA execution failed:', e);
            // Decide whether to block or proceed. Proceeding for now but logging.
        }
      } else {
          console.warn('reCAPTCHA library not loaded');
      }

      // Prepare payload
      const payload = {
        siteId: CONFIG.SITE_ID,
        recaptchaToken: token,
        data: data,
        timestamp: new Date().toISOString()
      };

      // Submit to API
      const response = await fetch(`${CONFIG.API_URL}/api/submit/${CONFIG.SITE_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Submission failed');
      }

      // Track success with GA4
      if (window.GA4FormTracking) {
        window.GA4FormTracking.trackSuccess(form, {
          form_type: 'contact',
          has_message: data.message && data.message.length > 0
        });
      }

      // Success
      showSuccess(form);
      announce(liveRegion, 'Your message has been sent successfully. We will get back to you soon.');
      form.reset();
      
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Track error with GA4
      if (window.GA4FormTracking) {
        window.GA4FormTracking.trackFailure(form, error, {
          status: error.status || 0,
          type: 'api_error'
        });
      }
      
      showError(form, 'Sorry, there was an error submitting your message. Please try again or contact us directly at info@kaf81.org');
      announce(liveRegion, 'Error submitting form. Please try again or contact us directly.');
    } finally {
      setLoadingState(form, false);
    }
  }

  /**
   * Show success message
   * @param {HTMLFormElement} form - Form element
   */
  function showSuccess(form) {
    // Remove existing messages
    const existingMessage = form.querySelector('.success-message, .error-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Add success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.setAttribute('role', 'alert');
    successMessage.textContent = 'Thank you! Your message has been sent successfully. We will get back to you soon.';
    form.insertBefore(successMessage, form.firstChild);

    // Remove message after 5 seconds
    setTimeout(function() {
      successMessage.remove();
    }, 5000);
  }

  /**
   * Show error message
   * @param {HTMLFormElement} form - Form element
   * @param {string} message - Error message
   */
  function showError(form, message) {
    // Remove existing messages
    const existingMessage = form.querySelector('.success-message, .error-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Add error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.setAttribute('role', 'alert');
    errorMessage.style.cssText = 'padding: 1rem; background-color: #fee; border: 1px solid #fcc; border-radius: 4px; margin-bottom: 1rem;';
    errorMessage.textContent = message;
    form.insertBefore(errorMessage, form.firstChild);
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
      submitButton.textContent = 'Sending...';
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
    initContactForm();
  });
})();
