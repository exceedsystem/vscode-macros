# VSCode Macros

## Add a scripting macro feature to your VSCode

Improves work efficiency and productivity by automating inefficient text editing operations.

### Features

* You can write your macro in JavaScript.
* You can use the VSCode extension API in your macros.
   (There are some limitations due to API specifications.)
* You can use the Node.js modules in your macros.
* You can run your macros from the command pallette and shortcut keys.
* You can manage your macros by units of files.
* You can debug your macro on the debugger of the VSCode.

### Demos

* Write your macro and run it instantly.

  ![vscmacros_edit_and run](https://user-images.githubusercontent.com/70489172/103329811-e78e8800-4aa1-11eb-944e-42acbbc8f096.gif)

* Switch your macro file and apply some macros in combination.

  ![vscmacros_run_macro_combination](https://user-images.githubusercontent.com/70489172/103330487-08a4a800-4aa5-11eb-80e2-6c84f9364434.gif)

* Debug your macro with VSCode debugger.

  ![vscmacros_debug_demo](https://user-images.githubusercontent.com/70489172/103352309-3f9cad00-4ae9-11eb-94b8-bce7399b885f.gif)

### How to setup the extension

1. Create a folder in a specific directory to save your macro files.

   ![image](https://user-images.githubusercontent.com/70489172/101270566-8551a880-37bd-11eb-9457-58d0d351f511.png)

2. Open the folder with VSCode.

   ![image](https://user-images.githubusercontent.com/70489172/101270575-a31f0d80-37bd-11eb-8d39-2fcf410146f5.png)

3. Create a new file and paste an example code for macro below.

   You can write an macro in JavaScript.

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

   If you would like to create a new macro quickly, you can use the [snippet features of VSCode](https://code.visualstudio.com/docs/editor/userdefinedsnippets#\_create-your-own-snippets) to create a snippet like the following.

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

4. Give an arbitrary file name(\*.js) and save it in the macro folder.

   ![image](https://user-images.githubusercontent.com/70489172/101270579-a914ee80-37bd-11eb-86aa-279e60c884cf.png)

5. Open the preference setting of the VSCode and enter `vscode macros` in the search text box, and then enter the macro file path in the 'Macro File Path' text box.

   > __NOTE:__ Version 1.3.0 and above support multi-root, workspace and workspace folders.

   ![image](https://user-images.githubusercontent.com/70489172/142166332-28c15ba5-8cdf-401f-aa1e-0ddb5c78c36a.png)

   * You can use an environment variables in macro file path, such as `{ENV_NAME}/path/to/macro.js`.
   * If you are using vscode portable mode version 1.3.0 and later, use the `{VSCODE_PORTABLE}` environment variable.

   > __NOTE:__ When using this extension in portable mode, set the relative path to the data directory up to version 1.2.0, but in version 1.3.0 and later, uses the environment variable instead of the relative path.

### How to assign your frequently used macros to user commands

1. Open the preference setting of the VSCode and enter `vscode macros` in the search text box, and then click `{Edit in settings.json}` in the `User Macro Commands` fields.

   > __NOTE:__ Version 1.3.0 and above support multi-root, workspace and workspace folders.

   ![image](https://user-images.githubusercontent.com/70489172/142166726-ecc22c4e-68ac-4c71-948c-d001ae638740.png)

2. Register the macro path and macro name in the json file as below. (Up to 10 commands)

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

### How to use

You can run your macro from the command palette.

1. Press the `{F1}` key to open the command palette, and then type `run a macro` in the command palette and after press `{Enter}` key.

   ![image](https://user-images.githubusercontent.com/70489172/107357599-a617e080-6b15-11eb-85a7-57cd6250229d.png)

2. Select the macro name from the macro list.

   ![image](https://user-images.githubusercontent.com/70489172/101270590-b631dd80-37bd-11eb-8180-7995c13efbcd.png)

   If you would like to change to another macro file, you can use the "select a macro file" command.

   ![image](https://user-images.githubusercontent.com/70489172/107357776-d8c1d900-6b15-11eb-9235-e65304e77cb3.png)

You can assign your macros from `User Macro 01` to `User Macro 10`.

1. Press the `{F1}` key to open the command palette, and then type `vscmacros` in the command palette.

   ![image](https://user-images.githubusercontent.com/70489172/142145560-c3e6fc93-89da-4780-b075-242acc63ff7a.png)

2. Click the `{⚙}` icon of the user command which you would like to assign a shortcut key.

   ![image](https://user-images.githubusercontent.com/70489172/142145840-f43d8dc9-719f-4ba0-a2b3-3ca95d6327dc.png)

### How to debug my macros

You can debug your macros on the `extension development host` on VSCode as below.

1. Open the macro folder with the VSCode.

   ![image](https://user-images.githubusercontent.com/70489172/101270575-a31f0d80-37bd-11eb-8d39-2fcf410146f5.png)

2. Open the macro file and set the breakpoint at the arbitrary point.

   ![image](https://user-images.githubusercontent.com/70489172/101270583-b0d49300-37bd-11eb-98cd-126cfa1767f3.png)

3. Press `{F5}` and select the `VS Code Extension Development (preview)` from the environment list.

   ![image](https://user-images.githubusercontent.com/70489172/101270585-b3cf8380-37bd-11eb-8d0a-471c43fd7016.png)

   When you are running an old version of VSCode, you can run the __Extension Development Host__ from the command palette as below.

   ![image](https://user-images.githubusercontent.com/70489172/107511057-4dfdde80-6be8-11eb-8794-2e7e568087d9.png)

4. Select the __Extension Development Host__ window and press the `{F1}` key to open the command palette, and then type 'run a macro' in the command palette.

   ![image](https://user-images.githubusercontent.com/70489172/107510939-227af400-6be8-11eb-9b4b-4c0fa277de5f.png)

5. Select the macro name to debugging from the macro list.

   ![image](https://user-images.githubusercontent.com/70489172/101270590-b631dd80-37bd-11eb-8180-7995c13efbcd.png)

6. When the program stops at the breakpoint, and you can debug it.

   ![image](https://user-images.githubusercontent.com/70489172/101270591-b92cce00-37bd-11eb-88d9-b40529ec409f.png)

### Macro examples

You can find some examples of vscode macros on the GitHub gist.

<https://gist.github.com/exceedsystem>
