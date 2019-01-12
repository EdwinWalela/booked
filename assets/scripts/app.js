let dangerAlert = $('.alert-danger').addClass('d-none');
$('document').ready(function(){
    let searchbar = $('#nav-form');
    let title = $('.navbar-brand');
    let cartRmbtn = $('.fa-times');
    let cartAdd = $('#add-to-cart');
    let bookId = $('#book-id');
    let filterSelector = $('#inputGroupSelect02');
    let formSearch = $('#searchbar');
    let searchSuggestion = $('#search-suggestion');
    let sugClose = $('#sug-close');
    let searchQuery = $('.search-bar-input');
    let searchIcon = $('.submit-search');

    $(window).scroll(function() {
        let height = $(window).scrollTop();
         
        if(height  > 20) {
            searchbar.removeClass('d-none');
            title.addClass('d-none');
        }else{
            searchbar.addClass('d-none');
            title.removeClass('d-none');
        }
    });
    
    searchIcon.on('click',function(){
        let query = searchQuery.val();
        let baseUrl = [location.protocol, '//', location.host, location.pathname].join('');
        window.location.replace(baseUrl +'search?q='+query);
    })

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
    filterSelector.on('change',function(){
        if(this.value !== 'sort'){
            let updateQueryStringParam = function (key, value) {
                let baseUrl = [location.protocol, '//', location.host, location.pathname].join(''),
                    urlQueryString = document.location.search,
                    newParam = key + '=' + value,
                    params = '?' + newParam;
            
                // If the "search" string exists, then build params from it
                if (urlQueryString) {
                    keyRegex = new RegExp('([\?&])' + key + '[^&]*');
            
                    // If param exists already, update it
                    if (urlQueryString.match(keyRegex) !== null) {
                        params = urlQueryString.replace(keyRegex, "$1" + newParam);
                    } else { // Otherwise, add it to end of query string
                        params = urlQueryString + '&' + newParam;
                    }
                }
                window.location.replace(baseUrl + params);
            };
            updateQueryStringParam('filter',this.value)
        }
    })

    formSearch.on('focus',function(){
        searchSuggestion.removeClass('d-none');
    })
    sugClose.on('click',function(){
      searchSuggestion.addClass('d-none');
    })
    // Options
    let options = {
        max_value: 5,
        step_size: 1,
        initial_value: 0,
        selected_symbol_type: 'utf8_star', // Must be a key from symbols
        cursor: 'default',
        readonly: true,
        change_once: true, // Determines if the rating can only be set once
    }
    $(".rating").rate(options);
})
