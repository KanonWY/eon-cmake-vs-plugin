// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import child_process = require("child_process");
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

////////////////////////////////////////////////////////////////////////////

/// strings Helpers
function strContains(word: string, pattern: string) {
  return word.indexOf(pattern) > -1;
}

function strEquals(word: string, pattern: string) { return word === pattern; }

/// configuration helpers
function config<T>(key: string, defaultValue?: any): T {
  const cmake_conf = vscode.workspace.getConfiguration('cmake');
  return cmake_conf.get<T>(key, defaultValue);
}

function commandArgs2Array(text: string): string[] {
  const re = /^"[^"]*"$/; // Check if argument is surrounded with double-quotes
  const re2 = /^([^"]|[^"].*?[^"])$/; // Check if argument is NOT surrounded
  // with double-quotes

  let arr: string[] = [];
  let argPart: string|null = null;

  text && text.split(" ").forEach(function(arg) {
    if ((re.test(arg) || re2.test(arg)) && !argPart) {
      arr.push(arg);
    } else {
      argPart = argPart ? argPart + " " + arg : arg;
      // If part is complete (ends with a double quote), we can add it to the
      // array
      if (/"$/.test(argPart)) {
        arr.push(argPart);
        argPart = null;
      }
    }
  });
  return arr;
}

let cmake = (args: string[]): Promise<string> => {
  return new Promise(function(resolve, reject) {
    let cmake_config = config<string>('eoncmakePath', 'cmake');
    let cmake_args = commandArgs2Array(cmake_config);
    let cmd = child_process.spawn(
        cmake_args[0],
        cmake_args.slice(1, cmake_args.length)
            .concat(args.map(arg => { return arg.replace(/\r/gm, ''); })));
    let stdout: string = '';
    cmd.stdout.on('data', function(data) {
      var txt: string = data.toString();
      stdout += txt.replace(/\r/gm, '');
    });
    cmd.on("error", function(error) {
      if (error && (<any>error).code === 'ENOENT') {
        vscode.window.showInformationMessage(
            'The "cmake" command is not found in PATH.  Install it or use `cmake.cmakePath` in the workspace settings to define the CMake executable binary.');
      }
      reject();
    });
    cmd.on('exit', function(code) { resolve(stdout); });
  });
};

function readDocFromMarkdownFile(eon_command_str: string): string {
  const docDir = path.join(__dirname, '../doc');
  let curDoc = docDir + '/' + eon_command_str + '.md';
  let fileStr;
  let labeStr;
  let document;
  try {
    fileStr = fs.readFileSync(curDoc, 'utf8');
    const lines = fileStr.split('\n');
    let markdownContent = new vscode.MarkdownString();
    markdownContent.appendMarkdown(lines[0]);
    let sig = new vscode.SignatureInformation(lines[2], markdownContent);
    eon_sig_map.set(eon_command_str, sig);
  } catch (err) {
    fileStr = 'no markdown doc';
  }
  return fileStr;
}

let eon_command_arr = new Array();
let eon_doc_map = new Map();
let eon_sig_map = new Map();
let eon_complete_string = '';

function fillEonCommandMap() {
  // get all md file in special directory.
  const DocDir = path.join(__dirname, '../doc');
  const items = fs.readdirSync(DocDir);
  for (const item of items) {
    const itemPath = path.join(DocDir, item);
    const stats = fs.statSync(itemPath);
    if (stats.isFile() && item.endsWith('.md')) {
      let index = item.indexOf('.md');
      let filename = item.slice(0, index);
      eon_command_arr.push(filename);
    }
  }
}

function fillEonDocMap() {
  for (let eonCmdStr of eon_command_arr) {
    eon_doc_map.set(eonCmdStr, readDocFromMarkdownFile(eonCmdStr));
  }
}

function fillEonCompleteString() {
  for (let eonCmdStr of eon_command_arr) {
    eon_complete_string = eon_complete_string.concat('\n').concat(eonCmdStr);
  }
}

let eon = (): Promise<string> => {
  return new Promise(function(resolve,
                              reject) { return resolve(eon_complete_string); });
};

let eon_doc = (eon_command_str: string): Promise<string> => {
  return new Promise(function(resolve, reject) {
    let res = eon_doc_map.get(eon_command_str);
    return resolve(res);
  });
};

function cmake_help_command_list(): Promise<string> {
  return cmake([ '--help-command-list' ]);
}

function cmake_help_command(name: string): Promise<string> {
  return cmake_help_command_list()
      .then(
          function(result: string) {
            let contains = result.indexOf(name) > -1;
            return new Promise(function(resolve, reject) {
              if (contains) {
                resolve(name);
              } else {
                reject('not found');
              }
            });
          },
          function(e) {})
      .then(function(n: any) {
        return cmake([ '--help-command', n ]);
      }, null);
}

function cmake_help_variable_list(): Promise<string> {
  return cmake([ '--help-variable-list' ]);
}

function cmake_help_variable(name: string): Promise<string> {
  return cmake_help_variable_list()
      .then(
          function(result: string) {
            let contains = result.indexOf(name) > -1;
            return new Promise(function(resolve, reject) {
              if (contains) {
                resolve(name);
              } else {
                reject('not found');
              }
            });
          },
          function(e) {})
      .then(function(name: any) {
        return cmake([ '--help-variable', name ]);
      }, null);
}

function cmake_help_property_list(): Promise<string> {
  return cmake([ '--help-property-list' ]);
}

function cmake_help_property(name: string): Promise<string> {
  return cmake_help_property_list()
      .then(
          function(result: string) {
            let contains = result.indexOf(name) > -1;
            return new Promise(function(resolve, reject) {
              if (contains) {
                resolve(name);
              } else {
                reject('not found');
              }
            });
          },
          function(e) {})
      .then(function(name: any) {
        return cmake([ '--help-property', name ]);
      }, null);
}

function cmake_help_module_list(): Promise<string> {
  return cmake([ '--help-module-list' ]);
}

function cmake_help_module(name: string): Promise<string> {
  return cmake_help_module_list()
      .then(
          function(result: string) {
            let contains = result.indexOf(name) > -1;
            return new Promise(function(resolve, reject) {
              if (contains) {
                resolve(name);
              } else {
                reject('not found');
              }
            });
          },
          function(e) {})
      .then(function(name: any) {
        return cmake([ '--help-module', name ]);
      }, null);
}

function cmake_help_all() {
  let promises = {
    'function' : (name: string) => { return cmake_help_command(name); },
    'module' : (name: string) => { return cmake_help_module(name); },
    'variable' : (name: string) => { return cmake_help_variable(name); },
    'property' : (name: string) => { return cmake_help_property(name); },
    'eon' : (name: string) => { return eon_help(name); }
  };
  return promises;
}

function vscodeKindFromCMakeCodeClass(kind: string): vscode.CompletionItemKind {
  switch (kind) {
  case "function":
    return vscode.CompletionItemKind.Function;
  case "variable":
    return vscode.CompletionItemKind.Variable;
  case "module":
    return vscode.CompletionItemKind.Module;
  case "eon":
    return vscode.CompletionItemKind.Function;
  }
  return vscode.CompletionItemKind
      .Property; // TODO@EG additional mappings needed?
}

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

function suggestionsHelper(cmake_cmd: any, currentWord: string, type: string,
                           insertText: any, matchPredicate: any):
    Thenable<vscode.CompletionItem[]> {
  return new Promise(function(resolve, reject) {
    cmake_cmd
        .then(function(stdout: string) {
          let commands = stdout.split('\n').filter(function(
              v) { return matchPredicate(v, currentWord); });
          if (commands.length > 0) {
            let suggestions = commands.map(function(command_name) {
              var item = new vscode.CompletionItem(command_name);
              item.kind = vscodeKindFromCMakeCodeClass(type);
              if (insertText === null || insertText === '') {
                item.insertText = command_name;
              } else {
                let snippet =
                    new vscode.SnippetString(insertText(command_name));

                item.insertText = snippet;
              }
              return item;
            });
            resolve(suggestions);
          } else {
            resolve([]);
          }
        })
        .catch(function(err: any) { reject(err); });
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
  let scoped_func = [ 'if', 'function', 'while', 'macro', 'foreach' ];
  let is_scoped =
      scoped_func.reduceRight(function(prev, name, idx,
                                       array) { return prev || func === name; },
                              false);
  if (is_scoped) {
    return func + '(${1})\n\t\nend' + func + '(${1})\n';
  } else {
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
function cmEONCommandsSuggestions(currentWord: string):
    Thenable<vscode.CompletionItem[]> {
  let cmd = eon_help_list();
  return suggestionsHelper(cmd, currentWord, 'eon', cmEonInsertText,
                           strContains);
}

function cmEONCommandsSuggestionsExact(currentWord: string):
    Thenable<vscode.CompletionItem[]> {
  let cmd = eon_help_list();
  return suggestionsHelper(cmd, currentWord, 'function', cmEonInsertText,
                           strEquals);
}

function cmEonInsertText(func: string) { return func; }

function eon_help_list(): Promise<string> { return eon(); }

function eon_help(name: string): Promise<string> {
  return eon_help_list()
      .then(
          function(result: string) {
            let contains = result.indexOf(name) > -1;
            return new Promise(function(resolve, reject) {
              if (contains) {
                resolve(name);
              } else {
                reject('not found');
              }
            });
          },
          function(e) {})
      .then(function(name: any) { return eon_doc(name); }, null);
}

///////////////////////////////////////////////////////////////

function cmCommandsSuggestions(currentWord: string):
    Thenable<vscode.CompletionItem[]> {
  let cmd = cmake_help_command_list();
  return suggestionsHelper(cmd, currentWord, 'function', cmFunctionInsertText,
                           strContains);
}

function cmVariablesSuggestions(currentWord: string):
    Thenable<vscode.CompletionItem[]> {
  let cmd = cmake_help_variable_list();
  return suggestionsHelper(cmd, currentWord, 'variable', cmVariableInsertText,
                           strContains);
}

function cmPropertiesSuggestions(currentWord: string):
    Thenable<vscode.CompletionItem[]> {
  let cmd = cmake_help_property_list();
  return suggestionsHelper(cmd, currentWord, 'property', cmPropetryInsertText,
                           strContains);
}

function cmModulesSuggestions(currentWord: string):
    Thenable<vscode.CompletionItem[]> {
  let cmd = cmake_help_module_list();
  return suggestionsHelper(cmd, currentWord, 'module', cmModuleInsertText,
                           strContains);
}

function cmCommandsSuggestionsExact(currentWord: string):
    Thenable<vscode.CompletionItem[]> {
  let cmd = cmake_help_command_list();
  return suggestionsHelper(cmd, currentWord, 'function', cmFunctionInsertText,
                           strEquals);
}

function cmVariablesSuggestionsExact(currentWord: string):
    Thenable<vscode.CompletionItem[]> {
  let cmd = cmake_help_variable_list();
  return suggestionsHelper(cmd, currentWord, 'variable', cmVariableInsertText,
                           strEquals);
}

function cmPropertiesSuggestionsExact(currentWord: string):
    Thenable<vscode.CompletionItem[]> {
  let cmd = cmake_help_property_list();
  return suggestionsHelper(cmd, currentWord, 'property', cmPropetryInsertText,
                           strEquals);
}

function cmModulesSuggestionsExact(currentWord: string):
    Thenable<vscode.CompletionItem[]> {
  let cmd = cmake_help_module_list();
  return suggestionsHelper(cmd, currentWord, 'module', cmModuleInsertText,
                           strEquals);
}

class CMakeSuggestionSupport implements vscode.CompletionItemProvider {
  public excludeTokens: string[] = [ 'string', 'comment', 'numeric' ];

  public provideCompletionItems(document: vscode.TextDocument,
                                position: vscode.Position,
                                token: vscode.CancellationToken):
      Thenable<vscode.CompletionItem[]> {
    let wordAtPosition = document.getWordRangeAtPosition(position);
    var currentWord = '';
    if (wordAtPosition && wordAtPosition.start.character < position.character) {
      var word = document.getText(wordAtPosition);
      currentWord = word.substring(0, position.character -
                                          wordAtPosition.start.character);
    }

    return new Promise(function(resolve, reject) {
      Promise
          .all([
            cmEONCommandsSuggestions(currentWord),

            cmCommandsSuggestions(currentWord),
            cmVariablesSuggestions(currentWord),
            cmPropertiesSuggestions(currentWord),
            cmModulesSuggestions(currentWord)
          ])
          .then(function(results) {
            var suggestions = Array.prototype.concat.apply([], results);
            resolve(suggestions);
          })
          .catch(err => { reject(err); });
    });
  }

  public resolveCompletionItem(item: vscode.CompletionItem,
                               token: vscode.CancellationToken):
      Thenable<vscode.CompletionItem> {
    let promises: any = cmake_help_all();
    let type = cmakeTypeFromvscodeKind(item.kind!);

    return promises[type](item.label).then(function(result: string) {
      item.documentation = result.split('\n')[3];
      return item;
    });
  }
}

class CMakeExtraInfoSupport implements vscode.HoverProvider {

  public provideHover(document: vscode.TextDocument, position: vscode.Position,
                      token: vscode.CancellationToken): Thenable<vscode.Hover> {

    let range = document.getWordRangeAtPosition(position);
    let value = document.getText(range);
    let promises: any = cmake_help_all();
    return Promise
        .all([
          cmEONCommandsSuggestionsExact(value),

          cmCommandsSuggestionsExact(value),
          cmVariablesSuggestionsExact(value),
          cmModulesSuggestionsExact(value),
          cmPropertiesSuggestionsExact(value),
        ])
        .then(function(results) {
          var suggestions = Array.prototype.concat.apply([], results);
          if (suggestions.length === 0) {
            return null;
          }
          let suggestion: vscode.CompletionItem = suggestions[0];
          let label_str = suggestion.label;
          if (label_str.toString().startsWith('eon_')) {
            return promises['eon'](suggestion.label)
                .then(function(result: string) {
                  // 支持 markdown
                  let markdownContent = new vscode.MarkdownString();
                  markdownContent.appendMarkdown(result);
                  let hover = new vscode.Hover(markdownContent);
                  return hover;
                });
          } else {
            return promises[cmakeTypeFromvscodeKind(suggestion.kind!)](
                       suggestion.label)
                .then(function(result: string) {
                  let lines = result.split('\n');
                  lines = lines.slice(2, lines.length);
                  let hover = new vscode.Hover(
                      {language : 'md', value : lines.join('\n')});
                  return hover;
                });
          }
        });
  }
}

/**
 *@brief Signature
 */
class CMakeSignatureHelpProvider implements vscode.SignatureHelpProvider {
  public provideSignatureHelp(document: vscode.TextDocument,
                              position: vscode.Position,
                              token: vscode.CancellationToken,
                              context: vscode.SignatureHelpContext):
      vscode.ProviderResult<vscode.SignatureHelp> {

    // 获取当前行字符串
    let line = document.lineAt(position.line);
    let textBeforeCurso = line.text.substring(0, position.character);
    let fuinctionNameRegx = /\beon_[a-zA-Z0-9_]+\s*\(/g;

    // 最终返回配置值
    let help = new vscode.SignatureHelp;
    // 判断是否匹配上了
    let match;
    // 针对匹配上的正则字符串进行操作
    if ((match = fuinctionNameRegx.exec(textBeforeCurso)) !== null) {
      let functionName = match[0].trim();
      functionName = functionName.slice(0, -1);
      let signaturesValue = eon_sig_map.get(functionName.toString());
      if (signaturesValue === undefined) {
        return help;
      }
      help.signatures = [ eon_sig_map.get(functionName.toString()) ];
      help.activeParameter = 0;
      help.activeSignature = 0;
      return help;
    } else {
      return help;
    }
  }
}

////////////////////////////////////////////////////////////////////////////////////////

// 激活函数
export function activate(context: vscode.ExtensionContext) {

  console.log(
      'Congratulations, your extension "extension.eon-cmake" is now active!');

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // LANGUAGE register
  const CMAKE_LANGUAGE = 'cmake';
  const CMAKE_SELECTOR: vscode.DocumentSelector = [
    {language : CMAKE_LANGUAGE, scheme : 'file'},
    {language : CMAKE_LANGUAGE, scheme : 'untitled'},
  ];
  vscode.languages.registerHoverProvider(CMAKE_SELECTOR,
                                         new CMakeExtraInfoSupport());
  vscode.languages.registerCompletionItemProvider(CMAKE_SELECTOR,
                                                  new CMakeSuggestionSupport());

  vscode.languages.registerSignatureHelpProvider(
      CMAKE_SELECTOR,
      new CMakeSignatureHelpProvider(),
      '(',
  );

  fillEonCommandMap();
  fillEonDocMap();
  fillEonCompleteString();

  vscode.languages.setLanguageConfiguration(CMAKE_LANGUAGE, {
    indentationRules : {
      // ^(.*\*/)?\s*\}.*$
      decreaseIndentPattern : /^(.*\*\/)?\s*\}.*$/,
      // ^.*\{[^}"']*$
      increaseIndentPattern : /^.*\{[^}"']*$/
    },
    wordPattern :
        /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
    comments : {lineComment : '#'},
    brackets : [
      [ '{', '}' ],
      [ '(', ')' ],
    ],

    __electricCharacterSupport : {
      brackets : [
        {
          tokenType : 'delimiter.curly.ts',
          open : '{',
          close : '}',
          isElectric : true
        },
        {
          tokenType : 'delimiter.square.ts',
          open : '[',
          close : ']',
          isElectric : true
        },
        {
          tokenType : 'delimiter.paren.ts',
          open : '(',
          close : ')',
          isElectric : true
        }
      ]
    },

    __characterPairSupport : {
      autoClosingPairs : [
        {open : '{', close : '}'},
        {open : '(', close : ')'},
        {open : '"', close : '"', notIn : [ 'string' ]},
      ]
    }
  });
}

// This method is called when your extension is deactivated
export function deactivate() { console.log('插件扩展 eon-cmake 已被释放!'); }
