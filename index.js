const app = require("./lib/app");
const todoStorage = require("./lib/storage");

const tydid = {
  addTodo: todoStorage.addTodo.bind(todoStorage),
  completeTodo: todoStorage.completeTodo.bind(todoStorage),
  deleteTodo: todoStorage.deleteTodo.bind(todoStorage),
  getTodos: todoStorage.getTodos.bind(todoStorage),
};

module.exports = {
  tydid,
  startApp: app.startApp,
};
