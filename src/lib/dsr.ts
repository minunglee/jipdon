/**
 * DSR(총부채원리금상환비율) = 모든 가계대출의 연간 원리금 상환액 ÷ 연 소득 × 100
 *
 * 단순화한 점 (실제 은행 심사와 다를 수 있음):
 * - 새 주택담보대출의 연간 원리금은 "총 원리금 ÷ 대출 연수" (연평균)로 잡는다.
 * - 기존 대출은 사용자가 연간 원리금을 직접 넣는다. 전세대출만 이자만 반영하는 규칙을 따로 계산한다.
 * - 스트레스 DSR은 금리에 가산금리를 더하는 방식으로 반영한다(값은 사용자가 입력).
 */
import { calculate as calculateLoan, type RepaymentMethod } from './loan';

export interface DsrInput {
	/** 연 소득 (세전) */
	annualIncome: number;
	/** 새로 받을 주택담보대출 */
	newLoan: number;
	annualRatePercent: number;
	months: number;
	method: Extract<RepaymentMethod, 'equal-payment' | 'equal-principal'>;
	/** 스트레스 가산금리 (%p) */
	stressRatePercent: number;
	/** 기존 대출의 연간 원리금 상환액 합계 (전세대출 제외) */
	otherAnnualRepayment: number;
	/** 전세대출 잔액 (이자만 반영) */
	jeonseLoanBalance: number;
	jeonseRatePercent: number;
	/** 규제 한도 (%) — 은행권 40, 2금융권 50 */
	limitPercent: number;
}

export interface DsrResult {
	newLoanAnnual: number;
	jeonseAnnualInterest: number;
	totalAnnual: number;
	dsrPercent: number;
	withinLimit: boolean;
	/** 다른 대출을 그대로 두고 한도 안에서 받을 수 있는 새 주담대 최대액 (만 원 단위 내림) */
	maxNewLoan: number;
}

export function validate(input: DsrInput): string | null {
	const money = (v: number) => Number.isFinite(v) && v >= 0 && v <= 100_000_000_000;
	if (!money(input.annualIncome) || input.annualIncome <= 0) return '연 소득을 입력해주세요.';
	if (!money(input.newLoan)) return '새 대출 금액을 올바르게 입력해주세요.';
	if (!(input.annualRatePercent >= 0 && input.annualRatePercent <= 30)) return '금리는 0~30% 사이로 입력해주세요.';
	if (!(input.stressRatePercent >= 0 && input.stressRatePercent <= 10)) return '가산금리는 0~10%p 사이로 입력해주세요.';
	if (!Number.isInteger(input.months) || input.months < 12 || input.months > 600) return '대출 기간을 1~50년으로 입력해주세요.';
	if (!money(input.otherAnnualRepayment) || !money(input.jeonseLoanBalance)) return '기존 대출 금액을 올바르게 입력해주세요.';
	if (!(input.jeonseRatePercent >= 0 && input.jeonseRatePercent <= 30)) return '전세대출 금리는 0~30% 사이로 입력해주세요.';
	if (!(input.limitPercent > 0 && input.limitPercent <= 100)) return 'DSR 한도를 올바르게 입력해주세요.';
	return null;
}

/** 새 주담대의 연평균 원리금 */
export function annualRepayment(principal: number, ratePercent: number, months: number, method: DsrInput['method']): number {
	if (principal <= 0) return 0;
	const loan = calculateLoan({ principal, annualRatePercent: ratePercent, months, method });
	return Math.round((loan.totalPayment * 12) / months);
}

export function calculate(input: DsrInput): DsrResult {
	const error = validate(input);
	if (error) throw new Error(error);

	const rate = input.annualRatePercent + input.stressRatePercent;
	const newLoanAnnual = annualRepayment(input.newLoan, rate, input.months, input.method);
	const jeonseAnnualInterest = Math.round((input.jeonseLoanBalance * input.jeonseRatePercent) / 100);
	const others = Math.round(input.otherAnnualRepayment) + jeonseAnnualInterest;
	const totalAnnual = newLoanAnnual + others;
	const dsrPercent = Math.round((totalAnnual / input.annualIncome) * 10_000) / 100;

	// 한도 안에서 쓸 수 있는 연 원리금 예산으로 새 대출 최대액을 찾는다 (상환액은 원금에 따라 늘어나므로 이분 탐색)
	const budget = (input.annualIncome * input.limitPercent) / 100 - others;
	let maxNewLoan = 0;
	if (budget > 0) {
		let lo = 0;
		let hi = 100_000_000_000;
		while (hi - lo > 10_000) {
			const mid = Math.floor((lo + hi) / 2);
			if (annualRepayment(mid, rate, input.months, input.method) <= budget) lo = mid;
			else hi = mid;
		}
		maxNewLoan = Math.floor(lo / 10_000) * 10_000;
	}

	return {
		newLoanAnnual,
		jeonseAnnualInterest,
		totalAnnual,
		dsrPercent,
		withinLimit: dsrPercent <= input.limitPercent,
		maxNewLoan,
	};
}
