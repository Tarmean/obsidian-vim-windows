import * as CodeMirror from 'codemirror';
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}


export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
    codeMirrorVimObject: any;
    editorMode: "cm5"|"cm6";

	async onload() {
		this.registerEvent(this.app.workspace.on('file-open', (_file: TFile) => {
            let view = this.getActiveView();
            this.doLoad(view);
        }));
        // todo: map escape
        // - nohighlight
        // - return to editor window
	}
	private getActiveView(): MarkdownView {
		return this.app.workspace.getActiveViewOfType(MarkdownView);
	}
    private doLoad(view: MarkdownView) {
        if ((this.app.vault as any).config?.legacyEditor) {

            this.codeMirrorVimObject = (window.CodeMirror as any).Vim;
            this.editorMode = 'cm5';
            console.log('Vim Spaces plugin: using CodeMirror 5 mode');
        } else {
            this.codeMirrorVimObject = (window as any).CodeMirrorAdapter?.Vim;
            this.editorMode = 'cm6';
            console.log('Vim Spaces plugin: using CodeMirror 6 mode');
        }
        if (!this.codeMirrorVimObject || this.codeMirrorVimObject.loadedSpaces) { return; }
        let cm = this.getCodeMirror(view);
        if (!cm) { return; }
        console.log("Vim Spaces loading");
        this.codeMirrorVimObject.unmap('<Space>');
        this.codeMirrorVimObject.loadedSpaces = true;
        this.mkMapping("moveleft", "<Space>h", moveLeft, cm);
        this.mkMapping("moveright", "<Space>l", moveRight, cm);
        this.mkMapping("moveup", "<Space>k", moveUp, cm);
        this.mkMapping("movedown", "<Space>j", moveDown, cm);
        this.mkMapping("closewindow", "<Space>c", closeWindow, cm);
        this.mkMapping("findfiles", "<Space><Space>", quickSwitch, cm);
        this.mkMapping("files", "-", files, cm);
        this.mkMapping("graph", "<Space>g", graph, cm);
        this.mkMapping("graphlocal", "<Space>f", graphLocal, cm);
        this.mkMapping("newworkspace", "<Space>q", () => withWorkspace(mkWorkspace), cm);
        this.mkMapping("nextworkspace", "<Space>o", () => withWorkspace(nextWorkspace), cm);
        this.mkMapping("prevworkspace", "<Space>i", () =>withWorkspace(prevWorkspace), cm);
        this.mkMapping("delworkspace", "<Space>Q", () => withWorkspace(delWorkspace), cm);

    }
    private mkMapping(name: string, key: string, action:any, cm:any) {
            // this.codeMirrorVimObject.defineEx(name, '', action);
            // console.log(`nnoremap ${key} :${name}<cr>`);
            // this.codeMirrorVimObject.handleEx(cm, `nnoremap ${key} :${name}<cr>`);
            // this.codeMirrorVimObject.de(cm, `nnoremap ${key} :${name}<cr>`);
            console.log(`defineEx(${name} ,"", ${action}`);
            this.codeMirrorVimObject.defineEx(name, "", action);
            this.codeMirrorVimObject.handleEx(cm, `nmap ${key} :${name}` );
    }

    private getCodeMirror(view: MarkdownView): CodeMirror.Editor {
            if (this.editorMode == 'cm6')
                {return (view as any).sourceMode?.cmEditor.cm.cm;} 
            else
                {return (view as any).sourceMode?.cmEditor;}
        }

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}

function moveOrSplit(toMove: string, toSplit: string, fixSplit: boolean) {
    let old = (global as any).app.workspace.activeLeaf;
    (global as any).app.commands.executeCommandById(toMove);
    if (old != (global as any).app.workspace.activeLeaf) {
        return;
    }

    (global as any).app.commands.executeCommandById(toSplit);
    if (fixSplit) {
        (global as any).app.commands.executeCommandById(toMove);
    }
}

let ver = "workspace:split-vertical"
let hor = "workspace:split-horizontal"
let left = "editor:focus-left"
let right = "editor:focus-right"
let up = "editor:focus-top"
let down = "editor:focus-bottom"


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
    (global as any).app.commands.executeCommandById("workspace:close");
}
function quickSwitch() {
    (global as any).app.commands.executeCommandById("switcher:open");
}
function focusEditor() {
    (global as any).app.commands.executeCommandById("editor:focus");
}
function files() {
    (global as any).app.commands.executeCommandById("file-explorer:reveal-active-file");
}
function graph() {
    (global as any).app.commands.executeCommandById("graph:open");
}
function graphLocal() {
    (global as any).app.commands.executeCommandById("graph:open-local");
}

export const WORKSPACE_PLUGIN_ID = 'workspaces';

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
function getInternalPluginById(app: App, id: string) {
  return (app as any).internalPlugins?.getPluginById(id);
}

function isNumeric(s: string) {
    return /^\d+$/.test(s);
}
function numericWorkspaces(w:any) {
    return Object.keys(w.workspaces).filter(isNumeric);
}

function withWorkspace(f:any) {
    let w = getWorkspaces();
    if (w) {
        return f(w);
    }
}
function seekWorkspace(w:any, off: number, is_deleting:boolean=false):string {
    let old = w.activeWorkspace;
    let candidates = numericWorkspaces(w);
    if (candidates.length==0) {
        return null;
    }
    let log_max = is_deleting?candidates.length-1:candidates.length;
    if (!isNumeric(old)) {
        new Notice("Default Tab " + 0 + "/" + log_max);
        return candidates[0];
    }
    let old_idx = candidates.findIndex(s => s == old);
    let new_idx = ((old_idx + off + candidates.length) % candidates.length);
    new Notice("Tab " + (new_idx+1) + "/" + log_max);
    return candidates[new_idx];
}

function loadWorkspaces(w:any, id:string) {
    if (w.activeWorkspace) {
        w.saveWorkspace(w.activeWorkspace);
    }
    w.loadWorkspace(id);
    w.setActiveWorkspace(id);
}
function mkWorkspace(w:any) {
    let c = numericWorkspaces(w);
    let next = c.length? parseInt(c[c.length-1])+1: 1;
    let count = c.length+1
    if (w.activeWorkspace) {
        w.saveWorkspace(w.activeWorkspace);
    } else if (next == 1) {
        w.saveWorkspace(""+next);
        next = next + 1
        count += 1 
    }
    new Notice("New Tab " + count + "/" + count);
    w.saveWorkspace(""+next);
    w.setActiveWorkspace(""+next);
}
function nextWorkspace(w:any) {
    loadWorkspaces(w, seekWorkspace(w, 1))
}
function prevWorkspace(w:any) {
    loadWorkspaces(w, seekWorkspace(w, -1))
}
function delWorkspace(w:any) {
    let cur = w.activeWorkspace
    let prev = seekWorkspace(w, -1, true)
    if (prev != cur) {
        loadWorkspaces(w, prev)
    }
    w.deleteWorkspace(cur)
}
