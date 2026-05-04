// --- STATE ---
let todos = [];
let todoIdToDelete = null;
let clearCompletedTimeout = null;
let sortMode = 'default';
let filterMode = 'all';

// --- DOM ELEMENT REFERENCES ---
let todoForm, todoInput, todoDueDateInput, todoListContainer;
let currentDateEl, currentTimeEl;
let clearCompletedBtn, cancelClearBtn;
let confirmationDialog, confirmDeleteBtn, cancelDeleteBtn;
let helpBtn, helpDialog, helpForm, helpTextarea, cancelHelpBtn, sendReportBtn, helpSuccessMessage;
let toastNotification, toastMessage;
let sortSelect, filterTabsContainer, taskSummaryEl;

// --- HTML STRUCTURE ---
const createAppLayout = () => {
  document.body.innerHTML = `
    <div class="background-animation">
      <div class="blob blob1"></div>
      <div class="blob blob2"></div>
      <div class="blob blob3"></div>
    </div>
    <div class="app-container">

      <!-- Date and Time Display -->
      <div class="date-time-container">
        <div id="current-date"></div>
        <div id="current-time"></div>
      </div>

      <div class="todo-app-card">
        <!-- Header -->
        <div class="header">
          <div class="header-text-content">
            <h1 class="header-title">
              <i class="fa-solid fa-list-check header-icon"></i>
              Todo List
            </h1>
            <p class="header-subtitle">Stay organized, one task at a time.</p>
          </div>
        </div>

        <!-- Todo Input Form -->
        <form id="todo-form" class="todo-input-form">
          <input
            type="text"
            id="todo-input-field"
            placeholder="Add a new task..."
            class="todo-input"
            autocomplete="off"
            aria-label="New task input"
          />
          <div class="due-date-wrap" title="Set an optional due date">
            <i class="fa-regular fa-calendar-plus due-date-icon"></i>
            <input
              type="date"
              id="todo-due-date"
              class="due-date-field"
              aria-label="Optional due date for new task"
            />
          </div>
          <button type="submit" class="add-todo-button" aria-label="Add new task">
            <i class="fa-solid fa-plus"></i>
          </button>
        </form>

        <!-- Actions Toolbar -->
        <div class="actions-toolbar">
          <button id="cancel-clear-btn" class="cancel-clear-button" style="display: none;" aria-label="Cancel clearing completed tasks">
            <i class="fa-solid fa-xmark"></i>
            <span class="clear-button-text">Cancel</span>
          </button>
          <button id="clear-completed-btn" class="clear-completed-button" style="display: none;" aria-label="Clear all completed tasks">
            <i class="fa-solid fa-trash-can-arrow-up"></i>
            <span class="clear-button-text">Clear Completed</span>
          </button>
        </div>

        <!-- Sort & Filter Bar -->
        <div class="sort-filter-bar">
          <div class="filter-tabs" id="filter-tabs">
            <button class="filter-tab filter-tab--active" data-filter="all">All</button>
            <button class="filter-tab" data-filter="active">Active</button>
            <button class="filter-tab" data-filter="completed">Done</button>
            <button class="filter-tab" data-filter="overdue" id="overdue-tab">
              Overdue
            </button>
          </div>
          <select id="sort-select" class="sort-select" aria-label="Sort tasks">
            <option value="default">Newest</option>
            <option value="due-asc">Due ↑</option>
            <option value="due-desc">Due ↓</option>
          </select>
        </div>

        <!-- Task Summary -->
        <div id="task-summary" class="task-summary"></div>

        <!-- Todo List -->
        <div id="todo-list-container"></div>
      </div>

      <footer class="footer">
        <div class="footer-content">
          <div class="credit-box">
            <p class="credit-text"><i class="fa-solid fa-laptop-code"></i> Programmed & Designed by <span class="credit-name">Tanmay Srivastava</span></p>
            <a href="https://github.com/TacticalReader" target="_blank" rel="noopener noreferrer" class="github-link">
              <i class="fa-brands fa-github"></i>
              <span>TacticalReader</span>
            </a>
          </div>
          <button id="help-btn" class="help-button" aria-label="Get help or report an issue">
            <i class="fa-solid fa-question-circle"></i>
            <span>Help</span>
          </button>
        </div>
      </footer>
    </div>

    <!-- Confirmation Dialog -->
    <div id="confirmation-dialog" class="dialog-overlay">
      <div class="dialog-box" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-message">
        <h3 id="dialog-title" class="dialog-title">
          <i class="fa-solid fa-triangle-exclamation"></i>
          Confirm Deletion
        </h3>
        <p id="dialog-message" class="dialog-message">Are you sure you want to permanently delete this task?</p>
        <div class="dialog-actions">
          <button id="cancel-delete-btn" class="dialog-button dialog-button--cancel">
            <i class="fa-solid fa-xmark"></i>
            <span class="dialog-button-text">Cancel</span>
          </button>
          <button id="confirm-delete-btn" class="dialog-button dialog-button--confirm">
            <i class="fa-solid fa-trash-can"></i>
            <span class="dialog-button-text">Delete</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Help/Report Dialog -->
    <div id="help-dialog" class="dialog-overlay">
      <div class="dialog-box" role="dialog" aria-modal="true" aria-labelledby="help-dialog-title">
        <form id="help-form">
          <h3 id="help-dialog-title" class="dialog-title">
            <i class="fa-solid fa-life-ring"></i>
            Report an Issue
          </h3>
          <p class="dialog-message">
            Having trouble? Describe the issue you're facing, and we'll look into it.
          </p>
          <textarea id="help-textarea" class="help-textarea" placeholder="Please describe the problem in detail (minimum 10 characters)..." required minlength="10" rows="4"></textarea>
          <div id="help-success-message" class="dialog-success-message" style="display: none;">
            <i class="fa-solid fa-check-circle"></i>
            Thank you! Your report has been sent.
          </div>
          <div class="dialog-actions">
            <button id="cancel-help-btn" type="button" class="dialog-button dialog-button--cancel">
              <i class="fa-solid fa-xmark"></i>
              <span class="dialog-button-text">Cancel</span>
            </button>
            <button id="send-report-btn" type="submit" class="dialog-button dialog-button--submit" disabled>
              <i class="fa-solid fa-paper-plane"></i>
              <span class="dialog-button-text">Send Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast Notification -->
    <div id="toast-notification" class="toast-notification">
      <i class="fa-solid fa-circle-info"></i>
      <span id="toast-message"></span>
    </div>
  `;
};


// --- DUE DATE HELPERS ---

/**
 * Returns parsed due date info: label, type (overdue/today/soon/future), and icon class.
 * @param {string|null} dueDate - ISO date string (YYYY-MM-DD) or null.
 */
const getDueDateInfo = (dueDate) => {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Use T00:00:00 to avoid timezone shifts
  const due = new Date(dueDate + 'T00:00:00');
  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return {
    label: Math.abs(diffDays) === 1 ? '1 day overdue' : `${Math.abs(diffDays)}d overdue`,
    type: 'overdue',
    icon: 'fa-solid fa-circle-exclamation'
  };
  if (diffDays === 0) return {
    label: 'Due today',
    type: 'today',
    icon: 'fa-solid fa-clock'
  };
  if (diffDays === 1) return {
    label: 'Due tomorrow',
    type: 'soon',
    icon: 'fa-solid fa-hourglass-half'
  };
  if (diffDays <= 3) return {
    label: `${diffDays} days left`,
    type: 'soon',
    icon: 'fa-solid fa-hourglass-half'
  };
  const formatted = due.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: due.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  });
  return {
    label: formatted,
    type: 'future',
    icon: 'fa-regular fa-calendar'
  };
};

/**
 * Counts overdue (non-completed) tasks.
 */
const countOverdue = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return todos.filter(t => {
    if (!t.dueDate || t.completed) return false;
    return new Date(t.dueDate + 'T00:00:00') < today;
  }).length;
};

/**
 * Returns todos filtered by filterMode and sorted by sortMode.
 */
const getFilteredAndSortedTodos = () => {
  let result = [...todos];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (filterMode) {
    case 'active':
      result = result.filter(t => !t.completed);
      break;
    case 'completed':
      result = result.filter(t => t.completed);
      break;
    case 'overdue':
      result = result.filter(t => {
        if (!t.dueDate || t.completed) return false;
        return new Date(t.dueDate + 'T00:00:00') < today;
      });
      break;
    default:
      break;
  }

  if (sortMode === 'due-asc') {
    result.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  } else if (sortMode === 'due-desc') {
    result.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(b.dueDate) - new Date(a.dueDate);
    });
  }

  return result;
};


// --- DATA & STATE MANAGEMENT ---
const saveTodos = () => {
  localStorage.setItem('todos', JSON.stringify(todos));
};

const loadTodos = () => {
  try {
    const saved = localStorage.getItem('todos');
    todos = saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error('Failed to parse todos from localStorage', err);
    todos = [];
  }
};

const addTodo = (text, dueDate = null) => {
  const newTodo = {
    id: crypto.randomUUID(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
    dueDate: dueDate || null,
  };
  todos.unshift(newTodo);
  saveTodos();
  renderTodos();
};

const toggleTodo = (id) => {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    renderTodos();
  }
};

const deleteTodo = (id) => {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  renderTodos();
};

const editTodo = (id, newText, newDueDate = undefined) => {
  const todo = todos.find(t => t.id === id);
  if (todo && newText.trim()) {
    todo.text = newText.trim();
    if (newDueDate !== undefined) {
      todo.dueDate = newDueDate || null;
    }
    saveTodos();
    renderTodos();
  } else {
    renderTodos();
  }
};

const clearCompletedTodos = () => {
  const completedItems = document.querySelectorAll('.toggle-button--completed');
  if (completedItems.length === 0) return;

  if (clearCompletedTimeout) clearTimeout(clearCompletedTimeout);

  toastMessage.textContent = 'All completed tasks will be removed in 10 seconds.';
  toastNotification.classList.add('toast-notification--visible');

  clearCompletedBtn.disabled = true;
  clearCompletedBtn.style.opacity = '0.5';
  clearCompletedBtn.style.cursor = 'not-allowed';
  cancelClearBtn.style.display = 'flex';

  clearCompletedTimeout = setTimeout(() => {
    toastNotification.classList.remove('toast-notification--visible');
    clearCompletedBtn.disabled = false;
    clearCompletedBtn.style.opacity = '';
    clearCompletedBtn.style.cursor = '';
    cancelClearBtn.style.display = 'none';

    const itemsToRemove = document.querySelectorAll('.toggle-button--completed');
    if (itemsToRemove.length === 0) return;

    itemsToRemove.forEach(btn => {
      const li = btn.closest('.todo-item');
      if (li) li.classList.add('animate-erase-out');
    });

    setTimeout(() => {
      todos = todos.filter(t => !t.completed);
      saveTodos();
      renderTodos();
    }, 400);
  }, 10000);
};

const cancelClearTodos = () => {
  if (clearCompletedTimeout) {
    clearTimeout(clearCompletedTimeout);
    clearCompletedTimeout = null;
  }
  toastNotification.classList.remove('toast-notification--visible');
  clearCompletedBtn.disabled = false;
  clearCompletedBtn.style.opacity = '';
  clearCompletedBtn.style.cursor = '';
  cancelClearBtn.style.display = 'none';
};


// --- DIALOGS ---
const showConfirmationDialog = (id) => {
  todoIdToDelete = id;
  confirmationDialog.classList.add('dialog-overlay--visible');
};

const hideConfirmationDialog = () => {
  todoIdToDelete = null;
  confirmationDialog.classList.remove('dialog-overlay--visible');
};

const showHelpDialog = () => {
  helpDialog.classList.add('dialog-overlay--visible');
  helpTextarea.focus();
  sendReportBtn.disabled = helpTextarea.value.trim().length < 10;
};

const hideHelpDialog = () => {
  helpDialog.classList.remove('dialog-overlay--visible');
  setTimeout(() => {
    helpSuccessMessage.style.display = 'none';
    helpTextarea.style.display = 'block';
    helpForm.querySelector('.dialog-message').style.display = 'block';
    sendReportBtn.style.display = 'inline-flex';
    cancelHelpBtn.querySelector('.dialog-button-text').textContent = 'Cancel';
    helpTextarea.value = '';
    sendReportBtn.disabled = true;
  }, 200);
};


// --- RENDERING ---

/**
 * Updates the overdue-tab badge count.
 */
const updateOverdueTabBadge = () => {
  const overdueTab = document.getElementById('overdue-tab');
  if (!overdueTab) return;
  const count = countOverdue();
  let badge = overdueTab.querySelector('.overdue-count-badge');
  if (count > 0) {
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'overdue-count-badge';
      overdueTab.appendChild(badge);
    }
    badge.textContent = count;
  } else {
    if (badge) badge.remove();
  }
};

/**
 * Updates the task summary line below the filter bar.
 */
const updateTaskSummary = () => {
  if (!taskSummaryEl) return;
  if (todos.length === 0) {
    taskSummaryEl.innerHTML = '';
    return;
  }
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const active = total - completed;
  const overdue = countOverdue();

  const parts = [];
  parts.push(`<span>${total} task${total !== 1 ? 's' : ''}</span>`);
  parts.push(`<span class="summary-dot">·</span><span>${active} active</span>`);
  if (completed > 0) parts.push(`<span class="summary-dot">·</span><span>${completed} done</span>`);
  if (overdue > 0) parts.push(`<span class="summary-dot">·</span><span class="summary-overdue"><i class="fa-solid fa-circle-exclamation"></i> ${overdue} overdue</span>`);

  taskSummaryEl.innerHTML = parts.join('');
};

/**
 * Creates the DOM element for one todo item.
 */
const createTodoItemElement = (todo) => {
  const li = document.createElement('li');
  li.className = 'todo-item';
  li.dataset.id = todo.id;

  // Toggle button
  const toggleButton = document.createElement('button');
  toggleButton.className = `toggle-button ${todo.completed ? 'toggle-button--completed' : ''}`;
  toggleButton.setAttribute('aria-label', todo.completed ? 'Mark as incomplete' : 'Mark as complete');
  toggleButton.innerHTML = `<i class="toggle-check-icon fa-solid fa-check ${todo.completed ? 'animate-checkmark-pop' : ''}"></i>`;
  toggleButton.addEventListener('click', () => toggleTodo(todo.id));

  // Content
  const contentDiv = document.createElement('div');
  contentDiv.className = 'todo-content';

  const todoText = document.createElement('p');
  todoText.className = `todo-text ${todo.completed ? 'todo-text--completed' : ''}`;
  todoText.textContent = todo.text;

  // Meta row (created date + due date badge)
  const metaDiv = document.createElement('div');
  metaDiv.className = 'todo-meta';

  const formattedDate = new Date(todo.createdAt).toLocaleString('en-US', {
    year: '2-digit', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
  const dateDiv = document.createElement('div');
  dateDiv.className = 'todo-date';
  dateDiv.innerHTML = `<i class="fa-regular fa-clock"></i><span>${formattedDate}</span>`;
  metaDiv.appendChild(dateDiv);

  // Due date badge
  const dueDateInfo = getDueDateInfo(todo.dueDate);
  if (dueDateInfo) {
    const badge = document.createElement('div');
    badge.className = `due-badge due-badge--${dueDateInfo.type}`;
    badge.innerHTML = `<i class="${dueDateInfo.icon}"></i><span>${dueDateInfo.label}</span>`;
    // Completed tasks show the due date in a muted style regardless of urgency
    if (todo.completed) badge.className = 'due-badge due-badge--done';
    metaDiv.appendChild(badge);
  }

  contentDiv.appendChild(todoText);
  contentDiv.appendChild(metaDiv);

  // Actions
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'actions';

  // Edit mode switcher
  const switchToEditMode = () => {
    li.classList.add('todo-item--editing');

    const editWrapper = document.createElement('div');
    editWrapper.className = 'edit-wrapper';

    // Text input
    const input = document.createElement('input');
    input.type = 'text';
    input.value = todo.text;
    input.className = 'edit-input';

    // Due date row
    const editDateRow = document.createElement('div');
    editDateRow.className = 'edit-date-row';
    editDateRow.innerHTML = `<i class="fa-regular fa-calendar-plus"></i><span class="edit-date-label">Due date:</span>`;

    const dateEditInput = document.createElement('input');
    dateEditInput.type = 'date';
    dateEditInput.value = todo.dueDate || '';
    dateEditInput.className = 'edit-date-input';

    // Clear date button
    const clearDateBtn = document.createElement('button');
    clearDateBtn.type = 'button';
    clearDateBtn.className = 'clear-date-btn';
    clearDateBtn.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
    clearDateBtn.title = 'Clear due date';
    clearDateBtn.style.display = todo.dueDate ? 'inline-flex' : 'none';
    clearDateBtn.addEventListener('mousedown', (e) => {
      e.preventDefault(); // prevent blur on input
      dateEditInput.value = '';
      clearDateBtn.style.display = 'none';
    });
    dateEditInput.addEventListener('input', () => {
      clearDateBtn.style.display = dateEditInput.value ? 'inline-flex' : 'none';
    });

    editDateRow.appendChild(dateEditInput);
    editDateRow.appendChild(clearDateBtn);
    editWrapper.appendChild(input);
    editWrapper.appendChild(editDateRow);

    const saveEdit = () => {
      li.classList.remove('todo-item--editing');
      editTodo(todo.id, input.value, dateEditInput.value || null);
    };

    const handleBlur = () => {
      requestAnimationFrame(() => {
        if (!li.contains(document.activeElement)) saveEdit();
      });
    };

    input.addEventListener('blur', handleBlur);
    dateEditInput.addEventListener('blur', handleBlur);
    clearDateBtn.addEventListener('blur', handleBlur);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveEdit();
      else if (e.key === 'Escape') {
        li.classList.remove('todo-item--editing');
        renderTodos();
      }
    });

    contentDiv.replaceChild(editWrapper, todoText);
    input.focus();
  };

  if (!todo.completed) {
    todoText.addEventListener('dblclick', switchToEditMode);

    const editButton = document.createElement('button');
    editButton.className = 'action-button edit-button';
    editButton.setAttribute('aria-label', `Edit task: ${todo.text}`);
    editButton.innerHTML = `<i class="fa-solid fa-pencil"></i>`;
    editButton.addEventListener('click', switchToEditMode);
    actionsDiv.appendChild(editButton);
  }

  const deleteButton = document.createElement('button');
  deleteButton.className = 'action-button delete-button';
  deleteButton.setAttribute('aria-label', `Delete task: ${todo.text}`);
  deleteButton.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
  deleteButton.addEventListener('click', () => showConfirmationDialog(todo.id));
  actionsDiv.appendChild(deleteButton);

  li.appendChild(toggleButton);
  li.appendChild(contentDiv);
  li.appendChild(actionsDiv);

  return li;
};

/**
 * Renders the full todo list, applying filters and sort.
 */
const renderTodos = () => {
  todoListContainer.innerHTML = '';

  const filtered = getFilteredAndSortedTodos();

  if (todos.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-todo-list';
    emptyState.innerHTML = `
      <i class="fa-solid fa-clipboard-check"></i>
      <p class="font-semibold">All tasks completed!</p>
      <p>Add a new task to get started.</p>
    `;
    todoListContainer.appendChild(emptyState);
  } else if (filtered.length === 0) {
    const emptyFilter = document.createElement('div');
    emptyFilter.className = 'empty-todo-list';
    const messages = {
      active: { icon: 'fa-solid fa-check-double', title: 'No active tasks!', sub: 'Everything is done.' },
      completed: { icon: 'fa-solid fa-hourglass-half', title: 'Nothing completed yet.', sub: 'Keep going!' },
      overdue: { icon: 'fa-solid fa-party-horn', title: 'No overdue tasks!', sub: "You're all caught up." },
    };
    const m = messages[filterMode] || { icon: 'fa-solid fa-inbox', title: 'No tasks found.', sub: '' };
    emptyFilter.innerHTML = `
      <i class="${m.icon}"></i>
      <p class="font-semibold">${m.title}</p>
      <p>${m.sub}</p>
    `;
    todoListContainer.appendChild(emptyFilter);
  } else {
    const ul = document.createElement('ul');
    ul.className = 'todo-list';
    filtered.forEach(todo => ul.appendChild(createTodoItemElement(todo)));
    todoListContainer.appendChild(ul);
  }

  // Show/hide clear completed button
  const hasCompleted = todos.some(t => t.completed);
  clearCompletedBtn.style.display = hasCompleted ? 'flex' : 'none';
  if (!hasCompleted) cancelClearBtn.style.display = 'none';

  updateOverdueTabBadge();
  updateTaskSummary();
};

/**
 * Updates the date/time display.
 */
const updateDateTime = () => {
  if (!currentDateEl || !currentTimeEl) return;
  const now = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  currentDateEl.innerHTML = `<i class="fa-solid fa-calendar-day"></i> ${now.toLocaleDateString('en-US', dateOptions)}`;
  const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
  currentTimeEl.innerHTML = `<i class="fa-regular fa-clock"></i> ${now.toLocaleTimeString('en-US', timeOptions)}`;
};


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  createAppLayout();

  // Get DOM refs
  todoForm          = document.getElementById('todo-form');
  todoInput         = document.getElementById('todo-input-field');
  todoDueDateInput  = document.getElementById('todo-due-date');
  todoListContainer = document.getElementById('todo-list-container');
  currentDateEl     = document.getElementById('current-date');
  currentTimeEl     = document.getElementById('current-time');
  clearCompletedBtn = document.getElementById('clear-completed-btn');
  cancelClearBtn    = document.getElementById('cancel-clear-btn');
  confirmationDialog = document.getElementById('confirmation-dialog');
  confirmDeleteBtn  = document.getElementById('confirm-delete-btn');
  cancelDeleteBtn   = document.getElementById('cancel-delete-btn');
  helpBtn           = document.getElementById('help-btn');
  helpDialog        = document.getElementById('help-dialog');
  helpForm          = document.getElementById('help-form');
  helpTextarea      = document.getElementById('help-textarea');
  cancelHelpBtn     = document.getElementById('cancel-help-btn');
  sendReportBtn     = document.getElementById('send-report-btn');
  helpSuccessMessage = document.getElementById('help-success-message');
  toastNotification = document.getElementById('toast-notification');
  toastMessage      = document.getElementById('toast-message');
  sortSelect        = document.getElementById('sort-select');
  filterTabsContainer = document.getElementById('filter-tabs');
  taskSummaryEl     = document.getElementById('task-summary');

  // Form submit
  const originalPlaceholder = todoInput.placeholder;
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newText = todoInput.value.trim();
    if (newText) {
      const dueDate = todoDueDateInput.value || null;
      addTodo(newText, dueDate);
      todoInput.value = '';
      todoDueDateInput.value = '';
      todoInput.classList.remove('todo-input--error');
      todoInput.placeholder = originalPlaceholder;
    } else {
      todoInput.value = '';
      todoInput.classList.add('todo-input--error', 'animate-shake');
      todoInput.placeholder = "Oops! A task can't be empty.";
      todoInput.addEventListener('animationend', () => {
        todoInput.classList.remove('animate-shake');
      }, { once: true });
    }
  });

  todoInput.addEventListener('input', () => {
    if (todoInput.classList.contains('todo-input--error')) {
      todoInput.classList.remove('todo-input--error');
      todoInput.placeholder = originalPlaceholder;
    }
  });

  // Clear / Cancel clear
  clearCompletedBtn.addEventListener('click', clearCompletedTodos);
  cancelClearBtn.addEventListener('click', cancelClearTodos);

  // Delete dialog
  cancelDeleteBtn.addEventListener('click', hideConfirmationDialog);
  confirmationDialog.addEventListener('click', (e) => {
    if (e.target === confirmationDialog) hideConfirmationDialog();
  });
  confirmDeleteBtn.addEventListener('click', () => {
    if (todoIdToDelete) {
      const idToDelete = todoIdToDelete;
      const todoElement = document.querySelector(`.todo-item[data-id="${idToDelete}"]`);
      hideConfirmationDialog();
      if (todoElement) {
        todoElement.classList.add('animate-fade-out');
        setTimeout(() => deleteTodo(idToDelete), 300);
      } else {
        deleteTodo(idToDelete);
      }
    }
  });

  // Help dialog
  helpBtn.addEventListener('click', showHelpDialog);
  cancelHelpBtn.addEventListener('click', hideHelpDialog);
  helpDialog.addEventListener('click', (e) => {
    if (e.target === helpDialog) hideHelpDialog();
  });
  helpTextarea.addEventListener('input', () => {
    sendReportBtn.disabled = helpTextarea.value.trim().length < 10;
  });
  helpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (helpTextarea.value.trim().length >= 10) {
      console.log('--- USER ISSUE REPORT ---\n', helpTextarea.value.trim(), '\n--- END ---');
      helpTextarea.style.display = 'none';
      sendReportBtn.style.display = 'none';
      helpForm.querySelector('.dialog-message').style.display = 'none';
      helpSuccessMessage.style.display = 'flex';
      cancelHelpBtn.querySelector('.dialog-button-text').textContent = 'Close';
      setTimeout(hideHelpDialog, 3000);
    }
  });

  // Sort select
  sortSelect.addEventListener('change', () => {
    sortMode = sortSelect.value;
    renderTodos();
  });

  // Filter tabs
  filterTabsContainer.addEventListener('click', (e) => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    filterTabsContainer.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('filter-tab--active'));
    tab.classList.add('filter-tab--active');
    filterMode = tab.dataset.filter;
    renderTodos();
  });

  // Date/time tick
  updateDateTime();
  setInterval(updateDateTime, 1000);

  // Load data
  loadTodos();
  renderTodos();
});
