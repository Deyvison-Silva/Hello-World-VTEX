(function($, window, document, undefined) {
    $.fn.counterBanners = function(options) {
        var init = function() {
            var defaults = {
                    effect: {
                        fadeIn: true,
                        show: false
                    },
                    visibleBrands: true,
                    titleFeatured: "Destaque",
                    callback: function() {}
                },
                settings = $.extend({}, defaults, options),
                $self = $(this),
                $status = $('<div class="carousel-status"></div>');

            if ($self.closest(".container").length) {
                $self.closest(".container").prepend($status);
            } else {
                $self.prepend($status);
            }

            $self.on("init reInit afterChange", function(event, slick, currentSlide, nextSlide) {
                let counter = (currentSlide ? currentSlide : 0) + 1;

                $status.text(`${counter}/${slick.slideCount}`);
            });

            settings.callback.call(this);
        };

        return this.each(init);
    };
})(jQuery, window, document);
