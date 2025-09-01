# Admin API Testing Guide

This comprehensive guide provides step-by-step instructions for testing all admin API routes in the blockchain voting application. The admin API includes three main endpoints for election management, candidate verification, and voter whitelisting.

## Prerequisites

Before testing the admin API routes, ensure the following environment variables are properly configured:

- `ADMIN_WALLET_ADDRESS`: The wallet address that has admin privileges
- `THIRDWEB_SECRET_KEY`: Your Thirdweb secret key for API authentication
- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`: Your Thirdweb client ID
- `NEXT_PUBLIC_CHAIN_ID`: Set to `84532` for Base Sepolia network

## Testing Tools

You can use any of the following tools to test the API endpoints:

### 1. Postman
- Download and install Postman
- Create a new collection for admin API tests
- Set base URL to your application URL (e.g., `http://localhost:3000`)

### 2. cURL Commands
- Use command line interface
- Examples provided below for each endpoint

### 3. Browser Developer Tools
- Open browser developer tools (F12)
- Use the Network tab to monitor requests
- Use Console to make fetch requests

## API Endpoint Testing

### 1. Create Election API (`/api/admin/create-election`)

#### Valid Request Example

**Postman Setup:**
- Method: `POST`
- URL: `http://localhost:3000/api/admin/create-election`
- Headers: `Content-Type: application/json`

**Request Body:**
```json
{
  "title": "Student Union Elections Fall 2024",
  "description": "Annual student union elections for leadership positions",
  "startTime": 1704067200,
  "endTime": 1704153600,
  "positions": [
    {
      "title": "President",
      "requirements": "Must be a final year student with GPA >= 3.5"
    },
    {
      "title": "Vice President Academic",
      "requirements": "Must be in 3rd or 4th year with academic standing"
    },
    {
      "title": "General Secretary",
      "requirements": "Must have leadership experience"
    }
  ]
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/admin/create-election \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Student Union Elections Fall 2024",
    "description": "Annual student union elections for leadership positions",
    "startTime": 1704067200,
    "endTime": 1704153600,
    "positions": [
      {
        "title": "President",
        "requirements": "Must be a final year student with GPA >= 3.5"
      }
    ]
  }'
```

**Expected Response (Success - 200):**
```json
{
  "result": {
    "transactionHash": "0x...",
    "blockNumber": 12345,
    "gasUsed": "150000"
  }
}
```

#### Authentication Testing

**Test Missing Admin Wallet:**
1. Temporarily remove or comment out `ADMIN_WALLET_ADDRESS` from your `.env` file
2. Restart your application
3. Send the same request
4. **Expected Response (401):**
```json
{
  "error": "Unauthorized"
}
```

#### Contract Address Validation Testing

**Test Invalid Network:**
1. Change `NEXT_PUBLIC_CHAIN_ID` to an unsupported network (e.g., `1` for Ethereum mainnet)
2. Restart your application
3. Send the create election request
4. **Expected Response (400):**
```json
{
  "error": "Contract not deployed for current network"
}
```

#### Input Validation Testing

**Test Invalid Data:**
```json
{
  "title": "",
  "description": "Test",
  "startTime": -1,
  "endTime": 1704153600,
  "positions": []
}
```

**Expected Response (400):**
```json
{
  "error": "Validation error message"
}
```

### 2. Verify Candidate API (`/api/admin/verify-candidate`)

#### Valid Request Example

**Request Body:**
```json
{
  "contract": "0xAEa1F2693C0cB46AA0675b8c63cA8DD0AA4006f0",
  "electionId": 1,
  "candidateId": 1
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/admin/verify-candidate \
  -H "Content-Type: application/json" \
  -d '{
    "contract": "0xAEa1F2693C0cB46AA0675b8c63cA8DD0AA4006f0",
    "electionId": 1,
    "candidateId": 1
  }'
```

**Expected Response (Success - 200):**
```json
{
  "result": {
    "transactionHash": "0x...",
    "blockNumber": 12346,
    "gasUsed": "75000"
  }
}
```

#### Input Validation Testing

**Test Invalid Contract Address:**
```json
{
  "contract": "invalid-address",
  "electionId": 1,
  "candidateId": 1
}
```

**Test Negative IDs:**
```json
{
  "contract": "0xAEa1F2693C0cB46AA0675b8c63cA8DD0AA4006f0",
  "electionId": -1,
  "candidateId": 0
}
```

### 3. Whitelist Voter API (`/api/admin/whitelist-voter`)

#### Valid Request Example

**Request Body:**
```json
{
  "contract": "0xAEa1F2693C0cB46AA0675b8c63cA8DD0AA4006f0",
  "electionId": 1,
  "voters": [
    "0x1234567890123456789012345678901234567890",
    "0x0987654321098765432109876543210987654321"
  ]
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/admin/whitelist-voter \
  -H "Content-Type: application/json" \
  -d '{
    "contract": "0xAEa1F2693C0cB46AA0675b8c63cA8DD0AA4006f0",
    "electionId": 1,
    "voters": [
      "0x1234567890123456789012345678901234567890"
    ]
  }'
```

**Expected Response (Success - 200):**
```json
{
  "results": [
    {
      "voter": "0x1234567890123456789012345678901234567890",
      "success": true,
      "result": {
        "transactionHash": "0x...",
        "blockNumber": 12347
      }
    }
  ]
}
```

#### Batch Processing Testing

**Test Mixed Valid/Invalid Addresses:**
```json
{
  "contract": "0xAEa1F2693C0cB46AA0675b8c63cA8DD0AA4006f0",
  "electionId": 1,
  "voters": [
    "0x1234567890123456789012345678901234567890",
    "invalid-address",
    "0x0987654321098765432109876543210987654321"
  ]
}
```

**Expected Response:**
```json
{
  "results": [
    {
      "voter": "0x1234567890123456789012345678901234567890",
      "success": true,
      "result": {...}
    },
    {
      "voter": "invalid-address",
      "success": false,
      "error": "Invalid voter address format"
    },
    {
      "voter": "0x0987654321098765432109876543210987654321",
      "success": true,
      "result": {...}
    }
  ]
}
```

## Response Format Validation

### Success Responses
All successful API calls should return:
- Status Code: `200`
- Content-Type: `application/json`
- Response body with `result` or `results` field

### Error Responses
Error responses should include:
- Appropriate HTTP status codes (400, 401, 500)
- Content-Type: `application/json`
- Response body with `error` field containing descriptive message

## Thirdweb Service Integration Testing

### 1. Verify Environment Variables
Check that Thirdweb credentials are properly loaded:

```bash
# Test endpoint to verify environment
curl -X POST http://localhost:3000/api/admin/create-election \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test","startTime":1704067200,"endTime":1704153600,"positions":[{"title":"Test","requirements":""}]}'
```

### 2. Monitor Network Requests
- Open browser developer tools
- Navigate to Network tab
- Make API requests and observe:
  - Request headers include proper authentication
  - Thirdweb API calls are made to `https://api.thirdweb.com`
  - Response times and status codes

### 3. Validate Contract Interactions
Ensure the API correctly:
- Reads contract address from `deployed-addresses.json`
- Uses correct chain ID (84532 for Base Sepolia)
- Formats function signatures properly for Thirdweb

## Troubleshooting Common Issues

### Authentication Failures

**Symptom:** 401 Unauthorized responses
**Solutions:**
1. Verify `ADMIN_WALLET_ADDRESS` is set in environment variables
2. Restart the application after environment changes
3. Check that the wallet address format is valid (0x followed by 40 hex characters)

**Debug Steps:**
```bash
# Check environment variable
echo $ADMIN_WALLET_ADDRESS

# Verify in application
curl -X POST http://localhost:3000/api/admin/verify-candidate \
  -H "Content-Type: application/json" \
  -d '{"contract":"0x123","electionId":1,"candidateId":1}'
```

### Contract Address Mismatches

**Symptom:** "Contract not deployed for current network" errors
**Solutions:**
1. Verify `NEXT_PUBLIC_CHAIN_ID=84532` for Base Sepolia
2. Check `lib/contracts/deployed-addresses.json` contains correct address
3. Ensure the contract address is not the zero address

**Debug Steps:**
```bash
# Check deployed addresses file
cat lib/contracts/deployed-addresses.json

# Verify chain ID
echo $NEXT_PUBLIC_CHAIN_ID
```

### Network Connectivity Problems

**Symptom:** Timeout errors or connection failures
**Solutions:**
1. Check internet connectivity
2. Verify Thirdweb API status
3. Ensure firewall allows outbound HTTPS connections
4. Test with different network/VPN

**Debug Steps:**
```bash
# Test Thirdweb API connectivity
curl -I https://api.thirdweb.com/v1/health

# Check DNS resolution
nslookup api.thirdweb.com
```

### Thirdweb API Errors

**Symptom:** Errors from Thirdweb service calls
**Solutions:**
1. Verify `THIRDWEB_SECRET_KEY` is valid and not expired
2. Check API rate limits
3. Ensure wallet has sufficient gas funds
4. Validate function signatures match contract ABI

**Debug Steps:**
```bash
# Test Thirdweb authentication
curl -X GET https://api.thirdweb.com/v1/wallets \
  -H "x-secret-key: YOUR_SECRET_KEY"
```

### Input Validation Errors

**Symptom:** 400 Bad Request with validation messages
**Solutions:**
1. Check all required fields are present
2. Verify data types match schema requirements
3. Ensure addresses are valid Ethereum addresses
4. Confirm timestamps are positive integers

### Gas and Transaction Errors

**Symptom:** Transaction failures or gas estimation errors
**Solutions:**
1. Ensure admin wallet has sufficient Base Sepolia ETH
2. Check network congestion and gas prices
3. Verify contract functions exist and are callable
4. Test with smaller batch sizes for voter whitelisting

## Testing Checklist

### Pre-Testing Setup
- [ ] Environment variables configured
- [ ] Application running locally
- [ ] Testing tool (Postman/curl) ready
- [ ] Contract deployed on Base Sepolia
- [ ] Admin wallet funded with test ETH

### Create Election API
- [ ] Valid election creation succeeds
- [ ] Authentication validation works
- [ ] Contract address validation works
- [ ] Input validation catches errors
- [ ] Response format is correct

### Verify Candidate API
- [ ] Valid candidate verification succeeds
- [ ] Authentication required
- [ ] Input validation works
- [ ] Error handling for invalid IDs

### Whitelist Voter API
- [ ] Single voter whitelisting works
- [ ] Batch voter processing works
- [ ] Mixed valid/invalid addresses handled
- [ ] Authentication required
- [ ] Proper error reporting

### Integration Testing
- [ ] Thirdweb service calls succeed
- [ ] Contract interactions work
- [ ] Network requests properly authenticated
- [ ] Error messages are descriptive

### Performance Testing
- [ ] API response times acceptable
- [ ] Batch operations handle reasonable sizes
- [ ] No memory leaks during testing
- [ ] Concurrent requests handled properly

## Automated Testing Script

Create a test script to automate API testing:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"
CONTRACT_ADDRESS="0xAEa1F2693C0cB46AA0675b8c63cA8DD0AA4006f0"

echo "Testing Admin API Endpoints..."

# Test create election
echo "1. Testing create election..."
curl -s -X POST $BASE_URL/api/admin/create-election \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Election","description":"Test","startTime":1704067200,"endTime":1704153600,"positions":[{"title":"President","requirements":"Test"}]}' \
  | jq .

# Test verify candidate
echo "2. Testing verify candidate..."
curl -s -X POST $BASE_URL/api/admin/verify-candidate \
  -H "Content-Type: application/json" \
  -d "{\"contract\":\"$CONTRACT_ADDRESS\",\"electionId\":1,\"candidateId\":1}" \
  | jq .

# Test whitelist voter
echo "3. Testing whitelist voter..."
curl -s -X POST $BASE_URL/api/admin/whitelist-voter \
  -H "Content-Type: application/json" \
  -d "{\"contract\":\"$CONTRACT_ADDRESS\",\"electionId\":1,\"voters\":[\"0x1234567890123456789012345678901234567890\"]}" \
  | jq .

echo "API testing complete!"
```

This comprehensive testing guide ensures all admin API routes are properly validated and functional before deployment.