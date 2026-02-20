import type { LocationQuery } from 'vue-router';
import type { Dataset, Facet, FacetKey } from '~/types/dataset'
import { calculate, parse, type Segment } from '~/utils/leven';
import { useApi } from '../useApi';

//----------------------------------------------------------------
// Types
//----------------------------------------------------------------
/** ソート項目。 */
export type SortType = "relevance" | "last_update"
/** 並び順。 */
export type SortOrder = "asc" | "desc"

/*
 * データセット検索クエリ。
 */
export type Query = {
    page: number;
    limit: number;
    sortType: SortType;
    sortOrder: SortOrder;
    keyword: string;
    organizations: Array<string>;
    sites: Array<string>;
    tags: Array<string>;
    formats: Array<string>;
}

export type SearchResult = {
  datasets: Dataset[];
  sameSeries: Array<Dataset[]>;
  similarSeries: Array<Dataset[]>;
  facets: Facet;
  usedFacets: Map<FacetKey, string[]>;
  total: number;
}

//----------------------------------------------------------------
// Composables
//----------------------------------------------------------------
export const useQuery = () => useState<Query>(() => Q.default())

export const useSearchResult = () => useState<SearchResult>(() => ({
  datasets: [],
  sameSeries: [],
  similarSeries: [],
  facets: {
    organization: [],
    xckan_site_name: [],
    tags: [],
    res_format: [],
  },
  usedFacets: new Map<FacetKey, string[]>(),
  total: 0,
} as SearchResult));

export const useSearch = async () => {
  const route = useRoute();
  const router = useRouter();

  const query = useQuery();
  const result = useSearchResult();

  // クエリをルーティングパラメータから初期化。
  query.value = Q.fromRouteQuery(route.query);

  const { data, refresh } = await useApi<SearchResponse>('/package_search', {
    params: computed(() => Q.toParams(query.value)),
    watch: false,
  });

  watchEffect(() => {
    if (!data.value) return;
    result.value = toResult(data.value, query.value);
  });

  // 明示的な検索用関数。ルーティングにより実現する。
  const search = async () => {
    router.replace({
      query: Q.toRouteParams(query.value),
    })
    await refresh();
  };

  // クエリ変更関数。再検索を自動では行わない。
  const putFacet = (key: FacetKey, value: string) => {
    const q = { ...query.value };
    Q.putFacet(q, key, value);
    query.value = q;
  };

  const delFacet = (key: FacetKey, value: string) => {
    const q = { ...query.value };
    Q.delFacet(q, key, value);
    query.value = q;
  }

  const resetFacets = () => {
    query.value = { ...query.value,
      organizations: [],
      sites: [],
      tags: [],
      formats: [],
    };
  };

  const setPage = (page: number | "++" | "--") => {
    if (page === "++") {
      query.value = { ...query.value, page: query.value.page + 1  }
    } else if (page === "--") {
      query.value = { ...query.value, page: Math.max(1, query.value.page - 1)  }
    } else {
      query.value = { ...query.value, page }
    }
  };

  return {
    query,
    result,
    search,
    putFacet,
    delFacet,
    resetFacets,
    setPage,
  }
}

export const useDataset = async (id: string) => {
  const dataset = useState<Dataset | undefined>(() => undefined)

  const { data, refresh } = await useApi<ShowResponse>('/package_show', {
    params: { id },
    key: `dataset-${id}`,
  })

  dataset.value = data.value?.result;

  watchEffect(() => {
    if (!data.value) return;
    dataset.value = data.value.result;
  })

  return {
    dataset: dataset as Ref<Dataset>,
    refresh,
  }
}

export const useHotTags = async () => {
  const hotTags = useState<Array<[string, number]>>(() => [])
  
  const { data, refresh } = await useApi('/hot_tag')

  watchEffect(() => {
    if (!data.value) return;
    hotTags.value = Object.entries(data.value).map(([tag, count]) => [tag, count as number]);
  })

  return {
    hotTags,
    refresh,
  }
}
  
//----------------------------------------------------------------
// Internal utilities
//----------------------------------------------------------------
/**
 * 検索APIレスポンス。
 */
type SearchResponse = {
  result: {
    count: number
    facets: {
      facet_fields: Facet
    }
    q: {
      fq?: string
      q: string
      start: string
      rows: string
      sort: string
    }
    results: Dataset[]
  }
}

/**
 * データセット詳細APIレスポンス。
 */
interface ShowResponse {
    result: Dataset
    success: Boolean
}

// クエリ関連ユーティリティ。
const Q = {
  /**
   * デフォルトクエリを生成する。
   * @returns デフォルトクエリ。
   */
  default: (): Query => ({
    page: 1,
    limit: 50,
    sortType: "relevance",
    sortOrder: "desc",
    keyword: "",
    organizations: [],
    sites: [],
    tags: [],
    formats: [],
  }),

  /**
   * クエリをAPIのパラメータに変換する。
   * @param query クエリ。
   * @returns APIパラメータ。
   */
  toParams: (query: Query): any => {
    // クエリ文字列。指定されない場合はワイルドカード。
    const q: string = query.keyword || "*";

    // Solrの絞り込みクエリ。
    const fq: string = ([
      ["organization", query.organizations],
      ["xckan_site_name", query.sites],
      ["tags", query.tags],
      ["res_format", query.formats],
    ] as Array<[string, Array<string>]>)
      .filter(([_, vs]) => vs.length > 0)
      .map(([k, vs]) => `+${k}:${vs.map(x => `"${x}"`).join(" OR ")}`)
      .join(" ")

    const order: SortOrder = query.sortOrder == "desc" ? "desc" : "asc"
    const sort: string = ((t: SortType): string => {
      switch (t) {
        case "relevance":
          return `score ${order}`
        case "last_update":
          return `xckan_last_updated ${order}`
        default:
          return `score ${order}`
      }
    })(query.sortType)

    const start: number = (query.page - 1) * query.limit
    const rows: number = query.limit

    return { q, fq, sort, start, rows }
  },

  /**
   * クエリにファセットを追加する。
   * @param query クエリ。
   * @param key ファセットのキー。
   * @param value ファセット値。
   */
  putFacet: (query: Query, key: FacetKey, value: string) => {
    switch (key) {
      case "organization":
        query.organizations = [value];
        break;
      case "site":
        query.sites = [value];
        break;
      case "tag":
        const tags = query.tags;
        if (!tags.includes(value)) {
          query.tags = [...tags, value];
        }
        break;
      case "format":
        const formats = query.formats;
        if (!formats.includes(value)) {
          query.formats = [...formats, value];
        }
        break;
    }
  },

  /**
   * クエリからファセットを削除する。
   * @param query クエリ。
   * @param key ファセットのキー。
   * @param value キーにより利用される、一致する値のみを削除するための値。
   */
  delFacet: (query: Query, key: FacetKey, value: string) => {
    switch (key) {
      case "organization":
        query.organizations = [];
        break;
      case "site":
        query.sites = [];
        break;
      case "tag":
        if (query.tags.includes(value)) {
          query.tags = query.tags.filter(t => t != value);
        }
        break;
      case "format":
        if (query.formats.includes(value)) {
          query.formats = query.formats.filter(f => f != value);
        }
        break;
    }
  },

  /**
   * クエリをルーティングパラメータから生成する。
   * @param params ルーティングパラメータ。
   * @returns 生成されたクエリ。
   */
  fromRouteQuery: (params: LocationQuery): Query => {
    const query = Q.default();

    // クエリ文字列はキーワードとして設定。
    if (params.q) {
      query.keyword = params.q as string
    }

    // ファセットクエリを分解。
    if (params.fq) {
      if (params.fq instanceof Array) {
        params.fq.forEach(v => {
          parseFQ(v as string, (k, v) => {
            Q.putFacet(query, k, v);
          })
        })
      } else {
        parseFQ(params.fq as string, (k, v) => {
          Q.putFacet(query, k, v);
        })
      }
    }

    // その他のパラメータ。
    if (params.sort) {
      query.sortType = params.sort as SortType;
    }
    if (params.order) {
      query.sortOrder = params.order as SortOrder;
    }
    if (params.page) {
      const page = Number.parseInt(params.page as string)
      if (Number.isNaN(page) == false) {
        query.page = page;
      }
    }
    if (params.limit) {
      const limit = Number.parseInt(params.limit as string)
      if (Number.isNaN(limit) == false) {
        query.limit = limit;
      }
    }

    return query;
  },

  /**
   * クエリをルーティングパラメータに変換する。
   * @param query クエリ。
   * @returns ルーティングパラメータ。
   */
  toRouteParams: (query: Query): Record<string, string | string[]> => {
    return {
      q: query.keyword,
      fq: query.organizations.map(v => `organization:${v}`)
        .concat(query.sites.map(v => `site:${v}`))
        .concat(query.tags.map(v => `tag:${v}`))
        .concat(query.formats.map(v => `format:${v}`)),
      sort: query.sortType,
      order: query.sortOrder,
      page: `${query.page}`,
      limit: `${query.limit}`,
    }
  },
}

function parseFQ(fq: string, cont: (k: FacetKey, v: string) => any) {
    let sep = fq.indexOf(":")

    if (sep > 0) {
        cont(fq.slice(0, sep) as FacetKey, fq.slice(sep+1))
    }
}

/**
 * あるデータセットを元に構成されるデータセット系列。
 */
interface DatasetSeries {
  // 元となるデータセットを先頭に持つ系列データセットリスト。
  readonly entries: Array<Dataset>

  /**
   * あるデータセットがこの系列に属するか判定し、属すれば系列に追加する。
   * @param another 新規データセット。
   * @returns 属する場合はtrue、そうでなければfalse。
   */
  accept(another: Dataset): boolean
}

/**
 * IDもしくは名前が一致するデータセットをまとめるデータセット系列。
 */
class SameSeries implements DatasetSeries {
  // ID。
  private id: string | null
  // 名前。
  private name: string | null
  readonly entries: Array<Dataset>

  constructor(
    private dataset: Dataset,
  ) {
    this.entries = [dataset]
    this.id = dataset["id"] || null
    this.name = dataset["name"] || null
  }

  accept(another: Dataset): boolean {
    const anotherId: string | null = another["id"] || null
    const anotherName: string | null = another["name"] || null

    const ok = (this.id != null && this.id == anotherId) && (this.name != null && this.name == anotherName)

    if (ok) {
      this.entries.push(another)
    }

    return ok
  }
}

/**
 * 類似判定によりデータセットをまとめるデータセット系列。
 */
class SimilarSeries implements DatasetSeries {
  // ホスト名。
  private host: string
  // 距離の閾値。
  private threshold: number
  // タイトルをパーズした距離計算用セグメントリスト。
  private segments: Array<Segment>
  readonly entries: Array<Dataset>

  constructor(
    private dataset: Dataset,
  ) {
    this.entries = [dataset]
    this.host = new URL(dataset.xckan_site_url).hostname
    this.threshold = 0

    this.segments = []
    parse(this.segments, dataset.xckan_title)
  }

  accept(another: Dataset): boolean {
    const anotherHost = new URL(another.xckan_site_url).hostname

    if (anotherHost != this.host) {
      return false
    }

    let anotherSegments: Array<Segment> = []
    parse(anotherSegments, another.xckan_title)

    const [ok, _] = calculate(this.segments, anotherSegments, this.threshold)

    if (ok) {
      this.entries.push(another)
    }

    return ok
  }
}

function toResult(res: SearchResponse, query: Query): SearchResult {
  let sameSeries: Array<DatasetSeries> = []
  let similarSeries: Array<DatasetSeries> = []

  res.result.results.forEach(r => {
    // 同一結果をまとめる。
    let isSame = false

    for (let s of sameSeries) {
      if (s.accept(r)) {
        isSame = true
        break
      }
    }

    if (!isSame) {
      sameSeries.push(new SameSeries(r))
    }

    // 類似結果をまとめる。
    let segments: Array<Segment> = []
    parse(segments, r.xckan_title)

    let isSimilar = false

    for (let s of similarSeries) {
      if (s.accept(r)) {
        isSimilar = true
        break
      }
    }

    if (!isSimilar) {
      similarSeries.push(new SimilarSeries(r))
    }
  })

  return {
    datasets: res.result.results,
    sameSeries: sameSeries.map(s => s.entries),
    similarSeries: similarSeries.map(s => s.entries),
    facets: res.result.facets.facet_fields ?? {
      organization: [],
      xckan_site_name: [],
      tags: [],
      res_format: [],
    },
    usedFacets: new Map<FacetKey, string[]>([
      ["organization", query.organizations ?? []],
      ["site", query.sites ?? []],
      ["tag", query.tags ?? []],
      ["format", query.formats ?? []],
    ]),
    total: res.result.count,
  }
}