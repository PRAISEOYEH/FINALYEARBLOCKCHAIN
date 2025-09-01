# Admin Configuration Guide

This guide provides comprehensive instructions for configuring the admin environment for the University Blockchain Voting System. Follow these steps to ensure proper admin functionality and blockchain integration.

## Overview

The admin system requires proper configuration of wallet addresses, API keys, and network settings to interact with the deployed smart contract on Base Sepolia network. The contract is deployed at `0xAEa1F2693C0cB46AA0675b8c63cA8DD0AA4006f0` and requires admin wallet authentication for administrative operations.

## Prerequisites

- Access to the private key used for contract deployment
- Base Sepolia ETH for transaction fees
- Valid Thirdweb API credentials
- Admin access to the application environment

## Step 1: Environment Variable Configuration

### 1.1 Copy Environment Template

First, copy the `.env.example` file to create your environment configuration:

```bash
cp .env.example .env
```

### 1.2 Configure Admin Wallet Address

Set the `ADMIN_WALLET_ADDRESS` to the public address corresponding to the private key used for deployment:

```env
ADMIN_WALLET_ADDRESS=0x[YOUR_ADMIN_PUBLIC_ADDRESS]
```

**Important Notes:**
- This must be the public address that corresponds to the private key in `PRIVATE_KEY`
- This address deployed the contract at `0xAEa1F2693C0cB46AA0675b8c63cA8DD0AA4006f0`
- The address format must be a valid Ethereum address (42 characters starting with 0x)

### 1.3 Verify Thirdweb Configuration

Ensure the following Thirdweb credentials are properly set:

```env
THIRDWEB_SECRET_KEY=etehoyl0-JTWL9jL0JvuAKmaRVpNl_vrrpCcI_KGkaYGqc-WHR2Z0l6QHI1hMQkPHBrqbdVuy1aUyZKnDJNWog
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=b13dc683240531e10d6e60805f4c7adb
```

**Validation Steps:**
- Verify the secret key is valid and has not expired
- Confirm the client ID matches your Thirdweb project
- Test API connectivity using these credentials

### 1.4 Network Configuration

Ensure the network settings are configured for Base Sepolia:

```env
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
```

### 1.5 Contract Configuration

Set the contract address (optional, as it's read from deployed-addresses.json):

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xAEa1F2693C0cB46AA0675b8c63cA8DD0AA4006f0
```

## Step 2: Validate Deployed Contract Address

### 2.1 Check Deployed Addresses File

Verify that `lib/contracts/deployed-addresses.json` contains the correct contract address:

```json
{
  "baseSepolia": {
    "UniversityVoting": "0xAEa1F2693C0cB46AA0675b8c63cA8DD0AA4006f0",
    "deployedAt": "2025-08-29T15:37:07.837Z"
  }
}
```

### 2.2 Contract Address Validation

- Confirm the address matches the expected deployment: `0xAEa1F2693C0cB46AA0675b8c63cA8DD0AA4006f0`
- Verify the deployment timestamp is correct
- Ensure the network key is `baseSepolia`

## Step 3: Wallet Funding Validation

### 3.1 Check Base Sepolia ETH Balance

Verify your admin wallet has sufficient ETH for transaction fees:

1. Visit [Base Sepolia Explorer](https://sepolia.basescan.org/)
2. Search for your admin wallet address
3. Confirm ETH balance > 0.01 ETH (recommended minimum)

### 3.2 Get Test ETH (if needed)

If your wallet needs funding:

1. Visit [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. Enter your admin wallet address
3. Request test ETH
4. Wait for confirmation (usually 1-2 minutes)

## Step 4: Environment Variable Loading Verification

### 4.1 Application Startup Check

Start your application and verify environment variables are loaded:

```bash
npm run dev
```

### 4.2 Console Verification

Check the browser console or server logs for any environment variable errors:

- No "missing environment variable" errors
- Thirdweb service initializes successfully
- Contract address is properly loaded

### 4.3 API Endpoint Test

Test that admin environment variables are accessible:

```bash
curl -X POST http://localhost:3000/api/admin/test-config \
  -H "Content-Type: application/json"
```

Expected response should include confirmation of loaded variables.

## Step 5: Admin Authentication Configuration

### 5.1 University Configuration

Verify university settings in your environment:

```env
UNIVERSITY_NAME="Tech University"
```

### 5.2 Admin Credentials

The system uses these default admin credentials:
- Email: `admin@techuni.edu`
- Password: `admin2024!`
- Access Code: `ADM-7892-XYZ`

## Troubleshooting

### Common Configuration Issues

#### 1. Mismatched Wallet Addresses

**Problem:** Admin operations fail with "unauthorized" errors

**Solution:**
- Verify `ADMIN_WALLET_ADDRESS` matches the public address of `PRIVATE_KEY`
- Use a wallet tool to derive the public address from your private key
- Ensure no extra spaces or characters in the address

#### 2. Insufficient Gas Funds

**Problem:** Transactions fail with "insufficient funds" errors

**Solution:**
- Check wallet balance on Base Sepolia Explorer
- Request test ETH from Base Sepolia faucet
- Ensure minimum 0.01 ETH balance for admin operations

#### 3. Environment Variable Loading Problems

**Problem:** Variables not accessible in application

**Solution:**
- Restart the development server after .env changes
- Verify .env file is in the project root directory
- Check for syntax errors in .env file (no spaces around =)
- Ensure sensitive variables don't have quotes unless needed

#### 4. Thirdweb API Errors

**Problem:** API calls to Thirdweb fail

**Solution:**
- Verify `THIRDWEB_SECRET_KEY` is valid and not expired
- Check `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` matches your project
- Test API connectivity with a simple request
- Ensure your Thirdweb account has sufficient credits

#### 5. Contract Address Mismatch

**Problem:** Contract interactions fail

**Solution:**
- Verify contract address in `deployed-addresses.json`
- Confirm the contract exists on Base Sepolia
- Check that the contract was deployed by your admin wallet
- Ensure network configuration matches (chainId: 84532)

#### 6. Network Configuration Issues

**Problem:** Wrong network or RPC errors

**Solution:**
- Confirm `NEXT_PUBLIC_CHAIN_ID=84532` for Base Sepolia
- Verify `NEXT_PUBLIC_RPC_URL=https://sepolia.base.org`
- Test RPC connectivity manually
- Check for network outages or rate limiting

## Validation Checklist

Before proceeding with admin operations, ensure:

- [ ] `ADMIN_WALLET_ADDRESS` is set to the correct public address
- [ ] Admin wallet has sufficient Base Sepolia ETH (>0.01 ETH)
- [ ] `THIRDWEB_SECRET_KEY` and `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` are valid
- [ ] `NEXT_PUBLIC_CHAIN_ID=84532` for Base Sepolia
- [ ] Contract address in `deployed-addresses.json` is correct
- [ ] Environment variables load without errors
- [ ] Application starts successfully
- [ ] No console errors related to configuration

## Next Steps

Once configuration is complete:

1. Test admin login functionality
2. Validate admin dashboard access
3. Test admin API endpoints
4. Create a sample election
5. Verify all admin operations work correctly

## Security Notes

- Never commit your `.env` file to version control
- Keep your `PRIVATE_KEY` and `THIRDWEB_SECRET_KEY` secure
- Regularly rotate API keys and credentials
- Monitor wallet balance and transaction activity
- Use environment-specific configurations for different deployments

## Support

If you encounter issues not covered in this guide:

1. Check the application logs for detailed error messages
2. Verify all prerequisites are met
3. Test each configuration step individually
4. Consult the Thirdweb documentation for API-specific issues
5. Check Base Sepolia network status for blockchain-related problems