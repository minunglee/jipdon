import { describe, expect, it } from 'vitest';
import { depositFor, impliedRate, legalCapRate, monthlyRentFor } from './conversion';

describe('전월세 전환', () => {
	it('법정 상한은 기준금리 + 2%, 단 10%를 넘지 않는다', () => {
		expect(legalCapRate(3)).toBe(5);
		expect(legalCapRate(2.75)).toBe(4.75);
		expect(legalCapRate(9)).toBe(10);
	});

	it('보증금 1억을 연 5%로 월세 전환 → 월 416,667원', () => {
		expect(monthlyRentFor(100_000_000, 5)).toBe(416_667);
	});

	it('월세 50만 원을 연 5%로 보증금 전환 → 1억 2천만 원', () => {
		expect(depositFor(500_000, 5)).toBe(120_000_000);
	});

	it('보증금 1억 차이에 월세 50만 원 차이면 전환율 6%', () => {
		expect(impliedRate(100_000_000, 500_000)).toBe(6);
	});
});
