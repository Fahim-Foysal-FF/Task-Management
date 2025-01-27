// Select DOM elements
const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskPriority = document.getElementById("taskPriority");
const taskDueDate = document.getElementById("taskDueDate");
const taskList = document.getElementById("taskList");
const filterSelect = document.getElementById("filterSelect");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

// Task array for in-memory management
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Save tasks to localStorage (async)
const saveTasks = async () => {
  try {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  } catch (error) {
    console.error("Error saving tasks to localStorage", error);
  }
};

// Render tasks (async)
const renderTasks = async () => {
  taskList.innerHTML = ""; // Clear current tasks

  if (tasks.length === 0) {
    taskList.innerHTML = `<p>No tasks available. Add one!</p>`;
    return;
  }

  // Filter tasks based on the selected filter and search input
  let filteredTasks = tasks;

  // Filter tasks by completion status
  const filterValue = filterSelect.value;
  filteredTasks = filterValue === "completed" 
    ? filteredTasks.filter((task) => task.completed) 
    : filterValue === "pending"
    ? filteredTasks.filter((task) => !task.completed)
    : filteredTasks;

  // Filter tasks by search query
  const searchQuery = searchInput.value.toLowerCase();
  if (searchQuery) {
    filteredTasks = filteredTasks.filter(({ title }) =>
      title.toLowerCase().includes(searchQuery)
    );
  }

  // Sort tasks if needed
  const sortValue = sortSelect.value;
  if (sortValue === "priority") {
    const priorityOrder = { low: 1, medium: 2, high: 3 };
    filteredTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  } else if (sortValue === "dueDate") {
    filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }

  // Render the filtered tasks
  const table = document.createElement("table");
  table.classList.add("task-table");
  
  // Table headers
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = `
    <th>Task ID</th>
    <th>Title</th>
    <th>Description</th>
    <th>Priority</th>
    <th>Due Date</th>
    <th>Actions</th>
  `;
  table.appendChild(headerRow);

  // Render tasks in table rows
  filteredTasks.forEach((task) => {
    const { id, title, description, priority, dueDate, completed } = task;
    const taskRow = document.createElement("tr");
    if (completed) taskRow.classList.add("task-completed");

    taskRow.innerHTML = `
      <td>${id}</td>
      <td>${title}</td>
      <td>${description}</td>
      <td>${priority}</td>
      <td>${new Date(dueDate).toLocaleDateString()}</td>
      <td>
        <button class="complete-btn">${completed ? "Undo" : "Complete"}</button>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </td>
    `;

    // Add event listeners to buttons
    taskRow.querySelector(".complete-btn").addEventListener("click", () => toggleTaskCompletion(id));
    taskRow.querySelector(".edit-btn").addEventListener("click", () => editTask(id));
    taskRow.querySelector(".delete-btn").addEventListener("click", () => deleteTask(id));

    table.appendChild(taskRow);
  });

  taskList.appendChild(table);
};

// Add a task (async)
const addTask = async (title, description, priority, dueDate) => {
  try {
    if (tasks.some((task) => task.title.toLowerCase() === title.toLowerCase())) {
      alert("A task with the same title already exists.");
      return;
    }

    const newTask = {
      id: Date.now(), // Unique ID using Date.now()
      title,
      description,
      priority,
      dueDate,
      completed: false,
    };

    tasks.push(newTask);
    await saveTasks();
    renderTasks();
  } catch (error) {
    console.error("Error adding task", error);
  }
};

// Delete a task (async)
const deleteTask = async (taskId) => {
  try {
    tasks = tasks.filter((task) => task.id !== taskId);
    await saveTasks();
    renderTasks();
  } catch (error) {
    console.error("Error deleting task", error);
  }
};

// Toggle task completion (async)
const toggleTaskCompletion = async (taskId) => {
  try {
    const task = tasks.find((task) => task.id === taskId);
    if (task) {
      task.completed = !task.completed;
      await saveTasks();
      renderTasks();
    }
  } catch (error) {
    console.error("Error toggling task completion", error);
  }
};

// Edit a task (async)
const editTask = async (taskId) => {
  try {
    const task = tasks.find((task) => task.id === taskId);
    if (task) {
      taskTitle.value = task.title;
      taskDescription.value = task.description;
      taskPriority.value = task.priority;
      taskDueDate.value = task.dueDate;

      tasks = tasks.filter((t) => t.id !== taskId); // Remove the task for editing
      await saveTasks();
      renderTasks();
    }
  } catch (error) {
    console.error("Error editing task", error);
  }
};

// Handle form submission
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = taskTitle.value.trim();
  const description = taskDescription.value.trim();
  const priority = taskPriority.value;
  const dueDate = taskDueDate.value;

  if (!title) {
    alert("Task title is required.");
    return;
  }

  if (title.length > 50) {
    alert("Task title must not exceed 50 characters.");
    return;
  }

  if (!dueDate) {
    alert("Due date is required.");
    return;
  }

  await addTask(title, description, priority, dueDate);
  taskForm.reset();
});

// Handle filter and search change events
filterSelect.addEventListener("change", renderTasks);
searchInput.addEventListener("input", renderTasks);
sortSelect.addEventListener("change", renderTasks);

// Initial render
renderTasks();
