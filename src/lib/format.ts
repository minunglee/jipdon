/** 화면 표시용 금액 형식 */

const won = new Intl.NumberFormat('ko-KR');

/** 1234567 → "1,234,567원" */
export function formatWon(value: number): string {
	return `${won.format(Math.round(value))}원`;
}

/**
 * 큰 금액을 한글 단위로 읽기 쉽게: 150000000 → "1억 5,000만 원", 3500000 → "350만 원".
 * 만 원 미만은 생략하고, 만 원 미만 금액만 있으면 원 단위로 표시한다.
 */
export function formatKoreanUnit(value: number): string {
	const amount = Math.round(value);
	if (amount < 10_000) return formatWon(amount);
	const eok = Math.floor(amount / 100_000_000);
	const man = Math.floor((amount % 100_000_000) / 10_000);
	const parts: string[] = [];
	if (eok > 0) parts.push(`${won.format(eok)}억`);
	if (man > 0) parts.push(`${won.format(man)}만`);
	return `${parts.join(' ')} 원`;
}
