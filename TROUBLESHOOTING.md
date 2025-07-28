# 🔧 API Troubleshooting Guide

## Quick Fixes

### 1. **Test Your API Connection**
- Click the region button (🌍) in the header
- Click "🧪 Test API Connection" button
- Check the alert message for results

### 2. **Check Browser Console**
- Press **F12** to open developer tools
- Go to **Console** tab
- Look for error messages when you select a region

### 3. **Common Error Messages & Solutions**

#### ❌ "Network error: Unable to connect"
**Problem**: Internet connection or CORS issue
**Solutions**:
- Check your internet connection
- Try refreshing the page
- Clear browser cache and cookies

#### ❌ "API Key Error: Your API key might be invalid"
**Problem**: Invalid or expired API key
**Solutions**:
- Verify your API key is correct
- Check your Abstract API account status
- Ensure your email is verified

#### ❌ "Access Denied: Your API key might not have permission"
**Problem**: API key doesn't have access to Holidays API
**Solutions**:
- Make sure you signed up for the **Holidays API** specifically
- Check if your account is activated
- Verify you're using the correct API key

#### ❌ "Rate Limit Exceeded: You have reached your API request limit"
**Problem**: Exceeded free tier limits (1,000 requests/month)
**Solutions**:
- Wait until next month for reset
- Check your usage in Abstract API dashboard
- Consider upgrading to paid plan

## Step-by-Step Debugging

### Step 1: Verify API Key
1. Go to [Abstract API Dashboard](https://app.abstractapi.com/)
2. Check if your API key matches what's in the code
3. Ensure the key is for the **Holidays API**

### Step 2: Check Account Status
1. Verify your email is confirmed
2. Check if your account is active
3. Look for any account restrictions

### Step 3: Test API Manually
1. Open a new browser tab
2. Go to: `https://holidays.abstractapi.com/v1/?api_key=YOUR_API_KEY&country=US&year=2024`
3. Replace `YOUR_API_KEY` with your actual key
4. Check if you get a JSON response

### Step 4: Check Browser Console
1. Open developer tools (F12)
2. Go to Console tab
3. Select a region in your app
4. Look for detailed error messages

## API Key Format Check

Your API key should:
- ✅ Be exactly 32 characters long
- ✅ Contain only letters and numbers
- ✅ Not have any spaces or special characters
- ✅ Be copied exactly as shown in your dashboard

**Example of correct format**:
```
ce5c8b7e613c4add8f98f44ac211fcd5
```

## Alternative Solutions

### Option 1: Use Local Holidays
- Click the 💾 button to switch to local holiday data
- Your calendar will still work with built-in holidays

### Option 2: Try Different Region
- Some regions might have different API access
- Try switching between US, UK, India, or Canada

### Option 3: Check API Documentation
- Visit [Abstract API Holidays Documentation](https://www.abstractapi.com/holidays-api)
- Check for any service updates or changes

## Still Having Issues?

If none of the above solutions work:

1. **Check Abstract API Status**: Visit their status page
2. **Contact Support**: Use the test button to get specific error details
3. **Use Local Mode**: Switch to local holidays until API issues are resolved

## Success Indicators

When everything is working correctly, you should see:
- ✅ Green "🧪 Test API Connection" shows success
- ✅ Console shows "Successfully fetched X holidays"
- ✅ Holiday dots appear on calendar dates
- ✅ Green "(Online)" indicator next to holidays 