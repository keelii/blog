(function(win, doc) {

    function fixTOC() {
        var $toc = $('#side-toc')
        var oTop = $toc.offset().top;
        var enabled = !$('body').hasClass('collapse-sidebar');

        $(window).bind('scroll.checkToc resize.checkToc', function() {
            var sWidth = $('.sidebar').width();
            var sTop = $('html').scrollTop() || $('body').scrollTop();

            if (sTop > oTop && enabled) {
                $toc.addClass('toc-fixed').css('width', sWidth);
            } else {
                $toc.removeClass('toc-fixed').css('width', '100%');
            }
        });
    }

    $(function() {
        fixTOC();
    })
})(window, document);