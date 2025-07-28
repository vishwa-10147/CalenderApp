# Example: How to Replace Your API Key

## Current Code (Line 518 in src/App.jsx)

```javascript
const apiKey = 'demo'; // Replace with your API key from https://www.abstractapi.com/holidays-api
```

## After Replacement (Example)

```javascript
const apiKey = 'ce5c8b7e613c4add8f98f44ac211fcd5'; // Replace with your API key from https://www.abstractapi.com/holidays-api
```

## Your API Key Will Look Like This

When you get your API key from Abstract API, it will be a long string of letters and numbers, like:

```
abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

## Steps to Replace

1. **Copy your API key** from the Abstract API dashboard
2. **Open** `src/App.jsx` in your code editor
3. **Find line 518** (use Ctrl+F to search for "apiKey = 'demo'")
4. **Replace** `'demo'` with your actual API key
5. **Save the file**
6. **Restart your app** if it's running

## Important Notes

- **Keep the quotes**: Your API key should be inside single quotes `'`
- **No spaces**: Don't add any spaces around the equals sign
- **Case sensitive**: Copy the API key exactly as shown
- **Keep the comment**: Leave the comment explaining where the key comes from

## Testing

After replacing the API key:

1. **Start your app**: `npm run dev`
2. **Open browser console** (F12)
3. **Click the region button** (🌍)
4. **Select a region**
5. **Look for success message** in console: "Fetched X holidays for [REGION] in [YEAR]" 