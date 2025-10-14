// --- STATE ---
let todos = [];
let todoIdToDelete = null;

// --- DOM ELEMENT REFERENCES ---
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input-field');
const todoListContainer = document.getElementById('todo-list-container');
const currentDateEl = document.getElementById('current-date');
const currentTimeEl = document.getElementById('current-time');
const clearCompletedBtn = document.getElementById('clear-completed-btn');

// Deletion Dialog
const confirmationDialog = document.getElementById('confirmation-dialog');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

// Help Dialog
const helpBtn = document.getElementById('help-btn');
const helpDialog = document.getElementById('help-dialog');
const helpForm = document.getElementById('help-form');
const helpTextarea = document.getElementById('help-textarea');
const cancelHelpBtn = document.getElementById('cancel-help-btn');
const sendReportBtn = document.getElementById('send-report-btn');
const helpSuccessMessage = document.getElementById('help-success-message');


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
  todoListContainer.innerHTML = '';

  if (todos.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-todo-list';
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


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newText = todoInput.value;
    if (newText.trim()) {
      addTodo(newText);
      todoInput.value = '';
    }
  });

  clearCompletedBtn.addEventListener('click', clearCompletedTodos);

  // Deletion Dialog listeners
  cancelDeleteBtn.addEventListener('click', hideConfirmationDialog);

  confirmationDialog.addEventListener('click', (e) => {
    if (e.target === confirmationDialog) {
      hideConfirmationDialog();
    }
  });
  
  confirmDeleteBtn.addEventListener('click', () => {
    if (todoIdToDelete) {
      const idToDelete = todoIdToDelete; // Capture ID before it's cleared
      const todoElement = document.querySelector(`.todo-item[data-id="${idToDelete}"]`);
      
      hideConfirmationDialog();

      if (todoElement) {
        todoElement.classList.add('animate-fade-out');
        setTimeout(() => {
          deleteTodo(idToDelete);
        }, 300); // Wait for animation
      } else {
        deleteTodo(idToDelete);
      }
    }
  });

  // Help Dialog listeners
  helpBtn.addEventListener('click', showHelpDialog);
  cancelHelpBtn.addEventListener('click', hideHelpDialog);
  helpDialog.addEventListener('click', (e) => {
    if (e.target === helpDialog) {
      hideHelpDialog();
    }
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

      setTimeout(hideHelpDialog, 3000); // Auto-close after 3 seconds
    }
  });

  // Initialize and update date/time every second
  updateDateTime();
  setInterval(updateDateTime, 1000);

  loadTodos();
  renderTodos();
});
