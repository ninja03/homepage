---
title: 仮のサーバ
layout: denokun/page.njk
---

サーバにアクセスしてきたURLに応じて  
関数を呼び出す  
仮のレスポンスを返す

``main.js``
```javascript
class MyServer extends Server {
  api(path, req) {
    switch (path) {
      case "/api/regist":          return this.regist(req)
      case "/api/login":           return this.login(req)
      case "/api/public_timeline": return this.publicTimeline(req)
      case "/api/user":            return this.getUser(req)
      case "/api/logout":          return this.logout(req)
      case "/api/timeline":        return this.timeline(req)
      case "/api/post":            return this.post(req)
      case "/api/good":            return this.good(req)
    }
  }

  regist(req) {
    console.log(req.name, req.pass)
    return {
      session: "43604de8-fb27-48a1-a33d-7df8d6139505"
    }
  }

  login(req) {
    console.log(req.name, req.pass)
    return {
      session: "43604de8-fb27-48a1-a33d-7df8d6139505"
    }
  }

  logout(req) {
    console.log(req.session)
    return {}
  }

  publicTimeline(req) {
    console.log(req.sort)
    return [
      {
        id: 1,
        url: "http://denoupload/1.png",
        good: 3
      }
    ]
  }

  timeline(req) {
    console.log(req.session, req.sort)
    return [
      {
        id: 1,
        url: "http://denoupload/1.png",
        good: 3,
        mygood: false
      }
    ]
  }

  post(req) {
    console.log(req.session, req.url)
    return {}
  }

  good(req) {
    console.log(req.session, req.photoId)
    return {}
  }
}
```
