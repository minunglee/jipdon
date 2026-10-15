/** 계산기 페이지 공통 입력 처리 (브라우저 전용) */
import { formatKoreanUnit } from './format';

/** "1,000,000" · "4.5%" 같은 입력에서 숫자만 읽는다. 비어 있으면 NaN */
export function parseNumber(value: FormDataEntryValue | null): number {
	const text = String(value ?? '').replace(/[^0-9.]/g, '');
	return text === '' ? NaN : Number(text);
}

/**
 * 금액 입력칸: 입력하는 동안 쉼표를 넣고, 옆 안내(data-hint로 지정한 요소)에 "1억 5,000만 원"처럼 보여준다.
 * <input data-money data-hint="id"> 를 모두 찾아 연결한다.
 */
export function bindMoneyInputs(root: ParentNode = document): void {
	for (const input of root.querySelectorAll<HTMLInputElement>('input[data-money]')) {
		const hint = input.dataset.hint ? document.getElementById(input.dataset.hint) : null;
		const update = () => {
			const digits = input.value.replace(/[^0-9]/g, '');
			input.value = digits ? Number(digits).toLocaleString('ko-KR') : '';
			if (hint) hint.textContent = digits && Number(digits) > 0 ? formatKoreanUnit(Number(digits)) : '';
		};
		input.addEventListener('input', update);
		update();
	}
}

/** 오류를 보여주고 결과를 흐리게 한다. 오류가 없으면 true */
export function showError(error: string | null, errorBox: HTMLElement, resultBox: HTMLElement): boolean {
	errorBox.hidden = !error;
	errorBox.textContent = error ?? '';
	resultBox.style.opacity = error ? '0.4' : '1';
	return !error;
}

export function setText(id: string, text: string): void {
	document.getElementById(id)!.textContent = text;
}
