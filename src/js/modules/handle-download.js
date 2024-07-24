import { createTCO, getGuestAccessToken } from './handle-sdk';

const DOMAIN = import.meta.env.VITE_DSHD_DOMAIN;

export function handleDownloadButtonClick(event, page) {
	event.preventDefault();
	const templateCode = localStorage.getItem('template_code');
	const canvasImagePosition = localStorage.getItem('canvas_image_position');
	const canvasBackgroundColor = localStorage.getItem('canvas_background_color') || 'light';
	const imageUrl = localStorage.getItem('image_url');
	const project_id = localStorage.getItem(
		['project_id', templateCode, canvasImagePosition, canvasBackgroundColor, imageUrl].join('-')
	);

	if (page === 'gallery') {
		const downloadPopup = $('.popup__download');
		downloadPopup.addClass('hidden');
		downloadPopup.removeClass('is-open');
	}

	let downloadPage = $('.popup-alt');
	downloadPage.removeClass('hidden');
	downloadPage.addClass('is-open');

	if (project_id) {
		getGuestAccessToken(function (err, guestAccessToken) {
			if (err) {
				console.error('Error fetching access token:', err);
			} else {
				exportImage('project', project_id, guestAccessToken);
			}
		});
	} else {
		const imageUrl = localStorage.getItem('image_url');
		const customizations = createTCO(canvasImagePosition, canvasBackgroundColor, imageUrl);
		const SPECIAL_USER_ACCESS_TOKEN = import.meta.env.VITE_SPECIAL_USER_ACCESS_TOKEN;
		exportImage('template', templateCode, SPECIAL_USER_ACCESS_TOKEN, customizations);
	}
}

export function exportImage(templateOrProject, identifier, accessToken, customizations) {
	const format = 'jpg';
	const filename = 'background';
	let exportUrl = '';

	if (templateOrProject === 'template') {
		exportUrl = `https://${DOMAIN}/api/export/template/code-${identifier}`;
	} else if (templateOrProject === 'project') {
		exportUrl = `https://${DOMAIN}/api/export/project/${identifier}`;
	}

	fetch(exportUrl, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ format, filename, customizations }),
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.success) {
				const jobId = data.data.job_id;
				pollExportJob(accessToken, jobId, (err, downloadUrl) => {
					if (err) {
						console.error('Error polling export job:', err);
						alert('Error exporting image');
					} else {
						const outputFilename = 'background.jpg';
						downloadImageFromUrl(downloadUrl, outputFilename);
					}
				});
			} else {
				throw new Error('Export request failed');
			}
		})
		.catch((err) => {
			console.error('Error exporting image:', err);
			alert('Error exporting image');
		});
}

export function pollExportJob(token, job_id, callback, attempt = 1) {
	const exportUrl = `https://${DOMAIN}/api/export/jobs/${job_id}`;

	fetch(exportUrl, {
		method: 'GET',
		mode: 'cors',
		credentials: 'omit',
		headers: {
			authorization: `Bearer ${token}`,
		},
	})
		.then((response) => response.json())
		.then((json) => {
			if (!json.success || !json.data || (!json.data.completed && attempt < 10)) {
				setTimeout(() => pollExportJob(token, job_id, callback, attempt + 1), attempt * 1000);
			} else if (json.data.completed) {
				callback(null, json.data.download_url);
			} else {
				callback(new Error('Export Job Timeout'));
			}
		});
}

function downloadImageFromUrl(imageUrl, filename) {
	const a = document.createElement('a');
	a.style.display = 'none';
	a.href = imageUrl;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}
