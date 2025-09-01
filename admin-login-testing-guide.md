# Admin Login Testing Guide

This guide provides comprehensive step-by-step instructions for testing admin authentication and dashboard functionality in the blockchain voting application.

## Prerequisites

Before starting the admin login testing, ensure:

1. **Application is running**: The Next.js application is started with `npm run dev`
2. **Environment variables**: All required environment variables are properly configured
3. **Database/Mock data**: The application has access to the mock user database
4. **Browser**: Use a modern browser with developer tools available

## Admin Credentials

The following admin credentials are configured in the system:

- **Email**: `admin@techuni.edu`
- **Password**: `admin2024!`
- **Access Code**: `ADM-7892-XYZ`
- **Role**: Admin with full permissions

## Step-by-Step Login Testing

### 1. Navigate to Application Login Page

1. Open your web browser
2. Navigate to the application URL (typically `http://localhost:3000`)
3. Verify the login interface loads correctly
4. Confirm you see the university login form

**Expected Result**: The `UniversityLogin` component should be displayed with email and password fields.

### 2. Enter Admin Credentials

1. **Email Field**:
   - Click on the email input field
   - Enter: `admin@techuni.edu`
   - Verify the email is entered correctly

2. **Password Field**:
   - Click on the password input field
   - Enter: `admin2024!`
   - Verify the password is masked/hidden

3. **Submit Login**:
   - Click the "Login" or "Sign In" button
   - Wait for the authentication process

**Expected Result**: The system should process the login and prompt for the admin access code.

### 3. Provide Admin Access Code

1. **Access Code Prompt**:
   - After successful email/password validation, an access code prompt should appear
   - This is required specifically for admin users

2. **Enter Access Code**:
   - Enter: `ADM-7892-XYZ`
   - Ensure the code is entered exactly as shown (case-sensitive)

3. **Submit Access Code**:
   - Click the submit button for the access code
   - Wait for final authentication

**Expected Result**: The system should validate the access code and complete the admin login process.

### 4. Verify Successful Login Redirect

1. **Dashboard Redirect**:
   - After successful authentication, you should be redirected to the admin dashboard
   - The URL should change to show the dashboard route

2. **Admin Interface Loading**:
   - Verify the `AdminDashboard` component loads
   - Check that the university admin dashboard interface is displayed

**Expected Result**: The admin dashboard should load with the university administration interface.

## Role-Based Access Control Testing

### 1. Test Non-Admin User Access

1. **Logout** (if currently logged in as admin):
   - Use the logout functionality
   - Verify you're returned to the login page

2. **Attempt Login with Non-Admin Credentials**:
   - Try logging in with any non-admin email (e.g., `student@techuni.edu`)
   - Use any password

3. **Verify Access Restriction**:
   - Non-admin users should not be prompted for an access code
   - If they somehow access admin routes, they should see an access restriction message

**Expected Result**: Non-admin users should see the message "You need administrator privileges to access this dashboard."

### 2. Test Access Code Validation

1. **Login with Admin Email/Password**:
   - Use correct admin credentials: `admin@techuni.edu` / `admin2024!`

2. **Enter Incorrect Access Code**:
   - Try entering: `WRONG-CODE-123`
   - Submit the incorrect code

3. **Verify Error Handling**:
   - Should display "Invalid access code" error
   - Should not grant admin access

**Expected Result**: Invalid access codes should be rejected with appropriate error messages.

## Admin Dashboard Validation

### 1. University Information Display

After successful admin login, verify the following information is displayed:

1. **University Header**:
   - University name: "Tech University"
   - Admin dashboard title: "University Election Administration"
   - Description: "Manage student union elections and candidates"

2. **University Statistics**:
   - Total student body size: 25,000 students
   - Number of faculties: 4 faculties
   - University website: https://techuniversity.edu

**Expected Result**: All university information should be accurately displayed from the mock data.

### 2. Tab Navigation Testing

Verify all admin dashboard tabs are accessible and functional:

#### Elections Tab
1. Click on the "Elections" tab
2. **If no elections exist**:
   - Should display "No Elections Created" message
   - Should show "Create First Election" button
3. **If elections exist**:
   - Should display list of elections with details
   - Each election should show status, votes, turnout rate

#### Candidates Tab
1. Click on the "Candidates" tab
2. **If no pending candidates**:
   - Should display "No Pending Candidates" message
   - Should show appropriate placeholder content
3. **If candidates exist**:
   - Should display candidate applications
   - Should show verification status badges
   - Should provide "Verify" and "Reject" buttons for pending candidates

#### Students Tab
1. Click on the "Students" tab
2. Verify student body overview displays:
   - Total students: 25,000
   - Faculty breakdown:
     - Engineering: 8,500 students
     - Business: 6,200 students
     - Arts & Sciences: 7,800 students
     - Medicine: 2,500 students
3. Check eligibility requirements are shown:
   - Voting requirements (min GPA: 2.0)
   - Candidacy requirements (min GPA: 2.5, min year: 2)

#### Analytics Tab
1. Click on the "Analytics" tab
2. **If no elections exist**:
   - Should display "No Analytics Available" message
3. **If elections exist**:
   - Should show total votes cast
   - Should display average turnout percentage
   - Should show total candidates and elections held

#### Settings Tab
1. Click on the "Settings" tab
2. Verify university settings display:
   - University information section
   - Academic calendar (Fall, Spring, Summer dates)
   - Default election rules (GPA requirements, term limits)

**Expected Result**: All tabs should be accessible and display appropriate content based on current data state.

### 3. Create Election Functionality

1. **Access Election Creation**:
   - Click the "Create Election" button
   - Verify the election creation dialog opens

2. **Form Validation**:
   - Check all required fields are marked with asterisks (*)
   - Verify form validation prevents submission with missing data

3. **Position Selection**:
   - Verify all 7 available positions are displayed:
     - Student Union President
     - Vice President Academic
     - Vice President Student Life
     - General Secretary
     - Financial Secretary
     - Senate President
     - Treasurer
   - Test position selection/deselection functionality

**Expected Result**: Election creation interface should be fully functional with proper validation.

## Troubleshooting Common Issues

### Login Failures

**Issue**: "Invalid email or password" error
- **Solution**: Verify credentials are exactly: `admin@techuni.edu` / `admin2024!`
- **Check**: Ensure no extra spaces or typos in email/password

**Issue**: Login form not responding
- **Solution**: Check browser console for JavaScript errors
- **Check**: Verify the application is running and accessible

### Access Code Issues

**Issue**: "Invalid access code" error
- **Solution**: Ensure access code is exactly: `ADM-7892-XYZ`
- **Check**: Verify case sensitivity (all uppercase letters)

**Issue**: Access code prompt not appearing
- **Solution**: Verify you're using admin email `admin@techuni.edu`
- **Check**: Non-admin users don't get access code prompts

### Role Permission Problems

**Issue**: "Access Restricted" message for admin user
- **Solution**: Check that `userRole` is set to "admin" after login
- **Check**: Verify the login process completed successfully

**Issue**: Non-admin users accessing admin functions
- **Solution**: Check role-based access control implementation
- **Check**: Verify `userRole` state management

### Dashboard Loading Errors

**Issue**: Dashboard not loading after login
- **Solution**: Check browser console for component errors
- **Check**: Verify all required props are passed to dashboard components

**Issue**: University data not displaying
- **Solution**: Check that mock university data is properly loaded
- **Check**: Verify `useUniversityVoting` hook is functioning

**Issue**: Tabs not working
- **Solution**: Check that Tabs component is properly implemented
- **Check**: Verify tab content is conditionally rendered

## Validation Checklist

Use this checklist to confirm admin functionality is working correctly:

### Authentication Validation
- [ ] Admin email/password authentication works
- [ ] Access code validation functions correctly
- [ ] Non-admin users are properly restricted
- [ ] Login redirects to admin dashboard
- [ ] Logout functionality works

### User Context Validation
- [ ] `user` object contains admin data
- [ ] `userRole` is set to "admin"
- [ ] `isAuthenticated` is true
- [ ] Admin permissions are properly set

### Dashboard Validation
- [ ] University information displays correctly
- [ ] All 5 tabs are accessible (Elections, Candidates, Students, Analytics, Settings)
- [ ] Tab content loads without errors
- [ ] Create Election button is visible and functional
- [ ] Role-based access control prevents unauthorized access

### Data Validation
- [ ] University statistics are accurate (25,000 students, 4 faculties)
- [ ] Faculty information is complete
- [ ] Position data shows all 7 available positions
- [ ] Election rules and requirements are displayed

### Error Handling Validation
- [ ] Invalid credentials show appropriate errors
- [ ] Wrong access codes are rejected
- [ ] Network errors are handled gracefully
- [ ] Loading states are displayed during authentication

## Browser Developer Tools Testing

### Console Verification
1. Open browser developer tools (F12)
2. Check the Console tab for:
   - No JavaScript errors during login
   - Successful authentication logs
   - Proper state updates

### Network Tab Verification
1. Monitor the Network tab during login
2. Verify:
   - Authentication requests complete successfully
   - No failed API calls
   - Proper response codes (200, etc.)

### Application State Verification
1. Use React Developer Tools (if available)
2. Check:
   - `UniversityVotingContext` state
   - User authentication state
   - Component prop passing

## Security Testing

### Access Control Testing
1. **Direct URL Access**:
   - Try accessing admin routes without authentication
   - Verify proper redirects to login

2. **Session Management**:
   - Test logout functionality
   - Verify session cleanup

3. **Role Escalation**:
   - Attempt to access admin functions with non-admin accounts
   - Verify proper permission checks

## Performance Testing

### Load Time Testing
1. Measure dashboard load time after login
2. Check for:
   - Fast component rendering
   - Efficient data loading
   - Smooth tab transitions

### Responsiveness Testing
1. Test admin dashboard on different screen sizes
2. Verify:
   - Mobile responsiveness
   - Tablet compatibility
   - Desktop optimization

## Final Validation Steps

After completing all tests, perform these final validation steps:

1. **Complete Login Flow**:
   - Perform full login process from start to finish
   - Verify all steps work without issues

2. **Dashboard Functionality**:
   - Navigate through all tabs
   - Test all interactive elements
   - Verify data accuracy

3. **Error Recovery**:
   - Test error scenarios and recovery
   - Verify graceful error handling

4. **Logout and Re-login**:
   - Test logout functionality
   - Verify successful re-login

**Success Criteria**: All validation steps should pass without errors, and the admin should have full access to all dashboard functionality with proper role-based restrictions in place.