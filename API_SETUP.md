# API Setup Guide for Holiday Integration

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your Free API Key

1. **Visit Abstract API**: Go to https://www.abstractapi.com/holidays-api
2. **Click "Get Started"** or "Sign Up"
3. **Create Account**: Use your email to sign up
4. **Verify Email**: Check your inbox and click the verification link
5. **Get API Key**: Copy your API key from the dashboard

### Step 2: Update Your Code

1. **Open the file**: `src/App.jsx`
2. **Find line 518**: Look for this line:
   ```javascript
   const apiKey = 'demo'; // Replace with your API key from https://www.abstractapi.com/holidays-api
   ```
3. **Replace 'demo'**: Change it to your actual API key:
   ```javascript
   const apiKey = 'your-actual-api-key-here';
   ```

### Step 3: Test Your Setup

1. **Start your app**: `npm run dev`
2. **Click the region button** (🌍) in the header
3. **Select your region** (US, UK, India, or Canada)
4. **Check the console** for success messages
5. **Look for holidays** displayed on the calendar

## 🔧 Detailed Instructions

### What the API Does

- **Fetches Real Holidays**: Gets actual public holidays for your region
- **Supports Multiple Countries**: US, UK, India, Canada
- **Automatic Updates**: Refreshes when you change regions or years
- **Fallback System**: Uses local data if API fails

### API Key Format

Your API key will look something like this:
```
abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

### Free Tier Limits

- **1,000 requests per month** (more than enough for personal use)
- **All major countries** supported
- **Real-time data** updates

### Troubleshooting

#### If you see "Unable to fetch online holidays":
1. **Check your API key** - make sure it's correct
2. **Verify your account** - ensure email is verified
3. **Check internet connection** - API needs internet access
4. **Try refreshing** - click the 🔄 button

#### If holidays don't appear:
1. **Check browser console** for error messages
2. **Verify region selection** - make sure you selected a region
3. **Wait a moment** - API calls take a few seconds
4. **Try switching regions** - some regions have more holidays

### Security Notes

- **Keep your API key private** - don't share it publicly
- **Free tier is sufficient** - no need to upgrade for personal use
- **API key is safe** - it's only used for holiday data

## 🎉 Success Indicators

When everything is working correctly, you should see:

1. **Green "(Online)" indicator** next to holidays
2. **Loading spinner** when fetching data
3. **Holiday dots** on calendar dates
4. **Holiday list** below the calendar
5. **Console messages** showing "Fetched X holidays"

## 📞 Need Help?

If you're having trouble:
1. **Check the console** for error messages
2. **Verify your API key** is correct
3. **Ensure your account** is verified
4. **Try the refresh button** (🔄)

The app will automatically fall back to local holiday data if the API fails, so your calendar will always work! 