# 집돈 계산기

**https://jipdon.com** — 집과 돈에 관한 계산을 정확하고 쉽게.

대출 상환액, 전세대출 이자, 중개보수, 전월세 전환처럼 집을 구하거나 빌릴 때 필요한 계산을 모은 사이트입니다.
결과만 보여주지 않고 **어떤 식으로, 어떤 기준(반올림 등)으로 계산했는지**를 함께 설명합니다.

| 계산기 | 계산 근거 |
| --- | --- |
| [대출 상환](https://jipdon.com/loan/) | 원리금균등·원금균등·만기일시 비교, 월별 상환표 |
| [전세대출 이자](https://jipdon.com/jeonse-loan/) | 만기일시 이자 + 보증료 |
| [중개보수(복비)](https://jipdon.com/brokerage-fee/) | 공인중개사법 시행규칙 별표 1 (2021.10.19 시행) 상한 요율·한도, 월세 ×100/×70 환산 |
| [전월세 전환](https://jipdon.com/rent-conversion/) | 주택임대차보호법 시행령 제9조 상한(기준금리 + 2%, 최대 10%) |
| [자동차 할부](https://jipdon.com/car-installment/) | 원리금균등, 기간별 비교 |
| [적립식·거치식 투자](https://jipdon.com/invest/) | S&P 500(SPY)·나스닥 100(QQQ) 2016~2025 배당 재투자 총수익률 재현, 목표 금액 월 적립액 역산 |
| [DSR](https://jipdon.com/dsr/) | 연간 원리금 ÷ 연 소득, 전세대출은 이자만, 스트레스 가산금리, 한도 내 최대 대출액 |

계산 로직은 `src/lib/`에 있고 테스트 57개로 검증합니다. 기준금리는 `src/data/rates.ts`, 과거 지수 수익률은 `src/data/market.ts` 한 곳에서 관리합니다.

## 구조

```
브라우저 ── HTTPS ──> Nginx (게이트웨이 서버와 공유) ──> 정적 파일 /var/www/sites/jipdon/current
```

- **Astro 정적 빌드**: 계산은 모두 브라우저에서 합니다. 서버 프로그램이 없어 메모리를 거의 쓰지 않고, 이미 운영 중인
  [spring-llm-gateway](https://github.com/minunglee/spring-llm-gateway) 서버(2GB)의 Nginx가 함께 서비스합니다.
- **계산 로직 분리**: `src/lib/`의 순수 함수로 두고 단위 테스트로 검증합니다. 페이지는 입력과 표시만 맡습니다.
- 다음 단계에서는 국토부 실거래가를 모으는 Spring 서버를 붙여 전세가율·깡통전세 위험을 보여줄 계획입니다.

## 계산 정확도

- 매달 이자와 상환액은 원 단위로 반올림하고, 반올림으로 생긴 자투리는 마지막 달에 정리해 대출금이 정확히 0이 되게 합니다.
- 테스트는 알려진 값과 대조합니다. 예: 1억 원 · 연 4.5% · 30년 원리금균등 → 월 506,685원, 매매 5억 중개보수 상한 → 200만 원.
- 실제 은행은 일 단위 이자 계산 등 방식이 달라 몇 원~몇십 원 차이가 날 수 있으며, 페이지에 그 점을 밝힙니다.

## 배포

`main`에 머지되면 GitHub Actions가 다음을 수행합니다.

1. 테스트(`vitest`) · 타입 검사(`astro check`) · 빌드
2. 서버의 `sites/jipdon/releases/<커밋>`에 업로드
3. `current` 링크를 새 버전으로 바꿔 끼움 — 업로드 도중의 반쯤 바뀐 사이트가 보이지 않고, 이전 버전으로 바로 되돌릴 수 있음 (최근 5개 보관)
4. Nginx 설정(`deploy/jipdon.conf`) 반영 후 검사·재적용, 실제 주소로 확인

되돌리기 (서버에서):

```bash
cd ~/sites/jipdon && ls -1t releases          # 버전 목록
ln -sfn releases/<이전 커밋> current.tmp && mv -Tf current.tmp current
```

## 로컬 실행

```bash
npm ci
npm run dev      # http://localhost:4321
npm test
npm run build
```
