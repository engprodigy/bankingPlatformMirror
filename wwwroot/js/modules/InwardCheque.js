var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) == '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}

var products = {}, chartofaccounts = {}, ChequeAmount,
    DiscountChargeObj, ReturnChargeObj, COTObj, AccountObj,
    AccountCheques, AccountChequeLeaves, AmountDifference,
    inwardbankcheque = {},
    REQUEST_IN_PROGRESS = "request_in_progress";

$(document).ready(function () {
    pullSecondaryData();
    initSelectTwoConfig();
    initEventListeners();
    initFormValidations();
    initDatePicker();
    $(".modal").perfectScrollbar();
});

function pullSecondaryData() {
    // Pull default charges data
    $.ajax(url_path + "/../../Setup/LoadChequeCharges")
        .then(function (response) {
            $.each(response, function (index, item) {
                if (item.isdiscountcharge) {
                    DiscountChargeObj = item;
                } else {
                    ReturnChargeObj = item;
                }
            });
        });

    // Pull COT data
    $.ajax(url_path + "/../../Setup/LoadCOT")
        .then(function (response) {
            if (response.length == 0) {
                COTObj = null;
            } else {
                COTObj = response[0];
            }
        });
}
 
function initDataTable() {
    // Initialize table after API objects have been loaded
    $("#inward-cheque-table").bootstrapTable({});
}

function initDatePicker() {
    $(".datepicker").length != 0 && $(".datepicker").datetimepicker({
        format: "YYYY-MM-DD",
        icons: {
            time: "now-ui-icons tech_watch-time",
            date: "now-ui-icons ui-1_calendar-60",
            up: "fa fa-chevron-up",
            down: "fa fa-chevron-down",
            previous: "now-ui-icons arrows-1_minimal-left",
            next: "now-ui-icons arrows-1_minimal-right",
            today: "fa fa-screenshot",
            clear: "fa fa-trash",
            close: "fa fa-remove"
        }
    })
}

function initSelectTwoConfig() {
    $.fn.select2.defaults.set("theme", "bootstrap4");
    $.fn.select2.defaults.set("dropdownParent", $(".modal").first());
    $.fn.select2.defaults.set("width", "100%");
    $.fn.select2.defaults.set("allowClear", true);
    var form = $("#inward-cheque-form");

    $.ajax(url_path + "/../../Setup/LoadChartOfAccount")
        .then(function (response) {
            /*form.find("#principalglid").select2({
                placeholder: "Select principal ledger",
                data: response
            });*/
            
            var responseDate = response;
            form.find("#chargeglid").select2({
                placeholder: "Select ledger",
                data: response
            });
            $.each(response, function (index, item) {
                chartofaccounts[item.id] = item.text;
            });
            initDataTable();
        });

    $.ajax(url_path + "/../LoadCurrentAccounts")
        .then(function (response) {
            form.find("#casaaccountno").select2({
                placeholder: "Select account number",
                data: response
                //data: ["01100123453", "00897878721", "23835292834"]
            });
        });
    $.ajax(url_path + "/../LoadInwardCheques")
        .then(function (response) {
            inwardbankcheque = {};
                $.each(response, function (index, item) {
                    inwardbankcheque[item.casaaccountno] = item.principalglid; 
                });  
           
        });

    $.ajax(url_path + "/../LoadProducts")
        .then(function (response) {
            $.each(response, function (index, item) {
                products[item.id] = item;
            });
        });

    // Event Listeners
    $(document).on("select2:open", function () {
        $('.select2-results__options').perfectScrollbar();
    });

   
}

function initEventListeners() {
    var form = $("#inward-cheque-form");

    form.find("#casaaccountno")
        .on("select2:select", function (e) {
            utilities.clearDetails();
            
            var casaccountNumber = e.params.data.id;
            var productId;
            // request account info
            
            $.ajax(url_path + "/../LoadCASAMandates/"
                + e.params.data.id)
                .then(function (response) {
                    // store values
                    AccountObj = {};
                    AccountObj.name = response.accountName;
                    AccountObj.number = response.accountNumber;
                    AccountObj.balance = response.availableBalance;
                    productId = response.ProductID;

                    // enable amount input control & trigger it's change event
                    form.find("#amount").removeAttr("disabled");
                    form.find("#amount").trigger("change");
                    //debugger
                    // load info into view
                    form.find("#accountno").text(response.accountNumber);
                    form.find("#accountname").text(response.accountName);
                    
                    //alert(inwardbankcheque[casaccountNumber]);
                    //alert(chartofaccounts[inwardbankcheque[casaccountNumber]]);
                    
                   // form.find("#principalglid").val(chartofaccounts[inwardbankcheque[casaccountNumber]]);
                   
                    utilities.WriteAmount(
                        Number(response.availableBalance),
                        form.find("#balance")
                    );
                    form.find("#productname").text(
                        utilities.getProductName(response.productID)
                    );

                    
                });
            $.ajax(url_path + "/../LoadPrincipalGlId/"
                + e.params.data.id)
                .then(function (response) {
                    
                    form.find("#principalglid").val(chartofaccounts[response]);
                    // load data into data-table
                    $("#casa-mandate-table")
                        .bootstrapTable("load", utilities.filterMandates(response.tblMandate));
                });

            // Load account chequebooks / chequeleaves
            $.ajax(url_path + "/../LoadDetailedAccountCheques/" + e.params.data.id)
                .then(
                    function (response) {
                        AccountCheques = [];
                        AccountChequeLeaves = {
                            stopped: [],
                            used: []
                        };
                        $.each(response, function (i, item) {
                            AccountCheques.push([item.startrange, item.endrange]);
                            $.each(item.tblChequeleavesdetail, function (i, obj) {
                                if (obj.leafstatusNavigation.status == "STOPPED") {
                                    AccountChequeLeaves.stopped.push(obj.leafno);
                                } else {
                                    AccountChequeLeaves.used.push(obj.leafno);
                                }
                            });
                        });
                    },
                    function (error) {
                        AccountCheques = null;
                        AccountChequeLeaves = null;
                        swal({
                            title: "Validate Cheque No.",
                            type: "error",
                            text: "There was an error loading account cheques!"
                        });
                    }
                );
        })
        .on("select2:unselect", function (e) {
            AccountObj = undefined;
            utilities.clearDetails();

            // disable & clear amount input control
            form.find("#amount").val("")
                .attr("disabled", true)
                .trigger("change");

             
        }
    );

    form.find("#otherreturn").on("change",
        function () {
            // reset charges control
            utilities.clearCheckBoxes();
            if (this.checked) {
                // hide charges control
                $(".charges-control")
                    .slideUp();
            } else {
                // show charges control
                $(".charges-control")
                    .slideDown();
            }
        }
    );

    form.find("#discount").on("change",
        function () {
            if (this.checked) {
                utilities.initChargeBox("Discount");
            }
        }
    ); 

    form.find("#return").on("change",
        function () {
            if (this.checked) {
                utilities.initChargeBox("Return");
            }
        }
    );

    form.find("#amountdifference").on("change",
        function () {
            var form = $("#inward-cheque-form");
            var value = UnFormatMoney(this.value);

            if (value < 0) {
                // Enable Other return cheque control
                utilities.enableDisableOtherReturn(true, form.find("#otherreturn"));
                // show charges control
                $(".charges-control")
                    .slideDown();
                // re-calculate charge (if necessary)
                if (form.find("#discount").prop("checked") || form.find("#return").prop("checked")) {
                    form.find("#chargepercent").trigger("change");
                }
            } else {
                // clear & disable Other return cheque control
                utilities.enableDisableOtherReturn(false, form.find("#otherreturn"));
                // hide charges control
                $(".charges-control")
                    .slideUp();
            }
        }
    );

    form.find("#amount").on("change",
        function () {
            var form = $("#inward-cheque-form");
            var value = $.trim(this.value).replace(/,/g, "");

            // if amount is a valid input
            if ($.isNumeric(value)) {
                if (Number(value) <= 0) {
                    this.value = '';
                    $.notify(
                        {
                            icon: "now-ui-icons travel_info",
                            message: "Cheque amount must exceed 0!"
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
                    ChequeAmount = Number(value);

                    // enable disabled controls
                    utilities.ChargeCOTSwitch(true); // for COT           

                    form.find(".charges-control, .charges-control > .form-check")
                        .removeClass("disabled");
                    form.find(".charges-control input")
                        .removeAttr("disabled");

                    // calculate & write COT (if checked)
                    debugger
                    if (form.find("#chargecot").prop("checked")) {
                        utilities.WriteCOTAmount(true);
                        return;
                    }
                    
                    // calculate & write amount difference
                   // AmountDifference = Number(AccountObj.balance - ChequeAmount);
                   // var COTCharge = (COTObj.feeAmount / COTObj.minTransactionAmount)
                   //     * ChequeAmount;
                    //AmountDifference = Number(ChequeAmount - COTCharge);
                    AmountDifference = Number(ChequeAmount);
                    return utilities
                        .WriteInputAmount(AmountDifference, form.find("#amountdifference"));
                } 
            }

            // disable associated controls
            utilities.ChargeCOTSwitch(false); // for COT

            form.find(".charges-control, .charges-control > .form-check")
                .addClass("disabled");
            form.find(".charges-control input")
                .attr("disabled", true);

            // erase amount difference
            utilities.WriteInputAmount(0, form.find("#amountdifference"));
        }
    );

    form.find("#chargecot").on("change",
        function () {
            // check if COT object is available
            if (this.checked && COTObj == null) {
                utilities.WriteCOTAmount(false);
                form.find("#chargecot").prop("checked", false);
                return $.notify(
                    {
                        icon: "now-ui-icons travel_info",
                        message: "Cannot enable COT charge because COT setup have not been completed!"
                    },
                    {
                        type: "danger",
                        placement: {
                            from: "top",
                            align: "right"
                        }
                    }
                );
            }
            utilities.WriteCOTAmount(this.checked);
        }
    );

    form.find("#chargepercent")
        .on("change", utilities.calculateChargeAmount);


   
        $("[name=chequeleaveno]").on("mouseleave", function (e) {
        if ($(e.target).valid()) {
           
            var form = $("#inward-cheque-form");
            var accountNo = form.find("[name=casaaccountno]").val();
            bankchequedetail = {};
            bankchequedetail["accountnumber"] = accountNo; 
            bankchequedetail["chequeleaveno"] = e.target.value;
            $.ajax(url_path + "/../ConfirmChequeLeaveNoStatus/",
                {
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(bankchequedetail)
                })
                .then(
                    function (response) {
                      
                        if (response) {
                            form.find("[name=chequeleaveno]").val("");
                            return $.notify(
                                {
                                    icon: "now-ui-icons travel_info",
                                    message: "Cheque Leaf as been used or has been stopped or has been logged for approval"
                                },
                                {
                                    type: "danger",
                                    placement: {
                                        from: "top",
                                        align: "right"
                                    }
                                }
                            );

                        }

                        
                    },
                    function (error) {
                        AccountCheques = null;
                        AccountChequeLeaves = null;
                        swal({
                            title: "Validate Cheque No.",
                            type: "error",
                            text: "There was an error loading account cheques!"
                        });
                    }

            );

        }
        });

    $("[name=chequeleaveno]").on("change", function (e) {
        if ($(e.target).valid()) {
            // e.target.value;
            //$("[name=endrange]")
            //.val(parseInt(e.target.value) + parseInt(selectedChequebook.leavesno) - 1);
            //$.ajax(url_path + "/../ConfirmChequeLeaveNoStatus/" + e.target.value)
            debugger
            var form = $("#inward-cheque-form");
            var accountNo = form.find("[name=casaaccountno]").val();
            bankchequedetail = {};
            bankchequedetail["accountnumber"] = accountNo;
            bankchequedetail["chequeleaveno"] = e.target.value;
            $.ajax(url_path + "/../ConfirmChequeLeaveNoStatus/",
                {
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(bankchequedetail)
                })
                .then(
                    function (response) {
                        //  var form = $("#inward-cheque-form");
                        //form.find("[name=chequeleaveno]").val("");
                        if (response) {
                            form.find("[name=chequeleaveno]").val("");
                            return $.notify(
                                {
                                    icon: "now-ui-icons travel_info",
                                    message: "Cheque Leave as been used or has been stopped"
                                },
                                {
                                    type: "danger",
                                    placement: {
                                        from: "top",
                                        align: "right"
                                    }
                                }
                            );

                        }


                    },
                    function (error) {
                        AccountCheques = null;
                        AccountChequeLeaves = null;
                        swal({
                            title: "Validate Cheque No.",
                            type: "error",
                            text: "There was an error loading account cheques!"
                        });
                    }

                );

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

    $("#inward-cheque-form").validate({
        rules: {
            amount: {
                number: true
            },
            chargepercent: {
                number: true
            }
        },
        messages: {
            casaaccountno: {
                required: "Please select an account"
            },
            amount: {
                required: "Please insert an amount",
                number: "Amount is not a valid number"
            },
            chequeleaveno: {
                required: "Cheque number is required",
            },
            principalglid: {
                required: "Please select principal ledger",
            },
            discountgl: {
                required: "Please select discount ledger",
            },
            transactiondate: {
                required: "Transaction date is required"
            },
            chargepercent: {
                required: "Charge rate is required",
                number: "Charge rate is not a valid number"
            },
            chargeglid: {
                required: "Charge ledger must be selected"
            },
            "charge-type": {
                required: "One of the charge types must be selected"
            }
        },
        ignore: ":hidden:not(.always-validate)"
    });
}

function openNewModal() {
    $("#inwardChequeModal").modal("show");
}

function runValidations() {
    // check if cheque validation resources are loaded
    debugger
    if (AccountCheques == null
        || AccountChequeLeaves == null) {
        swal({
            title: "Cheque Validations",
            type: "error",
            text: "There was an error loading account cheques'" +
                " information! Please refresh and try again."
        });
        return false;
    }

    var form = $("#inward-cheque-form");
    var chequeno = Number(form.find("#chequeleaveno").val());
    var isOtherReturnCheque = form.find("#otherreturn").prop("checked");

    // if cheque exists
    var chequeExists = false;
    var index, len;
    for (index = 0, len = AccountCheques.length; index < len; ++index) {
        if (chequeno >= AccountCheques[index][0]
            && chequeno <= AccountCheques[index][1]) {
            chequeExists = true;
            break;
        }
    }
    if (!chequeExists) {
        swal({
            title: "Inward Cheque Clearing",
            type: "error",
            text: "The supplied cheque number does not exist amongst the customer's" +
                " cheques! Please check the number again."
        });
        return false;
    }

    // if cheque isn't stopped / blocked
    if ($.inArray(chequeno, AccountChequeLeaves.stopped) !== -1) {
        swal({
            title: "Inward Cheque Clearing",
            type: "error",
            text: "The supplied cheque number has been stopped!"
        });
        return false;
    }

    // detect if cheque is used
    var isUsedCheque = $.inArray(chequeno, AccountChequeLeaves.used) !== -1;

    // if "Other Return Cheque" is checked, cheque must have been used
    if (isOtherReturnCheque && !isUsedCheque) {
        swal({
            title: "Inward Cheque Clearing",
            type: "error",
            text: "The supplied cheque number have not been previously used."
                + " Cannot select 'Other return cheque'!"
        });
        return false;
    }

    // if "Other Return Cheque" is unchecked, cheque mustn't have been used
    if (!isOtherReturnCheque && isUsedCheque) {
        swal({
            title: "Inward Cheque Clearing",
            type: "error",
            text: "The supplied cheque number have already been used!"
        });
        return false;
    }


    if ($.inArray(chequeno, AccountChequeLeaves.stopped) !== -1) {
        swal({
            title: "Inward Cheque Clearing",
            type: "error",
            text: "The supplied cheque number has been stopped!"
        });
        return false;
    }

    return true;
}

function save() {
    // Validate form
    var form = $("#inward-cheque-form");
    if (!form.valid()) return;

    if (!runValidations()) return;
    debugger
    swal({
        title: "Are you sure?",
        text: "Inward cheque would be lodged",
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

                var form_data = {};

                $.each(form.serializeArray(), function (index, item) {
                    form_data[item.name] = item.value;
                });

                // include account name
                form_data.casaaccountname = AccountObj.name;

                if (form_data.reusecheque != undefined) {
                    form_data.reusecheque = true;
                } else {
                    form_data.reusecheque = false;
                }
                if (form_data.otherreturn != undefined) {
                    form_data.otherreturn = true;
                } else {
                    form_data.otherreturn = false;
                }
                if (form_data.chargecot != undefined) {
                    form_data.chargecot = true;
                } else {
                    // remove cot value if not charged
                    form_data.chargecot = false;
                    delete form_data.cotamount;
                }

                // check if charges data should be collated
                if (form_data["charge-type"] != undefined) {
                    delete form_data["charge-type"];
                    if (form.find("#discount").prop("checked")) {
                        form_data.isdiscountcharge = true;
                        form_data.isreturncharge = false;
                    } else {
                        form_data.isdiscountcharge = false;
                        form_data.isreturncharge = true;
                    }
                } else {
                    delete form_data.chargeamount;
                    delete form_data.chargepercent;
                    delete form_data.chargeglid;
                }

                $.ajax(
                    url_path + "/../LodgeInwardCheque",
                    {
                        method: "POST",
                        contentType: "application/json",
                        data: JSON.stringify(form_data)
                    }).then(
                        function (response) {
                            clearForm();
                            swal({
                                title: "Lodge Inward Request",
                                type: "success",
                                text: "Inward cheque lodged successfully!"
                            });
                            $("#inward-cheque-table").bootstrapTable("refresh");
                            $("#inwardChequeModal").modal("hide");
                        },
                        function (error) {
                            swal({
                                title: "Lodge Inward Request",
                                type: "error",
                                text: "There was an error lodging the cheque. Please try again."
                            });
                        }
                    );
            }
        },
        function (isRejected) { return; }
    );
}

function clearForm() {
    var form = $("#inward-cheque-form");
    form.trigger("reset");
    form.find("select").trigger("change");
    utilities.clearDetails();
    form.find("#amount").trigger("change");
}

var utilities = {
    inwardDetailFormatter: function (index, row, el) {
        var container = $("<div class='row mx-0'></div>");
        container.append(
            $("<div class='col-xs-12 col-md-6 mb-3 mt-2'>"
                + "<b class='text-muted pull-left'>Discount Ledger:</b> "
                + "<span class='pull-right'>" + utilities.COAFormatter(row.discountglid) + "</span></div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-3 mt-2'>"
            + "<b class='text-muted pull-left'>Transaction Date:</b> "
            + "<span class='pull-right'>" + utilities.dateFormatter(row.transactiondate) + "</span></div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-3'>"
            + "<b class='text-muted pull-left'>Charge COT:</b> "
            + "<span class='pull-right'>" + (row.chargecot ? "Yes" : "No") + "</span></div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-3'>"
            + "<b class='text-muted pull-left'>Reuse Cheque:</b> "
            + "<span class='pull-right'>" + (row.reusecheque ? "Yes" : "No") + "</span></div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-2'>"
            + "<b class='text-muted pull-left'>Other Return Cheque:</b> "
            + "<span class='pull-right'>" + (row.chequereturnable ? "Yes" : "No") + "</span></div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-2'>"
            + "<b class='text-muted pull-left'>Remarks:</b> "
            + "<span class='pull-right'>" + row.remarks + "</span></div>"));
        el.append(container);
    },
    mandateDetailFormatter: function (index, row, el) {
        var container = $("<div class='row justify-content-space-between mx-0'></div>");
        container.append(
            $("<div class='col-xs-12 col-md-4 mb-3 mt-2'>"
                + "<img alt='signature' src='" + url_path + "/../../img/tcb-spinner.svg' "
                + " class='image-fit signature' />"
                + "<label class='w-100 text-center font-weight-bold'>Signature</label>"
                + "</div>"));
        container.append(
            $("<div class='col-xs-12 col-md-4 mb-3 mt-2'>"
                + "<img alt='passport' src='" + url_path + "/../../img/tcb-spinner.svg' "
                + " class='image-fit passport' />"
                + "<label class='w-100 text-center font-weight-bold'>Passport</label>"
                + "</div>"));
        container.append(
            $("<div class='col-xs-12 col-md-4 mb-3 mt-2'>"
                + "<img alt='thumbprint' src='" + url_path + "/../../img/tcb-spinner.svg' "
                + " class='image-fit thumbprint' />"
                + "<label class='w-100 text-center font-weight-bold'>Thumbprint</label>"
                + "</div>"));
        el.append(container);

        // get mandate document lists
        $.ajax(url_path + "/../LoadMandateDocList/" + row.mandateID)
            .then(function (response) {
                if (!response.length) return;
                utilities.getMandateSignature(response, el);
                utilities.getMandatePassport(response, el);
                utilities.getMandateThumbprint(response, el);
            });
    },
    getMandateSignature: function (docList, el) {
        var docArray = $.grep(docList, function (item) {
            return item.description.trim()
                .toLowerCase() == "signature";
        });

        if (docArray.length == 0) {
            // swap image to no file
            el.find(".signature")
                .attr("src", "/img/no-image.png");
        } else {
            // change source of image element
            el.find(".signature")
                .attr("src", url_path + "/../LoadMandateDoc/"
                    + docArray[0].fileID);
        }
    },
    getMandatePassport: function (docList, el) {
        var docArray = $.grep(docList, function (item) {
            return item.description.trim()
                .toLowerCase() == "passport";
        });

        if (docArray.length == 0) {
            // swap image to thumbnail
            el.find(".passport")
                .attr("src", "/img/no-image.png");
        } else {
            // change source of image element
            el.find(".passport")
                .attr("src", url_path + "/../LoadMandateDoc/"
                    + docArray[0].fileID);
        }
    },
    getMandateThumbprint: function (docList, el) {
        var docArray = $.grep(docList, function (item) {
            return item.description.trim()
                .toLowerCase() == "thumbprint";
        });

        if (docArray.length == 0) {
            // swap image to no file
            el.find(".thumbprint")
                .attr("src", "/img/no-image.png");
        } else {
            // change source of image element
            el.find(".thumbprint")
                .attr("src", url_path + "/../LoadMandateDoc/"
                    + docArray[0].fileID);
        }
    },
    booleanFormatter: function (val) {
        return val ? "Yes" : "No";
    },
    dateFormatter: function (date) {
        return moment(date).format("DD MMMM, YYYY");
    },
    COAFormatter: function (value) {
        return chartofaccounts[value];
    },
    ChargeCOTSwitch: function (action) {
        var form = $("#inward-cheque-form");
        if (action == true) {
            // enable COT charge control
            form.find("#chargecot").removeAttr("disabled");
            form.find("#cot-box, #cot-box > .form-check").removeClass("disabled");
        } else {
            // remove COT amount & uncheck charge-cot control
            form.find("[name=cotamount]").val(0);
            form.find("#chargecot").prop("checked", false)
            // disable COT charge control
            form.find("#chargecot").attr("disabled", true);
            form.find("#cot-box, #cot-box > .form-check").addClass("disabled");
        }
    },
    WriteCOTAmount: function (action) {
        if (action) {
            // calculate & write COT
            var COTCharge = (COTObj.feeAmount / COTObj.minTransactionAmount)
                * ChequeAmount;
            
            AmountDifference = Number(ChequeAmount - COTCharge);
            $("#inward-cheque-form [name=cotamount]")
                .val(FormatMoney(COTCharge));
            $("#inward-cheque-form [name=amountdifference]")
                .val(FormatMoney(AmountDifference));
        } else {
            $("#inward-cheque-form [name=cotamount]").val(0);
            $("#inward-cheque-form [name=amountdifference]")
                .val(FormatMoney(ChequeAmount));
        }
    },
    clearDetails: function () {
        var form = $("#inward-cheque-form");

        // clear previous values
        form.find("#accountno").text("-");
        form.find("#accountname").text("-");
        form.find("#balance").text("-");
        form.find("#productname").text("-");

        // clear data-table
        $("#casa-mandate-table").bootstrapTable("removeAll");

        // clear account cheques
        AccountCheques = REQUEST_IN_PROGRESS;
        AccountChequeLeaves = REQUEST_IN_PROGRESS;
    },
    clearCheckBoxes: function () {
        $("#charges-box").slideUp();
        $("input[name=charge-type]")
            .prop("checked", false);
    },
    enableDisableOtherReturn: function (action, element) {
        if (action) {
            // Enable Other return cheque control
            element.removeAttr("disabled");
            // show charges control
            element.closest(".form-check").parent().removeClass("disabled");
            $(".charges-control")
                .slideUp();
        } else {
            // Clear & Disable Other return cheque control
            element.prop("checked", false);
            element.attr("disabled", true);
            element.closest(".form-check").parent().addClass("disabled");
            // reset and hide charges control
            utilities.clearCheckBoxes();
            $(".charges-control")
                .slideUp();
        }
    },
    initChargeBox: function (charge) {
        // do renames
        var box = $("#charges-box");
        box.find("#charge-header").text(charge);
        box.find(".charge-swap").text(charge);

        // clear user inputs
        box.find("select").val(null).trigger("change");

        // load default data (if defined)
        if (charge == "Discount") {
            if (DiscountChargeObj != undefined) {
                utilities.populateCharges(DiscountChargeObj, box);
            }
        } else {
            if (ReturnChargeObj != undefined) {
                utilities.populateCharges(ReturnChargeObj, box);
            }
        }
        // show charge box
        $("#charges-box").slideDown();
    },
    getProductName: function (id) {
        return products[id].productName;
    },
    filterMandates: function (mandates) {
        return $.grep(mandates, function (item) {
            return item.isDeleted == false;
        });
    },
    populateCharges: function (chargeObj, container) {
        container.find("#chargeglid")
            .val(chargeObj.accountledgerid)
            .trigger("change");
        container.find("#chargepercent")
            .val(chargeObj.percentage);
        // re-calculate charge percentage
        utilities.calculateChargeAmount();
    },
    calculateChargeAmount: function () {
        var rate = Number(
            $("#charges-box").find("#chargepercent").val()
        );
        if (rate == NaN) {
            return $("#charges-box").find("#chargeamount").val("");
        }
        var charge = (rate / 100) * Math.abs(AmountDifference);
        utilities.WriteInputAmount(charge, $("#charges-box")
            .find("#chargeamount"));
    },
    WriteInputAmount: function (amount, domElement) {
        if (amount >= 0) {
            domElement.removeClass("text-danger")
                .addClass("text-success")
                .val(FormatMoney(amount));
        } else {
            domElement.removeClass("text-success")
                .addClass("text-danger")
                .val(FormatMoney(amount));
        }
        domElement.trigger("change");
    },
    WriteAmount: function (balance, domText) {
        if (balance >= 0) {
            domText.removeClass("text-danger")
                .addClass("text-success")
                .text(FormatMoney(balance));
        } else {
            domText.removeClass("text-success")
                .addClass("text-danger")
                .text(FormatMoney(balance));
        }
    },
};