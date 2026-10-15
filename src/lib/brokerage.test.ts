import { describe, expect, it } from 'vitest';
import { calculate, leaseAmount, type BrokerageInput } from './brokerage';

const sale = (price: number): BrokerageInput => ({ deal: 'sale', property: 'house', price, deposit: 0, monthlyRent: 0, includeVat: false });
const lease = (deposit: number, monthlyRent = 0): BrokerageInput => ({ deal: 'lease', property: 'house', price: 0, deposit, monthlyRent, includeVat: false });

describe('주택 매매', () => {
	it.each([
		[30_000_000, 180_000], // 0.6% = 18만 (한도 25만 안)
		[49_000_000, 250_000], // 0.6% = 29.4만 → 한도 25만
		[100_000_000, 500_000], // 0.5% = 50만
		[190_000_000, 800_000], // 0.5% = 95만 → 한도 80만
		[500_000_000, 2_000_000], // 0.4%
		[1_000_000_000, 5_000_000], // 0.5%
		[1_300_000_000, 7_800_000], // 0.6%
		[1_500_000_000, 10_500_000], // 15억 이상 0.7%
	])('%d원 → %d원', (price, fee) => {
		expect(calculate(sale(price)).fee).toBe(fee);
	});

	it('구간 경계 금액은 위 구간을 적용한다 (2억은 "2억 이상" 0.4%)', () => {
		expect(calculate(sale(200_000_000)).rate).toBe(0.004);
	});
});

describe('주택 임대차', () => {
	it('전세 3억 → 0.3% = 90만 원', () => {
		expect(calculate(lease(300_000_000)).fee).toBe(900_000);
	});

	it('전세 8천만 → 0.4% = 32만이지만 한도 30만 원', () => {
		const r = calculate(lease(80_000_000));
		expect(r.fee).toBe(300_000);
		expect(r.capped).toBe(true);
	});

	it('월세는 보증금 + 월세 × 100으로 거래금액을 센다', () => {
		// 1,000만 + 50만×100 = 6,000만 → 0.4% = 24만
		const r = calculate(lease(10_000_000, 500_000));
		expect(r.amount).toBe(60_000_000);
		expect(r.fee).toBe(240_000);
	});

	it('보증금 + 월세 × 100이 5천만 원 미만이면 × 70으로 다시 센다', () => {
		// 500만 + 30만×100 = 3,500만 < 5천만 → 500만 + 30만×70 = 2,600만 → 0.5% = 13만
		expect(leaseAmount(5_000_000, 300_000).amount).toBe(26_000_000);
		expect(calculate(lease(5_000_000, 300_000)).fee).toBe(130_000);
	});
});

describe('기타', () => {
	it('부가세 10%를 더한다', () => {
		const r = calculate({ ...sale(500_000_000), includeVat: true });
		expect(r.vat).toBe(200_000);
		expect(r.total).toBe(2_200_000);
	});

	it('주거용 오피스텔 매매 0.5%, 임대 0.4%', () => {
		expect(calculate({ ...sale(300_000_000), property: 'officetel' }).fee).toBe(1_500_000);
		expect(calculate({ ...lease(200_000_000), property: 'officetel' }).fee).toBe(800_000);
	});

	it('주택 외는 0.9%', () => {
		expect(calculate({ ...sale(1_000_000_000), property: 'other' }).fee).toBe(9_000_000);
	});
});
