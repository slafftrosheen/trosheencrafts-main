# SumUp Integration Setup Guide

This guide will walk you through transitioning from Stripe to SumUp for your online checkouts, ensuring all funds are routed to the same account as your physical terminal.

## Step 1: Access the SumUp Developer Dashboard
1. Go to the [SumUp Developer Portal](https://developer.sumup.com/).
2. Log in using your existing SumUp account credentials (the same ones you use for your physical terminal).

## Step 2: Create an API Key
1. In the Developer Dashboard, navigate to the **API Keys** section in the left sidebar.
2. Click **Create API Key**.
3. Name the key something recognizable (e.g., `TrosheenCrafts Production`).
4. **Important**: Copy the generated API key immediately and save it. It will look like a long alphanumeric string. You won't be able to view it again.

## Step 3: Find Your Merchant Code
1. Your Merchant Code is an 8-character string (e.g., `M1234567`).
2. You can find it in the top-right corner of your SumUp dashboard profile, or on any of your terminal receipts.

## Step 4: Configure Webhooks (Important for Order Fulfillment)
To ensure your system automatically marks orders as "Processing" when a customer successfully pays:

1. In the Developer Dashboard, navigate to the **Webhooks** section.
2. Click **Create Webhook**.
3. Set the **URL** to your production webhook endpoint: 
   `https://www.trosheen.shop/api/checkout/webhook` 
   *(or `https://trosheen.shop/api/checkout/webhook` depending on your primary domain)*
4. For the **Event Types**, select **ONLY** `checkout_status_changed`.
5. Save the webhook.

## Step 5: Update Your Server Environment
Now, you need to add these credentials to your server.

1. Open your `.env` file located at `C:\Users\Slaff\Documents\trosheencrafts-main\.env`.
2. Remove the old Stripe variables (`STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`).
3. Add the new SumUp variables:
```env
# SumUp Configuration
SUMUP_API_KEY=your_generated_api_key_here
SUMUP_MERCHANT_CODE=your_8_character_merchant_code_here
```
4. Save the `.env` file.

## Step 6: Restart the Production Environment
For the new environment variables and the new SumUp checkout code to take effect, the Docker containers must be restarted.

Open PowerShell and run the boot script to cleanly rebuild and restart:
```powershell
C:\Users\Slaff\Documents\trosheencrafts-main\trosheen-boot.ps1
```

Once the containers are back online, test the checkout flow to verify the SumUp hosted payment page appears and correctly processes payments!
