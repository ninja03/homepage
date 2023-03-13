---
title: トースト
layout: denokun/page.njk
---

メッセージをconsole.logでの出力を改良

* ユーザ登録、ログイン完了
* エラーメッセージ
* 画像アップロード完了

右下に2秒間ポップアップするように変更

<img src="/denokun/img/toast.jpg" width="480" />  

``static/index.html``
```html
<!doctype html>
<html>
  <head>
    <style>
      [x-cloak] {
        display: none;
      }
    </style>
  </head>

  <body class="bg-blue-200">
    <div x-data="app" x-cloak>
      <div x-text="msg" x-show="msg != null" class="absolute bottom-0 right-0 p-2 bg-blue-400 text-white"></div>
    </div>

    <script type="module">
      Alpine.data("app", () => ({
        msg: null,

        // ページ右下に通知文を表示(2秒間)
        toast(msg) {
          this.msg = msg
          setTimeout(() => { this.msg = null }, 2000)
        },

        async good(photo) {
          if (!this.logined) {
            this.toast("ログインが必要です")
            return
          }
        },

        upload() {
          up.onload = async url => {
            await this.fetchAPI("post", { url })
            this.toast("「" + this.up + "をアップしました")
          }
        },

        async regist() {
          const r = await this.fetchAPI("regist", {
            name: this.registName,
            pass: this.registPass
          })
          if (r.err) {
            this.toast("登録されています")
            return
          }
          this.toast("ユーザ登録しました")
        },

        async login() {
          const r = await this.fetchAPI("login", {
            name: this.loginName,
            pass: this.loginPass
          })
          if (r.err) {
            this.toast("ユーザ名かパスワードが違います")
            return
          }
          this.toast("ログインしました")
        },

        // ログアウトする
        async logout() {
          await this.fetchAPI("logout")
          this.toast("ログアウトしました")
        }
      }))
    </script>
  </body>
</html>
```
