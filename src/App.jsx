import React, { useEffect, useMemo, useState } from 'react'
import Calendar from 'react-calendar'
import { createClient } from '@supabase/supabase-js'
import 'react-calendar/dist/Calendar.css'

const CATEGORIES = ['all', 'work', 'personal', 'wishlist']
const STORAGE_KEY = 'focusflow_tasks_v1'
const THEME_KEY = 'focusflow_theme'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Initialize Supabase client (only if keys are provided)
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

function App() {
  const [activeTab, setActiveTab] = useState('tasks') // 'tasks' | 'calendar' | 'profile'
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false
    const saved = window.localStorage.getItem(THEME_KEY)
    return saved ? saved === 'dark' : false
  })
  const [syncStatus, setSyncStatus] = useState('local') // 'local' | 'syncing' | 'synced' | 'error'
  const [tasks, setTasks] = useState(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return parsed
    } catch {
      return []
    }
  })

  // Apply dark mode class
  useEffect(() => {
    if (typeof window === 'undefined') return
    document.documentElement.classList.toggle('dark-mode', darkMode)
    try {
      window.localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light')
    } catch {
      // ignore write errors
    }
  }, [darkMode])

  // Save to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      // ignore write errors
    }
  }, [tasks])

  // Sync with Supabase if configured
  useEffect(() => {
    if (!supabase) return
    
    const syncToSupabase = async () => {
      try {
        setSyncStatus('syncing')
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setSyncStatus('local')
          return
        }

        const { error } = await supabase
          .from('tasks')
          .upsert(
            tasks.map(task => ({
              id: task.id,
              user_id: user.id,
              ...task,
              updated_at: new Date().toISOString(),
            })),
            { onConflict: 'id' }
          )

        if (error) throw error
        setSyncStatus('synced')
      } catch (error) {
        console.error('Sync error:', error)
        setSyncStatus('error')
      }
    }

    const loadFromSupabase = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })

        if (error) throw error
        if (data && data.length > 0) {
          setTasks(data.map(({ user_id, updated_at, ...task }) => task))
        }
      } catch (error) {
        console.error('Load error:', error)
      }
    }

    // Load on mount, sync on changes
    loadFromSupabase()
    if (tasks.length > 0) {
      const timeoutId = setTimeout(syncToSupabase, 1000) // Debounce
      return () => clearTimeout(timeoutId)
    }
  }, [tasks])

  const handleCreateTask = (task) => {
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
        title: task.title || 'Untitled task',
        category: task.category,
        startDate: task.startDate,
        endDate: task.endDate,
        endTime: task.endTime,
        notes: task.notes?.trim() || '',
        priority: task.priority || 'medium',
        reminder: task.reminder || '',
        completed: false,
      },
    ])
  }

  const handleUpdateTask = (id, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    )
  }

  const handleDeleteTask = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks((prev) => prev.filter((t) => t.id !== id))
      
      // Also delete from Supabase if configured
      if (supabase) {
        supabase.from('tasks').delete().eq('id', id).catch(console.error)
      }
    }
  }

  const handleToggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    )
  }

  const handleMoveTaskToDate = (id, isoDate) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, startDate: isoDate } : t)),
    )
  }

  const handleExportTasks = () => {
    const dataStr = JSON.stringify(tasks, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `focusflow-tasks-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImportTasks = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result)
          if (Array.isArray(imported)) {
            if (window.confirm(`Import ${imported.length} task${imported.length > 1 ? 's' : ''}? This will add them to your existing tasks.`)) {
              setTasks((prev) => [...prev, ...imported])
            }
          } else {
            alert('Invalid file format')
          }
        } catch (error) {
          alert('Error reading file: ' + error.message)
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const today = useMemo(() => new Date(), [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.querySelector('.search-input')
        if (searchInput) {
          searchInput.focus()
        }
      }
      // Escape to clear search
      if (e.key === 'Escape') {
        const searchInput = document.querySelector('.search-input')
        if (searchInput && document.activeElement === searchInput) {
          searchInput.blur()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <div className={`app-shell ${darkMode ? 'dark-mode' : ''}`}>
      <header className="app-header">
        <div>
          <div className="app-title">
            FocusFlow
            <span className="app-title-badge">Daily To-do</span>
          </div>
          <p className="app-subtitle">Plan tasks, see them on a calendar, and track progress.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="header-actions">
            <button
              type="button"
              className="btn-icon btn-icon--header"
              onClick={handleExportTasks}
              aria-label="Export tasks"
              title="Export tasks to JSON"
            >
              📥
            </button>
            <button
              type="button"
              className="btn-icon btn-icon--header"
              onClick={handleImportTasks}
              aria-label="Import tasks"
              title="Import tasks from JSON"
            >
              📤
            </button>
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <div className="pill">
            <span className={`pill-dot ${syncStatus === 'synced' ? 'pill-dot--synced' : syncStatus === 'syncing' ? 'pill-dot--syncing' : ''}`} />
            <span>{syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Local'}</span>
          </div>
        </div>
      </header>

      <nav className="tab-nav" role="tablist" aria-label="Main navigation">
        <button
          role="tab"
          aria-selected={activeTab === 'tasks'}
          aria-controls="tasks-panel"
          id="tasks-tab"
          className={`tab-btn ${activeTab === 'tasks' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'calendar'}
          aria-controls="calendar-panel"
          id="calendar-tab"
          className={`tab-btn ${activeTab === 'calendar' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          Calendar
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'profile'}
          aria-controls="profile-panel"
          id="profile-tab"
          className={`tab-btn ${activeTab === 'profile' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            onCreateTask={handleCreateTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onToggleTask={handleToggleTask}
          />
        )}
        {activeTab === 'calendar' && (
          <CalendarView
            tasks={tasks}
            today={today}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onToggleTask={handleToggleTask}
            onMoveTaskToDate={handleMoveTaskToDate}
          />
        )}
        {activeTab === 'profile' && <ProfileView tasks={tasks} today={today} />}
      </main>

      <footer className="app-footer">
        <span>
          <strong>
            {today.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </strong>
        </span>
        <span>Windows & Android ready</span>
      </footer>
    </div>
  )
}

function TasksView({ tasks, onCreateTask, onUpdateTask, onDeleteTask, onToggleTask }) {
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date') // 'date', 'priority', 'title'
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    title: '',
    category: 'work',
    startDate: '',
    endDate: '',
    endTime: '',
    notes: '',
    priority: 'medium',
    reminder: '',
  })

  const filteredTasks = tasks.filter((task) => {
    const matchesCategory = filter === 'all' ? true : task.category === filter
    const matchesSearch = searchQuery.trim() === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  }).sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2)
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title)
    }
    // Sort by date (default)
    const dateA = a.endDate || a.startDate || ''
    const dateB = b.endDate || b.startDate || ''
    if (!dateA && !dateB) return 0
    if (!dateA) return 1
    if (!dateB) return -1
    return dateA.localeCompare(dateB)
  })

  const completedTasks = filteredTasks.filter(t => t.completed)
  const handleBulkDelete = () => {
    if (completedTasks.length === 0) return
    if (window.confirm(`Delete ${completedTasks.length} completed task${completedTasks.length > 1 ? 's' : ''}?`)) {
      completedTasks.forEach(task => onDeleteTask(task.id))
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return

    if (editingId) {
      onUpdateTask(editingId, form)
      setEditingId(null)
    } else {
      onCreateTask(form)
    }
    
    setForm({
      title: '',
      category: 'work',
      startDate: '',
      endDate: '',
      endTime: '',
      notes: '',
      priority: 'medium',
      reminder: '',
    })
  }

  const handleEdit = (task) => {
    setEditingId(task.id)
    setForm({
      title: task.title,
      category: task.category,
      startDate: task.startDate || '',
      endDate: task.endDate || '',
      endTime: task.endTime || '',
      notes: task.notes || '',
      priority: task.priority || 'medium',
      reminder: task.reminder || '',
    })
    // Scroll to form (only in browser, not in test environment)
    try {
      const form = document.querySelector('.task-form')
      if (form && typeof form.scrollIntoView === 'function') {
        form.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    } catch {
      // Ignore scroll errors in test environment
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm({
      title: '',
      category: 'work',
      startDate: '',
      endDate: '',
      endTime: '',
      notes: '',
      priority: 'medium',
      reminder: '',
    })
  }

  return (
    <section className="panel" role="tabpanel" id="tasks-panel" aria-labelledby="tasks-tab">
      <div className="panel-header">
        <div>
          <h2>Tasks</h2>
          <p className="panel-subtitle">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
            {completedTasks.length > 0 && (
              <span className="completed-count"> • {completedTasks.length} completed</span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="select select--sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort tasks"
            style={{ minWidth: '100px', fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}
          >
            <option value="date">Sort by Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="title">Sort by Title</option>
          </select>
          {completedTasks.length > 0 && (
            <button
              type="button"
              className="btn-secondary btn-secondary--sm"
              onClick={handleBulkDelete}
              title="Delete all completed tasks"
            >
              Clear Completed
            </button>
          )}
          <div className="chip-row" role="group" aria-label="Filter tasks by category">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`chip ${filter === cat ? 'chip--active' : ''}`}
                onClick={() => setFilter(cat)}
                aria-pressed={filter === cat}
              >
                {cat === 'all'
                  ? 'All'
                  : cat === 'work'
                    ? 'Work'
                    : cat === 'personal'
                      ? 'Personal'
                      : 'Wishlist'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search tasks"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      )}

      <form className="task-form" onSubmit={handleSubmit} aria-label={editingId ? 'Edit task' : 'Create new task'}>
        <div className="task-form-row">
          <input
            name="title"
            className="input"
            placeholder="Create a task..."
            value={form.title}
            onChange={handleChange}
            aria-label="Task title"
          />
          <div className="field" style={{ minWidth: '120px' }}>
            <label htmlFor="category-select" className="sr-only">Category</label>
            <select
              id="category-select"
              name="category"
              className="select"
              value={form.category}
              onChange={handleChange}
              aria-label="Task category"
            >
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="wishlist">Wishlist</option>
            </select>
          </div>
        </div>
        <div className="task-form-row">
          <div className="field">
            <label>Priority</label>
            <select
              name="priority"
              className="select"
              value={form.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="field">
            <label>Reminder</label>
            <input
              type="datetime-local"
              name="reminder"
              className="input"
              value={form.reminder}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="field">
          <label>Notes</label>
          <textarea
            name="notes"
            className="textarea"
            rows={2}
            placeholder="Extra details for this task (optional)..."
            value={form.notes}
            onChange={handleChange}
          />
        </div>
        <div className="task-form-row task-form-row--dates">
          <div className="field">
            <label>Start date</label>
            <input
              type="date"
              name="startDate"
              className="input input--sm"
              value={form.startDate}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>End date</label>
            <input
              type="date"
              name="endDate"
              className="input input--sm"
              value={form.endDate}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>End time</label>
            <input
              type="time"
              name="endTime"
              className="input input--sm"
              value={form.endTime}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn-primary">
            {editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <ul className="task-list" role="list">
        {filteredTasks.length === 0 && (
          <li className="task-empty" role="listitem">
            {searchQuery ? (
              <>
                <div className="empty-icon">🔍</div>
                <div>No tasks found matching "{searchQuery}"</div>
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </button>
              </>
            ) : tasks.length === 0 ? (
              <>
                <div className="empty-icon">✨</div>
                <div>No tasks yet. Create your first task to get started!</div>
              </>
            ) : (
              <>
                <div className="empty-icon">📋</div>
                <div>No tasks in this category.</div>
              </>
            )}
          </li>
        )}
        {filteredTasks.map((task) => (
          <li key={task.id} className={`task-item ${task.completed ? 'task-item--done' : ''}`} role="listitem">
            <button
              type="button"
              className={`task-checkbox ${task.completed ? 'task-checkbox--checked' : ''}`}
              onClick={() => onToggleTask(task.id)}
              aria-label={task.completed ? `Mark ${task.title} as incomplete` : `Mark ${task.title} as complete`}
            >
              {task.completed && <span aria-hidden="true">✓</span>}
            </button>
            <div className="task-main">
              <div className="task-title-row">
                <span className="task-title">
                  {task.title}
                  {task.endDate && new Date(task.endDate) < new Date() && !task.completed && (
                    <span className="task-overdue" title="Overdue"> ⚠️</span>
                  )}
                  {task.endDate && 
                   new Date(task.endDate) >= new Date() && 
                   new Date(task.endDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000) && 
                   !task.completed && (
                    <span className="task-due-soon" title="Due soon"> 🔔</span>
                  )}
                </span>
                <span className={`pill pill--mini pill--priority pill--priority-${task.priority}`} aria-label={`Priority: ${task.priority}`}>
                  {task.priority === 'high'
                    ? 'High'
                    : task.priority === 'low'
                      ? 'Low'
                      : 'Medium'}
                </span>
                <span className={`pill pill--mini pill--${task.category}`} aria-label={`Category: ${task.category}`}>
                  {task.category === 'work'
                    ? 'Work'
                    : task.category === 'personal'
                      ? 'Personal'
                      : 'Wishlist'}
                </span>
              </div>
              <div className="task-meta">
                {(task.startDate || task.endDate) && (
                  <span>
                    {task.startDate || '—'} → {task.endDate || '—'}
                  </span>
                )}
                {task.endTime && <span>End time: {task.endTime}</span>}
                {task.reminder && <span>Reminder: {formatReminder(task.reminder)}</span>}
              </div>
              {task.notes && <p className="task-notes">{task.notes}</p>}
            </div>
            <div className="task-actions">
              <button
                type="button"
                className="btn-icon"
                onClick={() => handleEdit(task)}
                aria-label={`Edit task: ${task.title}`}
                title="Edit task"
              >
                ✏️
              </button>
              <button
                type="button"
                className="btn-icon"
                onClick={() => onDeleteTask(task.id)}
                aria-label={`Delete task: ${task.title}`}
                title="Delete task"
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function CalendarView({ tasks, today, onUpdateTask, onDeleteTask, onToggleTask, onMoveTaskToDate }) {
  const [selectedDate, setSelectedDate] = useState(startOfDay(today))
  const selectedISO = selectedDate.toISOString().slice(0, 10)

  const tasksOnSelected = tasks.filter(
    (t) => (t.startDate || t.endDate) && (t.startDate || t.endDate) === selectedISO,
  )

  const tasksByDate = useMemo(() => {
    const map = new Map()
    tasks.forEach((t) => {
      const key = t.startDate || t.endDate
      if (!key) return
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(t)
    })
    return map
  }, [tasks])

  const handleDropOnDate = (event, date) => {
    event.preventDefault()
    const id = event.dataTransfer.getData('text/plain')
    if (!id) return
    const iso = date.toISOString().slice(0, 10)
    onMoveTaskToDate(id, iso)
  }

  return (
    <section className="panel" role="tabpanel" id="calendar-panel" aria-labelledby="calendar-tab">
      <div className="panel-header">
        <h2>Calendar</h2>
        <p className="panel-subtitle">Full month view with tasks shown on each day.</p>
      </div>

      <div className="calendar-wrapper">
        <Calendar
          value={selectedDate}
          onChange={(date) => setSelectedDate(Array.isArray(date) ? date[0] : date)}
          onClickDay={(date) => setSelectedDate(date)}
          tileContent={({ date, view }) => {
            if (view !== 'month') return null
            const iso = date.toISOString().slice(0, 10)
            const tasksForDay = tasksByDate.get(iso) || []
            return (
              <div
                className="calendar-day-dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropOnDate(e, date)}
              >
                {tasksForDay.length > 0 && (
                  <span className="calendar-dot">{tasksForDay.length}</span>
                )}
              </div>
            )
          }}
        />
      </div>

      <h3 className="panel-subtitle-heading">Tasks on {selectedISO}</h3>
      <ul className="task-list task-list--compact">
        {tasksOnSelected.length === 0 && (
          <li className="task-empty">No tasks scheduled for this day.</li>
        )}
        {tasksOnSelected.map((task) => (
          <li
            key={task.id}
            className={`task-item ${task.completed ? 'task-item--done' : ''}`}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', task.id)}
            role="listitem"
          >
            <button
              type="button"
              className={`task-checkbox ${task.completed ? 'task-checkbox--checked' : ''}`}
              onClick={() => onToggleTask(task.id)}
              aria-label={task.completed ? `Mark ${task.title} as incomplete` : `Mark ${task.title} as complete`}
            >
              {task.completed && <span aria-hidden="true">✓</span>}
            </button>
            <div className="task-main">
              <div className="task-title-row">
                <span className="task-title">{task.title}</span>
                <span className={`pill pill--mini pill--priority pill--priority-${task.priority}`} aria-label={`Priority: ${task.priority}`}>
                  {task.priority === 'high'
                    ? 'High'
                    : task.priority === 'low'
                      ? 'Low'
                      : 'Medium'}
                </span>
                <span className={`pill pill--mini pill--${task.category}`} aria-label={`Category: ${task.category}`}>
                  {task.category === 'work'
                    ? 'Work'
                    : task.category === 'personal'
                      ? 'Personal'
                      : 'Wishlist'}
                </span>
              </div>
              <div className="task-meta">
                {task.endTime && <span>End time: {task.endTime}</span>}
                {task.reminder && <span>Reminder: {formatReminder(task.reminder)}</span>}
              </div>
              {task.notes && <p className="task-notes">{task.notes}</p>}
            </div>
            <div className="task-actions">
              <button
                type="button"
                className="btn-icon"
                onClick={() => onDeleteTask(task.id)}
                aria-label={`Delete task: ${task.title}`}
                title="Delete task"
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ProfileView({ tasks, today }) {
  const completedCount = tasks.filter((t) => t.completed).length
  const pendingCount = tasks.length - completedCount

  const tasksNext7Days = tasks.filter((t) => {
    if (!t.startDate && !t.endDate) return false
    const baseDate = new Date(t.startDate || t.endDate)
    const diffMs = baseDate - startOfDay(today)
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    return diffDays >= 0 && diffDays <= 7
  })

  const categoryPending = CATEGORIES.filter((c) => c !== 'all').map((cat) => ({
    category: cat,
    count: tasks.filter((t) => !t.completed && t.category === cat).length,
  }))

  const dailyStats = buildDailyStats(tasks, today)
  const completionRateToday =
    dailyStats.today.total === 0
      ? 0
      : Math.round((dailyStats.today.completed / dailyStats.today.total) * 100)

  return (
    <section className="panel" role="tabpanel" id="profile-panel" aria-labelledby="profile-tab">
      <div className="panel-header profile-header">
        <div>
          <h2>Profile</h2>
          <p className="panel-subtitle">Your productivity snapshot.</p>
        </div>
        <div className="avatar" aria-label="User avatar">
          <span>U</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Completed tasks</span>
          <span className="stat-value">{completedCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending tasks</span>
          <span className="stat-value">{pendingCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Today completion</span>
          <span className="stat-value">{completionRateToday}%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Next 7 days</span>
          <span className="stat-value">{tasksNext7Days.length}</span>
        </div>
      </div>

      <div className="panel-section">
        <div className="section-header">
          <h3>Daily completion</h3>
          <span className="section-caption">Last 7 days</span>
        </div>
        <div className="mini-graph">
          {dailyStats.series.map((day) => (
            <div key={day.label} className="mini-graph-bar">
              <div
                className="mini-graph-bar-fill"
                style={{ height: `${day.rate}%` }}
                title={`${day.label}: ${day.completed}/${day.total}`}
              />
              <span className="mini-graph-label">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <div className="section-header">
          <h3>Pending by category</h3>
        </div>
        <ul className="category-list">
          {categoryPending.map((c) => (
            <li key={c.category} className="category-item">
              <span className={`pill pill--mini pill--${c.category}`}>
                {c.category === 'work'
                  ? 'Work'
                  : c.category === 'personal'
                    ? 'Personal'
                    : 'Wishlist'}
              </span>
              <span className="category-count">{c.count} pending</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel-section">
        <div className="section-header">
          <h3>Tasks in next 7 days</h3>
        </div>
        <ul className="task-list task-list--compact">
          {tasksNext7Days.length === 0 && (
            <li className="task-empty">No upcoming tasks in the next 7 days.</li>
          )}
          {tasksNext7Days.map((task) => (
            <li key={task.id} className="task-item">
              <div className="task-main">
                <div className="task-title-row">
                  <span className="task-title">{task.title}</span>
                  <span className={`pill pill--mini pill--priority pill--priority-${task.priority}`}>
                    {task.priority === 'high'
                      ? 'High'
                      : task.priority === 'low'
                        ? 'Low'
                        : 'Medium'}
                  </span>
                  <span className={`pill pill--mini pill--${task.category}`}>
                    {task.category === 'work'
                      ? 'Work'
                      : task.category === 'personal'
                        ? 'Personal'
                        : 'Wishlist'}
                  </span>
                </div>
                <div className="task-meta">
                  {(task.startDate || task.endDate) && (
                    <span>
                      {task.startDate || '—'} → {task.endDate || '—'}
                    </span>
                  )}
                  {task.endTime && <span>End time: {task.endTime}</span>}
                  {task.reminder && <span>Reminder: {formatReminder(task.reminder)}</span>}
                </div>
                {task.notes && <p className="task-notes">{task.notes}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function startOfDay(d) {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function buildDailyStats(tasks, today) {
  const days = []
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const key = date.toISOString().slice(0, 10)
    days.push({ key, date })
  }

  const byDay = new Map()
  for (const { key } of days) {
    byDay.set(key, { total: 0, completed: 0 })
  }

  tasks.forEach((task) => {
    const dateKey = task.startDate || task.endDate
    if (!dateKey || !byDay.has(dateKey)) return
    const bucket = byDay.get(dateKey)
    bucket.total += 1
    if (task.completed) bucket.completed += 1
  })

  const series = days.map(({ key, date }) => {
    const bucket = byDay.get(key)
    const rate = bucket.total === 0 ? 0 : Math.round((bucket.completed / bucket.total) * 100)
    return {
      label: date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2),
      total: bucket.total,
      completed: bucket.completed,
      rate,
    }
  })

  const todayKey = today.toISOString().slice(0, 10)
  const todayBucket = byDay.get(todayKey) || { total: 0, completed: 0 }

  return {
    today: todayBucket,
    series,
  }
}

function formatReminder(reminder) {
  try {
    const d = new Date(reminder)
    if (Number.isNaN(d.getTime())) return reminder
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return reminder
  }
}

export default App
