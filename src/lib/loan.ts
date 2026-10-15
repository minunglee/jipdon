/**
 * 대출 상환 계산 (모든 대출 계산기가 함께 쓰는 엔진).
 *
 * 금액은 원 단위 정수로 다룬다. 매월 이자는 원 단위로 반올림하고,
 * 반올림으로 생긴 자투리는 마지막 달에 모아 대출금을 정확히 갚도록 맞춘다.
 * 실제 은행은 이자 계산 방식(일할 계산, 절사 등)이 조금씩 달라 몇 원~몇십 원 차이가 날 수 있다.
 */

export type RepaymentMethod = 'equal-payment' | 'equal-principal' | 'bullet';

export const METHOD_LABELS: Record<RepaymentMethod, string> = {
	'equal-payment': '원리금균등',
	'equal-principal': '원금균등',
	bullet: '만기일시',
};

export interface LoanInput {
	/** 대출금 (원) */
	principal: number;
	/** 연 이자율 (%) */
	annualRatePercent: number;
	/** 대출 기간 (개월) */
	months: number;
	method: RepaymentMethod;
}

export interface ScheduleRow {
	month: number;
	payment: number;
	principal: number;
	interest: number;
	/** 이번 달 상환 후 남은 대출금 */
	balance: number;
}

export interface LoanResult {
	schedule: ScheduleRow[];
	totalPayment: number;
	totalInterest: number;
	/** 첫 달 상환액 */
	firstPayment: number;
	/** 마지막 달 상환액 */
	lastPayment: number;
}

export function validate(input: LoanInput): string | null {
	if (!Number.isFinite(input.principal) || input.principal <= 0) return '대출금을 입력해주세요.';
	if (input.principal > 100_000_000_000) return '대출금은 1,000억 원 이하로 입력해주세요.';
	if (!Number.isFinite(input.annualRatePercent) || input.annualRatePercent < 0) return '금리를 0 이상으로 입력해주세요.';
	if (input.annualRatePercent > 30) return '금리는 연 30% 이하로 입력해주세요.';
	if (!Number.isInteger(input.months) || input.months < 1) return '대출 기간을 1개월 이상으로 입력해주세요.';
	if (input.months > 600) return '대출 기간은 50년(600개월) 이하로 입력해주세요.';
	return null;
}

export function calculate(input: LoanInput): LoanResult {
	const error = validate(input);
	if (error) throw new Error(error);

	const principal = Math.round(input.principal);
	const rate = input.annualRatePercent / 100 / 12;
	const n = input.months;
	const schedule: ScheduleRow[] = [];
	let balance = principal;

	for (let month = 1; month <= n; month++) {
		const interest = Math.round(balance * rate);
		const last = month === n;
		let principalPart: number;
		switch (input.method) {
			case 'equal-payment':
				principalPart = last ? balance : equalPayment(principal, rate, n) - interest;
				break;
			case 'equal-principal':
				principalPart = last ? balance : Math.floor(principal / n);
				break;
			case 'bullet':
				principalPart = last ? balance : 0;
				break;
		}
		// 금리가 매우 높아 고정 상환액이 이자보다 작아지는 경우에도 원금이 늘지 않게 한다
		principalPart = Math.max(0, Math.min(principalPart, balance));
		balance -= principalPart;
		schedule.push({ month, payment: principalPart + interest, principal: principalPart, interest, balance });
	}

	const totalPayment = sum(schedule.map((row) => row.payment));
	const totalInterest = sum(schedule.map((row) => row.interest));
	return {
		schedule,
		totalPayment,
		totalInterest,
		firstPayment: schedule[0].payment,
		lastPayment: schedule[schedule.length - 1].payment,
	};
}

/** 원리금균등 월 상환액 (원 단위 반올림). 금리 0%면 원금을 기간으로 나눈다 */
export function equalPayment(principal: number, monthlyRate: number, months: number): number {
	if (monthlyRate === 0) return Math.round(principal / months);
	const growth = Math.pow(1 + monthlyRate, months);
	return Math.round((principal * monthlyRate * growth) / (growth - 1));
}

function sum(values: number[]): number {
	return values.reduce((acc, value) => acc + value, 0);
}
