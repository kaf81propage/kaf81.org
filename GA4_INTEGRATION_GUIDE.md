# Google Analytics 4 (GA4) Integration Guide for KAF81 Website

This guide provides complete instructions for integrating GA4 form tracking on your scholarship application form.

## Table of Contents
1. [Overview](#overview)
2. [Getting Your GA4 Measurement ID](#getting-your-ga4-measurement-id)
3. [Code Integration](#code-integration)
4. [Event Tracking Details](#event-tracking-details)
5. [Testing Instructions](#testing-instructions)
6. [Troubleshooting](#troubleshooting)

---

## Overview

The GA4 integration tracks:
- ✅ Page views on `/apply-online.html`
- ✅ Form field interactions (focus, blur events)
- ✅ Form submission attempts
- ✅ Form submission success (when Supabase saves data)
- ✅ Form submission failures (with error codes and messages)
- ✅ User retry attempts after failure
- ✅ Form completion metrics (time spent, fields filled, etc.)

---

## Getting Your GA4 Measurement ID

### Step 1: Access Google Analytics
1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account (`kaf81propage@gmail.com`)

### Step 2: Create or Select a Property
1. If you don't have a property yet:
   - Click **Admin** (gear icon) in the bottom left
   - Click **Create Property**
   - Enter property name: "KAF81 Website"
   - Select time zone and currency
   - Click **Next** → **Create**

### Step 3: Get Your Measurement ID
1. In your GA4 property, go to **Admin** → **Data Streams**
2. Click on your web stream (or create one if needed)
3. Your **Measurement ID** will be displayed (format: `G-XXXXXXXXXX`)
4. Copy this ID

### Step 4: Update the Code
1. Open `/js/ga4-form-tracking.js`
2. Find line 8: `measurementId: 'G-WBMHKYRCJR'`
3. Replace `G-WBMHKYRCJR` with your actual Measurement ID
4. Also update the Measurement ID in `/apply-online.html` (line 9 and 14)

---

## Code Integration

### ✅ Already Completed

The following code has already been integrated into your website:

#### 1. HEAD Section Code (in `apply-online.html`)
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-WBMHKYRCJR"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-WBMHKYRCJR');
</script>
```

**Location:** Lines 8-15 in `/apply-online.html`

#### 2. JavaScript Tracking File
- **File:** `/js/ga4-form-tracking.js`
- **Purpose:** Handles all GA4 event tracking for form interactions

#### 3. Integration with Form Submission
- **File:** `/js/scholarship-application.js`
- **Status:** Updated to call GA4 tracking functions on success/failure

#### 4. Script Loading Order (in `apply-online.html`)
```html
<script src="js/form-validation.js"></script>
<script src="js/ga4-form-tracking.js"></script>
<script src="js/scholarship-application.js"></script>
<script src="js/main.js"></script>
```

**Location:** Before closing `</body>` tag in `/apply-online.html`

---

## Event Tracking Details

### 1. Page View Event
**Event Name:** `page_view` (automatic + enhanced)

**Parameters:**
- `page_title`: "Apply Online - Scholarship Application"
- `page_location`: Full URL
- `page_path`: "/apply-online.html"

**When:** Automatically on page load

---

### 2. Form Field Focus Event
**Event Name:** `form_field_focus`

**Parameters:**
- `field_name`: Name/ID of the field
- `field_type`: Input type (text, email, select, etc.)
- `field_label`: Label text
- `is_required`: Boolean
- `focus_count`: Number of times this field was focused
- `total_field_interactions`: Total interactions across all fields

**When:** User clicks into any form field

---

### 3. Form Field Blur Event
**Event Name:** `form_field_blur`

**Parameters:**
- `field_name`: Name/ID of the field
- `field_type`: Input type
- `field_label`: Label text
- `value_length`: Length of entered value
- `is_required`: Boolean
- `has_value`: Boolean

**When:** User clicks out of a form field

---

### 4. Form Submission Attempt Event
**Event Name:** `form_submission_attempt`

**Parameters:**
- `form_id`: "scholarship-application-form"
- `form_name`: "Scholarship Application"
- `attempt_number`: Sequential attempt number (1, 2, 3...)
- `time_on_form_seconds`: Time spent on form
- `fields_filled`: Number of fields with values
- `total_fields`: Total number of form fields
- `completion_rate`: Percentage of fields filled
- `field_interactions_count`: Total field interactions
- `unique_fields_interacted`: Number of unique fields touched

**When:** User clicks Submit button (before validation)

---

### 5. Form Submission Success Event
**Event Name:** `form_submission_success`

**Parameters:**
- `form_id`: "scholarship-application-form"
- `form_name`: "Scholarship Application"
- `attempt_number`: Final attempt number
- `time_on_form_seconds`: Total time to complete
- `submission_time`: ISO timestamp
- `field_interactions_count`: Total interactions
- `unique_fields_interacted`: Unique fields touched
- `scholarship_name`: Scholarship name (sanitized)
- `course_name`: Course name
- `branch`: Branch name
- `year`: Year of study
- `category`: Category (GEN, OBC, etc.)
- `has_email_other`: Boolean
- `has_jee_ranks`: Boolean
- `has_cpi_score`: Boolean

**When:** Supabase successfully saves the form data

**Note:** No personally identifiable information (PII) is sent to GA4

---

### 6. Form Submission Failure Event
**Event Name:** `form_submission_failure`

**Parameters:**
- `form_id`: "scholarship-application-form"
- `form_name`: "Scholarship Application"
- `attempt_number`: Attempt number when failure occurred
- `time_on_form_seconds`: Time spent before failure
- `error_message`: Error message (truncated to 100 chars)
- `error_code`: HTTP status code or error code
- `error_type`: Type of error (api_error, network_error, etc.)
- `error_category`: Category (duplicate_submission, network_error, validation_error, server_error, etc.)
- `field_interactions_count`: Total interactions
- `unique_fields_interacted`: Unique fields touched
- `will_retry`: Boolean (always true)

**When:** Form submission fails (network error, API error, validation error, etc.)

**Error Categories:**
- `duplicate_submission`: User already submitted with same email/roll number
- `network_error`: Network/fetch error
- `validation_error`: HTTP 400 error
- `authentication_error`: HTTP 401/403 error
- `server_error`: HTTP 500+ error
- `unknown`: Other errors

---

### 7. Form Submission Retry Event
**Event Name:** `form_submission_retry`

**Parameters:**
- `form_id`: "scholarship-application-form"
- `form_name`: "Scholarship Application"
- `previous_attempt_number`: Previous failed attempt number
- `retry_number`: New attempt number

**When:** User clicks Submit again after a failure

---

## Testing Instructions

### Prerequisites
1. GA4 Measurement ID is correctly set in code
2. Website is deployed or running locally
3. Browser console is open (F12 → Console tab)

### Test 1: Verify GA4 Script Loading
1. Open `/apply-online.html` in browser
2. Open browser console (F12)
3. Type: `typeof gtag`
4. **Expected:** Should return `"function"`
5. If not, check that the GA4 script is loading correctly

### Test 2: Verify Debug Mode
1. Open browser console
2. Look for `[GA4 Debug]` messages
3. **Expected:** Should see debug logs for events
4. If not, check `debugMode: true` in `ga4-form-tracking.js`

### Test 3: Test Page View Tracking
1. Open `/apply-online.html`
2. Check console for: `[GA4 Debug] Event sent: page_view`
3. **Expected:** Should see page_view event logged

### Test 4: Test Field Interaction Tracking
1. Click into any form field (e.g., First Name)
2. Check console for: `[GA4 Debug] Event sent: form_field_focus`
3. Click out of the field
4. Check console for: `[GA4 Debug] Event sent: form_field_blur`
5. **Expected:** Both events should appear

### Test 5: Test Form Submission Attempt
1. Fill out some form fields
2. Click Submit button
3. Check console for: `[GA4 Debug] Event sent: form_submission_attempt`
4. **Expected:** Should see attempt event with form metrics

### Test 6: Test Successful Submission
1. Fill out the complete form with valid data
2. Use a unique email (e.g., `test123@itbhu.ac.in`) and roll number
3. Click Submit
4. Check console for:
   - `[GA4 Debug] Event sent: form_submission_attempt`
   - `[GA4 Debug] Event sent: form_submission_success`
5. **Expected:** Both events should appear, success event should have form data

### Test 7: Test Failed Submission (Duplicate)
1. Submit the form with same email/roll number again
2. Check console for:
   - `[GA4 Debug] Event sent: form_submission_attempt`
   - `[GA4 Debug] Event sent: form_submission_failure`
3. **Expected:** Failure event should have `error_category: "duplicate_submission"`

### Test 8: Test Retry After Failure
1. After a failed submission, fix the issue
2. Click Submit again
3. Check console for: `[GA4 Debug] Event sent: form_submission_retry`
4. **Expected:** Retry event should appear before the next attempt

### Test 9: Verify in GA4 Real-Time Reports
1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property
3. Go to **Reports** → **Realtime**
4. Fill out and submit the form
5. **Expected:** Should see events appearing in real-time within 30 seconds

### Test 10: Verify Events in GA4 DebugView
1. In GA4, go to **Admin** → **DebugView**
2. Enable debug mode (if not already enabled)
3. Submit the form
4. **Expected:** Should see all events in DebugView with full parameters

---

## Testing Checklist

- [ ] GA4 script loads correctly (`typeof gtag === "function"`)
- [ ] Debug mode shows console logs
- [ ] Page view event fires on page load
- [ ] Field focus events fire when clicking into fields
- [ ] Field blur events fire when clicking out of fields
- [ ] Form submission attempt event fires on Submit click
- [ ] Form submission success event fires on successful submission
- [ ] Form submission failure event fires on errors
- [ ] Form retry event fires when resubmitting after error
- [ ] Events appear in GA4 Real-Time reports
- [ ] Events appear in GA4 DebugView
- [ ] No PII (emails, names, addresses) is sent to GA4
- [ ] Error messages are properly categorized
- [ ] Time tracking works correctly
- [ ] Field interaction counts are accurate

---

## Troubleshooting

### Issue: GA4 events not appearing in console
**Solution:**
1. Check that `debugMode: true` in `ga4-form-tracking.js`
2. Verify GA4 script is loaded: `typeof gtag === "function"`
3. Check browser console for JavaScript errors

### Issue: Events not showing in GA4 Real-Time
**Solution:**
1. Verify Measurement ID is correct in both files
2. Wait 30-60 seconds (GA4 has a delay)
3. Check that you're viewing the correct GA4 property
4. Clear browser cache and try again

### Issue: Form submission not tracking
**Solution:**
1. Verify `ga4-form-tracking.js` is loaded before `scholarship-application.js`
2. Check that `window.GA4FormTracking` exists: `typeof window.GA4FormTracking`
3. Check browser console for errors

### Issue: Too many events or duplicate events
**Solution:**
1. Check that scripts are only loaded once
2. Verify event listeners aren't being attached multiple times
3. Check for duplicate script tags in HTML

### Issue: Network errors not being tracked
**Solution:**
1. Disconnect internet and try submitting
2. Check console for `form_submission_failure` event
3. Verify error category is `network_error`

### Issue: Debug mode too verbose
**Solution:**
1. Set `debugMode: false` in `ga4-form-tracking.js` (line 9)
2. Remove or comment out console.log statements if needed

---

## Production Checklist

Before going live:

- [ ] Replace Measurement ID with production ID (if different)
- [ ] Set `debugMode: false` in `ga4-form-tracking.js`
- [ ] Test all event tracking in production environment
- [ ] Verify no PII is being sent (check event parameters)
- [ ] Set up GA4 custom reports/dashboards for form metrics
- [ ] Document any custom dimensions/metrics you create
- [ ] Test with real form submissions (if possible)
- [ ] Monitor GA4 Real-Time for first few days

---

## GA4 Custom Reports Setup (Optional)

### Create a Custom Report for Form Metrics

1. Go to GA4 → **Explore** → **Blank**
2. Add dimensions:
   - Event name
   - Error category (for failures)
   - Error code
3. Add metrics:
   - Event count
   - Average time on form (custom metric)
4. Add filters:
   - Event name contains "form_"
5. Save as "Form Submission Analytics"

### Create Alerts

1. Go to GA4 → **Admin** → **Custom Definitions** → **Custom Alerts**
2. Create alert for:
   - High failure rate (>10% of submissions)
   - Duplicate submission errors
   - Network errors

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Verify GA4 Measurement ID is correct
3. Test in GA4 DebugView
4. Check that Supabase is responding correctly
5. Review this guide's troubleshooting section

---

## Code Files Summary

| File | Purpose | Status |
|------|---------|--------|
| `apply-online.html` | Contains GA4 script in `<head>` | ✅ Integrated |
| `js/ga4-form-tracking.js` | GA4 event tracking functions | ✅ Created |
| `js/scholarship-application.js` | Form submission handler (updated) | ✅ Updated |
| `GA4_INTEGRATION_GUIDE.md` | This documentation | ✅ Created |

---

## Next Steps

1. ✅ Get your GA4 Measurement ID
2. ✅ Update Measurement ID in code files
3. ✅ Test all tracking events
4. ✅ Verify in GA4 Real-Time reports
5. ✅ Set up custom reports (optional)
6. ✅ Monitor for first week
7. ✅ Set `debugMode: false` for production

---

**Last Updated:** January 2026
**Version:** 1.0
