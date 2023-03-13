---
title: HelloWorld
layout: denokun/page.njk
---

最小構成のソースを作成する

* .vscode/setting.json（VSCodeの設定）
* static/index.html（メインのHTML）
* main.js（サーバソース）
* run.bat（Windows用のサーバ起動バッチ）
* run.sh（Linux用のサーバ起動スクリプト）
* .vscode/launch.json（VSCodeでF5でサーバが起動する設定）

---

VSCodeの設定を作成する  
* インデントを2文字
* インデントをスペース
* インデントの自動判定をオフ
* Denoを有功化

``.vscode/setting.json``
```json
{
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,
  "deno.enable": true
}
```

---
サーバのソースを作成する  

[Server.js](https://fukuno.jig.jp/2943)を使ってサーバを作成する
* HTMLと画像はstaticフォルダに配置する
* サーバーにリクエストが来るとapi関数が呼ばれる
  * 引数はパス(/api/xxx)とreq(JSONオブジェクト)
  * 戻り値はJSON
  * returnしないと「not found」が返る

``main.js``
```javascript
import { Server } from "https://ninja03.github.io/denokun/lib/Server.js";

class MyServer extends Server {
  api(path, req) {

  }
}

new MyServer().start(8881);
```

---
メインHTMLを作成する

``static/index.html``
```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>WebApp</title>
  </head>
  <body>
    WebApp
  </body>
</html>
```

---

起動プログラム``run.bat``と``run.sh``を作成する  

* ``-A``は通信とファイルアクセスに必要
* ``--watch``はソースを編集すると自動でリロード
* ``--unnstable``はServer.jsの動作に必要

``run.bat``
```bat
@echo off
deno run -A --watch --unstable main.js
```

``run.sh``
```sh
run.sh
deno run -A --watch --unstable main.js
```

---
VSCodeでF5キーでサーバが起動する設定を作成する  

``.vscode/launch.json``
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Deno",
      "type": "pwa-node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "deno",
      "runtimeArgs": ["run", "-A", "--watch", "--unstable", "main.js"],
      "outputCapture": "std"
    }
  ]
}
```

---
動作確認をする

F5かrun.batで起動する  
ブラウザでhttp://localhost:8881を開く