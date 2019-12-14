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
        const date = $('.date').val();
        const discount = $('.discount').val();
        const customerName = $('.customerName').val();
        if (customerName.trim() === "") {
            alert("Customer name must not be empty");
            return false;
        }
        const voucherNumber = $('.voucherNumber').val();
        const json = $('.sales-order-table tr:gt(0)').map(function () {
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
                    soldQuantity: (parseInt(it.quantity) + parseInt(it.freeQuantity))
                })
            });

        console.log("new iob");
        console.log(salesOrderObj);


        const requestJson = {
            salesOrderObj: salesOrderObj,
            productIdAndSoldQuantity: productIdAndSoldQuantity,
            date: date,
            customerName: customerName,
            voucherNumber: voucherNumber,
            discount: discount
        };

        console.log("requestJson");
        console.log(requestJson);


        $.ajax({
            url: "/sales-order",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(requestJson),
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

