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
});