<template>
<div>
  <div class="head_border">
  </div>

  <article class="content content-about">
    <main class="content__main content-about__main">
      <div class="content-about__head">
        <h1 class="level1-heading_detail">利用方法について</h1>
      </div>
      <section class="content-about__item">
        <div class="content-about__item__inner">
          <h2 class="level2-heading">データカタログ横断検索システムとは</h2>
          <p>データカタログ横断検索システム（本システム）は、地方自治体等が提供しているデータカタログを横断的に検索する機能を提供する、サーチエンジンです。</p>

          <h3 class="level3-heading">背景・目的</h3>
          <p>政府によるオープンデータの推進の動きに応じて、政府省庁や地方自治体は保有するデータのインターネット公開を進めています。しかしそれぞれの団体がウェブサイトを立ち上げているため、利用者は目的のデータを探していくつものサイトを回る必要があります。
本システムを利用すると各サイトのデータを一箇所で探すことができます。</p>

          <h3 class="level3-heading">使い方</h3>
          <p>上部の「データセットを検索」と表示されている入力ボックスに「人口」「予算」などのキーワードを入力し、Enterキーを押すか右側のルーペアイコンをクリックしてください。検索結果一覧が表示されます。</p> 
          <p>OR検索：キーワードを空白で区切って複数入力すると、いずれかのキーワードを含むデータが検索されます（例；「人口 統計」）。「関連度の高い順」を選択した場合はより多くのキーワードを含むものから順番に表示されます。</p>
          <p>AND検索：全てのキーワードを含むデータだけを検索したい場合、キーワードを「AND」で区切って指定してください（例：「人口 AND 統計」）。</p>
          <p>絞り込み：左側メニューの「検索条件」を選択すると，検索結果を絞り込むことができます。たとえばエクセル形式またはCSV形式のデータを含むものだけを表示したい場合、「ファイル形式」の欄で「XLS」「XLSX」「CSV」をクリックします。</p>

          <h3 class="level3-heading">システムの制限</h3>
          <p>本システムは検索機能を提供するものであり、データカタログおよびデータの権利は各団体に帰属します。データを取得するためには各サイトに移動するようになっていますので、必ず移動先に記載されている利用条件や注意事項などをご確認ください。</p>
          <p>各サイトでカタログを更新してから本システムに反映されるまでに時間がかかる場合があります。そのため、本システムの検索結果と各サイトに掲載されている情報が異なる場合があります。また、本システムは事前の予告なしに機能や内容の変更、削除、サービスの停止等を実施することがあります。あらかじめご了承ください。</p>
          
        </div>
      </section>
    </main>
  </article>
  <!-- /.content -->
</div>
</template>
<script lang="ts">
import { Vue, Component, PropSync, Provide } from 'nuxt-property-decorator'

@Component
export default class AboutPage extends Vue {
      head() {
        return {
          title: '利用方法について'
        }
      }
}

</script>