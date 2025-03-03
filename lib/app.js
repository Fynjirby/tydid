// import modules
const blessed = require("blessed");
const taskStorage = require("./storage");

// start app!
function startApp() {
  // set terminal
  process.env.TERM = "xterm-256color";

  // make screen (title, disable logs in terminal)
  const screen = blessed.screen({
    smartCSR: true,
    title: "TyDID",
    warnings: false,
    terminal: "xterm-256color",
  });

  // set settings
  const settings = taskStorage.getSettings();
  let vimMode = settings.vimMode || false;

  // show styled title
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

  // show commends bar bottom
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

  // show vim mode status
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

  // show task list (main "window" in app)
  const taskList = blessed.list({
    top: 1,
    left: 0,
    width: "100%",
    height: "100%-2",
    keys: false,
    vi: false,
    mouse: true,
    border: {
      type: "line",
      fg: "#82A2BE",
    },
    style: {
      selected: {
        bg: "#F0C674",
        fg: "black",
      },
      item: {
        hover: {
          bg: "gray",
          fg: "white",
        },
      },
    },
  });

  // make it all appear
  screen.append(titleBox);
  screen.append(taskList);
  screen.append(instructionsBox);
  screen.append(vimModeBox);

  // keybinds! (also with russian keyboard layout support)
  screen.key(["up"], () => {
    const currentIndex = taskList.selected;
    if (currentIndex > 0) {
      taskList.select(currentIndex - 1);
      screen.render();
    }
  });

  screen.key(["down"], () => {
    const currentIndex = taskList.selected;
    const totalItems = taskStorage.getTasks().length;
    if (currentIndex < totalItems - 1) {
      taskList.select(currentIndex + 1);
      screen.render();
    }
  });

  screen.key(["q", "C-c", "й"], () => process.exit(0));

  screen.key(["n", "т"], () => promptNewTask());
  screen.key(["d", "в", "r", "к"], () => deleteTask());
  screen.key(["e", "у"], () => editTask());
  screen.key(["!", "1"], () => togglePriority());
  screen.key(["space", "c", "с"], () => toggleComplete());
  screen.key(["s", "ы"], () => promptSearch());

  screen.key(["?"], () => showHelp());

  // vim toggle
  screen.key(["v", "м"], () => {
    vimMode = !vimMode;
    vimModeBox.content = vimMode
      ? "[{#027F00-fg}VIM MODE: ON{white-fg}]"
      : "[{#027F00-fg}VIM MODE: OFF{white-fg}]";

    const currentSettings = taskStorage.getSettings();
    currentSettings.vimMode = vimMode;
    taskStorage.saveSettings(currentSettings);

    screen.render();
  });

  // vim binds

  // to the top of the list
  screen.key(["h", "р"], () => {
    if (vimMode) {
      taskList.select(0);
      screen.render();
    }
  });

  // 1 element up
  screen.key(["j", "о"], () => {
    if (vimMode) {
      const currentIndex = taskList.selected;
      const totalItems = taskStorage.getTasks().length;
      if (currentIndex < totalItems - 1) {
        taskList.select(currentIndex + 1);
        screen.render();
      }
    }
  });

  // 1 element down
  screen.key(["k", "л"], () => {
    if (vimMode) {
      const currentIndex = taskList.selected;
      if (currentIndex > 0) {
        taskList.select(currentIndex - 1);
        screen.render();
      }
    }
  });

  // to the bottom of the list
  screen.key(["l", "д"], () => {
    if (vimMode) {
      const totalItems = taskStorage.getTasks().length;
      if (totalItems > 0) {
        taskList.select(totalItems - 1);
        screen.render();
      }
    }
  });

  taskList.focus();

  refreshTasks();

  screen.render();

  // help window
  function showHelp() {
    const helpText = [
      "{center}{bold}Keyboard Shortcuts{/bold}{/center}",
      "",
      " {bold}Basic Commands:{/bold}",
      "   {bold}n{/bold} - Create a new task",
      "   {bold}d{/bold} - Delete the selected task",
      "   {bold}e{/bold} - Edit the selected task",
      "   {bold}space{/bold} - Toggle completion of the selected task",
      "   {bold}s{/bold} - Search tasks",
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

    // help window box stylization
    const helpBox = blessed.box({
      top: "center",
      left: "center",
      width: "80%",
      height: "80%",
      content: helpText,
      tags: true,
      keys: true,
      vi: true,
      border: {
        type: "line",
      },
      style: {
        border: {
          fg: "#82A2BE",
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

    // escape listener
    helpBox.key("escape", () => {
      helpBox.detach();
      taskList.focus();
      screen.render();
    });
  }

  // other functions

  // refresh tasks function
  function refreshTasks() {
    const tasks = taskStorage.getTasks();
    taskList.setItems(tasks.map(formatTaskItem));
    screen.render();
  }

  // format task item function
  function formatTaskItem(task) {
    const statusMark = task.completed ? "✓" : "▢";
    let priorityIndicator = "";
    if (task.priority) priorityIndicator = "!";

    return ` ${statusMark} ${priorityIndicator} ${task.title}`;
  }

  // search function
  function promptSearch() {
    // search window stylization
    const searchBox = blessed.box({
      border: "line",
      height: 3,
      width: "80%",
      top: "center",
      left: "center",
      label: " Search Tasks ",
      style: {
        border: {
          fg: "#82A2BE",
        },
      },
      inputOnFocus: true,
    });

    // input stylization
    const input = blessed.textbox({
      parent: searchBox,
      height: 1,
      width: "100%-2",
      top: 0,
      left: 0,
      inputOnFocus: true,
      keys: true,
      vi: true,
    });

    screen.append(searchBox);
    input.focus();
    screen.render();

    // enter listener
    input.on("submit", (value) => {
      if (value.trim()) {
        searchBox.detach();
        showSearchResults(value.trim());
      } else {
        searchBox.detach();
        taskList.focus();
        screen.render();
      }
    });

    // escape listener
    input.on("cancel", () => {
      searchBox.detach();
      taskList.focus();
      screen.render();
    });
  }

  // show search results function
  function showSearchResults(query) {
    // fetch tasks from storage and filter by name
    const allTasks = taskStorage.getTasks();
    const filteredTasks = allTasks.filter((task) =>
      task.title.toLowerCase().includes(query.toLowerCase()),
    );

    // adding search word in title
    const originalTitle = titleBox.content;
    titleBox.content = `{center}{bold}TyDID{/bold} - Search: "${query}"{/center}`;

    taskList.setItems(filteredTasks.map(formatTaskItem));

    screen.render();
    taskList.focus();

    // escape listener
    screen.key("escape", () => {
      titleBox.content = originalTitle;
      refreshTasks();
      screen.render();
    });
  }

  // new task function
  function promptNewTask() {
    // new task window stylization
    const input = blessed.textbox({
      border: "line",
      height: 3,
      width: "80%",
      top: "center",
      left: "center",
      label: " New Task ",
      style: {
        border: {
          fg: "#82A2BE",
        },
      },
      inputOnFocus: true,
      keys: true,
      vi: true,
    });

    screen.append(input);
    input.focus();

    // enter listener
    input.on("submit", (value) => {
      if (value.trim()) {
        taskStorage.addTask(value.trim());
        input.detach();
        refreshTasks();
        taskList.focus();
      } else {
        input.detach();
        taskList.focus();
        screen.render();
      }
    });

    // escape listener
    input.on("cancel", () => {
      input.detach();
      taskList.focus();
      screen.render();
    });

    screen.render();
  }

  // delete task function
  function deleteTask() {
    // cancel if no task selected
    if (taskList.selected === undefined) return;

    // fetch tasks from storage
    const tasks = taskStorage.getTasks();
    if (tasks.length === 0) return;

    const selectedTask = tasks[taskList.selected];

    // delete window stylization
    const message = blessed.box({
      border: "line",
      height: "shrink",
      width: "50%",
      top: "center",
      left: "center",
      label: " Delete Task ",
      style: {
        border: {
          fg: "#82A2BE",
        },
      },
      content: ` Delete: "${selectedTask.title}"?\n\n Press Enter to confirm or Escape to cancel`,
      tags: true,
      keys: true,
      vi: true,
    });

    screen.append(message);
    screen.render();

    // enter and escape listener
    message.key("escape", () => {
      message.detach();
      taskList.focus();
      screen.render();
    });

    // enter listener
    message.key("enter", () => {
      taskStorage.deleteTask(selectedTask.id);
      refreshTasks();
      message.detach();
      taskList.focus();
      screen.render();
    });

    message.focus();
  }

  // edit task function
  function editTask() {
    // cancel if no task selected
    if (taskList.selected === undefined) return;

    // fetch tasks from storage
    const tasks = taskStorage.getTasks();
    if (tasks.length === 0) return;

    const selectedTask = tasks[taskList.selected];

    // edit window stylization
    const editBox = blessed.box({
      border: "line",
      height: 8,
      width: "80%",
      top: "center",
      left: "center",
      label: " Edit Task ",
      style: {
        border: {
          fg: "#82A2BE",
        },
      },
      content: ` Current: ${selectedTask.title}\n\n New text:`,
      tags: true,
    });

    // input field stylization
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

    // Tab listener
    input.key("tab", function () {
      // showing current task title
      input.setValue(selectedTask.title);
      screen.render();
    });

    // enter listener
    input.on("submit", (value) => {
      if (value.trim()) {
        const completed = selectedTask.completed;
        const priority = selectedTask.priority;
        taskStorage.deleteTask(selectedTask.id);
        const newTask = taskStorage.addTask(value.trim(), priority);

        if (completed) {
          taskStorage.completeTask(newTask.id);
        }

        editBox.detach();
        refreshTasks();
        taskList.focus();
      } else {
        editBox.detach();
        taskList.focus();
        screen.render();
      }
    });

    // escape listener
    input.on("cancel", () => {
      editBox.detach();
      taskList.focus();
      screen.render();
    });
  }

  // toggle priority (!) function
  function togglePriority() {
    if (taskList.selected === undefined) return;

    const tasks = taskStorage.getTasks();
    if (tasks.length === 0) return;

    const selectedTask = tasks[taskList.selected];
    taskStorage.updateTaskPriority(selectedTask.id);
    refreshTasks();
  }

  // toggle complete function
  function toggleComplete() {
    if (taskList.selected === undefined) return;

    const tasks = taskStorage.getTasks();
    if (tasks.length === 0) return;

    const selectedTask = tasks[taskList.selected];
    taskStorage.completeTask(selectedTask.id);
    refreshTasks();
  }
}

// thats all folks! =)
module.exports = { startApp };
