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
                id: $(this).find('[name=id]').val(),
                itemName: $(this).find('[name=name]').val(),
                unitPrice: $(this).find('[name=unitPrice]').val(),
                quantity: $(this).find('[name=sellQuantity]').val(),
                freeQuantity: $(this).find('[name=freeQuantity]').val(),
                subTotal: $(this).find('[name=subTotal]').val()
            }
        }).get();
        console.log(json);
        // $.post("/sales-order", json);

        $.ajax({
            url: "/sales-order",
            type: "POST",
            contentType: "application/json",
            data: {orderList: json},
            success: function (result) {
                console.log(result);
                $(".result").html("result");
            }, error: function (error) {
                console.log(error);
            }

        });
        return false; // added to stay on the page for testing purpose
    });

    $("sellQuantity").on('change', function () {
        // alert( $(this).val() );
        // cosole.dir($(this).parent('tr'));

    });

    $('input[name=sellQuantity]').change(function () {
        console.log("onchange");
        console.log($(this).parent().parent().find('[name=unitPrice]').val());
        const unitPrice = $(this).parent().parent().find('[name=unitPrice]').val();
        const sellQuantity = $(this).val();

        const subTotal = parseFloat(unitPrice) * parseFloat(sellQuantity);
        $(this).parent().parent().find('[name=subTotal]').val(subTotal);
    });


})(jQuery);


