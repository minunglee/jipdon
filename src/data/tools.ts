/** 사이트의 계산기 목록 (메인 화면, 바닥글, 관련 계산기 링크가 함께 쓴다) */
export type ToolIconName = 'loan' | 'house' | 'receipt' | 'swap' | 'car' | 'chart' | 'pie' | 'shield' | 'rank';

export interface Tool {
	href: string;
	name: string;
	desc: string;
	icon: ToolIconName;
	group: ToolGroupId;
}

/** 메인 화면에서 계산기를 나눠 보여주는 묶음 (이 순서대로 표시) */
export const TOOL_GROUPS = [
	{ id: 'home', name: '집 계약' },
	{ id: 'grow', name: '투자·자동차' },
	{ id: 'loan', name: '대출' },
] as const;

export type ToolGroupId = (typeof TOOL_GROUPS)[number]['id'];

// 배열 순서 = 메인·바닥글·"다른 계산기"에 보이는 순서
export const TOOLS: Tool[] = [
	{ href: '/jeonse-risk/', name: '전세 위험 확인 (전세가율)', desc: '아파트·빌라·오피스텔 건물별 전세가율, 단독·다가구 동네 시세와 보증금 안전 계산', icon: 'shield', group: 'home' },
	{ href: '/jeonse-ranking/', name: '전세가율 높은 동네 순위', desc: '전국 동네별 매매가 대비 전세가 비율 순위 (아파트·빌라·오피스텔)', icon: 'rank', group: 'home' },
	{ href: '/brokerage-fee/', name: '중개보수(복비) 계산기', desc: '매매·전세·월세 법정 상한 요율과 한도로 계산', icon: 'receipt', group: 'home' },
	{ href: '/rent-conversion/', name: '전월세 전환 계산기', desc: '보증금 ↔ 월세 바꿀 때 금액과 법정 상한 전환율', icon: 'swap', group: 'home' },
	{ href: '/invest/', name: '적립식·거치식 투자 계산기', desc: 'S&P 500·나스닥 100 과거 10년 재현, 목표 금액 월 적립액', icon: 'chart', group: 'grow' },
	{ href: '/car-installment/', name: '자동차 할부 계산기', desc: '선수금·금리·기간별 월 납입금과 총 이자', icon: 'car', group: 'grow' },
	{ href: '/loan/', name: '대출 상환 계산기', desc: '원리금균등·원금균등·만기일시 월 상환액과 총 이자 비교', icon: 'loan', group: 'loan' },
	{ href: '/dsr/', name: 'DSR 계산기', desc: '소득 대비 원리금 비율과 규제 한도 내 최대 대출액', icon: 'pie', group: 'loan' },
	{ href: '/jeonse-loan/', name: '전세대출 이자 계산기', desc: '보증금과 대출 비율로 매달 내는 이자와 보증료 계산', icon: 'house', group: 'loan' },
];

export const PAGES = [
	{ href: '/guide/', name: '집 계약 가이드' },
	{ href: '/about/', name: '소개' },
	{ href: '/privacy/', name: '개인정보처리방침' },
	{ href: '/terms/', name: '이용약관' },
	{ href: '/contact/', name: '문의' },
];
