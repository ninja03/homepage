---
title: CSS
layout: denokun/page.njk
---

[TailWind CSS](https://tailwindcss.com/)を使って見た目を調整する  
[チートシート](https://tailwindcomponents.com/cheatsheet/)  
ボタンやダイアログのスタイルは何度も使うので変数にする  
ダイアログの外側をクリック(@click.outside)するとダイアログを閉じる
いいねボタンはいいねすると色を反転する

``static/index.html``
```html
<!doctype html>
<html>
  <head>
    <link href="https://unpkg.com/tailwindcss@2.2.7/dist/tailwind.css" rel="stylesheet">
  </head>

  <body class="bg-blue-200">
    <div x-data="app">
      <div class="bg-blue-400 text-center fixed top-0 w-full p-1">
        <img src="logo.dio.svg" class="inline">
        <span x-text="userName + 'さん'" x-show="logined" class="text-white"></span>
        <button @click="openRegist()" x-show="!logined" :class="buttonStyle">ユーザ登録</button>
        <button @click="openLogin()"  x-show="!logined" :class="buttonStyle">ログイン</button>
        <button @click="logout()"     x-show="logined"  :class="buttonStyle">ログアウト</button>
        <button @click="openUpload()" x-show="logined"  :class="buttonStyle">アップロード</button>
        <button @click="changeType()" x-text="sort"     :class="buttonStyle"></button>
      </div>

      <div class="bg-white mx-auto w-2/3 mt-12 shadow-xl">
        <template x-for="photo in timeline">
          <div class="flex flex-col">
            <div x-text="photo.id" class="mx-auto"></div>
            <img :src="photo.url" style="width: 360px" class="mx-auto rounded">
            <button x-text="photo.good + 'いいね'" @click="good(photo)"
              :class="{
                'bg-gray-500 text-white p-1 mx-auto mt-2 rounded': photo.mygood,
                'bg-gray-300 p-1 mx-auto mt-2 rounded': !photo.mygood
              }"></button>
          </div>
        </template>
      </div>

      <div x-show="showRegist" :class="dialogBackStyle" x-transition>
        <div @click.outside="closeRegist()" :class="dialogForeStyle">
          <p>ユーザ名: <input x-model="registName" type="text" class="border border-black p-1 rounded"></p>
          <p>パスワード: <input x-model="registPass" type="text" autocomplete="off" class="border border-black p-1 rounded"></p>
          <p><button @click="regist()" :class="buttonStyle">登録</button></p>
        </div>
      </div>

      <div x-show="showLogin" :class="dialogBackStyle" x-transition>
        <div @click.outside="closeLogin()" :class="dialogForeStyle">
          <p>ユーザ名: <input type="text" x-model="loginName" class="border border-black p-1 rounded"></p>
          <p>パスワード: <input type="text" x-model="loginPass" autocomplete="off" class="border border-black p-1 rounded"></p>
          <p><button @click="login()" :class="buttonStyle">ログイン</button></p>
        </div>
      </div>

      <div x-show="showUpload" :class="dialogBackStyle" x-transition>
        <div @click.outside="closeUpload()" :class="dialogForeStyle">
          <p class="m-2"><img :src="preview" style="width: 480px" class="mx-auto rounded"></p>
          <p class="m-2">
            <label :class="buttonStyle">
              ファイル選択
              <input id="inputFile" @change="fileSelected" type="file" required class="text-white hidden">
            </label>
          </p>
          <p class="m-2"><button @click="upload()" :class="buttonStyle">アップロード</button></p>
        </div>
      </div>
    </div>

    <script type="module">
      Alpine.data("app", () => ({
        // CSSクラスで何回も使うのを定義しておきます
        buttonStyle: "bg-gray-300 p-1 rounded",
        darkButtonStyle: "bg-gray-500 text-white p-1 rounded",
        dialogBackStyle: "absolute inset-0 flex justify-center items-center bg-black bg-opacity-50",
        dialogForeStyle: "bg-white mx-auto w-1/2 mt-8 shadow-xl text-center p-1 rounded"
      }))
    </script>
  </body>
</html>
```
