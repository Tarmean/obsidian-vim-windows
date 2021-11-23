/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source visit the plugins github repository
*/

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// main.ts
__export(exports, {
  WORKSPACE_PLUGIN_ID: () => WORKSPACE_PLUGIN_ID,
  default: () => MyPlugin
});
var import_obsidian = __toModule(require("obsidian"));
var DEFAULT_SETTINGS = {
  mySetting: "default"
};
var MyPlugin = class extends import_obsidian.Plugin {
  onload() {
    return __async(this, null, function* () {
      let cm = global.CodeMirror;
      yield this.loadSettings();
      cm.Vim.unmap("<Space>");
      mkMapping("move-left", "<Space>h", moveLeft, cm);
      mkMapping("move-right", "<Space>l", moveRight, cm);
      mkMapping("move-up", "<Space>k", moveUp, cm);
      mkMapping("move-down", "<Space>j", moveDown, cm);
      mkMapping("close-window", "<Space>c", closeWindow, cm);
      mkMapping("find-files", "<Space><Space>", quickSwitch, cm);
      mkMapping("files", "-", files, cm);
      mkMapping("graph", "<Space>g", graph, cm);
      mkMapping("graph-local", "<Space>f", graphLocal, cm);
      mkMapping("new-workspace", "<Space>q", () => withWorkspace(mkWorkspace), cm);
      mkMapping("next-workspace", "<Space>o", () => withWorkspace(nextWorkspace), cm);
      mkMapping("prev-workspace", "<Space>i", () => withWorkspace(prevWorkspace), cm);
      mkMapping("del-workspace", "<Space>Q", () => withWorkspace(delWorkspace), cm);
    });
  }
  onunload() {
  }
  loadSettings() {
    return __async(this, null, function* () {
      this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
    });
  }
  saveSettings() {
    return __async(this, null, function* () {
      yield this.saveData(this.settings);
    });
  }
};
function moveOrSplit(toMove, toSplit, fixSplit) {
  let old = global.app.workspace.activeLeaf;
  global.app.commands.executeCommandById(toMove);
  if (old != global.app.workspace.activeLeaf) {
    return;
  }
  global.app.commands.executeCommandById(toSplit);
  if (fixSplit) {
    global.app.commands.executeCommandById(toMove);
  }
}
var ver = "workspace:split-vertical";
var hor = "workspace:split-horizontal";
var left = "editor:focus-left";
var right = "editor:focus-right";
var up = "editor:focus-top";
var down = "editor:focus-bottom";
function mkMapping(name, key, action, cm) {
  cm.Vim.defineAction(name, action);
  cm.Vim.mapCommand(key, "action", name, {}, { "context": "normal", "isEdit": false });
}
function moveRight() {
  moveOrSplit(right, ver, true);
}
function moveLeft() {
  moveOrSplit(left, ver, false);
}
function moveDown() {
  moveOrSplit(down, hor, true);
}
function moveUp() {
  moveOrSplit(up, hor, false);
}
function closeWindow() {
  global.app.commands.executeCommandById("workspace:close");
}
function quickSwitch() {
  global.app.commands.executeCommandById("switcher:open");
}
function files() {
  global.app.commands.executeCommandById("file-explorer:reveal-active-file");
}
function graph() {
  global.app.commands.executeCommandById("graph:open");
}
function graphLocal() {
  global.app.commands.executeCommandById("graph:open-local");
}
var WORKSPACE_PLUGIN_ID = "workspaces";
function getWorkspaces() {
  let o = getInternalPluginById(this.app, WORKSPACE_PLUGIN_ID);
  if (!o) {
    console.log("no workspaces plugin");
    return null;
  }
  if (!o.enabled) {
    console.log("workspaces plugin not enabled");
    return null;
  }
  return o.instance;
}
function getInternalPluginById(app, id) {
  var _a;
  return (_a = app.internalPlugins) == null ? void 0 : _a.getPluginById(id);
}
function isNumeric(s) {
  return /^\d+$/.test(s);
}
function numericWorkspaces(w) {
  return Object.keys(w.workspaces).filter(isNumeric);
}
function withWorkspace(f) {
  let w = getWorkspaces();
  if (w) {
    return f(w);
  }
}
function seekWorkspace(w, off, is_deleting = false) {
  let old = w.activeWorkspace;
  let candidates = numericWorkspaces(w);
  if (candidates.length == 0) {
    return null;
  }
  let log_max = is_deleting ? candidates.length - 1 : candidates.length;
  if (!isNumeric(old)) {
    new import_obsidian.Notice("Default Tab " + 0 + "/" + log_max);
    return candidates[0];
  }
  let old_idx = candidates.findIndex((s) => s == old);
  let new_idx = (old_idx + off + candidates.length) % candidates.length;
  new import_obsidian.Notice("Tab " + (new_idx + 1) + "/" + log_max);
  return candidates[new_idx];
}
function loadWorkspaces(w, id) {
  if (w.activeWorkspace) {
    w.saveWorkspace(w.activeWorkspace);
  }
  w.loadWorkspace(id);
  w.setActiveWorkspace(id);
}
function mkWorkspace(w) {
  let c = numericWorkspaces(w);
  let next = c.length ? parseInt(c[c.length - 1]) + 1 : 1;
  let count = c.length + 1;
  if (w.activeWorkspace) {
    w.saveWorkspace(w.activeWorkspace);
  } else if (next == 1) {
    w.saveWorkspace("" + next);
    next = next + 1;
    count += 1;
  }
  new import_obsidian.Notice("New Tab " + count + "/" + count);
  w.saveWorkspace("" + next);
  w.setActiveWorkspace("" + next);
}
function nextWorkspace(w) {
  loadWorkspaces(w, seekWorkspace(w, 1));
}
function prevWorkspace(w) {
  loadWorkspaces(w, seekWorkspace(w, -1));
}
function delWorkspace(w) {
  let cur = w.activeWorkspace;
  let prev = seekWorkspace(w, -1, true);
  if (prev != cur) {
    loadWorkspaces(w, prev);
  }
  w.deleteWorkspace(cur);
}
