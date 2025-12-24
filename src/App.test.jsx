import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString()
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders the app with FocusFlow title', () => {
    render(<App />)
    expect(screen.getByText('FocusFlow')).toBeInTheDocument()
  })

  it('displays all three tabs', () => {
    render(<App />)
    expect(screen.getByRole('tab', { name: /tasks/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /calendar/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /profile/i })).toBeInTheDocument()
  })

  it('switches between tabs', async () => {
    const user = userEvent.setup()
    render(<App />)

    const calendarTab = screen.getByRole('tab', { name: /calendar/i })
    await user.click(calendarTab)
    expect(calendarTab).toHaveAttribute('aria-selected', 'true')
  })

  it('creates a new task', async () => {
    const user = userEvent.setup()
    render(<App />)

    const titleInput = screen.getByPlaceholderText(/create a task/i)
    const addButton = screen.getByRole('button', { name: /add/i })

    await user.type(titleInput, 'Test Task')
    await user.click(addButton)

    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })

  it('toggles task completion', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Create a task
    const titleInput = screen.getByPlaceholderText(/create a task/i)
    const addButton = screen.getByRole('button', { name: /add/i })

    await user.type(titleInput, 'Test Task')
    await user.click(addButton)

    // Toggle completion
    const checkbox = screen.getByRole('button', { name: /mark test task as complete/i })
    await user.click(checkbox)

    const taskItem = screen.getByText('Test Task').closest('.task-item')
    expect(taskItem).toHaveClass('task-item--done')
  })

  it('filters tasks by category', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Create work task
    const titleInput = screen.getByPlaceholderText(/create a task/i)
    // Use getByRole with the aria-label to find the category select
    const categorySelect = screen.getByRole('combobox', { name: /task category/i })
    const addButton = screen.getByRole('button', { name: /add/i })

    await act(async () => {
      await user.type(titleInput, 'Work Task')
      await user.selectOptions(categorySelect, 'work')
      await user.click(addButton)
    })

    // Wait for task to appear
    await waitFor(() => {
      expect(screen.getByText('Work Task')).toBeInTheDocument()
    })

    // Filter by personal
    const personalFilter = screen.getByRole('button', { name: /personal/i })
    await act(async () => {
      await user.click(personalFilter)
    })

    await waitFor(() => {
      expect(screen.queryByText('Work Task')).not.toBeInTheDocument()
    })
  })

  it('deletes a task', async () => {
    const user = userEvent.setup()
    // Mock window.confirm
    window.confirm = vi.fn(() => true)

    render(<App />)

    // Create a task
    const titleInput = screen.getByPlaceholderText(/create a task/i)
    const addButton = screen.getByRole('button', { name: /add/i })

    await user.type(titleInput, 'Task to Delete')
    await user.click(addButton)

    expect(screen.getByText('Task to Delete')).toBeInTheDocument()

    // Delete the task
    const deleteButton = screen.getByRole('button', { name: /delete task: task to delete/i })
    await user.click(deleteButton)

    await waitFor(() => {
      expect(screen.queryByText('Task to Delete')).not.toBeInTheDocument()
    })
  })

  it('edits a task', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Create a task
    const titleInput = screen.getByPlaceholderText(/create a task/i)
    const addButton = screen.getByRole('button', { name: /add/i })

    await act(async () => {
      await user.type(titleInput, 'Original Task')
      await user.click(addButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Original Task')).toBeInTheDocument()
    })

    // Edit the task
    const editButton = screen.getByRole('button', { name: /edit task: original task/i })
    await act(async () => {
      await user.click(editButton)
    })

    // Update the form
    await waitFor(() => {
      const updatedInput = screen.getByDisplayValue('Original Task')
      expect(updatedInput).toBeInTheDocument()
    })

    const updatedInput = screen.getByDisplayValue('Original Task')
    await act(async () => {
      await user.clear(updatedInput)
      await user.type(updatedInput, 'Updated Task')
    })

    const updateButton = screen.getByRole('button', { name: /update/i })
    await act(async () => {
      await user.click(updateButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Updated Task')).toBeInTheDocument()
      expect(screen.queryByText('Original Task')).not.toBeInTheDocument()
    })
  })

  it('toggles dark mode', async () => {
    const user = userEvent.setup()
    render(<App />)

    const themeToggle = screen.getByRole('button', { name: /switch to dark mode/i })
    await user.click(themeToggle)

    expect(document.documentElement).toHaveClass('dark-mode')
  })

  it('persists tasks to localStorage', async () => {
    const user = userEvent.setup()
    render(<App />)

    const titleInput = screen.getByPlaceholderText(/create a task/i)
    const addButton = screen.getByRole('button', { name: /add/i })

    await user.type(titleInput, 'Persistent Task')
    await user.click(addButton)

    const stored = JSON.parse(localStorage.getItem('focusflow_tasks_v1'))
    expect(stored).toHaveLength(1)
    expect(stored[0].title).toBe('Persistent Task')
  })

  it('loads tasks from localStorage on mount', () => {
    const tasks = [
      {
        id: '1',
        title: 'Loaded Task',
        category: 'work',
        completed: false,
        priority: 'medium',
      },
    ]
    localStorage.setItem('focusflow_tasks_v1', JSON.stringify(tasks))

    render(<App />)
    expect(screen.getByText('Loaded Task')).toBeInTheDocument()
  })
})

