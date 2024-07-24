import {
	showPopup,
	showErrorPopup,
	updateErrorPopup,
	updateImageSources,
	isImageApproxSquare,
} from './handle-popup.js';

const isProduction = import.meta.env.VITE_ENV_MODE === 'production';
const DOMAIN = import.meta.env.VITE_DOMAIN;

export function handleUploadButtonClick(event) {
	event.preventDefault();
	triggerFileInput(event, $('.file-input'));
}

export function triggerFileInput(event) {
	event.preventDefault();
	clearFileInput();
	$('.file-input').trigger('click');
}

export function handleFileInputChange(event) {
	const file = event.target.files[0];
	const fileExtension = file.name.split('.').pop().toLowerCase();

	if (file) {
		readFileAsDataURI(file, function (dataURI) {
			if (!isValidFileType(file.name)) {
				updateErrorPopup('unsupported-file-type', fileExtension);
				showErrorPopup('unsupported-file-type');
			} else if (!isValidFileSize(file.size) || !isValidFileDimensions(dataURI)) {
				showErrorPopup('unsupported-file-size');
			} else {
				updateErrorPopup('unsupported-file-type', '');
				handleFileProcessing(file, dataURI);
			}
		});
	}
}

function handleFileProcessing(file, dataURI) {
	const fileExtension = file.name.split('.').pop().toLowerCase();

	const updateImagesContainer = function (callback) {
		isImageApproxSquare(dataURI, function (isApproxSquare) {
			updateImageSources(dataURI);
			if (isApproxSquare) {
				$('.popup__block-image').addClass('popup__wide-image');
			}
			callback();
		});
	};

	if (fileExtension === 'svg') {
		localStorage.setItem('is_vector', true);
		localStorage.setItem('is_transparent', true);
		localStorage.setItem('canvas_image_position', 'fit');
		$('.popup__back-btn').addClass('hidden');
		updateImagesContainer(function () {
			showPopup('canvas-background-color');
		});
	} else {
		localStorage.setItem('is_vector', false);
		const updateImagesAndShowPopup = function () {
			updateImagesContainer(function () {
				showPopup('canvas-image-position');
			});
		};
		if (fileExtension === 'png') {
			isTransparent(dataURI, function (isTransparent) {
				if (isTransparent) {
					localStorage.setItem('is_transparent', true);
				}
				updateImagesAndShowPopup();
			});
		} else {
			updateImagesAndShowPopup();
		}
	}

	if (isProduction) {
		const uniqueFilename = generateUniqueFilename(fileExtension);
		uploadFileToS3(file, uniqueFilename)
			.then((s3Url) => {
				localStorage.setItem('image_url', s3Url);
			})
			.catch((err) => {
				console.error('Error uploading file to S3:', err);
			});
	} else {
		localStorage.setItem('image_url', dataURI);
	}
}

function readFileAsDataURI(file, callback) {
	const reader = new FileReader();
	reader.onload = function (event) {
		const dataURI = event.target.result;
		callback(dataURI);
	};
	reader.readAsDataURL(file);
}

function isValidFileDimensions(dataURL) {
	const max_dimensions = 7000; // 7000px
	const img = new Image();
	let isImageValid = true;

	img.onload = function () {
		if (img.width > max_dimensions || img.height > max_dimensions) {
			isImageValid = false;
		} else {
			isImageValid = true;
		}
	};

	img.src = dataURL;

	return isImageValid;
}

function isValidFileType(fileName) {
	const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.svg)$/i;
	return allowedExtensions.test(fileName);
}

function isValidFileSize(fileSize) {
	const max_file_size = 10 * 1024 * 1024; // 10 MB
	return fileSize <= max_file_size;
}

function isTransparent(dataURI, callback) {
	const img = new Image();
	img.onload = function () {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		canvas.width = img.width;
		canvas.height = img.height;
		ctx.drawImage(img, 0, 0, img.width, img.height);

		const imageData = ctx.getImageData(0, 0, img.width, img.height);
		const data = imageData.data;

		for (let i = 3; i < data.length; i += 4) {
			if (data[i] < 255) {
				localStorage.setItem('is_transparent', true);
				callback(true);
				return;
			}
		}
		localStorage.setItem('is_transparent', false);
		callback(false);
	};
	img.onerror = function () {
		callback(false);
	};
	img.src = dataURI;
}

function generateUniqueFilename(extension) {
	return `${new Date().getTime()}-${Math.floor(Math.random() * 1000)}.${extension}`;
}

export function uploadFileToS3(file, filename) {
	const s3Url = `${DOMAIN}/uploads/${filename}`;
	return new Promise((resolve, reject) => {
		fetch(s3Url, {
			method: 'PUT',
			body: file,
			headers: {
				'Content-Type': file.type,
			},
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error('Failed to upload file to S3');
				}
				resolve(s3Url);
			})
			.catch((err) => {
				reject(err);
			});
	});
}

function clearFileInput() {
	$('.file-input').val('');
}
