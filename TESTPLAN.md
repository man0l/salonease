# Frontend Test Plan

## 1. User Registration

### Test Case 1.1: Successful User Registration
**Steps:**
1. Navigate to the registration page
2. Enter a valid full name
3. Enter a valid email address
4. Enter a valid password (meeting all requirements)
5. Enter the same password in the confirm password field
6. Check the "Accept Terms and Conditions" checkbox
7. Click the "Register" button

**Expected Result:**
- User should be redirected to the registration success page
- A success toast message should appear
- The user's information should be stored in the database

### Test Case 1.2: Registration with Invalid Data
**Steps:**
1. Navigate to the registration page
2. Leave the full name field empty
3. Enter an invalid email address (e.g., "test@test")
4. Enter a password that doesn't meet the requirements
5. Enter a different password in the confirm password field
6. Leave the "Accept Terms and Conditions" checkbox unchecked
7. Click the "Register" button

**Expected Result:**
- Error messages should appear for each invalid field
- The form should not be submitted
- The user should remain on the registration page

## 2. User Login

### Test Case 2.1: Successful Login
**Steps:**
1. Navigate to the login page
2. Enter a valid email address
3. Enter the correct password
4. Click the "Sign In" button

**Expected Result:**
- User should be redirected to the dashboard
- A success toast message should appear
- The user should be authenticated and have access to protected routes

### Test Case 2.2: Login with Invalid Credentials
**Steps:**
1. Navigate to the login page
2. Enter a valid email address
3. Enter an incorrect password
4. Click the "Sign In" button

**Expected Result:**
- An error toast message should appear
- The user should remain on the login page
- The user should not be authenticated

## 3. Forgot Password

### Test Case 3.1: Request Password Reset
**Steps:**
1. Navigate to the forgot password page
2. Enter a valid email address associated with an account
3. Click the "Send Reset Link" button

**Expected Result:**
- A success toast message should appear
- The user should receive a password reset email
- The button should be disabled while the request is processing

### Test Case 3.2: Request Password Reset with Invalid Email
**Steps:**
1. Navigate to the forgot password page
2. Enter an invalid email address
3. Click the "Send Reset Link" button

**Expected Result:**
- An error message should appear under the email input field
- No email should be sent
- The user should remain on the forgot password page

## 4. Reset Password

### Test Case 4.1: Successful Password Reset
**Steps:**
1. Click on the password reset link in the email
2. Enter a new valid password
3. Confirm the new password
4. Click the "Reset Password" button

**Expected Result:**
- A success toast message should appear
- The user should be redirected to the login page
- The user should be able to log in with the new password

### Test Case 4.2: Password Reset with Mismatched Passwords
**Steps:**
1. Click on the password reset link in the email
2. Enter a new valid password
3. Enter a different password in the confirm password field
4. Click the "Reset Password" button

**Expected Result:**
- An error message should appear indicating that the passwords don't match
- The form should not be submitted
- The user should remain on the reset password page

## 5. Salon Management

### Test Case 5.1: Add New Salon
**Steps:**
1. Log in as a salon owner
2. Navigate to the Salon Management page
3. Click the "Add New Salon" button
4. Fill in all required fields (name, address, contact number)
5. Click the "Add Salon" button

**Expected Result:**
- A success toast message should appear
- The new salon should be added to the list of salons
- The form should be reset or closed

### Test Case 5.2: Edit Existing Salon
**Steps:**
1. Log in as a salon owner
2. Navigate to the Salon Management page
3. Click the edit button for an existing salon
4. Modify some of the salon details
5. Click the "Update Salon" button

**Expected Result:**
- A success toast message should appear
- The salon details should be updated in the list
- The edit form should be closed

### Test Case 5.3: Delete Salon
**Steps:**
1. Log in as a salon owner
2. Navigate to the Salon Management page
3. Click the delete button for an existing salon
4. Confirm the deletion in the confirmation dialog

**Expected Result:**
- A success toast message should appear
- The salon should be removed from the list
- The confirmation dialog should close

## 6. Staff Management

### Test Case 6.1: Invite New Staff
**Steps:**
1. Log in as a salon owner
2. Navigate to the Staff Management page
3. Click the "Add New Staff" button
4. Enter the staff member's email and full name
5. Click the "Invite Staff" button

**Expected Result:**
- A success toast message should appear
- The new staff member should be added to the list (pending acceptance)
- An invitation email should be sent to the staff member

### Test Case 6.2: Update Staff Information
**Steps:**
1. Log in as a salon owner
2. Navigate to the Staff Management page
3. Click the edit button for an existing staff member
4. Modify the staff member's information
5. Click the "Update Staff" button

**Expected Result:**
- A success toast message should appear
- The staff member's information should be updated in the list
- The edit form should be closed

### Test Case 6.3: Remove Staff Member
**Steps:**
1. Log in as a salon owner
2. Navigate to the Staff Management page
3. Click the delete button for an existing staff member
4. Confirm the deletion in the confirmation dialog

**Expected Result:**
- A success toast message should appear
- The staff member should be removed from the list
- The confirmation dialog should close

## 7. Service Management

### Test Case 7.1: Add New Service
**Steps:**
1. Log in as a salon owner
2. Navigate to the Service Management page
3. Click the "Add New Service" button
4. Fill in all required fields (name, category, price, duration)
5. Click the "Add Service" button

**Expected Result:**
- A success toast message should appear
- The new service should be added to the list of services
- The form should be reset or closed

### Test Case 7.2: Edit Existing Service
**Steps:**
1. Log in as a salon owner
2. Navigate to the Service Management page
3. Click the edit button for an existing service
4. Modify some of the service details
5. Click the "Update Service" button

**Expected Result:**
- A success toast message should appear
- The service details should be updated in the list
- The edit form should be closed

### Test Case 7.3: Delete Service
**Steps:**
1. Log in as a salon owner
2. Navigate to the Service Management page
3. Click the delete button for an existing service
4. Confirm the deletion in the confirmation dialog

**Expected Result:**
- A success toast message should appear
- The service should be removed from the list
- The confirmation dialog should close

## 8. Salon Owner Onboarding

### Test Case 8.1: Complete Onboarding Process
**Steps:**
1. Register as a new salon owner
2. Log in for the first time
3. Click through the welcome message
4. Fill out the salon details in the SalonManagement component
5. Submit the salon information

**Expected Result:**
- The user should be guided through the onboarding process
- The salon information should be saved successfully
- The user should be redirected to the main dashboard after completion

### Test Case 8.2: Attempt to Skip Onboarding
**Steps:**
1. Register as a new salon owner
2. Log in for the first time
3. Attempt to navigate to other pages without completing onboarding

**Expected Result:**
- The user should be redirected back to the onboarding process
- Access to other pages should be restricted until onboarding is complete

## 9. Accept Staff Invitation

### Test Case 9.1: Successfully Accept Invitation
**Steps:**
1. Click on the invitation link received in the email
2. Enter a valid password
3. Confirm the password
4. Click the "Accept Invitation" button

**Expected Result:**
- A success toast message should appear
- The user should be redirected to the login page
- The user should be able to log in with their email and new password

### Test Case 9.2: Attempt to Accept with Invalid Token
**Steps:**
1. Manually navigate to the accept invitation page with an invalid or expired token
2. Enter a valid password
3. Confirm the password
4. Click the "Accept Invitation" button

**Expected Result:**
- An error message should appear indicating an invalid or expired token
- The invitation should not be accepted
- The user should be prompted to contact the salon owner for a new invitation

## 10. Bookings Management

### Test Case 10.1: Create New Booking
**Steps:**
1. Navigate to the Bookings Management page
2. Click "Create New Booking" button
3. Select or enter client information (existing or new client)
4. Select service, staff, and appointment date/time
5. Submit the booking form

**Expected Result:**
- A success toast message should appear
- The new booking should appear in the bookings list
- The booking should be sorted by appointmentDateTime in descending order

### Test Case 10.2: Reschedule Booking
**Steps:**
1. Find an existing booking
2. Click the reschedule button
3. Select a new date and time
4. Confirm the reschedule

**Expected Result:**
- The RescheduleModal should open
- Date validation should occur
- A success message should appear after rescheduling
- The booking should update with the new date/time

### Test Case 10.3: Cancel Booking
**Steps:**
1. Find an existing booking
2. Click the cancel button
3. Add cancellation notes (optional)
4. Confirm the cancellation

**Expected Result:**
- The CancelBookingModal should open
- Notes field should be optional
- A success message should appear after cancellation
- The booking status should update to cancelled

### Test Case 10.4: Reassign Staff
**Steps:**
1. Find an existing booking
2. Click the reassign staff button
3. Select a new staff member
4. Confirm the reassignment

**Expected Result:**
- The ReassignStaffModal should open
- Current staff should be displayed
- A success message should appear after reassignment
- The booking should update with the new staff member

### Test Case 10.5: Filter Bookings
**Steps:**
1. Navigate to the Bookings Management page
2. Apply date range filters
3. Reset filters

**Expected Result:**
- Bookings should filter based on start and end dates
- Bookings should display in descending order of appointmentDateTime
- Reset should clear all filters

## 11. Clients Management

### Test Case 11.1: Search Clients
**Steps:**
1. Navigate to the Clients Management page
2. Enter at least 3 characters in the search field
3. Test searching by name, email, and phone number

**Expected Result:**
- Search should only activate with 3+ characters
- Results should show matching clients
- Results should update as search term changes

### Test Case 11.2: Add New Client
**Steps:**
1. Click "Add New Client" button
2. Enter client details including phone number
3. Submit the form

**Expected Result:**
- Validation should check for existing clients with same email/phone
- Phone number should be unique per salon
- Success message should appear after adding client

### Test Case 11.3: Delete Client
**Steps:**
1. Find an existing client
2. Click the delete button
3. Confirm deletion in the confirmation dialog

**Expected Result:**
- DeleteConfirmationDialog should appear
- Success message should show after confirmation
- Client should be removed from the list
- Attempting to delete non-existent client should show error

### Test Case 11.4: Export Clients
**Steps:**
1. Navigate to the Clients Management page
2. Click the export button
3. Choose export format (if applicable)

**Expected Result:**
- Client data should export successfully
- Export should include all relevant client information
- Success message should appear after export

## 12. Public Salon Landing Page

### Test Case 12.1: Verify Initial Page Load Content
**Precondition:**
- Valid salon ID exists in the system
- Salon has complete profile information

**Steps:**
1. Navigate to `/salon/{validSalonId}`
2. Observe the hero section at the top
3. Check the info bar below hero section
4. Scroll through services section
5. View staff section
6. Check contact section at bottom

**Expected Results:**
- Hero section:
  * Displays salon name
  * Shows salon description
  * Contains background image/gradient
- Info bar:
  * Shows valid phone number
  * Displays complete address
  * Lists current day's working hours
- Services section:
  * Shows categorized service list
  * Each service displays name, duration, and price
- Staff section:
  * Lists all active staff members
  * Shows staff photos or placeholders
  * Displays staff names and roles
- Contact section:
  * Shows complete business hours
  * Lists all social media links
  * Displays map location

### Test Case 12.2: Verify Page Loading States
**Precondition:**
- Test environment allows network throttling
- Access to both valid and invalid salon IDs

**Steps:**
1. Loading State:
   * Enable slow 3G network throttling
   * Navigate to `/salon/{validSalonId}`
   * Observe loading indicators

2. Invalid ID:
   * Navigate to `/salon/{invalidSalonId}`
   * Observe error handling

3. API Error:
   * Configure API to return 500 error
   * Navigate to `/salon/{validSalonId}`
   * Observe error handling

**Expected Results:**
- Loading State:
  * Shows spinning loader animation
  * Placeholder content appears while loading
  * Content loads progressively

- Invalid ID:
  * Displays user-friendly error message
  * Suggests checking salon ID
  * No broken UI elements visible

- API Error:
  * Shows generic error message
  * Provides retry option if applicable
  * Logs error details (check console)

### Test Case 12.3: Test Service Category Navigation
**Precondition:**
- Salon has multiple service categories
- Categories include subcategories
- Services exist in different categories

**Steps:**
1. Category Expansion:
   * Click on main category header
   * Click on subcategory header
   * Click again to collapse

2. Visual Hierarchy:
   * Observe main category styling
   * Check subcategory indentation
   * Verify service placement

3. Interaction:
   * Click rapidly between categories
   * Expand multiple categories
   * Collapse parent with open child

**Expected Results:**
- Category Expansion:
  * Smooth animation on expand/collapse
  * Chevron icon rotates correctly
  * Content height adjusts properly

- Visual Hierarchy:
  * Main categories have distinct styling
  * Subcategories clearly indented
  * Services properly grouped

- Interaction:
  * No visual glitches during rapid clicks
  * Multiple categories can be open
  * Child categories collapse with parent

### Test Case 12.4: Verify Service Booking Flow
**Precondition:**
- Service is available for booking
- Staff members are assigned to service
- Business hours are configured

**Steps:**
1. Initiate Booking:
   * Locate a service card
   * Click "choose" button
   * Verify modal appears

2. Form Completion:
   * Enter client name: "Test Client"
   * Enter email: "test@example.com"
   * Enter phone: "+1234567890"
   * Select staff member
   * Choose available time slot

3. Submit Booking:
   * Review entered information
   * Click submit button
   * Observe confirmation

**Expected Results:**
- Modal Display:
  * Shows service details correctly
  * Pre-fills any known information
  * All required fields marked

- Form Interaction:
  * Staff dropdown shows only relevant staff
  * Time slots update based on staff selection
  * Form accepts valid input formats

- Submission:
  * Shows loading state during submission
  * Displays success message
  * Closes modal after success

### Test Case 12.5: Validate Booking Form Requirements
**Precondition:**
- Booking modal is open
- Form is in initial state
- Validation rules are active

**Steps:**
1. Required Fields:
   * Leave all fields empty
   * Click submit
   * Observe error messages

2. Email Validation:
   * Enter "invalid.email"
   * Enter "test@incomplete"
   * Enter "test@example.com"

3. Phone Validation:
   * Enter "123" (too short)
   * Enter "abcdefghijk" (non-numeric)
   * Enter valid phone number

4. Time Selection:
   * Try submitting without time slot
   * Select unavailable time
   * Select valid time slot

**Expected Results:**
- Required Fields:
  * Shows error for each empty required field
  * Error messages are clear and specific
  * Submit button remains disabled

- Email Validation:
  * Rejects invalid email formats
  * Shows specific email error message
  * Accepts valid email format

- Phone Validation:
  * Enforces minimum length
  * Allows only valid characters
  * Formats number correctly

- Time Selection:
  * Prevents submission without time
  * Clearly indicates unavailable slots
  * Allows selection of valid slots

### Test Case 12.6: Test Time Slot Selection
**Precondition:**
- Staff member is selected
- Current date is selected
- Available slots exist

**Steps:**
1. Date Selection:
   * Select current date
   * Select future date
   * Attempt past date selection

2. Time Slots:
   * View available slots
   * View booked slots
   * Select different time zones

3. Staff Availability:
   * Change staff member
   * Check different day slots
   * Verify 15-minute intervals

**Expected Results:**
- Date Selection:
  * Prevents past date selection
  * Shows available dates clearly
  * Updates slots for selected date

- Time Slots:
  * Clearly marks available slots
  * Disables booked/unavailable slots
  * Shows correct time format

- Staff Availability:
  * Updates slots per staff member
  * Respects business hours
  * Maintains 15-minute spacing

### Test Case 12.7: Verify Responsive Design
**Precondition:**
- Access to different devices/emulators
- Various screen sizes available
- Touch-enabled device available

**Steps:**
1. Desktop Testing (1920x1080):
   * Check layout and spacing
   * Test mouse interactions
   * Verify content alignment

2. Tablet Testing (768x1024):
   * Verify column adjustments
   * Test touch interactions
   * Check image scaling

3. Mobile Testing (375x667):
   * Verify single column layout
   * Test touch targets
   * Check navigation usability

**Expected Results:**
- Desktop View:
  * Clean, multi-column layout
  * Proper spacing between elements
  * No horizontal scrolling

- Tablet View:
  * Responsive grid adjustments
  * Touch targets min 44x44px
  * Maintains readability

- Mobile View:
  * Single column where appropriate
  * Easy thumb navigation
  * No overlapping elements