/**
 * 공인중개사가 쓴 집 계약 가이드 목록 (가이드 목록, 메인, 각 글의 "다른 가이드"가 함께 쓴다).
 * 법령 수치는 checkedAt 날짜에 국가법령정보센터 원문으로 확인했다. 제도가 바뀌면 글과 이 날짜를 함께 고친다.
 */
export interface Guide {
	slug: string;
	title: string;
	/** 목록·검색 결과 설명 */
	desc: string;
	/** 글 끝에 연결할 계산기 */
	tools: { href: string; name: string }[];
}

export const GUIDES_CHECKED_AT = '2026-10-26';

export const GUIDES: Guide[] = [
	{
		slug: 'kkangtong-jeonse',
		title: '깡통전세 판별법: 계약 전에 숫자 하나로 확인하기',
		desc: '매매 시세 대비 선순위 채권과 보증금 합계로 깡통전세를 가려내는 방법. 계산 예시와 신축 빌라 시세 함정까지.',
		tools: [{ href: '/jeonse-risk/', name: '전세 위험 확인 (전세가율)' }, { href: '/jeonse-ranking/', name: '전세가율 높은 동네 순위' }],
	},
	{
		slug: 'registry-check',
		title: '등기부등본 읽는 법: 표제부·갑구·을구에서 꼭 볼 것',
		desc: '전세 계약 전 등기부등본에서 소유자, 가압류·신탁, 근저당 채권최고액을 확인하는 체크리스트.',
		tools: [{ href: '/jeonse-risk/', name: '전세 위험 확인 (전세가율)' }],
	},
	{
		slug: 'jeonse-contract-checklist',
		title: '전세 계약 체크리스트: 계약 전·당일·잔금일·입주 후',
		desc: '계약 단계마다 확인할 서류와 넣어야 할 특약, 전입신고·확정일자를 하는 시점까지 순서대로 정리했습니다.',
		tools: [{ href: '/jeonse-loan/', name: '전세대출 이자 계산기' }, { href: '/brokerage-fee/', name: '중개보수(복비) 계산기' }],
	},
	{
		slug: 'dagagu-jeonse',
		title: '다가구주택 전세 주의점: 선순위 보증금이 핵심입니다',
		desc: '등기부에 나오지 않는 다른 세입자의 보증금을 확인하는 방법과 최우선변제 기준, 안전 계산법.',
		tools: [{ href: '/jeonse-risk/', name: '전세 위험 확인 (단독·다가구 계산 포함)' }],
	},
	{
		slug: 'jeonse-guarantee-insurance',
		title: '전세보증보험 가입 조건: HUG·HF·SGI와 126% 기준',
		desc: '전세보증금 반환보증의 가입 기준(담보인정비율, 공시가격 126%)과 계약 전에 가입 가능 여부를 확인하는 순서.',
		tools: [{ href: '/jeonse-risk/', name: '전세 위험 확인 (전세가율)' }],
	},
	{
		slug: 'brokerage-fee-guide',
		title: '중개보수(복비) 계산과 협의: 상한요율은 상한일 뿐입니다',
		desc: '주택·오피스텔 중개보수 상한요율표, 월세 거래금액 환산(×100, ×70), 부가세와 지급 시기, 협의 방법.',
		tools: [{ href: '/brokerage-fee/', name: '중개보수(복비) 계산기' }, { href: '/rent-conversion/', name: '전월세 전환 계산기' }],
	},
];

export const guideHref = (guide: Guide) => `/guide/${guide.slug}/`;
