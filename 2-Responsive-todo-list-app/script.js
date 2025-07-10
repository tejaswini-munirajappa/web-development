let tasks = [];

document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
});

function loadTasks() {
  const saved = localStorage.getItem("planitTasks");
  tasks = saved ? JSON.parse(saved) : [];
  renderTasks("all", document.querySelector(".filter-btn.active"));
}

function saveTasks() {
  localStorage.setItem("planitTasks", JSON.stringify(tasks));
}

function addTask() {
  const input = document.getElementById("taskInput");
  const dateInput = document.getElementById("taskDate");
  const timeInput = document.getElementById("taskTime");

  const taskText = input.value.trim();
  const dueDate = dateInput.value;
  const dueTime = timeInput.value;

  if (taskText === "" || dueDate === "") return;

  const newTask = {
    id: Date.now(),
    text: taskText,
    completed: false,
    date: new Date(dueDate).toISOString().split('T')[0],
    time: dueTime
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks("all", document.querySelector(".filter-btn.active"));
  input.value = "";
  dateInput.value = "";
  timeInput.value = "";
}

function toggleComplete(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks("all", document.querySelector(".filter-btn.active"));
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks("all", document.querySelector(".filter-btn.active"));
}

function editTask(id) {
  const newText = prompt("Edit your task:");
  if (!newText) return;
  tasks = tasks.map(task =>
    task.id === id ? { ...task, text: newText } : task
  );
  saveTasks();
  renderTasks("all", document.querySelector(".filter-btn.active"));
}

function renderTasks(filter = "all", clickedButton = null) {
  // Highlight active filter
  document.querySelectorAll(".filter-btn").forEach(btn =>
    btn.classList.remove("active")
  );
  if (clickedButton) clickedButton.classList.add("active");

  const list = document.getElementById("taskList");
  list.innerHTML = "";

  let filtered = tasks;

  if (filter === "active") {
    filtered = tasks.filter(t => !t.completed);
  } else if (filter === "completed") {
    filtered = tasks.filter(t => t.completed);
  }

  if (filtered.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.textContent =
      filter === "active"
        ? "No active tasks."
        : filter === "completed"
        ? "No completed tasks."
        : "No tasks yet.";
    emptyMsg.style.textAlign = "center";
    emptyMsg.style.color = "#cbd5e1";
    list.appendChild(emptyMsg);
    updateProgressBar();
    return;
  }

  const groups = {};
  filtered.forEach(task => {
    if (!groups[task.date]) groups[task.date] = [];
    groups[task.date].push(task);
  });

  const sortedDates = Object.keys(groups).sort();

  sortedDates.forEach(dateStr => {
    const dateHeading = document.createElement("h3");
    dateHeading.textContent = formatDateHeader(dateStr);
    list.appendChild(dateHeading);

    groups[dateStr].forEach(task => {
      const li = document.createElement("li");
      li.className = task.completed ? "completed" : "";

      const timeText = task.time ? ` - ${task.time}` : "";

      li.innerHTML = `
        <span>${task.text}${timeText}</span>
        <div class="icons">
          <i class="fa-solid fa-check" onclick="toggleComplete(${task.id})"></i>
          <i class="fa-solid fa-pen-to-square" onclick="editTask(${task.id})"></i>
          <i class="fa-solid fa-trash" onclick="deleteTask(${task.id})"></i>
        </div>
      `;
      list.appendChild(li);
    });
  });

  updateProgressBar();
}

function updateProgressBar() {
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const percent = total ? (done / total) * 100 : 0;
  document.getElementById("progressBar").style.width = `${percent}%`;
}

function formatDateHeader(dateStr) {
  const today = new Date();
  const inputDate = new Date(dateStr);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const format = (date) => date.toISOString().split('T')[0];

  if (format(today) === dateStr) return "Today";
  if (format(tomorrow) === dateStr) return "Tomorrow";
  if (format(yesterday) === dateStr) return "Yesterday";

  return inputDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}
