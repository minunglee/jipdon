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
	/** 이 글의 법령을 원문으로 확인한 날 (없으면 GUIDES_CHECKED_AT) */
	checkedAt?: string;
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
	{
		slug: 'move-in-fixed-date',
		title: '전입신고·확정일자·대항력: 효력이 생기는 순서와 시점',
		desc: '대항력은 전입 다음 날 0시, 근저당은 접수 당일. 하루 차이로 순위가 밀리지 않게 잔금일에 할 일을 순서대로 정리했습니다.',
		tools: [{ href: '/jeonse-risk/', name: '전세 위험 확인 (전세가율)' }, { href: '/jeonse-loan/', name: '전세대출 이자 계산기' }],
		checkedAt: '2026-11-18',
	},
	{
		slug: 'renewal-right',
		title: '계약갱신요구권: 언제 쓰고, 집주인이 거절할 수 있는 경우',
		desc: '만기 6개월~2개월 전 요구, 1회 2년, 증액 5% 상한. 법이 정한 거절 사유 9가지와 실거주 거절 후 손해배상까지.',
		tools: [{ href: '/rent-conversion/', name: '전월세 전환 계산기' }, { href: '/jeonse-loan/', name: '전세대출 이자 계산기' }],
		checkedAt: '2026-11-18',
	},
	{
		slug: 'deposit-not-returned',
		title: '만기에 보증금을 못 돌려받을 때: 임차권등기명령부터 차례대로',
		desc: '해지 통지, 내용증명, 보증보험 이행청구, 임차권등기명령, 지급명령과 소송까지. 이사 전에 꼭 지킬 순서.',
		tools: [{ href: '/jeonse-risk/', name: '전세 위험 확인 (전세가율)' }],
		checkedAt: '2026-11-18',
	},
	{
		slug: 'jeonse-ratio-data',
		title: '전세가율 데이터 제대로 읽는 법: 표본 수, 면적 묶음, 숨은 함정',
		desc: '집돈이 전세가율을 계산하는 방법과, 숫자를 믿기 전에 확인할 표본 수·기간·공공임대·갱신 계약의 영향.',
		tools: [{ href: '/jeonse-risk/', name: '전세 위험 확인 (전세가율)' }, { href: '/jeonse-ranking/', name: '전세가율 높은 동네 순위' }],
		checkedAt: '2026-11-18',
	},
	{
		slug: 'real-price-data',
		title: '실거래가 해석법: 신고 시차, 계약 해제, 갱신 계약이 숫자를 바꾸는 이유',
		desc: '30일 신고 기한 때문에 비어 보이는 최근 달, 해제 거래, 신고 대상이 아닌 전월세, 5% 상한 갱신 계약을 읽는 법.',
		tools: [{ href: '/jeonse-risk/', name: '전세 위험 확인 (전세가율)' }, { href: '/jeonse-ranking/', name: '전세가율 높은 동네 순위' }],
		checkedAt: '2026-11-18',
	},
];

export const guideHref = (guide: Guide) => `/guide/${guide.slug}/`;
