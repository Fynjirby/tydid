const app = require("./lib/app");
const taskStorage = require("./lib/storage");

const tydid = {
  addTask: taskStorage.addTask.bind(taskStorage),
  completeTask: taskStorage.completeTask.bind(taskStorage),
  deleteTask: taskStorage.deleteTask.bind(taskStorage),
  getTasks: taskStorage.getTasks.bind(taskStorage),
};

module.exports = {
  tydid,
  startApp: app.startApp,
};
