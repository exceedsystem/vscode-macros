# VSCode Macros

[英語版README](README.md)

## VSCodeにスクリプトマクロ機能を追加

繰り返しのテキスト編集操作を自動化することで、作業効率と生産性を向上させます。

### 特徴

* JavaScriptでマクロを作成
* マクロ内でVSCode拡張機能APIを利用 
  （API仕様による制限あり）
* マクロ内でNode.jsモジュールを使用
* コマンドパレットまたはカスタムキーボードショートカットからマクロを実行
* マクロを別々のファイルに整理して簡単に管理
* VSCode内蔵のデバッガーを使用してマクロをデバッグ

### デモ

* マクロを作成して即座に実行

  ![vscmacros_edit_and run](https://user-images.githubusercontent.com/70489172/103329811-e78e8800-4aa1-11eb-944e-42acbbc8f096.gif)

* マクロファイルを切り替えて複数のマクロを組み合わせて適用

  ![vscmacros_run_macro_combination](https://user-images.githubusercontent.com/70489172/103330487-08a4a800-4aa5-11eb-80e2-6c84f9364434.gif)

* VSCodeのデバッガーでマクロをデバッグ

  ![vscmacros_debug_demo](https://user-images.githubusercontent.com/70489172/103352309-3f9cad00-4ae9-11eb-94b8-bce7399b885f.gif)

### 拡張機能のセットアップ

1. マクロファイルを保存する任意のフォルダを作成します。

   ![image](https://user-images.githubusercontent.com/70489172/101270566-8551a880-37bd-11eb-9457-58d0d351f511.png)

2. VSCodeでフォルダを開きます。

   ![image](https://user-images.githubusercontent.com/70489172/101270575-a31f0d80-37bd-11eb-8d39-2fcf410146f5.png)

3. 新しいファイルを作成し、以下のサンプルマクロコードを貼り付けます。

   マクロはJavaScript(CommonJS)で記述します。

   ![image](https://user-images.githubusercontent.com/70489172/101270576-a619fe00-37bd-11eb-9ae6-cf02852a74c3.png)

   ```javascript
   const vscode = require('vscode');

   /**
    * マクロ設定
    * { [name: string]: {              ... マクロの名前
    *    no: number,                   ... マクロの番号
    *    func: ()=> string | undefined ... マクロ関数本体の名前
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
         // 必要に応じてエラーメッセージを返します。
         return 'エディタが開いていません。';
      }
      const document = editor.document;
      const selection = editor.selection;
      const text = document.getText(selection);
      if (text.length > 0) {
         editor.edit(editBuilder => {
            // 選択されたテキストを二重引用符で囲みます（複数選択はサポートしていません）。
            editBuilder.replace(selection, `"${text}"`);
         });
      }
   }

   /**
    * BarMacro（非同期）
    */
   async function barFunc() {
      await vscode.window.showInformationMessage('Hello VSCode Macros!');
      // 成功時は何も返しません。
   }
   ```

   新しいマクロを素早く作成するには、VSCodeの[スニペット機能](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_create-your-own-snippets)を使用できます。以下のようなスニペットを使用してください：

   ```json
   {
      "Create new VSCode macro": {
         "prefix": "vscmacro",
         "body": [
            "const vscode = require('vscode');",
            "",
            "/**",
            " * マクロ設定",
            " * { [name: string]: {              ... マクロの名前",
            " *    no: number,                   ... マクロの順序",
            " *    func: ()=> string | undefined ... マクロ関数本体の名前",
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
            "    // 必要に応じてエラーメッセージを返します。",
            "    return 'アクティブなテキストエディタが見つかりません。';",
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
         "description": "VSCode Macros テンプレート"
      }
   }
   ```

4. ファイルに好みの名前（*.js）を付けて、マクロフォルダに保存します。

   ![image](https://user-images.githubusercontent.com/70489172/101270579-a914ee80-37bd-11eb-86aa-279e60c884cf.png)

5. VSCodeの設定を開き、"vscode macros"を検索し、'Macro File Path'テキストボックスにマクロファイルのパスを入力します。

   > __注意:__ バージョン1.3.0以降はマルチルート、ワークスペース、ワークスペースフォルダをサポートしています。

   ![image](https://user-images.githubusercontent.com/70489172/142166332-28c15ba5-8cdf-401f-aa1e-0ddb5c78c36a.png)

   * マクロファイルパスには環境変数を使用できます。例：`{ENV_NAME}/path/to/macro.js`
   * VSCodeポータブルモードのバージョン1.3.0以降では、`{VSCODE_PORTABLE}`環境変数を使用してください。

   > __注意:__ ポータブルモードでこの拡張機能を使用する場合、バージョン1.2.0までは、データディレクトリへの相対パスを設定してください。バージョン1.3.0以降では、相対パスの代わりに環境変数を使用してください。

### 頻繁に使うマクロをユーザーコマンドに割り当てる

1. VSCodeの設定を開き、"vscode macros"を検索し、`User Macro Commands`フィールドの`{Edit in settings.json}`をクリックします。

   > __注意:__ バージョン1.3.0以降はマルチルート、ワークスペース、ワークスペースフォルダをサポートしています。

   ![image](https://user-images.githubusercontent.com/70489172/142166726-ecc22c4e-68ac-4c71-948c-d001ae638740.png)

2. 以下のように、JSONファイルにマクロのパスと名前を登録します（最大10コマンド）。

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

### マクロの使用方法

コマンドパレットからマクロを実行できます：

1. `{F1}`を押してコマンドパレットを開き、"run a macro"と入力して`{Enter}`を押します。

   ![image](https://user-images.githubusercontent.com/70489172/107357599-a617e080-6b15-11eb-85a7-57cd6250229d.png)

2. リストからマクロ名を選択します。

   ![image](https://user-images.githubusercontent.com/70489172/101270590-b631dd80-37bd-11eb-8180-7995c13efbcd.png)

   別のマクロファイルに切り替えるには、"select a macro file"コマンドを使用します。

   ![image](https://user-images.githubusercontent.com/70489172/107357776-d8c1d900-6b15-11eb-9235-e65304e77cb3.png)

マクロを`User Macro 01`から`User Macro 10`に割り当てることができます：

1. `{F1}`を押してコマンドパレットを開き、"vscmacros"と入力します。

   ![image](https://user-images.githubusercontent.com/70489172/142145560-c3e6fc93-89da-4780-b075-242acc63ff7a.png)

2. ショートカットキーを割り当てたいユーザーコマンドの`{⚙}`アイコンをクリックします。

   ![image](https://user-images.githubusercontent.com/70489172/142145840-f43d8dc9-719f-4ba0-a2b3-3ca95d6327dc.png)

* `Run a User Macro`コマンドから`User Macro`を実行することもできます。
（ユーザーマクロの設定を忘れた場合に便利です。）

   ![image](https://user-images.githubusercontent.com/70489172/166139961-d15f362f-95f7-4a38-808b-b869d3d273cf.png)

   > __注意:__ バージョン1.4.0以降で利用可能です。

### マクロのデバッグ

VSCodeの`extension development host`でマクロをデバッグできます：

1. VSCodeでマクロフォルダを開きます。

   ![image](https://user-images.githubusercontent.com/70489172/101270575-a31f0d80-37bd-11eb-8d39-2fcf410146f5.png)

2. マクロファイルを開き、必要に応じてブレークポイントを設定します。

   ![image](https://user-images.githubusercontent.com/70489172/101270583-b0d49300-37bd-11eb-98cd-126cfa1767f3.png)

3. `{F5}`を押し、環境リストから`VS Code Extension Development (preview)`を選択します。

   ![image](https://user-images.githubusercontent.com/70489172/101270585-b3cf8380-37bd-11eb-8d0a-471c43fd7016.png)

   古いバージョンのVSCodeでは、コマンドパレットから__Extension Development Host__を実行します：

   ![image](https://user-images.githubusercontent.com/70489172/107511057-4dfdde80-6be8-11eb-8794-2e7e568087d9.png)

4. __Extension Development Host__ウィンドウで、`{F1}`を押してコマンドパレットを開き、'run a macro'と入力します。

   ![image](https://user-images.githubusercontent.com/70489172/107510939-227af400-6be8-11eb-9b4b-4c0fa277de5f.png)

5. リストからデバッグしたいマクロを選択します。

   ![image](https://user-images.githubusercontent.com/70489172/101270590-b631dd80-37bd-11eb-8180-7995c13efbcd.png)

6. ブレークポイントで停止したプログラムをデバッグします。

   ![image](https://user-images.githubusercontent.com/70489172/101270591-b92cce00-37bd-11eb-88d9-b40529ec409f.png)

### マクロの例

GitHub GistでVSCodeマクロの例を見つけることができます：

<https://gist.github.com/exceedsystem>
