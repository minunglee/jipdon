import { describe, expect, it } from 'vitest';
import { equalPayment } from './loan';
import { calculate } from './car';

describe('자동차 할부', () => {
	const base = { price: 30_000_000, downPayment: 6_000_000, annualRatePercent: 5.5, months: 36 };

	it('할부원금 = 차량 가격 − 선수금, 월 납입금은 원리금균등 공식과 같다', () => {
		const r = calculate(base);
		expect(r.financed).toBe(24_000_000);
		expect(r.monthlyPayment).toBe(equalPayment(24_000_000, 0.055 / 12, 36));
		expect(r.monthlyPayment).toBe(724_702); // 고정밀 계산 724,701.64원 → 반올림
	});

	it('총 비용 = 선수금 + 할부 원리금 = 차량 가격 + 총 이자', () => {
		const r = calculate(base);
		expect(r.totalCost).toBe(30_000_000 + r.totalInterest);
	});

	it('무이자 할부는 이자가 0원', () => {
		expect(calculate({ ...base, annualRatePercent: 0 }).totalInterest).toBe(0);
	});

	it('선수금이 차량 가격 이상이면 거부한다', () => {
		expect(() => calculate({ ...base, downPayment: 30_000_000 })).toThrow();
	});
});
