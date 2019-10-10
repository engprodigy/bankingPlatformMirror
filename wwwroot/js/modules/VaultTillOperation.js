var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) === '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}



function logoutFormatter(value, row, index) {
    return [
        '<button type="button" class="remove btn btn-sm btn-danger" title="Delete">',
        '<i class="now-ui-icons users_single-02"></i> Click To logout',
        '</button>'
    ].join('');
}



$(document).ready(function ($) {
    $(".modal").perfectScrollbar();
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



function vaulttoTillEventChange() {
    $(document).ready(function () {
        debugger
        $("#vaultacct").select2({
            theme: "bootstrap4",
            placeholder: "Loading..."

        });
        $.ajax({
            url: "../TellerAndTill/GetChartOfAccount2"
        }).then(function (response) {
            debugger
            $("#vaultacct").select2({
                theme: "bootstrap4",
                placeholder: "Search/Select GL number", 
                width: '100%',
                data: response
            });
        });     //for dropdown list control ends here


        $("#vaultacct").on("select2:select", function (e) {
            debugger
            var datas = e.params.data;
            //$('#ddlDebitGLNumber').val(datas.accountId);
            $('#vaultacct').val(datas.accountId);
            $('#vaultAcctGL').val(datas.accountId);
        

            $('#vaultacct').val(datas).trigger('change.select2');
            availbalance = datas.availablebalance;
            
            $("#vaultacct").select2({
                theme: "bootstrap4",
                placeholder: "Loading..."
                //$('#vaultacct:selected').val(datas);
            });
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

    });
}

function cashtillEventChange() {
    $(document).ready(function () {
        debugger
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
                width: '100%',
                data: response
            });
        });     //for dropdown list control ends here


        $("#cashtillacct").on("select2:select", function (e) {
            debugger
            var datas = e.params.data;
            //$('#ddlDebitGLNumber').val(datas.accountId);
            $('#cashtillacct').val(datas.accountId);
            $('#cashTillAcctGL').val(datas.accountId);
            

            $('#cashtillacct').val(null).trigger('change.select2');
            availbalance = datas.availablebalance;
            $("#cashtillacct").select2({
                theme: "bootstrap4",
                placeholder: "Loading..."
            });
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
}

function tilltovaultChange() {
    $(document).ready(function () {
        debugger
        $("#cashtillvaultacct").select2({
            theme: "bootstrap4",
            placeholder: "Loading..."

        });
        $.ajax({
            url: "../TellerAndTill/GetChartOfAccount"
        }).then(function (response) {
            debugger
            $("#cashtillvaultacct").select2({
                theme: "bootstrap4",
                width: '100%',
                data: response
            });
        });     //for dropdown list control ends here


        $("#cashtillvaultacct").on("select2:select", function (e) {
            debugger
            var datas = e.params.data;
            $('#cashtillvaultacct').val(datas.accountId);
            $('#tilltoVaultGL').val(datas.accountId);


            $('#cashtillvaultacct').val(null).trigger('change.select2');
            availbalance = datas.availablebalance;
            $("#cashtillvaultacct").select2({
                theme: "bootstrap4",
                placeholder: "Loading..."
            });
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
}

function vaultaccountChange() {
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
                data: response
            });
        });     //for dropdown list control ends here


        $("#tillvaultaccounts").on("select2:select", function (e) {
            debugger
            var datas = e.params.data;
            $('#tillvaultaccounts').val(datas.accountId);
           

            $('#tillvaultaccounts').val(null).trigger('change.select2');
            $("#tillvaultaccounts").select2({
                theme: "bootstrap4",
                placeholder: "Loading..."
            });
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

}

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
    
}



$(document).ready(function () {
    debugger
    $("#vaulttotills").change(function (e) {
        $("#HideByVaulttoTills").toggle(".row");


        $('#vaulttotills').on('check.bs.table', function (e, row) {
          
        });
       
        
    });
});



$(document).ready(function () {
    debugger
    $("#tilltovaults").change(function () {
        $("#HideByTillVault").toggle(".row");
    });
});

$(document).ready(function () {
    debugger
    $("#reversetransfer").change(function () {
        $("#HideByReverseTransfer").toggle(".row");
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
    $('#frmVaultTill').validate({
        message: {
            vaultacct: { required: "Please select account number/name" },
            amountfigures: { required: "Amount box can not be empty" },
            cashtillacct: { required: "Cash till account is required" }
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
                        //var cashtillaccount = $('#cashtillacct').val();
                        //var CurrentBal = $('#cashtillcurrentBal').val();
                        var Ref = $('#cashtillrefNo').val();
                        var Description = $('#vaulttillRemark').val();

                        $.ajax({
                            url: '../TellerAndTill/AddVaultToTill/',
                            type: 'POST',
                            data: { AccountId, CreditAmt, Ref, Description },
                            dataType: "json",
                        
                            success: function (result) {

                                if (result.toString !== '' && result !== null) {
                                    swal({ title: 'Add vault to till details', text: 'Vault to till details add completed successfully!', type: 'success' }).then(function () { window.location.reload(true); });

                                    //$('#productGroupTable').
                                    //    bootstrapTable(
                                    //        'refresh', { url: 'TellerAndTill/list' });

                                    $("#btnAddVaultTill").removeAttr("disabled");
                                }
                                else {
                                    swal({ title: 'Add vault to till details', text: 'Something went wrong: </br>' + result.toString(), type: 'error' }).then(function () { clear(); Location.reload(true); });
                                    $("#btnAddVaultTill").removeAttr("disabled");

                                }

                                $('#AddNewTillVaultOperation').modal('hide');
                            },
                            error: function (e) {
                                swal({ title: 'Add vault to till details', text: 'Vault to till details add encountered an error', type: 'error' }).then(function () { clear(); });
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
    $('#frmVaultTill').validate({
        message: {
            cashtillvaultacct: { required: "Please select account number/name" },
            tillvaultamountfigures: { required: "Amount box can not be empty" },
            tillvaultaccounts: { required: "Please selct vault account" },
            tillvaultRemark: {required: "Description box can not be empty"}
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
                        var CreditAmt = $('#tillvaultamountfigures').val();
                        //var cashtillaccount = $('#cashtillacct').val();
                        //var CurrentBal = $('#cashtillcurrentBal').val();
                        var Ref = $('#tillvaultrefNo').val();
                        var Description = $('#tillvaultRemark').val();

                        $.ajax({
                            url: '../TellerAndTill/AddVaultToTill/',
                            type: 'POST',
                            data: { AccountId, CreditAmt, Ref, Description },
                            dataType: "json",

                            success: function (result) {

                                if (result.toString !== '' && result !== null) {
                                    swal({ title: 'Add till vault details', text: 'Till vault details add completed successfully!', type: 'success' }).then(function () { window.location.reload(true); });
                                    
                                    $("#btnAddTillVault").removeAttr("disabled");
                                }
                                else {
                                    swal({ title: 'Add till vault details', text: 'Something went wrong: </br>' + result.toString(), type: 'error' }).then(function () { clear(); Location.reload(true); });
                                    $("#btnAddTillVault").removeAttr("disabled");

                                }

                                $('#AddNewTillVaultOperation').modal('hide');
                            },
                            error: function (e) {
                                swal({ title: 'Add till vault details', text: 'Till vault details add encountered an error', type: 'error' }).then(function () { clear(); });
                                $("#btnAddTillVault").removeAttr("disabled");
                            }
                        });
                    }
                },

                function (dismiss) {
                    swal('Add till vault details', 'You cancelledtill vault details add.', 'error');
                    $("#btnAddTillVault").removeAttr("disabled");
                }
            );
        }
    });

}
