﻿var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) === '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}

var transactionsObj = {}, returnTracker;
//    REQUEST_IN_PROGRESS = "request_in_progress";


$(document).ready(function ($) {

    //initFormValidations();

    $('#btnTransactOperations').on("click", function () {
        addBasicInfoTransaction();
    });
    
    $('#btnWithdrawalTransactOperations').on("click", function () {
        updateWithdrawalTransaction();
    });

    $('#btnAddSingleChequeLodgement').on("click", function () {
        addSingleChequeLodgement();
    });
    $('#btnAddMultipleCheque').on("click", function () {
        addMultipleCheque();
    });

    $('#btnAddExcelUpload').on("click", function () {
        addChequeUpload();
    });

    $('#btnAddWithdrawal').on("click", function () {
        addChequeWithdrawal();
    }); 

    $('#ddlAcctNumber').on("select2:selecting", function () {
        getAccountBalance();
    });
});

function logoutFormatter(value, row, index) {
    return [
        '<button type="button" class="remove btn btn-sm btn-danger" title="Delete">',
        '<i class="now-ui-icons users_single-02"></i> Click To logout',
        '</button>'
    ].join('');
}



$(document).ready(function ($) {
    $(".modal").perfectScrollbar();
    $.fn.select2.defaults.set("theme", "bootstrap4");
    $.fn.select2.defaults.set("dropdownParent", $(".modal").first());
    $.fn.select2.defaults.set("width", "100%");
    $.fn.select2.defaults.set("allowClear", true);
    LodgementChange();
});


/*function initFormValidations() {
    jQuery.validator.setDefaults({
        onfocusout: false,
        onkeyup: false,
        onclick: false,
        normalizer: function (value) {
            // Trim the value of every element
            // before validation
            return $.trim(value);
        },
        errorPlacement: function (error, element) {
            $.notify({
                icon: "now-ui-icons travel_info",
                message: error.text()
            }, {
                    type: "danger",
                    placement: {
                        from: "top",
                        align: "right"
                    }
                });
        }
    });


    $("#frmPerformtransaction").validate({
        rules: {
            transDepositorPhone: {
                number: true
            },
            transDepositSlipNo: {
                number: true
            },
            //amountFigure: {
           //     decimal: true
           // },
        },

        messages: {

            ddlAcctNumber: { required: "Select Acct No is required" },

            transDepositorName: { required: "Depositor Name is required" },

            transDate: { required: "Transaction date is required" },

            depositorAddress: { required: "Depositor's address date is required" },

            


        },
        ignore: ":hidden:not(.always-validate)"
    });

}*/

function getAccountBalance() {

    debugger

    var accountNumber = $("#ddlAcctNumber").val();

    $.ajax({
        url: '../TellerAndTill/getCustomerCasaBalance/',
        data: { accountNumber },
        type: 'GET',
        dataType: "json",

        success: function (result) {

            if (result.toString !== '' && result !== null) {

                console.log(result);
                $("#customerBalanceFigure").val(result);



            }
            else {
                //swal({ title: 'Retrieve Customer Balance', text: 'Something went wrong: </br>' + result.toString(), type: 'error' }).then();

            }


        },
        error: function (e) {
            swal({ title: 'Retrieve Customer Balance', text: 'Customer Balance Retrieval encountered an error', type: 'error' }).then();

        }
    });

}


function RemoveTellerPosting(url_path) {
    //var result = url_path.subString(16, 29);
    var subStr = url_path.slice(0, 14);
    return subStr;
}

function LodgementChange() {
   // $(document).ready(function () {
        //debugger
        $("#ddlAcctNumber").select2({
            theme: "bootstrap4",
            placeholder: "Loading..."

        });
        $.ajax({
            url: "../TellerAndTill/GetCustomerAccountNumber",
        }).then(function (response) {
            //debugger
            $("#ddlAcctNumber").select2({
                theme: "bootstrap4",
                placeholder: "Search/Select Account no.",  
                width: '100%',
                data: response,
                dropdownParent: $("#AddNewTransferOperation.modal"),
            });
            });    //for dropdown list control ends here
              



                //$("#ddlAcctNumber").on("select2:select", function (e) {
                //    debugger
                //    var datas = e.params.data;
                //    $('#ddlAcctNumber').val(datas.accountId);

                //    $('#ddlAcctNumber').val(null).trigger('change.select2');
                //    availbalance = datas.availablebalance;
                //    $("#ddlAcctNumber").select2({
                //        theme: "bootstrap4",
                //        placeholder: "Loading..."
                //    });
                //    //@TODO
                //    $.ajax({
                //        url: "../TellerAndTill/loadGLBalance",
                //        data: { AccountID: datas.accountId },
                //        type: "GET",
                //        cache: false,
                //    })
                //        .then(function (response) {
                //            $("#cashierLabel2").val(response);
                //            balAccounts = response;
                //        });

                //});
           
       

  //  });

}




function singlechequeDocument() {
    var singlechequeFile = $("#chequeFileUpload").get(0).files;
    debugger;
    if (!singlechequeFile) {
        return;
    }

    var acctNo = $('#ddlAcctNumber').val();
    var singlechequeData = new FormData();
    singlechequeData.append("AccountId", acctNo);

    for (var singlechequeCounter = 0; singlechequeCounter < singlechequeFile.length; singlechequeCounter++) {
        singlechequeData.append("ImageFile", singlechequeFile[singlechequeCounter]);
    }
    
    //}

    //debugger;
    $.ajax("../TellerAndTill/AddExcelChequeUpload/", {
        method: "POST",
        contentType: false,
        processData: false,
        data: singlechequeData,
        success: function (data) {
            swal({ title: 'Add  details & cheque upload', text: 'Details added successfully!', type: 'success' }).then(function () { window.location.reload(); });

            $('#AddNewTransferOperation').modal('hide');
        },
        error: function (e) {
            swal({ title: 'Details & cheque upload', text: 'Details encountered an error', type: 'error' }).then(function () { clear(); });

        }
    });
}

function chequeUploadDocument() {
    var exceluploadDataFile = $("#chequetransUpload").get(0).files;
    // var productFile = $("#productRelatedDocUpload").get(0).files;
    //debugger;
    if (!exceluploadDataFile) {
        return;
    }

    var acctNo = $('#ddlAcctNumber').val();
    var exceluploadData = new FormData();
    exceluploadData.append("AccountId", acctNo);

    for (var exceluploadCounter = 0; exceluploadCounter < exceluploadDataFile.length; exceluploadCounter++) {
        exceluploadData.append("ImageFile", exceluploadDataFile[exceluploadCounter]);
    }
    

    //debugger;
    $.ajax("../TellerAndTill/AddExcelChequeUpload/", {
        method: "POST",
        contentType: false,
        processData: false,
        data: exceluploadData,
        success: function (data) {
            swal({ title: 'Add Cheque upload', text: 'Cheque upload added successfully!', type: 'success' }).then(function () { clear(); });

            $('#AddNewTransferOperation').modal('hide');
        },
        error: function (e) {
            swal({ title: 'Cheque upload', text: 'Cheque upload encountered an error', type: 'error' }).then(function () { clear(); });

        }
    });
}

function chequewithdrawalDocument() {
    var withdrawalchequeDataFile = $("#withrawchequeFileUpload").get(0).files;
   // debugger;
    if (!withdrawalchequeDataFile) {
        return;
    }

    var accountNo = $('#ddlAcctNumber').val();
    var withrawalchequeData = new FormData();
    withrawalchequeData.append("AccountId", accountNo);

    for (var withrawalchequeCounter = 0; withrawalchequeCounter < withdrawalchequeDataFile.length; withrawalchequeCounter++) {
        withrawalchequeData.append("ImageFile", withdrawalchequeDataFile[withrawalchequeCounter]);
    }

    //debugger;
    $.ajax("../TellerAndTill/AddExcelChequeUpload/", {
        method: "POST",
        contentType: false,
        processData: false,
        data: withrawalchequeData,
        success: function (data) {
            swal({ title: 'Add Cheque upload', text: 'Withdrawal & file upload added successfully!', type: 'success' }).then(function () { window.location.reload(); });

            $('#AddNewTransferOperation').modal('hide');
        },
        error: function (e) {
            swal({ title: 'Cheque upload', text: 'Cheque upload encountered an error', type: 'error' }).then(function () { clear(); });

        }
    });
}

//Hides the div class when you Check "Withdrawal checkbox"; hideElement is defined in site.css and div class of view

function CheckedLodgement() {
    debugger;
    var result = $("input[name ='transactiontype']:checked").val();
    if (result === "lodgement") {
        $("#ShowCashCheque").show();
        $("#ShowCashChequeWithdrawal").hide(); 
        $('input[name="cash"]').prop('checked', false);
       
        $('input[name="cashchequewithdrawal"]').prop('checked', false);

         $("#lodgmentcashview").hide();
        $("#chequetypeView").hide();
        $("#withdrawalcashview").hide();
        $("#withdrawalchequeview").hide();
        
        $("#HideByExcelUpload").hide();
        $('input[name="chequeexcelupload"]').prop('checked', false);
        $("#HideBysinglecheque").hide();
        $('input[name="singlecheque"]').prop('checked', false);
        $("#withdrawalHideBysinglecheque").hide();
        $('input[name="withdrawalsinglecheque"]').prop('checked', false);
        $("#withdrawalHideByExcelUpload").hide();
        
    } else {
        $("#ShowCashCheque").hide();
    }
}

function CheckedWithdrawalView() {
    debugger
    var result2 = $("input[name ='transactiontype']:checked").val();
    if (result2 === "withdrawal") {
        //$(".row").show();
      
       // $("#ShowCashChequeWithdrawal").show();
       // $("#withdrawalcheque").show();
         $("#ShowCashCheque").show();
         $('input[name="cash"]').prop('checked', false);
          $('input[name="cashchequewithdrawal"]').prop('checked', false);

       $("#lodgmentcashview").hide();
        $("#chequetypeView").hide();
        $("#withdrawalcashview").hide();
        $("#withdrawalchequeview").hide();
        
        $("#HideByExcelUpload").hide();
        $('input[name="chequeexcelupload"]').prop('checked', false);
        $("#HideBysinglecheque").hide();
        $('input[name="singlecheque"]').prop('checked', false);
        $("#withdrawalHideBysinglecheque").hide();
        $('input[name="withdrawalsinglecheque"]').prop('checked', false);
       // withdrawalsinglecheque
    }
}

function CashLodgemntView() {
    debugger;
    var cash = $("#cash:checked").val();
    var result = $("input[name ='transactiontype']:checked").val();
    if (cash === "cash" && result === "lodgement") {
        $("#lodgmentcashview").show();
        //$(".row").show();
        $("#chequetypeView").hide();
        /*$("#withdrawalcashview").hide();
        $("#withdrawalchequeview").hide();*/
        $("#HideByExcelUpload").hide();
        $('input[name="chequeexcelupload"]').prop('checked', false);
        $("#HideBysinglecheque").hide();
        $('input[name="singlecheque"]').prop('checked', false);
        /*$("#withdrawalHideBysinglecheque").hide();
        $('input[name="withdrawalsinglecheque"]').prop('checked', false);*/

    }else {
     
       var result2 = $("input[name ='transactiontype']:checked").val();
       if (result2 === "withdrawal") {

           //alert("good one!");
           $("#withdrawalcashview").show();
           $("#withdrawalchequeview").hide();
           $("#withdrawalHideBysinglecheque").hide();
           $('input[name="withdrawalsinglecheque"]').prop('checked', false);
           var accountNumber = $("#ddlAcctNumber").val();

           $.ajax({
               url: '../TellerAndTill/getCustomerCasaBalance/',
               data: { accountNumber },
               type: 'GET',
               dataType: "json",

               success: function (result) {

                   if (result.toString !== '' && result !== null) {

                       console.log(result);
                       $("#customerBalanceFigure").val(result);
                       

                      
                   }
                   else {
                       //swal({ title: 'Retrieve Customer Balance', text: 'Something went wrong: </br>' + result.toString(), type: 'error' }).then();
                       
                   }
                  

               },
               error: function (e) {
                   swal({ title: 'Retrieve Customer Balance', text: 'Customer Balance Retrieval encountered an error', type: 'error' }).then();
                  
               }
           });

         }

      }

}

function ChequeLodgmentCheque() {
    debugger
    var cheque = $("#cheque:checked").val();
    var result = $("input[name ='transactiontype']:checked").val();
    if (cheque === "cheque" && result === "lodgement") {
        $("#lodgmentcashview").hide();
        $("#chequetypeView").show();
        // $("#chequetypeView").hide();
    } else {
     
       var result2 = $("input[name ='transactiontype']:checked").val();
       if (result2 === "withdrawal") {

           alert("good one!");
           $("#withdrawalchequeview").show();
           $("#withdrawalcashview").hide();

         }

      }
}



function CashWithdrawalView(){


}

function ChequeWithdrawalView(){


}



$(document).ready(function () {

    $("#singlecheque").change(function () {
        debugger
        $("#HideBysinglecheque").toggle();
        if ($("#chequeexcelupload:checked").val()) {
            $("#HideByExcelUpload").hide();
            $('input[name="chequeexcelupload"]').prop('checked', false);
        }
    });
});

$(document).ready(function () {

    $("#withdrawalsinglecheque").change(function () {
        debugger
        $("#withdrawalHideBysinglecheque").toggle();
        if ($("#withdrawalchequeexcelupload:checked").val()) {
            $("#withdrawalHideByExcelUpload").hide();
            $('input[name="withdrawalchequeexcelupload"]').prop('checked', false);
        }
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
        if ($("#singlecheque:checked").val()) {
            $("#HideBysinglecheque").hide();
            $('input[name="singlecheque"]').prop('checked', false);
        }
    });
});
//withdrawalchequeexcelupload

$(document).ready(function () {
    $("#withdrawalchequeexcelupload").click(function () {
        $("#withdrawalHideByExcelUpload").toggle(".row");
        if ($("#withdrawalsinglecheque:checked").val()) {
            $("#withdrawalHideBysinglecheque").hide();
            $('input[name="withdrawalsinglecheque"]').prop('checked', false);
        }
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
/*$("input[name='chequeexcelupload']").change(function () {
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
});*/


function CheckSingleUpload() {
    //debugger
    var singleresult = $("input[name ='singlemultipleexcelupload']:checked").val();
    if (singleresult === "singlecheque") {
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


function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}


/*$('#debitCreditNaration').change(function () {
    debugger
    $('#creditNaration').val($(this).val());
});

$('#debitAmount').change(function () {
    $('#creditAmount').val($(this).val());
});*/



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
    var form = $("#frmPerformtransaction");
    form.trigger("reset");
    form.find("select").trigger("change");
    //utilities.clearDetails();
    //form.find("#amount").trigger("change");
}

window.tellerLogoutEvents = {
   
};

function reloadpage() {
    location.reload();
 
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}




function addBasicInfoTransaction() {

   

    $('#frmPerformtransaction').validate({

        debug: true,

        onfocusout: false,
        onkeyup: false,
        onclick: false,
        normalizer: function (value) {
            // Trim the value of every element
            // before validation
            return $.trim(value);
        },
        
        errorPlacement: function (error, element) {
            $.notify({
                icon: "now-ui-icons travel_info",
                message: error.text(),
            }, {
                    type: 'danger',
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });
        },

        rules: {
            transDepositorPhone: {
                required: true
         
            },
            transDepositSlipNo: {
                required: true,
                number: true
            },
            ddlAcctNumber: {
                required: true
            },
            transDepositorName: {
                required: true
            },
            transDate: {
                required: true
            },
            depositorAddress: {
                required: true
            },
            amountFigure: {
                required: true
            },
        },

        messages: {

            ddlAcctNumber: { required: "Please Select Account Number" },

            transDepositorName: { required: "Depositor Name is required" },

            transDate: { required: "Transaction date is required" },

            depositorAddress: { required: "Depositor's address is required" },

            amountFigure: { required: "Amount to lodge is required" },

            transDepositSlipNo: {
                required: "Deposit Slip Number is required",
                number: "Input not valid, please enter digits only"
            },

            transDepositorPhone: {
                required: "Depositor's Phone Number is required",
                number: "Input not valid, please enter digits only"
            },






        },
       submitHandler: function (form) {
            $("input[type=submit]").attr("disabled", "disabled");
            swal({
                title: "Are you sure?",
                text: "Basic Info will be added!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#ff9800",
                confirmButtonText: "Yes, continue",
                cancelButtonText: "No, stop!",
                showLoaderOnConfirm: true,
                preConfirm: function () {
                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve();
                        }, 4000);
                    });
                }
            }).then(
                function (isConfirm) {
                    if (isConfirm) {
                        $("#btnTransactOperations").attr("disabled", "disabled");

                        //debugger
                        //var ProductAcctNo = $('#ddlAcctNumber').select2("data").text;
                        //var AccountId = $('#ddlAcctNumber').select2("data")[0].text;
                        var AccountId = $('#ddlAcctNumber').val();
                        //var Ref = $('#referenceNum').val();
                        //var DepositorName = $('#transDepositorName').val();
                        var TransactionDate = $('#transDate').val();
                        //var DepositorPhone = $('#transDepositorPhone').val();
                        //var SlipNumber = $('#transDepositSlipNo').val();
                        //var CharheStamp = $('#chargeStampDuty').prop("checked");
                        var DebitAmt = $('#amountFigure').val();
                        //var DepositorAddr = $('#depositorAddress').val();
                        var Description = $('#remark').val();
                        //var Narration = $('#additionalInfo').val();
                        //var MoreDetails = $('#isMoreDetails').prop("checked");

                        //var refNowithdraw = $('#withdrawalRefNumber').val();
                        //var name = $('#withdrawalName').val();
                        //var transdate = $('#withdrawaltransDate').val();
                        var CreditAmt = $('#amountFigure').val();
                        //var forcedebit = $('#withdrawalFoecDebit').prop("checked");
                        //var COT = $('#withdrawalCOT').val();
                        //var chequeslip = $('#withdrawalChequeSlipNo').val();
                        var CurrencyRate = $('#withdrawalCountercheque').val();
                        //var addInfo = $('#withdrawaladdInfo').val();
                       // var remark = $('#withdrawaRemark').val();
                        var LegType = $('#ddlAcctNumber').val();
                        debugger
                        var dt = new Date();
                        var testData = dt.getYear();
                        var ranInt = getRndInteger(100, 1000);


                        console.log(testData);

                        var Ref = "TRN/" + dt.getYear().toString() + "/" + Date.now().toString() + ranInt.toString();

                       //Debit leg 
                        $.ajax({
                            url: '../TellerAndTill/AddLodgement/',
                            type: 'POST',
                            data: {
                                Ref, AccountId, TransactionDate, DebitAmt, Description, CreditAmt: 0, CurrencyRate, LegType
                            },
                            dataType: "json",

                            success: function (result) {

                                if (result.toString !== '' && result !== null) {

                                    transactionsObj = result;
                                    console.log(transactionsObj);
                                   // swal({ title: 'Add lodgement/widthdrawal', text: 'Lodgement/widthdrawal addition completed successfully!', type: 'success' })
                                    //    .then(function () {

                                            //window.location.reload();

                                    //    });

                                   // $('#AddNewTransferOperation').modal('hide');
                                   // returnTracker == true;

                                   
                                    //Counter Party Leg
                                    $.ajax({
                                        url: '../TellerAndTill/AddCounterPartyLodgement/',
                                        type: 'POST',
                                        data: {
                                            Ref: transactionsObj.Ref, AccountId, TransactionDate, DebitAmt, Description, CreditAmt, CurrencyRate, LegType
                                        },
                                        dataType: "json",

                                        success: function (result) {

                                            if (result.toString !== '' && result !== null) {

                                                transactionsObj = result;
                                                console.log(transactionsObj);
                                                swal({ title: 'Add lodgement/widthdrawal', text: 'Lodgement/widthdrawal addition completed successfully!', type: 'success' })
                                                    .then(function () {

                                                        //window.location.reload();

                                                    });

                                                // $('#AddNewTransferOperation').modal('hide');

                                                $('#tellerLoginTable').
                                                    bootstrapTable(
                                                        'refresh', { url: 'listTellerLogin' });

                                                var form = $("#frmPerformtransaction");
                                                form.trigger("reset");
                                                form.find("select").trigger("change");


                                                $("#btnTransactOperations").removeAttr("disabled");
                                            }
                                            else {
                                                //swal({ title: 'Add lodgement and widthdrawal', text: 'Something went wrong: </br>' + result.toString(), type: 'error' }).then(function () { clearForm(); });
                                                //$("#btnTransactOperations").removeAttr("disabled");
                                            }
                                            //  $('#AddNewProductCategory').modal('hide');      //Hides the modal view

                                        },
                                        error: function (e) {
                                            swal({ title: 'Add lodgement and widthdrawal', text: 'Lodgement and widthdrawal operation add encountered an error', type: 'error' }).then(function () { clearForm(); });
                                            $("#btnTransactOperations").removeAttr("disabled");
                                        }
                                    });

                                    $('#tellerLoginTable').
                                        bootstrapTable(
                                            'refresh', { url: 'listTellerLogin' });

                                    var form = $("#frmPerformtransaction");
                                    form.trigger("reset");
                                    form.find("select").trigger("change");


                                    $("#btnTransactOperations").removeAttr("disabled");
                                }
                                else {
                                    swal({ title: 'Add lodgement and widthdrawal', text: 'Something went wrong: </br>' + result.toString(), type: 'error' })
                                        .then(function () { clearForm(); });
                                    //$("#btnTransactOperations").removeAttr("disabled");
                                   
                                }
                                //  $('#AddNewProductCategory').modal('hide');      //Hides the modal view

                            },
                            error: function (e) {
                                swal({ title: 'lodgement and widthdrawal Transactions', text: 'Lodgement and widthdrawal operation encountered an error', type: 'error' }).then(function () { clearForm(); });
                                $("#btnTransactOperations").removeAttr("disabled");
                                return;
                            }
                        });

                        //Counter Party Transaction Leg
                        debugger
                       /* if (returnTracker == true)
                            return;*/


                     

                        //Credit leg
                        $.ajax({
                            url: '../TellerAndTill/AddLodgement/',
                            type: 'POST',
                            data: {
                                Ref, AccountId, TransactionDate, DebitAmt:0, Description, CreditAmt, CurrencyRate, LegType
                            },
                            dataType: "json",

                            success: function (result) {

                                if (result.toString !== '' && result !== null) {
                                    swal({ title: 'Add lodgement/widthdrawal', text: 'Lodgement/widthdrawal transaction completed successfully!', type: 'success' })
                                        .then(function () {

                                            //window.location.reload();

                                        });

                                    // $('#AddNewTransferOperation').modal('hide');

                                    $('#tellerLoginTable').
                                        bootstrapTable(
                                            'refresh', { url: 'listTellerLogin' });

                                    var form = $("#frmPerformtransaction");
                                    form.trigger("reset");
                                    form.find("select").trigger("change");


                                    $("#btnTransactOperations").removeAttr("disabled");
                                }
                                else {
                                    swal({ title: 'Add lodgement and widthdrawal', text: 'Something went wrong: </br>' + result.toString(), type: 'error' }).then(function () { clearForm(); });
                                    $("#btnTransactOperations").removeAttr("disabled");
                                }
                                //  $('#AddNewProductCategory').modal('hide');      //Hides the modal view

                            },
                            error: function (e) {
                                swal({ title: 'Add lodgement and widthdrawal', text: 'Lodgement and widthdrawal operation add encountered an error', type: 'error' }).then(function () { clearForm(); });
                                $("#btnTransactOperations").removeAttr("disabled");
                            }
                        });

                    }
                },

                function (dismiss) {
                    swal('Add lodgement and widthdrawal', 'You cancelled lodgement and widthdrawal add.', 'error');
                    $("#btnTransactOperations").removeAttr("disabled");
                }
            );
        }
    });
}


function updateWithdrawalTransaction() {

       debugger
   
    $('#frmPerformWithdrawaltransaction').validate({

            debug: true,

            onfocusout: false,
            onkeyup: false,
            onclick: false,
            normalizer: function (value) {
                // Trim the value of every element
                // before validation
                return $.trim(value);
            },

            errorPlacement: function (error, element) {
                $.notify({
                    icon: "now-ui-icons travel_info",
                    message: error.text(),
                }, {
                        type: 'danger',
                        placement: {
                            from: 'top',
                            align: 'right'
                        }
                    });
            },

            rules: {
                transWithdrawalPhone: {
                    required: true,
                    /*number: true*/
                },
                withdrawalSlipNo: {
                    required: true,
                    number: true
                },
                ddlAcctNumber: {
                    required: true
                },
                transWithdrawalName: {
                    required: true
                },
                transWithdrawalDate: {
                    required: true
                },
                
                amountWithdrawalFigure: {
                    required: true
                }
            },

            messages: {

                ddlAcctNumber: { required: "Please Select Account Number" },

                transWithdrawalName: { required: "Depositor Name is required" },

                transWithdrawalDate: { required: "Transaction date is required" },

                withdrawalSlipNo: {
                    required: "Deposit Slip Number is required",
                    number: "Input not valid, please enter digits only"
                },

                transWithdrawalPhone: {
                    required: "Depositor's Phone Number is required",
                    number: "Input not valid, please enter digits only"
                },

                amountWithdrawalFigure: { required: "Amount to withdraw is required" },






            },
            submitHandler: function (form) {
                $("input[type=submit]").attr("disabled", "disabled");
                swal({
                    title: "Are you sure?",
                    text: "Withdrawal Transaction will be added!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#ff9800",
                    confirmButtonText: "Yes, continue",
                    cancelButtonText: "No, stop!",
                    showLoaderOnConfirm: true,
                    preConfirm: function () {
                        return new Promise(function (resolve) {
                            setTimeout(function () {
                                resolve();
                            }, 4000);
                        });
                    }
                }).then(
                    function (isConfirm) {
                        if (isConfirm) {
                            $("#btnWithdrawalTransactOperations").attr("disabled", "disabled");

                            
                            var AccountId = $('#ddlAcctNumber').val();
                            
                            var TransactionDate = $('#transWithdrawalDate').val();
                            
                            //var SlipNumber = $('#transDepositSlipNo').val();
                            //var CharheStamp = $('#chargeStampDuty').prop("checked");
                            var DebitAmt = $('#amountWithdrawalFigure').val();
                            //var DepositorAddr = $('#depositorAddress').val();
                            var Description = $('#remark').val();
                            //var Narration = $('#additionalInfo').val();
                            //var MoreDetails = $('#isMoreDetails').prop("checked");

                            //var refNowithdraw = $('#withdrawalRefNumber').val();
                            //var name = $('#withdrawalName').val();
                            //var transdate = $('#transWithdrawalPhone').val();
                            var CreditAmt = $('#amountWithdrawalFigure').val();
                            //var forcedebit = $('#withdrawalFoecDebit').prop("checked");
                            //var COT = $('#withdrawalCOT').val();
                            //var chequeslip = $('#withdrawalChequeSlipNo').val();
                           // var CurrencyRate = $('#withdrawalCountercheque').val();
                            //var addInfo = $('#withdrawaladdInfo').val();
                            // var remark = $('#withdrawaRemark').val();
                            var LegType = $('#ddlAcctNumber').val();
                            debugger
                            var dt = new Date();
                            var testData = dt.getYear();
                            var ranInt = getRndInteger(100, 1000);


                            console.log(testData);

                            var Ref = "TRN/" + dt.getYear().toString() + "/" + Date.now().toString() + ranInt.toString();

                            //Debit leg 
                            $.ajax({
                                url: '../TellerAndTill/AddLodgement/',
                                type: 'POST',
                                data: {
                                    Ref, AccountId, TransactionDate, DebitAmt: 0, Description, CreditAmt, LegType
                                },
                                dataType: "json",

                                success: function (result) {

                                    if (result.toString !== '' && result !== null) {

                                       transactionsObj = result;
                                       // console.log(transactionsObj);
                                        // swal({ title: 'Add lodgement/widthdrawal', text: 'Lodgement/widthdrawal addition completed successfully!', type: 'success' })
                                        //    .then(function () {

                                        //window.location.reload();

                                        //    });

                                        // $('#AddNewTransferOperation').modal('hide');
                                        // returnTracker == true;


                                        //Counter Party Leg
                                        $.ajax({
                                            url: '../TellerAndTill/AddCounterPartyWithdrawalLodgement/',
                                            type: 'POST',
                                            data: {
                                                Ref: transactionsObj.Ref, AccountId, TransactionDate, DebitAmt, Description, CreditAmt, LegType
                                            },
                                            dataType: "json",

                                            success: function (result) {

                                                if (result.toString !== '' && result !== null) {

                                                    transactionsObj = result;
                                                    console.log(transactionsObj);
                                                    swal({ title: 'Add lodgement/widthdrawal', text: 'Lodgement/widthdrawal addition completed successfully!', type: 'success' })
                                                        .then(function () {

                                                            //window.location.reload();

                                                        });

                                                    // $('#AddNewTransferOperation').modal('hide');

                                                   /* $('#tellerLoginTable').
                                                        bootstrapTable(
                                                            'refresh', { url: 'listTellerLogin' });*/

                                                    var form = $("#frmPerformWithdrawaltransaction");
                                                    form.trigger("reset");
                                                    form.find("select").trigger("change");


                                                    $("#btnWithdrawalTransactOperations").removeAttr("disabled");
                                                }
                                                else {
                                                    //swal({ title: 'Add lodgement and widthdrawal', text: 'Something went wrong: </br>' + result.toString(), type: 'error' }).then(function () { clearForm(); });
                                                    //$("#btnTransactOperations").removeAttr("disabled");
                                                }
                                                //  $('#AddNewProductCategory').modal('hide');      //Hides the modal view

                                            },
                                            error: function (e) {
                                                swal({ title: 'Add lodgement and widthdrawal', text: 'Lodgement and widthdrawal operation add encountered an error', type: 'error' }).then(function () { clearForm(); });
                                                $("#btnWithdrawalTransactOperations").removeAttr("disabled");
                                            }
                                        });

                                       

                                        var form = $("#frmPerformWithdrawaltransaction");
                                        form.trigger("reset");
                                        form.find("select").trigger("change");


                                        $("#btnWithdrawalTransactOperations").removeAttr("disabled");
                                    }
                                    else {
                                        swal({ title: 'Add lodgement and widthdrawal', text: 'Something went wrong: </br>' + result.toString(), type: 'error' })
                                            .then(function () { clearForm(); });
                                        //$("#btnTransactOperations").removeAttr("disabled");

                                    }
                                    //  $('#AddNewProductCategory').modal('hide');      //Hides the modal view

                                },
                                error: function (e) {
                                    swal({ title: 'lodgement and widthdrawal Transactions', text: 'Lodgement and widthdrawal operation encountered an error', type: 'error' }).then(function () { clearForm(); });
                                    $("#btnWithdrawalTransactOperations").removeAttr("disabled");
                                    return;
                                }
                            });

                            //Counter Party Transaction Leg
                            debugger
                            /* if (returnTracker == true)
                                 return;*/




                            //Credit leg
                            $.ajax({
                                url: '../TellerAndTill/AddLodgement/',
                                type: 'POST',
                                data: {
                                    Ref, AccountId, TransactionDate, DebitAmt, Description, CreditAmt: 0, LegType
                                },
                                dataType: "json",

                                success: function (result) {

                                    if (result.toString !== '' && result !== null) {
                                        swal({ title: 'Add lodgement/widthdrawal', text: 'Lodgement/widthdrawal transaction completed successfully!', type: 'success' })
                                            .then(function () {

                                                //window.location.reload();

                                            });

                                        // $('#AddNewTransferOperation').modal('hide');

                                        $('#tellerLoginTable').
                                            bootstrapTable(
                                                'refresh', { url: 'listTellerLogin' });

                                        var form = $("#frmPerformWithdrawaltransaction");
                                        form.trigger("reset");
                                        form.find("select").trigger("change");


                                        $("#btnWithdrawalTransactOperations").removeAttr("disabled");
                                    }
                                    else {
                                        swal({ title: 'Add lodgement and widthdrawal', text: 'Something went wrong: </br>' + result.toString(), type: 'error' }).then(function () { clearForm(); });
                                        $("#btnWithdrawalTransactOperations").removeAttr("disabled");
                                    }
                                    //  $('#AddNewProductCategory').modal('hide');      //Hides the modal view

                                },
                                error: function (e) {
                                    swal({ title: 'Add lodgement and widthdrawal', text: 'Lodgement and widthdrawal operation add encountered an error', type: 'error' }).then(function () { clearForm(); });
                                    $("#btnWithdrawalTransactOperations").removeAttr("disabled");
                                }
                            });

                        }
                    },

                    function (dismiss) {
                        swal('Add lodgement and widthdrawal', 'You cancelled lodgement and widthdrawal add.', 'error');
                        $("#btnWithdrawalTransactOperations").removeAttr("disabled");
                    }
                );
            }
        });
    




}


function addSingleChequeLodgement() {
    $('#frmSingleChequeLodgementTransaction').validate({

        rules: {
            singlechequenamelodgement: {
                required: true,
                /*number: true*/
            },
            singlechequenolodgement: {
                required: true,
                number: true
            },
            singlechequeamountlodgement: {
                required: true
            },
            singlechequedatelodgement: {
                required: true
            },
            ddlAcctNumber: {
                required: true
            },
           
            transWithdrawalDate: {
                required: true
            },

            amountWithdrawalFigure: {
                required: true
            }
        },



        messages: {
            singlechequenamelodgement: { required: "Name on cheque is required" },
            singlechequedatelodgement: { required: "Date is required" },
            singlechequeamountlodgement: {
                required: "please enter an amount"
            },
            singlechequenolodgement: {
                required: "Please enter cheque number",
                number: "cheque value entered is not a valid number"
            },
            branchcheque: { required: "Select branche is required" },
            cheqtype: { required: "Select cheque type is required" },
            
           

        },
        errorPlacement: function (error, element) {
            $.notify({
                icon: "now-ui-icons travel_info",
                message: error.text(),
            }, {
                    type: 'danger',
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });
        },
        submitHandler: function (form) {
            $("btnAddSingleChequeLodgement").attr("disabled", "disabled");
            swal({
                title: "Are you sure?",
                text: "Single cheque details will be added!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#ff9800",
                confirmButtonText: "Yes, continue",
                cancelButtonText: "No, stop!",
                showLoaderOnConfirm: true,
                preConfirm: function () {
                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve();
                        }, 4000);
                    });
                }
            }).then(
                function (isConfirm) {
                    if (isConfirm) {
                        //$("#btnAddSingleCheque").attr("disabled", "disabled");

                        //debugger
                        var AccountId = $('#ddlAcctNumber').val();
                        var chequeAmount = $('#singlechequeamountlodgement').val();
                        //var Productcategoryid = $('#cheqlocation').val();
                       // var ChequeBank = $('#bankcheque').val();
                        //var BankLocation = $('#branchcheque').val();
                        // var Phone = $('#cheqtype').val();
                        var ChequeNo = $('#inglechequenolodgement').val();
                        var Date = $('#inglechequedatelodgement').val();
                        //var Amount = $('#chequecomment').val();

                        $.ajax({
                            url: '../TellerAndTill/AddSingleChequeOperation',
                            type: 'POST',
                            data: { AccountId, AmtDeposited1: chequeAmount, ChequeBank, BankLocation, ChequeNo, ActualDate:Date },
                            dataType: "json",

                            success: function (result) {

                                if ($('#chequeFileUpload').val() !== '') {
                                    singlechequeDocument();                                                
                                }
                                else {
                                    swal({ title: 'Add single cheque', text: 'Something went wrong: </br>' + result.toString(), type: 'error' })
                                        .then(function () { clearForm(); });
                                    $("#btnAddSingleCheque").removeAttr("disabled");
                                }


                            },
                            error: function (e) {
                                swal({ title: 'Add single cheque', text: 'Single cheque add encountered an error', type: 'error' }).then(function () { clearForm(); });
                                $("#btnAddSingleCheque").removeAttr("disabled");
                            }
                        });
                    }
                },

                function (dismiss) {
                    swal('Add single cheque', 'You cancelled single cheque add.', 'error');
                    $("#btnAddSingleCheque").removeAttr("disabled");
                }
            );
        }
    });
}

function addMultipleCheque() {
    $('#frmPerformtransaction').validate({
        messages: {
            noofcheque: { required: "Select No of cheque" },
            bankchequemultiple: { required: "Bank is required" },
            branchchequemultiple: { required: "Branchn is required" },
            chequecommentmuliple: { required: "Select cheque type is required" },

        },
        errorPlacement: function (error, element) {
            $.notify({
                icon: "now-ui-icons travel_info",
                message: error.text(),
            }, {
                    type: 'danger',
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });
        },
        submitHandler: function (form) {
            $("input[type=submit]").attr("disabled", "disabled");
            swal({
                title: "Are you sure?",
                text: "Multiple cheque details will be added!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#ff9800",
                confirmButtonText: "Yes, continue",
                cancelButtonText: "No, stop!",
                showLoaderOnConfirm: true,
                preConfirm: function () {
                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve();
                        }, 4000);
                    });
                }
            }).then(
                function (isConfirm) {
                    if (isConfirm) {
                        $("#btnAddMultipleCheque").attr("disabled", "disabled");

                       // debugger
                        //var Id = $('#noofcheque').val();
                        var ChequeBank = $('#bankchequemultiple').val();
                        //var Productcategoryname = $('#branchchequemultiple').val();
                        var BankLocation = $('#cheqlocationmultiple').val();
                        var Narration = $('#chequecommentmuliple').val();

                        $.ajax({
                            url: 'TellerAndTill/AddMultipleChequeOperation',
                            type: 'POST',
                            data: { ChequeBank, BankLocation, Narration },
                            dataType: "json",

                            success: function (result) {

                                if (result.toString !== '' && result !== null) {
                                    swal({ title: 'Add multiple cheque Application', text: 'Multiple cheque add completed successfully!', type: 'success' }).then(function () { clear(); });

                                    $('#tellerLoginTable').
                                        bootstrapTable(
                                            'refresh', { url: 'TellerAndTill/listTellerLogin' });

                                    $("#btnAddMultipleCheque").removeAttr("disabled");
                                }
                                else {
                                    swal({ title: 'Add multiple cheque', text: 'Something went wrong: </br>' + result.toString(), type: 'error' }).then(function () { clearForm(); });
                                    $("#btnAddMultipleCheque").removeAttr("disabled");
                                }


                            },
                            error: function (e) {
                                swal({ title: 'Add multiple cheque', text: 'Multiple cheque add encountered an error', type: 'error' }).then(function () { clearForm(); });
                                $("#btnAddMultipleCheque").removeAttr("disabled");
                            }
                        });
                    }
                },

                function (dismiss) {
                    swal('Add multiple cheque', 'You cancelled multiple cheque add.', 'error');
                    $("#btnAddMultipleCheque").removeAttr("disabled");
                }
            );
        }
    });
}


function addChequeUpload() {
    $('#frmPerformtransaction').validate({
        messages: {
            chequeexcelupload: { required: "Select cheque No is required" },
            chequetranscommentupload: { required: "comment box is required" }

        },
        errorPlacement: function (error, element) {
            $.notify({
                icon: "now-ui-icons travel_info",
                message: error.text(),
            }, {
                    type: 'danger',
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });
        },
        submitHandler: function (form) {
            $("input[type=submit]").attr("disabled", "disabled");
            swal({
                title: "Are you sure?",
                text: "Cheque upload details will be added!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#ff9800",
                confirmButtonText: "Yes, continue",
                cancelButtonText: "No, stop!",
                showLoaderOnConfirm: true,
                preConfirm: function () {
                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve();
                        }, 4000);
                    });
                }
            }).then(
                function (isConfirm) {
                    if (isConfirm) {
                        $("#btnAddExcelUpload").attr("disabled", "disabled");

                       // debugger
                        var BankLocation = $('#chequeexcelupload').val();
                        var Narration = $('#chequetranscommentupload').val();

                        $.ajax({
                            url: 'TellerAndTill/AddChequeUploadOperation',
                            type: 'POST',
                            data: { BankLocation, Narration },
                            dataType: "json",

                            success: function (result) {

                                if ($('#chequetransUpload').val() !== '') {
                                    chequeUploadDocument();                 //TODO, create function for image upload                                
                                }
                                else {
                                    swal({ title: 'Add cheque', text: 'Something went wrong: </br>' + result.toString(), type: 'error' }).then(function () { clearForm(); });
                                    $("#btnAddExcelUpload").removeAttr("disabled");
                                }


                            },
                            error: function (e) {
                                swal({ title: 'Add cheque', text: 'Cheque add encountered an error', type: 'error' }).then(function () { clearForm(); });
                                $("#btnAddExcelUpload").removeAttr("disabled");
                            }
                        });
                    }
                },

                function (dismiss) {
                    swal('Add cheque', 'You cancelled cheque UPLOAD.', 'error');
                    $("#btnAddExcelUpload").removeAttr("disabled");
                }
            );
        }
    });
}



function addChequeWithdrawal() {
    $('#frmPerformtransaction').validate({
        messages: {
            withdrawalName: { required: "Name  is required" },
            withdrawaltransDate: { required: "Transaction date is required" },
            withdrawalCOT: { required: "COT is required" },
            withdrawalChequeSlipNo: { required: "Slip no is required" },

            withdrawalAmount: {
                number: true
            },

            messages: {
                withdrawalAmount: {
                    required: "Please enter amount",
                    withdrawalAmount: "Amount is not a valid number"
                }
            }

        },
        errorPlacement: function (error, element) {
            $.notify({
                icon: "now-ui-icons travel_info",
                message: error.text(),
            }, {
                    type: 'danger',
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });
        },
        submitHandler: function (form) {
            $("input[type=submit]").attr("disabled", "disabled");
            swal({
                title: "Are you sure?",
                text: "Cheque withdrawal details will be added!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#ff9800",
                confirmButtonText: "Yes, continue",
                cancelButtonText: "No, stop!",
                showLoaderOnConfirm: true,
                preConfirm: function () {
                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve();
                        }, 4000);
                    });
                }
            }).then(
                function (isConfirm) {
                    if (isConfirm) {
                        $("#btnAddWithdrawal").attr("disabled", "disabled");

                        // withdrawalName, withdrawaltransDate, withdrawalAmount, withdrawalFoecDebit, withdrawalCOT, 
                        //, withdrawalCountercheque, withdrawaladdInfo, withdrawaRemark, 
                        //debugger
                        var AccountId = $('#ddlAcctNumber').val();
                        //var DepositorName = $('#withdrawalName').val();
                        //var ActualDate = $('#withdrawaltransDate').val();
                        var CreditAmt = $('#withdrawalAmount').val();
                        //var BankLocation = $('#withdrawalFoecDebit').prop("checked");
                        // var Phone = $('#withdrawalCOT').val(); 
                        //var SlipNumber = $('#withdrawalChequeSlipNo').val();
                        //var ChequeNo = $('#withdrawalCountercheque').val();
                        var Narration = $('#withdrawaladdInfo').val();
                        var Description = $('#withdrawaRemark').val();

                        $.ajax({
                            url: '../TellerAndTill/AddChequeWithdrawal/',
                            type: 'POST',
                            data: { AccountId, CreditAmt, Narration, Description },
                            dataType: "json",

                            success: function (result) {

                                if ($('#withrawchequeFileUpload').val() !== '') {
                                    chequewithdrawalDocument();
                                }
                                else {
                                    swal({ title: 'Add cheque withdrawal', text: 'Something went wrong: </br>' + result.toString(), type: 'error' }).then(function () { clearForm(); });
                                    $("#btnAddWithdrawal").removeAttr("disabled");
                                }


                            },
                            error: function (e) {
                                swal({ title: 'Add cheque withdrawal', text: 'Cheque withdrawal add encountered an error', type: 'error' }).then(function () { clearForm(); });
                                $("#btnAddWithdrawal").removeAttr("disabled");
                            }
                        });
                    }
                },

                function (dismiss) {
                    swal('Add cheque withdrawal', 'You cancelled cheque withdrawal add.', 'error');
                    $("#btnAddWithdrawal").removeAttr("disabled");
                }
            );
        }
    });
}