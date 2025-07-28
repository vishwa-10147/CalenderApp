# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Calendar App

A comprehensive React calendar application with multiple features including custom buttons, day-to-day work tables, events, reminders, and real-world holiday integration.

## Features

- **Interactive Calendar**: Navigate through months with built-in navigation
- **Custom Buttons**: Create and manage custom buttons with text and color customization
- **Day-to-Day Work Tables**: Create customizable tables for daily work tracking
- **Event System**: Add events and reminders with recurring options
- **Theme Toggle**: Switch between dark and light themes
- **Real-World Holiday Integration**: Connect to online holiday APIs for live holiday data
- **Region Selection**: Choose your region for relevant public holidays
- **Responsive Design**: Works on desktop and mobile devices

## Online Holiday API Setup

This app can connect to real-world holiday APIs to display live, up-to-date holiday information.

### Getting Started with Online Holidays

1. **Get a Free API Key**:
   - Visit [Abstract API Holidays](https://www.abstractapi.com/holidays-api)
   - Sign up for a free account
   - Get your API key (free tier includes 1,000 requests per month)

2. **Configure the API**:
   - Open `src/App.jsx`
   - Find line with `const apiKey = 'demo';`
   - Replace `'demo'` with your actual API key

3. **Supported Regions**:
   - United States (US)
   - United Kingdom (UK)
   - India (IN)
   - Canada (CA)

### API Features

- **Real-time Data**: Get current year's holidays automatically
- **Multiple Regions**: Support for different countries
- **Fallback System**: Falls back to local holiday data if API is unavailable
- **Toggle Options**: Switch between online and local holiday data
- **Refresh Function**: Manually refresh holiday data

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

### Basic Calendar Navigation
- Use the built-in navigation arrows to move between months
- Click on any date to select it

### Custom Buttons
1. Click "Create Your Own Button"
2. Enter button text and choose a color
3. Click "Create" to add the button
4. Click on a custom button, then click a date to add a text box
5. Enter your notes and save

### Day-to-Day Work Tables
1. Click "Day-to-Day Work"
2. Enter table name, number of rows and columns
3. Create the table and start editing
4. Save your work or delete the table

### Events and Reminders
1. Click "Add Event" to open the event creation modal
2. Fill in event details (title, description, color)
3. Choose if it's recurring and set the frequency
4. Create the event

### Holiday Integration
1. Click the region button (🌍) in the header
2. Select your region from the modal
3. The app will automatically fetch holidays for your region
4. Use the refresh button (🔄) to update holiday data
5. Toggle between online (🌐) and local (💾) holiday data

### Theme Switching
- Click the theme toggle button (🌙/☀️) to switch between dark and light modes

## API Configuration

The app uses the Abstract API Holidays service. To enable online holiday data:

1. Get your API key from [Abstract API](https://www.abstractapi.com/holidays-api)
2. Replace the `apiKey` variable in `src/App.jsx`:
   ```javascript
   const apiKey = 'your-api-key-here';
   ```

## Dependencies

- React
- react-calendar
- Vite (for development)

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License.
