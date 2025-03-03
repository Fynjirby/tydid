const fs = require("fs");
const path = require("path");
const { nanoid } = require("nanoid");
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
          id: nanoid(),
          title: "Important task",
          completed: false,
          priority: true,
          createdAt: Date.now(),
        },
        {
          id: nanoid(),
          title: "Regular task",
          completed: false,
          priority: false,
          createdAt: Date.now(),
        },
        {
          id: nanoid(),
          title: "Completed task",
          completed: true,
          priority: false,
          createdAt: Date.now(),
        },
      ];
      fs.writeFileSync(
        this.storageFile,
        JSON.stringify({ tasks: initialTasks }),
      );
    } else if (!this._isValidTasksFile()) {
      fs.writeFileSync(this.storageFile, JSON.stringify({ tasks: [] }));
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
      fs.writeFileSync(this.storageFile, JSON.stringify({ tasks }));
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
      id: nanoid(),
      title,
      completed: false,
      priority: priority,
      createdAt: Date.now(),
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
