export default {
    mode: 'universal',
    server: {
        port: 3000,
        host: '0.0.0.0'
    },
    head: {
        title: "データカタログ横断検索システム",
        titleTemplate: '%s - データカタログ横断システム',
        meta: [
            {
                "charset": "utf-8"
            },
            {
                "name": "viewport",
                "content": "width=device-width, initial-scale=1, shrink-to-fit=no"
            },
            {
                "hid": "description",
                "name": "description",
                "content": "データカタログ横断システムはSIP NIIコンソーシアムが開発したオープンデータに係る情報検索サイトです。"
            },
            {
                "hid": "keywords",
                "name": "keywords",
                "content": "CKAN,オープンデータ,SIP,NII"
            },
            {
                "hid": "og:title",
                "property": "og:title",
                "content": "データカタログ横断システム"
            },
            {
                "hid": "og:url",
                "property": "og:url",
                "content": "https://search.ckan.jp"
            },
            {
                "hid": "og:description",
                "property": "og:description",
                "content": "データカタログ横断システムはSIP NIIコンソーシアムが開発したオープンデータに係る情報検索サイトです。"
            },
            {
                "hid": "og:image",
                "property": "og:image",
                "content": ""
            },
            {
                "hid": "og:site_name",
                "property": "og:site_name",
                "content": "データカタログ横断システム"
            },
            {
                "hid": "twitter:card",
                "property": "twitter:card",
                "content": "summary"
            },
            {
                "hid": "twitter:creator",
                "property": "twitter:creator",
                "content": "SIP NIIコンソーシアム"
            },
            {
                "hid": "twitter:title",
                "property": "twitter:title",
                "content": "データカタログ横断システム"
            },
            {
                "hid": "twitter:description",
                "property": "twitter:description",
                "content": "データカタログ横断システムはSIP NIIコンソーシアムが開発したオープンデータに係る情報検索サイトです。"
            },
            {
                "hid": "twitter:image",
                "property": "twitter:image",
                "content": ""
            },
        ],
        link: [
            {
                "rel": "apple-touch-icon-precomposed",
                "href": ""
            },
            {
                "rel": "icon",
                "href": "",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "rel": "stylesheet",
                "href": "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap"
            },
            {
                "rel": "stylesheet",
                "href": "/css/all.min.css"
            },
            {
                "rel": "stylesheet",
                "href": "/css/destyle.css"
            },
            {
                "rel": "stylesheet",
                "href": "/css/style.css"
            }
        ]
    },
    buildModules: [
        '@nuxt/typescript-build'
    ],
    plugins: [
        'plugins/axios.ts'
    ],
    modules: [
        '@nuxtjs/axios'
    ],
    axios: {
        proxy: false,
        headers: {
            common: {
                'Authorization': 'Basic c2lwMjpNUTRLeTUxNGY1djh5YVNvdEdiUw=='
            }
        },
        baseURL: 'http://localhost:25000'
    },
    proxy: {
        '/api': {
            target: 'http://localhost:25000',
            pathRewrite: { '^/api': '' }
        }
    },
    router: {
        middleware: [
        ],
        extendRoutes (routes, resolve) {
            routes.push({
              name: 'custom',
              path: '*',
              component: resolve(__dirname, 'pages/errors/404.vue')
            })
        }
    },
    env: {
        api : 'http://localhost:25000',
        web : 'http://frontend:23000'
    }
}