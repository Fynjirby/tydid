const fs = require("fs");
const path = require("path");
const os = require("os");

class TaskStorage {
  constructor() {
    this.storageDir = path.join(os.homedir(), ".tydid");
    this.storageFile = path.join(this.storageDir, "tasks.json");
    this.settingsFile = path.join(this.storageDir, "settings.json");

    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }

    const isFirstRun = !fs.existsSync(this.storageFile);

    if (isFirstRun) {
      const initialTasks = [
        {
          id: this._generateRandomId(),
          title: "Important task",
          completed: false,
          priority: true,
          createdAt: this._formatDateToString(),
        },
        {
          id: this._generateRandomId(),
          title: "Regular task",
          completed: false,
          priority: false,
          createdAt: this._formatDateToString(),
        },
        {
          id: this._generateRandomId(),
          title: "Completed task",
          completed: true,
          priority: false,
          createdAt: this._formatDateToString(),
        },
      ];
      const formattedJson = JSON.stringify({ tasks: initialTasks }, null, 2);
      fs.writeFileSync(this.storageFile, formattedJson, "utf8");
    } else if (!this._isValidTasksFile()) {
      const formattedJson = JSON.stringify({ tasks: [] }, null, 2);
      fs.writeFileSync(this.storageFile, formattedJson, "utf8");
    }

    if (!fs.existsSync(this.settingsFile)) {
      this.saveSettings({ vimMode: false });
    }
  }

  _generateRandomId() {
    let usedIds = this.getTasks().map((task) => task.id);
    let id;

    do {
      id = Math.floor(10000000 + Math.random() * 90000000).toString();
    } while (usedIds.includes(id));

    return id;
  }

  _formatDateToString() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${day}${month}${year}${hours}${minutes}`;
  }

  _isValidTasksFile() {
    try {
      const data = fs.readFileSync(this.storageFile, "utf8");
      const parsed = JSON.parse(data);
      return Array.isArray(parsed.tasks);
    } catch (error) {
      return false;
    }
  }

  getTasks() {
    try {
      const data = fs.readFileSync(this.storageFile, "utf8");
      const parsed = JSON.parse(data);
      return parsed.tasks || [];
    } catch (error) {
      console.error("Error reading tasks:", error);
      return [];
    }
  }

  _saveTasks(tasks) {
    try {
      const formattedJson = JSON.stringify({ tasks }, null, 2);
      fs.writeFileSync(this.storageFile, formattedJson);
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

  addTask(title, priority = false) {
    const tasks = this.getTasks();
    const newTask = {
      id: this._generateRandomId(),
      title,
      completed: false,
      priority: priority,
      createdAt: this._formatDateToString(),
    };

    tasks.push(newTask);
    this._saveTasks(tasks);
    return newTask;
  }

  completeTask(id) {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex((task) => task.id === id);

    if (taskIndex !== -1) {
      tasks[taskIndex].completed = !tasks[taskIndex].completed;
      this._saveTasks(tasks);
      return tasks[taskIndex];
    }
    return null;
  }

  deleteTask(id) {
    const tasks = this.getTasks();
    const newTasks = tasks.filter((task) => task.id !== id);
    this._saveTasks(newTasks);
    return newTasks.length !== tasks.length;
  }

  updateTaskPriority(id, priority) {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex((task) => task.id === id);

    if (taskIndex !== -1) {
      tasks[taskIndex].priority =
        priority !== undefined ? priority : !tasks[taskIndex].priority;
      this._saveTasks(tasks);
      return tasks[taskIndex];
    }
    return null;
  }
}

module.exports = new TaskStorage();
