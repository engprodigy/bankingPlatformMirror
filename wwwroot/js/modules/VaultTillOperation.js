var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) === '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}

var debitAccountGL;

var url = url_path;
var url2 = url_path;

if (url == "/retail/TellerAndTill/TellerPosting") {

    url = "getAllVaultToTillTransfers"
    url2 = "getAllTillToVaultTransfers"

} else {

    url = "/TellerAndTill/getAllVaultToTillTransfers"
    url2 = "/TellerAndTill/getAllTillToVaultTransfers"

}

function logoutFormatter(value, row, index) {
    return [
        '<button type="button" class="remove btn btn-sm btn-danger" title="Delete">',
        '<i class="now-ui-icons users_single-02"></i> Click To logout',
        '</button>'
    ].join('');
}

var utilities = {
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

    reverseTransactionFormatter: function (value, row) {
        return [
            "<button class='btn btn-warning btn-icon' ",
            "onclick='initReversal(" + row.id + ")'>",
            "<i class='now-ui-icons ui-2_settings-90'>",
            "</i></button>"
        ].join("");
    },
}

function initReversal(id) {
   // clear();
    debugger
    var row_data = $("#transfer-transaction-table")
        .bootstrapTable("getRowByUniqueId", id);
    console.log(row_data);

    swal({
        title: "Are you sure?",
        text: "Transaction will be reversed!",
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

                //Add credit leg
                var Ref = $('#tillvaultrefNo').val();
                if (row_data.creditAmt != 0) {

                    //swap credit and debit amount and set credit amount to zero
                    row_data.debitAmt = row_data.creditAmt;
                    row_data.creditAmt = 0;

                    $.ajax({
                        url: '../TellerAndTill/RetreiveDebitAccountGL/',
                        type: 'POST',
                        data: { Ref: row_data.ref },
                        dataType: "json",

                        success: function (result) {

                            debitAccountGL = result;
                            console.log(result);

                            //add reversed credit Leg
                            $.ajax({
                                url: '../TellerAndTill/AddVaultToTillReversal/',
                                type: 'POST',
                                data: {
                                    AccountId: row_data.accountId, DebitAmt: row_data.debitAmt, CreditAmt: row_data.creditAmt, Ref, Description: row_data.description,
                                    TransactionType: row_data.transactionType
                                },
                                dataType: "json",

                                success: function (result) {

                                    if (result.toString !== '' && result !== null) {
                                        // swal({ title: 'Add vault to till details', text: 'Vault to till details add completed successfully!', type: 'success' }).then(function () { window.location.reload(true); });

                                        //$('#productGroupTable').
                                        //    bootstrapTable(
                                        //        'refresh', { url: 'TellerAndTill/list' });

                                        // $("#tillvaultrefNo").val(result);
                                        console.log(result);
                                    }
                                    else {
                                        swal({ title: 'Add vault to till details', text: 'Something went wrong: </br>' + result.toString(), type: 'error' }).then(function () { clearForm(); });
                                        $("#btnAddVaultTill").removeAttr("disabled");

                                    }

                                    // $('#AddNewTillVaultOperation').modal('hide');
                                },
                                error: function (e) {
                                    swal({ title: 'Add vault to till details', text: 'Vault to till details add encountered an error', type: 'error' }).then(function () { clearForm(); });
                                    $("#btnAddVaultTill").removeAttr("disabled");
                                }
                            });


                            //add reversed debit Leg
                            //swap credit and debit amount and set debit amount to zero
                            row_data.creditAmt = row_data.debitAmt;
                            row_data.debitAmt = 0;

                            $.ajax({
                                url: '../TellerAndTill/AddVaultToTillReversal/',
                                type: 'POST',
                                data: {
                                    AccountId: debitAccountGL, DebitAmt: row_data.debitAmt, CreditAmt: row_data.creditAmt, Ref, Description: row_data.description,
                                    TransactionType: row_data.transactionType
                                },
                                dataType: "json",

                                success: function (result) {

                                    if (result.toString !== '' && result !== null) {
                                        swal({ title: 'Add vault to till details', text: 'Reversal Transaction completed successfully!', type: 'success' })
                                            .then();                      //function () { clearForm(); });


                                        if ($('#transferreverse').val() == 0) {

                                            $("#transfer-transaction-table")
                                                .bootstrapTable("refresh", {
                                                    url: url
                                                });

                                        } else {

                                            $("#transfer-transaction-table")
                                                .bootstrapTable("refresh", {
                                                    url: url2
                                                });
                                        }
                                        console.log($('#transferreverse').val());
                                        //$('#productGroupTable').
                                        //    bootstrapTable(
                                        //        'refresh', { url: 'TellerAndTill/list' });
                                        
                                        console.log(result);
                                        
                                        $("#cashtillrefNo").val(result);
                                        $("#tillvaultrefNo").val(result);
                                         
                                    }
                                    else {
                                        swal({ title: 'Add vault to till details', text: 'Something went wrong: </br>' + result.toString(), type: 'error' })
                                            .then(function () { clearForm(); });
                                        $("#btnAddVaultTill").removeAttr("disabled");

                                    }

                                    // $('#AddNewTillVaultOperation').modal('hide');
                                },
                                error: function (e) {
                                    swal({ title: 'Add vault to till details', text: 'Vault to till details add encountered an error', type: 'error' }).then(function () { clearForm(); });
                                    $("#btnAddVaultTill").removeAttr("disabled");
                                }
                            });

                        },
                        error: function (e) {
                            swal({ title: 'Add vault to till details', text: 'Vault to till details add encountered an error', type: 'error' }).then(function () { clearForm(); });
                            $("#btnAddVaultTill").removeAttr("disabled");
                        }
                    });


                   


                } else {
                    row_data.CreditAmt = row_data.DebitAmt;
                    row_data.DebitAmt = 0;
                }

                

               

            }
        },

        function (dismiss) {
            swal('Reverse Vault/Till Transaction', 'You cancelled transaction reversal.', 'error');
            //$("#btnAddVaultTill").removeAttr("disabled");
        }
    );

}



$(document).ready(function ($) {
    $(".modal").perfectScrollbar();
    $(".modal").perfectScrollbar();
    $.fn.select2.defaults.set("theme", "bootstrap4");
    $.fn.select2.defaults.set("dropdownParent", $(".modal").first());
    $.fn.select2.defaults.set("width", "100%");
    $.fn.select2.defaults.set("allowClear", true);
    $('#btnAddVaultTill').on('click', function () {
        addVaultToTill();
    });
    $('#btnAddTillVault').on('click', function () {
        addTillToVault();
    });
});



function RemoveTellerPosting(url_path) {
    //var result = url_path.subString(16, 29);
    var subStr = url_path.slice(0, 14);
    return subStr;
}





//function vaulttoTillEventChange() {
    $(document).ready(function () {
        debugger
        /*$("#vaultacct").select2({
            theme: "bootstrap4",
            placeholder: "Loading..."

        });*/
        var url = url_path;
        var url2 = url_path;

        if (url == "/retail/TellerAndTill/TellerPosting") {

            url = "getAllVaultToTillTransfers"
            url2 = "getAllTillToVaultTransfers"

        } else {

            url = "/TellerAndTill/getAllVaultToTillTransfers"
            url2 = "/TellerAndTill/getAllTillToVaultTransfers"

        }

        var test = url_path;

        $("#transfer-transaction-table")
            .bootstrapTable("refresh", {
                url: url
            });

        /*$("#second-transfer-transaction-table")
            .bootstrapTable("refresh", {
                url: url2
            });*/


       $('#transfer-transaction-table').hide();
       // $('#second-transfer-transaction-table').show();

        $.ajax({
            url: "../TellerAndTill/GetChartOfAccount2"
        }).then(function (response) {
            debugger
            $("#vaultAcct").select2({
                theme: "bootstrap4",
                placeholder: "Search/Select GL name", 
                width: '100%',
                data: response,
                dropdownParent: $("#AddNewTillVaultOperation.modal"),
            });
        });     //for dropdown list control ends here


        $.ajax({
            url: "../TellerAndTill/getStartReferenceNumber"
        }).then(function (response) {
            debugger
            $("#cashtillrefNo").val(response);
            $("#tillvaultrefNo").val(response);
            console.log(response);
        }); 


       

    });


$("#vaultAcct").on("select2:select", function (e) {
    debugger
    var datas = e.params.data;
    //$('#ddlDebitGLNumber').val(datas.accountId);
    //$('#vaultAcct').val(datas.accountId);
    $('#vaultAcctGL').val(datas.accountId);


    //$('#vaultacct').val(datas).trigger('change.select2');
    availbalance = datas.availablebalance;

    // $("#vaultacct").select2({
    //     theme: "bootstrap4",
    //  });

   // $('#vaultAcct:selected').val(datas);

    $.ajax({
        url: "../TellerAndTill/loadVaultTillBalance",
        data: { AccountID: datas.accountId },
        type: "GET",
        cache: false,
    }).then(function (response) {
        $("#currentBal").val(response);
        balAccounts = response;
    });


});
//}

$("#transferreverse").on("select2:select", function (e) {
    
    debugger
    var url = url_path;
    var url2 = url_path;

    if (url == "/retail/TellerAndTill/TellerPosting") {

        url = "getAllVaultToTillTransfers"
        url2 = "getAllTillToVaultTransfers"

    } else {

        url = "/TellerAndTill/getAllVaultToTillTransfers"
        url2 = "/TellerAndTill/getAllTillToVaultTransfers"

    }
 

   

    var datas = e.params.data;
    if (datas.id == 0) {

        $("#transfer-transaction-table")
            .bootstrapTable("refresh", {
                url: url
            });

        $('#transfer-transaction-table').show();
       // $('#second-transfer-transaction-table').hide();

    } else {
        $("#transfer-transaction-table")
            .bootstrapTable("refresh", {
                url: url2
            });

        $('#transfer-transaction-table').show();
        //$('#second-transfer-transaction-table').show();

    }


});

//function cashtillEventChange() {
    $(document).ready(function () {
        debugger

        var data = [

            { id: 0, text: 'Vault To Till' },
            { id: 1, text: 'Till To Vault' }
            
        ];

        $("#transferreverse").select2({
            theme: "bootstrap4",
            placeholder: "Select Reverse Operation",
            width: '100%',
            data: data,
            dropdownParent: $("#AddNewTillVaultOperation.modal"),

        });

        $("#cashtillacct").select2({
            theme: "bootstrap4",
            placeholder: "Loading..."

        });
        $.ajax({
            url: "../TellerAndTill/GetChartOfAccount",
        }).then(function (response) {
            debugger
            $("#cashtillacct").select2({
                theme: "bootstrap4",
                placeholder: "Search/Select GL number",
                width: '100%',
                data: response,
                dropdownParent: $("#AddNewTillVaultOperation.modal"),
            });
        });     //for dropdown list control ends here


        $("#cashtillacct").on("select2:select", function (e) {
            debugger
            var datas = e.params.data;
            //$('#ddlDebitGLNumber').val(datas.accountId);
           // $('#cashtillacct').val(datas.accountId);
            $('#cashTillAcctGL').val(datas.accountId);
            

           // $('#cashtillacct').val(null).trigger('change.select2');
            availbalance = datas.availablebalance;
            /*$("#cashtillacct").select2({
                theme: "bootstrap4",
                placeholder: "Loading..."
            });*/
            $.ajax({
                url: "../TellerAndTill/loadGLBalance",
                data: { AccountID: datas.accountId },
                type: "GET",
                cache: false,
            }).then(function (response) {
                $("#cashtillcurrentBal").val(response);
                balAccounts = response;
            });


        });

    });
//}

//function tilltovaultChange() {
    $(document).ready(function () {
        debugger
        $("#cashtillvaultacct").select2({
            theme: "bootstrap4",
            placeholder: "Loading..."

        });
        $.ajax({
            url: "../TellerAndTill/GetChartOfAccountforTellerUser2"
        }).then(function (response) {
            debugger
            $("#cashtillvaultacct").select2({
                theme: "bootstrap4",
                placeholder: "Search/Select GL number",
                width: '100%',
                data: response,
                dropdownParent: $("#AddNewTillVaultOperation.modal"),
            });
        });     //for dropdown list control ends here


        $("#cashtillvaultacct").on("select2:select", function (e) {
            debugger
            var datas = e.params.data;
           // $('#cashtillvaultacct').val(datas.accountId);
            $('#tilltoVaultGL').val(datas.accountId);


           // $('#cashtillvaultacct').val(null).trigger('change.select2');
            availbalance = datas.availablebalance;
            /*$("#cashtillvaultacct").select2({
                theme: "bootstrap4",
                placeholder: "Loading..."
            });*/
            $.ajax({
                url: "../TellerAndTill/loadGLBalance",
                data: { AccountID: datas.accountId },
                type: "GET",
                cache: false,
            }).then(function (response) {
                $("#tilltovaultcurrentBal").val(response);
                balAccounts = response;
            });


        });

    });
//}

//function vaultaccountChange() {
    $(document).ready(function () {
        debugger
        $("#tillvaultaccounts").select2({
            theme: "bootstrap4",
            placeholder: "Loading..."

        });
        $.ajax({
            url: "../TellerAndTill/GetChartOfAccount",
        }).then(function (response) {
            debugger
            $("#tillvaultaccounts").select2({
                theme: "bootstrap4",
                placeholder: "Select vault account",
                width: '100%',
                data: response,
                dropdownParent: $("#AddNewTillVaultOperation.modal"),
            });
        });     //for dropdown list control ends here


        $("#tillvaultaccounts").on("select2:select", function (e) {
            debugger
            var datas = e.params.data;
            $('#tilltoCashAcctGL').val(datas.accountId);
           

            //$('#tillvaultaccounts').val(null).trigger('change.select2');
            
            $.ajax({
                url: "../TellerAndTill/loadGLBalance",
                data: { AccountID: datas.accountId },
                type: "GET",
                cache: false,
            }).then(function (response) {
                $("#tillvaultcurrentBal").val(response);
            });


        });

    });

//}

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

    var form = $("#frmVaultTill");
    form.trigger("reset");
    form.find("select").trigger("change");
    var form1 = $('#HideByTillVault');
    $('#tillvaultaccounts').val('0');
    $('#tillvaultaccounts').val('change');
    $('#tillvaultcurrentBal').val('');
    $("#amountwordsTilltoVault").html('');
    $('#amountwords').html('');
    
    
}



$(document).ready(function () {
    
    $("#vaulttotills").change(function (e) {
        debugger
        //$("#HideByVaulttoTills").toggle(".row");

        if ($("#vaulttotills").prop("checked") == true) {

            $("#HideByVaulttoTills").show();

            var form = $("#frmTillVault");
            form.trigger("reset");
            form.find("select").trigger("change");
            $("#amountwordsTilltoVault").html('');

            $.ajax({
                url: "../TellerAndTill/getStartReferenceNumber"
            }).then(function (response) {
                debugger
                $("#cashtillrefNo").val(response);
                $("#tillvaultrefNo").val(response);
                console.log(response);
            }); 

           

           // if ($('#HideByVaulttoTills').isVisible()) {

            //    if ($('#HideByTillVault').isVisible()) {

                    $("#HideByTillVault").hide();

                    $("#tilltovaults").prop("checked", false);

                    $("#HideByReverseTransfer").hide();

                    $("#reversetransfer").prop("checked", false);

            $('#transfer-transaction-table').hide();

            var form = $("#frmReverseTransfer");
            form.trigger("reset");
            form.find("select").trigger("change");
        //        }

//            }
        } else {

            $("#HideByVaulttoTills").hide();
        }
       
        $('#vaulttotills').on('check.bs.table', function (e, row) {
          
        });
       
        
    });
});

$.fn.isVisible = function () {
    return $.expr.filters.visible(this[0]);
};



$(document).ready(function () {
   
    $("#tilltovaults").change(function () {
        debugger
        //$("#HideByTillVault").toggle(".row");

        if ($("#tilltovaults").prop("checked") == true) {

            $("#HideByTillVault").show();

            var form = $("#frmVaultTill");
            form.trigger("reset");
            form.find("select").trigger("change");
            $('#amountwords').html('');

            $.ajax({
                url: "../TellerAndTill/getStartReferenceNumber"
            }).then(function (response) {
                debugger
                $("#cashtillrefNo").val(response);
                $("#tillvaultrefNo").val(response);
                console.log(response);
            }); 


           // if ($('#HideByTillVault').isVisible()) {

           //     if ($('#HideByVaulttoTills').isVisible()) {

                    $("#HideByVaulttoTills").hide();

                    $("#vaulttotills").prop("checked", false);

                    $("#HideByReverseTransfer").hide();

                    $("#reversetransfer").prop("checked", false);

                    $('#transfer-transaction-table').hide();

                     var form = $("#frmReverseTransfer");
                     form.trigger("reset");
                     form.find("select").trigger("change");
            //      }

         //   }

        }else {
    
                $("#HideByTillVault").hide();
            }



    });
});

$(document).ready(function () {
    debugger
    $("#reversetransfer").change(function () {

        if ($("#reversetransfer").prop("checked") == true) {


            $("#HideByReverseTransfer").show();

            var form = $("#frmVaultTill");
            form.trigger("reset");
            form.find("select").trigger("change");
            $('#amountwords').html('');

            var form2 = $("#frmTillVault");
            form2.trigger("reset");
            form2.find("select").trigger("change");
            $("#amountwordsTilltoVault").html('');

            $("#HideByVaulttoTills").hide();
            $("#vaulttotills").prop("checked", false);

            $("#HideByTillVault").hide();
            $("#tilltovaults").prop("checked", false);

            $.ajax({
                url: "../TellerAndTill/getStartReferenceNumber"
            }).then(function (response) {
                debugger
                $("#cashtillrefNo").val(response);
                $("#tillvaultrefNo").val(response);
                console.log(response);
            }); 



        } else {

            $("#HideByReverseTransfer").hide();
        }
    });
});

window.tellerLogoutEvents = {

};


function numberToEnglish(n) {

    var string = n.toString(), units, tens, scales, start, end, chunks, chunksLen, chunk, ints, i, word, words, and = 'and';

    /* Remove spaces and commas */
    string = string.replace(/[, ]/g, "");

    /* Is number zero? */
    if (parseInt(string) === 0) {
        return 'zero';
    }

    /* Array of units as words */
    units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    /* Array of tens as words */
    tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    /* Array of scales as words */
    scales = ['', 'Thousand', 'Million', 'Billion', 'Trillion', 'Quadrillion', 'Quintillion', 'Sextillion', 'Septillion', 'Octillion', 'Nonillion', 'Decillion', 'Undecillion', 'Duodecillion', 'Tredecillion', 'Quatttuor-decillion', 'Quindecillion', 'Sexdecillion', 'Septen-decillion', 'Octodecillion', 'Novemdecillion', 'Vigintillion', 'Centillion'];

    /* Split user arguemnt into 3 digit chunks from right to left */
    start = string.length;
    chunks = [];
    while (start > 0) {
        end = start;
        chunks.push(string.slice((start = Math.max(0, start - 3)), end));
    }

    /* Check if function has enough scale words to be able to stringify the user argument */
    chunksLen = chunks.length;
    if (chunksLen > scales.length) {
        return '';
    }

    /* Stringify each integer in each chunk */
    words = [];
    for (i = 0; i < chunksLen; i++) {

        chunk = parseInt(chunks[i]);

        if (chunk) {

            /* Split chunk into array of individual integers */
            ints = chunks[i].split('').reverse().map(parseFloat);

            /* If tens integer is 1, i.e. 10, then add 10 to units integer */
            if (ints[1] === 1) {
                ints[0] += 10;
            }

            /* Add scale word if chunk is not zero and array item exists */
            if ((word = scales[i])) {
                words.push(word);
            }

            /* Add unit word if array item exists */
            if ((word = units[ints[0]])) {
                words.push(word);
            }

            /* Add tens word if array item exists */
            if ((word = tens[ints[1]])) {
                words.push(word);
            }

            /* Add 'and' string after units or tens integer if: */
            if (ints[0] || ints[1]) {

                /* Chunk has a hundreds integer or chunk is the first of multiple chunks */
                if (ints[2] || (i + 1) > chunksLen) {
                    words.push(and);
                }                
            }

            /* Add hundreds word if array item exists */
            if ((word = units[ints[2]])) {
                words.push(word + ' hundred');
            }
        }
    }
    return words.reverse().join(' ');
}



var day = '02/06/2017';
var time = '05:17 pm';

function getAsDate(day, time) {
    var hours = Number(time.match(/^(\d+)/)[1]);
    var minutes = Number(time.match(/:(\d+)/)[1]);
    var AMPM = time.match(/\s(.*)$/)[1];
    if (AMPM === "pm" && hours < 12) hours = hours + 12;
    if (AMPM === "am" && hours === 12) hours = hours - 12;
    var sHours = hours.toString();
    var sMinutes = minutes.toString();
    if (hours < 10) sHours = "0" + sHours;
    if (minutes < 10) sMinutes = "0" + sMinutes;
    time = sHours + ":" + sMinutes + ":00";

    var d = new Date(day);
    var n = d.toISOString().substring(0, 10);
    var newDate = new Date(n + "T" + time);
    return newDate;
}



function addVaultToTill() {

    debugger
    $('#frmVaultTill').validate({

        debug: true,
        onfocusout: false,
        onkeyup: false,
        onclick: false,
        normalizer: function (value) {
            // Trim the value of every element before validation
            return $.trim(value);
        },

        errorPlacement: function (error, element) {
            $.notify({
                icon: "now-ui-icons travel_info",
                message: error.text()
            },
                {
                    type: 'danger',
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });
        },

        rules: {
            vaultAcct: {
                required: true
                /*number: true*/
            },
            amountfigures: {
                required: true
                /*number: true*/
            },
            cashtillacct: {
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
            vaultAcct: { required: "Please select vault account name" },
            amountfigures: { required: "Amount box can not be empty" },
            cashtillacct: { required: "Cash till account is required" },
        },

        submitHandler: function (form) {
            $("input[type=submit]").attr("disabled", "disabled");
            swal({
                title: "Are you sure?",
                text: "Vault to till details will be added!",
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
                        $("#btnAddVaultTill").attr("disabled", "disabled");
                        

                        debugger
                        var AccountId = $('#vaultAcctGL').val();
                        //var Balance = $('#currentBal').val();
                        var CreditAmt = $('#amountfigures').val();
                        var cashtillaccount = $('#cashtillacct').val();
                        //var CurrentBal = $('#cashtillcurrentBal').val();
                        var Ref = $('#cashtillrefNo').val();
                        var Description = $('#vaulttillRemark').val();

                        //Add credit leg
                        $.ajax({
                            url: '../TellerAndTill/AddVaultToTill/',
                            type: 'POST',
                            data: { AccountId, DebitAmt:0, CreditAmt, Ref, Description, TransactionType: 38},
                            dataType: "json",
                        
                            success: function (result) {

                                if (result.toString !== '' && result !== null) {
                                   // swal({ title: 'Add vault to till details', text: 'Vault to till details add completed successfully!', type: 'success' }).then(function () { window.location.reload(true); });

                                    //$('#productGroupTable').
                                    //    bootstrapTable(
                                    //        'refresh', { url: 'TellerAndTill/list' });

                                    $("#btnAddVaultTill").removeAttr("disabled");
                                }
                                else {
                                    swal({ title: 'Add vault to till details', text: 'Something went wrong: </br>' + result.toString(), type: 'error' }).then(function () { clearForm(); });
                                    $("#btnAddVaultTill").removeAttr("disabled");

                                }

                               // $('#AddNewTillVaultOperation').modal('hide');
                            },
                            error: function (e) {
                                swal({ title: 'Add vault to till details', text: 'Vault to till details add encountered an error', type: 'error' }).then(function () { clearForm(); });
                                $("#btnAddVaultTill").removeAttr("disabled");
                            }
                        });

                        //add debit Leg

                        $.ajax({
                            url: '../TellerAndTill/AddVaultToTill/',
                            type: 'POST',
                            data: { AccountId: cashtillaccount, DebitAmt: CreditAmt, CreditAmt: 0, Ref, Description, TransactionType: 38 },
                            dataType: "json",

                            success: function (result) {

                                if (result.toString !== '' && result !== null) {
                                    swal({ title: 'Add vault to till details', text: 'Vault to till details addition completed successfully!', type: 'success' })
                                        .then(function () { clearForm(); });

                                    //$('#productGroupTable').
                                    //    bootstrapTable(
                                    //        'refresh', { url: 'TellerAndTill/list' });
                                    var form = $("#frmVaultTill");
                                    form.trigger("reset");
                                    form.find("select").trigger("change");
                                    $("#btnAddVaultTill").removeAttr("disabled");

                                    $("#cashtillrefNo").val(result);
                                    console.log(result);
                                }
                                else {
                                    swal({ title: 'Add vault to till details', text: 'Something went wrong: </br>' + result.toString(), type: 'error' }).then(function () { clearForm();  });
                                    $("#btnAddVaultTill").removeAttr("disabled");

                                }

                                // $('#AddNewTillVaultOperation').modal('hide');
                            },
                            error: function (e) {
                                swal({ title: 'Add vault to till details', text: 'Vault to till details add encountered an error', type: 'error' }).then(function () { clearForm(); });
                                $("#btnAddVaultTill").removeAttr("disabled");
                            }
                        });




                    }
                },

                function (dismiss) {
                    swal('Add vault to till details', 'You cancelled vault to till details add.', 'error');
                    $("#btnAddVaultTill").removeAttr("disabled");
                }
            );
        } 
        });
  
}


function addTillToVault() {
    $('#frmTillVault').validate({
        debug: true,
        onfocusout: false,
        onkeyup: false,
        onclick: false,
        normalizer: function (value) {
            // Trim the value of every element before validation
            return $.trim(value);
        },
        errorPlacement: function (error, element) {
            $.notify({
                icon: "now-ui-icons travel_info",
                message: error.text()
            },
                {
                    type: 'danger',
                    placement: {
                        from: 'top',
                        align: 'right'
                    }
                });
        },

        rules: {
            cashtillvaultacct: {
                required: true
                /*number: true*/
            },
            tillvaultamountfigures: {
                required: true
                /*number: true*/
            },
            tillvaultaccounts: {
                required: true
            },
            transWithdrawalName: {
                required: true
            },
            
        },

        messages: {
            cashtillvaultacct: { required: "Please select account number/name" },
            tillvaultamountfigures: { required: "Amount box can not be empty" },
            tillvaultaccounts: { required: "Please selct vault account" },
            tillvaultRemark: {required: "Description box can not be empty"}
        },
        
        submitHandler: function (form) {
            $("input[type=submit]").attr("disabled", "disabled");
            swal({
                title: "Are you sure?",
                text: "Till Vault details will be added!",
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
                        $("#btnAddTillVault").attr("disabled", "disabled");


                        debugger
                        var AccountId = $('#tilltoVaultGL').val();
                        //var Balance = $('#currentBal').val();
                        var DebitAmt = $('#tillvaultamountfigures').val();
                        var cashtillaccount = $('#tilltoCashAcctGL').val();
                        //var CurrentBal = $('#cashtillcurrentBal').val();
                        var Ref = $('#tillvaultrefNo').val();
                        var Description = $('#tillvaultRemark').val();

                        $.ajax({
                            url: '../TellerAndTill/AddVaultToTill/',
                            type: 'POST',
                            data: { AccountId, DebitAmt, CreditAmt: 0, Ref, Description, TransactionType: 37 },
                            dataType: "json",

                            success: function (result) {

                                if (result.toString !== '' && result !== null) {

                                    clearForm();
                                   // $("#amountwordsTilltoVault").innerHTML('');
                                }
                                else {
                                    swal({ title: 'Add till vault details', text: 'Something went wrong: </br>' + result.toString(), type: 'error' }).then(function () { clearForm(); });
                                    $("#btnAddTillVault").removeAttr("disabled");

                                }

                                
                            },
                            error: function (e) {
                                swal({ title: 'Add till vault details', text: 'Till vault details addition encountered an error', type: 'error' }).then(function () { clearForm(); });
                                $("#btnAddTillVault").removeAttr("disabled");
                            }
                        });
                    }


                    $.ajax({
                        url: '../TellerAndTill/AddVaultToTill/',
                        type: 'POST',
                        data: { AccountId: cashtillaccount, DebitAmt: 0, CreditAmt: DebitAmt, Ref, Description, TransactionType: 37 },
                        dataType: "json",

                        success: function (result) {

                            if (result.toString !== '' && result !== null) {
                                swal({ title: 'Add till vault details', text: 'Till vault details addition completed successfully!', type: 'success' }).then(function () { clearForm(); });

                                $("#btnAddTillVault").removeAttr("disabled");
                               // $("#amountwordsTilltoVault").innerHTML('');
                            }
                            else {
                                swal({ title: 'Add till vault details', text: 'Something went wrong: </br>' + result.toString(), type: 'error' }).then(function () { clearForm(); });
                                $("#btnAddTillVault").removeAttr("disabled");

                            }

                            var form = $("#frmTillVault");
                            form.trigger("reset");
                            form.find("select").trigger("change");
                            $("#btnAddTillVault").removeAttr("disabled");

                            $("#tillvaultrefNo").val(result);
                            console.log(result);
                        },
                        error: function (e) {
                            swal({ title: 'Add till vault details', text: 'Till vault details addition encountered an error', type: 'error' }).then(function () { clearForm(); });
                            $("#btnAddTillVault").removeAttr("disabled");
                        }
                    });


                },

                function (dismiss) {
                    swal('Add till vault details', 'You cancelledtill vault details add.', 'error');
                    $("#btnAddTillVault").removeAttr("disabled");
                }
            );
        }
    });

}
