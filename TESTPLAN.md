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

