/**
 * 부동산 중개보수 상한 계산.
 *
 * 근거: 공인중개사법 시행규칙 제20조 [별표 1] (2021.10.19 시행) 및 이를 따르는 시·도 조례.
 * 요율과 한도는 "받을 수 있는 최대"이며 실제 보수는 이 안에서 중개사와 협의해 정한다.
 * 원 미만은 버린다.
 */

export type DealType = 'sale' | 'lease';
export type PropertyType = 'house' | 'officetel' | 'other';

/** 거래 종류의 화면 이름 */
export const DEAL_LABELS: Record<DealType, string> = { sale: '매매·교환', lease: '전세·월세(임대차)' };
/** 중개대상물 종류의 화면 이름 (주택 / 주거용 오피스텔 / 그 외) */
export const PROPERTY_LABELS: Record<PropertyType, string> = {
	house: '주택',
	officetel: '주거용 오피스텔',
	other: '그 외 (상가·토지·비주거 오피스텔 등)',
};

export interface Bracket {
	/** 이 금액 미만까지 적용 (마지막 구간은 Infinity) */
	below: number;
	rate: number;
	/** 한도액 (없으면 null) */
	cap: number | null;
	label: string;
}

/** 1억 원 (요율 구간 경계를 읽기 쉽게 쓰려고) */
const EOK = 100_000_000;
/** 1만 원 */
const MAN = 10_000;

/** 주택 매매·교환 */
const HOUSE_SALE: Bracket[] = [
	{ below: 5_000 * MAN, rate: 0.006, cap: 250_000, label: '5천만 원 미만' },
	{ below: 2 * EOK, rate: 0.005, cap: 800_000, label: '5천만 원 이상 2억 원 미만' },
	{ below: 9 * EOK, rate: 0.004, cap: null, label: '2억 원 이상 9억 원 미만' },
	{ below: 12 * EOK, rate: 0.005, cap: null, label: '9억 원 이상 12억 원 미만' },
	{ below: 15 * EOK, rate: 0.006, cap: null, label: '12억 원 이상 15억 원 미만' },
	{ below: Infinity, rate: 0.007, cap: null, label: '15억 원 이상' },
];

/** 주택 임대차 */
const HOUSE_LEASE: Bracket[] = [
	{ below: 5_000 * MAN, rate: 0.005, cap: 200_000, label: '5천만 원 미만' },
	{ below: 1 * EOK, rate: 0.004, cap: 300_000, label: '5천만 원 이상 1억 원 미만' },
	{ below: 6 * EOK, rate: 0.003, cap: null, label: '1억 원 이상 6억 원 미만' },
	{ below: 12 * EOK, rate: 0.004, cap: null, label: '6억 원 이상 12억 원 미만' },
	{ below: 15 * EOK, rate: 0.005, cap: null, label: '12억 원 이상 15억 원 미만' },
	{ below: Infinity, rate: 0.006, cap: null, label: '15억 원 이상' },
];

/** 설명 표에 쓰는 주택 요율표 */
export const HOUSE_TABLES = { sale: HOUSE_SALE, lease: HOUSE_LEASE };

export interface BrokerageInput {
	deal: DealType;
	property: PropertyType;
	/** 매매가 (매매일 때) */
	price: number;
	/** 보증금 (임대차일 때) */
	deposit: number;
	/** 월세 (임대차일 때, 전세면 0) */
	monthlyRent: number;
	/** 중개사가 일반과세자라 부가가치세 10%를 더하는지 */
	includeVat: boolean;
}

export interface BrokerageResult {
	/** 요율을 곱하는 거래금액 */
	amount: number;
	/** 월세일 때 거래금액을 어떻게 셌는지 */
	amountNote: string | null;
	rate: number;
	cap: number | null;
	bracketLabel: string;
	/** 상한 보수 (부가세 제외) */
	fee: number;
	vat: number;
	total: number;
	/** 한도 때문에 줄었는지 */
	capped: boolean;
}

/** 입력 검사. 문제가 있으면 화면에 보여줄 문구, 없으면 null (금액은 0 이상 1조 원 이하) */
export function validate(input: BrokerageInput): string | null {
	const ok = (v: number) => Number.isFinite(v) && v >= 0 && v <= 10_000 * EOK;
	if (input.deal === 'sale') {
		if (!ok(input.price) || input.price <= 0) return '거래 금액을 입력해주세요.';
	} else {
		if (!ok(input.deposit) || !ok(input.monthlyRent)) return '보증금과 월세를 올바르게 입력해주세요.';
		if (input.deposit + input.monthlyRent <= 0) return '보증금이나 월세를 입력해주세요.';
	}
	return null;
}

/** 임대차 거래금액: 보증금 + 월세×100, 그 결과가 5천만 원 미만이면 보증금 + 월세×70 */
export function leaseAmount(deposit: number, monthlyRent: number): { amount: number; note: string | null } {
	if (monthlyRent <= 0) return { amount: deposit, note: null };
	const by100 = deposit + monthlyRent * 100;
	if (by100 >= 5_000 * MAN) return { amount: by100, note: '보증금 + 월세 × 100' };
	return { amount: deposit + monthlyRent * 70, note: '보증금 + 월세 × 100이 5천만 원 미만이라 보증금 + 월세 × 70' };
}

/** 중개보수 상한 계산: 거래금액(월세는 ×100/×70 환산)에 종류별 상한요율을 곱하고, 구간 한도액이 있으면 그 금액을 넘지 않게 한다 */
export function calculate(input: BrokerageInput): BrokerageResult {
	const error = validate(input);
	if (error) throw new Error(error);

	const { amount, note } =
		input.deal === 'sale' ? { amount: input.price, note: null } : leaseAmount(input.deposit, input.monthlyRent);

	let rate: number;
	let cap: number | null = null;
	let bracketLabel: string;
	if (input.property === 'house') {
		const bracket = HOUSE_TABLES[input.deal].find((b) => amount < b.below)!;
		({ rate, cap, label: bracketLabel } = bracket);
	} else if (input.property === 'officetel') {
		rate = input.deal === 'sale' ? 0.005 : 0.004;
		bracketLabel = '주거용 오피스텔 (전용 85㎡ 이하, 부엌·화장실 등 요건 충족)';
	} else {
		rate = 0.009;
		bracketLabel = '주택 외 중개대상물 (0.9% 이내 협의)';
	}

	const raw = Math.floor(amount * rate);
	const fee = cap === null ? raw : Math.min(raw, cap);
	const vat = input.includeVat ? Math.floor(fee * 0.1) : 0;
	return { amount, amountNote: note, rate, cap, bracketLabel, fee, vat, total: fee + vat, capped: fee < raw };
}
