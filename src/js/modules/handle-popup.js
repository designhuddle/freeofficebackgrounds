const isProduction = import.meta.env.VITE_ENV_MODE === 'production';

export function showPopup(popupId) {
	$(`#${popupId}`).removeClass('hidden');
	$(`#${popupId}`).addClass('is-open');
}

export function hidePopup(popupId) {
	$(`#${popupId}`).addClass('hidden');
	$(`#${popupId}`).removeClass('is-open');
}

export function showErrorPopup(popupId) {
	$(`#${popupId}`).removeClass('hidden');
	$(`#${popupId}`).addClass('is-open');
}

const fileExtensionMappings = {
	webp: 'webp-to-png',
	tif: 'tiff-to-jpg',
	tiff: 'tiff-to-jpg',
	heic: 'heic-to-jpg',
	heif: 'heif-to-jpg',
	pdf: 'pdf-to-png',
	ai: 'ai-to-png',
	eps: 'eps-to-png',
};

export function updateErrorPopup(popupId, fileExtension) {
	const domain = 'https://cloudconvert.com';
	const urlPath = fileExtensionMappings[fileExtension] || '';
	const url = `${domain}/${urlPath}`;
	$(`#${popupId} .popup__head a`).attr('href', url);
}

export function handlePopupButtonClick(event) {
	event.preventDefault();

	const target = $(event.target);
	const buttonLabel = target.text().trim();

	const actions = {
		Fit: () => {
			hidePopup('canvas-image-position');
			localStorage.setItem('canvas_image_position', 'fit');
			showPopup('canvas-background-color');
		},
		Fill: () => {
			hidePopup('canvas-image-position');
			localStorage.setItem('canvas_image_position', 'fill');

			if (isProduction) {
				window.location.href = 'gallery';
			} else {
				window.location.href = 'gallery.html';
			}
		},
		Dark: () => {
			hidePopup('canvas-background-color');
			localStorage.setItem('canvas_background_color', 'dark');

			if (isProduction) {
				window.location.href = 'gallery';
			} else {
				window.location.href = 'gallery.html';
			}
		},
		Light: () => {
			hidePopup('canvas-background-color');
			localStorage.setItem('canvas_background_color', 'light');

			if (isProduction) {
				window.location.href = 'gallery';
			} else {
				window.location.href = 'gallery.html';
			}
		},
	};

	if (actions[buttonLabel]) {
		actions[buttonLabel]();
	} else {
		console.error('Button label not found:', buttonLabel);
	}
}

export function closePopupOnClickOutside(event) {
	if ($(event.target).closest('.popup__inner').length === 0 && $(event.target).closest('.popup').length > 0) {
		$('.popup').removeClass('is-open');
		resetPopupImageWidth();
		updateImageSources('');
	}
}

export function resetPopupImageWidth() {
	$('.popup__block-image').removeClass('popup__wide-image');
}

export function updateImageSources(dataURI) {
	$('#canvas-image-position img, #canvas-background-color img').attr('src', dataURI);
}

export function handleBackButtonClick(event) {
	event.preventDefault();
	hidePopup('canvas-background-color');
	showPopup('canvas-image-position');
}

export function isImageApproxSquare(dataURI, callback) {
	const img = new Image();
	img.onload = function () {
		const aspectRatio = img.width / img.height;
		const isApproxSquare = aspectRatio >= 0.8 && aspectRatio <= 1.2;
		callback(isApproxSquare);
	};
	img.src = dataURI;
}
