# FocusFlow - Daily To-do Calendar App

A modern, responsive calendar and task management application built with React and Vite. Plan your tasks, visualize them on a calendar, and track your productivity.

🌐 **Live Demo**: [https://vishwa-10147.github.io/CalenderApp/](https://vishwa-10147.github.io/CalenderApp/)

## Features

- ✅ **Task Management**: Create, organize, and complete tasks with categories (Work, Personal, Wishlist)
- 📅 **Calendar View**: Visualize tasks on a monthly calendar with drag-and-drop functionality
- 📊 **Productivity Dashboard**: Track completion rates, daily stats, and category breakdowns
- 🎯 **Priority Levels**: Assign high, medium, or low priority to tasks
- ⏰ **Reminders**: Set date and time reminders for important tasks
- 📝 **Task Details**: Add notes, start/end dates, and end times to tasks
- 💾 **Local Storage**: All data is saved locally in your browser
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🔄 **PWA Ready**: Service worker and manifest included for Progressive Web App capabilities

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **react-calendar** - Calendar component
- **Tailwind CSS** - Styling
- **Supabase** - (Available for future cloud sync)
- **Dexie** - (Available for IndexedDB support)

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vishwa-10147/CalenderApp.git
cd CalenderApp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
CalenderApp/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── public/
│   ├── icons/           # PWA icons
│   ├── manifest.webmanifest
│   └── sw.js            # Service worker
├── dist/                # Production build output
├── .github/workflows/  # GitHub Actions workflows
└── vite.config.js       # Vite configuration
```

## Usage

### Creating Tasks

1. Navigate to the **Tasks** tab
2. Fill in the task form:
   - Enter a task title
   - Select a category (Work, Personal, or Wishlist)
   - Set priority level
   - Add start/end dates and times
   - Optionally add notes and reminders
3. Click **Add** to create the task

### Viewing Calendar

1. Click the **Calendar** tab
2. Select any date to see tasks scheduled for that day
3. Drag and drop tasks between dates to reschedule them

### Tracking Progress

1. Click the **Profile** tab to view:
   - Total completed and pending tasks
   - Today's completion rate
   - Tasks in the next 7 days
   - Daily completion graph (last 7 days)
   - Pending tasks by category

## Deployment

This project is automatically deployed to GitHub Pages on every push to the `main` branch using GitHub Actions.

The deployment workflow:
1. Builds the project using `npm run build`
2. Uploads the `dist/` folder as an artifact
3. Deploys to GitHub Pages

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Future Enhancements

- [ ] Cloud sync with Supabase
- [ ] Task editing and deletion
- [ ] Recurring tasks
- [ ] Task search and filtering
- [ ] Export/import functionality
- [ ] Dark mode toggle
- [ ] Multi-user support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Author

**vishwa-10147**

---

Made with ❤️ using React and Vite

