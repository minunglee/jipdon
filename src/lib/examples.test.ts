/**
 * 계산기 페이지 "계산 예시"에 적은 숫자가 실제 계산 결과와 같은지 확인한다.
 * 계산 로직을 고쳐 숫자가 바뀌면 이 테스트가 깨지므로, 페이지 본문도 같이 고쳐야 한다.
 */
import { describe, expect, it } from 'vitest';
import { calculate as loan } from './loan';
import { calculate as jeonse } from './jeonse';
import { calculate as dsr, type DsrInput } from './dsr';
import { calculate as brokerage, type BrokerageInput } from './brokerage';
import { depositFor, impliedRate, legalCapRate, monthlyRentFor } from './conversion';
import { calculate as car } from './car';
import { requiredMonthly, simulate } from './invest';

describe('대출 상환 계산기 예시 (3억, 연 4%)', () => {
	it('30년 상환 방식별', () => {
		const ep = loan({ principal: 300_000_000, annualRatePercent: 4, months: 360, method: 'equal-payment' });
		expect([ep.firstPayment, ep.lastPayment, ep.totalInterest]).toEqual([1_432_246, 1_432_169, 215_608_483]);
		expect(ep.schedule[0]).toMatchObject({ principal: 432_246, interest: 1_000_000 });
		expect(ep.schedule[119].interest).toBe(789_980);
		const epr = loan({ principal: 300_000_000, annualRatePercent: 4, months: 360, method: 'equal-principal' });
		expect([epr.firstPayment, epr.lastPayment, epr.totalInterest]).toEqual([1_833_333, 836_231, 180_500_071]);
		const b = loan({ principal: 300_000_000, annualRatePercent: 4, months: 360, method: 'bullet' });
		expect([b.firstPayment, b.lastPayment, b.totalInterest]).toEqual([1_000_000, 301_000_000, 360_000_000]);
	});
	it('20년 원리금균등', () => {
		const r = loan({ principal: 300_000_000, annualRatePercent: 4, months: 240, method: 'equal-payment' });
		expect([r.firstPayment, r.totalInterest]).toEqual([1_817_941, 136_305_832]);
	});
});

describe('전세대출 계산기 예시 (보증금 3억, 80%, 2년)', () => {
	const base = { deposit: 300_000_000, loanRatioPercent: 80, months: 24 };
	it('연 4%, 보증료 0.15%', () => {
		expect(jeonse({ ...base, annualRatePercent: 4, guaranteeRatePercent: 0 })).toMatchObject({
			loanAmount: 240_000_000, ownFunds: 60_000_000, monthlyInterest: 800_000, totalInterest: 19_200_000,
		});
		expect(jeonse({ ...base, annualRatePercent: 4, guaranteeRatePercent: 0.15 })).toMatchObject({
			annualGuarantee: 360_000, monthlyCost: 830_000, totalCost: 19_920_000,
		});
	});
	it('연 3.5%', () => {
		expect(jeonse({ ...base, annualRatePercent: 3.5, guaranteeRatePercent: 0 })).toMatchObject({
			monthlyInterest: 700_000, totalInterest: 16_800_000,
		});
	});
});

describe('DSR 계산기 예시 (연 소득 6천만, 3억 30년 4%)', () => {
	const base: DsrInput = {
		annualIncome: 60_000_000, newLoan: 300_000_000, annualRatePercent: 4, months: 360, method: 'equal-payment',
		stressRatePercent: 0, otherAnnualRepayment: 0, jeonseLoanBalance: 0, jeonseRatePercent: 0, limitPercent: 40,
	};
	it('세 가지 조건', () => {
		expect(dsr(base)).toMatchObject({ totalAnnual: 17_186_949, dsrPercent: 28.64, maxNewLoan: 418_910_000 });
		expect(dsr({ ...base, stressRatePercent: 1.5 })).toMatchObject({
			totalAnnual: 20_440_404, dsrPercent: 34.07, maxNewLoan: 352_230_000,
		});
		expect(dsr({ ...base, otherAnnualRepayment: 6_000_000 })).toMatchObject({
			totalAnnual: 23_186_949, dsrPercent: 38.64, maxNewLoan: 314_180_000,
		});
	});
});

describe('중개보수 계산기 예시', () => {
	const house = (input: Partial<BrokerageInput>) =>
		brokerage({ deal: 'sale', property: 'house', price: 0, deposit: 0, monthlyRent: 0, includeVat: false, ...input });
	it('매매·전세·월세', () => {
		expect(house({ price: 900_000_000 }).fee).toBe(4_500_000);
		expect(house({ price: 500_000_000, includeVat: true })).toMatchObject({ fee: 2_000_000, total: 2_200_000 });
		expect(house({ deal: 'lease', deposit: 300_000_000 }).fee).toBe(900_000);
		expect(house({ deal: 'lease', deposit: 10_000_000, monthlyRent: 600_000 })).toMatchObject({
			amount: 70_000_000, fee: 280_000, cap: 300_000,
		});
		expect(house({ deal: 'lease', deposit: 5_000_000, monthlyRent: 400_000 })).toMatchObject({
			amount: 33_000_000, fee: 165_000, cap: 200_000,
		});
	});
});

describe('전월세 전환 계산기 예시 (전환율 5%)', () => {
	it('전환 금액과 실제 전환율', () => {
		expect(legalCapRate(3)).toBe(5);
		expect(monthlyRentFor(100_000_000, 5)).toBe(416_667);
		expect(monthlyRentFor(50_000_000, 5)).toBe(208_333);
		expect(depositFor(200_000, 5)).toBe(48_000_000);
		expect(impliedRate(100_000_000, 500_000)).toBe(6);
	});
});

describe('자동차 할부 계산기 예시 (4천만, 선수금 1천만, 5.5%)', () => {
	it('36개월과 60개월', () => {
		expect(car({ price: 40_000_000, downPayment: 10_000_000, annualRatePercent: 5.5, months: 36 })).toMatchObject({
			financed: 30_000_000, monthlyPayment: 905_877, totalInterest: 2_611_571, totalCost: 42_611_571,
		});
		expect(car({ price: 40_000_000, downPayment: 10_000_000, annualRatePercent: 5.5, months: 60 })).toMatchObject({
			monthlyPayment: 573_035, totalInterest: 4_382_089, totalCost: 44_382_089,
		});
	});
});

describe('투자 계산기 예시', () => {
	it('10년 1억 목표 월 적립액', () => {
		expect(requiredMonthly(100_000_000, 0, 5, 10)).toBe(645_195);
		expect(requiredMonthly(100_000_000, 0, 7, 10)).toBe(581_332);
	});
	it('월 50만 원 10년 연 5%', () => {
		const r = simulate({ initial: 0, monthly: 500_000, yearlyReturns: Array(10).fill(5) });
		expect(r.contributed).toBe(60_000_000);
		expect(Math.round(r.value / 100_000)).toBe(775); // 약 7,750만 원
	});
	it('평균 4%여도 복리 연평균은 약 3.2%', () => {
		const r = simulate({ initial: 10_000_000, monthly: 0, yearlyReturns: [10, -20, 10, 10, 10] });
		expect(Math.round(r.value / 10_000)).toBe(1_171); // 약 1,171만 원
		expect(r.cagrPercent).toBeCloseTo(3.2, 1);
		expect(r.maxDrawdownPercent).toBeCloseTo(-20, 5);
	});
});
