/** 자동차 할부: 차량 가격에서 선수금을 뺀 할부원금을 원리금균등으로 갚는다 */
import { calculate as calculateLoan, type LoanResult } from './loan';

export interface CarInput {
	price: number;
	downPayment: number;
	annualRatePercent: number;
	months: number;
}

export interface CarResult {
	financed: number;
	monthlyPayment: number;
	totalInterest: number;
	/** 선수금 + 할부 원리금 합계 = 실제로 내는 차값 */
	totalCost: number;
	loan: LoanResult;
}

/** 입력 검사 (선수금은 차량 가격보다 작아야, 금리 0~30%, 기간 1~120개월) */
export function validate(input: CarInput): string | null {
	if (!Number.isFinite(input.price) || input.price <= 0) return '차량 가격을 입력해주세요.';
	if (input.price > 10_000_000_000) return '차량 가격은 100억 원 이하로 입력해주세요.';
	if (!Number.isFinite(input.downPayment) || input.downPayment < 0) return '선수금을 0 이상으로 입력해주세요.';
	if (input.downPayment >= input.price) return '선수금이 차량 가격보다 작아야 할부할 금액이 생깁니다.';
	if (!(input.annualRatePercent >= 0 && input.annualRatePercent <= 30)) return '금리는 0~30% 사이로 입력해주세요.';
	if (!Number.isInteger(input.months) || input.months < 1 || input.months > 120) return '할부 기간을 1~120개월로 입력해주세요.';
	return null;
}

/** 자동차 할부: (차량 가격 − 선수금)을 원리금균등으로 갚는다고 보고 월 납입금·총 이자·총 비용(선수금 포함)을 계산 */
export function calculate(input: CarInput): CarResult {
	const error = validate(input);
	if (error) throw new Error(error);
	const financed = Math.round(input.price - input.downPayment);
	const loan = calculateLoan({
		principal: financed,
		annualRatePercent: input.annualRatePercent,
		months: input.months,
		method: 'equal-payment',
	});
	return {
		financed,
		monthlyPayment: loan.firstPayment,
		totalInterest: loan.totalInterest,
		totalCost: Math.round(input.downPayment) + loan.totalPayment,
		loan,
	};
}
