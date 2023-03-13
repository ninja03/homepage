---
title: データベース
layout: denokun/page.njk
---

SQLite用ライブラリ[deno-sqlite](https://github.com/dyedgreen/deno-sqlite)を使う

テーブルを設計する  
* ログイン情報保存のためのuserテーブル  
* 写真URLといいね数のためのphotoテーブル  
* いいねを1回だけできるようにgoodテーブル


---

userテーブル

|  カラム名  |  型  | 説明 |
| ---- | ---- | ---- |
|  id  |  数値  | ID(自動採番) |
|  name  |  文字列  | ユーザ名 |
|  pass  |  文字列  | パスワード |
|  session  |  文字列  | セッション  |
|  time  |  文字列  | 登録日時 |

---

photoテーブル (写真)

|  カラム名  |  型  | 説明 |
| ---- | ---- | ---- |
|  id  |  数値  | ID(自動採番) |
|  user_id  |  数値  | ユーザID |
|  url  |  文字列  | 画像URL |
|  good  |  数値  | いいね数  |
|  time  |  文字列  | 投稿日時 |

---

goodテーブル (いいね)

|  カラム名  |  型  | 説明 |
| ---- | ---- | ---- |
|  user_id  |  数値  | ユーザID |
|  photo_id  |  数値  | 写真ID |
|  time  |  文字列  | いいね日時 |

---


コンストラクタを追加する  
サーバを起動すると``data.db``を作成する  
テーブルがない場合は新しく作る  

データを閲覧・編集するには  
[DB Browser for SQLite](https://sqlitebrowser.org/)をインストールする

``main.js``
```javascript
import { Server } from "https://ninja03.github.io/denokun/lib/Server.js"
import { DB } from "https://deno.land/x/sqlite@v3.0.0/mod.ts"

class MyServer extends Server {
  constructor(dbname) {
    super()
    this.db = new DB(dbname)

    // ユーザーテーブル
    this.db.query(`
      create table if not exists user (
        id integer primary key autoincrement,
        name text not null unique,
        pass text not null,
        session text,
        time not null default (datetime ('now', 'localtime'))
      )
    `)

    // 写真テーブル
    this.db.query(`
      create table if not exists photo (
        id      integer primary key autoincrement,
        user_id integer not null,
        url     text not null,
        good    integer not null default 0,
        time not null default (datetime ('now', 'localtime'))
      )
    `)

    // いいねテーブル(ユーザーIDと写真IDでユニーク)
    this.db.query(`
      create table if not exists good (
        user_id integer not null,
        photo_id integer not null,
        time not null default (datetime ('now', 'localtime')),
        primary key(user_id, photo_id)
      )
    `)
  }

  new MyServer("data.db").start(8881)
}
```