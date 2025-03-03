const { tydid } = require("tydid"); // Import the tydid module

// Add a new task and log it
const newTask = tydid.addTask("Complete the documentation");
console.log("Created new task:", newTask);

// Add a priority task
const priorityTask = tydid.addTask("Fix critical bug", true);
console.log("Created task with priority:", priorityTask);

// Mark a task as complete
tydid.completeTask(newTask.id);
console.log("Marked task as complete");

// List all tasks
const allTasks = tydid.getTasks();
console.log("\nAll tasks:");
allTasks.forEach((task) => {
  const status = task.completed ? "✓" : "☐";
  const priority = task.priority ? "!" : " ";
  console.log(`${status} ${priority} ${task.title}`);
});

// Delete a task and show updated list
tydid.deleteTask(priorityTask.id);
console.log("\nDeleted a task. Updated list:");
tydid.getTasks().forEach((task) => {
  const status = task.completed ? "✓" : "☐";
  const priority = task.priority ? "!" : " ";
  console.log(`${status} ${priority} ${task.title}`);
});

console.log("\nRun `tydid` in your terminal to start the interactive UI");
