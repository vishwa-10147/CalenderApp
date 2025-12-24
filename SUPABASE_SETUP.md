# Supabase Setup Guide

This guide will help you set up Supabase for cloud sync functionality in FocusFlow.

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - Name: `focusflow` (or any name you prefer)
   - Database Password: Choose a strong password
   - Region: Choose the closest region to your users
5. Click "Create new project" and wait for it to be set up

## Step 2: Create the Tasks Table

1. In your Supabase project dashboard, go to the "SQL Editor"
2. Click "New query"
3. Paste the following SQL:

```sql
-- Create tasks table
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT,
  start_date TEXT,
  end_date TEXT,
  end_time TEXT,
  notes TEXT,
  priority TEXT DEFAULT 'medium',
  reminder TEXT,
  completed BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_updated_at ON tasks(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own tasks
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own tasks
CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own tasks
CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own tasks
CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);
```

4. Click "Run" to execute the query

## Step 3: Get Your API Keys

1. In your Supabase project dashboard, go to "Settings" → "API"
2. You'll find:
   - **Project URL**: Copy this value
   - **anon/public key**: Copy this value

## Step 4: Configure Environment Variables

1. In your project root, create a `.env` file (if it doesn't exist)
2. Add the following:

```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace `your_project_url_here` and `your_anon_key_here` with the values from Step 3.

## Step 5: Enable Authentication (Optional but Recommended)

For cloud sync to work, users need to be authenticated. You can set up authentication in Supabase:

1. Go to "Authentication" → "Providers" in your Supabase dashboard
2. Enable the providers you want (Email, Google, GitHub, etc.)
3. Configure the settings as needed

## Step 6: Update App Code (Already Done)

The app code has already been updated to support Supabase. The sync will work automatically once:
- Environment variables are set
- User is authenticated (if you enabled authentication)
- Tasks table is created

## Testing the Setup

1. Start your development server: `npm run dev`
2. Open the app in your browser
3. If Supabase is configured correctly, you'll see "Synced" status in the header
4. Create a task and check your Supabase dashboard → Table Editor → tasks to see if it appears

## Troubleshooting

### Tasks not syncing?

1. Check that your `.env` file has the correct values
2. Make sure you've created the tasks table
3. Check the browser console for errors
4. Verify that RLS policies are set up correctly

### Authentication issues?

1. Make sure authentication is enabled in Supabase
2. Check that the user is logged in
3. Verify RLS policies allow the user to access their tasks

### Still having issues?

- Check the browser console for detailed error messages
- Review Supabase logs in the dashboard
- Ensure your Supabase project is active (not paused)

## Local-Only Mode

If you don't want to use Supabase, the app works perfectly fine in local-only mode. Simply don't set the environment variables, and all data will be stored in your browser's localStorage.

