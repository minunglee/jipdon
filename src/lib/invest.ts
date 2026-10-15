/**
 * 거치식·적립식 투자 계산.
 *
 * - 매달 초에 적립금을 넣고, 그달 수익률을 적용한다. 거치금(처음 목돈)은 첫 달 초에 넣는다.
 * - 연 수익률 r은 월 수익률 (1 + r)^(1/12) − 1 로 바꿔 매달 복리로 굴린다.
 *   그래서 1년 동안 돈을 그대로 두면 정확히 연 r만큼 불어난다.
 * - 과거 재현은 연도마다 그해 실제 수익률을 같은 방식으로 적용한다(한 해 안의 등락은 고르게 퍼졌다고 가정).
 * - 내부는 실수로 계산하고 화면에 보여줄 때 원 단위로 반올림한다. 세금·수수료·환율은 반영하지 않는다.
 */

export interface InvestInput {
	/** 처음에 한 번 넣는 금액 (거치식) */
	initial: number;
	/** 매달 넣는 금액 (적립식) */
	monthly: number;
	/** 연도별 수익률 (%) — 고정 수익률이면 같은 값을 기간만큼 반복 */
	yearlyReturns: number[];
}

export interface YearRow {
	/** 1부터 시작하는 투자 연차 */
	index: number;
	returnPercent: number;
	/** 그해 말까지 넣은 원금 누계 */
	contributed: number;
	/** 그해 말 평가액 */
	value: number;
}

export interface InvestResult {
	rows: YearRow[];
	contributed: number;
	value: number;
	profit: number;
	/** 넣은 원금 대비 수익률 (%) */
	profitPercent: number;
	/** 연말 평가액 기준 최대 하락률 (%, 0 이하) */
	maxDrawdownPercent: number;
	/** 수익률 자체의 연평균 (기하평균, %) */
	cagrPercent: number;
}

export function validate(input: InvestInput): string | null {
	const money = (v: number) => Number.isFinite(v) && v >= 0 && v <= 100_000_000_000;
	if (!money(input.initial) || !money(input.monthly)) return '금액을 올바르게 입력해주세요.';
	if (input.initial + input.monthly <= 0) return '처음 넣을 금액이나 매달 넣을 금액을 입력해주세요.';
	if (input.yearlyReturns.length < 1 || input.yearlyReturns.length > 50) return '투자 기간을 1~50년으로 입력해주세요.';
	if (input.yearlyReturns.some((r) => !Number.isFinite(r) || r <= -100 || r > 100)) return '수익률은 -100% 초과, 100% 이하로 입력해주세요.';
	return null;
}

export function monthlyRate(annualPercent: number): number {
	return Math.pow(1 + annualPercent / 100, 1 / 12) - 1;
}

export function simulate(input: InvestInput): InvestResult {
	const error = validate(input);
	if (error) throw new Error(error);

	let value = 0;
	let contributed = 0;
	const rows: YearRow[] = [];

	input.yearlyReturns.forEach((annual, i) => {
		const m = monthlyRate(annual);
		for (let month = 0; month < 12; month++) {
			const deposit = (i === 0 && month === 0 ? input.initial : 0) + input.monthly;
			value = (value + deposit) * (1 + m);
			contributed += deposit;
		}
		rows.push({ index: i + 1, returnPercent: annual, contributed, value });
	});

	// 최대 하락률: 적립식은 넣는 돈이 계속 늘어 평가액만으로는 하락을 잴 수 없으므로,
	// 1원을 처음부터 넣어 뒀을 때의 연말 값(수익률 지수)으로 잰다
	let index = 1;
	let peak = 1;
	let maxDrawdown = 0;
	for (const annual of input.yearlyReturns) {
		index *= 1 + annual / 100;
		peak = Math.max(peak, index);
		maxDrawdown = Math.min(maxDrawdown, index / peak - 1);
	}

	const profit = value - contributed;
	return {
		rows,
		contributed,
		value,
		profit,
		profitPercent: (profit / contributed) * 100,
		maxDrawdownPercent: maxDrawdown * 100,
		cagrPercent: (Math.pow(index, 1 / input.yearlyReturns.length) - 1) * 100,
	};
}

/**
 * 목표 금액을 만들려면 매달 얼마를 넣어야 하는지 (고정 수익률).
 * FV = 처음 금액 × (1+m)^n + 월 적립액 × ((1+m)^n − 1) / m × (1+m)  (매달 초 적립)
 * 처음 금액만으로 목표를 넘으면 0.
 */
export function requiredMonthly(target: number, initial: number, annualPercent: number, years: number): number {
	const n = years * 12;
	const m = monthlyRate(annualPercent);
	const growth = Math.pow(1 + m, n);
	const fromInitial = initial * growth;
	if (fromInitial >= target) return 0;
	const factor = m === 0 ? n : ((growth - 1) / m) * (1 + m);
	return Math.ceil((target - fromInitial) / factor);
}
