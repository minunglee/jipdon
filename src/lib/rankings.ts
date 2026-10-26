/**
 * 빌드할 때 실거래가 서버에서 전세가율 순위를 받아 페이지에 넣는다.
 * 화면이 뜬 뒤 불러오면 검색엔진에는 빈 표로 보이므로, 순위 페이지는 HTML에 표를 미리 담는다.
 * 매일 다시 빌드해 데이터를 갱신한다. 서버에 닿지 않으면 빌드를 실패시켜 빈 페이지가 배포되지 않게 한다.
 */
export type Kind = 'APT' | 'RH' | 'OFFI';

/** 순위 페이지에 보여줄 주택 종류 (이 순서로 탭이 나온다) */
export const KINDS: { kind: Kind; label: string }[] = [
	{ kind: 'APT', label: '아파트' },
	{ kind: 'RH', label: '빌라' },
	{ kind: 'OFFI', label: '오피스텔' },
];

export interface RankingRow {
	rank: number;
	regionCode: string;
	regionName: string;
	umd: string;
	ratio: number;
	samples: number;
	warningShare: number;
}

export interface Ranking {
	kind: Kind;
	sido?: string;
	months: number;
	minSamples: number;
	computedAt?: string;
	since?: string;
	rows: RankingRow[];
}

/** 빌드할 때 순위를 받아올 서버 (기본은 운영 서버) */
const API_BASE: string = import.meta.env.JIPDON_API_BASE ?? 'https://jipdon.com';
/** Nginx가 /api/ 를 IP당 초당 5회로 제한하므로 빌드 중 요청 사이를 띄운다 */
const GAP_MS = 300;

/** 같은 지역·종류를 여러 페이지가 쓰면 한 번만 받는다 */
const cache = new Map<string, Promise<Ranking>>();
let queue: Promise<unknown> = Promise.resolve();

/** ms만큼 기다린다 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 순위 API 호출. 429(요청 많음)면 2초, 4초, 6초 기다렸다 최대 3번 더 시도, 그 밖의 실패는 빌드를 멈춘다 */
async function request(path: string): Promise<Ranking> {
	for (let attempt = 1; ; attempt++) {
		const res = await fetch(API_BASE + path, { headers: { Accept: 'application/json' } });
		if (res.ok) return (await res.json()) as Ranking;
		if (res.status === 429 && attempt < 4) {
			await sleep(2000 * attempt);
			continue;
		}
		throw new Error(`전세가율 순위를 받지 못했습니다 (${res.status} ${path})`);
	}
}

/** 같은 지역·종류는 한 번만 받고, 요청은 한 줄로 세워 간격을 둔다 */
export function fetchRanking(kind: Kind, sido: string): Promise<Ranking> {
	const params = new URLSearchParams({ kind });
	if (sido) params.set('sido', sido);
	const path = `/api/rankings?${params}`;
	let found = cache.get(path);
	if (!found) {
		found = queue.then(() => sleep(GAP_MS)).then(() => request(path));
		queue = found.catch(() => undefined);
		cache.set(path, found);
	}
	return found;
}

/** 표 위에 붙이는 요약 문장 (검색엔진과 사람이 함께 읽는 본문) */
export function summarize(label: string, kindLabel: string, ranking: Ranking, nationwide = false): string {
	const rows = ranking.rows;
	if (rows.length === 0) return `${label} ${kindLabel}은(는) 최근 ${ranking.months}개월 거래 표본이 충분한 동네가 없습니다.`;
	const warning = rows.filter((r) => r.ratio >= 80).length;
	const top = rows
		.slice(0, 3)
		// 시도 페이지에서는 "서울 영등포구"의 시도 이름을 빼고 읽기 쉽게
		.map((r) => `${nationwide ? r.regionName : r.regionName.replace(/^\S+\s/, '')} ${r.umd}(${r.ratio.toFixed(1)}%)`)
		.join(', ');
	return (
		`${label} ${kindLabel} 기준으로 순위에 오른 ${rows.length}개 동 가운데 전세가율 80% 이상인 곳은 ${warning}곳입니다. ` +
		`가장 높은 곳은 ${top}입니다.`
	);
}
