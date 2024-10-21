# Features
## 1. User Registration (Salon Owners)

### Frontend

**Registration Page (/register):**

- **Form Fields:**
  - Full Name (fullName)
  - Email Address (email)
  - Password (password)
  - Confirm Password (confirmPassword)
  - Accept Terms and Conditions (Checkbox acceptTerms)

- **Client-Side Validation:**
  - All fields are required.
  - Email must be in a valid format.
  - Password must be at least 8 characters, include uppercase letters, numbers, and special characters.
  - Password and Confirm Password must match.
  - Terms and Conditions must be accepted.

- **UI Components:**
  - Use React Hook Form for form state management.
  - Use Yup for schema validation.
  - Display validation error messages below each field.
  - Submit button is disabled until the form is valid.

- **API Integration:**
  - On form submission, send a POST request to `/api/auth/register` with form data.
  - Handle loading state and errors.
  - On success, redirect to email verification notice page.

### Backend

**API Endpoint: POST /api/auth/register**

- **Request Body:**
  - `fullName`: string
  - `email`: string
  - `password`: string

- **Validations:**
  - Check if the email already exists in the database.
  - Validate password strength.

- **Actions:**
  - Hash the password using bcrypt.
  - Create a new user record with the role `SalonOwner`.
  - Generate an email verification token.
  - Send a verification email using `emailHelper.js`.

- **Response:**
  - Success: `{ message: "Registration successful. Please check your email to verify your account." }`
  - Error: Appropriate HTTP status code and error message.

## 2. Email Verification

### Frontend

**Verification Page (/verify-email?token=...):**

- On component mount, extract the token from the query parameters.
- Send a GET request to `/api/auth/verify-email?token=...`.
- Display a success or error message based on the response.
- Redirect to login page after successful verification.

### Backend

**API Endpoint: GET /api/auth/verify-email**

- **Query Parameters:**
  - `token`: string

- **Actions:**
  - Decode and verify the token.
  - Set the user's `isEmailVerified` field to true in the database.

- **Response:**
  - Success: Redirect to login page with a success message.
  - Error: Display an error message indicating the token is invalid or expired.

## 3. User Login

### Frontend

**Login Page (/login):**

- **Form Fields:**
  - Email Address (email)
  - Password (password)

- **Client-Side Validation:**
  - All fields are required.

- **UI Components:**
  - Use React Hook Form for form handling.
  - Display error messages below each field.
  - "Remember Me" checkbox to keep the user logged in.

- **API Integration:**
  - On form submission, send a POST request to `/api/auth/login`.
  - Handle loading state and display errors.
  - On success, store JWT token securely (use HttpOnly cookies for security).
  - Redirect to the dashboard page.

### Backend

**API Endpoint: POST /api/auth/login**

- **Request Body:**
  - `email`: string
  - `password`: string

- **Actions:**
  - Find the user by email.
  - Verify the password using `bcrypt.compare()`.
  - Check if the email is verified.
  - Generate a JWT token containing the user's ID and role.

- **Response:**
  - Success: token: "JWT_TOKEN", user: { id, fullName, role } }`
  - Error: Appropriate HTTP status code and error message.

## 4. Password Reset

### Frontend

**Forgot Password Page (/forgot-password):**

- **Form Field:**
  - Email Address (email)

- **Client-Side Validation:**
  - Email is required and must be in a valid format.

- **API Integration:**
  - On form submission, send a POST request to `/api/auth/forgot-password`.
  - Display a success message instructing the user to check their email.

**Reset Password Page (/reset-password?token=...):**

- **Form Fields:**
  - New Password (newPassword)
  - Confirm New Password (confirmNewPassword)

- **Client-Side Validation:**
  - Password must meet strength requirements.
  - New Password and Confirm New Password must match.

- **API Integration:**
  - On form submission, send a POST request to `/api/auth/reset-password` with the token and new password.
  - Display a success message and redirect to the login page.

### Backend

**API Endpoint: POST /api/auth/forgot-password**

- **Request Body:**
  - `email`: string

- **Actions:**
  - Verify that the email exists in the database.
  - Generate a password reset token.
  - Send a password reset email with the token.

- **Response:**
  - Success: `{ message: "Password reset email sent." }`
  - Error: Appropriate error message.

**API Endpoint: POST /api/auth/reset-password**

- **Request Body:**
  - `token`: string
  - `newPassword`: string

- **Actions:**
  - Verify the reset token.
  - Hash the new password.
  - Update the user's password in the database.

- **Response:**
  - Success: `{ message: "Password has been reset successfully." }`
  - Error: Appropriate error message.

## 5. Role-Based Access Control (RBAC)

### Frontend

**Protected Routes:**

- Use `PrivateRoute` component to protect routes that require authentication.
- Check user's role from the authentication context or JWT token.
- Redirect unauthorized users to appropriate pages.

**Components and Menus:**

- Render components and menu items based on user roles (e.g., SalonOwner, Staff).

### Backend

**Middleware: authMiddleware.js**

- Verify JWT token from the request headers.
- Attach user information to `req.user`.
- Handle token expiration and invalid tokens.

**Middleware: roleMiddleware.js**

- Check `req.user.role` against allowed roles for the endpoint.
- Return 403 Forbidden if the user does not have the required role.

**Implementation:**

- Apply `authMiddleware` and `roleMiddleware` to protected routes.
- Define roles: SalonOwner, Staff, Admin (if needed for system administrators).

## 6. Salon Management

### 6.1. Multi-Salon Management

#### Frontend

**Salon Selector Component:**

- Dropdown or modal that allows salon owners to switch between salons they own.
- Display the current salon's name in the dashboard header.

**Salon Management Page (/salons):**

- **List of Salons:**
  - Display all salons owned by the user.
  - Show salon details: name, address, contact info.
  - Options to edit or delete each salon.

- **Add Salon Modal:**
  - **Form Fields:**
    - Salon Name (name)
    - Address (address)
    - Contact Number (contactNumber)
    - Description (description)

  - **Client-Side Validation:**
    - All fields except description are required.

  - **API Integration:**
    - On form submission, send a POST request to `/api/salons`.
    - Update the salon list upon successful creation.

- **Edit Salon Modal:**
  - Pre-populate form with salon data.
  - On submission, send a PUT request to `/api/salons/:salonId`.

#### Backend

**Models: Salon.js**

- **Fields:** `id`, `ownerId`, `name`, `address`, `contactNumber`, `description`, `createdAt`, `updatedAt`

- **Associations:**
  - A salon belongs to a user (`ownerId`).

**API Endpoints:**

- **POST /api/salons**
  - **Request Body:**
    - `name`, `address`, `contactNumber`, `description`
  - **Actions:**
    - Create a new salon linked to `req.user.id`.
  - **Response:**
    - Success: Salon object.
    - Error: Validation errors.

- **GET /api/salons**
  - **Actions:**
    - Retrieve all salons where `ownerId` matches `req.user.id`.

- **PUT /api/salons/:salonId**
  - **Actions:**
    - Update salon details.
    - Verify that the salon belongs to `req.user.id`.

- **DELETE /api/salons/:salonId**
  - **Actions:**
    - Soft delete the salon.
    - Verify ownership.

## 7. Staff Management

### 7.1. Employee Invitation and Registration

#### Frontend

**Staff Management Page (/salons/:salonId/staff):**

- **List of Staff:**
  - Display staff members associated with the salon.
  - Show staff details: name, role, email.
  - Options to edit or remove staff.

- **Invite Staff Modal:**
  - **Form Fields:**
    - Email Address (email)
    - Full Name (fullName)
    - Role (role) - dropdown (e.g., Stylist, Manager)

  - **Client-Side Validation:**
    - Email must be valid and required.
    - Full Name is required.
    - Role is required.

  - **API Integration:**
    - On submission, send a POST request to `/api/salons/:salonId/staff/invite`.
    - Display success message.

**Employee Registration Page (/staff/register?token=...):**

- Accessed via invitation link sent to the employee's email.
- **Form Fields:**
  - Set Password (password)
  - Confirm Password (confirmPassword)

- **Client-Side Validation:**
  - Password strength and match.

- **API Integration:**
  - On submission, send a POST request to `/api/staff/accept-invitation`.

#### Backend

**API Endpoint: POST /api/salons/:salonId/staff/invite**

- **Request Body:**
  - `email`, `fullName`, `role`

- **Actions:**
  - Verify that the user is the owner of the salon.
  - Check if the email is already registered.
  - Create an invitation token.
  - Send an invitation email with the token.

- **Response:**
  - Success message.

**API Endpoint: POST /api/staff/accept-invitation**

- **Request Body:**
  - `token`, `password`

- **Actions:**
  - Validate the invitation token.
  - Create a new staff user with the provided password.
  - Associate the user with the salon and role.
  - Delete the invitation token.

- **Response:**
  - Success message and redirect to login.

### 7.2. Staff Access and Permissions

#### Frontend

**Staff Dashboard:**

- Staff users see only the salons and data they are associated with.
- Limited navigation options based on role.

**Components:**

- Use conditional rendering to display components based on user role.

#### Backend

**Middleware:**

- Ensure that staff can only access data for salons they are associated with.
- Check `req.user.salonId` against the requested salon data.

**Models: Staff.js**

- **Fields:** `id`, `userId`, `salonId`, `role`

- **Associations:**
  - Staff belongs to a user and a salon.


### 7.3. Staff Availability Management

#### Backend Implementation

##### Database Schema

###### StaffAvailability Model

File: StaffAvailability.js

Fields:
- id: Unique identifier for the availability record
- staffId: References the staff member (including salon owner)
- salonId: References the salon
- dayOfWeek: Indicates the day of the week (0 for Sunday to 6 for Saturday)
- startTime: Start time of the availability slot
- endTime: End time of the availability slot
- type: Enum ('AVAILABILITY', 'TIME_OFF')

Explanation:
- The model focuses on managing time slots for all types of staff activities.
- Breaks are represented as gaps between availability records.
- Time off is a separate type of record.

##### API Endpoints

1. Get Salon Staff Availability

Endpoint: GET /api/salons/:salonId/staff-availability
Description: Retrieves all availability slots for all staff members in a salon.
Actions: Fetch availability from the StaffAvailability table where salonId matches the parameter.

2. Create/Update Staff Availability

Endpoint: POST /api/salons/:salonId/staff-availability
Description: Creates or updates availability slots for a staff member.
Request Body Example:
```json
{
  "staffId": "staff_uuid",
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "12:00",
  "type": "AVAILABILITY"
}
```
Actions:
- Validate entries to ensure no overlapping times with other availability slots.
- If updating (availabilityId is provided), exclude the current availability from overlap check.
- Create a new availability slot or update the existing one in the database.

3. Delete Staff Availability

Endpoint: DELETE /api/salons/:salonId/staff-availability/:availabilityId
Description: Deletes an availability slot.
Actions: Remove the record from the database.

##### Validation Logic

- No Overlaps: Ensure that availability slots for a staff member do not overlap with other slots.
- Time Order: endTime must be after startTime.
- Breaks: Represented by gaps between availability slots.

#### Frontend Implementation

##### Staff Availability Management Page (/salons/:salonId/staff-availability)

###### User Interface Components

1. Weekly Calendar View:
   - Uses react-big-calendar library for implementation.
   - Displays a week view by default, with an option to switch to a month view.
   - Each column represents a staff member, including the salon owner.
   - Each row represents a day of the week.
   - Shows existing availability slots, breaks, and time off.

2. Add/Edit Availability Modal:
   - Appears when clicking on an empty slot or existing availability.
   - Fields:
     - Staff Member: Auto-filled based on the column clicked (read-only).
     - Day of Week: Auto-filled based on the row clicked (read-only).
     - Start Time / End Time: Time pickers.
     - Type: Dropdown (Availability, Break, Time Off).
   - Validation:
     - Ensures endTime is after startTime.
     - Checks for overlapping slots.

###### Interaction Flow

1. Viewing Availability:
   - The salon owner sees the calendar view with all staff members' schedules.
   - Different types of slots (availability, breaks, time off) are color-coded.

2. Adding/Editing Availability:
   - The salon owner clicks on an empty slot or existing availability.
   - The Add/Edit Availability Modal appears with pre-filled information.
   - The salon owner adjusts the times and type as needed.
   - Upon saving, the calendar updates to reflect the changes.

3. Deleting Availability:
   - The salon owner can delete an availability slot by clicking on it and selecting a delete option in the modal.

###### API Integration

- Fetch Salon Staff Availability:
  - On page load, fetch all staff availability data for the salon.
  - Update the calendar view with the fetched data.

- Create/Update Availability:
  - When the salon owner saves a new or edited availability slot, send a POST request to the backend.
  - Update the calendar view upon successful response.

- Delete Availability:
  - When the salon owner deletes an availability slot, send a DELETE request to the backend.
  - Remove the slot from the calendar view upon successful response.

#### Example Scenario

Salon Owner Action:
1. Opens the Staff Availability Management page.
2. Sees a weekly calendar view with columns for each staff member.
3. Clicks on an empty slot in John's column for Monday from 9 AM to 12 PM.
4. In the modal, selects "Availability" as the type and confirms the times.
5. Clicks save, and sees the slot appear in John's column.
6. Clicks on the newly created slot, changes the end time to 11 AM, and saves.
7. Clicks on the slot from 11 AM to 12 PM and sets it as a "Break".
8. Repeats the process for other staff members and time slots as needed.

#### Advantages of This Approach

- Centralized Management: Allows salon owners to manage all staff schedules from a single interface.
- Visual Representation: Provides a clear, calendar-based view of all staff availability.
- Flexibility: Easily accommodates regular schedules, breaks, and time off.
- Real-time Updates: Changes are immediately reflected in the calendar view.

#### Considerations

- Performance: Optimize data fetching for salons with many staff members.
- User Permissions: Ensure that only salon owners can modify staff availability.
- Mobile Responsiveness: Adapt the calendar view for smaller screens.

#### Summary

This staff availability management system provides salon owners with a powerful, visual tool to manage their staff's schedules. By using a calendar interface with react-big-calendar, it offers an intuitive way to view and modify availability, breaks, and time off for all staff members. The backend supports this flexibility with a simple data model and efficient API endpoints, ensuring a smooth and responsive user experience.


## 8. Service Management

### 8.1. Manage Salon Services

#### Frontend

**Services Page (/salons/:salonId/services):**

- **List of Services:**
  - Display all services offered by the salon.
  - Show details: service name, category, duration, price, promotional offers.
  - Options to edit or delete each service.

- **Add Service Modal:**
  - **Form Fields:**
    - Service Name (name)
    - Category (category) - dropdown (e.g., Hair, Nails, Spa)
    - Price (price)
    - Duration (duration) in minutes
    - Description (description)
    - Promotional Offer (promotionalOffer) - optional

  - **Client-Side Validation:**
    - Required fields.
    - Price and duration must be positive numbers.

  - **API Integration:**
    - On submission, send a POST request to `/api/salons/:salonId/services`.
    - Update the service list upon success.

- **Edit Service Modal:**
  - Pre-populate form with existing service data.
  - On submission, send a PUT request to `/api/salons/:salonId/services/:serviceId`.

#### Backend

**Models: Service.js**

- **Fields:** `id`, `salonId`, `name`, `category`, `price`, `duration`, `description`, `promotionalOffer`, `createdAt`, `updatedAt`

**API Endpoints:**

- **POST /api/salons/:salonId/services**
  - **Actions:**
    - Verify salon ownership.
    - Create a new service record.

- **GET /api/salons/:salonId/services**
  - **Actions:**
    - Retrieve all services for the salon.

- **PUT /api/salons/:salonId/services/:serviceId**
  - **Actions:**
    - Update service details.
    - Verify ownership.

- **DELETE /api/salons/:salonId/services/:serviceId**
  - **Actions:**
    - Delete the service.
    - Verify ownership.

## 9. Client Management

### 9.1. Client Profiles and Data Ownership

#### Frontend

**Clients Page (/salons/:salonId/clients):**

- **List of Clients:**
  - Display client names, contact information, last appointment date.
  - Search and filter options.

**Client Details Page (/salons/:salonId/clients/:clientId):**

- Display client profile with contact info and appointment history.
- Add and edit notes about client preferences or requirements.
- Option to export client data.

**Export Data:**

- Button to export client list as CSV.
- Allow selection of data fields to include.

- **API Integration:**
  - GET `/api/salons/:salonId/clients`
  - GET `/api/salons/:salonId/clients/:clientId`
  - PUT `/api/salons/:salonId/clients/:clientId`
  - GET `/api/salons/:salonId/clients/export`

#### Backend

**Models: Client.js**

- **Fields:** `id`, `salonId`, `name`, `email`, `phone`, `notes`, `createdAt`, `updatedAt`

**API Endpoints:**

- **GET /api/salons/:salonId/clients**
  - **Actions:**
    - Retrieve clients associated with the salon.

- **GET /api/salons/:salonId/clients/:clientId**
  - **Actions:**
    - Retrieve detailed client information.

- **PUT /api/salons/:salonId/clients/:clientId**
  - **Actions:**
    - Update client notes or contact information.

- **GET /api/salons/:salonId/clients/export**
  - **Actions:**
    - Generate a CSV file of client data.
  - **Response:**
    - Stream the CSV file for download.

## 10. Booking and Appointment Management

### 10.1. Booking via Manychat Chatbot

#### Frontend

**Not Applicable:**

- Clients interact with the Manychat chatbot on platforms like Facebook Messenger.

#### Backend

**API Endpoint: POST /api/bookings/manychat**

- **Public Endpoint:**
  - Receives booking requests from Manychat.

- **Request Body:**
  - `salonId`: string
  - `serviceId`: string
  - `staffId`: string (optional)
  - `clientInfo`: object
  - `name`: string
  - `email`: string
  - `phone`: string
  - `appointmentDateTime`: string (ISO format)

- **Actions:**
  - Validate salon, service, and staff availability.
  - Check for booking conflicts.
  - Create a new booking record.
  - Create or update client profile.
  - Send confirmation notifications to client and assigned staff member.

- **Response:**
  - Success: Booking details.
  - Error: Error message indicating the issue (e.g., time slot not available).

### 10.2. Booking Management in Application

#### Frontend

**Bookings Page (/salons/:salonId/bookings):**

- **List of Bookings:**
  - Display upcoming and past bookings.
  - Show details: client name, service, staff, date and time, status.
  - Filters for date range, staff, and service.

- **Booking Details Modal:**
  - View detailed information about the booking.
  - Options to reschedule, cancel, or add notes.

- **Rescheduling:**
  - Open a date and time picker to select a new appointment time.
  - Validate new time slot availability.

- **Cancellation:**
  - Confirm cancellation action.
  - Option to notify the client with a custom message.

- **API Integration:**
  - GET `/api/salons/:salonId/bookings`
  - GET `/api/salons/:salonId/bookings/:bookingId`
  - PUT `/api/salons/:salonId/bookings/:bookingId`
  - DELETE `/api/salons/:salonId/bookings/:bookingId`

#### Backend

**Models: Booking.js**

- **Fields:** `id`, `salonId`, `clientId`, `serviceId`, `staffId`, `appointmentDateTime`, `status`, `notes`, `createdAt`, `updatedAt`

**API Endpoints:**

- **GET /api/salons/:salonId/bookings**
  - **Actions:**
    - Retrieve bookings for the salon.
    - Support filters (date range, staff, service).

- **GET /api/salons/:salonId/bookings/:bookingId**
  - **Actions:**
    - Retrieve booking details.

- **PUT /api/salons/:salonId/bookings/:bookingId**
  - **Actions:**
    - Update booking details (e.g., reschedule, add notes).

# 12.3. Audit Logs
    
    ## Frontend
    
    ### Audit Logs Page (/audit-logs)
    - **Display a list of audit logs** with details such as action type, user, timestamp, and affected resources.
    - **Filters:**
      - Date range picker.
      - Action type (e.g., login, data export).
      - User selection.
    
    ### API Integration
    - **GET /api/audit-logs**
    
    ## Backend
    
    ### Models
    - **AuditLog.js**
      - Fields: id, userId, actionType, resource, timestamp, details
    
    ### API Endpoints
    - **GET /api/audit-logs**
      - **Actions:**
        - Retrieve audit logs based on filters.
        - Store audit logs for significant actions (e.g., login, data export, data deletion).
    
    ### Security
    - Ensure only authorized users can access audit logs.
    - Log sensitive actions securely.
    
    # 13. User Feedback and Support
    
    ## 13.1. Feedback Collection
    
    ### Frontend
    
    #### Feedback Page (/feedback)
    - **Form Fields:**
      - Feedback Type (dropdown: Bug Report, Feature Request, General Feedback)
      - Description (textarea)
    - **Client-Side Validation:**
      - All fields are required.
    - **API Integration:**
      - On form submission, send a POST request to /api/feedback.
      - Display a success message upon submission.
    
    ### Backend
    
    #### API Endpoint: POST /api/feedback
    - **Request Body:**
      - feedbackType: string
      - description: string
    - **Actions:**
      - Store feedback in the database.
      - Send notification to the support team.
    - **Response:**
      - Success: { message: "Feedback submitted successfully." }
      - Error: Appropriate error message.
    
    ## 13.2. Support Tickets
    
    ### Frontend
    
    #### Support Page (/support)
    - **Form Fields:**
      - Subject (text)
      - Description (textarea)
    - **Client-Side Validation:**
      - All fields are required.
    - **API Integration:**
      - On form submission, send a POST request to /api/support/tickets.
      - Display a success message upon submission.
    
    ### Backend
    
    #### API Endpoint: POST /api/support/tickets
    - **Request Body:**
      - subject: string
      - description: string
    - **Actions:**
      - Create a new support ticket in the database.
      - Send notification to the support team.
    - **Response:**
      - Success: { message: "Support ticket created successfully." }
      - Error: Appropriate error message.
    
    # 14. Localization and Internationalization
    
    ## 14.1. Multi-Language Support
    
    ### Frontend
    
    #### Language Selector
    - Dropdown to select the preferred language.
    - Store the selected language in local storage or user profile.
    - Use i18next or similar library for translations.
    - Translate all UI components based on the selected language.
    
    ### Backend
    
    #### Localization Middleware
    - Detect the preferred language from the request headers or user profile.
    - Load appropriate language files for responses.
    
    #### Database
    - Store localized content (e.g., service descriptions) in multiple languages.
    
    # 15. Performance Optimization
    
    ## 15.1. Frontend Optimization
    
    ### Code Splitting
    - Use dynamic imports to split code into smaller bundles.
    - Lazy load components that are not immediately needed.
    
    ### Caching
    - Use service workers to cache static assets.
    - Implement client-side caching for API responses.
    
    ### Minimize Re-renders
    - Use React.memo and useCallback to prevent unnecessary re-renders.
    
    ## 15.2. Backend Optimization
    
    ### Database Indexing
    - Create indexes on frequently queried fields.
    - Optimize database queries to reduce load times.
    
    ### Caching
    - Use Redis or similar caching mechanism for frequently accessed data.
    
    ### Load Balancing
    - Distribute incoming requests across multiple servers to balance the load.
    
    ### Asynchronous Processing
    - Use background jobs for time-consuming tasks (e.g., sending emails).
    
    # 16. Documentation and Help
    
    ## 16.1. User Documentation
    
    ### Frontend
    
    #### Help Center Page (/help)
    - **Sections:**
      - Getting Started
      - User Guides
      - FAQs
    - **Search Functionality:**
      - Allow users to search for specific topics.
    
    ### Backend
    
    #### API Endpoint: GET /api/help
    - **Actions:**
      - Retrieve help articles and documentation.
      - Store documentation content in the database or as markdown files.
    
    ## 16.2. Developer Documentation
    
    ### API Documentation
    - Use Swagger or similar tool to generate API documentation.
    - Provide examples for each endpoint.
    
    ### Code Comments
    - Ensure code is well-commented to explain complex logic.
    
    ### README Files
    - Include README files in each project directory with setup instructions and usage guidelines.

    ## 13. User Interface Design and Layout

### 13.1. Application Layout and Navigation

- **Frontend**
  - **Overall Layout:**
    - Use a **responsive design** to ensure the application works well on various screen sizes.
    - **Layout Structure:**
      - **Header (Top Navigation Bar):**
        - Contains the application logo and name.
        - Includes a **user menu** on the right with options like Profile, Settings, and Logout.
      - **Sidebar (Left Navigation Menu):**
        - Contains navigation links to different sections of the application.
        - **Collapsible** to save screen space on smaller devices.
      - **Main Content Area:**
        - Displays the content based on the selected menu option.
      - **Footer (Optional):**
        - Contains application version, copyright information.
  - **Color Scheme and Theme:**
    - **Primary Color:** `#4A90E2` (a shade of blue).
    - **Secondary Color:** `#50E3C2` (a shade of teal).
    - **Accent Color:** `#F5A623` (a shade of orange for highlights).
    - **Background Color:** `#F9FAFB` (light grey for background).
    - **Text Color:** `#333333` (dark grey for readability).
    - **Tailwind CSS Theme Configuration:**
      - Customize the default Tailwind theme to include these colors.
      - Use Tailwind's `extend` in `tailwind.config.js` to add custom colors.
  - **Typography:**
    - **Primary Font:** 'Inter', sans-serif.
    - **Font Sizes:**
      - Use Tailwind's default font sizes or customize as needed.
  - **Icons:**
    - Use **Heroicons** for consistent and modern iconography.
    - Install `@heroicons/react` package.
  - **Sidebar Navigation Links:**
    - **Dashboard**
      - **Icon:** `HomeIcon`.
      - **Route:** `/dashboard`.
    - **Calendar**
      - **Icon:** `CalendarIcon`.
      - **Route:** `/salons/:salonId/calendar`.
    - **Bookings**
      - **Icon:** `ClipboardListIcon`.
      - **Route:** `/salons/:salonId/bookings`.
    - **Clients**
      - **Icon:** `UsersIcon`.
      - **Route:** `/salons/:salonId/clients`.
    - **Staff**
      - **Icon:** `UserGroupIcon`.
      - **Route:** `/salons/:salonId/staff`.
    - **Services**
      - **Icon:** `ScissorsIcon` (use a custom icon if necessary).
      - **Route:** `/salons/:salonId/services`.
    - **Billing**
      - **Icon:** `CreditCardIcon`.
      - **Route:** `/billing`.
    - **Reports**
      - **Icon:** `ChartBarIcon`.
      - **Route:** `/reports`.
    - **Settings**
      - **Icon:** `CogIcon`.
      - **Route:** `/settings`.
  - **Sidebar Design:**
    - **Active Link Highlighting:**
      - Use the **Accent Color** to highlight the active or hovered link.
    - **Hover Effects:**
      - Slight background color change on hover.
    - **Collapsed Sidebar:**
      - Provide an option to collapse the sidebar to icons only.
      - Implement a toggle button at the bottom or top of the sidebar.
  - **Header Design:**
    - **User Menu:**
      - Display the user's avatar or initials.
      - Dropdown menu with options:
        - **Profile**
          - Route: `/profile`.
        - **Notifications**
          - Route: `/notifications`.
        - **Logout**
  - **Responsiveness:**
    - On smaller screens (mobile devices):
      - Sidebar collapses into a hamburger menu.
      - Use **Drawer** or **Off-canvas** menu for sidebar navigation.
    - Ensure all components adjust appropriately to different screen sizes.
- **Backend**
  - **Not directly applicable**, but ensure APIs provide data efficiently to support the frontend layout requirements.

### 13.2. Tailwind CSS Configuration

- **Installation:**
  - Ensure Tailwind CSS is installed and configured in the project.
- **Custom Theme in `tailwind.config.js`:**
  - **Extend Colors:**
    ```javascript
    module.exports = {
      theme: {
        extend: {
          colors: {
            primary: '#4A90E2',
            secondary: '#50E3C2',
            accent: '#F5A623',
            background: '#F9FAFB',
            text: '#333333',
          },
        },
      },
      variants: {},
      plugins: [],
    };
    ```
  - **Fonts:**
    - Include 'Inter' font via Google Fonts or import it in CSS.
    - Configure in Tailwind:
      ```javascript
      module.exports = {
        theme: {
          extend: {
            fontFamily: {
              sans: ['Inter', 'sans-serif'],
            },
          },
        },
      };
    ```
- **Components Styling:**
  - Use Tailwind utility classes to style components.
  - Create reusable components (e.g., `Button`, `Card`) with consistent styling.
- **Dark Mode (Optional):**
  - Configure Tailwind to support dark mode if desired.

### 13.3. Implementing Icons and SVGs

- **Using Heroicons:**
  - Install the package:
    ```bash
    npm install @heroicons/react
    ```
  - Import icons as needed:
    ```javascript
    import { HomeIcon, CalendarIcon, UsersIcon } from '@heroicons/react/outline';
    ```
  - **Icon Sizes:**
    - Use Tailwind classes to set icon sizes, e.g., `h-6 w-6`.
- **Custom Icons:**
  - For icons not available in Heroicons (e.g., `ScissorsIcon`), import SVGs directly or use another icon set like **FontAwesome**.
  - Example of importing an SVG:
    ```javascript
    import { ReactComponent as ScissorsIcon } from '../assets/icons/scissors.svg';
    ```

### 13.4. Accessibility Considerations

- **Keyboard Navigation:**
  - Ensure all interactive elements are accessible via keyboard (tab navigation).
- **ARIA Labels:**
  - Add appropriate `aria-label` attributes to icons and buttons.
- **Contrast Ratios:**
  - Use colors that meet WCAG AA standards for contrast.
- **Alt Text:**
  - Provide alt text for images and meaningful labels for icons.

### 13.5. Responsive Design Breakpoints

- **Tailwind Default Breakpoints:**
  - `sm`: `640px`.
  - `md`: `768px`.
  - `lg`: `1024px`.
  - `xl`: `1280px`.
  - Use these breakpoints to adjust layouts and component visibility.

### 13.6. Sample Sidebar Component Structure

- **Sidebar Component (`Sidebar.js`):**
  - **Structure:**
    ```jsx
    const navigation = [
      { name: 'Dashboard', icon: HomeIcon, route: '/dashboard' },
      { name: 'Calendar', icon: CalendarIcon, route: `/salons/${currentSalonId}/calendar` },
      // ...other links
    ];

    function Sidebar() {
      return (
        <div className="h-full bg-white shadow-md">
          <div className="p-4">
            <Logo />
          </div>
          <nav>
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.route}
                className="flex items-center p-2 text-gray-700 hover:bg-gray-100"
                activeClassName="bg-gray-200 text-primary"
              >
                <item.icon className="h-6 w-6 mr-3" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      );
    }
    ```
  - **Collapsible Functionality:**
    - Use state to manage whether the sidebar is expanded or collapsed.
    - Adjust CSS classes based on the state.

### 13.7. Sample Header Component Structure

- **Header Component (`Header.js`):**
  - **Structure:**
    ```jsx
    function Header() {
      return (
        <header className="flex items-center justify-between bg-white shadow px-4 py-2">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              {currentSalonName}
            </h1>
          </div>
          <div className="flex items-center">
            <button className="relative">
              <BellIcon className="h-6 w-6 text-gray-600" />
              {/* Notification Badge */}
              <span className="absolute top-0 right-0 inline-flex items-center justify-center h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <Menu as="div" className="ml-3 relative">
              <Menu.Button className="flex text-sm rounded-full">
                <img
                  className="h-8 w-8 rounded-full"
                  src={userAvatarUrl}
                  alt="User avatar"
                />
              </Menu.Button>
              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 bg-white shadow-lg">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/profile"
                      className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                    >
                      Profile
                    </Link>
                  )}
                </Menu.Item>
                {/* Other menu items */}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                    >
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          </div>
        </header>
      );
    }
    ```

### 13.8. Component Library and Best Practices

- **Component Reusability:**
  - Create reusable components like `Button`, `Input`, `Modal`, `Card` for consistency.
- **State Management:**
  - Use **Context API** or **Recoil** for global state.
- **Code Organization:**
  - Organize components by feature or common components in a `common` directory.
- **Naming Conventions:**
  - Use clear and consistent naming for components and files.

### 13.9. Testing the Layout

- **Responsiveness Testing:**
  - Test the layout on various screen sizes and devices.
- **Cross-Browser Compatibility:**
  - Ensure the application works correctly on major browsers (Chrome, Firefox, Safari, Edge).
- **Accessibility Testing:**
  - Use tools like **axe-core** to check for accessibility issues.

---

This detailed point provides specific instructions on how to design and implement the application's layout, including the sidebar, links, icons, color scheme, and Tailwind CSS theme. It includes code snippets and configuration examples to assist in development, making it suitable for use with AI coding assistants.

