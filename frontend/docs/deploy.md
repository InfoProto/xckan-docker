# データカタログ横断検索システムデプロイ手順書

この手順書は Ubuntu20.04 以上を対象としています。

本システムは動的にタイトルやOGPを設定するために、サーバサイドレンダリング(SSR)を利用して運用を行うことを前提とします。

## Node.jsのインストール

* node自体のバージョン管理のため、[nvm](https://github.com/nvm-sh/nvm)をインストールします。

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
```

* node25をインストールして有効化します。
    * `current` により利用中のバージョンを確認できます。
    * 複数のバージョンが管理されている環境では、適宜nvmのヘルプやドキュメントを参照して設定を行ってください。

```
$ nvm install 25
$ nvm use 25
$ nvm current
v25.6.1
$ node -v
v25.6.1
```

## ソースコードのclone

* githubよりソースコードをcloneします

```
$ git clone https://github.com/InfoProto/xckan-docker
```

* 必要な場合、環境依存の設定を行ないます

```
$ cd xckan-docker/frontend/app/sip2-ckan
$ cp dot_env.dist .env
$ vi .env
```

- 利用可能な環境変数（かっこ内はデフォルト値）
    - `SERVER_PORT` (3000)

        サーバが待ち受けるポート番号を指定します。

    - `SERVER_HOST` ('0.0.0.0')

        サーバが受け付けるホストを指定します。
        外部からのアクセスを許可するには '0.0.0.0' としてください。

    - `NUXT_PUBLIC_FRONTEND_WEB_BASE_URL` ('https://search.ckan.jp/')

        サーバのトップページの URL を指定します。

    - `NUXT_PUBLIC_BACKEND_API_BASE_URL` ('https://search.ckan.jp/backend/api')

        バックエンドの API エンドポイントを指定します。

    - `NUXT_BACKEND_API_BASE_URL` (未設定)

        SSRサーバから見たバックエンドの API エンドポイントを指定します。
        エンドポイントがグローバルにアクセス可能な場合、未設定のままとします。

    - `GOOGLE_GTAG` (未指定)

        Google Analystics 用の gtag を指定します。


* コンパイルします

設定を変更した場合も、 `npm run build` を実行する必要があります。

```
$ cd xckan-docker/frontend/app/sip2-ckan
$ npm install
$ npm run build
```

* サーバを起動します
    * 単純な方式として、エントリポイントとなるスクリプトを実行する方法を示します。
    * [PM2](https://pm2.keymetrics.io/)などのプロセスマネージャを用いる方法もあります。[nuxt4のデプロイドキュメント](https://nuxt.com/docs/4.x/getting-started/deployment)を参照してください。

```
node .output/server/index.mjs
```

## supervisorの導入

```
$ sudo apt-get install supervisor
```

* エディタを利用して以下の `/etc/supervisor/conf.d/ckan.conf` を以下の内容で作成します

```
[program:ckan]
command = node .output/server/index.mjs
user = ubuntu
directory = {{your clone path}}/xckan-docker/frontend/app/sip2-ckan/
autostart = true
autorestart = true
stdout_logfile = /var/supervisor/ckan.log
stderr_logfile = /var/supervisor/ckan-stderr.log
redirect_stderr = true
```

* supervisorの登録と起動を行ないます

```
$ sudo service supervisor start 
$ sudo supervisorctl restart all
```
