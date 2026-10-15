/**
 * 전월세 전환 계산.
 *
 * 월세 = 월세로 바꿀 보증금 × 전환율 ÷ 12
 * 보증금 = 보증금으로 바꿀 월세 × 12 ÷ 전환율
 *
 * 법정 상한 (주택임대차보호법 제7조의2, 시행령 제9조):
 * 계약 기간 중이나 갱신할 때 보증금의 전부 또는 일부를 월세로 바꾸면
 * 전환율은 "연 10%"와 "한국은행 기준금리 + 연 2%" 중 낮은 쪽을 넘을 수 없다.
 * 새로 계약할 때는 이 상한이 적용되지 않고 당사자끼리 정한다.
 */

/** 법정 상한 전환율 (연 %) */
export function legalCapRate(baseRatePercent: number): number {
	return Math.min(10, round2(baseRatePercent + 2));
}

/** 보증금 일부를 월세로 바꿀 때 늘어나는 월세 (원 단위 반올림) */
export function monthlyRentFor(depositAmount: number, ratePercent: number): number {
	return Math.round((depositAmount * ratePercent) / 100 / 12);
}

/** 월세 일부를 보증금으로 바꿀 때 늘어나는 보증금 (원 단위 반올림) */
export function depositFor(monthlyRent: number, ratePercent: number): number {
	return Math.round((monthlyRent * 12) / (ratePercent / 100));
}

/** 두 조건의 보증금·월세 차이에서 실제 적용된 전환율 (연 %) */
export function impliedRate(depositDiff: number, rentDiff: number): number {
	return round2(((rentDiff * 12) / depositDiff) * 100);
}

function round2(value: number): number {
	return Math.round(value * 100) / 100;
}
