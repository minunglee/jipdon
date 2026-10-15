import { describe, expect, it } from 'vitest';

import { calculate, equalPayment, validate, type LoanInput } from './loan';
import { formatKoreanUnit, formatWon } from './format';

const base: LoanInput = { principal: 100_000_000, annualRatePercent: 4.5, months: 360, method: 'equal-payment' };

describe('원리금균등', () => {
	it('1억, 연 4.5%, 30년의 월 상환액은 506,685원이다 (널리 쓰이는 기준값)', () => {
		const result = calculate(base);
		expect(result.firstPayment).toBe(506_685);
	});

	it('3억, 연 4%, 30년의 월 상환액은 1,432,246원이다', () => {
		expect(calculate({ ...base, principal: 300_000_000, annualRatePercent: 4 }).firstPayment).toBe(1_432_246);
	});

	it('마지막 달을 빼면 매달 상환액이 같고, 마지막 달에 대출금을 정확히 다 갚는다', () => {
		const { schedule } = calculate(base);
		const payments = new Set(schedule.slice(0, -1).map((row) => row.payment));
		expect(payments.size).toBe(1);
		expect(schedule.at(-1)!.balance).toBe(0);
		// 매달 상환액을 원 단위로 반올림한 차이(달마다 1원 미만)가 359개월 쌓여 마지막 달에서 정리된다
		expect(Math.abs(schedule.at(-1)!.payment - 506_685)).toBeLessThan(1_000);
	});
});

describe('원금균등', () => {
	it('매달 같은 원금을 갚고 이자는 점점 줄어든다', () => {
		const { schedule } = calculate({ ...base, method: 'equal-principal' });
		expect(schedule[0].principal).toBe(277_777);
		expect(schedule[0].interest).toBe(375_000);
		expect(schedule[1].interest).toBeLessThan(schedule[0].interest);
		expect(schedule.at(-1)!.balance).toBe(0);
	});

	it('같은 조건이면 원리금균등보다 총 이자가 적다', () => {
		const equalPaymentInterest = calculate(base).totalInterest;
		const equalPrincipalInterest = calculate({ ...base, method: 'equal-principal' }).totalInterest;
		expect(equalPrincipalInterest).toBeLessThan(equalPaymentInterest);
	});
});

describe('만기일시', () => {
	it('매달 이자만 내고 마지막 달에 원금 전액을 갚는다', () => {
		const result = calculate({ ...base, months: 24, method: 'bullet' });
		expect(result.firstPayment).toBe(375_000);
		expect(result.schedule.at(-2)!.balance).toBe(100_000_000);
		expect(result.lastPayment).toBe(100_375_000);
		expect(result.totalInterest).toBe(375_000 * 24);
	});
});

describe('공통', () => {
	it.each(['equal-payment', 'equal-principal', 'bullet'] as const)('%s: 갚은 원금 합계는 대출금과 같다', (method) => {
		const result = calculate({ ...base, method, principal: 123_456_789, annualRatePercent: 3.85, months: 97 });
		const repaid = result.schedule.reduce((acc, row) => acc + row.principal, 0);
		expect(repaid).toBe(123_456_789);
		expect(result.totalPayment).toBe(123_456_789 + result.totalInterest);
	});

	it('금리 0%면 이자가 없다', () => {
		const result = calculate({ ...base, annualRatePercent: 0, months: 12 });
		expect(result.totalInterest).toBe(0);
		expect(equalPayment(1_200_000, 0, 12)).toBe(100_000);
	});

	it('잘못된 입력은 이유와 함께 거부한다', () => {
		expect(validate({ ...base, principal: 0 })).toBe('대출금을 입력해주세요.');
		expect(validate({ ...base, months: 0 })).toBe('대출 기간을 1개월 이상으로 입력해주세요.');
		expect(validate({ ...base, annualRatePercent: 31 })).toBe('금리는 연 30% 이하로 입력해주세요.');
		expect(() => calculate({ ...base, principal: -1 })).toThrow('대출금을 입력해주세요.');
	});
});

describe('금액 표시', () => {
	it('원 단위에 쉼표를 넣는다', () => {
		expect(formatWon(1_234_567)).toBe('1,234,567원');
	});

	it('큰 금액은 억·만 단위로 읽기 쉽게 보여준다', () => {
		expect(formatKoreanUnit(150_000_000)).toBe('1억 5,000만 원');
		expect(formatKoreanUnit(3_500_000)).toBe('350만 원');
		expect(formatKoreanUnit(200_000_000)).toBe('2억 원');
		expect(formatKoreanUnit(9_000)).toBe('9,000원');
	});
});
