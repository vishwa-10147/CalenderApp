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

  it('searches tasks by title', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Create multiple tasks
    const titleInput = screen.getByPlaceholderText(/create a task/i)
    const addButton = screen.getByRole('button', { name: /add/i })

    await act(async () => {
      await user.type(titleInput, 'Important Task')
      await user.click(addButton)
      await user.clear(titleInput)
      await user.type(titleInput, 'Another Task')
      await user.click(addButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Important Task')).toBeInTheDocument()
      expect(screen.getByText('Another Task')).toBeInTheDocument()
    })

    // Search for a task
    const searchInput = screen.getByPlaceholderText(/search tasks/i)
    await act(async () => {
      await user.type(searchInput, 'Important')
    })

    await waitFor(() => {
      expect(screen.getByText('Important Task')).toBeInTheDocument()
      expect(screen.queryByText('Another Task')).not.toBeInTheDocument()
    })
  })

  it('clears search query', async () => {
    const user = userEvent.setup()
    render(<App />)

    const titleInput = screen.getByPlaceholderText(/create a task/i)
    const addButton = screen.getByRole('button', { name: /add/i })

    await act(async () => {
      await user.type(titleInput, 'Searchable Task')
      await user.click(addButton)
    })

    const searchInput = screen.getByPlaceholderText(/search tasks/i)
    await act(async () => {
      await user.type(searchInput, 'Searchable')
    })

    await waitFor(() => {
      expect(screen.getByText('Searchable Task')).toBeInTheDocument()
    })

    // Clear search
    const clearButton = screen.getByRole('button', { name: /clear search/i })
    await act(async () => {
      await user.click(clearButton)
    })

    await waitFor(() => {
      expect(searchInput).toHaveValue('')
    })
  })

  it('sorts tasks by priority', async () => {
    const user = userEvent.setup()
    render(<App />)

    const titleInput = screen.getByPlaceholderText(/create a task/i)
    const categorySelect = screen.getByRole('combobox', { name: /task category/i })
    const prioritySelects = screen.getAllByRole('combobox')
    const prioritySelect = prioritySelects.find(select => 
      Array.from(select.options).some(opt => opt.value === 'high')
    ) || prioritySelects[1] // Fallback to second combobox (priority is usually second)
    const addButton = screen.getByRole('button', { name: /add/i })

    // Create low priority task
    await act(async () => {
      await user.type(titleInput, 'Low Priority Task')
      await user.selectOptions(prioritySelect, 'low')
      await user.click(addButton)
    })

    // Create high priority task
    await act(async () => {
      await user.clear(titleInput)
      await user.type(titleInput, 'High Priority Task')
      await user.selectOptions(prioritySelect, 'high')
      await user.click(addButton)
    })

    await waitFor(() => {
      expect(screen.getByText('High Priority Task')).toBeInTheDocument()
      expect(screen.getByText('Low Priority Task')).toBeInTheDocument()
    })

    // Sort by priority
    const sortSelect = screen.getByRole('combobox', { name: /sort tasks/i })
    await act(async () => {
      await user.selectOptions(sortSelect, 'priority')
    })

    // High priority should appear first
    const tasks = screen.getAllByText(/priority task/i)
    expect(tasks[0]).toHaveTextContent('High Priority Task')
  })

  it('sorts tasks by title', async () => {
    const user = userEvent.setup()
    render(<App />)

    const titleInput = screen.getByPlaceholderText(/create a task/i)
    const addButton = screen.getByRole('button', { name: /add/i })

    await act(async () => {
      await user.type(titleInput, 'Zebra Task')
      await user.click(addButton)
      await user.clear(titleInput)
      await user.type(titleInput, 'Apple Task')
      await user.click(addButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Apple Task')).toBeInTheDocument()
      expect(screen.getByText('Zebra Task')).toBeInTheDocument()
    })

    // Sort by title
    const sortSelect = screen.getByRole('combobox', { name: /sort tasks/i })
    await act(async () => {
      await user.selectOptions(sortSelect, 'title')
    })

    // Apple should appear before Zebra - check task list items specifically
    await waitFor(() => {
      const taskItems = screen.getAllByRole('listitem').filter(item => 
        item.classList.contains('task-item')
      )
      const taskTitles = taskItems.map(item => item.textContent)
      const appleIndex = taskTitles.findIndex(text => text.includes('Apple Task'))
      const zebraIndex = taskTitles.findIndex(text => text.includes('Zebra Task'))
      expect(appleIndex).toBeLessThan(zebraIndex)
    })
  })

  it('bulk deletes completed tasks', async () => {
    const user = userEvent.setup()
    window.confirm = vi.fn(() => true)
    render(<App />)

    const titleInput = screen.getByPlaceholderText(/create a task/i)
    const addButton = screen.getByRole('button', { name: /add/i })

    // Create and complete tasks
    await act(async () => {
      await user.type(titleInput, 'Task 1')
      await user.click(addButton)
      await user.clear(titleInput)
      await user.type(titleInput, 'Task 2')
      await user.click(addButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument()
      expect(screen.getByText('Task 2')).toBeInTheDocument()
    })

    // Complete both tasks
    const checkbox1 = screen.getByRole('button', { name: /mark task 1 as complete/i })
    const checkbox2 = screen.getByRole('button', { name: /mark task 2 as complete/i })
    
    await act(async () => {
      await user.click(checkbox1)
      await user.click(checkbox2)
    })

    // Bulk delete
    const clearButton = screen.getByRole('button', { name: /clear completed/i })
    await act(async () => {
      await user.click(clearButton)
    })

    await waitFor(() => {
      expect(screen.queryByText('Task 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Task 2')).not.toBeInTheDocument()
    })
  })

  it('shows empty state when no tasks match search', async () => {
    const user = userEvent.setup()
    render(<App />)

    const titleInput = screen.getByPlaceholderText(/create a task/i)
    const addButton = screen.getByRole('button', { name: /add/i })

    await act(async () => {
      await user.type(titleInput, 'Existing Task')
      await user.click(addButton)
    })

    const searchInput = screen.getByPlaceholderText(/search tasks/i)
    await act(async () => {
      await user.type(searchInput, 'NonExistent')
    })

    await waitFor(() => {
      expect(screen.getByText(/no tasks found matching/i)).toBeInTheDocument()
    })
  })

  it('shows empty state when no tasks exist', () => {
    render(<App />)
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument()
  })

  it('shows task count in subtitle', async () => {
    const user = userEvent.setup()
    render(<App />)

    const titleInput = screen.getByPlaceholderText(/create a task/i)
    const addButton = screen.getByRole('button', { name: /add/i })

    await act(async () => {
      await user.type(titleInput, 'Task 1')
      await user.click(addButton)
      await user.clear(titleInput)
      await user.type(titleInput, 'Task 2')
      await user.click(addButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/2 tasks/i)).toBeInTheDocument()
    })
  })

  it('shows completed task count', async () => {
    const user = userEvent.setup()
    render(<App />)

    const titleInput = screen.getByPlaceholderText(/create a task/i)
    const addButton = screen.getByRole('button', { name: /add/i })

    await act(async () => {
      await user.type(titleInput, 'Task 1')
      await user.click(addButton)
    })

    const checkbox = screen.getByRole('button', { name: /mark task 1 as complete/i })
    await act(async () => {
      await user.click(checkbox)
    })

    await waitFor(() => {
      expect(screen.getByText(/1 completed/i)).toBeInTheDocument()
    })
  })

  it('exports tasks to JSON', async () => {
    const user = userEvent.setup()
    
    render(<App />)

    const titleInput = screen.getByPlaceholderText(/create a task/i)
    const addButton = screen.getByRole('button', { name: /add/i })

    await act(async () => {
      await user.type(titleInput, 'Export Task')
      await user.click(addButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Export Task')).toBeInTheDocument()
    })

    // Mock URL methods
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    
    // Track createElement calls but don't break React
    let linkElement = null
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const element = document.createElement(tag)
      if (tag === 'a') {
        linkElement = element
        // Spy on click but don't prevent default behavior
        const originalClick = element.click.bind(element)
        element.click = vi.fn(originalClick)
      }
      return element
    })
    const appendChildSpy = vi.spyOn(document.body, 'appendChild')
    const removeChildSpy = vi.spyOn(document.body, 'removeChild')

    const exportButton = screen.getByRole('button', { name: /export tasks/i })
    await act(async () => {
      await user.click(exportButton)
    })

    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(linkElement).toBeTruthy()
    expect(linkElement.download).toMatch(/focusflow-tasks-.*\.json/)

    createElementSpy.mockRestore()
    appendChildSpy.mockRestore()
    removeChildSpy.mockRestore()
    createObjectURLSpy.mockRestore()
    revokeObjectURLSpy.mockRestore()
  })

  it('imports tasks from JSON', async () => {
    const user = userEvent.setup()
    window.confirm = vi.fn(() => true)

    render(<App />)

    const mockFile = new File(
      [JSON.stringify([{ id: '1', title: 'Imported Task', category: 'work', completed: false, priority: 'medium' }])],
      'tasks.json',
      { type: 'application/json' }
    )

    let fileReaderOnload = null
    const mockFileReader = {
      readAsText: vi.fn(function(file) {
        fileReaderOnload = this.onload
        // Simulate async file reading
        setTimeout(() => {
          if (fileReaderOnload) {
            fileReaderOnload({ 
              target: { 
                result: JSON.stringify([{ id: '1', title: 'Imported Task', category: 'work', completed: false, priority: 'medium' }]) 
              } 
            })
          }
        }, 10)
      }),
      result: '',
    }

    global.FileReader = vi.fn(() => mockFileReader)

    let inputElement = null
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const element = document.createElement(tag)
      if (tag === 'input') {
        inputElement = element
        element.type = 'file'
        element.accept = 'application/json'
        Object.defineProperty(element, 'files', {
          value: [mockFile],
          writable: false,
        })
        element.click = vi.fn()
      }
      return element
    })

    const importButton = screen.getByRole('button', { name: /import tasks/i })
    await act(async () => {
      await user.click(importButton)
    })

    // Trigger file selection
    if (inputElement && inputElement.onchange) {
      inputElement.onchange({ target: inputElement })
    }

    await waitFor(() => {
      expect(screen.getByText('Imported Task')).toBeInTheDocument()
    }, { timeout: 2000 })

    createElementSpy.mockRestore()
  })

  it('displays due date indicators for overdue tasks', async () => {
    const user = userEvent.setup()
    render(<App />)

    const titleInput = screen.getByPlaceholderText(/create a task/i)
    const addButton = screen.getByRole('button', { name: /add/i })

    // Create task with past end date
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    await act(async () => {
      await user.type(titleInput, 'Overdue Task')
    })

    const endDateInput = screen.getByLabelText(/end date/i)
    await act(async () => {
      await user.type(endDateInput, yesterdayStr)
      await user.click(addButton)
    })

    await waitFor(() => {
      const taskTitle = screen.getByText('Overdue Task')
      expect(taskTitle.textContent).toContain('⚠️')
    })
  })

  it('displays due date indicators for tasks due soon', async () => {
    const user = userEvent.setup()
    render(<App />)

    const titleInput = screen.getByPlaceholderText(/create a task/i)
    const addButton = screen.getByRole('button', { name: /add/i })

    // Create task with tomorrow as end date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    await act(async () => {
      await user.type(titleInput, 'Due Soon Task')
    })

    const endDateInput = screen.getByLabelText(/end date/i)
    await act(async () => {
      await user.type(endDateInput, tomorrowStr)
      await user.click(addButton)
    })

    await waitFor(() => {
      const taskTitle = screen.getByText('Due Soon Task')
      expect(taskTitle.textContent).toContain('🔔')
    })
  })

  it('uses keyboard shortcut to focus search', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search tasks/i)).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/search tasks/i)
    
    // Simulate Ctrl+K - the handler listens on window
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    })
    
    // Focus should be on search input after Ctrl+K
    window.dispatchEvent(event)

    await waitFor(() => {
      expect(document.activeElement).toBe(searchInput)
    }, { timeout: 500 })
  })
})

