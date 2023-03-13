---
title: VPS
layout: denokun/page.njk
---

[ConoHa VPS](https://www.conoha.jp/)にデプロイする

<img src="/denokun/img/conoha.jpg" width="640" />

1. 「サーバ追加」をクリック  
リージョン：東京  
サービス：VPS  
VPS割引きっぷ：利用しない  
512MB CPU 1Core SSD 30GB  
イメージタイプ：CentOS Stream8(64bit)  
3. rootパスワードを入力
4. ネームタグにアプリ名を入力
5. 「追加」をクリック
6. サーバリストのステータスが「起動中」になるのを待つ
7. ネットワーク情報のIPアドレスをコピー
8. [Tera Term](https://forest.watch.impress.co.jp/library/software/utf8teraterm/)を起動
9. TCP/IPのホストにIPアドレスを入力する
10. ユーザ名に「root」、パスフレーズにrootパスワードを入力してログイン
11. Gitをインストールする
```sh
yum install -y git
```
12. [デプロイ](deploy)する
13. ブラウザで 「http://IPアドレス:8881」にアクセスする