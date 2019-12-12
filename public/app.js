(function ($) {
    console.log("test");

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
        console.log(JSON.stringify(json));

        const salesOrderObj = {};
        const productIdAndSoldQuantity = [];
        json
            .filter(it => parseInt(it.quantity) != 0)
            .forEach(it => {
                salesOrderObj[it.id] = {
                    id: it.id,
                    itemName: it.itemName,
                    unitPrice: it.unitPrice,
                    quantity: it.quantity,
                    freeQuantity: it.freeQuantity,
                    subTotal: it.subTotal
                };
                productIdAndSoldQuantity.push({
                    productId: it.id,
                    soldQuantity: it.quantity
                })
            });

        console.log("new iob");
        console.log(salesOrderObj);


        /*const newObj = json.filter(it=> parseInt(it.quantity) != 0);


        const salesOrderObj = {};
        console.log("newObj");
        console.log(newObj);
        newObj.forEach(each => {
            "id" : ""
        });*/
        // $.post("/sales-order", json);
        const requestBody = {
            salesOrder: json
        };
        $.ajax({
            url: "/sales-order",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                salesOrderObj: salesOrderObj,
                productIdAndSoldQuantity: productIdAndSoldQuantity
            }),
            success: function (result) {
                console.log(result);
                $(".result").html("Data saved");
                setTimeout(function(){
                    console.log("delaying 5 second")
                }, 5000);
                top.location.href = '/';
            }, error: function (error) {
                console.log(error);
                $(".result").html("Data saved error see log");
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


