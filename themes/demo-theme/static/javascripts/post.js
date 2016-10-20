(function(win, doc) {
    function detectFix() {
        var $toc = $('#side-toc')
        var oTop = $toc.offset().top;

        return function() {
            var sWidth = $('.sidebar').width();
            var sTop = $('html').scrollTop() || $('body').scrollTop();
            var enabled = !$('body').hasClass('collapse-sidebar');

            if (sTop > oTop && enabled) {
                $toc.addClass('toc-fixed').css('width', sWidth);
            } else {
                $toc.removeClass('toc-fixed').css('width', '100%');
            }
        }
    }
    function fixTOC() {
        var handler = detectFix();

        $(window).bind('scroll.checkToc resize.checkToc', handler);
        $(document).delegate('.toggle-sidebar', 'click', handler);
    }

    function addHotKeys() {
        $(document).bind('keyup.hotkey', function(event) {
            var sTop = $('body').scrollTop();

            switch (event.which) {
                // [s]
                case 83:
                    $('.search').focus();
                    break;
                // [t]
                case 84:
                    $('body').animate({ scrollTop: 0 }, 300);
                    break;
                // vim like key
                // [h]
                case 72:
                    var $left = $('.basic-alignment.left');
                    if ($left.length) {
                        location.href = $left.attr('href');
                    }
                    break;
                // [l]
                case 76:
                    var $right = $('.basic-alignment.right');
                    if ($right.length) {
                        location.href = $right.attr('href');
                    }
                    break;
                // [j]
                case 74:
                    $('body').animate({ scrollTop: sTop + 300 }, 100);
                    break;
                // [k]
                case 75:
                    $('body').animate({ scrollTop: sTop - 300 }, 100);
                    break;
                default:
            }
        });
    }

    function init() {
        addHotKeys();
        fixTOC();
    }

    $(init);
})(window, document);