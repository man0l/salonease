# Product Requirements Document (PRD)

## Product Name: SalonEase MVP (Salon Management Web App)

Version: 1.0

Date: 14 October 2024
1. Introduction
SalonEase MVP empowers salon owners to manage bookings and customer data independently while significantly reducing software costs. The MVP will focus on delivering instant value by integrating appointment booking via a Manychat-powered chatbot. It reduces the reliance on costly third-party software solutions and ensures that salon owners own their data without interference from software providers. The platform aims to simplify salon operations by providing an intuitive, easy-to-use interface that allows salon owners to manage their schedules, clients, and staff effortlessly. The focus is on empowering salons with digital tools while keeping costs manageable.

2. Objectives
Primary Objective:

Provide a simple, effective booking management tool through Manychat integration that minimizes software costs and returns data ownership to salon owners.

Secondary Objectives:

Simplify salon operations without overwhelming users with features.
Eliminate per-customer or excessive subscription fees for booking.
Reduce the burden of software complexity by providing only essential features for salon operations.
Empower salon owners with the ability to directly communicate with clients and manage customer relationships effectively.
Provide a scalable solution that can grow with the needs of the salon.
3. Scope
In Scope

Salon owner registration and billing functionality, including subscription management and per-reservation charges.
Booking management via Manychat chatbot.
Multi-salon management capabilities for salon owners who own more than one salon.
Client data ownership and management.
Basic staff availability management across multiple salons.
Online booking for clients via chatbot.
Integration with payment gateway for optional payment collection.
Employee access management, including invitation by email and role-based access control.
Email/SMS notifications for appointment confirmations and reminders.
Calendar view of bookings for salon owners and staff.
Basic reporting and data export functionality to support marketing and business analysis.
Out of Scope

Advanced inventory management.
Complex staff performance tracking.
Comprehensive analytics and reporting.
Integration with third-party CRM or accounting systems.
Mobile application development.
4. Features
4.1. Appointment Booking via Manychat
Integration with Manychat to allow clients to book appointments via chatbot on platforms like Facebook Messenger.
Easy configuration of available services, pricing, and appointment slots.
Automated replies to confirm bookings, reschedule, or cancel based on availability.
Customizable chatbot responses to align with salon branding.
Ability to handle multiple appointment requests simultaneously, ensuring efficiency and reducing booking conflicts.
4.2. Client Management
Basic client profiles with contact information and appointment history.
Data stored securely and accessible only by the salon owner.
Option to export client data in CSV format for marketing or analysis purposes.
Ability to add notes to client profiles, such as preferences or special requirements, to personalize the customer experience.
Tools to identify loyal clients and track client retention.
4.3. Staff Availability Management
Simple interface to manage staff availability and time slots across multiple salons.
Ability for staff to specify working hours and request time off for the specific salon they work at.
Visual calendar view for salon owners to see staff schedules at a glance, with the ability to filter by salon.
Notifications to staff for changes in their schedules, ensuring everyone is informed of updates in real time.
4.4. Service Management
Manage a list of services offered, including pricing and duration.
Option to create promotional offers for certain services.
Ability to categorize services by type (e.g., hair, nails, spa) to make booking easier for clients.
Flexibility to adjust service offerings based on demand and availability.
4.5. Payment Collection (Optional)
Integration with a payment gateway to collect deposits or full payments during booking.
Payments linked directly to salon owner's account.
Ability to offer discounts or promotional pricing during the payment process.
Secure payment processing to protect client financial information.
4.6. Notifications and Reminders
Automated email/SMS notifications to confirm bookings, send reminders, or update clients about cancellations.
Notifications to salon staff about new bookings and schedule changes.
Customizable reminder intervals (e.g., 24 hours or 1 hour before appointment) to reduce no-shows.
Follow-up messages to clients after their appointments, encouraging feedback or promoting future bookings.
4.7. Data Ownership and Control
All client data is owned by the salon owner and accessible without restrictions.
No third-party software has access to client data beyond what is necessary for core functions.
Ability for salon owners to export all their data at any time for backup or migration purposes.
Data privacy settings to ensure compliance with local regulations.
4.8. Salon Owner Registration and Billing
Salon owner registration process with account creation.
Subscription management system charging salon owners a base fee of 50 BGN per month plus an additional 1 BGN per reservation.
Secure billing system integrated with payment gateway (e.g., Stripe) for subscription and per-reservation charges.
Billing dashboard where salon owners can view their billing history, upcoming charges, and manage their subscription.
Automated invoicing and receipts for transactions.
4.9. Multi-Salon Management
Ability for salon owners to manage multiple salons under a single account.
Option to add, edit, or remove salons from their account.
Separate staff management and scheduling for each salon.
Ability to switch between salons to administer specific salon operations.
Consolidated view of bookings and client data across all salons, with filtering options.
4.10. Employee Access and Invitations
Simple employee registration via email invitation.
Role-based access control, ensuring employees have access only to the salon(s) they work in.
Employees can log in to view their schedule, manage their availability, and see upcoming appointments.
Salon owners can assign staff to specific salons and manage their permissions.
Option for employees to update their profile and contact information.
4.11. Calendar View of Bookings
Interactive calendar interface for salon owners and staff to view bookings.
Ability to filter calendar by salon, staff member, or service.
Drag-and-drop functionality to reschedule appointments.
Real-time updates to the calendar to reflect new bookings or changes.
Synchronization with external calendar services (e.g., Google Calendar) for staff who wish to integrate their schedules.
5. User Stories
5.1. Salon Owner/Admin
As a salon owner, I want to register for the service and set up billing so that I can start using the application.
As a salon owner, I want to manage multiple salons under one account so that I can oversee all my businesses efficiently.
As a salon owner, I want to invite my employees via email to join the system so that they can access their schedules and manage appointments.
As a salon owner, I want to assign employees to specific salons so that they have access only to relevant information.
As a salon owner, I want to see all bookings in a calendar view so that I can easily manage appointments.
As a salon owner, I want to set up my services so that clients can see what is available.
As a salon owner, I want to set up pricing for each service so that clients are aware of costs.
As a salon owner, I want clients to be able to book appointments through Manychat on various platforms.
As a salon owner, I want to own my client data without any interference from third-party software providers.
As a salon owner, I want to receive notifications when a new booking is made so that I stay informed.
As a salon owner, I want to add notes to client profiles so that I can personalize the customer experience.
As a salon owner, I want to offer promotions on certain services to attract more clients.
As a salon owner, I want to be able to export client data for use in marketing campaigns or analysis.
5.2. Employee
As an employee, I want to receive an email invitation to join the system so that I can access my work schedule.
As an employee, I want to log in and see my upcoming appointments for the salon I work in.
As an employee, I want to manage my availability and request time off through the system.
As an employee, I want to receive notifications about new bookings or schedule changes affecting me.
As an employee, I want to access client notes relevant to my appointments to provide better service.
5.3. Client
As a client, I want to initiate the booking process via a chatbot so that I can schedule an appointment easily.
As a client, I want to choose a service from a list provided by the chatbot so that I know what is available.
As a client, I want to select an available time slot that works for me so that I can book my appointment conveniently.
As a client, I want to receive a confirmation message once my appointment is booked so that I am assured of the booking.
As a client, I want to receive reminders for my upcoming appointments to avoid missing them.
As a client, I want to be able to cancel or reschedule my appointment through the chatbot if necessary.
As a client, I want to receive follow-up messages after my appointment to provide feedback or book future services.
6. Technical Requirements
6.1. Platform
Web-based application accessible via modern browsers (Chrome, Firefox, Safari, Edge).
Integration with Manychat for chatbot-driven booking.
Responsive design to ensure usability on both desktop and mobile devices.
6.2. Technology Stack
Frontend: HTML5, CSS3, JavaScript (React.js).
Backend: Node.js with Express.js.
Database: PostgreSQL or MySQL for scalable multi-tenancy support.
Hosting: Cloud-based solution (AWS or DigitalOcean).
APIs: RESTful API for chatbot integration and future scalability.
6.4. Security
SSL encryption for all data transmission.
Passwords stored using bcrypt hashing.
Role-based access control for salon owners and staff.
Compliance with data protection regulations (GDPR).
Regular security audits to identify and resolve vulnerabilities.
PCI DSS compliance for payment processing.
6.5. Performance
Lightweight application with fast load times.
Optimized to handle booking requests via Manychat without delays.
Performance monitoring to ensure the system remains responsive during peak usage times.
Scalable infrastructure to handle increasing numbers of salons and users.
6.6. Backup and Recovery
Daily automated backups of client and booking data.
Option for manual backups to ensure data safety.
Recovery procedures in place to restore data in case of system failure.

# Directory Structure

salonease-mvp/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   ├── passport.js
│   │   │   └── constants.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── bookingController.js
│   │   │   ├── clientController.js
│   │   │   ├── salonController.js
│   │   │   ├── staffController.js
│   │   │   ├── serviceController.js
│   │   │   ├── billingController.js
│   │   │   └── notificationController.js
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorHandler.js
│   │   │   └── roleMiddleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Salon.js
│   │   │   ├── Staff.js
│   │   │   ├── Client.js
│   │   │   ├── Service.js
│   │   │   ├── Booking.js
│   │   │   ├── Invoice.js
│   │   │   └── Notification.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   ├── clientRoutes.js
│   │   │   ├── salonRoutes.js
│   │   │   ├── staffRoutes.js
│   │   │   ├── serviceRoutes.js
│   │   │   ├── billingRoutes.js
│   │   │   └── notificationRoutes.js
│   │   ├── utils/
│   │   │   ├── validators/
│   │   │   │   ├── authValidator.js
│   │   │   │   ├── bookingValidator.js
│   │   │   │   └── clientValidator.js
│   │   │   └── helpers/
│   │   │       ├── emailHelper.js
│   │   │       └── notificationHelper.js
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── routes/
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── icons/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.js
│   │   │   │   ├── Register.js
│   │   │   │   └── ResetPassword.js
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.js
│   │   │   │   └── SalonSelector.js
│   │   │   ├── Bookings/
│   │   │   │   ├── BookingList.js
│   │   │   │   └── BookingDetails.js
│   │   │   ├── Calendar/
│   │   │   │   └── CalendarView.js
│   │   │   ├── Clients/
│   │   │   │   ├── ClientList.js
│   │   │   │   └── ClientDetails.js
│   │   │   ├── Staff/
│   │   │   │   ├── StaffList.js
│   │   │   │   └── StaffDetails.js
│   │   │   ├── Services/
│   │   │   │   ├── ServiceList.js
│   │   │   │   └── ServiceDetails.js
│   │   │   ├── Billing/
│   │   │   │   ├── BillingDashboard.js
│   │   │   │   └── InvoiceList.js
│   │   │   ├── Notifications/
│   │   │   │   └── NotificationSettings.js
│   │   │   ├── Settings/
│   │   │   │   ├── ProfileSettings.js
│   │   │   │   └── SalonSettings.js
│   │   │   └── common/
│   │   │       ├── Header.js
│   │   │       ├── Footer.js
│   │   │       ├── Sidebar.js
│   │   │       └── Navbar.js
│   │   ├── contexts/
│   │   │   ├── AuthContext.js
│   │   │   ├── SalonContext.js
│   │   │   └── BookingContext.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useSalon.js
│   │   │   └── useBooking.js
│   │   ├── styles/
│   │   │   └── tailwind.css
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── validation.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── routes/
│   │       ├── PrivateRoute.js
│   │       └── PublicRoute.js
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── .gitignore
├── database/
│   ├── migrations/
│   │   ├── 001_create_users_table.js
│   │   ├── 002_create_salons_table.js
│   │   ├── 003_create_staff_table.js
│   │   ├── 004_create_clients_table.js
│   │   ├── 005_create_services_table.js
│   │   ├── 006_create_bookings_table.js
│   │   └── 007_create_invoices_table.js
│   └── seeders/
│       └── initial_data.js
├── scripts/
│   ├── start.sh
│   ├── build.sh
│   └── test.sh
├── README.md
├── package.json
└── .gitignore

## Explanation of the Directory Structure
Root Directory (salonease-mvp/)
README.md: Documentation about the project, including setup instructions and usage guidelines.
package.json: Defines project-level scripts and dependencies, if any.
.gitignore: Specifies intentionally untracked files to ignore in Git.
Backend (backend/)
src/: Contains all the source code for the backend application.
config/:
db.js: Database configuration and connection setup.
passport.js: Configuration for authentication strategies (e.g., JWT).
constants.js: Application-wide constants.
controllers/: Functions that handle incoming requests and interact with models.
authController.js: Handles user authentication.
bookingController.js: Manages booking operations.
clientController.js: Manages client-related operations.
salonController.js: Handles salon creation and management.
staffController.js: Manages staff operations.
serviceController.js: Handles service offerings.
billingController.js: Manages billing and subscription.
notificationController.js: Manages notifications and reminders.
middlewares/: Custom middleware functions.
authMiddleware.js: Checks if a user is authenticated.
errorHandler.js: Global error handling middleware.
roleMiddleware.js: Manages role-based access control.
models/: Database schema definitions using an ORM like Sequelize.
User.js, Salon.js, etc.: Define the structure and relationships of data models.
routes/: API endpoints grouped by feature.
authRoutes.js, bookingRoutes.js, etc.: Define the routes and associate them with controller functions.
utils/:
validators/: Request validation functions.
authValidator.js, bookingValidator.js, etc.
helpers/: Utility functions.
emailHelper.js: Functions to send emails.
notificationHelper.js: Functions to handle notifications.
app.js: Initializes the Express app with middleware and routes.
server.js: Starts the server and listens on a specified port.
tests/: Contains backend tests.
controllers/, models/, routes/: Organized similar to src/ for consistency.
package.json: Lists backend dependencies and scripts.
.env.example: Template for environment variables.
.gitignore: Backend-specific files to ignore in Git.
Frontend (frontend/)
public/: Contains static files.
index.html: The main HTML file.
favicon.ico, manifest.json: Web app manifest and icons.
src/: Contains all the source code for the frontend application.
assets/: Images and icons used in the app.
components/: React components organized by feature.
Auth/: Login, registration, and password reset components.
Dashboard/: Main dashboard and salon selector.
Bookings/: Components for managing bookings.
Calendar/: Calendar view components.
Clients/: Components for client management.
Staff/: Components for staff management.
Services/: Components for service offerings.
Billing/: Components related to billing dashboard and invoices.
Notifications/: Components for notification settings.
Settings/: Profile and salon settings components.
common/: Shared components like header, footer, sidebar, and navbar.
contexts/: Context API for state management.
AuthContext.js, SalonContext.js, etc.
hooks/: Custom React hooks.
useAuth.js, useSalon.js, useBooking.js.
styles/: Styling files.
tailwind.css: Tailwind CSS customizations.
utils/: Utility functions.
api.js: Axios instance or API helper functions.
validation.js: Client-side validation functions.
App.js: Main application component.
index.js: Entry point rendering the App component.
routes/: Route components or utilities.
PrivateRoute.js: Higher-order component for protected routes.
PublicRoute.js: Component for public routes.
package.json: Lists frontend dependencies and scripts.
tailwind.config.js: Tailwind CSS configuration.
postcss.config.js: PostCSS configuration for processing CSS.
.env.example: Template for environment variables.
.gitignore: Frontend-specific files to ignore in Git.
Database (database/)
migrations/: Database migration files to set up and update schema.
001_create_users_table.js, etc.: Define schema changes.
seeders/: Scripts to seed the database with initial data.
initial_data.js: Inserts default data into the database.
Scripts (scripts/)
start.sh: Shell script to start the application.
build.sh: Script to build the application for production.
test.sh: Script to run tests.

Additional Notes
Multi-Tenancy Support: The directory structure supports multi-tenancy by organizing code to handle multiple salons under a single owner, with proper role-based access control.

Role-Based Access Control: The middlewares/roleMiddleware.js in the backend and context-based authorization in the frontend ensure employees only access data relevant to their assigned salon.

React Libraries Included:

Form Handling: Using React Hook Form for efficient form management.
UI Styling: Tailwind CSS is configured for rapid UI development.
State Management: Context API is used for state management, possibly supplemented by Recoil or Redux if needed.
Routing: React Router is set up for client-side routing.
Notifications: React Toastify for in-app notifications.
HTTP Requests: Axios for API calls, possibly wrapped in custom hooks.
Calendar and Scheduling: react-big-calendar or FullCalendar integrated in the Calendar/ components.
Payment Integration: React Stripe.js components used in Billing/ components.
Form Validation: Yup schema validation integrated with React Hook Form.
Authentication: JWT handling, possibly with libraries like jwt-decode.
Drag and Drop: React Beautiful DnD used for interactive features like rescheduling appointments.
Testing: Jest and React Testing Library for unit and integration tests.
Environment Variables: .env.example files are provided in both frontend and backend to specify required environment variables without exposing sensitive information.

Git Ignore Files: Separate .gitignore files in both frontend and backend to ensure that node modules, environment files, and build artifacts are not committed to the repository.

Scripts: The scripts/ directory contains shell scripts to streamline common tasks like starting the app, building for production, and running tests.

