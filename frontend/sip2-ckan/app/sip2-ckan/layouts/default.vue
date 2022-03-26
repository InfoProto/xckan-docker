<template>
    <div>
        <header>
            <div class="header__inner">
            <div class="header__logo">
                <a href="/">
                    <h1 class="level1-heading_logo"><span>データカタログ</span>横断検索システム</h1>
                </a>
            </div>
            <nav v-if="$route.path!='/about'" class="header__nav"><nuxt-link to="/about">利用方法について</nuxt-link></nav>
            <section v-else class="header__search">
                <div class="search__inner">
                    <div class="search__form">
                        <form id="top__search__form" action="" v-on:submit.prevent.stop="search">
                            <input v-model="keyword"
                                id="search__box" class="search__box" name="search__box" type="text" placeholder="データセットを検索" />
                            <button class="search__btn" aria-label="検索" type="button" @click="search">
                                <i class="fas fa-search"></i>
                            </button>
                        </form>
                    </div>
                </div>
            </section>
            </div>
        </header>
            <nuxt />
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

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { datasetStore } from '~/store'
import { defaultQuery } from '~/store/dataset'

@Component({
})
export default class DefaultLayout extends Vue {
    keyword: string = ""

    search() {
        let query = defaultQuery()
        query.values.keyword = this.keyword

        this.$router.push({
            path: "/",
            query: query.toQuery(),
        })
    }

    mounted() {
    }
}
</script>