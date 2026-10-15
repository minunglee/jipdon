import { describe, expect, it } from 'vitest';
import { annualRepayment, calculate, type DsrInput } from './dsr';

const base: DsrInput = {
	annualIncome: 60_000_000,
	newLoan: 300_000_000,
	annualRatePercent: 4,
	months: 360,
	method: 'equal-payment',
	stressRatePercent: 0,
	otherAnnualRepayment: 0,
	jeonseLoanBalance: 0,
	jeonseRatePercent: 0,
	limitPercent: 40,
};

describe('DSR', () => {
	it('연 소득 6천만, 3억 · 4% · 30년 원리금균등 → DSR 약 28.6%', () => {
		const r = calculate(base);
		// 월 1,432,246원 × 12 = 17,186,952원 (마지막 달 자투리 때문에 연평균은 몇 원 다를 수 있음)
		expect(Math.abs(r.newLoanAnnual - 17_186_952)).toBeLessThan(100);
		expect(r.dsrPercent).toBeCloseTo(28.64, 1);
		expect(r.withinLimit).toBe(true);
	});

	it('전세대출은 이자만 반영한다 (잔액 2억 × 4% = 연 800만)', () => {
		const r = calculate({ ...base, jeonseLoanBalance: 200_000_000, jeonseRatePercent: 4 });
		expect(r.jeonseAnnualInterest).toBe(8_000_000);
	});

	it('최대 대출액은 한도에 딱 맞는 금액이다', () => {
		const r = calculate({ ...base, otherAnnualRepayment: 3_000_000 });
		const budget = 60_000_000 * 0.4 - 3_000_000;
		expect(annualRepayment(r.maxNewLoan, 4, 360, 'equal-payment')).toBeLessThanOrEqual(budget);
		expect(annualRepayment(r.maxNewLoan + 20_000, 4, 360, 'equal-payment')).toBeGreaterThan(budget);
	});

	it('스트레스 가산금리를 더하면 최대 대출액이 줄어든다', () => {
		const plain = calculate(base).maxNewLoan;
		const stressed = calculate({ ...base, stressRatePercent: 1.5 }).maxNewLoan;
		expect(stressed).toBeLessThan(plain);
	});

	it('기존 대출만으로 한도를 넘으면 최대 대출액은 0', () => {
		expect(calculate({ ...base, otherAnnualRepayment: 30_000_000 }).maxNewLoan).toBe(0);
	});
});
