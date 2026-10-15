/**
 * 과거 재현용 연도별 총수익률 (달러 기준, 배당 재투자, %).
 *
 * 지수 자체 대신 실제로 살 수 있는 대표 ETF의 수익률을 쓴다. 운용보수가 이미 빠져 있어 투자자가 실제로 얻은 수익에 더 가깝다.
 * - S&P 500: SPY / 나스닥 100: QQQ
 * - 출처: ETFReplay (etfreplay.com), ChartRow (chartrow.com) 두 곳의 값이 일치하는 것을 확인.
 *   QQQ는 Nasdaq 공식 지수 팩트시트(XNDX, 2017~2025)와 운용보수 정도(0.2%p 안팎)만 차이 나는 것도 확인했다.
 * 매년 초 지난해 수익률을 추가한다.
 */

export type MarketKey = 'sp500' | 'nasdaq100';

export interface MarketSeries {
	label: string;
	etf: string;
	/** 연도 → 연간 총수익률 (%) */
	returns: Record<number, number>;
}

export const MARKETS: Record<MarketKey, MarketSeries> = {
	sp500: {
		label: 'S&P 500',
		etf: 'SPY',
		returns: {
			2016: 12.0,
			2017: 21.7,
			2018: -4.56,
			2019: 31.22,
			2020: 18.37,
			2021: 28.75,
			2022: -18.17,
			2023: 26.19,
			2024: 24.89,
			2025: 17.72,
		},
	},
	nasdaq100: {
		label: '나스닥 100',
		etf: 'QQQ',
		returns: {
			2016: 7.1,
			2017: 32.66,
			2018: -0.13,
			2019: 38.96,
			2020: 48.62,
			2021: 27.42,
			2022: -32.58,
			2023: 54.85,
			2024: 25.58,
			2025: 20.77,
		},
	},
};

export const MARKET_DATA_CHECKED_AT = '2026-10-15';

/** 데이터가 있는 연도 (오름차순) */
export function marketYears(key: MarketKey): number[] {
	return Object.keys(MARKETS[key].returns)
		.map(Number)
		.sort((a, b) => a - b);
}
