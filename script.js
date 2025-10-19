// --- STATE ---
let todos = [];
let todoIdToDelete = null;

// --- DOM ELEMENT REFERENCES (will be assigned after layout is rendered) ---
let todoForm, todoInput, todoListContainer, currentDateEl, currentTimeEl, clearCompletedBtn;
let confirmationDialog, confirmDeleteBtn, cancelDeleteBtn;
let helpBtn, helpDialog, helpForm, helpTextarea, cancelHelpBtn, sendReportBtn, helpSuccessMessage;

// --- RENDER APP LAYOUT ---
const renderAppLayout = () => {
  const root = document.getElementById('root');
  if (!root) {
    console.error('Root element #root not found!');
    return;
  }
  root.innerHTML = `
    <div class="background-animation">
      <div class="blob blob1"></div>
      <div class="blob blob2"></div>
      <div class="blob blob3"></div>
    </div>
    <div class="app-container">
      
      <!-- Date and Time Display -->
      <div class="date-time-container" data-aos="fade-down">
        <div id="current-date"></div>
        <div id="current-time"></div>
      </div>

      <div class="todo-app-card" data-aos="fade-up">
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
          <button
            type="submit"
            class="add-todo-button"
            aria-label="Add new task"
          >
            <i class="fa-solid fa-plus"></i>
          </button>
        </form>

        <!-- Actions Toolbar -->
        <div class="actions-toolbar">
           <button id="clear-completed-btn" class="clear-completed-button" style="display: none;" aria-label="Clear all completed tasks">
            <i class="fa-solid fa-trash-can-arrow-up"></i>
            <span class="clear-button-text">Clear Completed</span>
          </button>
        </div>
        
        <!-- Todo List gets rendered here -->
        <div id="todo-list-container"></div>

      </div>
       <footer class="footer" data-aos="fade-up" data-aos-delay="200">
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
  `;
};

// --- DATA & STATE MANAGEMENT ---
const saveTodos = () => {
  localStorage.setItem('todos', JSON.stringify(todos));
};

const loadTodos = () => {
  try {
    const savedTodos = localStorage.getItem('todos');
    todos = savedTodos ? JSON.parse(savedTodos) : [];
  } catch (error) {
    console.error("Failed to parse todos from localStorage", error);
    todos = [];
  }
};

const addTodo = (text) => {
  const newTodo = {
    id: crypto.randomUUID(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  todos.unshift(newTodo); // Add to the beginning of the array
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

const editTodo = (id, newText) => {
  const todo = todos.find(t => t.id === id);
  if (todo && newText.trim()) {
    todo.text = newText.trim();
    saveTodos();
    renderTodos();
  } else {
    // If new text is empty, just re-render to cancel edit
    renderTodos();
  }
};

const clearCompletedTodos = () => {
  const completedItems = document.querySelectorAll('.toggle-button--completed');

  if (completedItems.length === 0) return;

  completedItems.forEach(button => {
    const li = button.closest('.todo-item');
    if (li) {
      li.classList.add('animate-erase-out');
    }
  });

  // Wait for animation to finish before updating state and re-rendering
  setTimeout(() => {
    todos = todos.filter(t => !t.completed);
    saveTodos();
    renderTodos();
  }, 400); // Match CSS animation duration
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
  // Use a timeout to reset the form after the fade-out animation completes
  setTimeout(() => {
    helpSuccessMessage.style.display = 'none';
    helpTextarea.style.display = 'block';
    helpForm.querySelector('.dialog-message').style.display = 'block';
    sendReportBtn.style.display = 'inline-flex';
    cancelHelpBtn.querySelector('.dialog-button-text').textContent = 'Cancel';
    helpTextarea.value = '';
    sendReportBtn.disabled = true;
  }, 200); // Match CSS transition duration
};


// --- RENDERING & DOM MANIPULATION ---

/**
 * Creates and returns the DOM element for a single todo item.
 * @param {object} todo - The todo object.
 * @returns {HTMLLIElement} The list item element.
 */
const createTodoItemElement = (todo) => {
  const li = document.createElement('li');
  li.className = 'todo-item';
  li.dataset.id = todo.id;
  li.setAttribute('data-aos', 'fade-left');
  li.setAttribute('data-aos-delay', '50');
  li.setAttribute('data-aos-anchor', '.todo-list');

  const toggleButton = document.createElement('button');
  toggleButton.className = `toggle-button ${todo.completed ? 'toggle-button--completed' : ''}`;
  toggleButton.setAttribute('aria-label', todo.completed ? 'Mark as incomplete' : 'Mark as complete');
  toggleButton.innerHTML = `<i class="toggle-check-icon fa-solid fa-check ${todo.completed ? 'animate-checkmark-pop' : ''}"></i>`;
  toggleButton.addEventListener('click', () => toggleTodo(todo.id));
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'todo-content';

  const todoText = document.createElement('p');
  todoText.className = `todo-text ${todo.completed ? 'todo-text--completed' : ''}`;
  todoText.textContent = todo.text;
  
  const metaDiv = document.createElement('div');
  metaDiv.className = 'todo-meta';

  const formattedDate = new Date(todo.createdAt).toLocaleString('en-US', {
    year: '2-digit', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
  const dateDiv = document.createElement('div');
  dateDiv.className = 'todo-date';
  dateDiv.innerHTML = `<i class="fa-regular fa-clock"></i><span>${formattedDate}</span>`;
  metaDiv.appendChild(dateDiv);
  
  contentDiv.appendChild(todoText);
  contentDiv.appendChild(metaDiv);
  
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'actions';

  const switchToEditMode = () => {
    li.classList.add('todo-item--editing');
    const input = document.createElement('input');
    input.type = 'text';
    input.value = todo.text;
    input.className = 'edit-input';
    
    const saveEdit = () => {
      li.classList.remove('todo-item--editing');
      editTodo(todo.id, input.value);
    }
    
    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveEdit();
      else if (e.key === 'Escape') {
        li.classList.remove('todo-item--editing');
        renderTodos();
      }
    });

    contentDiv.replaceChild(input, todoText);
    input.focus();
  };
  
  // Only add edit functionality if the todo is NOT completed
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
  deleteButton.addEventListener('click', () => {
    showConfirmationDialog(todo.id);
  });
  
  actionsDiv.appendChild(deleteButton);
  
  li.appendChild(toggleButton);
  li.appendChild(contentDiv);
  li.appendChild(actionsDiv);
  
  return li;
};


/**
 * Renders the entire list of todos or an empty state message.
 */
const renderTodos = () => {
  if (!todoListContainer) return;
  todoListContainer.innerHTML = '';

  if (todos.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-todo-list';
    emptyState.setAttribute('data-aos', 'zoom-in');
    emptyState.innerHTML = `
      <i class="fa-solid fa-clipboard-check"></i>
      <p class="font-semibold">All tasks completed!</p>
      <p>Add a new task to get started.</p>
    `;
    todoListContainer.appendChild(emptyState);
  } else {
    const ul = document.createElement('ul');
    ul.className = 'todo-list';

    todos.forEach(todo => {
      const todoElement = createTodoItemElement(todo);
      ul.appendChild(todoElement);
    });
    todoListContainer.appendChild(ul);
  }

  // Show/hide clear completed button
  const hasCompleted = todos.some(t => t.completed);
  clearCompletedBtn.style.display = hasCompleted ? 'flex' : 'none';

  // Refresh AOS to detect new elements
  AOS.refresh();
};

/**
 * Updates the date and time display.
 */
const updateDateTime = () => {
    if (!currentDateEl || !currentTimeEl) return;

    const now = new Date();
    
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.innerHTML = `<i class="fa-solid fa-calendar-day"></i> ${now.toLocaleDateString('en-US', dateOptions)}`;

    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    currentTimeEl.innerHTML = `<i class="fa-regular fa-clock"></i> ${now.toLocaleTimeString('en-US', timeOptions)}`;
};

/**
 * Attaches all the application's event listeners.
 */
const attachEventListeners = () => {
  const originalPlaceholder = todoInput.placeholder;

  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newText = todoInput.value.trim();
    if (newText) {
      addTodo(newText);
      todoInput.value = '';
      todoInput.classList.remove('todo-input--error');
      todoInput.placeholder = originalPlaceholder;
    } else {
      todoInput.value = ''; // Clear out any whitespace
      todoInput.classList.add('todo-input--error', 'animate-shake');
      todoInput.placeholder = "Oops! A task can't be empty.";

      todoInput.addEventListener('animationend', () => {
        todoInput.classList.remove('animate-shake');
      }, { once: true });
    }
  });

  todoInput.addEventListener('input', () => {
    if(todoInput.classList.contains('todo-input--error')) {
        todoInput.classList.remove('todo-input--error');
        todoInput.placeholder = originalPlaceholder;
    }
  });

  clearCompletedBtn.addEventListener('click', clearCompletedTodos);

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
    const reportText = helpTextarea.value.trim();
    if (reportText.length >= 10) {
      console.log("--- USER ISSUE REPORT ---");
      console.log(reportText);
      console.log("-------------------------");

      helpTextarea.style.display = 'none';
      sendReportBtn.style.display = 'none';
      helpForm.querySelector('.dialog-message').style.display = 'none';
      helpSuccessMessage.style.display = 'flex';
      cancelHelpBtn.querySelector('.dialog-button-text').textContent = 'Close';

      setTimeout(hideHelpDialog, 3000);
    }
  });
};

// --- INITIALIZATION ---
const initializeApp = () => {
  // 1. Render the main HTML structure
  renderAppLayout();

  // 2. Get references to all DOM elements now that they exist
  todoForm = document.getElementById('todo-form');
  todoInput = document.getElementById('todo-input-field');
  todoListContainer = document.getElementById('todo-list-container');
  currentDateEl = document.getElementById('current-date');
  currentTimeEl = document.getElementById('current-time');
  clearCompletedBtn = document.getElementById('clear-completed-btn');
  confirmationDialog = document.getElementById('confirmation-dialog');
  confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  cancelDeleteBtn = document.getElementById('cancel-delete-btn');
  helpBtn = document.getElementById('help-btn');
  helpDialog = document.getElementById('help-dialog');
  helpForm = document.getElementById('help-form');
  helpTextarea = document.getElementById('help-textarea');
  cancelHelpBtn = document.getElementById('cancel-help-btn');
  sendReportBtn = document.getElementById('send-report-btn');
  helpSuccessMessage = document.getElementById('help-success-message');

  // 3. Initialize AOS library
  AOS.init({
    duration: 600,
    once: true,
    offset: 20,
  });

  // 4. Attach all event listeners
  attachEventListeners();

  // 5. Start recurring tasks and load initial data
  updateDateTime();
  setInterval(updateDateTime, 1000);

  loadTodos();
  renderTodos();
};

document.addEventListener('DOMContentLoaded', initializeApp);
