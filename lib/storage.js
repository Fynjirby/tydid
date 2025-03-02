const fs = require("fs");
const path = require("path");
const { nanoid } = require("nanoid");
const os = require("os");

class TodoStorage {
  constructor() {
    this.storageDir = path.join(os.homedir(), ".tydid");
    this.storageFile = path.join(this.storageDir, "todos.json");
    this.settingsFile = path.join(this.storageDir, "settings.json");

    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }

    if (!fs.existsSync(this.storageFile)) {
      fs.writeFileSync(this.storageFile, JSON.stringify({ todos: [] }));
    }

    if (!fs.existsSync(this.settingsFile)) {
      fs.writeFileSync(
        this.settingsFile,
        JSON.stringify({
          vimMode: false,
        }),
      );
    }
  }

  getTodos() {
    try {
      const data = fs.readFileSync(this.storageFile, "utf8");
      const parsed = JSON.parse(data);
      return parsed.todos || [];
    } catch (error) {
      console.error("Error reading tasks:", error);
      return [];
    }
  }

  _saveTodos(todos) {
    try {
      fs.writeFileSync(this.storageFile, JSON.stringify({ todos }));
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  }

  getSettings() {
    try {
      if (!fs.existsSync(this.settingsFile)) {
        return { vimMode: false };
      }
      const data = fs.readFileSync(this.settingsFile, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading settings:", error);
      return { vimMode: false };
    }
  }

  saveSettings(settings) {
    try {
      fs.writeFileSync(this.settingsFile, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error("Error saving settings:", error);
      return false;
    }
  }

  addTodo(title, priority = false) {
    const todos = this.getTodos();
    const newTodo = {
      id: nanoid(),
      title,
      completed: false,
      priority: priority,
      createdAt: Date.now(),
    };

    todos.push(newTodo);
    this._saveTodos(todos);
    return newTodo;
  }

  completeTodo(id) {
    const todos = this.getTodos();
    const todoIndex = todos.findIndex((todo) => todo.id === id);

    if (todoIndex !== -1) {
      todos[todoIndex].completed = !todos[todoIndex].completed;
      this._saveTodos(todos);
      return todos[todoIndex];
    }
    return null;
  }

  deleteTodo(id) {
    const todos = this.getTodos();
    const newTodos = todos.filter((todo) => todo.id !== id);
    this._saveTodos(newTodos);
    return newTodos.length !== todos.length;
  }

  updateTodoPriority(id, priority) {
    const todos = this.getTodos();
    const todoIndex = todos.findIndex((todo) => todo.id === id);

    if (todoIndex !== -1) {
      todos[todoIndex].priority =
        priority !== undefined ? priority : !todos[todoIndex].priority;
      this._saveTodos(todos);
      return todos[todoIndex];
    }
    return null;
  }
}

module.exports = new TodoStorage();
