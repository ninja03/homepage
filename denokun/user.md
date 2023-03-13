---
title: ユーザ登録のAPI
layout: denokun/page.njk
---

ユーザ登録、ログイン、ログアウトを実装する  
パスワードは安全のためにハッシュ化して保存する

``main.js``
```javascript
import { Server } from "https://ninja03.github.io/denokun/lib/Server.js"

// DBはデータはSQLiteに保存してdeno-sqliteで読み書きします
import { DB } from "https://deno.land/x/sqlite@v3.0.0/mod.ts"

// bcryptはパスワードハッシュ化用です
import * as bcrypt from "https://deno.land/x/bcrypt@v0.2.4/mod.ts"

class MyServer extends Server {
  // 新しいユーザを登録してセッションを返します
  regist(req) {
    const user = this.db.queryEntries("select * from user where name = :name", {
      name: req.name
    })[0]
    if (user) {
      return { err: "登録されています" }
    }
    const hashPass = bcrypt.hashSync(req.pass)
    const session = crypto.randomUUID()
    this.db.query("insert into user (name, pass, session) values (:name, :pass, :session)", {
      name: req.name,
      pass: hashPass,
      session: session
    })
    return { session }
  }

  // ログインします
  // リクエストのパスワードをハッシュ化して
  // DB内のハッシュ値と比較します
  // 合っていればセッションをランダムに作ってDBに保存して
  // レスポンスで返します
  login(req) {
    const user = this.db.queryEntries("select * from user where name = :name limit 1", {
      name: req.name
    })[0]
    if (!user) {
      return { err: "登録されていません" }
    }
    // ハッシュは2番目の引数に
    if (!bcrypt.compareSync(req.pass, user.pass)) {
      return { err: "パスワードが違います" }
    }
    const session = crypto.randomUUID()
    this.db.query("update user set session = :session where id = :userId", {
      session: session,
      userId: user.id
    })
    return { session }
  }

  // ログアウトします
  // DBのセッションを削除します
  logout(user) {
    this.db.query("update user set session = null where id = :userId", {
      userId: user.id
    })
    return {}
  }
}

```

---

ログインな必要なAPIに  
セッションから特定したユーザを渡します

``main.js``
```javascript
class MyServer extends Server {
  api(path, req) {
    console.log(path, req)
    // セッション不要API
    switch (path) {
      case "/api/regist":          return this.regist(req)
      case "/api/login":           return this.login(req)
      case "/api/public_timeline": return this.publicTimeline(req)
    }
    // セッション必要API
    if (!("session" in req)) {
      return
    }
    // リクエストのセッションをDBのセッションと
    // 比較してユーザを特定します
    const user = this.db.queryEntries("select * from user where session = :session", {
      session: req.session
    })[0]
    if (!user) {
      return
    }

    switch (path) {
      case "/api/user":     return this.getUser(user)
      case "/api/logout":   return this.logout(user)
      case "/api/timeline": return this.timeline(user, req)
      case "/api/post":     return this.post(user, req)
      case "/api/good":     return this.good(user, req)
    }
  }
}
```
