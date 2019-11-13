var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) == '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}

var chequebooktypes = {}, selectedChequebook, 
    tracker = 0, accountcheques = undefined,
    REQUEST_IN_PROGRESS = "request_in_progress";
var lenghtTracker = null;

$(document).ready(function () {
    initFormValidations();
    initSelectTwoConfig();
    $(".modal").perfectScrollbar();
});

function initSelectTwoConfig() {
    $.fn.select2.defaults.set("theme", "bootstrap4");
    $.fn.select2.defaults.set("dropdownParent", $(".modal").first());
    $.fn.select2.defaults.set("width", "100%");
    $.fn.select2.defaults.set("allowClear", true);

    $.ajax(url_path + "/../../Setup/LoadChequeTypes")
        .then(function (response) {
            $.each(response, function (index, item) {
                chequebooktypes[item.id] = item;
            }); 
            $("#chequebooktypeid").select2({
                placeholder: "Select chequebook type",
                data: $.map(response, function (item) {
                    return {
                        id: item.id,
                        text: item.chequetype
                    };
                })
            });
        });

    $.ajax(url_path + "/../LoadCurrentAccounts")
        .then(function (response) {
            $("#accountno").select2({
                placeholder: "Select account",
                data: response
               // data: ["01100123453", "00897878721", "23835292834", "53623546657"]
            });
        });

    // Event Listeners
    $(document).on("select2:open", function () {
        $('.select2-results__options').perfectScrollbar();
    });

    $("#chequebooktypeid").on("select2:select", function (e) {
        selectedChequebook = chequebooktypes[e.params.data.id];
        $("[name=leavesno]").val(selectedChequebook.leavesno);
        $("[name=charge]").val(selectedChequebook.charge);

        $("[name=startrange]").removeAttr("disabled");
        /*if ($("[name=startrange]").val().length > 0) {
            $("[name=endrange]")
                .val(parseInt($("[name=startrange]").val())
                    + parseInt(selectedChequebook.leavesno) - 1);
        }*/

        $.ajax(url_path + "/../LoadAccountChequesByChequeBookTypeId/" + e.params.data.id)
            .then(
                function (response) {
                    console.log(response);
                    if (response.length > 0 && (response["0"].startrange != null)) {

                        //console.log(response);
                        $("[name=startrange]").val(response["0"].endrange + 1).attr("disabled", true);
                        $("[name=endrange]").val(response["0"].endrange + response["0"].leavesno);
                        //$("[name=confirmationlimit]").val(response["0"].endrange);
                    } else if (response.length > 0 && (response["0"].isdeleted != null)) {
                        //we're just starting to allocate cheque to first customer
                        $("[name=startrange]").val("1").attr("disabled", true);
                        $("[name=endrange]").val(response["0"].leavesno);
                    }
                  },
                function (error) {
                    accountcheques = null;
                    swal({
                        title: "Validate Cheque",
                        type: "error",
                        text: "There was an error validating the cheque number ranges. Please try again."
                    });
                }
            );
    });

    $("#chequebooktypeid").on("select2:unselect", function (e) {
        $("[name=leavesno]").val(null);
        $("[name=charge]").val(null);

        $("[name=startrange]").val(null).attr("disabled", true);
        $("[name=endrange]").val(null);
    });

    $("#accountno").on("select2:select", function (e) {
        // Initialize accountcheques as constant
        accountcheques = REQUEST_IN_PROGRESS;
       // debugger
        $.ajax(url_path + "/../LoadAccountCheques/" + e.params.data.id)
            .then(
                function (response) {
                    accountcheques = response;
                    lenghtTracker = response;
                    
                   // if (response.length > 0) {
                    if (response == true) {
                     // console.log(response);
                      // $("[name=confirmationlimit]").val(response["0"].accountno);
                         return $.notify(
                            {
                                icon: "now-ui-icons travel_info",
                                message: "There is an existing cheque for account"
                            }, {
                                type: "danger",
                                placement: {
                                    from: "top",
                                    align: "right"
                                }
                            }
                        );
                    }
                   // $("[name=accountno]").val(null);.html("");
                    //$("[name=accountno]").empty();
                   // $("[name=accountno]").html("");
                    
                },
                function (error) {
                    accountcheques = null;
                    swal({
                        title: "Validate Cheque",
                        type: "error",
                        text: "There was an error validating the cheque number ranges. Please try again."
                    });
                }
        );

        setTimeout(console.log(accountcheques), 1000);
    });

    $("#accountno").on("select2:unselect", function (e) {
        accountcheques = undefined;
    });

    $("[name=startrange]").on("input", function (e) {
        if ($(e.target).valid()) {
            $("[name=endrange]")
                .val(parseInt(e.target.value) + parseInt(selectedChequebook.leavesno) - 1);
        }
    });
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

    $("#cheque-form").validate({
        rules: {
            startrange: {
                digits: true
            },
            confirmationlimit: {
                digits: true
            }
        },
        messages: {
            accountno: {
                required: "Account no. is required"
            },
            chequebooktypeid: {
                required: "Cheque book type is required"
            },
            startrange: {
                required: "Chequebook start range is required",
                digits: "Chequebook start range can only contain digits"
            },
            confirmationlimit: {
                digits: "Confirmation Limit can only contain digits"
            }
        }
        
    });

    
}

function openNewModal() {
    // hide/show form/table
    
    $("#cheque-form").closest("div.row").hide();
    $("#cheque-table").closest("div.row").show();

    $("#registerChequeModal").modal("show");
}

function AddCheque() {
    var form = $("#cheque-form");
    //var length = 0;
    if (!form.valid()) return;
    
    // Cheque start range validation
    var startRange = form.find("[name=startrange]").val();
    var valid = utilities.validateChequeNo(Number(startRange));
    if (!valid) return $.notify(
                    {
                        icon: "now-ui-icons travel_info",
                        message: "There is an existing cheque for account"
                    }, {
                        type: "danger",
                        placement: {
                            from: "top",
                            align: "right"
                        }
                    }
                );
            
    if (!valid) return; 
    debugger
    var data = {
        accountno: form.find("[name=accountno]").val(),
        chequebooktypeid: form.find("[name=chequebooktypeid]").val(),
        leavesno: form.find("[name=leavesno]").val(),
        charge: form.find("[name=charge]").val(),
        chequeconfirmationlimit: form.find("[name=confirmationlimit]").val(),
        startrange: startRange,
        endrange: form.find("[name=endrange]").val(),
        iscountercheque: form.find("[name=iscountercheque]").prop("checked"),
        tracker: ++tracker
    };
  
    $("#cheque-table").bootstrapTable("append", data);
    utilities.showChequeTable();
}

function Save() {
    // check if table isn't empty
    debugger
    var form = $("#cheque-form");
    var tableData = $("#cheque-table").bootstrapTable("getData");

    //confim if cheque has already been registered

   
    if (tableData.length == 0) {
        return $.notify(
            {
                icon: "now-ui-icons travel_info",
                message: "There are no entries to submit! Add new cheque request(s)"
            }, {
                type: "danger",
                placement: {
                    from: "top",
                    align: "right"
                }
            }
        );
    }

   

    swal({
        title: "Are you sure?",
        text: "Cheque request(s) will be submitted",
        type: "question",
        showCancelButton: true,
        confirmButtonColor: "#34D027",
        confirmButtonText: "Yes, continue",
        cancelButtonText: "No, stop!",
        cancelButtonColor: "#ff9800",
        showLoaderOnConfirm: true,
        preConfirm: function () {
            return new Promise(function (resolve) {
                setTimeout(function () {
                    resolve();
                }, 1000);
            });
        }
    }).then(
        function (isConfirm) {
            if (isConfirm) {
                var remark = $.trim($("[name=remark]").val());
                if (remark.length > 0) {
                    debugger
                    tableData = $.map(tableData, function (item) {
                        item["remark"] = remark;
                        return item;
                    });
                }
                $.ajax(
                    url_path + "/../AddChequeRequests",
                    {
                        method: "POST",
                        contentType: "application/json",
                        data: JSON.stringify(tableData)
                    }).then(
                        function (response) {
                            // show success message + refresh data-table 
                            // + close modal
                            $("#cheque-table").bootstrapTable("removeAll");
                            $("[name=remark]").val(null);
                            swal({
                                title: "Cheque request(s)",
                                type: "success",
                                text: "Cheque request(s) submitted successfully!"
                            });
                            $("#register-cheque-table").bootstrapTable("refresh");
                            $("#registerChequeModal").modal("hide");
                        },
                        function (error) {
                            // show error message
                            swal({
                                title: "Cheque request(s)",
                                type: "error",
                                text: "There was an error submitting the record(s). Please try again."
                            });
                        }
                    );
            }
        },
        function (isRejected) { return; }
    );
}

var utilities = {
    animDuration: 400,
    validateChequeNo: function (startRange) {
        if (accountcheques == undefined ||
            accountcheques == REQUEST_IN_PROGRESS) {
           // debugger
            // wait for request to begin or finish
           return setTimeout(utilities.validateChequeNo, 1000, startRange);
        }

        var dataTable = $("#cheque-table")
            .bootstrapTable("getData"),
            accountNo = $("#cheque-form")
                .find("[name=accountno]").val();

        dataTable = $.map(dataTable, function (item) {
            if (item.accountno !== accountNo) return null;
            return {
                accountno: item.accountno,
                start: Number(item.startrange),
                end: Number(item.endrange)
            };
        });

        
        // if no prior chequebooks in db & data-table
        //console.log(accountcheques.length);
        //console.log(accountcheques);
        console.log(lenghtTracker.length);
        console.log(lenghtTracker);
        lenghtTracker
        debugger
        // if (accountcheques.length == 0) 
        if (accountcheques == false)   
               return true;

           // && dataTable.length == 0) return true;

       // if (accountcheques.length > 0)
        if (accountcheques == true)
             return false;

        // get highest end value of chequebooks
        var highestEndRange = accountcheques.reduce(
            function (a, b) {
                return Math.max(a, b.end);
            }, 0
        );
        highestEndRange = dataTable.reduce(
            function (a, b) {
                return Math.max(a, b.end);
            }, highestEndRange
        );
        
        if (startRange <= highestEndRange) {
            swal({
                title: "Validate Cheque",
                type: "error",
                text: "The cheque start range has been used." +
                    " Please use a number greater than " + highestEndRange
            });
            return false;
        }
        return true;
    },
    deleteChequeFormatter: function (val, row, index) {
        return [
            "<button class='btn btn-danger btn-icon' ",
            "onclick='utilities.removeCheque(" + row.tracker + ")'>",
            "<i class='now-ui-icons ui-1_simple-remove'>",
            "</i></button>"
        ].join("");
    },
    removeCheque: function (tracker) {
        $("#cheque-table").bootstrapTable("removeByUniqueId", tracker);
    },
    chequeDetailFormatter: function (index, row, el) {
        var container = $("<div class='row mx-0'></div>");
        container.append($("<div class='col-xs-12 col-md-6 mb-3 mt-2'><b class='pull-left'>Start Range:</b> "
            + "<span class='pull-right'>" + row.startrange + "</span></div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-3 mt-2'><b class='pull-left'>End Range:</b> "
            + "<span class='pull-right'>" + row.endrange + "</span></div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-2'><b class='pull-left'>Remark:</b> "
            + "<span class='pull-right'>" + (row.remark == null ? "-" : row.remark) + "</span></div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-2'><b class='pull-left'>Date Created:</b> "
            + "<span class='pull-right'>" + moment(row.datecreated).format("MMMM DD, YYYY") + "</span></div>"));
        el.append(container);
    },
    counterChequeFormatter: function (val) {
        if (val) return "Yes";
        return "No";
    },
    chequeTypeDetailFormatter: function (val) {
        return chequebooktypes[val].chequetype
    },
    showChequeForm: function () {
        // clear form
        $.ajax(url_path + "/../LoadCurrentAccounts")
            .then(function (response) {
                $("#accountno").select2({
                    placeholder: "Select account",
                    data: response
                   // data: ["01100123453", "00897878721", "23835292834"]
                });
            });
        $("#cheque-form").trigger("reset");
        $("#cheque-form select").val(null)
            .trigger("select2:unselect")
            .trigger("change");
        
        // form-enter/table-leave animation
        $("#cheque-table").closest("div.row")
            .slideToggle({
                duration: utilities.animDuration,
                queue: false
            });
        $("#cheque-form").closest("div.row")
            .slideToggle({
                duration: utilities.animDuration,
                queue: false
            });
    },
    showChequeTable: function () {
       
        // table-enter/form-leave animation
        $("#cheque-table").closest("div.row")
            .slideToggle({
                duration: utilities.animDuration,
                queue: false
            });
        $("#cheque-form").closest("div.row")
            .slideToggle({
                duration: utilities.animDuration,
                queue: false
            });
    }
};