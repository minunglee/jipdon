/**
 * 전세자금대출 이자 계산. 전세대출은 대부분 기간 중 이자만 내고 만기에 원금을 갚는다(만기일시).
 * 보증료는 보증기관(HUG·HF·SGI)과 소득·보증금에 따라 다르므로 사용자가 입력한 연 보증료율로 계산한다.
 */
import { calculate as calculateLoan } from './loan';

export interface JeonseInput {
	/** 전세 보증금 */
	deposit: number;
	/** 대출 비율 (보증금의 %) */
	loanRatioPercent: number;
	/** 연 금리 (%) */
	annualRatePercent: number;
	/** 대출 기간 (개월) */
	months: number;
	/** 연 보증료율 (%) */
	guaranteeRatePercent: number;
}

export interface JeonseResult {
	loanAmount: number;
	/** 내 돈으로 준비할 보증금 */
	ownFunds: number;
	monthlyInterest: number;
	totalInterest: number;
	/** 연 보증료 */
	annualGuarantee: number;
	totalGuarantee: number;
	/** 이자 + 보증료를 월로 환산 */
	monthlyCost: number;
	totalCost: number;
}

/** 입력 검사 (대출 비율 0 초과 100% 이하, 금리 0~30%, 보증료율 0~5%) */
export function validate(input: JeonseInput): string | null {
	if (!Number.isFinite(input.deposit) || input.deposit <= 0) return '전세 보증금을 입력해주세요.';
	if (input.deposit > 100_000_000_000) return '보증금은 1,000억 원 이하로 입력해주세요.';
	if (!(input.loanRatioPercent > 0 && input.loanRatioPercent <= 100)) return '대출 비율은 0보다 크고 100% 이하로 입력해주세요.';
	if (!(input.annualRatePercent >= 0 && input.annualRatePercent <= 30)) return '금리는 0~30% 사이로 입력해주세요.';
	if (!Number.isInteger(input.months) || input.months < 1 || input.months > 600) return '대출 기간을 1~600개월로 입력해주세요.';
	if (!(input.guaranteeRatePercent >= 0 && input.guaranteeRatePercent <= 5)) return '보증료율은 0~5% 사이로 입력해주세요.';
	return null;
}

/** 전세대출: 보증금 × 대출 비율을 만기일시상환(매달 이자만)으로 보고 월 이자, 보증료, 기간 총비용, 내 돈을 계산 */
export function calculate(input: JeonseInput): JeonseResult {
	const error = validate(input);
	if (error) throw new Error(error);

	const loanAmount = Math.round((input.deposit * input.loanRatioPercent) / 100);
	const loan = calculateLoan({
		principal: loanAmount,
		annualRatePercent: input.annualRatePercent,
		months: input.months,
		method: 'bullet',
	});
	const annualGuarantee = Math.round((loanAmount * input.guaranteeRatePercent) / 100);
	const totalGuarantee = Math.round((annualGuarantee * input.months) / 12);
	const totalCost = loan.totalInterest + totalGuarantee;
	return {
		loanAmount,
		ownFunds: Math.round(input.deposit) - loanAmount,
		monthlyInterest: loan.firstPayment,
		totalInterest: loan.totalInterest,
		annualGuarantee,
		totalGuarantee,
		monthlyCost: Math.round(totalCost / input.months),
		totalCost,
	};
}
