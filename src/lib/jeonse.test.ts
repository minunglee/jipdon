import { describe, expect, it } from 'vitest';
import { calculate } from './jeonse';

describe('전세대출 이자', () => {
	const base = { deposit: 300_000_000, loanRatioPercent: 80, annualRatePercent: 4, months: 24, guaranteeRatePercent: 0 };

	it('보증금 3억의 80% = 2억 4천만, 연 4% → 월 이자 80만 원', () => {
		const r = calculate(base);
		expect(r.loanAmount).toBe(240_000_000);
		expect(r.ownFunds).toBe(60_000_000);
		expect(r.monthlyInterest).toBe(800_000);
		expect(r.totalInterest).toBe(19_200_000);
	});

	it('연 보증료율 0.1% → 연 24만 원, 2년 48만 원을 비용에 더한다', () => {
		const r = calculate({ ...base, guaranteeRatePercent: 0.1 });
		expect(r.annualGuarantee).toBe(240_000);
		expect(r.totalGuarantee).toBe(480_000);
		expect(r.totalCost).toBe(19_680_000);
		expect(r.monthlyCost).toBe(820_000);
	});

	it('대출 비율이 100%를 넘으면 거부한다', () => {
		expect(() => calculate({ ...base, loanRatioPercent: 120 })).toThrow();
	});
});
