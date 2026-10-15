// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 모든 페이지를 빌드 때 HTML로 미리 만든다 (서버 없이 Nginx가 파일로 제공, 검색 노출에 유리)
export default defineConfig({
	site: 'https://jipdon.com',
	output: 'static',
	trailingSlash: 'always',
	build: { format: 'directory' },
	integrations: [sitemap()],
});
