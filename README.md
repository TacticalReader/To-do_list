# ✨ JS Todo List ✨

A modern, visually appealing, and feature-rich to-do list application built with pure HTML, CSS, and JavaScript. This project focuses on a clean user interface, smooth animations, and a great user experience to make task management simple and elegant.

---

## 🚀 Features

- **Full CRUD Functionality**: Add, edit, and delete your tasks with ease.
- **Due Dates & Urgency Indicators**: Assign optional due dates to tasks. Visual badges dynamically update to show if a task is overdue, due today, due soon, or in the future.
- **Advanced Sorting & Filtering**: Easily manage your workflow by filtering tasks (All, Active, Done, Overdue) and sorting them (Newest, Due Date Ascending, Due Date Descending).
- **Task Summary & Badges**: Get a quick glance at your progress with a real-time task summary (total, active, done, overdue). The Overdue tab features a pulsing badge to keep you alert.
- **Undo/Cancel Clear Completed**: Clearing completed tasks now triggers a 10-second toast notification, giving you a chance to cancel the action before permanent deletion.
- **Enhanced Edit Mode**: Inline editing allows you to update both the task description and its due date seamlessly.
- **Task Completion**: Mark tasks as complete or incomplete with a satisfying checkmark animation.
- **Persistent Storage**: All your tasks are automatically saved to your browser's Local Storage, so you never lose your progress.
- **Responsive Design**: A clean and adaptive layout that looks great on desktops, tablets, and mobile devices.
- **Confirmation Dialogs**: Prevents accidental task deletion with a confirmation pop-up.
- **Dynamic UI**:
    - Real-time date and time display.
    - Context-aware empty state messages depending on the active filter.
    - The "Clear Completed" button only appears when there are completed tasks.
- **User Feedback & Help**:
    - Visual feedback (highlighting) when editing a task.
    - A "Help" button that opens a dialog for users to report issues directly.
- **Stunning Aesthetics**:
    - A beautiful, animated floating blob background.
    - A modern card-based design with subtle shadows and hover effects.
    - Smooth, CSS-based animations for adding, completing, and deleting tasks.
    - Integrated [Font Awesome](https://fontawesome.com/) icons for clear and intuitive actions.

---

## 🛠️ Tech Stack

This project is built with web fundamentals, demonstrating strong proficiency in core front-end technologies.

- **HTML5**: For the structure and content of the application.
- **CSS3**: For all styling, including responsive design, custom animations (keyframes), flexbox layouts, and the dynamic background.
- **JavaScript (ES6+)**: For all application logic, state management, DOM manipulation, and handling browser events.
- **Font Awesome**: For a rich set of high-quality icons.
- **Google Fonts**: For the 'Orbitron' and other beautiful fonts used throughout the UI.

---

## 🏁 Getting Started

This is a static web application and requires no build steps or dependencies.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd your-repo-name
    ```
3.  **Open the `index.html` file:**
    Simply open the `index.html` file in your favorite web browser (like Chrome, Firefox, or Edge) to run the application.

---

## 📂 File Structure

The project is organized into a few key files:

```
.
├── index.html       # The main HTML file containing the app's structure.
├── script.js        # The core JavaScript file with all the application logic.
├── style.css        # The stylesheet containing all UI designs and animations.
└── README.md        # This file.
```

-   `index.html`: Contains all the DOM elements and layout structure.
-   `style.css`: Contains all the styling, responsive design, and animations.
-   `script.js`: Manages the application's state (the `todos` array), handles all user interactions, manipulates the DOM to render tasks, and interacts with Local Storage.

---

## 👨‍💻 Credits

This application was programmed and designed by **Tanmay Srivastava**.

-   **GitHub**: [@TacticalReader](https://github.com/TacticalReader)

---

## 📄 License

This project is open-source. Feel free to use it as a reference or for your own projects. Consider adding a license file (e.g., MIT License) if you wish to define permissions and limitations.
