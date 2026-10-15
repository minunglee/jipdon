import { describe, expect, it } from 'vitest';
import { MARKETS, marketYears } from '../data/market';
import { requiredMonthly, simulate } from './invest';

const fixed = (percent: number, years: number) => Array(years).fill(percent);

describe('거치식', () => {
	it('1,000만 원을 연 10%로 10년 → 1.1^10배 = 25,937,425원', () => {
		const r = simulate({ initial: 10_000_000, monthly: 0, yearlyReturns: fixed(10, 10) });
		expect(Math.round(r.value)).toBe(25_937_425);
		expect(r.contributed).toBe(10_000_000);
	});

	it('과거 재현은 연도별 수익률을 차례로 곱한 것과 같다', () => {
		const returns = marketYears('sp500').map((y) => MARKETS.sp500.returns[y]);
		const expected = returns.reduce((acc, r) => acc * (1 + r / 100), 10_000_000);
		const r = simulate({ initial: 10_000_000, monthly: 0, yearlyReturns: returns });
		expect(r.value).toBeCloseTo(expected, 2);
	});
});

describe('적립식', () => {
	it('수익률 0%면 평가액 = 넣은 원금', () => {
		const r = simulate({ initial: 0, monthly: 500_000, yearlyReturns: fixed(0, 3) });
		expect(r.value).toBeCloseTo(18_000_000, 6);
		expect(r.profit).toBeCloseTo(0, 6);
	});

	it('매달 초 적립 공식과 같다: C × ((1+m)^n − 1) / m × (1+m)', () => {
		const m = Math.pow(1.08, 1 / 12) - 1;
		const n = 120;
		const formula = (1_000_000 * (Math.pow(1 + m, n) - 1)) / m * (1 + m);
		const r = simulate({ initial: 0, monthly: 1_000_000, yearlyReturns: fixed(8, 10) });
		expect(r.value).toBeCloseTo(formula, 2);
	});

	it('1년 차 첫 달에 넣은 돈은 그해 말 정확히 연 수익률만큼 불어난다', () => {
		// 첫 달 100만 원만 넣고 나머지 0 → 거치식과 동일해야 함
		const r = simulate({ initial: 1_000_000, monthly: 0, yearlyReturns: [12] });
		expect(r.value).toBeCloseTo(1_120_000, 4);
	});
});

describe('최대 하락률·연평균', () => {
	it('+10% 뒤 −20%면 최대 하락률 −20%', () => {
		const r = simulate({ initial: 1_000_000, monthly: 0, yearlyReturns: [10, -20] });
		expect(r.maxDrawdownPercent).toBeCloseTo(-20, 6);
	});

	it('하락 뒤 회복 도중이면 고점 대비로 잰다 (−30% → +20% → 최대 하락 −30%)', () => {
		const r = simulate({ initial: 1_000_000, monthly: 0, yearlyReturns: [-30, 20] });
		expect(r.maxDrawdownPercent).toBeCloseTo(-30, 6);
	});

	it('연평균 수익률은 기하평균이다 (+50%, −50% → 연평균 약 −13.4%)', () => {
		const r = simulate({ initial: 1_000_000, monthly: 0, yearlyReturns: [50, -50] });
		expect(r.cagrPercent).toBeCloseTo((Math.sqrt(0.75) - 1) * 100, 6);
	});
});

describe('목표 역산', () => {
	it('구한 월 적립액으로 굴리면 목표 금액에 닿는다 (1원 단위 올림이라 약간 넘음)', () => {
		const monthly = requiredMonthly(100_000_000, 10_000_000, 7, 5);
		const r = simulate({ initial: 10_000_000, monthly, yearlyReturns: fixed(7, 5) });
		expect(r.value).toBeGreaterThanOrEqual(100_000_000);
		expect(r.value - 100_000_000).toBeLessThan(100);
	});

	it('수익률 0%면 (목표 − 처음 금액) ÷ 개월 수', () => {
		expect(requiredMonthly(12_000_000, 0, 0, 1)).toBe(1_000_000);
	});

	it('처음 금액만으로 목표를 넘으면 0', () => {
		expect(requiredMonthly(10_000_000, 10_000_000, 5, 3)).toBe(0);
	});
});

describe('입력 검증', () => {
	it('금액이 모두 0이면 거부한다', () => {
		expect(() => simulate({ initial: 0, monthly: 0, yearlyReturns: [5] })).toThrow();
	});
});
