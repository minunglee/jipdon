// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { isNoindexRankingUrl } from './src/data/sidos.ts';

// 모든 페이지를 빌드 때 HTML로 미리 만든다 (서버 없이 Nginx가 파일로 제공, 검색 노출에 유리)
export default defineConfig({
	site: 'https://jipdon.com',
	output: 'static',
	trailingSlash: 'always',
	build: { format: 'directory' },
	// lastmod: 빌드(배포) 시각을 넣어 검색엔진이 바뀐 페이지를 다시 읽게 한다
	// filter: noindex 처리한 시도별 순위 페이지는 사이트맵에서도 뺀다 (색인하지 말라면서 목록에 올리면 신호가 엇갈림)
	integrations: [sitemap({ lastmod: new Date(), filter: (page) => !isNoindexRankingUrl(page) })],
});
