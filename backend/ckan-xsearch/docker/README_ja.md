# カタログ横断検索システム (XCKAN System)

2022-03-31 sagara@info-proto.com

- 設定

    このシステムは、収集したメタデータをファイルツリーに保存し、
    検索用インデックスを Solr で管理します。これらのデータは
    Docker コンテナを終了したときに消えてしまわないよう、
    コンテナの外に保存します。

    保存する先は `docker-compose.yml` の `volumes` セクションで
    定義していますので、必要に応じて変更してください。

    変更しない場合、以下の場所にデータが保存されます。
    - Solr のデータ : `./volumes/solr`
    - 収集したメタデータ : `./volumes/backend_cache`
    - 登録したサイト : `./volumes/backend_db`

    本システムの利用を終了し、収集したメタデータやインデックスを
    もう利用しない場合は、 `./volumes` の下を削除してください。

        % rm -rf ./volumes

- サービス起動前の手順

    Docker でサービスを起動する前に、データ保存用のディレクトリを
    作成してください。また、コンテナ上で動くサービスがこれらの
    ディレクトリにファイルを書き込めるように、許可を与えてください。

        % mkdir -p volumes/backend_db/ volumes/backend_cache/ volumes/solr/
        % chmod -R a+w volumes/

- サービス起動

    次のコマンドでサービスを起動します。バックグラウンドで動かすので
    `-d` を付けてください。

        % docker-compose up -d

- 初期化（初回のみ実行）

    Solr サービスを起動すると、本システム用のコア `ckan-xsearch` は
    自動的に作成されますが、次のコマンドでスキーマ定義を行なう必要があります。

        % curl -X POST -H 'Content-type:application/json' \
          --data-binary @../xckan-schema.json \
          http://localhost:28983/solr/ckan-xsearch/schema

    次に、 backend サービスで利用するデータベースの初期化と、
    管理者アカウントの作成を行ないます。

        % docker-compose exec backend python /app/manage.py migrate
        % docker-compose exec backend python /app/manage.py collectstatic --noinput
        % docker-compose exec -it backend python /app/manage.py createsuperuser

    最後の `createsuperuser` では、管理者アカウントのユーザ名と
    メールアドレス、パスワードを設定しますので、覚えておいてください。
    もし忘れた場合はもう一度このコマンドを実行すれば、別の管理者用
    アカウントを追加できます。

- ウェブインタフェース

    ブラウザで `http://<server>:25000/` を開いてください。
    サーバ名は Docker サービスが動いているサーバの名前または
    IP アドレスを指定します。 Docker サービスを動かしている
    サーバ上であれば `http://localhost:25000/` でアクセスできます。
    
    右上隅の "ログイン" リンクをクリックし、上記の `createsuperuser` で
    決定したユーザ名とパスワードを入力します。

    ログインできたら、トップメニューの "CKANサイト一覧" リンクを
    クリックしてください。ここに登録済みのサイト一覧が表示されます。

    左上隅の "インポート" ボタンを押し、この README と同じ
    ディレクトリにある `xckan_sitelist.json` ファイルを
    アップロードして、サイトを一括登録できます。

    個別に登録したい場合は、右上の "管理サイト" リンクから
    「Django 管理サイト」に移動してください。ここでサイトや
    ユーザの登録や編集を行なうことができます。

    インポートしたサイトは念のため更新不可の状態になっています。
    一覧から任意のサイトを選択し、"検査" ボタンを押してください。
    そのサイトがアクセス可能であれば、更新可能に設定されます。
    
    更新開始日時や更新間隔を変更したい場合は ”管理" ボタンから
    Django 管理サイトに移動できます。

- サイトメタデータの更新（任意の時点で）

    サイトを登録し、更新可能に設定したら、いつでもメタデータを収集して
    インデックスを更新できます。以下のコマンドを実行してください。

        % docker-compose exec -it backend python /app/manage.py runscript update

    定期的に更新するには、 cron などで一定時間ごとにこのコマンドを
    実行する必要があります。

- ログファイルの確認

    本システム実行中に発生したエラーや、更新時のログは
    以下のパスに生成されるファイルに保存されます。

        ckan-xsearch/django-backend/xckan/logs/xckan.log

    ログの出力レベルやフォーマットを変更したい場合は
    以下のパスにある設定ファイルを編集してください。

        ckan-xsearch/django-backend/xckan/logging.json

- Solr 管理ツール

    通常利用する必要はありませんが、 Solr に登録されている生のデータや
    検索結果を確認したい場合には、 Solr 管理ツールにアクセスできます。

    `http://<server>:28983/solr/` を開いて左側のメニューにある
    "Core Selecter" で `ckan-xsearch` を選択してください。

- 横断検索システム API

    横断検索システムの API は以下の URL でアクセスできます。

    - List metadata: 登録済みメタデータの ID リストを返します

        http://<server>:25000/api/package_list

    - Show metadata: 指定した ID を持つメタデータの詳細を返します

        http://localhost:25000/api/package_show?id=<id>

    - Search metadata: 条件に合致するメタデータのリストを返します

        http://localhost:25000/api/package_search?q=%E6%96%B0%E5%9E%8B%E3%82%B3%E3%83%AD%E3%83%8A&start=0&rows=50&sort=score+desc

- サービスの停止

    次のコマンドで、バックグラウンドで動いているサービスを停止します。

        % docker-compose down

- サービスの再起動

    一度停止したサービスを再起動する場合は以下のコマンドを実行するだけで、
    それ以外の手順は必要ありません。

        % docker-compose up -d

- サービスの初期化

    デバッグなどの目的で、収集したメタデータや登録したサイトを削除し、
    状態を初期化したい場合には以下の手順を実行してください。

        % docker-compose down
        % docker image rm docker_backend solr
        % rm -rf volumes/

    もし本システムのバージョンが新しくなっている場合は、 git で
    新バージョンを取得してください。

        % git pull

    これで最新かつ初期状態に戻ります。あとは「サービス起動前の手順」から
    もう一度実行してください。
