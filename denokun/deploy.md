---
title: デプロイ
layout: denokun/page.njk
---

最小構成のソースをデプロイする

GitHub Desktopでソースをコミットする  
「Changes」のコミットしたいファイルにチェックを入れる  
「Summary」を入力する  
「Commit to main」をクリックする  
<img src="/denokun/img/desktop_commit.jpg" width="480"/>  
「Push origin」をクリックしてGitHubに反映する  
<img src="/denokun/img/desktop_push.jpg" width="240"/>  
他の人の変更をGitHubからダウンロードするには「Fetch origin」をクリックした後  
<img src="/denokun/img/desktop_fetch.jpg" width="240"/>  
「Pull origin」をクリックする  
<img src="/denokun/img/desktop_pull.jpg" width="240"/>  

---

サーバにSSHで入る

[TeraTerm](https://forest.watch.impress.co.jp/library/software/utf8teraterm/)を起動する

SSHを選択する  
<img src="/denokun/img/tterm1.jpg" width="320"/>  
RSA/DSA/ECDSA/ED25519鍵を使うを選択  
<img src="/denokun/img/tterm2.jpg" width="320"/>  

Denoをインストールする
```sh
curl -fsSL https://deno.land/x/install/install.sh | sh
```

Denoにパスを通す  
「.bash_profile」に追記する
```sh
vi .bash_profile
```
追記内容
```
export DENO_INSTALL="/root/.deno"
export PATH="$DENO_INSTALL/# bin:$PATH"
```

反映する
```sh
source .bash_profile
```

ソースを取得する
```sh
git clone https://github.com/ユーザ名/リポジトリ名.git
cd リポジトリ名
```

8881番ポートを開く
```sh
firewall-cmd --permanent --add-port=8881/tcp
firewall-cmd --reload
```

サーバを起動する
```sh
nohup ./run.sh &
```

「Enter」でターミナルに戻る  
ログが「nohup.out」に出力される

サーバを更新する  
```sh
git pull
```

サーバを停止する  
プロセスIDを探してkillする
```sh
ps x | grep deno
kill プロセスID
```
