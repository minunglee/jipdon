# 공유 미리보기 이미지(public/og.png, 1200×630) 생성. Windows의 맑은 고딕 글꼴을 쓴다.
# 사용: python scripts/make-og-image.py public/og.png  (Pillow 필요)
import sys
from PIL import Image, ImageDraw, ImageFont

out = sys.argv[1]
W, H = 1200, 630
S = 2  # 2배로 그린 뒤 줄여 가장자리를 부드럽게
img = Image.new('RGB', (W * S, H * S))
d = ImageDraw.Draw(img)

# 배경: 연한 청록 → 민트 대각선 그라데이션
a, b = (240, 253, 250), (204, 251, 241)
for y in range(H * S):
    t = y / (H * S)
    d.line([(0, y), (W * S, y)], fill=tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3)))

brand = (15, 118, 110)
text = (24, 24, 27)
soft = (63, 63, 70)
F = 'C:/Windows/Fonts/'
bold = lambda size: ImageFont.truetype(F + 'malgunbd.ttf', size * S)
reg = lambda size: ImageFont.truetype(F + 'malgun.ttf', size * S)

# 위쪽 브랜드 띠
d.rectangle([0, 0, W * S, 14 * S], fill=brand)

# 로고: 둥근 사각형 + 집 + ₩
x0, y0, s = 80 * S, 92 * S, 112 * S
d.rounded_rectangle([x0, y0, x0 + s, y0 + s], radius=26 * S, fill=brand)
house = [(x0 + s * 0.22, y0 + s * 0.52), (x0 + s * 0.5, y0 + s * 0.26), (x0 + s * 0.78, y0 + s * 0.52),
         (x0 + s * 0.78, y0 + s * 0.8), (x0 + s * 0.22, y0 + s * 0.8)]
d.polygon(house, fill='white')
d.text((x0 + s * 0.5, y0 + s * 0.64), '₩', font=bold(30), fill=brand, anchor='mm')

d.text((x0 + s + 32 * S, y0 + s / 2), '집돈 ', font=bold(64), fill=text, anchor='lm')
w = d.textlength('집돈 ', font=bold(64))
d.text((x0 + s + 32 * S + w, y0 + s / 2), '계산기', font=bold(64), fill=brand, anchor='lm')

d.text((80 * S, 290 * S), '집·대출·차, 큰돈 드는 계산을 정확하게', font=bold(52), fill=text, anchor='ls')
d.text((80 * S, 352 * S), '계산식과 법령 근거까지 함께 보여주는 무료 계산기', font=reg(32), fill=soft, anchor='ls')

# 계산기 칩
chips = ['대출 상환', '전세대출 이자', '중개보수', '전월세 전환', '자동차 할부', '투자', 'DSR']
x, y = 80 * S, 430 * S
for label in chips:
    tw = d.textlength(label, font=bold(28))
    cw = tw + 44 * S
    if x + cw > (W - 80) * S:
        x, y = 80 * S, y + 76 * S
    d.rounded_rectangle([x, y, x + cw, y + 56 * S], radius=28 * S, fill='white', outline=(153, 246, 228), width=2 * S)
    d.text((x + cw / 2, y + 28 * S), label, font=bold(28), fill=brand, anchor='mm')
    x += cw + 14 * S

d.text(((W - 80) * S, 92 * S + s / 2), 'jipdon.com', font=bold(34), fill=brand, anchor='rm')

img.resize((W, H), Image.LANCZOS).save(out, optimize=True)
print('saved', out)
