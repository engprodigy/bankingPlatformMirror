var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) === '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}

//var chartofaccounts = {}, AccountChartObj,
//    REQUEST_IN_PROGRESS = "request_in_progress";


$(document).ready(function ($) {
    $('#btnTransactOperations').on("click", function () {
        addBasicInfoTransaction();
    });

    $('#btnAddSingleCheque').on("click", function () {
        addSingleCheque();
    });

    $('#btnCashTransfer').on("click", function () {
        AddTransferCash();
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
    $(document).ready(function () {
        debugger
        $("#ddlDebitGLNumber").select2({
            theme: "bootstrap4",
            placeholder: "Loading..."

        });
        $.ajax({
            url: "../TellerAndTill/GetChartOfAccount",
        }).then(function (response) {
            debugger
            $("#ddlDebitGLNumber").select2({
                theme: "bootstrap4",
                placeholder: "Search/Select GL number", 
                width: '100%',
                data: response
            });
            });     //for dropdown list control ends here
        

        $("#ddlDebitGLNumber").on("select2:select", function (e) {
            //var user = User.Identtity.Name;
            var user = "Peter Nwankwo";
                debugger
                var datas = e.params.data;
                $('#ddlDebitGLNumber').val(datas.accountId);
            // $('#creditGLNumber').val(datas.accountname);
            $('#creditGLNumber').val(user);
                $('#debitGLName').val(datas.accountname);
            //$('#creditGLName').val(datas.accountname);          //Latter change all credit control here to User.Identity.Name
            $('#creditGLName').val(user);
                $('#debitGLNum').val(datas.accountId);
            $('#creditGLNum').val(datas.accountId);
            $('#debitProduct').val(datas.accountname);
                $('#creditProduct').val(datas.accountId);
                $("#debitGLBalance").val("XXXXXX");

                $('#ddlDebitGLNumber').val(null).trigger('change.select2');
                availbalance = datas.availablebalance;
                $("#ddlDebitGLNumber").select2({
                    theme: "bootstrap4",
                    placeholder: "Loading..."
                });
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


    });
    // Event Listeners
    $(document).on("select2:open", function () {
        $('.select2-results__options').perfectScrollbar();                

    });
    
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
        //utilities.clearDetails();
        //form.find("#amount").trigger("change");
    }

    window.tellerLogoutEvents = {

};   

function amountChange() {
    debugger
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



function AddTransferCash() {
    $('#frmCashtransfer').validate({
        messages: {
            tillgeneralToGeneralLedger: { required: "Select Acct No is required" },
            ddlDebitGLNumber: { required: "Depositor Name is required" },
            creditGLNumber: { required: "Transaction date is required" },
            debitGLName: { required: "Depositor's address date is required" },
            creditGLName: { required: "Select Acct No is required" },
            debitGLNum: { required: "Depositor Name is required" },
            creditGLNum: { required: "Transaction date is required" },
            debitGLBalance: { required: "Select Acct No is required" },
            creditGLBalance: { required: "Depositor Name is required" },
            debitProduct: { required: "Transaction date is required" },
            creditProduct: { required: "Depositor's address date is required" },
            debitAmount: { required: "Select Acct No is required" },
            creditAmount: { required: "Select Acct No is required" },
            debitTransactDate: { required: "Depositor Name is required" },
            creditNaration: { required: "Transaction date is required" },
            debitCreditNaration: { required: "Depositor's address date is required" },
            creditInstrumentNo: { required: "Select Acct No is required" },
            debitTransactType: { required: "Depositor Name is required" },           

            transDepositorPhone: {
                     number: true
                 },
            transDepositSlipNo: {
                     number: true
                 },
                amountFigure: {
                    decimal: true
                },
            
            messages: {
                transDepositorPhone: {
                    required: "Please select one charge type"
                },
                transDepositSlipNo: {
                    required: "Deposit slip should be int"
                },
                amountFigure: {
                    required: "amount is required"
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
                text: "Transaction will be added!",
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
                        $("#btnCashTransfer").attr("disabled", "disabled");

                        var creditGLNumber = $('#debitGLNum').val();
                        debugger
                        //var tillgeneralToGeneralLedger = $('#tillgeneralToGeneralLedger').select2("data").text;
                        var AccountDr = creditGLNumber;
                        var AccountCr = $('#creditGLNumber').val(); 
                        // var GLName = $('#debitGLName').select2("data").text;
                        // var GLName1 = $('#creditGLName').select2("data").text;
                        //var GLnum = $('#debitGLNum').select2("data").text;
                        //var AcctNum = $('#creditGLNum').val();
                        //var Balance = $('#debitGLBalance').val();
                        //var Bal = $('#creditGLBalance').val();
                        //var Prod = $('#debitProduct').val();
                        //var Product = $('#creditProduct').val();
                        //var debitAmount = $('#debitAmount').val();
                        var Amount = $('#creditAmount').val();
                        var PostDate = $('#debitTransactDate').val();
                        var NarrationDr = $('#creditNaration').val();
                        var NarrationCr = $('#debitCreditNaration').val();
                        var ChequeNo = $('#creditInstrumentNo').val();
                        //var TransactionType = $('#debitTransactType').val();

                        $.ajax({
                            url: '../TellerAndTill/AddTransactionOperation/',
                            type: 'POST',
                            data: {
                                AccountDr, AccountCr, Amount, PostDate, NarrationDr, NarrationCr, ChequeNo
                            },
                            dataType: "json",
                            
                            success: function (result) {

                                if (result.toString !== '' && result !== null) {
                                    swal({ title: 'Add transfer operation', text: 'Transfer operation add successful!', type: 'success' }).then(function () { clearForm(); });

                                    $('#AddNewCashTransfer').modal('hide');

                                    $('#tellerLoginTable').
                                        bootstrapTable(
                                        'refresh', { url: 'TellerAndTill/listTellerLogin' });

                                    $("#btnCashTransfer").removeAttr("disabled");
                                }
                                else {
                                    swal({ title: 'Add transfer operation', text: 'Something went wrong: </br>' + result.toString(), type: 'error' }).then(function () { clearForm(); });
                                    $("#btnCashTransfer").removeAttr("disabled");
                                }
                             
                            },
                            error: function (e) {
                                swal({ title: 'Add transfer operation', text: 'Transfer operation add encountered an error', type: 'error' }).then(function () { clearForm(); });
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
    });
}
