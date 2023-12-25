// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import child_process = require("child_process");
import { promises } from "dns";
import * as vscode from 'vscode';

////////////////////////////////////////////////////////////////////////////

/// strings Helpers
function strContains(word: string, pattern: string) {
	return word.indexOf(pattern) > -1;
}

function strEquals(word: string, pattern: string) {
	return word === pattern;
}

/// configuration helpers
function config<T>(key: string, defaultValue?: any): T {
	const cmake_conf = vscode.workspace.getConfiguration('cmake');
	return cmake_conf.get<T>(key, defaultValue);
}

function commandArgs2Array(text: string): string[] {
	const re = /^"[^"]*"$/; // Check if argument is surrounded with double-quotes
	const re2 = /^([^"]|[^"].*?[^"])$/; // Check if argument is NOT surrounded with double-quotes

	let arr: string[] = [];
	let argPart: string | null = null;

	text && text.split(" ").forEach(function (arg) {
		if ((re.test(arg) || re2.test(arg)) && !argPart) {
			arr.push(arg);
		} else {
			argPart = argPart ? argPart + " " + arg : arg;
			// If part is complete (ends with a double quote), we can add it to the array
			if (/"$/.test(argPart)) {
				arr.push(argPart);
				argPart = null;
			}
		}
	});
	return arr;
}

let cmake = (args: string[]): Promise<string> => {
	return new Promise(function (resolve, reject) {
		let cmake_config = config<string>('cmakePath', 'cmake');
		let cmake_args = commandArgs2Array(cmake_config);
		let cmd = child_process.spawn(cmake_args[0], cmake_args.slice(1, cmake_args.length)
			.concat(args.map(arg => { return arg.replace(/\r/gm, ''); })));
		let stdout: string = '';
		cmd.stdout.on('data', function (data) {
			var txt: string = data.toString();
			stdout += txt.replace(/\r/gm, '');
		});
		cmd.on("error", function (error) {
			if (error && (<any>error).code === 'ENOENT') {
				vscode.window.showInformationMessage('The "cmake" command is not found in PATH.  Install it or use `cmake.cmakePath` in the workspace settings to define the CMake executable binary.');
			}
			reject();
		});
		cmd.on('exit', function (code) {
			resolve(stdout);
		});
	});
};

let eon = (): Promise<string> => {
	return new Promise(function (resolve, reject) {
		return resolve("eon_add_library\neon_add_executable\neon_add_protobuf\neon_add_executable_test");
	});
};

// 提取出 cmake 的版本
function _extractVersion(output: string): string {
	let re = /cmake\s+version\s+(\d+.\d+.\d+)/;
	if (re.test(output)) {
		let result = re.exec(output);
		if (result === null) {
			return '';
		}
		else {
			return result[1];
		}
	}
	return '';
}

async function cmake_version(): Promise<string> {
	let cmd_output = await cmake(['--version']);
	let version = _extractVersion(cmd_output);
	return version;
}

// Return the url for the online help based on the cmake executable binary used
async function cmake_help_url() {
	let base_url = 'https://cmake.org/cmake/help';
	let version = await cmake_version();
	if (version.length > 0) {
		if (version >= '3.0') {
			let re = /(\d+.\d+).\d+/;
			version = version.replace(re, '$1/');
		} else {
			let older_versions = [
				'2.8.12', '2.8.11', '2.8.10', '2.8.9', '2.8.8', '2.8.7', '2.8.6', '2.8.5', '2.8.4', '2.8.3', '2.8.2', '2.8.1', '2.8.0', '2.6'
			];
			if (older_versions.indexOf(version) === -1) {
				version = 'latest/';
			} else {
				version = version + '/cmake.html';
			}
		}
	} else {
		version = 'latest/';
	}
	return base_url + '/v' + version;
}

// return the cmake command list
function cmake_help_command_list(): Promise<string> {
	return cmake(['--help-command-list']);
}

function cmake_help_command(name: string): Promise<string> {
	return cmake_help_command_list()
		.then(function (result: string) {
			let contains = result.indexOf(name) > -1;
			return new Promise(function (resolve, reject) {
				if (contains) {
					resolve(name);
				} else {
					reject('not found');
				}
			});
		}, function (e) { })
		.then(function (n: any) {
			return cmake(['--help-command', n]);
		}, null);
}

function cmake_help_variable_list(): Promise<string> {
	return cmake(['--help-variable-list']);
}

function cmake_help_variable(name: string): Promise<string> {
	return cmake_help_variable_list()
		.then(function (result: string) {
			let contains = result.indexOf(name) > -1;
			return new Promise(function (resolve, reject) {
				if (contains) {
					resolve(name);
				} else {
					reject('not found');
				}
			});
		}, function (e) { }).then(function (name: any) { return cmake(['--help-variable', name]); }, null);
}

function cmake_help_property_list(): Promise<string> {
	return cmake(['--help-property-list']);
}

function cmake_help_property(name: string): Promise<string> {
	return cmake_help_property_list()
		.then(function (result: string) {
			let contains = result.indexOf(name) > -1;
			return new Promise(function (resolve, reject) {
				if (contains) {
					resolve(name);
				} else {
					reject('not found');
				}
			});
		}, function (e) { }).then(function (name: any) { return cmake(['--help-property', name]); }, null);
}

function cmake_help_module_list(): Promise<string> {
	return cmake(['--help-module-list']);
}

function cmake_help_module(name: string): Promise<string> {
	return cmake_help_module_list()
		.then(function (result: string) {
			let contains = result.indexOf(name) > -1;
			return new Promise(function (resolve, reject) {
				if (contains) {
					resolve(name);
				} else {
					reject('not found');
				}
			});
		}, function (e) { }).then(function (name: any) { return cmake(['--help-module', name]); }, null);
}


function cmake_help_all() {
	let promises = {
		'function': (name: string) => {
			return cmake_help_command(name);
		},
		'module': (name: string) => {
			return cmake_help_module(name);
		},
		'variable': (name: string) => {
			return cmake_help_variable(name);
		}
		,
		'property': (name: string) => {
			return cmake_help_property(name);
		},
		'eon': (name: string) => {
			return eon_help(name);
		}
	};
	return promises;
}

/**
 * @brief 根据输出的 string 类型获取补全的类型
 * @param kind 
 * @returns 
 */
function vscodeKindFromCMakeCodeClass(kind: string): vscode.CompletionItemKind {
	switch (kind) {
		case "function":
			return vscode.CompletionItemKind.Function;
		case "variable":
			return vscode.CompletionItemKind.Variable;
		case "module":
			return vscode.CompletionItemKind.Module;
	}
	return vscode.CompletionItemKind.Property; // TODO@EG additional mappings needed?
}

/**
 * @brief 根据补全类型获取字符串类型
 * @param kind 
 * @returns 
 */
function cmakeTypeFromvscodeKind(kind: vscode.CompletionItemKind): string {
	switch (kind) {
		case vscode.CompletionItemKind.Function:
			return "function";
		case vscode.CompletionItemKind.Variable:
			return "variable";
		case vscode.CompletionItemKind.Module:
			return "module";
	}
	return "property";
}

function suggestionsHelper(cmake_cmd: any, currentWord: string, type: string, insertText: any, matchPredicate: any): Thenable<vscode.CompletionItem[]> {
	return new Promise(function (resolve, reject) {
		cmake_cmd.then(function (stdout: string) {
			let commands = stdout.split('\n').filter(function (v) { return matchPredicate(v, currentWord); });
			if (commands.length > 0) {
				let suggestions = commands.map(function (command_name) {
					var item = new vscode.CompletionItem(command_name);
					item.kind = vscodeKindFromCMakeCodeClass(type);
					if (insertText === null || insertText === '') {
						item.insertText = command_name;
					} else {
						let snippet = new vscode.SnippetString(insertText(command_name));

						item.insertText = snippet;
					}
					return item;
				});
				resolve(suggestions);
			} else {
				resolve([]);
			}

		}).catch(function (err: any) {
			reject(err);
		});
	});
}
function cmModuleInsertText(module: string) {
	if (module.indexOf('Find') === 0) {
		return 'find_package(' + module.replace('Find', '') + '${1: REQUIRED})';
	} else {
		return 'include(' + module + ')';
	}
}

function cmFunctionInsertText(func: string) {
	let scoped_func = ['if', 'function', 'while', 'macro', 'foreach'];
	let is_scoped = scoped_func.reduceRight(function (prev, name, idx, array) { return prev || func === name; }, false);
	if (is_scoped) {
		return func + '(${1})\n\t\nend' + func + '(${1})\n';
	}
	else {
		return func + '(${1})';
	}
}

function cmVariableInsertText(variable: string) {
	return variable.replace(/<(.*)>/g, '${1:<$1>}');
}
function cmPropetryInsertText(variable: string) {
	return variable.replace(/<(.*)>/g, '${1:<$1>}');
}

///////////////////////////////////////////////////////////////
// eon 命令提示
function cmEONCommandsSuggestions(currentWord: string): Thenable<vscode.CompletionItem[]> {
	let cmd = eon_help_list();
	return suggestionsHelper(cmd, currentWord, 'eon', cmEonInsertText, strContains);
}

function cmEonInsertText(func: string) {
	let scoped_func = ['eon'];
	let is_scoped = scoped_func.reduceRight(function (prev, name, idx, array) { return prev || func === name; }, false);
	if (is_scoped) {
		return func + '(${1})\n\t\nend' + func + '(${1})\n';
	}
	else {
		return func + '(${1})';
	}
}

function eon_help_list(): Promise<string> {
	return eon();
}

function eon_help(name: string): Promise<string> {
	return eon_help_list()
		.then(function (result: string) {
			let contains = result.indexOf(name) > -1;
			return new Promise(function (resolve, reject) {
				if (contains) {
					resolve(name);
				} else {
					reject('not found');
				}
			});
		}, function (e) { }).then(function (name: any) { return eon(); }, null);
}

///////////////////////////////////////////////////////////////


// cmake 命令提示
function cmCommandsSuggestions(currentWord: string): Thenable<vscode.CompletionItem[]> {
	let cmd = cmake_help_command_list();
	return suggestionsHelper(cmd, currentWord, 'function', cmFunctionInsertText, strContains);
}

function cmVariablesSuggestions(currentWord: string): Thenable<vscode.CompletionItem[]> {
	let cmd = cmake_help_variable_list();
	return suggestionsHelper(cmd, currentWord, 'variable', cmVariableInsertText, strContains);
}


function cmPropertiesSuggestions(currentWord: string): Thenable<vscode.CompletionItem[]> {
	let cmd = cmake_help_property_list();
	return suggestionsHelper(cmd, currentWord, 'property', cmPropetryInsertText, strContains);
}

function cmModulesSuggestions(currentWord: string): Thenable<vscode.CompletionItem[]> {
	let cmd = cmake_help_module_list();
	return suggestionsHelper(cmd, currentWord, 'module', cmModuleInsertText, strContains);
}

function cmCommandsSuggestionsExact(currentWord: string): Thenable<vscode.CompletionItem[]> {
	let cmd = cmake_help_command_list();
	return suggestionsHelper(cmd, currentWord, 'function', cmFunctionInsertText, strEquals);
}

function cmVariablesSuggestionsExact(currentWord: string): Thenable<vscode.CompletionItem[]> {
	let cmd = cmake_help_variable_list();
	return suggestionsHelper(cmd, currentWord, 'variable', cmVariableInsertText, strEquals);
}


function cmPropertiesSuggestionsExact(currentWord: string): Thenable<vscode.CompletionItem[]> {
	let cmd = cmake_help_property_list();
	return suggestionsHelper(cmd, currentWord, 'property', cmPropetryInsertText, strEquals);
}

function cmModulesSuggestionsExact(currentWord: string): Thenable<vscode.CompletionItem[]> {
	let cmd = cmake_help_module_list();
	return suggestionsHelper(cmd, currentWord, 'module', cmModuleInsertText, strEquals);
}

/**
 * @brief 自动补全插件，继承于 vscode.CompletionItemProvider
 */
class CMakeSuggestionSupport implements vscode.CompletionItemProvider {
	public excludeTokens: string[] = ['string', 'comment', 'numeric'];

	public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]> {
		let wordAtPosition = document.getWordRangeAtPosition(position);
		var currentWord = '';
		if (wordAtPosition && wordAtPosition.start.character < position.character) {
			var word = document.getText(wordAtPosition);
			currentWord = word.substr(0, position.character - wordAtPosition.start.character);
			console.log('--------> currentWord = ', currentWord);
		}

		return new Promise(function (resolve, reject) {
			Promise.all([
				// 支持 eon cmake 指令集成
				cmEONCommandsSuggestions(currentWord),
				// cmake 原生指令集成
				cmCommandsSuggestions(currentWord),
				cmVariablesSuggestions(currentWord),
				cmPropertiesSuggestions(currentWord),
				cmModulesSuggestions(currentWord)
			]).then(function (results) {
				var suggestions = Array.prototype.concat.apply([], results);
				resolve(suggestions);
			}).catch(err => { reject(err); });
		});
	}

	public resolveCompletionItem(item: vscode.CompletionItem, token: vscode.CancellationToken): Thenable<vscode.CompletionItem> {
		let promises: any = cmake_help_all();
		let type = cmakeTypeFromvscodeKind(item.kind!);

		return promises[type](item.label).then(function (result: string) {
			item.documentation = result.split('\n')[3];
			return item;
		});

	}
}

/**
 * @brief 悬停提示类, 继承官方 vscode.HoverProvider 类
 */
class CMakeExtraInfoSupport implements vscode.HoverProvider {

	public provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.Hover> {
		let range = document.getWordRangeAtPosition(position);
		let value = document.getText(range);
		let promises: any = cmake_help_all();

		return Promise.all([
			cmCommandsSuggestionsExact(value),
			cmVariablesSuggestionsExact(value),
			cmModulesSuggestionsExact(value),
			cmPropertiesSuggestionsExact(value),
		]).then(function (results) {
			var suggestions = Array.prototype.concat.apply([], results);
			if (suggestions.length === 0) {
				return null;
			}
			let suggestion: vscode.CompletionItem = suggestions[0];

			return promises[cmakeTypeFromvscodeKind(suggestion.kind!)](suggestion.label).then(function (result: string) {
				let lines = result.split('\n');
				lines = lines.slice(2, lines.length);
				let hover = new vscode.Hover({ language: 'md', value: lines.join('\n') });
				return hover;
			});
		});
	}
}


async function cmake_online_help(search: string) {
	let url = await cmake_help_url();
	let v2x = url.endsWith('html'); // cmake < 3.0 
	return Promise.all([
		cmCommandsSuggestionsExact(search),
		cmVariablesSuggestionsExact(search),
		cmModulesSuggestionsExact(search),
		cmPropertiesSuggestionsExact(search),
	]).then(function (results) {
		var opener = require("opener");

		var suggestions = Array.prototype.concat.apply([], results);

		if (suggestions.length === 0) {
			search = search.replace(/[<>]/g, '');
			if (v2x || search.length === 0) {
				opener(url);
			} else {
				opener(url + 'search.html?q=' + search + '&check_keywords=yes&area=default');
			}
		} else {
			let suggestion = suggestions[0];
			let type = cmakeTypeFromvscodeKind(suggestion.kind);
			if (type === 'property') {
				if (v2x) {
					opener(url);
				} else {
					// TODO : needs to filter properties per scope to detect the right URL
					opener(url + 'search.html?q=' + search + '&check_keywords=yes&area=default');
				}
			} else {
				if (type === 'function') {
					type = 'command';
				}
				search = search.replace(/[<>]/g, '');
				if (v2x) {
					opener(url + '#' + type + ':' + search);
				} else {
					opener(url + type + '/' + search + '.html');
				}
			}
		}
	});
}


////////////////////////////////////////////////////////////////////////////////////////

// 激活函数
export function activate(context: vscode.ExtensionContext) {

	console.log(
		'Congratulations, your extension "extension.sayHello" is now active!');

	let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
		vscode.window.showInformationMessage('Hello World EON!');
	});

	let getCurPath = vscode.commands.registerCommand(
		'extension.demo.getCurrentFilePath', (uri) => {
			vscode.window.showInformationMessage(
				`当前文件(夹)路径是：${uri ? uri.path : '空'}`);
		});

	// 编辑器命令
	context.subscriptions.push(vscode.commands.registerTextEditorCommand(
		'extension.demo.testEditorCommand', (textEditor, edit) => {
			console.log('您正在执行编辑器命令！');
			console.log(textEditor, edit);
		}));

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.demo.testMenuShow', () => {
			vscode.window.showInformationMessage(`你点我干啥，我长得很帅吗？`);
		}));

	const provide = vscode.languages.registerCompletionItemProvider('cmake', {
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
			const linePrefix = document.lineAt(position).text.slice(0, position.character);
			if (!linePrefix.startsWith('eon.')) {
				return undefined;
			}
			return [
				new vscode.CompletionItem('eonlog', vscode.CompletionItemKind.Method),
				new vscode.CompletionItem('eon', vscode.CompletionItemKind.Method)
			];
		}
	}, '.');

	const provide2 = vscode.languages.registerCompletionItemProvider('cmake', {
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

			// get all text until the `position` and check if it reads `console.`
			// and if so then complete if `log`, `warn`, and `error`
			const linePrefix = document.lineAt(position).text.slice(0, position.character);
			if (!linePrefix.endsWith('console.')) {
				return undefined;
			}
			return [
				new vscode.CompletionItem('log', vscode.CompletionItemKind.Method),
				new vscode.CompletionItem('warn', vscode.CompletionItemKind.Method),
				new vscode.CompletionItem('error', vscode.CompletionItemKind.Method),
			];
		}
	}, '.');

	const provider1 = vscode.languages.registerCompletionItemProvider('plaintext', {

		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

			// a simple completion item which inserts `Hello World!`
			const simpleCompletion = new vscode.CompletionItem('Hello World!');

			// a completion item that inserts its text as snippet,
			// the `insertText`-property is a `SnippetString` which will be
			// honored by the editor.
			const snippetCompletion = new vscode.CompletionItem('Good part of the day');
			snippetCompletion.insertText = new vscode.SnippetString('Good ${1|morning,afternoon,evening|}. It is ${1}, right?');
			const docs: any = new vscode.MarkdownString("Inserts a snippet that lets you select [link](x.ts).");
			snippetCompletion.documentation = docs;
			docs.baseUri = vscode.Uri.parse('http://example.com/a/b/c/');

			// a completion item that can be accepted by a commit character,
			// the `commitCharacters`-property is set which means that the completion will
			// be inserted and then the character will be typed.
			const commitCharacterCompletion = new vscode.CompletionItem('console');
			commitCharacterCompletion.commitCharacters = ['.'];
			commitCharacterCompletion.documentation = new vscode.MarkdownString('Press `.` to get `console.`');

			// a completion item that retriggers IntelliSense when being accepted,
			// the `command`-property is set which the editor will execute after 
			// completion has been inserted. Also, the `insertText` is set so that 
			// a space is inserted after `new`
			const commandCompletion = new vscode.CompletionItem('new');
			commandCompletion.kind = vscode.CompletionItemKind.Keyword;
			commandCompletion.insertText = 'new ';
			commandCompletion.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };

			// return all completion items as array
			return [
				simpleCompletion,
				snippetCompletion,
				commitCharacterCompletion,
				commandCompletion
			];
		}
	});
	const provide3 = vscode.languages.registerCompletionItemProvider('cmake', {
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
			const line = document.lineAt(position);
			const json = require('../package.json');
			const dependencies = Object.keys(json.dependencies || {}).concat(Object.keys(json.devDependencies || {}));
			return dependencies.map(dep => {
				return new vscode.CompletionItem(dep, vscode.CompletionItemKind.Field);
			});
		}
	}, '.');
	// resgister
	context.subscriptions.push(disposable, getCurPath);
	context.subscriptions.push(provide, provider1, provide2, provide3);

	// LANGUAGE register

	const CMAKE_LANGUAGE = 'cmake';
	const CMAKE_SELECTOR: vscode.DocumentSelector = [
		{ language: CMAKE_LANGUAGE, scheme: 'file' },
		{ language: CMAKE_LANGUAGE, scheme: 'untitled' },
	];
	vscode.languages.registerHoverProvider(CMAKE_SELECTOR, new CMakeExtraInfoSupport());
	vscode.languages.registerCompletionItemProvider(CMAKE_SELECTOR, new CMakeSuggestionSupport());
	vscode.languages.setLanguageConfiguration(CMAKE_LANGUAGE, {
		indentationRules: {
			// ^(.*\*/)?\s*\}.*$
			decreaseIndentPattern: /^(.*\*\/)?\s*\}.*$/,
			// ^.*\{[^}"']*$
			increaseIndentPattern: /^.*\{[^}"']*$/
		},
		wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
		comments: {
			lineComment: '#'
		},
		brackets: [
			['{', '}'],
			['(', ')'],
		],

		__electricCharacterSupport: {
			brackets: [
				{ tokenType: 'delimiter.curly.ts', open: '{', close: '}', isElectric: true },
				{ tokenType: 'delimiter.square.ts', open: '[', close: ']', isElectric: true },
				{ tokenType: 'delimiter.paren.ts', open: '(', close: ')', isElectric: true }
			]
		},

		__characterPairSupport: {
			autoClosingPairs: [
				{ open: '{', close: '}' },
				{ open: '(', close: ')' },
				{ open: '"', close: '"', notIn: ['string'] },
			]
		}
	});
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log('插件扩展 vscode plugin demo 已被释放!');
}
