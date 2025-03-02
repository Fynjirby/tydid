# TyDID

[![npm version](https://img.shields.io/npm/v/tydid.svg)](https://www.npmjs.com/package/tydid)

Ultra Fast Terminal-based TODO application with a function of Vim-like navigation.

## Features

- 📝 Create, edit, and manage tasks directly from your terminal
- ✅ Mark tasks as complete with a single keystroke
- ⭐ Flag important tasks with priority status
- ⌨️ Optional Vim mode for efficient keyboard navigation
- 💾 Automatic persistence of tasks between sessions
- 🔄 Simple and intuitive interface with keyboard shortcuts

## Installation

```bash
npm install -g tydid
```

## Usage

Run in terminal and enjoy!
```bash
tydid
```

## Programmatic Usage

You can also use TyDID as a library in your Node.js projects:

```javascript
const tydid = require('tydid');

// Start the interactive UI
tydid.startApp();

// Or use the API directly
const todo = tydid.addTodo('Learn Node.js');
tydid.completeTodo(todo.id);
const allTodos = tydid.getTodos();
```

There is an examples of usage in the `examples` directory.

## Configuration

TyDID stores your tasks in `~/.tydid/todos.json` and settings in `~/.tydid/settings.json`.
