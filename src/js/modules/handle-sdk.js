export function configureVisitor(DOMAIN, CLIENT_ID) {
	DSHDLib.configure({ domain: DOMAIN, client_id: CLIENT_ID, visitor: true });
	console.log(`DSHDLib.configure({ domain: "{DOMAIN}", client_id: "{CLIENT_ID}", visitor: true })`);
}

export function configureGuest(DOMAIN, CLIENT_ID) {
	DSHDLib.configure({ domain: DOMAIN, client_id: CLIENT_ID, guest: true });
	console.log(`DSHDLib.configure({ domain: "{DOMAIN}", client_id: "{CLIENT_ID}", guest: true })`);
}

export function createTCO(canvasImagePosition, canvasBackgroundColor, imageUrl) {
	let templateCustomizationObject = { classes: { image: {}, canvas: {} } };

	if (canvasImagePosition === 'fit') {
		templateCustomizationObject.classes.image = { url: imageUrl };
	} else if (canvasImagePosition === 'fill') {
		templateCustomizationObject.classes.image = { masked_media: { url: imageUrl } };
	}

	if (canvasBackgroundColor === 'dark') {
		templateCustomizationObject.classes.canvas.color = '#171717';
	} else if (canvasBackgroundColor === 'light') {
		templateCustomizationObject.classes.canvas.color = '#FFFFFF';
	}

	return templateCustomizationObject;
}

export function changeEditorBackground(editor, color) {
	editor.getProjectData({}, (err, data) => {
		if (err) {
			console.error('Error getting project data:', err);
		} else {
			const elements = data.pages[0].elements;

			for (let element in elements) {
				if (elements[element].element_classes.includes('canvas')) {
					const changeObject = {
						elements: {
							[element]: {
								colors: [color],
							},
						},
					};

					editor.changeElements(changeObject);
					let consoleObject = { elements: { '{element_id}': { colors: [color] } } };
					console.log(`editor.changeElements(${JSON.stringify(consoleObject, null, 2)})`);
				}
			}
		}
	});
}

export function storeTemplateCustomizationObject(callback) {
	const canvasImagePosition = localStorage.getItem('canvas_image_position');
	const canvasBackgroundColor = localStorage.getItem('canvas_background_color');
	const imageUrl = localStorage.getItem('image_url');
	const customizations = createTCO(canvasImagePosition, canvasBackgroundColor, imageUrl);

	DSHDLib.storeTemplateCustomizationObject({ object: customizations }, function (err, data) {
		if (err) {
			console.error('Error storing customizations object:', err);
			callback(null);
		} else {
			console.log(
				`DSHDLib.storeTemplateCustomizationObject({ object: ${JSON.stringify(
					customizations,
					null,
					2
				)} }, function (err, data) { ... }`
			);
			callback(data.object_hash);
		}
	});
}

export function getGuestAccessToken(callback) {
	DSHDLib.getGuestAccessToken({}, function (err, guestAccessToken) {
		if (err) {
			console.error('Error fetching access token:', err);
			callback(err, null);
		} else {
			console.log('DSHDLib.getGuestAccessToken({}, function (err, guestAccessToken) { ... }');
			callback(null, guestAccessToken);
		}
	});
}
