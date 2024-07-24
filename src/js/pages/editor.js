import { handleDownloadButtonClick } from '../modules/handle-download';
import { updateHeader } from '../modules/handle-header';
import { changeEditorBackground, configureGuest, createTCO, getGuestAccessToken } from '../modules/handle-sdk';
import { updateFooter } from '../modules/handle-footer';

const DOMAIN = import.meta.env.VITE_DSHD_DOMAIN;
const CLIENT_ID = import.meta.env.VITE_DSHD_CLIENT_ID;
const isProduction = import.meta.env.VITE_ENV_MODE === 'production';

let editor = null;

$(document).ready(function () {
	if (isEditorPage()) {
		initializeEditorPage();
		setupEditorEventHandlers();
	}
});

$('.popup__close-btn').click(function () {
	$('.popup-alt').removeClass('is-open');
});

function isEditorPage() {
	const isEditor = window.location.pathname.includes('/editor');
	return isEditor;
}

function setupEditorEventHandlers() {
	$('#gallery-button').click(navigateToGallery);

	$('#download-button').on('click', function (event) {
		handleDownloadButtonClick(event, 'editor');
	});

	$('.popup__close-btn').on('click', function (event) {
		navigateToGallery(event);
	});

	$('#dark').on('change', function () {
		const isDark = $(this).is(':checked');

		const imageUrl = localStorage.getItem('image_url');
		const templateCode = localStorage.getItem('template_code');
		const canvasImagePosition = localStorage.getItem('canvas_image_position');

		const projectID = editor.project_id;

		localStorage.setItem('canvas_background_color', isDark ? 'dark' : 'light');

		localStorage.removeItem(
			['project_id', templateCode, canvasImagePosition, isDark ? 'light' : 'dark', imageUrl].join('-')
		);
		localStorage.setItem(
			['project_id', templateCode, canvasImagePosition, isDark ? 'dark' : 'light', imageUrl].join('-'),
			projectID
		);

		localStorage.removeItem(
			['image', templateCode, canvasImagePosition, isDark ? 'light' : 'dark', imageUrl].join('-')
		);

		changeEditorBackground(editor, isDark ? '#171717' : '#ffffff');
	});
}

function initializeEditorPage() {
	const mainLoader = $('.main-loader');
	mainLoader.removeClass('hidden');

	const templateCode = localStorage.getItem('template_code');
	const imageUrl = localStorage.getItem('image_url');
	const canvasImagePosition = localStorage.getItem('canvas_image_position');
	const canvasBackgroundColor = localStorage.getItem('canvas_background_color');

	updateHeader(canvasImagePosition, canvasBackgroundColor);
	updateFooter();

	configureGuest(DOMAIN, CLIENT_ID);

	const projectID = localStorage.getItem(
		['project_id', templateCode, canvasImagePosition, canvasBackgroundColor, imageUrl].join('-')
	);

	if (projectID) {
		DSHDLib.Editors.insert('editor-container', { project_id: projectID }, function (err, e) {
			if (err) {
				console.error('Error inserting editor:', err);
			} else {
				editor = e;
				mainLoader.addClass('hidden');
				assetChangeHandler(projectID);
			}
		});
	} else {
		const customizations = createTCO(canvasImagePosition, canvasBackgroundColor, imageUrl);
		let projectID = '';

		DSHDLib.createProject({ template_code: templateCode, customizations }, function (err, data) {
			if (err) {
				console.error('Error creating project:', err);
			} else {
				projectID = data.project_id;

				localStorage.setItem(
					['project_id', templateCode, canvasImagePosition, canvasBackgroundColor, imageUrl].join('-'),
					projectID
				);

				DSHDLib.Editors.insert('editor-container', { project_id: projectID }, function (err, e) {
					if (err) {
						console.error('Error inserting editor:', err);
					} else {
						mainLoader.addClass('hidden');

						editor = e;

						assetChangeHandler(projectID);
					}
				});
			}
		});
	}
}

let constrainedProportions = false;

function constrainProportions(element) {
	if (element.type === 'vector') {
		constrainedProportions = true;
		editor.changeElements({
			elements: {
				[element.element_id]: { constrain_proportions: true },
			},
		});

		const consoleObject = {
			elements: {
				'{element_id}': {
					constrain_proportions: true,
				},
			},
		};

		console.log(`editor.changeElements(${JSON.stringify(consoleObject, null, 2)})`);
	}
}

function assetChangeHandler(projectID) {
	let asset_id = null;

	const getCurrentElement = (cb) => {
		editor.getProjectData({}, (err, data) => {
			if (err) {
				console.error('Error getting project data:', err);
				return;
			}

			console.log('editor.getProjectData({}, function (err, data) { ... })');

			const elements = data.pages[0].elements;
			for (let key in elements) {
				if (elements[key].element_classes.includes('image')) {
					cb(elements[key]);
					return;
				}
			}
		});
	};

	getCurrentElement((element) => {
		asset_id = element.asset_id;
		constrainProportions(element);
	});

	editor.handleProjectDataChange(() => {
		console.log('editor.handleProjectDataChange(function () { ... })');

		if (constrainedProportions) {
			constrainedProportions = false;
			return;
		}

		getCurrentElement((element) => {
			const getRender = () => {
				const templateCode = localStorage.getItem('template_code');
				const canvasImagePosition = localStorage.getItem('canvas_image_position');
				const canvasBackgroundColor = localStorage.getItem('canvas_background_color') || 'light';
				const imageUrl = localStorage.getItem('image_url');

				editor.getRender({}, (err, data) => {
					if (err) {
						console.error('Error getting render:', err);
					} else {
						localStorage.setItem(
							['image', templateCode, canvasImagePosition, canvasBackgroundColor, imageUrl].join('-'),
							data.url
						);
					}
				});

				console.log('editor.getRender({}, function (err, data) { ... })');
			};

			if (element.asset_id !== asset_id) {
				asset_id = element.asset_id;
				constrainProportions(element);
				getGuestAccessToken(function (err, guestAccessToken) {
					if (err) {
						console.error('Error fetching access token:', err);
					} else {
						fetch(`https://${DOMAIN}/api/projects/${projectID}/assets/${asset_id}`, {
							method: 'GET',
							headers: {
								'Authorization': `Bearer ${guestAccessToken}`,
								'Content-Type': 'application/json',
							},
						})
							.then((response) => response.json())
							.then((data) => {
								const download_url = data.data.download_url;
								const questionMarkIndex = download_url.indexOf('?');
								const urlBeforeQuestionMark = download_url.substring(0, questionMarkIndex);
								const fileExtension = urlBeforeQuestionMark.slice(-3);
								const templateCode = localStorage.getItem('template_code');
								const canvasImagePosition = localStorage.getItem('canvas_image_position');
								const canvasBackgroundColor =
									localStorage.getItem('canvas_background_color') || 'light';

								if (fileExtension === 'svg') {
									localStorage.setItem('is_vector', 'true');
								} else {
									localStorage.setItem('is_vector', 'false');
								}

								localStorage.setItem('image_url', download_url);

								localStorage.setItem(
									[
										'project_id',
										templateCode,
										canvasImagePosition,
										canvasBackgroundColor,
										download_url,
									].join('-'),
									projectID
								);

								getRender();
							})

							.catch((err) => {
								console.error('Error fetching asset:', err);
							});
					}
				});
			} else {
				getRender();
			}
		});
	});
}

function navigateToGallery(event) {
	event.preventDefault();

	if (isProduction) {
		window.location.href = 'gallery';
	} else {
		window.location.href = 'gallery.html';
	}
}
