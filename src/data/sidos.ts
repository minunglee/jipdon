/**
 * 전세가율 순위 페이지의 지역 목록. 시도마다 정적 페이지를 하나씩 만든다.
 * name은 실거래가 서버(/api/rankings?sido=)가 쓰는 이름과 같다. 전국은 sido 없이 부른다.
 * lat·lng는 "내 주변 지역 보기"에서 가장 가까운 시도를 고를 때만 쓰는 대략의 중심 좌표 (광역시는 시청, 도는 지역 한가운데쯤).
 */
export interface Sido {
	slug: string;
	/** 서버 API의 시도 이름 (전국이면 빈 문자열) */
	name: string;
	/** 제목에 쓰는 이름 */
	label: string;
	lat: number;
	lng: number;
}

export const NATIONWIDE: Sido = { slug: 'nationwide', name: '', label: '전국', lat: 0, lng: 0 };

export const SIDOS: Sido[] = [
	{ slug: 'seoul', name: '서울', label: '서울', lat: 37.5665, lng: 126.978 },
	{ slug: 'gyeonggi', name: '경기', label: '경기', lat: 37.41, lng: 127.25 },
	{ slug: 'incheon', name: '인천', label: '인천', lat: 37.4563, lng: 126.7052 },
	{ slug: 'busan', name: '부산', label: '부산', lat: 35.1796, lng: 129.0756 },
	{ slug: 'daegu', name: '대구', label: '대구', lat: 35.8714, lng: 128.6014 },
	{ slug: 'gwangju', name: '광주', label: '광주', lat: 35.1595, lng: 126.8526 },
	{ slug: 'daejeon', name: '대전', label: '대전', lat: 36.3504, lng: 127.3845 },
	{ slug: 'ulsan', name: '울산', label: '울산', lat: 35.5384, lng: 129.3114 },
	{ slug: 'sejong', name: '세종', label: '세종', lat: 36.48, lng: 127.289 },
	{ slug: 'gangwon', name: '강원', label: '강원', lat: 37.8, lng: 128.25 },
	{ slug: 'chungbuk', name: '충북', label: '충북', lat: 36.8, lng: 127.7 },
	{ slug: 'chungnam', name: '충남', label: '충남', lat: 36.5, lng: 126.8 },
	{ slug: 'jeonbuk', name: '전북', label: '전북', lat: 35.72, lng: 127.15 },
	{ slug: 'jeonnam', name: '전남', label: '전남', lat: 34.86, lng: 126.99 },
	{ slug: 'gyeongbuk', name: '경북', label: '경북', lat: 36.4, lng: 128.9 },
	{ slug: 'gyeongnam', name: '경남', label: '경남', lat: 35.3, lng: 128.25 },
	{ slug: 'jeju', name: '제주', label: '제주', lat: 33.4, lng: 126.55 },
];

/** 서울은 기존 주소(/jeonse-ranking/)를 그대로 쓴다 */
export const rankingHref = (sido: Sido) => (sido.slug === 'seoul' ? '/jeonse-ranking/' : `/jeonse-ranking/${sido.slug}/`);
