---
title: 画像アップロード
layout: denokun/page.njk
---

* [ImageUploader](https://fukuno.jig.jp/2943)を使う
  * 画像ファイルはサーバのdataフォルダに保存されURLが返る
* 画像ファイルを選択するとプレビューを表示する

``static/index.html``
```html
<div x-data="app">
  
  <div x-show="showUpload">
    <img :src="preview">
    ファイル選択
    <input id="inputFile" @change="fileSelected" type="file" required>
    <button @click="upload()" :class="buttonStyle">アップロード</button>
  </div>

</div>

<script type="module">
  import Alpine from "https://unpkg.com/alpinejs@3.2.3/dist/module.esm.js"
  import { fetchJSON } from "https://ninja03.github.io/denokun/lib/fetchJSON.js"
  import { ImageUploader } from "https://ninja03.github.io/denokun/lib/ImageUploader.js"

  Alpine.data("app", () => ({
    
    // アップロードするファイルを選んだ
    fileSelected() {
      const reader = new FileReader()
      reader.onload = () => { this.preview = reader.result }
      reader.readAsDataURL(inputFile.files[0])
    },

    // アップロードする
    upload() {
      const f = inputFile.files[0]
      let up = new ImageUploader(this.server + "/data/")
      // 最大幅1200px、最大ファイルサイズ1メガバイト
      up.setFile(f, 1200, 1024 * 1024)
      up.onload = async url => {
        await this.fetchAPI("post", { url })
        this.up = f.name
        console.log("「" + this.up + "をアップしました")
        this.closeUpload()
        this.reloadTimeline()
      }
    }
  }))

</script>
```