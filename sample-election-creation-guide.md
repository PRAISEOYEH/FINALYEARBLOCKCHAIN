# Sample Election Creation Guide

This guide provides step-by-step instructions for creating a test election using the university admin dashboard. Follow these steps to create a comprehensive student union election with multiple positions and proper configuration.

## Prerequisites

Before starting, ensure you have:
- Admin access to the university voting system
- Valid admin credentials (email: `admin@techuni.edu`, password: `admin2024!`)
- Admin access code: `ADM-7892-XYZ`
- Proper environment configuration with admin wallet address
- Base Sepolia testnet connection (Chain ID: 84532)

## Step 1: Admin Login

1. **Navigate to the Application**
   - Open your web browser and go to the application URL
   - You should see the main login interface

2. **Enter Admin Credentials**
   - Email: `admin@techuni.edu`
   - Password: `admin2024!`
   - Click "Login" or "Sign In"

3. **Provide Admin Access Code**
   - When prompted for the admin access code, enter: `ADM-7892-XYZ`
   - This code is required for admin-level access
   - Click "Verify" or "Continue"

4. **Verify Successful Login**
   - You should be redirected to the admin dashboard
   - Confirm you see "University Election Administration" header
   - Verify the "Create Election" button is visible in the top-right corner

## Step 2: Access Election Creation Dialog

1. **Locate Create Election Button**
   - Look for the blue "Create Election" button with a plus icon
   - It should be positioned in the top-right area of the dashboard

2. **Open Election Creation Dialog**
   - Click the "Create Election" button
   - A large modal dialog should open with the title "Create New Student Union Election"
   - The dialog should display multiple sections for election configuration

3. **Verify Dialog Components**
   - Confirm all form sections are visible:
     - Basic Information
     - Campaign Period
     - Voting Period
     - Position Selection
     - Election Rules
     - University Information alert

## Step 3: Fill Basic Election Information

1. **Election Title**
   - In the "Election Title" field, enter: `Student Union Elections Fall 2024`
   - This field is marked as required (*)

2. **Academic Year**
   - Select `2024-2025` from the Academic Year dropdown
   - This should be pre-selected as the default

3. **Semester**
   - Select `Fall` from the Semester dropdown
   - Verify the dropdown shows Fall, Spring, and Summer options

4. **Election Description**
   - In the Description textarea, enter:
     ```
     Annual student union elections for leadership positions. Students will vote for representatives across seven key positions including President, Vice Presidents, Secretary roles, Senate President, and Treasurer. This election will determine student leadership for the 2024-2025 academic year.
     ```

## Step 4: Configure Campaign Period

1. **Campaign Start Date**
   - Set Campaign Start to: `2024-10-01T08:00` (October 1, 2024, 8:00 AM)
   - Use the datetime-local input field
   - Ensure the date is in the future

2. **Campaign End Date**
   - Set Campaign End to: `2024-10-14T23:59` (October 14, 2024, 11:59 PM)
   - This provides a 2-week campaign period
   - Verify the end date is after the start date

3. **Validate Campaign Period**
   - Confirm the campaign period allows adequate time for candidate preparation
   - Ensure dates don't conflict with university holidays or exam periods

## Step 5: Configure Voting Period

1. **Voting Start Date**
   - Set Voting Start to: `2024-10-15T08:00` (October 15, 2024, 8:00 AM)
   - This should be immediately after the campaign period ends
   - Ensure there's no gap between campaign end and voting start

2. **Voting End Date**
   - Set Voting End to: `2024-10-17T18:00` (October 17, 2024, 6:00 PM)
   - This provides a 3-day voting window
   - Verify the voting period is reasonable for student participation

3. **Validate Voting Period**
   - Confirm voting dates are after campaign dates
   - Ensure voting period allows sufficient time for all students to participate

## Step 6: Select Election Positions

Select the following positions by clicking on each position card:

1. **President**
   - Click the "Student Union President" card
   - Verify it shows: Min GPA: 3.0, Year: 3-4, Salary: $15,000
   - Confirm the card highlights in blue when selected

2. **Vice President Academic**
   - Click the "Vice President Academic" card
   - Verify requirements: Min GPA: 3.2, Year: 2-4, Salary: $12,000

3. **Vice President Student Life**
   - Click the "Vice President Student Life" card
   - Verify requirements: Min GPA: 2.8, Year: 2-4, Salary: $12,000

4. **General Secretary**
   - Click the "General Secretary" card
   - Verify requirements: Min GPA: 3.2, Year: 2-4, Salary: $10,000

5. **Financial Secretary**
   - Click the "Financial Secretary" card
   - Verify requirements: Min GPA: 3.4, Year: 2-4, Salary: $11,000

6. **Senate President**
   - Click the "Senate President" card
   - Verify requirements: Min GPA: 3.5, Year: 3-4, Salary: $14,000

7. **Treasurer**
   - Click the "Treasurer" card
   - Verify requirements: Min GPA: 3.6, Year: 2-4, Salary: $13,000

**Validation Steps:**
- Confirm all 7 positions are selected (cards should be highlighted in blue)
- Verify each position shows a checkmark icon when selected
- Ensure position requirements are clearly displayed

## Step 7: Configure Election Rules

1. **Max Candidates per Position**
   - Set to: `5`
   - This allows up to 5 candidates per position
   - Use the number input field

2. **Campaign Spending Limit**
   - Set to: `3000`
   - This sets a $3,000 spending limit per candidate
   - Enter the amount without currency symbols

3. **Voting Method**
   - Select: `Single Choice`
   - This allows voters to select one candidate per position
   - Verify other options (Ranked Choice, Approval Voting) are available

4. **Candidacy Deposit Settings**
   - Ensure "Require Candidacy Deposit" toggle is ON
   - Set Deposit Amount to: `100`
   - This requires a $100 refundable deposit from candidates

**Validation Steps:**
- Confirm all election rules are properly configured
- Verify the deposit toggle enables/disables the deposit amount field
- Ensure all numeric values are within reasonable ranges

## Step 8: Review University Information

1. **University Context Alert**
   - Verify the blue alert box displays university information
   - Confirm it shows: "Tech University with 25,000 eligible students across 4 faculties"
   - This provides context for the election scale

2. **Final Review**
   - Review all entered information for accuracy
   - Ensure all required fields are completed
   - Verify dates are logical and in correct sequence

## Step 9: Create the Election

1. **Submit Election**
   - Click the "🗳️ Create Student Union Election" button at the bottom
   - The button should be enabled (not grayed out) if all required fields are filled
   - Button text should change to "Creating Election..." during processing

2. **Monitor Creation Process**
   - Wait for the creation process to complete
   - This may take several seconds as it interacts with the blockchain
   - Do not close the dialog during this process

3. **Verify Success**
   - Look for a green success alert that appears after creation
   - The alert should display: "Election Created Successfully!"
   - A smart contract address should be shown (format: 0x followed by 40 characters)

## Step 10: Validation and Verification

1. **Contract Address Verification**
   - Copy the displayed contract address
   - Verify it follows the format: `0x[40 hexadecimal characters]`
   - This address represents the blockchain smart contract for your election

2. **Form Reset Confirmation**
   - After successful creation, the form should reset to default values
   - All fields should be cleared except default selections
   - Position selections should be cleared

3. **Close Dialog and Check Elections List**
   - Close the creation dialog
   - Navigate to the "Elections" tab if not already selected
   - Verify your new election appears in the elections list

4. **Election Details Verification**
   - Confirm the election card shows:
     - Title: "Student Union Elections Fall 2024"
     - Academic Year: "2024-2025"
     - Semester: "Fall Semester"
     - Status: "upcoming" (since voting hasn't started)
     - Contract address (truncated): First 10 characters + "..."
     - Positions: 7
     - Candidates: 0 (initially)

## Step 11: Blockchain Integration Validation

1. **Thirdweb Service Integration**
   - The election creation uses the Thirdweb service for blockchain interaction
   - Verify the contract address returned is valid and deployed on Base Sepolia
   - Check that the admin wallet address has sufficient Base Sepolia ETH for transactions

2. **API Route Validation**
   - The creation process calls `/api/admin/create-election`
   - This route validates admin permissions and reads the deployed contract address
   - Verify the API successfully interacts with the blockchain

3. **Environment Configuration Check**
   - Ensure `ADMIN_WALLET_ADDRESS` is properly set
   - Verify `NEXT_PUBLIC_CHAIN_ID=84532` for Base Sepolia
   - Confirm `THIRDWEB_SECRET_KEY` and `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` are configured

## Troubleshooting Common Issues

### Election Creation Fails
- **Check Admin Permissions**: Ensure you're logged in with admin credentials
- **Verify Network**: Confirm you're connected to Base Sepolia (Chain ID: 84532)
- **Check Wallet Balance**: Ensure admin wallet has sufficient ETH for gas fees
- **Validate Form Data**: Ensure all required fields are completed correctly

### Contract Address Not Displayed
- **Check API Response**: Verify the `/api/admin/create-election` route returns successfully
- **Environment Variables**: Ensure all required environment variables are set
- **Network Configuration**: Confirm the deployed contract exists on the current network

### Form Validation Errors
- **Required Fields**: Ensure title, dates, and at least one position are selected
- **Date Logic**: Verify campaign dates come before voting dates
- **Position Selection**: Confirm at least one position is selected

### Blockchain Integration Issues
- **Thirdweb Configuration**: Verify Thirdweb client ID and secret key are valid
- **Contract Deployment**: Ensure the contract is properly deployed on Base Sepolia
- **Network Connectivity**: Check internet connection and RPC endpoint availability

## Expected Results

After successfully completing this guide, you should have:

1. **Created Election**: A new election titled "Student Union Elections Fall 2024"
2. **Blockchain Contract**: A deployed smart contract on Base Sepolia network
3. **Position Configuration**: 7 positions available for candidacy
4. **Proper Timing**: Campaign period (Oct 1-14) and voting period (Oct 15-17)
5. **Election Rules**: Configured spending limits, candidate limits, and deposit requirements
6. **Admin Dashboard**: Updated elections list showing the new election

## Next Steps

After creating the election:

1. **Candidate Registration**: Students can now apply for candidacy positions
2. **Candidate Verification**: Use the admin dashboard to review and verify candidates
3. **Campaign Period**: Monitor campaign activities during the designated period
4. **Voting Management**: Oversee the voting process when the voting period begins
5. **Results Analysis**: Use the analytics tab to monitor election progress and results

This completes the sample election creation process. The election is now ready for candidate applications and will automatically transition through campaign and voting phases based on the configured dates.