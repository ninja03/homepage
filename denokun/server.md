---
title: その他のAPI
layout: denokun/page.njk
---

残りのAPIを実装する
* タイムラインを返す
* 写真を投稿する
* いいねをする

``main.js``
```javascript
class MyServer extends Server {
  // ログイン中のユーザ情報を返します
  getUser(user) {
    return { name: user.name }
  }

  // タイムラインをそのまま返す
  // いいねの多い順に並び替えて返す
  publicTimeline(req) {
    let sortKey
    if (req.sort === "new") {
      sortKey = "id"
    } else if (req.sort === "trend") {
      sortKey = "good"
    } else {
      return null
    }
    return this.db.queryEntries(
      "select * from photo order by " + sortKey + " desc, id desc"
    ).map(a => ({
      id: a.id,
      url: a.url,
      good: a.good,
      mygood: false
    }))
  }
  
  // タイムライン(写真一覧)を返します
  timeline(user, req) {
    // タイムラインをそのまま返す
    // いいねの多い順に並び替えて返す
    let sortKey
    if (req.sort == "new") {
      sortKey = "id"
    } else if (req.sort == "trend") {
      sortKey = "good"
    } else {
      return null
    }
    // ログインしていればそれぞれの写真に
    // いいねしたかも返します
    return this.db.queryEntries(
      "select * from photo " +
      "left join good on good.photo_id = photo.id and good.user_id = :userId " +
      "order by " + sortKey + " desc, id desc",
      { userId: user.id }
    ).map(a => ({
      id: a.id,
      url: a.url,
      good: a.good,
      mygood: a.photo_id != null
    }))
  }

  // 写真を投稿します
  // 画像ファイルはImageUploaderで事前に保存されているので
  // urlだけをDBに保存します
  post(user, req) {
    this.db.query("insert into photo (user_id, url) values(:userId, :url)", {
      userId: user.id,
      url: req.url
    })
    return {}
  }

  // いいねします
  // 1ユーザー1回だけいいねできるようにgoodテーブルにも保存します
  // リクエストのdelがtrueのときはいいねを解除します
  good(user, req) {
    const good = this.db.queryEntries("select * from good where user_id = :userId and photo_id = :photoId", {
      userId: user.id,
      photoId: req.photoId
    })[0]
    if (req.del && !good) {
      return
    } else if (!req.del && good) {
      return
    }
    // 2つのテーブルを変更するのでトランザクション処理をします
    this.db.query("begin transaction")
    if (req.del) {
      this.db.query("delete from good where user_id = :userId and photo_id = :photoId", {
        userId: user.id,
        photoId: req.photoId
      })
      this.db.query("update photo set good = good - 1 where id = :id", {
        id: req.photoId
      })
    } else {
      this.db.query("insert into good (user_id, photo_id) values(:userId, :photoId)", {
        userId: user.id,
        photoId: req.photoId
      })
      this.db.query("update photo set good = good + 1 where id = :id", {
        id: req.photoId
      })
    }
    this.db.query("commit")
    return {}
  }
}
```
