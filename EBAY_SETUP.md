# eBay API Setup Guide

## Getting eBay API Credentials

To use real eBay price estimation, you'll need to obtain API credentials from eBay:

### Step 1: Create an eBay Developer Account
1. Visit [eBay Developer Program](https://developer.ebay.com/)
2. Sign up for a developer account or sign in with existing eBay account
3. Accept the developer terms and conditions

### Step 2: Create an Application
1. Go to "My Account" → "Applications"
2. Click "Create New Application"
3. Fill in application details:
   - **Application Name**: Simply eBay Scanner
   - **Application Type**: Public
   - **Platform**: Web
   - **Description**: Real-time eBay item identification and pricing tool

### Step 3: Get Your Credentials
After creating the application, you'll receive:
- **Client ID** (App ID)
- **Client Secret** (Cert ID)

### Step 4: Configure the Application
1. Open `index.html` in your code editor
2. Find the `EBAY_CONFIG` section (around line 285)
3. Replace the placeholder values:
   ```javascript
   const EBAY_CONFIG = {
       clientId: 'YOUR_ACTUAL_CLIENT_ID_HERE',
       clientSecret: 'YOUR_ACTUAL_CLIENT_SECRET_HERE',
       sandbox: true, // Set to false for production
       baseUrl: 'https://api.sandbox.ebay.com' // Use https://api.ebay.com for production
   };
   ```

### Step 5: Test with Sandbox
- Keep `sandbox: true` for testing
- Use sandbox credentials first
- Test the price estimation functionality

### Step 6: Go Live
When ready for production:
1. Set `sandbox: false`
2. Change `baseUrl` to `'https://api.ebay.com'`
3. Use production credentials
4. Test thoroughly

## API Rate Limits
- Sandbox: 5,000 calls per day
- Production: Varies by account type (typically 5,000-100,000+ per day)
- The app implements automatic fallback to mock data if API limits are exceeded

## Security Notes
- Never commit real credentials to version control
- Consider using environment variables in production
- For client-side apps, credentials will be visible - consider a backend proxy for production use

## Troubleshooting
- If you get 401 errors, check your credentials
- If you get 403 errors, check your application permissions
- If you get rate limit errors, the app will fall back to mock data
- Check browser console for detailed error messages
