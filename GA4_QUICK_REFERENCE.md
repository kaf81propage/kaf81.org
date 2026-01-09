# GA4 Form Tracking - Quick Reference

## Measurement ID
**Current:** `G-WBMHKYRCJR`  
**Location:** 
- `apply-online.html` (lines 9, 14)
- `js/ga4-form-tracking.js` (line 8)

## Tracked Events

| Event Name | When It Fires | Key Parameters |
|------------|---------------|----------------|
| `page_view` | Page loads | page_title, page_path |
| `form_field_focus` | User clicks into field | field_name, field_type, is_required |
| `form_field_blur` | User clicks out of field | field_name, value_length, has_value |
| `form_submission_attempt` | User clicks Submit | attempt_number, time_on_form_seconds, completion_rate |
| `form_submission_success` | Supabase saves data | attempt_number, time_on_form_seconds, course_name, branch |
| `form_submission_failure` | Submission fails | error_message, error_code, error_category |
| `form_submission_retry` | User resubmits after error | previous_attempt_number, retry_number |

## Error Categories

- `duplicate_submission` - Email/roll number already exists
- `network_error` - Network/fetch failure
- `validation_error` - HTTP 400
- `authentication_error` - HTTP 401/403
- `server_error` - HTTP 500+
- `unknown` - Other errors

## Quick Test Commands

```javascript
// Check if GA4 is loaded
typeof gtag === "function"

// Check if tracking is initialized
typeof window.GA4FormTracking === "object"

// Manually trigger page view
gtag('event', 'page_view', { page_path: '/apply-online.html' })

// Check debug mode
// Look for [GA4 Debug] in console
```

## File Locations

- **GA4 Script:** `apply-online.html` (lines 8-15)
- **Tracking Code:** `js/ga4-form-tracking.js`
- **Integration:** `js/scholarship-application.js` (lines 258-284)
- **Documentation:** `GA4_INTEGRATION_GUIDE.md`

## Production Checklist

- [ ] Measurement ID updated
- [ ] `debugMode: false` in `ga4-form-tracking.js`
- [ ] Tested all events
- [ ] Verified in GA4 Real-Time
- [ ] No PII in events
