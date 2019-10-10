var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) == '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}

var chartofaccounts = {}, AccountChartObj,
    REQUEST_IN_PROGRESS = "request_in_progress";
var availbalance;

function logoutFormatter(value, row, index) {
    return [
        '<button type="button" class="remove btn btn-sm btn-danger" title="Delete">',
        '<i class="now-ui-icons users_single-02"></i> Click To logout',
        '</button>'
    ].join('');
}

//Hides the div class when you Check "Withdrawal checkbox"; hideElement is defined in site.css and div class of view

function CheckedLodgement() {
    debugger;
    var result = $("input[name ='lodgementWithdrawal']:checked").val();
    if (result == "lodgement") {
        $("#ShowCashCheque").show();

    }
}

function CashLodgemntView() {
    debugger;
    var cash = $("#cash:checked").val();
    if (cash == "cash") {
        $("#lodgmentcashview").show();
        $(".row").show();
        $("#chequetypeView").hide();
    }

}

function ChequeLodgmentCheque() {
    debugger
    var cheque = $("#cheque:checked").val();
    if (cheque == "cheque") {
        $("#lodgmentcashview").show();
        $("#chequetypeView").show();
        // $("#chequetypeView").hide();
    }
}

function CheckWithdrawalView() {
    debugger
    var result2 = $("input[name ='lodgementWithdrawal']:checked").val();
    if (result2 == "withdrawal") {
        $(".row").show();
        $("#HideByWithdrawalTrigger").show();
        $("#ShowCashCheque").show();
        $("#withdrawalcheque").show();

        $("#lodgmentcashview").hide();
        $("#chequetypeView").hide();


    }
}



$(document).ready(function () {
    $("#singlecheque").change(function () {
        $("#HideBysinglecheque").toggle();
    });
});

$(document).ready(function () {
    $("#multiplecheque").click(function () {
        $("#HideBymultiplecheque").toggle(".row");
    });

});


$(document).ready(function () {
    $("#chequeexcelupload").click(function () {
        $("#HideByExcelUpload").toggle(".row");
    });
});

//Hides the div class when you Check "multiplecheque"; hideElement is defined in site.css and div class of view
$("input[name='multiplecheque']").change(function () {
    debugger;
    if ($("input[name='multiplecheque']:checked").val()) {

        $('#HideBymultiplecheque').removeClass('hideElement1');
        $(".row").show();
        $("#HideBymultiplecheque").show();
    }
    else {
        $('#HideBymultiplecheque').addClass('hideElement1');
        $(".row").show();
        $("#HideBymultiplecheque").show();
    }
});

//Hides the div class when you Check "uploadcheque"; hideElement is defined in site.css and div class of view
$("input[name='chequeexcelupload']").change(function () {
    debugger;
    if ($("input[name='chequeexcelupload']:checked").val()) {

        $('#HideByExcelUpload').removeClass('hideElement2');
        $(".row").show();
        $("#HideByExcelUpload").show();
    }
    else {
        $('#HideByExcelUpload').addClass('hideElement2');
        $(".row").show();
        $("#HideByExcelUpload").show();
        $("#HideBysinglecheque").hide();
        $("#HideBymultiplecheque").hide();
    }
});


function CheckSingleUpload() {
    debugger
    var singleresult = $("input[name ='singlemultipleexcelupload']:checked").val();
    if (singleresult == "singlecheque") {
        $(".row").show();
        $("#HideBysinglecheque").show();
        $("#HideBymultiplecheque").hide();
        $("#HideByExcelUpload").hide();

    }
}


function singlechechDrop() {
    $("#singlecheque").click(function () {
        if ($("#HideBysinglecheque").is(":checked")) {
            $("#HideBysinglecheque").show();
            $(".row").show();
            $("#HideBymultiplecheque").hide();
            $("#HideByExcelUpload").hide();
        }
        else {
            $(".row").hide();
            $("#HideBysinglecheque").hide();
            $("#HideByExcelUpload").hide();
            $("#HideBymultiplecheque").hide();
        }
        if ($("#HideBysinglecheque").is(":unchecked")) {
            $("#HideBysinglecheque").hide();
            $(".row").hide();
            $("#HideBymultiplecheque").hide();
            $("#HideByExcelUpload").hide();
        }
    });
}




$(document).ready(function ($) {
    $(".modal").perfectScrollbar();
    initSelectTwoConfig();
    initEventListeners();
});

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}



function initSelectTwoConfig() {
    $.fn.select2.defaults.set("theme", "bootstrap4");
    $.fn.select2.defaults.set("dropdownParent", $(".modal").first());
    $.fn.select2.defaults.set("width", "100%");
    $.fn.select2.defaults.set("allowClear", true);
    var form = $("#frmCashtransfer");

    $.ajax(url_path + "/../../TellerAndTill/LoadChartOfAccountDetails")
        .then(function (response) {
            form.find("#ddlDebitGLNumber").select2({
                placeholder: "Select GL Number",
                data: response
            });
            //form.find("#chargeglid").select2({
            //    placeholder: "Select ledger",
            //    data: response
            //});
            $.each(response, function (index, item) {
                chartofaccounts[item.id] = item.text;
            });
            initDataTable();
        });


    // Event Listeners
    $(document).on("select2:open", function () {
        $('.select2-results__options').perfectScrollbar();
    });


    $("#ddlDebitGLNumber").on("select2:select", function (e) {
        debugger
        var datas = e.params.data;
        $('#debitGLName').val(datas.accountname);
        $('#creditGLName').val(datas.accountname);
        $('#debitGLNum').val(datas.accountId);
        $('#creditGLNum').val(datas.accountId);
        $('#debitGLBalance').val(datas.availablebalance);
        $('#creditGLBalance').val(datas.availablebalance);
        $('#debitProduct').val(datas.accountId);
        $('#creditProduct').val(datas.accountId);

        $('#ddlDebitGLNumber').val(null).trigger('change.select2');
        availbalance = datas.availablebalance;

    }):
    }

/

  

function initEventListeners() {
            var form = $("#frmCashtransfer");

            form.find("#ddlDebitGLNumber")
                .on("select2:select", function (e) {
                    utilities.clearDetails();

                    // request account info
                    $.ajax(url_path + "/../LoadChartOfAccountDetails/"
                        + e.params.data.id)
                        .then(function (response) {
                            // store values
                            AccountObj = {};
                            AccountObj.name = response.accountname;
                            AccountObj.number = response.accountname;
                            AccountObj.number = response.accountId;
                            AccountObj.accountId = response.accountId;
                            AccountObj.balance = response.balance;
                            AccountObj.balance = response.balance;


                        });
                })
        }


$('#debitCreditNaration').change(function () {
            debugger
            $('#creditNaration').val($(this).val());
        });

    $('#debitAmount').change(function () {
        $('#creditAmount').val($(this).val());
    });




    $('.datetimepicker').datetimepicker({
        format: "YYYY-MM-DD",
        icons: {
            time: "now-ui-icons tech_watch-time",
            date: "now-ui-icons ui-1_calendar-60",
            up: "fa fa-chevron-up",
            down: "fa fa-chevron-down",
            previous: 'now-ui-icons arrows-1_minimal-left',
            next: 'now-ui-icons arrows-1_minimal-right',
            today: 'fa fa-screenshot',
            clear: 'fa fa-trash',
            close: 'fa fa-remove'
        }
    });


    function clearForm() {
        var form = $("#frmCashtransfer");
        form.trigger("reset");
        form.find("select").trigger("change");
        utilities.clearDetails();
        //form.find("#amount").trigger("change");
    }

    window.tellerLogoutEvents = {

    }  