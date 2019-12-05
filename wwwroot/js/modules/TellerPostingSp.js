var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) === '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}

//var chartofaccounts = {}, AccountChartObj,
//    REQUEST_IN_PROGRESS = "request_in_progress";
var tellerId, transactions = {};

function logoutFormatter(value, row, index) {
    return [
        '<button type="button" class="remove btn btn-sm btn-danger" title="Delete">',
        '<i class="now-ui-icons users_single-02"></i> Click To logout',
        '</button>'
    ].join('');
}



$(document).ready(function ($) {

    initFormValidations();
    initEventListeners();

    $('#btnTransactOperations').on("click", function () {
        addBasicInfoTransaction();
    });

    $('#btnAddSingleCheque').on("click", function () {
        addSingleCheque();
    });

    $('#frmCashtransfer').submit(function (evt) {
        evt.preventDefault();
       
    });
    debugger

    var url = url_path;
    if (url == "/retail/TellerAndTill/TellerPosting") {

        url = "getAllSingleTransfer"

    } else {

        url = "/TellerAndTill/getAllSingleTransfer"
    }

    var test = url_path;

    $("#teller-transaction-table")
        .bootstrapTable("refresh", {
            url: url
        });

    /*$.ajax(url)
        .then(function (response) {
            // debugger
            $.each(response, function (index, value) {
                transactions = value;
            });
            // Let data table load its data / refresh with url
            
            $('#teller-transaction-table')
                .bootstrapTable('load', response);
        });*/
    

    
});


function initEventListeners() {

    var form = $("#frmCashtransfer");

    form.find("#debitAmount").on("change",
        function () {

           // $('#debitAmount').change(function () {
            //    $('#creditAmount').val($(this).val());
           // });

           // var form = $("#frmCashtransfer");
            //debugger
            $('#creditAmount').val(this.value);
            var value = $.trim(this.value).replace(/,/g, "");
            //var value = $.trim(this.value).replace(/,/g, "");
            
            // if amount is a valid input
            if ($.isNumeric(value)) {
                if (Number(value) <= 0) {
                    this.value = '';
                    return $.notify(
                        {
                            icon: "now-ui-icons travel_info",
                            message: "Transaction amount must exceed 0!"
                        },
                        {
                            type: "danger",
                            placement: {
                                from: "top",
                                align: "right"
                            }
                        }
                    );
                } else {
                    
                }
            }

            
        }
    );

}


function initFormValidations() {
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


    $("#frmCashtransfer").validate({
        rules: {
            debitAmount: {
                
                number: true,
                min: 1,
                required: true
                
            },
            chargepercent: {
                number: true
            }
        },
        
        messages: {
            ddlDebitGLNumber: {
                required: "Please select a Debit GL"
            },
            creditGLNumber: {
                required: "Please select a Credit GL"
              
            },
            debitTransactDate: {
                required: "Date is required",
                
            },
            debitAmount: {
                required: "Amount should exceed zero",
                
                number: "Amount is not a valid number"
            },
            
            
        },
        ignore: ":hidden:not(.always-validate)"
    });

}





$(document).ready(function ($) {
    $(".modal").perfectScrollbar();
    $.fn.select2.defaults.set("theme", "bootstrap4");
    $.fn.select2.defaults.set("dropdownParent", $(".modal").first());
    $.fn.select2.defaults.set("width", "100%");
    $.fn.select2.defaults.set("allowClear", true);
   // initSelectTwoConfig();
   // initEventListeners();
    TransferChange();
    
});

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}
function RemoveTellerPosting(url_path) {
    //var result = url_path.subString(16, 29);
    var subStr = url_path.slice(0,14);
    return subStr;
}


var transferAmount;
var transferBalance;
var Account;
var balAccounts;
var availbalance;
var transaction;

function TransferChange() {
   // $(document).ready(function () {
       // debugger
    $("#creditGLNumber").select2({
            theme: "bootstrap4",
            placeholder: "Loading..."

        });
        $.ajax({
            url: "../TellerAndTill/GetChartOfAccount",
        }).then(function (response) {
           // debugger
            $("#creditGLNumber").select2({
                theme: "bootstrap4",
                placeholder: "Search/Select GL number", 
                width: '100%',
                data: response,
                dropdownParent: $("#AddNewCashTransfer.modal"),
            });
            });     //for dropdown list control ends here
  //  });   

    $("#ddlDebitGLNumber").select2({
        theme: "bootstrap4",
        placeholder: "Loading..."

    });

   // debugger
    $.ajax({
        url: "../TellerAndTill/GetChartOfAccountforTellerUser",
    }).then(function (response) {
       // debugger
        $("#ddlDebitGLNumber").select2({
            theme: "bootstrap4",
            placeholder: "Search/Select GL number",
            width: '100%',
            data: response
        });
    }); 

}

$("#creditGLNumber").on("select2:select", function (e) {
            //var user = User.Identtity.Name;
            var user = "Peter Nwankwo";
           // debugger
            var datas = e.params.data;
               // $('#ddlDebitGLNumber').val(datas.accountId);
            // $('#creditGLNumber').val(datas.accountname);
           // $('#creditGLNumber').val(user);
              //  $('#debitGLName').val(datas.accountname);
            $('#creditGLName').val(datas.accountname);          //Latter change all credit control here to User.Identity.Name
           // $('#creditGLName').val(user);
            //    $('#debitGLNum').val(datas.accountId);
            $('#creditGLNum').val(datas.accountId);
           // $('#debitProduct').val(datas.accountname);
            $('#creditProduct').val(datas.accountId);
           

                //$('#ddlDebitGLNumber').val(null).trigger('change.select2');
                //availbalance = datas.availablebalance;
                //$("#ddlDebitGLNumber").select2({
                //    theme: "bootstrap4",
                //    placeholder: "Loading..."
                //});
                $.ajax({
                    url: "../TellerAndTill/loadGLBalance",
                    //data: { AccountID: $('#ddlDebitGLNumber').val() },
                    data: { AccountID: datas.accountId },
                    type: "GET",
                    cache: false,
                }).then(function (response) {
                    $("#creditGLBalance").val(response);
                    balAccounts = response;
                });

            });

$("#ddlDebitGLNumber").on("select2:select", function (e) {

    var datas = e.params.data;
    $('#debitGLNum').val(datas.accountId);
    $('#debitGLName').val(datas.accountname);
    $("#debitGLBalance").val("XXXXXX");

});
   
    // Event Listeners
    $(document).on("select2:open", function () {
        $('.select2-results__options').perfectScrollbar();                

    });
    



$('#debitCreditNaration').change(function () {
            //debugger
            $('#creditNaration').val($(this).val());
        });

    /*$('#debitAmount').change(function () {
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
        var form = $("#frmCashtransfer");
        form.trigger("reset");
        form.find("select").trigger("change");
        //utilities.clearDetails();
        //form.find("#amount").trigger("change");
    }

    window.tellerLogoutEvents = {

};   

function amountChange() {
   // debugger
    var debitamount = $('#debitAmount').val();
    var creditamount = $('#creditAmount').val();
    if (debitamount <= 0 || debitamount === 0 || debitamount === "") {
        swal({
            title: "Amount error",
            text: "Sorry, amount to debit can not be #0.00, below or empty",
            type: "warning"
        });
        return;
    }
    if (creditamount <= 0 || creditamount === 0 || creditamount === "") {
        swal("Sorry, amount to credit can not be #0.00, below or empty");
        return;
    }
}



function save() {

    //debugger

    var form = $("#frmCashtransfer");
    if (!form.valid()) return;

   // return;

    swal({
        title: "Are you sure?",
        text: "Transaction will be added!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#34D027",
        confirmButtonText: "Yes, continue",
        cancelButtonColor: "#ff9800",
        cancelButtonText: "No, stop!",
        showLoaderOnConfirm: true,
        preConfirm: function () {
            return new Promise(function (resolve) {
                setTimeout(function () {
                    resolve();
                }, 1000);
            });
        }
    })
        .then(
        function (isConfirm) {
                if (isConfirm) {

                   // debugger

                    $("#btnCashTransfer").attr("disabled", "disabled");

                    //var DebitAmt = $('#debitGLNum').val();

                    //var tillgeneralToGeneralLedger = $('#tillgeneralToGeneralLedger').select2("data").text;
                   // var AccountDr = creditGLNumber;
                    var AccountIdCredit = $('#creditGLNum').val();
                    // var GLName = $('#debitGLName').select2("data").text;
                    // var GLName1 = $('#creditGLName').select2("data").text;
                    var AccountIdDebit = $('#debitGLNum').val();
                    //var AcctNum = $('#creditGLNum').val();
                    //var Balance = $('#debitGLBalance').val();
                    //var Bal = $('#creditGLBalance').val();
                    //var Prod = $('#debitProduct').val();
                    //var Product = $('#creditProduct').val();
                    var debitAmount = $('#debitAmount').val();
                    var creditAmount = $('#creditAmount').val();
                    var TransactionDate = $('#debitTransactDate').val();
                    //var NarrationDr = $('#creditNaration').val();
                    var NarrationCr = $('#debitCreditNaration').val();
                    //var ChequeNo = $('#creditInstrumentNo').val();
                    //var TransactionType = $('#debitTransactType').val();

                    //debit side posting

                    $.ajax({
                        url: '../TellerAndTill/AddTransactionOperation/',
                        type: 'POST',
                        data: {
                            AccountId: AccountIdDebit, DebitAmt: debitAmount, CreditAmt: 0, TransactionDate, NarrationCr
                        },
                        dataType: "json",

                        success: function (result) {

                            /*if (result.toString !== '' && result !== null) {
                                swal({
                                    title: 'Add transfer operation',
                                    text: 'Transfer operation add successful!',
                                    type: 'success'
                                }).then(function () { clearForm(); });

                                $('#AddNewCashTransfer').modal('hide');

                                $('#tellerLoginTable').
                                    bootstrapTable(
                                        'refresh', { url: 'TellerAndTill/listTellerLogin' });

                                $("#btnCashTransfer").removeAttr("disabled");
                            }
                            else {
                                swal({
                                    title: 'Add transfer operation',
                                    text: 'Something went wrong: </br>' + result.toString(), type: 'error'
                                }).then(function () { clearForm(); });
                                $("#btnCashTransfer").removeAttr("disabled");
                            }*/

                        },
                        error: function (e) {
                            swal({
                                title: 'Add transfer operation',
                                text: 'Transfer operation add encountered an error', type: 'error'
                            }).then(function () { clearForm(); });
                            $("#btnCashTransfer").removeAttr("disabled");
                        }
                    });

                    //credit side posting

                    $.ajax({
                        url: '../TellerAndTill/AddTransactionOperation/',
                        type: 'POST',
                        data: {
                            AccountId: AccountIdCredit, DebitAmt: 0, CreditAmt: creditAmount, TransactionDate, NarrationCr
                        },
                        dataType: "json",

                        success: function (result) {

                            if (result.toString !== '' && result !== null) {
                                swal({
                                    title: 'Add transfer operation',
                                    text: 'Transfer operation add successful!',
                                    type: 'success'
                                }).then(function () {
                                    clearForm();
                                    //location.reload(true);

                                });

                                //$('#AddNewCashTransfer').modal('hide');
                                //$("#frmCashtransfer").trigger('reset');
                                var form = $("#frmCashtransfer");
                                form.trigger("reset");
                                form.find("select").trigger("change");

                                $('#tellerLoginTable').
                                    bootstrapTable(
                                        'refresh', { url: 'listTellerLogin' });
                                $('#teller-transaction-table').
                                    bootstrapTable(
                                        'refresh', { url: 'getAllSingleTransfer' });

                                   

                                    /// wait 3 seconds
                                /*setTimeout(function () {

                                    location.reload(true);

                                    }, 20000);*/
                                

                                

                                $("#btnCashTransfer").removeAttr("disabled");
                            }
                            else {
                                swal({
                                    title: 'Add transfer operation',
                                    text: 'Something went wrong: </br>' + result.toString(), type: 'error'
                                }).then(function () { clearForm(); });
                                $("#btnCashTransfer").removeAttr("disabled");
                            }

                        },
                        error: function (e) {
                            swal({
                                title: 'Add transfer operation',
                                text: 'Transfer operation add encountered an error', type: 'error'
                            }).then(function () { clearForm(); });
                            $("#btnCashTransfer").removeAttr("disabled");
                        }
                    });
                
            }
        },

        function (dismiss) {
            swal('Add transfer operation', 'You cancelled transfer operation add.', 'error');
            $("#btnCashTransfer").removeAttr("disabled");
        }
    );

    
   
    
}

var utility = {

    
    logoutFormatter: function (val, row, index) {
        return [
            "<button type='button' class='remove btn btn-sm btn-danger' title='Delete'",
            "onclick='tellerLogoutService(" + row.id + ")'>",
            "<i class='now-ui-icons users_single-02'></i> Click To logout",
            "</button>"
        ].join("");
    },

    approvalFormatter: function (val, row, index) {
        if (row.approved == true) {
            return [
                'Approved'

            ].join('');
        } else {
            return [
                'Pending'

            ].join('');

        }
    },

    getAllSingleTransfer: function (val, row, index) {

        $.ajax({
            url: "../TellerAndTill/getAllSingleTransfer",
            //data: { AccountID: $('#ddlDebitGLNumber').val() },
           // data: { AccountID: datas.accountId },
            type: "GET",
            cache: false,
        }).then(function (response) {
            //$("#creditGLBalance").val(response);
            transactions = response;
        });

        return [
            transactions
        ].join("");
    },


}




//window.tellerLogoutEvents = {
    function tellerLogoutService (id) {
    //'click .remove': function (e, value, row, index) {

        debugger
        var form = $("#frmtellerlogout");
        form.trigger("reset");
        tellerId = id;
        //$.getJSON("../TellerAndTill/GetAlreadyLoggedOut", { id: id }, function (value) {
                    
                 $('#TellerUserLogout').modal('show');

            //     console.log("JSON Data: " + value);
            //  });
    
};

function getTellerLogout() {

    // = $("#username").text().trim();
    //debugger


   // $.getJSON("../TellerAndTill/updateTellerUserLogout", { id: id }, function (value) {        });

    //return;

    $.ajax({
        url: "../TellerAndTill/updateTellerUserLogout/" + tellerId,
        type: 'GET',
        dataType: "json",
        success: function (data) {
            if (data) {
                swal({
                    title: 'Teller Logout',
                    text: 'Teller Logged Out Successfully!',
                    type: 'success'
                }).then(function () {
                    //sleep(100);
                    // $('#tellerLoginTable').bootstrapTable('refresh');
                    // $("#btnTellerSetupUpdate").removeAttr("disabled");
                    $('#TellerUserLogout').modal('hide');

                    // var tellerOperationURL = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname + window.location.search

                    window.location.assign(url_path + "/../TellerOperation")
                });
                //$("#tellerLoginTable").bootstrapTable("refresh");
            } else {
                swal({
                    title: 'Teller Logout',
                    text: 'Teller logout encountered error',
                    type: 'error'

                }).then(function () {
                    $('#TellerUserLogout').modal('hide');
                })

            }
        },
        error: function (e) {
            swal({
                title: 'Teller Logout',
                text: 'Teller logout encountered error',
                type: 'error'
            }).then(function () {
                $("#btnAccess").removeAttr("disabled");
                $('#TellerUserLogout').modal('hide');
            });
        }
    })
}


