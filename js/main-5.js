// Google Analytics 4 (GA4) Form Tracking
// Tracks form interactions, submissions, successes, and failures

(function() {
  'use strict';

  // GA4 Configuration
  const GA4_CONFIG = {
    measurementId: 'G-WBMHKYRCJR', // Replace with your GA4 Measurement ID
    debugMode: false, // Set to false in production
    trackFieldInteractions: true,
    trackSubmissionAttempts: true
  };

  // Track form submission attempts counter
  let submissionAttemptCount = 0;
  let formStartTime = null;
  let fieldInteractionCount = 0;
  const fieldInteractions = new Map(); // Track which fields were interacted with

  // Offline event queue storage key
  const QUEUE_STORAGE_KEY = 'ga4_event_queue';
  const MAX_QUEUE_SIZE = 50; // Maximum events to queue
  const MAX_EVENT_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  /**
   * Check if gtag is available
   * @returns {boolean} - True if gtag is loaded
   */
  function isGtagAvailable() {
    return typeof window.gtag === 'function';
  }

  /**
   * Check if browser is online
   * @returns {boolean} - True if online
   */
  function isOnline() {
    return typeof navigator !== 'undefined' && navigator.onLine !== false;
  }

  /**
   * Get event queue from localStorage
   * @returns {Array} - Array of queued events
   */
  function getEventQueue() {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (!stored) {
        return [];
      }
      const queue = JSON.parse(stored);
      // Filter out old events (older than MAX_EVENT_AGE)
      const now = Date.now();
      const validQueue = queue.filter(function(event) {
        return event.timestamp && (now - event.timestamp) < MAX_EVENT_AGE;
      });
      // Update storage if events were filtered
      if (validQueue.length !== queue.length) {
        saveEventQueue(validQueue);
      }
      return validQueue;
    } catch (error) {
      console.error('[GA4 Error] Failed to read event queue:', error);
      return [];
    }
  }

  /**
   * Save event queue to localStorage
   * @param {Array} queue - Array of events to save
   */
  function saveEventQueue(queue) {
    try {
      // Limit queue size to prevent storage issues
      const limitedQueue = queue.slice(-MAX_QUEUE_SIZE);
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(limitedQueue));
    } catch (error) {
      console.error('[GA4 Error] Failed to save event queue:', error);
      // If storage is full, try to clear old events
      if (error.name === 'QuotaExceededError') {
        try {
          const reducedQueue = queue.slice(-Math.floor(MAX_QUEUE_SIZE / 2));
          localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(reducedQueue));
        } catch (e) {
          console.error('[GA4 Error] Failed to reduce queue size:', e);
        }
      }
    }
  }

  /**
   * Add event to queue
   * @param {string} eventName - Event name
   * @param {Object} eventParams - Event parameters
   */
  function queueEvent(eventName, eventParams) {
    const queue = getEventQueue();
    queue.push({
      eventName: eventName,
      eventParams: eventParams,
      timestamp: Date.now()
    });
    saveEventQueue(queue);
    
    if (GA4_CONFIG.debugMode) {
      console.log('[GA4 Debug] Event queued (offline):', eventName, eventParams);
    }
  }

  /**
   * Process queued events (send to GA4)
   */
  function processEventQueue() {
    if (!isGtagAvailable() || !isOnline()) {
      return;
    }

    const queue = getEventQueue();
    if (queue.length === 0) {
      return;
    }

    if (GA4_CONFIG.debugMode) {
      console.log('[GA4 Debug] Processing', queue.length, 'queued events');
    }

    const processedEvents = [];
    queue.forEach(function(queuedEvent) {
      try {
        const params = {
          ...queuedEvent.eventParams,
          debug_mode: GA4_CONFIG.debugMode
        };
        window.gtag('event', queuedEvent.eventName, params);
        processedEvents.push(queuedEvent);
        
        if (GA4_CONFIG.debugMode) {
          console.log('[GA4 Debug] Queued event sent:', queuedEvent.eventName, params);
        }
      } catch (error) {
        console.error('[GA4 Error] Failed to send queued event:', error);
        // Keep failed events in queue for retry
      }
    });

    // Remove processed events from queue
    if (processedEvents.length > 0) {
      const remainingQueue = queue.filter(function(event) {
        return !processedEvents.some(function(processed) {
          return processed.timestamp === event.timestamp && 
                 processed.eventName === event.eventName;
        });
      });
      saveEventQueue(remainingQueue);
    }
  }

  /**
   * Send GA4 event (with offline queuing support)
   * @param {string} eventName - Event name
   * @param {Object} eventParams - Event parameters
   */
  function sendGA4Event(eventName, eventParams) {
    const params = {
      ...eventParams,
      debug_mode: GA4_CONFIG.debugMode
    };

    // If gtag is available and online, send immediately
    if (isGtagAvailable() && isOnline()) {
      try {
        window.gtag('event', eventName, params);
        
        if (GA4_CONFIG.debugMode) {
          console.log('[GA4 Debug] Event sent:', eventName, params);
        }
        return;
      } catch (error) {
        console.error('[GA4 Error] Failed to send event:', error);
        // Fall through to queue the event
      }
    }

    // Queue event if offline or gtag not available
    if (!isGtagAvailable()) {
      if (GA4_CONFIG.debugMode) {
        console.log('[GA4 Debug] Event queued (gtag not available):', eventName, params);
      }
    } else if (!isOnline()) {
      if (GA4_CONFIG.debugMode) {
        console.log('[GA4 Debug] Event queued (offline):', eventName, params);
      }
    }
    
    queueEvent(eventName, eventParams);
  }

  /**
   * Track page view for apply-online.html
   */
  function trackPageView() {
    if (!isGtagAvailable()) {
      return;
    }

    // Page view is automatically tracked by GA4, but we can enhance it
    sendGA4Event('page_view', {
      page_title: 'Apply Online - Scholarship Application',
      page_location: window.location.href,
      page_path: '/apply-online.html'
    });
  }

  /**
   * Track form field focus
   * @param {HTMLElement} field - Form field element
   */
  function trackFieldFocus(field) {
    if (!GA4_CONFIG.trackFieldInteractions) {
      return;
    }

    const fieldName = field.name || field.id || 'unknown';
    const fieldType = field.type || field.tagName.toLowerCase();
    
    // Track first interaction with this field
    if (!fieldInteractions.has(fieldName)) {
      fieldInteractions.set(fieldName, {
        firstFocus: Date.now(),
        focusCount: 0,
        blurCount: 0
      });
    }

    const interaction = fieldInteractions.get(fieldName);
    interaction.focusCount++;
    fieldInteractionCount++;

    sendGA4Event('form_field_focus', {
      field_name: fieldName,
      field_type: fieldType,
      field_label: field.labels && field.labels[0] ? field.labels[0].textContent.trim() : '',
      is_required: field.hasAttribute('required'),
      focus_count: interaction.focusCount,
      total_field_interactions: fieldInteractionCount
    });
  }

  /**
   * Track form field blur
   * @param {HTMLElement} field - Form field element
   */
  function trackFieldBlur(field) {
    if (!GA4_CONFIG.trackFieldInteractions) {
      return;
    }

    const fieldName = field.name || field.id || 'unknown';
    const fieldType = field.type || field.tagName.toLowerCase();
    const fieldValue = field.value ? field.value.length : 0;
    
    if (fieldInteractions.has(fieldName)) {
      const interaction = fieldInteractions.get(fieldName);
      interaction.blurCount++;
    }

    sendGA4Event('form_field_blur', {
      field_name: fieldName,
      field_type: fieldType,
      field_label: field.labels && field.labels[0] ? field.labels[0].textContent.trim() : '',
      value_length: fieldValue,
      is_required: field.hasAttribute('required'),
      has_value: fieldValue > 0
    });
  }

  /**
   * Track form submission attempt
   * @param {HTMLFormElement} form - Form element
   */
  function trackFormSubmissionAttempt(form) {
    if (!GA4_CONFIG.trackSubmissionAttempts) {
      return;
    }

    submissionAttemptCount++;
    
    // Calculate time spent on form
    const timeOnForm = formStartTime ? Math.round((Date.now() - formStartTime) / 1000) : 0;

    // Count filled fields
    const filledFields = Array.from(form.querySelectorAll('input, textarea, select')).filter(function(field) {
      if (field.type === 'checkbox' || field.type === 'radio') {
        return field.checked;
      }
      return field.value && field.value.trim().length > 0;
    }).length;

    const totalFields = form.querySelectorAll('input, textarea, select').length;
    const completionRate = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

    // Determine form name based on form ID
    const formName = form.id === 'contact-form' ? 'Contact Form' : 
                     form.id === 'scholarship-application-form' ? 'Scholarship Application' : 
                     'Form';

    sendGA4Event('form_submission_attempt', {
      form_id: form.id || 'unknown-form',
      form_name: formName,
      attempt_number: submissionAttemptCount,
      time_on_form_seconds: timeOnForm,
      fields_filled: filledFields,
      total_fields: totalFields,
      completion_rate: completionRate,
      field_interactions_count: fieldInteractionCount,
      unique_fields_interacted: fieldInteractions.size
    });
  }

  /**
   * Track form submission success
   * @param {HTMLFormElement} form - Form element
   * @param {Object} formData - Submitted form data (without sensitive info)
   */
  function trackFormSubmissionSuccess(form, formData) {
    const timeOnForm = formStartTime ? Math.round((Date.now() - formStartTime) / 1000) : 0;

    // Determine form name based on form ID
    const formName = form.id === 'contact-form' ? 'Contact Form' : 
                     form.id === 'scholarship-application-form' ? 'Scholarship Application' : 
                     'Form';

    // Prepare safe data for tracking (no PII)
    // Different data for different form types
    let safeData = {};
    if (form.id === 'scholarship-application-form') {
      safeData = {
        scholarship_name: formData.scholarship_name || '',
        course_name: formData.course_name || '',
        branch: formData.branch || '',
        year: formData.year || '',
        category: formData.category || '',
        has_email_other: !!formData.email_other,
        has_jee_ranks: !!(formData.jee_scst_rank || formData.jee_obcgen_rank || formData.jee_total_marks),
        has_cpi_score: !!formData.cpi_score
      };
    } else if (form.id === 'contact-form') {
      safeData = {
        form_type: formData.form_type || 'contact',
        has_message: !!formData.has_message
      };
    }

    sendGA4Event('form_submission_success', {
      form_id: form.id || 'unknown-form',
      form_name: formName,
      attempt_number: submissionAttemptCount,
      time_on_form_seconds: timeOnForm,
      submission_time: new Date().toISOString(),
      field_interactions_count: fieldInteractionCount,
      unique_fields_interacted: fieldInteractions.size,
      ...safeData
    });

    // Reset counters for potential new submission
    submissionAttemptCount = 0;
    formStartTime = null;
    fieldInteractionCount = 0;
    fieldInteractions.clear();
  }

  /**
   * Track form submission failure
   * @param {HTMLFormElement} form - Form element
   * @param {Error} error - Error object
   * @param {Object} errorDetails - Additional error details
   */
  function trackFormSubmissionFailure(form, error, errorDetails) {
    const timeOnForm = formStartTime ? Math.round((Date.now() - formStartTime) / 1000) : 0;

    // Extract error information
    const errorMessage = error ? error.message : 'Unknown error';
    const errorCode = errorDetails?.status || errorDetails?.code || 'unknown';
    const errorType = errorDetails?.type || 'api_error';
    
    // Check for specific error types
    let errorCategory = 'unknown';
    if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('unique')) {
      errorCategory = 'duplicate_submission';
    } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
      errorCategory = 'network_error';
    } else if (errorCode === 400) {
      errorCategory = 'validation_error';
    } else if (errorCode === 401 || errorCode === 403) {
      errorCategory = 'authentication_error';
    } else if (errorCode === 500 || errorCode >= 500) {
      errorCategory = 'server_error';
    }

    // Determine form name based on form ID
    const formName = form.id === 'contact-form' ? 'Contact Form' : 
                     form.id === 'scholarship-application-form' ? 'Scholarship Application' : 
                     'Form';

    sendGA4Event('form_submission_failure', {
      form_id: form.id || 'unknown-form',
      form_name: formName,
      attempt_number: submissionAttemptCount,
      time_on_form_seconds: timeOnForm,
      error_message: errorMessage.substring(0, 100), // Limit length
      error_code: errorCode,
      error_type: errorType,
      error_category: errorCategory,
      field_interactions_count: fieldInteractionCount,
      unique_fields_interacted: fieldInteractions.size,
      will_retry: true // User can retry
    });
  }

  /**
   * Track form retry after failure
   * @param {HTMLFormElement} form - Form element
   */
  function trackFormRetry(form) {
    // Determine form name based on form ID
    const formName = form.id === 'contact-form' ? 'Contact Form' : 
                     form.id === 'scholarship-application-form' ? 'Scholarship Application' : 
                     'Form';

    sendGA4Event('form_submission_retry', {
      form_id: form.id || 'unknown-form',
      form_name: formName,
      previous_attempt_number: submissionAttemptCount,
      retry_number: submissionAttemptCount + 1
    });
  }

  /**
   * Initialize form tracking
   * @param {HTMLFormElement} form - Form element to track
   */
  function initFormTracking(form) {
    if (!form) {
      return;
    }

    // Track form start time (per form instance)
    if (!formStartTime) {
      formStartTime = Date.now();
    }

    // Track page view when form is visible (only once per page)
    if (document.getElementById('contact-form') && !window.contactFormTracked) {
      trackPageView();
      window.contactFormTracked = true;
    } else if (document.getElementById('scholarship-application-form') && !window.scholarshipFormTracked) {
      trackPageView();
      window.scholarshipFormTracked = true;
    }

    // Track field interactions
    const fields = form.querySelectorAll('input, textarea, select');
    fields.forEach(function(field) {
      // Track focus
      field.addEventListener('focus', function() {
        trackFieldFocus(field);
      }, { once: false });

      // Track blur
      field.addEventListener('blur', function() {
        trackFieldBlur(field);
      }, { once: false });
    });

    // Track form submission attempts
    form.addEventListener('submit', function(event) {
      // This will be called before the actual submission handler
      trackFormSubmissionAttempt(form);
    }, { capture: true });
  }

  /**
   * Public API for tracking form events
   */
  window.GA4FormTracking = {
    /**
     * Initialize tracking for a form
     * @param {HTMLFormElement} form - Form element
     */
    init: function(form) {
      initFormTracking(form);
    },

    /**
     * Track successful form submission
     * @param {HTMLFormElement} form - Form element
     * @param {Object} formData - Form data (will be sanitized)
     */
    trackSuccess: function(form, formData) {
      trackFormSubmissionSuccess(form, formData);
    },

    /**
     * Track failed form submission
     * @param {HTMLFormElement} form - Form element
     * @param {Error} error - Error object
     * @param {Object} errorDetails - Additional error details
     */
    trackFailure: function(form, error, errorDetails) {
      trackFormSubmissionFailure(form, error, errorDetails);
    },

    /**
     * Track form retry
     * @param {HTMLFormElement} form - Form element
     */
    trackRetry: function(form) {
      trackFormRetry(form);
    },

    /**
     * Update GA4 configuration
     * @param {Object} config - Configuration object
     */
    updateConfig: function(config) {
      Object.assign(GA4_CONFIG, config);
    }
  };

  // Auto-initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize tracking for scholarship application form
    const scholarshipForm = document.getElementById('scholarship-application-form');
    if (scholarshipForm) {
      initFormTracking(scholarshipForm);
    }

    // Initialize tracking for contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      initFormTracking(contactForm);
    }

    // Process any queued events from previous sessions
    processEventQueue();

    // Listen for online/offline events to process queue when connection is restored
    if (typeof window !== 'undefined') {
      window.addEventListener('online', function() {
        if (GA4_CONFIG.debugMode) {
          console.log('[GA4 Debug] Connection restored, processing queued events');
        }
        processEventQueue();
      });

      // Periodically try to process queue (in case online event doesn't fire)
      setInterval(function() {
        if (isOnline() && isGtagAvailable()) {
          processEventQueue();
        }
      }, 30000); // Check every 30 seconds
    }
  });
})();
