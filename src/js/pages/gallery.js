/* eslint-disable no-console */
import { triggerFileInput, handleFileInputChange } from '../modules/handle-file-upload.js';
import { configureVisitor, storeTemplateCustomizationObject } from '../modules/handle-sdk.js';
import {
	handlePopupButtonClick,
	handleBackButtonClick,
	closePopupOnClickOutside,
	resetPopupImageWidth,
} from '../modules/handle-popup.js';
import { updateHeader, handleFrameFilterClick } from '../modules/handle-header.js';
import { handleDownloadButtonClick } from '../modules/handle-download.js';

const DOMAIN = import.meta.env.VITE_DSHD_DOMAIN;
const CLIENT_ID = import.meta.env.VITE_DSHD_CLIENT_ID;
const isProduction = import.meta.env.VITE_ENV_MODE === 'production';
let customizationsHash = '';

$(document).ready(function () {
	if (isGalleryPage()) {
		initializeGalleryPage();
		setupGalleryEventHandlers();
		resetPopupImageWidth();
	}
});

function isGalleryPage() {
	return window.location.pathname.includes('gallery');
}

function initializeGalleryPage() {
	configureVisitor(DOMAIN, CLIENT_ID);

	let templateCodes = JSON.parse(localStorage.getItem('template_codes') || null);

	if (!templateCodes) {
		const templateCodesHorizontal = [...Array(30).keys()].map((i) => `h${i + 1}x`);
		const templateCodesVertical = [...Array(30).keys()].map((i) => `v${i + 1}x`);
		const templateCodesSquare = [...Array(30).keys()].map((i) => `s${i + 1}x`);
		templateCodes = [...templateCodesHorizontal, ...templateCodesVertical, ...templateCodesSquare];
		templateCodes = randomizeTemplates(templateCodes);
		localStorage.setItem('template_codes', JSON.stringify(templateCodes));
	}

	displayTemplates(templateCodes);
}

function setupGalleryEventHandlers() {
	const frames = $('.frames li');
	const fileInput = $('.file-input');
	const popupBlockButton = $('.popup__block-btn');
	const popupBackButton = $('.popup__back-btn');
	const popupEditorLink = $('.popup__download .popup__head a');
	const popupDownloadButton = $('.popup__download .popup__btn');
	const fitToggle = $('.toggle-switch input[type="checkbox"]');
	const darkCheckbox = $('#header__dark input[type="checkbox"]');

	$('.gallery').on('click', '.gallery__image', function (event) {
		event.preventDefault();

		const image_url = $(this).find('img').attr('src');
		let template_code = $(this).data('template-code');
		localStorage.setItem('template_code', template_code);

		$('.popup__download .popup__image img').attr('src', image_url);
		$('.popup__download').removeClass('hidden');
		$('.popup__download').addClass('is-open');
	});

	$('.header .btn').on('click', function (event) {
		triggerFileInput(event, fileInput);
	});

	fileInput.on('change', function (event) {
		handleFileInputChange(event);
	});

	popupEditorLink.on('click', function (event) {
		event.preventDefault();

		if (isProduction) {
			window.location.href = 'editor';
		} else {
			window.location.href = 'editor.html';
		}
	});

	fitToggle.on('change', function () {
		const galleryPage = $('#gallery-page');
		galleryPage.removeClass('hidden');
		const isFill = $(this).is(':checked');
		localStorage.setItem('canvas_image_position', isFill ? 'fill' : 'fit');

		refreshGallery();
	});

	darkCheckbox.on('change', function () {
		const isDark = $(this).is(':checked');
		localStorage.setItem('canvas_background_color', isDark ? 'dark' : 'light');
		refreshGallery();
	});

	frames.on('click', function () {
		handleFrameFilterClick($(this));
	});

	popupDownloadButton.on('click', function (event) {
		event.preventDefault();
		handleDownloadButtonClick(event, 'gallery');
	});

	popupBlockButton.on('click', handlePopupButtonClick);
	popupBackButton.on('click', handleBackButtonClick);
	$(document).on('click', closePopupOnClickOutside);
}

function refreshGallery() {
	const templateCodes = JSON.parse(localStorage.getItem('template_codes'));
	$('.gallery').empty();
	$('.template-loader').removeClass('hidden');
	displayTemplates(templateCodes);
}

function displayTemplates(templateCodes) {
	const imageUrl = localStorage.getItem('image_url');
	const canvasImagePosition = localStorage.getItem('canvas_image_position');
	const canvasBackgroundColor = localStorage.getItem('canvas_background_color');

	updateHeader(canvasImagePosition, canvasBackgroundColor);

	let progress = $('.progress');

	function setProgress(num) {
		num = num || 1;
		progress.css('width', num * 25 + '%');
		if (num < 4) {
			setTimeout(function () {
				setProgress(num + 1);
			}, 400);
		}
	}
	setProgress();

	storeTemplateCustomizationObject(function (object_hash) {
		customizationsHash = object_hash;

		console.log(
			'DSHDLib.getVariableTemplatePreviewURL({ template_code: code, customizations_hash: customizationsHash, width: 800 }, function (err, url) { ... }'
		);

		let getImageUrl = function (code, callback) {
			const storedUrl = localStorage.getItem(
				['image', code, canvasImagePosition, canvasBackgroundColor, imageUrl].join('-')
			);

			if (storedUrl) {
				callback(null, storedUrl);
			} else {
				DSHDLib.getVariableTemplatePreviewURL(
					{ template_code: code, customizations_hash: customizationsHash, width: 800 },
					(err, url) => {
						if (err) {
							console.error('Error fetching template URL:', err);
						} else {
							callback(null, url);
						}
					}
				);
			}
		};

		$('.template-loader').addClass('hidden');

		const frame_type = localStorage.getItem('frame_type');

		templateCodes.forEach((code) => {
			getImageUrl(code, function (err, url) {
				let hidden = !frame_type || code.startsWith(frame_type[0]) ? '' : ' hidden';

				const galleryElement = $(`
					<a href="#" class="gallery__image${hidden}" data-template-code="${code}">
						<span class="popup__loader"></span>
						<img src="${url}" width="703" height="397" alt="Template ${code}" class="template-image" loading="lazy">
					</a>
				`);

				$('.gallery').append(galleryElement);
				let img = galleryElement.find('img');
				handleLoader(img);
			});
		});
	});
}

function handleLoader(img) {
	const loader = img.siblings('.popup__loader');

	img.on('load', function () {
		loader.css('opacity', 0);
		img.css('opacity', 1);
	});

	img.on('error', function () {
		loader.css('opacity', 0);
		img.css('opacity', 1);
	});
}

function randomizeTemplates(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}
