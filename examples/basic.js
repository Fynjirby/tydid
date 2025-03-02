// const { tydid } = require("tydid"); // Import the tydid module
const { tydid } = require("../index.js"); // Import the tydid module

// Add a new todo and log it
const newTodo = tydid.addTodo("Complete the documentation");
console.log("Created new task:", newTodo);

// Add a priority todo
const priorityTodo = tydid.addTodo("Fix critical bug", true);
console.log("Created task with priority:", priorityTodo);

// Mark a todo as complete
tydid.completeTodo(newTodo.id);
console.log("Marked task as complete");

// List all todos
const allTodos = tydid.getTodos();
console.log("\nAll todos:");
allTodos.forEach((todo) => {
  const status = todo.completed ? "✓" : "☐";
  const priority = todo.priority ? "!" : " ";
  console.log(`${status} ${priority} ${todo.title}`);
});

// Delete a todo and show updated list
tydid.deleteTodo(priorityTodo.id);
console.log("\nDeleted a todo. Updated list:");
tydid.getTodos().forEach((todo) => {
  const status = todo.completed ? "✓" : "☐";
  const priority = todo.priority ? "!" : " ";
  console.log(`${status} ${priority} ${todo.title}`);
});

console.log("\nRun `tydid` in your terminal to start the interactive UI");
