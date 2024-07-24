import { handleUploadButtonClick, handleFileInputChange } from '../modules/handle-file-upload';
import {
	handlePopupButtonClick,
	handleBackButtonClick,
	closePopupOnClickOutside,
	resetPopupImageWidth,
} from '../modules/handle-popup';

$(document).ready(function () {
	if (isIndexPage()) {
		localStorage.clear();
		resetPopupImageWidth();
		setupIndexEventHandlers();
		$('.js-popup-video-trigger').magnificPopup({
			disableOn: 320,
			type: 'iframe',
			mainClass: 'mfp-fade',
			removalDelay: 600,
			preloader: false,
			fixedContentPos: false,
		});
	}
});

function isIndexPage() {
	const pathname = window.location.pathname;
	return !pathname.includes('/gallery') && !pathname.includes('/editor');
}

function setupIndexEventHandlers() {
	const uploadButton = $('.hero__actions a').first();
	const fileInput = $('.file-input');
	const popupBlockButton = $('.popup__block-btn');
	const popupBackButton = $('.popup__back-btn');

	uploadButton.on('click', handleUploadButtonClick);
	fileInput.on('change', handleFileInputChange);
	popupBlockButton.on('click', handlePopupButtonClick);
	popupBackButton.on('click', handleBackButtonClick);
	$(document).on('click', closePopupOnClickOutside);
}
