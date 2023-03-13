---
title: Alpine.js
layout: denokun/page.njk
---

フロントエンドの実装に使う[Alpine.js](https://alpinejs.dev/start-here)の機能

**[x-data](https://alpinejs.dev/directives/data) (タグの内部でx-textなどが利用できるようにする)**
```html
<div x-data="app">
  <!-- x-textなどが利用できる -->
</div>

<script type="module">
  Alpine.data("app", () => ({
    init() {
      // 初期化処理
    }
  }))
</script>
```

**[x-text](https://alpinejs.dev/directives/text) (JS変数とHTMLタグ内のテキストの連携)**

```html
<div x-data="app">
  時計
  <div x-text="text"></div>
</div>

<script type="module">
  Alpine.data("app", () => ({
    text: "",

    init() {
      setInterval(() => {
        const now = new Date()
        this.text = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds()
      }, 100)
    }
  }))
</script>
```

**[:(コロン)](https://alpinejs.dev/directives/bind) (JS変数とHTML属性の連携)**

```html
<div x-data="app">
  <a :href="link">ランダムリンク</div>
</div>

<script type="module">
  Alpine.data("app", () => ({
    link: "http://1.com/",

    init() {
      setInterval(() => {
        if (this.link == "http://1.com/") {
          this.link = "http://2.com/"
        } else{
          this.link = "http://1.com/"
        }
      }, 1000)
    }
  }))
</script>
```

**[@(アットマーク)](https://alpinejs.dev/directives/on) (JS関数とHTMLイベントを連携する)**

```html
<div x-data="app">
  <button @click="click()">クリックしてください</button>
</div>

<script type="module">
  Alpine.data("app", () => ({
    click() {
      alert("クリックされました")
    }
  }))
</script>
```

**[x-show](https://alpinejs.dev/directives/show) (JS変数とHTMLタグの表示非表示の連携)**

```html
<div x-data="app">
  <div x-show="show">3秒経ちました</div>
</div>

<script type="module">
  Alpine.data("app", () => ({
    show: false,

    init() {
      setTimeout(() => {
        this.label = true
      }, 3000)
    }
  }))
</script>
```

**[x-model](https://alpinejs.dev/directives/model) (JS変数とHTMLのInputタグの連携)**

```html
<div x-data="app">
  <input x-model="name" />
  <button @click="click()">あいさつ</button>
</div>

<script type="module">
  Alpine.data("app", () => ({
    name: "",

    click() {
      alert(this.name + "さん こんちには")
    }
  }))
</script>
```

**[x-for](https://alpinejs.dev/directives/for) (JS配列変数とHTMLタグの連携)**

```html
<div x-data="app">
  ブックマーク
  <template x-for="b in bookmark">
    <a :href="b.url" x-text="b.title"></a><br>
  </template>
</div>

<script type="module">
  Alpine.data("app", () => ({
    bookmark: [],

    init() {
      this.bookmark.push({ url: "http://1.com/", title: "サイト1" })
      this.bookmark.push({ url: "http://2.com/", title: "サイト2" })
    }
  }))
</script>
```

**[x-transition](https://alpinejs.dev/directives/transition) (HTMLタグ表示時にアニメーションする)**

```html
<div x-data="app">
  <div x-show="show" x-transition>徐々に表示</div>
</div>

<script type="module">
  Alpine.data("app", () => ({
    show: false,

    init() {
      setTimeout(() => {
        this.show = true
      }, 1000)
    }
  }))
</script>
```