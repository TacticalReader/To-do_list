// --- CONSTANTS ---
const CONSTANTS = {
  MIN_REPORT_LENGTH: 10,
  ANIMATION_DURATIONS: {
    ERASE_OUT: 400,
    FADE_OUT: 300,
    DIALOG_TRANSITION: 200,
    SUCCESS_MESSAGE_DISPLAY: 3000,
  }
};

// --- STATE ---
let todos = [];
let todoIdToDelete = null;

// --- DOM ELEMENT REFERENCES ---
const DOM = {};

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
  }, CONSTANTS.ANIMATION_DURATIONS.ERASE_OUT); // Match CSS animation duration
};

// --- DIALOGS ---
const showConfirmationDialog = (id) => {
  todoIdToDelete = id;
  DOM.confirmationDialog.classList.add('dialog-overlay--visible');
};

const hideConfirmationDialog = () => {
  todoIdToDelete = null;
  DOM.confirmationDialog.classList.remove('dialog-overlay--visible');
};

const showHelpDialog = () => {
  DOM.helpDialog.classList.add('dialog-overlay--visible');
  DOM.helpTextarea.focus();
  DOM.sendReportBtn.disabled = DOM.helpTextarea.value.trim().length < CONSTANTS.MIN_REPORT_LENGTH;
};

const hideHelpDialog = () => {
  DOM.helpDialog.classList.remove('dialog-overlay--visible');
  // Use a timeout to reset the form after the fade-out animation completes
  setTimeout(() => {
    DOM.helpSuccessMessage.style.display = 'none';
    DOM.helpTextarea.style.display = 'block';
    DOM.helpForm.querySelector('.dialog-message').style.display = 'block';
    DOM.sendReportBtn.style.display = 'inline-flex';
    DOM.cancelHelpBtn.querySelector('.dialog-button-text').textContent = 'Cancel';
    DOM.helpTextarea.value = '';
    DOM.sendReportBtn.disabled = true;
  }, CONSTANTS.ANIMATION_DURATIONS.DIALOG_TRANSITION); // Match CSS transition duration
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
  if (!DOM.todoListContainer) return;
  DOM.todoListContainer.innerHTML = '';

  if (todos.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-todo-list';
    emptyState.setAttribute('data-aos', 'zoom-in');
    emptyState.innerHTML = `
      <i class="fa-solid fa-clipboard-check"></i>
      <p class="font-semibold">All tasks completed!</p>
      <p>Add a new task to get started.</p>
    `;
    DOM.todoListContainer.appendChild(emptyState);
  } else {
    const ul = document.createElement('ul');
    ul.className = 'todo-list';

    todos.forEach(todo => {
      const todoElement = createTodoItemElement(todo);
      ul.appendChild(todoElement);
    });
    DOM.todoListContainer.appendChild(ul);
  }

  // Show/hide clear completed button
  const hasCompleted = todos.some(t => t.completed);
  DOM.clearCompletedBtn.style.display = hasCompleted ? 'flex' : 'none';

  // Refresh AOS to detect new elements
  AOS.refresh();
};

/**
 * Updates the date and time display.
 */
const updateDateTime = () => {
    if (!DOM.currentDateEl || !DOM.currentTimeEl) return;

    const now = new Date();
    
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    DOM.currentDateEl.innerHTML = `<i class="fa-solid fa-calendar-day"></i> ${now.toLocaleDateString('en-US', dateOptions)}`;

    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    DOM.currentTimeEl.innerHTML = `<i class="fa-regular fa-clock"></i> ${now.toLocaleTimeString('en-US', timeOptions)}`;
};

/**
 * Attaches all the application's event listeners.
 */
const attachEventListeners = () => {
  const originalPlaceholder = DOM.todoInput.placeholder;

  DOM.todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newText = DOM.todoInput.value.trim();
    if (newText) {
      addTodo(newText);
      DOM.todoInput.value = '';
      DOM.todoInput.classList.remove('todo-input--error');
      DOM.todoInput.placeholder = originalPlaceholder;
    } else {
      DOM.todoInput.value = ''; // Clear out any whitespace
      DOM.todoInput.classList.add('todo-input--error', 'animate-shake');
      DOM.todoInput.placeholder = "Oops! A task can't be empty.";

      DOM.todoInput.addEventListener('animationend', () => {
        DOM.todoInput.classList.remove('animate-shake');
      }, { once: true });
    }
  });

  DOM.todoInput.addEventListener('input', () => {
    if(DOM.todoInput.classList.contains('todo-input--error')) {
        DOM.todoInput.classList.remove('todo-input--error');
        DOM.todoInput.placeholder = originalPlaceholder;
    }
  });

  DOM.clearCompletedBtn.addEventListener('click', clearCompletedTodos);

  DOM.cancelDeleteBtn.addEventListener('click', hideConfirmationDialog);
  DOM.confirmationDialog.addEventListener('click', (e) => {
    if (e.target === DOM.confirmationDialog) hideConfirmationDialog();
  });
  
  DOM.confirmDeleteBtn.addEventListener('click', () => {
    if (todoIdToDelete) {
      const idToDelete = todoIdToDelete;
      const todoElement = document.querySelector(`.todo-item[data-id="${idToDelete}"]`);
      
      hideConfirmationDialog();

      if (todoElement) {
        todoElement.classList.add('animate-fade-out');
        setTimeout(() => deleteTodo(idToDelete), CONSTANTS.ANIMATION_DURATIONS.FADE_OUT);
      } else {
        deleteTodo(idToDelete);
      }
    }
  });

  DOM.helpBtn.addEventListener('click', showHelpDialog);
  DOM.cancelHelpBtn.addEventListener('click', hideHelpDialog);
  DOM.helpDialog.addEventListener('click', (e) => {
    if (e.target === DOM.helpDialog) hideHelpDialog();
  });

  DOM.helpTextarea.addEventListener('input', () => {
    DOM.sendReportBtn.disabled = DOM.helpTextarea.value.trim().length < CONSTANTS.MIN_REPORT_LENGTH;
  });

  DOM.helpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const reportText = DOM.helpTextarea.value.trim();
    if (reportText.length >= CONSTANTS.MIN_REPORT_LENGTH) {
      console.log("--- USER ISSUE REPORT ---");
      console.log(reportText);
      console.log("-------------------------");

      DOM.helpTextarea.style.display = 'none';
      DOM.sendReportBtn.style.display = 'none';
      DOM.helpForm.querySelector('.dialog-message').style.display = 'none';
      DOM.helpSuccessMessage.style.display = 'flex';
      DOM.cancelHelpBtn.querySelector('.dialog-button-text').textContent = 'Close';

      setTimeout(hideHelpDialog, CONSTANTS.ANIMATION_DURATIONS.SUCCESS_MESSAGE_DISPLAY);
    }
  });
};

// --- INITIALIZATION ---
const initializeApp = () => {
  // 1. Get references to all DOM elements
  DOM.todoForm = document.getElementById('todo-form');
  DOM.todoInput = document.getElementById('todo-input-field');
  DOM.todoListContainer = document.getElementById('todo-list-container');
  DOM.currentDateEl = document.getElementById('current-date');
  DOM.currentTimeEl = document.getElementById('current-time');
  DOM.clearCompletedBtn = document.getElementById('clear-completed-btn');
  DOM.confirmationDialog = document.getElementById('confirmation-dialog');
  DOM.confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  DOM.cancelDeleteBtn = document.getElementById('cancel-delete-btn');
  DOM.helpBtn = document.getElementById('help-btn');
  DOM.helpDialog = document.getElementById('help-dialog');
  DOM.helpForm = document.getElementById('help-form');
  DOM.helpTextarea = document.getElementById('help-textarea');
  DOM.cancelHelpBtn = document.getElementById('cancel-help-btn');
  DOM.sendReportBtn = document.getElementById('send-report-btn');
  DOM.helpSuccessMessage = document.getElementById('help-success-message');

  // 2. Initialize AOS library
  AOS.init({
    duration: 600,
    once: true,
    offset: 20,
  });

  // 3. Attach all event listeners
  attachEventListeners();

  // 4. Start recurring tasks and load initial data
  updateDateTime();
  setInterval(updateDateTime, 1000);

  loadTodos();
  renderTodos();
};

document.addEventListener('DOMContentLoaded', initializeApp);
