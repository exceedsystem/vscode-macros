# VSCode Macros

[日本語版README](README_ja.md)

## Add scripting macro functionality to your VSCode

Enhance your work efficiency and productivity by automating repetitive text editing operations.

### Features

* Write macros in JavaScript
* Utilize the VSCode extension API in your macros 
  (Some limitations apply due to API specifications)
* Use Node.js modules in your macros
* Run macros from the command palette or with custom keyboard shortcuts
* Organize macros into separate files for easy management
* Debug macros using VSCode's built-in debugger

### Demos

* Write and run your macro instantly

  ![vscmacros_edit_and run](https://user-images.githubusercontent.com/70489172/103329811-e78e8800-4aa1-11eb-944e-42acbbc8f096.gif)

* Switch between macro files and apply multiple macros in combination

  ![vscmacros_run_macro_combination](https://user-images.githubusercontent.com/70489172/103330487-08a4a800-4aa5-11eb-80e2-6c84f9364434.gif)

* Debug your macros with VSCode's debugger

  ![vscmacros_debug_demo](https://user-images.githubusercontent.com/70489172/103352309-3f9cad00-4ae9-11eb-94b8-bce7399b885f.gif)

### Setting up the extension

1. Create a folder in any location to store your macro files.

   ![image](https://user-images.githubusercontent.com/70489172/101270566-8551a880-37bd-11eb-9457-58d0d351f511.png)

2. Open the folder with VSCode.

   ![image](https://user-images.githubusercontent.com/70489172/101270575-a31f0d80-37bd-11eb-8d39-2fcf410146f5.png)

3. Create a new file and paste the example macro code below.

   Macros are written in JavaScript(CommonJS).

   ![image](https://user-images.githubusercontent.com/70489172/101270576-a619fe00-37bd-11eb-9ae6-cf02852a74c3.png)

   ```javascript
   const vscode = require('vscode');

   /**
    * Macro configuration settings
    * { [name: string]: {              ... Name of the macro
    *    no: number,                   ... Order of the macro
    *    func: ()=> string | undefined ... Name of the body of the macro function
    *  }
    * }
    */
   module.exports.macroCommands = {
      FooMacro: {
         no: 2,
         func: fooFunc
      },
      BarMacro: {
         no: 1,
         func: barFunc
      }
   };

   /**
    * FooMacro
    */
   function fooFunc() {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
         // Return an error message if necessary.
         return 'Editor is not opening.';
      }
      const document = editor.document;
      const selection = editor.selection;
      const text = document.getText(selection);
      if (text.length > 0) {
         editor.edit(editBuilder => {
            // To surround a selected text in double quotes(Multi selection is not supported).
            editBuilder.replace(selection, `"${text}"`);
         });
      }
   }

   /**
    * BarMacro(asynchronous)
    */
   async function barFunc() {
      await vscode.window.showInformationMessage('Hello VSCode Macros!');
      // Returns nothing when successful.
   }
   ```

   To create a new macro quickly, you can use VSCode's [snippet feature](https://code.visualstudio.com/docs/editor/userdefinedsnippets#\_create-your-own-snippets) with a snippet like this:

   ```json
   {
      "Create new VSCode macro": {
         "prefix": "vscmacro",
         "body": [
            "const vscode = require('vscode');",
            "",
            "/**",
            " * Macro configuration settings",
            " * { [name: string]: {              ... Name of the macro",
            " *    no: number,                   ... Order of the macro",
            " *    func: ()=> string | undefined ... Name of the body of the macro function",
            " *  }",
            " * }",
            " */",
            "module.exports.macroCommands = {",
            "  $1: {",
            "    no: 1,",
            "    func: $2,",
            "  },",
            "};",
            "",
            "/**",
            " * Hello world",
            " */",
            "async function $2() {",
            "  const editor = vscode.window.activeTextEditor;",
            "  if (!editor) {",
            "    // Return an error message if necessary.",
            "    return 'Active text editor not found.';",
            "  }",
            "  const document = editor.document;",
            "  const selection = editor.selection;",
            "  const text = document.getText(selection);",
            "",
            "  editor.edit((editBuilder) => {",
            "    editBuilder.replace(selection, `Hello world! \\${text}`);",
            "  });",
            "}"
         ],
         "description": "VSCode Macros Template"
      }
   }
   ```
4. Give the file a name of your choice (*.js) and save it in the macro folder.

   ![image](https://user-images.githubusercontent.com/70489172/101270579-a914ee80-37bd-11eb-86aa-279e60c884cf.png)

5. Open VSCode's settings, search for "vscode macros", and enter the macro file path in the 'Macro File Path' text box.

   > __NOTE:__ Version 1.3.0 and above support multi-root, workspace, and workspace folders.

   ![image](https://user-images.githubusercontent.com/70489172/142166332-28c15ba5-8cdf-401f-aa1e-0ddb5c78c36a.png)

   * You can use environment variables in the macro file path, such as `{ENV_NAME}/path/to/macro.js`.
   * For VSCode portable mode version 1.3.0 and later, use the `{VSCODE_PORTABLE}` environment variable.

   > __NOTE:__ When using this extension in portable mode, set the relative path to the data directory up to version 1.2.0. In version 1.3.0 and later, use the environment variable instead of the relative path.

### Assigning frequently used macros to user commands

1. Open VSCode's settings, search for "vscode macros", then click `{Edit in settings.json}` in the `User Macro Commands` field.

   > __NOTE:__ Version 1.3.0 and above support multi-root, workspace, and workspace folders.

   ![image](https://user-images.githubusercontent.com/70489172/142166726-ecc22c4e-68ac-4c71-948c-d001ae638740.png)

2. Register the macro path and name in the JSON file as shown below. (Up to 10 commands)

   ```json
   "vscodemacros.userMacroCommands": [
   {
      "path": "C:\\Temp\\macros\\FooMacro.js",
      "name": "FooMacro"
   },
   {
      "path": "C:\\Temp\\macros\\BarMacro.js",
      "name": "BarMacro"
   },
   {
      "path": "",
      "name": ""
   },
   {
      "path": "",
      "name": ""
   },
   {
      "path": "",
      "name": ""
   },
   ],
   ```

### Using your macros

You can run your macros from the command palette:

1. Press `{F1}` to open the command palette, type "run a macro", and press `{Enter}`.

   ![image](https://user-images.githubusercontent.com/70489172/107357599-a617e080-6b15-11eb-85a7-57cd6250229d.png)

2. Select the macro name from the list.

   ![image](https://user-images.githubusercontent.com/70489172/101270590-b631dd80-37bd-11eb-8180-7995c13efbcd.png)

   To switch to another macro file, use the "select a macro file" command.

   ![image](https://user-images.githubusercontent.com/70489172/107357776-d8c1d900-6b15-11eb-9235-e65304e77cb3.png)

You can assign your macros to `User Macro 01` through `User Macro 10`:

1. Press `{F1}` to open the command palette, then type "vscmacros".

   ![image](https://user-images.githubusercontent.com/70489172/142145560-c3e6fc93-89da-4780-b075-242acc63ff7a.png)

2. Click the `{⚙}` icon of the user command you want to assign a shortcut key to.

   ![image](https://user-images.githubusercontent.com/70489172/142145840-f43d8dc9-719f-4ba0-a2b3-3ca95d6327dc.png)

* You can also run a `User Macro` from the `Run a User Macro` command.
(This is helpful if you forget your user macro settings.)

   ![image](https://user-images.githubusercontent.com/70489172/166139961-d15f362f-95f7-4a38-808b-b869d3d273cf.png)

   > __NOTE:__ Available in version 1.4.0 and above.

### Debugging your macros

You can debug your macros in the `extension development host` on VSCode:

1. Open the macro folder with VSCode.

   ![image](https://user-images.githubusercontent.com/70489172/101270575-a31f0d80-37bd-11eb-8d39-2fcf410146f5.png)

2. Open the macro file and set breakpoints as needed.

   ![image](https://user-images.githubusercontent.com/70489172/101270583-b0d49300-37bd-11eb-98cd-126cfa1767f3.png)

3. Press `{F5}` and select `VS Code Extension Development (preview)` from the environment list.

   ![image](https://user-images.githubusercontent.com/70489172/101270585-b3cf8380-37bd-11eb-8d0a-471c43fd7016.png)

   For older VSCode versions, run the __Extension Development Host__ from the command palette:

   ![image](https://user-images.githubusercontent.com/70489172/107511057-4dfdde80-6be8-11eb-8794-2e7e568087d9.png)

4. In the __Extension Development Host__ window, press `{F1}` to open the command palette, then type 'run a macro'.

   ![image](https://user-images.githubusercontent.com/70489172/107510939-227af400-6be8-11eb-9b4b-4c0fa277de5f.png)

5. Select the macro you want to debug from the list.

   ![image](https://user-images.githubusercontent.com/70489172/101270590-b631dd80-37bd-11eb-8180-7995c13efbcd.png)

6. The program will stop at the breakpoint, allowing you to debug.

   ![image](https://user-images.githubusercontent.com/70489172/101270591-b92cce00-37bd-11eb-88d9-b40529ec409f.png)

### Macro examples

You can find examples of VSCode macros on GitHub Gist:

<https://gist.github.com/exceedsystem>
