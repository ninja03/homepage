---
title: フロントエンドの実装
layout: denokun/page.njk
---

Alpine.jsでHTMLを動的にする

「ユーザ登録」「ログイン」「アップロード」を押すとダイアログを表示する  
「並び替え」を押すとボタンが「新着順」←→「人気順」と変化する  

``static/index.html``
```html
<!-- 全体 -->
<div x-data="app">
  <!-- メニューバー -->
  <div>
    <img src="logo.dio.svg">
    <span x-text="userName + 'さん'" x-show="logined"></span>
    <button @click="openRegist()" x-show="logined">ユーザ登録</button>
    <button @click="openLogin()" x-show="!logined">ログイン</button>
    <button @click="logout()" x-show="!logined">ログアウト</button>
    <button @click="openUpload()" x-show="logined">アップロード</button>
    <button @click="changeType()" x-text="sort"></button>
  </div>

  <!-- タイムライン -->
  <div>
    <div>
      <div>写真ID:1</div>
      <img>
      <button>1いいね</button>
    </div>

    <div>
      <div>写真ID:2</div>
      <img>
      <button>2いいね</button>
    </div>
  </div>

  <!-- ユーザー登録ダイアログ -->
  <div x-show="showRegist">
    <div>
      ユーザ名: <input type="text" x-model="registName">
      パスワード: <input type="text" x-model="registPass">
      <button @click="regist()">登録</button>
    </div>
  </div>

  <!-- ログインダイアログ -->
  <div x-show="showLogin">
    ユーザ名: <input type="text" x-model="loginName">
    パスワード: <input type="text" x-model="loginPass">
    <button @click="login()">ログイン</button>
  </div>

  <!-- アップロードダイアログ -->
  <div x-show="showUpload">
    プレビュー
    <img>
    ファイル選択
    <input type="file" @change="fileSelected()" required>
    <button @click="upload()">アップロード</button>
  </div>
</div>

<script type="module">
  import Alpine from "https://unpkg.com/alpinejs@3.2.3/dist/module.esm.js"

  Alpine.data("app", () => ({
    userName: "",      // ログイン中ユーザ名
    logined: false,    // ログイン中か

    // 並び替えボタン
    sort: "新着順",

    changeType() {
      console.log("タイムライン並び順変更", this.sort)
      this.sort = this.sort === "新着順" ? "人気順" : "新着順"
    },

    // ユーザ登録ダイアログ
    showRegist: false, // ユーザ登録ダイアログ表示中か
    registName: "",    // ユーザ登録ダイアログ名前入力値
    registPass: "",    // ユーザ登録ダイアログパスワード入力値

    openRegist() {
      console.log("ユーザ登録ダイアログを開く")
      this.showRegist = true
    },

    closeRegist() {
      console.log("ユーザ登録ダイアログを閉じる")
      this.showRegist = false
    },

    regist() {
      console.log("ユーザを登録した", this.registName, this.registPass)
      this.userName = "ユーザ1"
      this.logined = true
      this.closeRegist()
    }

    // ログインダイアログ
    showLogin: false,  // ログインダイアログ表示中か
    loginName: "",     // ログインダイアログ名前入力値
    loginPass: "",     // ログインダイアログパスワード入力値

    openLogin() {
      console.log("ログインダイアログを開く")
      this.showLogin = true
    },

    closeLogin() {
      console.log("ログインダイアログを閉じる")
      this.showLogin = false
    },

    login() {
      console.log("ログインした", this.loginUser, this.loginPass)
      this.userName = "ユーザ1"
      this.logined = true
      this.closeLogin()
    },

    logout() {
      console.log("ログアウトした")
      this.userName = null
      this.logined = false
    },

    // アップロードダイアログ
    showUpload: false, // アップロードダイアログ表示中か

    openUpload() {
      console.log("アップロードダイアログを開く")
      this.showUpload = true
    },

    closeUpload() {
      console.log("アップロードダイアログを閉じる")
      this.showUpload = false
    },

    fileSelected() {
      console.log("アップロードするファイルを選んだ")
    },

    upload() {
      console.log("アップロードした")
      this.closeUpload()
    }
  }))

  Alpine.start()
</script>
```
