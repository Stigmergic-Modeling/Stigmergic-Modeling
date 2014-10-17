//hover
$(function(){

    $(".curse_pointer").hover(
        function(){
            $(this).css("cursor","pointer");
        }
    );
    $(".row-hover").live({
        mouseenter: function(){
            $(this).children(".span1-compact").show();
            $(".add-on").css("cursor","pointer");
        },

        mouseleave: function(){
            $(this).children(".span1-compact").hide();
        }
    });

    $(".table-relation td").live({
        mouseenter: function(){
            $(this).children().children(".span-hidden").show();
            $(".add-on").css("cursor","pointer");
        },

        mouseleave: function(){
            $(this).children().children(".span-hidden").hide();
        }
    });

    $(".accordion-heading").live({
        mouseenter:function(){
            $(this).children().children().children(".span1-compact").show();
        },

        mouseleave:function(){
            $(this).children().children().children(".span1-compact").hide();
        }
    });
});

//search
$(function(){
    $(".icd-element-search-cd").typeahead({
        source:function(query, process){
            $.ajax({
                url: '/post/search/cd',
                type: 'POST',
                data: {},
                dataType: 'json',
                async: true,
                success: function(msg)
                {
                    process(msg);
                }
            });
        }
    });

    $(".icd-element-search-class").typeahead({
        source:function(query, process){
            $.ajax({
                url: '/post/search/class',
                type: 'POST',
                data: {},
                dataType: 'json',
                async: true,
                success: function(msg){
                    process(msg);
                }
            });
        }
    });

    $('.icd-element-search-relation').typeahead({
        source:function(query, process){
            $.ajax({
                url: '/post/search/relation',
                type: 'POST',
                data: {},
                dataType: 'json',
                async: true,
                success: function(msg){
                    process(msg);
                }
            });
        }
    });
});

