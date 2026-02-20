<template>
  <div>
    <header>
      <div class="header__inner">
        <div class="header__logo">
          <a href="/">
            <h1 class="level1-heading_logo"><span>データカタログ</span>横断検索システム</h1>
          </a>
        </div>
        <nav class="header__nav">
          <nuxt-link to="/about">利用方法について</nuxt-link>
          <nuxt-link to="/terms">利用規約</nuxt-link>
          <nuxt-link to="/api">API仕様書</nuxt-link>
          <nuxt-link to="/sites">サイト一覧</nuxt-link>
        </nav>
      </div>
    </header>
    <slot />
    <footer>
      <div class="footer__inner">
        <div class="copyright">
          <small>copyright © SIP NIIコンソーシアム</small>
        </div>
      </div>
      <!-- /.footer__inner -->
    </footer>
  </div>
</template>

<style scoped>
.header__nav {
    flex: 0 0 400px;
    text-align: right;
}

.header__nav a {
    display: inline;
    padding: 5px 10px;
}
</style>