/**
 * External dependencies
 */
import Swiper from 'swiper/bundle';

/**
 * Init slider.
 *
 * @param {String} slider
 * @returns {Void}
 */
function initSlider(container) {
	new Swiper(container, {
		spaceBetween: 0,
		slidesPerView: 1,
		effect: 'fade',
		speed: 1200,
		autoplay: {
			delay: 2000,
			disableOnInteraction: false,
		},
	});
}

/**
 * Init
 */
initSlider('.js-slider .swiper');
