export function updateFooter() {
	const footer = $('.footer');
	const footerSecondLink = $(footer.find('.footer__inner p a')[1]);
	footerSecondLink.attr('href', 'https://www.designhuddle.com/playground');
	footerSecondLink.text('Explore more editor examples');
}
