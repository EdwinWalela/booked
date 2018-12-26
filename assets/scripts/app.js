let dangerAlert = $('.alert-danger').addClass('d-none');
$('document').ready(function(){
    let searchbar = $('#nav-form');
    let title = $('.navbar-brand');
    let cartRmbtn = $('.fa-times');
    $(window).scroll(function() {
        let height = $(window).scrollTop();
         
        if(height  > 165 && $(window).width() < 760) {
            console.log(height)
            searchbar.removeClass('d-none');
            title.addClass('d-none');
            
        }else{
            searchbar.addClass('d-none');
            title.removeClass('d-none');
        }
    });
    cartRmbtn.on('click',function(){
        dangerAlert.removeClass('d-none');
        setTimeout(function(){
            dangerAlert.addClass('d-none');
        },1000);
    })

})