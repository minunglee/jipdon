/** 사이트의 계산기 목록 (메인 화면, 바닥글, 관련 계산기 링크가 함께 쓴다) */
export interface Tool {
	href: string;
	name: string;
	desc: string;
}

export const TOOLS: Tool[] = [
	{ href: '/loan/', name: '대출 상환 계산기', desc: '원리금균등·원금균등·만기일시 월 상환액과 총 이자 비교' },
	{ href: '/jeonse-loan/', name: '전세대출 이자 계산기', desc: '보증금과 대출 비율로 매달 내는 이자와 보증료 계산' },
	{ href: '/brokerage-fee/', name: '중개보수(복비) 계산기', desc: '매매·전세·월세 법정 상한 요율과 한도로 계산' },
	{ href: '/rent-conversion/', name: '전월세 전환 계산기', desc: '보증금 ↔ 월세 바꿀 때 금액과 법정 상한 전환율' },
	{ href: '/car-installment/', name: '자동차 할부 계산기', desc: '선수금·금리·기간별 월 납입금과 총 이자' },
	{ href: '/invest/', name: '적립식·거치식 투자 계산기', desc: 'S&P 500·나스닥 100 과거 10년 재현, 목표 금액 월 적립액' },
	{ href: '/dsr/', name: 'DSR 계산기', desc: '소득 대비 원리금 비율과 규제 한도 내 최대 대출액' },
];

export const PAGES = [
	{ href: '/about/', name: '소개' },
	{ href: '/privacy/', name: '개인정보처리방침' },
	{ href: '/terms/', name: '이용약관' },
	{ href: '/contact/', name: '문의' },
];
