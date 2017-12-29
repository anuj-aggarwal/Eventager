$(()=>{
    const navbar = $('.navbar');
    navbar.addClass('transparent');
    navbar.removeClass('color-dark');


    $(window).scroll(function() {
        if($(window).scrollTop() + $('.navbar').height() > ($(window).height()/3)) {
            navbar.addClass('color-dark');
            navbar.removeClass('transparent');
        }
        else {
            navbar.addClass('transparent');
            navbar.removeClass('color-dark');
        }
    });

    $("#landing-btn").click(() => {
        $('html, body').animate({
            scrollTop: $("#features").offset().top
        }, 1000);
    });

    $("#get-started-btn").click(() => {
        $('html, body').animate({
            scrollTop: $("#trending").offset().top
        }, 1000);
    });
});