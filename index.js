const app = require("./lib/app");
const todoStorage = require("./lib/storage");

module.exports = {
  startApp: app.startApp,
  addTodo: todoStorage.addTodo.bind(todoStorage),
  completeTodo: todoStorage.completeTodo.bind(todoStorage),
  deleteTodo: todoStorage.deleteTodo.bind(todoStorage),
  getTodos: todoStorage.getTodos.bind(todoStorage),
};
