---
title: 通信
layout: denokun/page.njk
---

ブラウザからサーバに通信する

fetchJSONを使う
* JSONでサーバと通信する関数
* 引数はURLとJSON
* Server.jsのapi()のpath(/api/xxx)とreq(JSON) に対応する
* POSTメソッドが使用される
* JSON以外が返されると例外が発生する

タイムライン表示用HTMLを追加する  

ローカルPCからサーバにデプロイしても動くように  
locationからサーバのURLを作成する  

セッションはブラウザのローカルストレージに保管する

``static/index.html``
```html
<div x-data="app">
  <!-- タイムライン -->
  <div>
    <template x-for="photo in timeline">
      <div>
        <div x-text="photo.id"></div>
        <img :src="photo.url">
        <button x-text="photo.good + 'いいね'" @click="good(photo)"></button>
      </div>
    </template>
  </div>
</div>

<script type="module">
  import Alpine from "https://unpkg.com/alpinejs@3.2.3/dist/module.esm.js"
  import { fetchJSON } from "https://ninja03.github.io/denokun/lib/fetchJSON.js"

  Alpine.data("app", () => ({
    server: location.protocol + "//" + location.hostname + ":8881",

    userName: "",      // ログイン中ユーザ名
    logined: false,    // ログイン中か
    timeline: [],      // タイムラインのデータ

    // API通信
    async fetchAPI(path, req = {}) {
      req.session = localStorage.session
      return await fetchJSON(this.server + "/api/" + path, req)
    },

    // ページを開いたときはユーザ取得とタイムラインを取得
    async init() {
      await this.reloadUser()
      await this.reloadTimeline()
    },

    // ユーザ取得
    async reloadUser() {
      try {
        const u = await this.fetchAPI("user")
        this.logined = true
        this.userName = u.name
      } catch {
        this.logined = false
        this.userName = null
      }
    },

    // タイムライン取得
    async reloadTimeline() {
      const sort = { "新着順": "new", "人気順": "trend" }[this.sort]
      const path = this.logined ? "timeline" : "public_timeline"
      this.timeline = await this.fetchAPI(path, { sort: sort })
    },

    // 並び替えボタン
    sort: "新着順",

    // タイムライン並び順変更
    async changeType() {
      this.sort = this.sort === "新着順" ? "人気順" : "新着順"
      await this.reloadTimeline()
    },

    // ユーザ登録ダイアログ
    showRegist: false, // ユーザ登録ダイアログ表示中か
    registName: "",    // ユーザ登録ダイアログ名前入力値
    registPass: "",    // ユーザ登録ダイアログパスワード入力値

    openRegist() {
      this.showRegist = true
    },

    closeRegist() {
      this.showRegist = false
    },

    // ユーザ登録
    async regist() {
      const r = await this.fetchAPI("regist", {
        name: this.registName,
        pass: this.registPass
      })
      if (r.err) {
        console.log("登録されています")
        return
      }
      localStorage.session = r.session
      await this.reloadUser()
      console.log("ユーザ登録しました")
      await this.reloadTimeline()
      this.closeRegist()
    }

    // ログインダイアログ
    showLogin: false,  // ログインダイアログ表示中か
    loginName: "",     // ログインダイアログ名前入力値
    loginPass: "",     // ログインダイアログパスワード入力値

    // ログインダイアログを開く
    openLogin() {
      this.showLogin = true
    },

    // ログインダイアログを閉じる
    closeLogin() {
      this.showLogin = false
    },

    // ログイン
    async login() {
      const r = await this.fetchAPI("login", {
        name: this.loginName,
        pass: this.loginPass
      })
      if (r.err) {
        console.log("ユーザ名かパスワードが違います")
        return
      }
      localStorage.session = r.session
      this.closeLogin()
      await this.reloadUser()
      console.log("ログインしました")
      await this.reloadTimeline()
    },

    // ログアウト
    async logout() {
      await this.fetchAPI("logout")
      delete localStorage.session
      this.logined = false
      this.reloadUser()
      console.log("ログアウトしました")
      await this.reloadTimeline()
    },

    // アップロードダイアログ
    showUpload: false, // アップロードダイアログ表示中か

    // アップロードダイアログを開く
    openUpload() {
      this.showUpload = true
    },

    // アップロードダイアログを閉じる
    closeUpload() {
      this.showUpload = false
    },

    // アップロードするファイルを選んだ
    fileSelected() {
    },

    // アップロードする
    upload() {
      this.closeUpload()
    }
  }))
</script>
```
