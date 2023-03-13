---
title: 公式サイトの作成
layout: denokun/page.njk
---


[Jekyll](http://jekyllrb-ja.github.io/)で公式サイトを作成する  
[GitHub Pages](https://docs.github.com/ja/pages/getting-started-with-github-pages/about-github-pages)で公開する

<img src="/denokun/img/jekyll.jpg" width="240" />

[Ruby 2.7](https://rubyinstaller.org/downloads/)をインストールする  
Ruby+Devkit 2.7.4-1 (x64)をインストール  

[jekyll](http://jekyllrb-ja.github.io/)をインストールする

```sh
gem install bundler jekyll
```

[サンプルサイト](hp.zip)をダウンロードする  
run.batを実行する  
ブラウザでhttp://localhost:4000 が開く  
ファイルを編集してブラウザをリロードする

---

GitHub Pagesで公開する  

リポジトリを作成する  
ソースをプッシュする  
リポジトリのSettingsを開く  
Pagesのsourceをmasterまたはmainにする  
<img src="/denokun/img/pages.jpg" width="640" />

「https://ユーザ名.github.io/リポジトリ名」にアクセスして確認する  