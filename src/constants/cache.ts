export const ARTICLE_CACHE_KEYS = {
  BY_ID: (id: number) => `article_${id}`,
  ALL_PAGINATED: (page: number, limit: number) =>
    `articles_page_${page}_limit_${limit}`,
};
