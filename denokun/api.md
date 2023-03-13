---
title: API仕様
layout: denokun/page.njk
---

サーバのAPIを決める

---

ユーザを登録する

パス
```
/api/regist
```

リクエスト
```json
{
  name: "user1",  // ユーザ名
  pass: "password1"   // パスワード
}
```

レスポンス
```json
{
  session: "43604de8-fb27-48a1-a33d-7df8d6139505", // セッション
  err: "登録されているユーザ名です" // エラーメッセージ
}
```

---

ログインする

パス
```
/api/login
```

リクエスト
```json
{
  name "user1", // ユーザ名
  pass "password1"  // パスワード
}
```
レスポンス
```json
{
  session: "43604de8-fb27-48a1-a33d-7df8d6139505", // セッション
  err: "パスワードが違います" // エラーメッセージ
}
```

---

ログアウトする

パス
```
/api/logout
```

リクエスト
```json
{
  session: "43604de8-fb27-48a1-a33d-7df8d6139505", // セッション
}
```

---

ログイン中のユーザ情報を取得する

パス
```
/api/user
```
リクエスト
```json
{
  session: "43604de8-fb27-48a1-a33d-7df8d6139505", // セッション
}
```

レスポンス
```json
{
  name: "テスト"  // ユーザ名
}
```

---

ログイン前の写真一覧を取得する  

パス
```
/api/public_timeline
```

リクエスト
```json
{
  sort: "new" // 並び替え 新着=new いいね数=trend
}
```

レスポンス
```json
[
  {
    id: 1, // 写真ID
    url: "http://denoupload/1.png", // 画像URL
    good: 3,     // いいね数
    mygood: true // いいね済
  }
]
```

---

ログイン後の写真を一覧する

パス
```
/api/timeline
```

リクエスト
```json
{
  session: "43604de8-fb27-48a1-a33d-7df8d6139505", // セッション
  sort: "new" // 並び替え 新着=new いいね数=trend
}
```

レスポンス
```json
[
  {
    id: 1, // 写真ID
    url: "http://denoupload/1.png", // 画像URL
    good: 3,     // いいね数
    mygood: true // いいね済
  }
]
```

---

写真を投稿する

パス
```
/api/post
```

リクエスト
```json
  session: "43604de8-fb27-48a1-a33d-7df8d6139505", // セッション
  url: "http://denoupload/1.png", // 画像URL 
```

---

いいねする

パス
```
/api/good
```

リクエスト
```json
{
  session: "43604de8-fb27-48a1-a33d-7df8d6139505", // セッション
  photoId: 1, // 画像ID
  del: false  // いいねを解除する
}
```
