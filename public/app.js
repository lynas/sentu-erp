(function ($) {
    console.log("test");
    var counter = 1;
    $(".mybtn").click(function () {
        $.ajax({
            url: "/items",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                from: "dhaka",
                to: "faridpur"
            }),
            success: function (result) {
                console.log(result);
                $(".result").html("result");
            }, error: function (error) {
                console.log(error);
            }

        });
    });

    $('.sales-order-form').submit(function () {
        const json = $('.table tr:gt(0)').map(function () {
            return {
                itemName: $(this).find('select option:selected').text(),
                unitPrice: $(this).find('[name=unitPrice]').val(),
                quantity: $(this).find('[name=quantity]').val(),
                freeQuantity: $(this).find('[name=freeQuantity]').val(),
                subTotal: $(this).find('[name=subTotal]').val()
            }
        }).get();
        console.log(json);
        return false; // added to stay on the page for testing purpose
    });



    $(".add-row").on("click",function(){
        const $tableBody = $('#sales-order-table').find("tbody"),
            $trLast = $tableBody.find("tr:last"),
            $trNew = $trLast.clone();
        $trLast.after($trNew);
    });

    $('.remove-row').on("click", function(){
        $('#sales-order-table tr:last').remove();
    })


})(jQuery);


