---
title: HTMLと素材
layout: denokun/page.njk
---

HTMLを編集して基礎を作る

``static/index.html``
```html
<!-- 全体 -->
<div>
  <!-- メニューバー -->
  <div>
    <img src="logo.dio.svg">
    <span>ログインユーザ名</span>
    <button>ユーザ登録</button>
    <button>ログイン</button>
    <button>ログアウト</button>
    <button>アップロード</button>
    <button>並び替え</button>
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
  <div>
    ユーザ名: <input type="text">
    パスワード: <input type="text">
    <button>登録</button>
  </div>

  <!-- ログインダイアログ -->
  <div>
    ユーザ名: <input type="text">
    パスワード: <input type="text">
    <button>ログイン</button>
  </div>

  <!-- アップロードダイアログ -->
  <div>
    プレビュー
    <img>
    ファイル選択
    <input type="file" id="inputFile" required>
    <button>アップロード</button>
  </div>
</div>
```

---

画像素材を作成する

ロゴを作る

``static/logo.dio.svg``  
<img src="/denokun/img/drawio.jpg" width="480"/>  

拡張子dio.svgはdraw.ioで編集後  
変換せずにSVGファイルとしてHTMLに表示できる

ファビコンを作成する

``static/favicon.dio.svg``  
<img src="/denokun/img/drawio2.jpg" width="480"/>  

HTMLにfaviconを設定する

``static/index.html``
```html
<head>
  <link rel="icon" href="favicon.dio.svg" type="image/svg+xml">
</head>
```