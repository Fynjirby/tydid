const blessed = require("blessed");
const todoStorage = require("./storage");

function startApp() {
  process.env.TERM = "xterm-256color";

  const screen = blessed.screen({
    smartCSR: true,
    title: "TyDID",
    warnings: false,
    terminal: "xterm-256color",
  });

  const settings = todoStorage.getSettings();
  let vimMode = settings.vimMode || false;

  const titleBox = blessed.box({
    top: 0,
    left: "center",
    width: "100%",
    height: 1,
    content: "{center}{bold}TyDID{/bold}{/center}",
    tags: true,
    style: {
      fg: "white",
    },
  });

  const instructionsBox = blessed.box({
    bottom: 0,
    left: 1,
    width: "100%",
    height: 1,
    content:
      "{bold}n{/bold}: New | {bold}d{/bold}: Delete | {bold}space{/bold}: Complete | {bold}e{/bold}: Edit | {bold}!{/bold}: Priority | {bold}?{/bold}: Help | {bold}q{/bold}: Quit",
    tags: true,
    style: {
      fg: "white",
    },
  });

  const vimModeBox = blessed.box({
    bottom: 0,
    right: 1,
    width: "shrink",
    height: 1,
    content: vimMode
      ? "[{#027F00-fg}VIM MODE: ON{white-fg}]"
      : "[{#027F00-fg}VIM MODE: OFF{white-fg}]",
    tags: true,
    style: {
      fg: "white",
    },
  });

  const todoList = blessed.list({
    top: 1,
    left: 0,
    width: "100%",
    height: "100%-2",
    keys: false,
    vi: false,
    mouse: true,
    border: {
      type: "line",
      fg: "blue",
    },
    style: {
      selected: {
        bg: "yellow",
        fg: "black",
      },
      item: {
        hover: {
          bg: "gray",
        },
      },
    },
  });

  screen.append(titleBox);
  screen.append(todoList);
  screen.append(instructionsBox);
  screen.append(vimModeBox);

  screen.key(["up"], () => {
    const currentIndex = todoList.selected;
    if (currentIndex > 0) {
      todoList.select(currentIndex - 1);
      screen.render();
    }
  });

  screen.key(["down"], () => {
    const currentIndex = todoList.selected;
    const totalItems = todoStorage.getTodos().length;
    if (currentIndex < totalItems - 1) {
      todoList.select(currentIndex + 1);
      screen.render();
    }
  });

  screen.key(["q", "C-c", "й"], () => process.exit(0));

  screen.key(["n", "т"], () => promptNewTodo());
  screen.key(["d", "в"], () => deleteTodo());
  screen.key(["e", "у"], () => editTodo());
  screen.key(["!", "1"], () => togglePriority());
  screen.key(["space", "c", "с"], () => toggleComplete());

  screen.key(["?"], () => showHelp());

  screen.key(["v", "м"], () => {
    vimMode = !vimMode;
    vimModeBox.content = vimMode
      ? "[{#027F00-fg}VIM MODE: ON{white-fg}]"
      : "[{#027F00-fg}VIM MODE: OFF{white-fg}]";

    const currentSettings = todoStorage.getSettings();
    currentSettings.vimMode = vimMode;
    todoStorage.saveSettings(currentSettings);

    screen.render();
  });

  screen.key(["h", "р"], () => {
    if (vimMode) {
      todoList.select(0);
      screen.render();
    }
  });

  screen.key(["j", "о"], () => {
    if (vimMode) {
      const currentIndex = todoList.selected;
      const totalItems = todoStorage.getTodos().length;
      if (currentIndex < totalItems - 1) {
        todoList.select(currentIndex + 1);
        screen.render();
      }
    }
  });

  screen.key(["k", "л"], () => {
    if (vimMode) {
      const currentIndex = todoList.selected;
      if (currentIndex > 0) {
        todoList.select(currentIndex - 1);
        screen.render();
      }
    }
  });

  screen.key(["l", "д"], () => {
    if (vimMode) {
      const totalItems = todoStorage.getTodos().length;
      if (totalItems > 0) {
        todoList.select(totalItems - 1);
        screen.render();
      }
    }
  });

  todoList.focus();

  refreshTodos();

  screen.render();

  function showHelp() {
    const helpText = [
      "{center}{bold}Keyboard Shortcuts{/bold}{/center}",
      "",
      " {bold}Basic Commands:{/bold}",
      "   {bold}n{/bold} - Create a new task",
      "   {bold}d{/bold} - Delete the selected task",
      "   {bold}e{/bold} - Edit the selected task",
      "   {bold}space{/bold} - Toggle completion of the selected task",
      "   {bold}!{/bold} - Toggle priority of the selected task",
      "   {bold}v{/bold} - Toggle Vim mode",
      "   {bold}q{/bold} - Quit the application",
      "",
      " {bold}Navigation:{/bold}",
      "   {bold}↑/↓{/bold} - Move selection up/down",
      "",
      " {bold}Vim Mode Commands:{/bold} (when Vim mode is enabled)",
      "   {bold}h{/bold} - Jump to the top of the list",
      "   {bold}j{/bold} - Move down one item",
      "   {bold}k{/bold} - Move up one item",
      "   {bold}l{/bold} - Jump to the bottom of the list",
      "",
      "{center}Press ESC to close this help{/center}",
    ].join("\n");

    const helpBox = blessed.box({
      top: "center",
      left: "center",
      width: "80%",
      height: "80%",
      content: helpText,
      tags: true,
      border: {
        type: "line",
      },
      style: {
        border: {
          fg: "blue",
        },
      },
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        ch: " ",
        bg: "blue",
      },
    });

    screen.append(helpBox);
    helpBox.focus();
    screen.render();

    const onKeypress = function (ch, key) {
      if (key.name === "escape") {
        helpBox.detach();
        screen.removeListener("keypress", onKeypress);
        todoList.focus();
        screen.render();
      }
    };

    screen.on("keypress", onKeypress);
  }

  function refreshTodos() {
    const todos = todoStorage.getTodos();
    todoList.setItems(todos.map(formatTodoItem));
    screen.render();
  }

  function formatTodoItem(todo) {
    const statusMark = todo.completed ? "✓" : "▢";
    let priorityIndicator = "";
    if (todo.priority) priorityIndicator = "!";

    return `${statusMark} ${priorityIndicator} ${todo.title}`;
  }

  function promptNewTodo() {
    const input = blessed.textbox({
      border: "line",
      height: 3,
      width: "80%",
      top: "center",
      left: "center",
      label: " New Task ",
      inputOnFocus: true,
      keys: true,
      vi: true,
    });

    screen.append(input);
    input.focus();

    input.on("submit", (value) => {
      if (value.trim()) {
        todoStorage.addTodo(value.trim());
        input.detach();
        refreshTodos();
        todoList.focus();
      } else {
        input.detach();
        todoList.focus();
        screen.render();
      }
    });

    input.on("cancel", () => {
      input.detach();
      todoList.focus();
      screen.render();
    });

    screen.render();
  }

  function deleteTodo() {
    if (todoList.selected === undefined) return;

    const todos = todoStorage.getTodos();
    if (todos.length === 0) return;

    const selectedTodo = todos[todoList.selected];

    const message = blessed.box({
      border: "line",
      height: "shrink",
      width: "50%",
      top: "center",
      left: "center",
      label: " Delete Todo ",
      content: `Delete: "${selectedTodo.title}"?\n\nPress Enter to confirm or Escape to cancel`,
      tags: true,
    });

    screen.append(message);
    screen.render();

    const onKeypress = function (ch, key) {
      if (key.name === "enter") {
        todoStorage.deleteTodo(selectedTodo.id);
        refreshTodos();
      } else if (key.name === "escape") {
      } else {
        return;
      }

      message.detach();
      screen.removeListener("keypress", onKeypress);
      todoList.focus();
      screen.render();
    };

    screen.on("keypress", onKeypress);

    message.focus();
  }

  function editTodo() {
    if (todoList.selected === undefined) return;

    const todos = todoStorage.getTodos();
    if (todos.length === 0) return;

    const selectedTodo = todos[todoList.selected];

    const editBox = blessed.box({
      border: "line",
      height: 7,
      width: "80%",
      top: "center",
      left: "center",
      label: " Edit Todo ",
      content: `Current: ${selectedTodo.title}\n\nNew text:`,
      tags: true,
    });

    const input = blessed.textbox({
      parent: editBox,
      height: 3,
      width: "90%",
      top: 3,
      left: "center",
      inputOnFocus: true,
      keys: true,
      vi: true,
    });

    screen.append(editBox);
    input.focus();
    screen.render();

    input.on("submit", (value) => {
      if (value.trim()) {
        const completed = selectedTodo.completed;
        const priority = selectedTodo.priority;
        todoStorage.deleteTodo(selectedTodo.id);
        const newTodo = todoStorage.addTodo(value.trim(), priority);

        if (completed) {
          todoStorage.completeTodo(newTodo.id);
        }

        editBox.detach();
        refreshTodos();
        todoList.focus();
      } else {
        editBox.detach();
        todoList.focus();
        screen.render();
      }
    });

    input.on("cancel", () => {
      editBox.detach();
      todoList.focus();
      screen.render();
    });
  }

  function togglePriority() {
    if (todoList.selected === undefined) return;

    const todos = todoStorage.getTodos();
    if (todos.length === 0) return;

    const selectedTodo = todos[todoList.selected];
    todoStorage.updateTodoPriority(selectedTodo.id);
    refreshTodos();
  }

  function toggleComplete() {
    if (todoList.selected === undefined) return;

    const todos = todoStorage.getTodos();
    if (todos.length === 0) return;

    const selectedTodo = todos[todoList.selected];
    todoStorage.completeTodo(selectedTodo.id);
    refreshTodos();
  }
}

module.exports = { startApp };
