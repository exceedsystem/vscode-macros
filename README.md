# Add a simple JavaScript macro features to your VSCode

### The 'vscode-macros' makes creating, using, and debugging VSCode macros very easy.

#### How to setup the extension

1. Create a folder in a specific directory to save your macro files.

   ![](https://user-images.githubusercontent.com/70489172/101270566-8551a880-37bd-11eb-9457-58d0d351f511.png)

2. Open the folder with VSCode.

   ![](https://user-images.githubusercontent.com/70489172/101270575-a31f0d80-37bd-11eb-8d39-2fcf410146f5.png)

3. Create a new file and paste an example code for macro below.

   You can write an macro in JavaScript.

   ![](https://user-images.githubusercontent.com/70489172/101270576-a619fe00-37bd-11eb-9ae6-cf02852a74c3.png)

   ```js
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
   };

   /**
    * BarMacro
    */
   function barFunc() {
   vscode.window.showInformationMessage('Hello VSCode Macros!');
   // Returns nothing when successful.
   };
   ```

4. Give an arbitrary file name(\*.js) and save it in the macro folder.

   ![](https://user-images.githubusercontent.com/70489172/101270579-a914ee80-37bd-11eb-86aa-279e60c884cf.png)

5. Open the preference setting of the VSCode and enter `vscodemacros` in the search text box, and then enter the macro file name with the full path in the 'Macro File Path' text box.

   ![](https://user-images.githubusercontent.com/70489172/101270580-ac0fdf00-37bd-11eb-9151-4a9a580da6c6.png)

#### How to use?

You can run your macro from the command palette.

1. Press the `{F1}` key to open the command palette, and then type `run a macro` in the command palette and after press `{Enter}` key.

   ![](https://user-images.githubusercontent.com/70489172/101270582-ae723900-37bd-11eb-8c46-41c787375cb5.png)

2. Select the macro name from the macro list.

   ![](https://user-images.githubusercontent.com/70489172/101270590-b631dd80-37bd-11eb-8180-7995c13efbcd.png)

#### How to debug my macros?

You can debug your macros on the `extension development host` on VSCode as below.

1. Open the macro folder with the VSCode.

   ![](https://user-images.githubusercontent.com/70489172/101270575-a31f0d80-37bd-11eb-8d39-2fcf410146f5.png)

2. Open the macro file and set the breakpoint at the arbitrary point.

   ![](https://user-images.githubusercontent.com/70489172/101270583-b0d49300-37bd-11eb-98cd-126cfa1767f3.png)

3. Press `{F5}` and select the `VS Code Extension Development (preview)` from the environment list.

   ![](https://user-images.githubusercontent.com/70489172/101270585-b3cf8380-37bd-11eb-8d0a-471c43fd7016.png)

4. Select the __Extension Development Host__ window and press the `{F1}` key to open the command palette, and then type 'run a macro' in the command palette.

   ![](https://user-images.githubusercontent.com/70489172/101270582-ae723900-37bd-11eb-8c46-41c787375cb5.png)

5. Select the macro name to debugging from the macro list.

   ![](https://user-images.githubusercontent.com/70489172/101270590-b631dd80-37bd-11eb-8180-7995c13efbcd.png)

6. When the program stops at the breakpoint, and you can debug it.

   ![](https://user-images.githubusercontent.com/70489172/101270591-b92cce00-37bd-11eb-88d9-b40529ec409f.png)
