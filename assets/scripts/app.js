let dangerAlert = $('.alert-danger').addClass('d-none');
$('document').ready(function(){
    let searchbar = $('#nav-form');
    let title = $('.navbar-brand');
    let cartRmbtn = $('.fa-times');
    let cartAdd = $('#add-to-cart');
    let bookId = $('#book-id');
    let filterSelector = $('#inputGroupSelect02');

    $(window).scroll(function() {
        let height = $(window).scrollTop();
         
        if(height  > 40 && $(window).width() < 760) {
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
        $.ajax({
            url: '/cart/'+bookId.val(),
            type: 'DELETE',
            success: function(result) {
                // Do something with the result
            }
        });
    })
    cartAdd.on('click',function(){
        
        $.post('/cart',{item:bookId.val()},function(){
            location.reload(true);
        })
        
       
    })

    filterSelector.on('change',function(){
        if(this.value !== 'sort'){
            // let current = window.location.href;
            // let queryString = location.search;
            // console.log(queryString)
            //window.location.href = current+'&filter='+this.value;
        }
    })
})