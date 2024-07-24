export function updateHeader(canvasImagePosition, canvasBackgroundColor) {
	const isVector = JSON.parse(localStorage.getItem('is_vector')) || false;
	const isTransparent = JSON.parse(localStorage.getItem('is_transparent')) || false;

	if (canvasImagePosition === 'fill') {
		$('#header__dark').addClass('hidden');
	}

	if (isVector) {
		$('#header__canvas').addClass('hidden');
		$('#header__dark').removeClass('hidden');
	} else {
		if (isTransparent) {
			$('#header__canvas').removeClass('hidden');
			$('#header__dark').removeClass('hidden');
		} else {
			$('#header__canvas').removeClass('hidden');
			$('#header__dark').toggleClass('hidden', canvasImagePosition === 'fill');
		}
	}

	$('.toggle-switch input[type="checkbox"]').prop('checked', canvasImagePosition === 'fill');

	$('#dark').prop('checked', canvasBackgroundColor === 'dark');
}

export function handleFrameFilterClick(element) {
	const $element = $(element);
	const frameType = $element.data('frame-type');
	const isCurrent = $element.hasClass('is-current');

	localStorage.setItem('frame_type', frameType);

	const templateCodes = JSON.parse(localStorage.getItem('template_codes'));

	if (isCurrent) {
		localStorage.setItem('frame_type', '');
		$element.removeClass('is-current');
		$('.gallery__image').removeClass('hidden');
	} else {
		$('.frames li').removeClass('is-current');
		$element.addClass('is-current');
		const filteredTemplateCodes = filterFrame(templateCodes, frameType);

		$('.gallery__image').each(function () {
			const templateCode = $(this).data('template-code');

			if (!filteredTemplateCodes.includes(templateCode)) {
				$(this).addClass('hidden');
			} else {
				$(this).removeClass('hidden');
			}
		});
	}
}

export function filterFrame(templateCodes, frameType) {
	return templateCodes.filter((templateCode) => templateCode.startsWith(frameType[0]));
}
