let detect = {
	screenWidth: function() {
		return window.screen.width;
	},
	screenHeight: function() {
		return window.screen.height;
	},
	viewportWidth: function() {
		return document.documentElement.clientWidth;
	},
	viewportHeight: function() {
		return document.documentElement.clientHeight;
	},
    touchDevice: function() {
        return 'ontouchstart' in document.documentElement;
    }
};
