var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) == '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}

var AccountObj, chartofaccounts = {}, stampDutyAmount;
var ApprovalStatus = {
    INENTRYSTATE: 1,
    APPROVED: 2,
    DISAPPROVED: 3,
    AMMEND: 4,
    PENDING: 5,
    CANCELLED: 6
}

$(document).ready(function () {
     initSelectTwoConfig();
     initEventListeners();
     initFormValidations();
     initDatePicker();
    $(".modal").perfectScrollbar();
});

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

    $("#outward-cheque-form, #edit-outward-form")
        .each(function () {
            $(this).validate({
                rules: {
                    amount: {
                        number: true
                    }
                },
                messages: {
                    accountno: {
                        required: "Please select an account"
                    },
                    amount: {
                        required: "Please insert an amount",
                        number: "Amount is not a valid number"
                    },
                    chequeno: {
                        required: "Cheque number is required", 
                    },
                    bankledgerid: {
                        required: "Please select the bank ledger",
                    },
                    chequedate: {
                        required: "Cheque date is required"
                    }
                },
                ignore: []
            });
        });
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

function openModal() {
    clearForm();
    $("#outwardChequeModal").modal("show");
}

function initEventListeners() {
    var form = $("#outward-cheque-form");
    var table = $("#outward-cheque-table");

    form.find("#accountno")
        .on("select2:select", function (e) {
            utilities.clearDetails();

            // request account info
            $.ajax(url_path + "/../LoadCASAMandates/"
                + e.params.data.id)
                .then(function (response) {
                    // store values
                    AccountObj = {};
                    AccountObj.name = response.accountName;
                    AccountObj.number = response.accountNumber;
                    AccountObj.balance = response.availableBalance;

                    // load info into view
                    form.find("#accountnolabel").text(response.accountNumber);
                    form.find("#accountname").text(response.accountName);
                    utilities.WriteAmount(
                        Number(response.availableBalance),
                        form.find("#balance")
                    );
                    form.find("#productname").text(
                        utilities.getProductName(response.productID)
                    );

                    // load data into data-table
                    $("#casa-mandate-table")
                        .bootstrapTable("load", utilities.filterMandates(response.tblMandate));
                });
        })
        .on("select2:unselect", function (e) {
            AccountObj = undefined;
            utilities.clearDetails();
        });

    $("#update-accountno")
        .on("select2:select", function (e) {
            utilities.clearUpdateDetails();

            // request account info
            $.ajax(url_path + "/../LoadCASAMandates/"
                + this.value)
                .then(function (response) {
                    // store values
                    AccountObj = {};
                    AccountObj.name = response.accountName;
                    AccountObj.number = response.accountNumber;
                    AccountObj.balance = response.availableBalance;

                    // load info into view
                    $("#update-accountnolabel").text(response.accountNumber);
                    $("#update-accountname").text(response.accountName);
                    utilities.WriteAmount(
                        Number(response.availableBalance),
                        $("#update-balance")
                    );
                    $("#update-productname").text(
                        utilities.getProductName(response.productID)
                    );

                    // load data into data-table
                    $("#update-casa-mandate-table")
                        .bootstrapTable("load", utilities.filterMandates(response.tblMandate));
                });
        })
        .on("select2:unselect", function (e) {
            AccountObj = undefined;
            utilities.clearUpdateDetails();
        });

    $("#amount,#update-amount")
        .on("change", function () {
            var value = $.trim(this.value).replace(/,/g, "");
            if ($.isNumeric(value) && Number(value) <= 0) {
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
            }
        });

    form.find("#chargestampduty")
        .on("change", function () {
            if (this.checked) {
                if (stampDutyAmount == undefined) {
                    return $.ajax(url_path + "/../../Setup/LoadStampDuty")
                        .then(
                            function (response) {
                                if (response == []) {
                                    stampDutyAmount = null;
                                    return utilities.hideNotifyStampCharge();
                                }
                                stampDutyAmount = response[0];
                                utilities.showStampCharge();
                            }
                        );
                } else if (stampDutyAmount == null) {
                    utilities.hideNotifyStampCharge();
                } else {
                    utilities.showStampCharge();
                }
            } else {
                $("#stamp-duty-amount").parent()
                    .addClass("d-none");
            }
        });

    table.find("[name=table-select-all]")
        .on("change", function () {
            var rows = table
                .find("[name=table-select-item]:not([disabled])");
            if (rows.length) {
                if (this.checked) {
                    rows.prop("checked", true);
                } else {
                    rows.prop("checked", false);
                }
                rows.trigger("change");
            }
        });

    $("#update-chargestampduty")
        .on("change", function () {
            if (this.checked) {
                if (stampDutyAmount == undefined) {
                    return $.ajax(url_path + "/../../Setup/LoadStampDuty")
                        .then(
                            function (response) {
                                if (response == []) {
                                    stampDutyAmount = null;
                                    return utilities.hideNotifyUpdateStampCharge();
                                }
                                stampDutyAmount = response[0];
                                utilities.showUpdateStampCharge();
                            }
                        );
                } else if (stampDutyAmount == null) {
                    utilities.hideNotifyUpdateStampCharge();
                } else {
                    utilities.showUpdateStampCharge();
                }
            } else {
                $("#update-stamp-duty-amount").parent()
                    .addClass("d-none");
            }
        });
}

function onCheckHandler(input) {
    var table = $("#outward-cheque-table");
    var row = table.bootstrapTable("getRowByUniqueId", input.id);
    if (input.checked) {
        row.check = true;
    } else {
        row.check = false;
    }
    table.bootstrapTable("updateByUniqueId", {
        id: input.id,
        row: row
    });
}

function save() {
    // Validate form
    var form = $("#outward-cheque-form");
    if (!form.valid()) return;

    swal({
        title: "Are you sure?",
        text: "Outward cheque would be lodged",
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
            var form_data = {};

            $.each(form.serializeArray(), function (index, item) {
                form_data[item.name] = item.value;
            });

            // include charge stamp duty
            if (form_data.chargestampduty != undefined) {
                form_data.chargestampduty = true;
                form_data.chargestampamount = stampDutyAmount.charge;
            } else {
                form_data.chargestampduty = false;
            }

            $.ajax(
                url_path + "/../LodgeOutwardCheque",
                {
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(form_data)
                }).then(
                    function (response) {
                        clearForm();
                        swal({
                            title: "Lodge Outward Cheque",
                            type: "success",
                            text: "Outward cheque lodged successfully!"
                        });
                        $("#outward-cheque-table").bootstrapTable("refresh");
                        $("#outwardChequeModal").modal("hide");
                    },
                    function (error) {
                        swal({
                            title: "Lodge Outward Cheque",
                            type: "error",
                            text: "There was an error lodging the cheque. Please try again."
                        });
                    }
                );
        },
        function (isRejected) { return; }
    );
}

function Update() {
    // Validate form
    var form = $("#edit-outward-form");
    if (!form.valid()) return;

    swal({
        title: "Are you sure?",
        text: "Outward cheque would be updated",
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
            var form_data = {};

            $.each(form.serializeArray(), function (index, item) {
                form_data[item.name] = item.value;
            });

            // include charge stamp duty
            if (form_data.chargestampduty != undefined) {
                form_data.chargestampduty = true;
                form_data.chargestampamount = stampDutyAmount.charge;
            } else {
                form_data.chargestampduty = false;
            }

            $.ajax(
                url_path + "/../UpdateOutwardCheque",
                {
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(form_data)
                }).then(
                function (response) {
                    $("#outward-cheque-table").bootstrapTable("refresh");
                    $("#outward-update-modal").modal("hide");
                    swal({
                        title: "Update Outward Cheque",
                        type: "success",
                        text: "Outward cheque updated successfully!"
                    });     
                },
                function (error) {
                    swal({
                        title: "Update Outward Cheque",
                        type: "error",
                        text: "There was an error updating the cheque. Please try again."
                    });
                }
            );
        },
        function (isRejected) { return; }
    );
}

function initUpdate(id) {
    var row = $("#outward-cheque-table")
        .bootstrapTable("getRowByUniqueId", id);

    // Reset and populate update form
    var form = $("#edit-outward-form");
    form.trigger("reset");
    form.find("select").trigger("change");
    utilities.clearUpdateDetails();

    form.find("[name=narration]").val(row.narration);
    form.find("[name=datecreated]").val(row.datecreated);
    form.find("[name=referenceno]").val(row.referenceno);
    form.find("[name=createdby]").val(row.createdby);
    form.find("[name=approvalremark]").val(row.approvalremark);
    form.find("[name=operationid]").val(row.operationid);
    form.find("[name=approvalstatus]").val(row.approvalstatus);
    form.find("[name=clearingoption]").val(row.clearingoption);
    form.find("[name=id]").val(row.id);
    form.find("[name=chequeno]").val(row.chequeno);
    form.find("[name=chequedate]").val(row.chequedate.substr(0, 10));
    form.find("[name=amount]").val(row.amount).trigger("change");
    form.find("[name=bankledgerid]").val(row.bankledgerid).trigger("change");
    form.find("[name=accountno]").val(row.accountno)
        .trigger("change").trigger("select2:select");
    if (row.chargestampduty) {
        form.find("[name=chargestampduty]").prop("checked", row.chargestampduty)
            .trigger("change");
    }

    // Fill up modal with messages
    switch (row.approvalstatus) {
        case ApprovalStatus.AMMEND:
            $("#ammend-container").find("ul").empty();
            $("#ammend-container").find("ul")
                .append($("<li>" + row.approvalremark + "</li>"));
            $("#ammend-container").show();
            break;
        default:
            $("#ammend-container").hide();
            break;
    }

    $("#outward-update-modal").modal("show");
}

function cancel(id) {
    swal({
        title: "Cancel Outward Cheque",
        text: "Outward cheque will be cancelled",
        type: "warning",
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
            $.ajax(
                url_path + "/../CancelOutwardCheque/" + id,
                {
                    method: "POST",
                }).then(
                    function (response) {
                        $("#outward-cheque-table").bootstrapTable("refresh");
                        swal({
                            title: "Cancel Outward Cheque",
                            type: "success",
                            text: "Outward cheque cancelled successfully!"
                        });
                    },
                    function (error) {
                        swal({
                            title: "Cancel Outward Cheque",
                            type: "error",
                            text: "There was an error cancelling the cheque. Please try again."
                        });
                    }
                );
        },
        function (isRejected) { return; }
    );
}

function sendForApproval() {
    var tableData = $.map($("#outward-cheque-table")
        .bootstrapTable("getData"), function (item) {
            if (!item.check) return null;
            return item.id;
        });

    if (tableData.length == 0) {
        return $.notify(
            {
                icon: "now-ui-icons travel_info",
                message: "No table rows have been selected!"
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

    swal({
        title: "Are you sure?",
        text: "Selected rows will be submitted for approval",
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
            $.ajax(
                url_path + "/../ApproveOutwardCheque",
                {
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(tableData)
                }).then(
                    function (response) {
                        $("#outward-cheque-table").bootstrapTable("refresh");
                        swal({
                            title: "Approve Outward Cheque",
                            type: "success",
                            text: "Outward cheque successfully sent for approval!"
                        });
                    },
                    function (error) {
                        swal({
                            title: "Approve Outward Cheque",
                            type: "error",
                            text: "There was an error updating the cheque. Please try again."
                        });
                    }
                );
        },
        function (isRejected) { return; }
    );
}

function batchUpload() {
    var upload = $("#document-upload").get(0);

    // validations
    if (!upload.files.length) {
        return $.notify({
            icon: "now-ui-icons travel_info",
            message: "Please choose a (valid) document"
        }, {
                type: "danger",
                placement: {
                    from: "top",
                    align: "right"
                }
            }
        );
    }
    if (!/\.xlsx$/.test(upload.files[0].name)) {
        return $.notify({
            icon: "now-ui-icons travel_info",
            message: "Only excel xslx documents are allowed!"
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
        text: "Batch outward cheque would be lodged",
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
            var form_data = new FormData();
            form_data.append("ExcelFile", upload.files[0]);
            // begin upload
            $.ajax(url_path + "/../LodgeBatchOutwardCheque", {
                method: "POST",
                contentType: false,
                processData: false,
                data: form_data
            }).then(
                function (response) {
                    swal({
                        title: "Batch Outward Cheque",
                        type: (response.success) ? "success" : "error",
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        text: response.responseText
                    });
                    if (response.success) {
                        $("#outward-cheque-table").bootstrapTable("refresh");
                        $("#outwardChequeModal").modal("hide");
                    }
                },
                function (error) {
                    swal({
                        title: "Batch Outward Cheque",
                        type: "error",
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        text: "There was an error lodging the cheques. " +
                            "Please check your spreadsheet and try again."
                    });
                }
            );
        },
        function (isRejected) { return; }
    );
}

function clearForm() {
    var form = $("#outward-cheque-form");
    form.trigger("reset");
    form.find("select").trigger("change");
    utilities.clearDetails();
}

function initSelectTwoConfig() {
    $.fn.select2.defaults.set("theme", "bootstrap4");
    $.fn.select2.defaults.set("dropdownParent", $(".modal").first());
    $.fn.select2.defaults.set("width", "100%");
    $.fn.select2.defaults.set("allowClear", true);

    $.ajax(url_path + "/../LoadBankLedgers")
        .then(function (response) {
            $("#bankledgerid,#bankledgers").select2({
                placeholder: "Select bank ledger",
                data: response
            });
            $("#update-bankledgerid").select2({
                placeholder: "Select bank ledger",
                data: response,
                dropdownParent: $("#outward-update-modal")
            });
            $.each(response, function (index, item) {
                chartofaccounts[item.id] = item.text;
            });
        });

    $.ajax(url_path + "/../LoadCurrentAccounts")
        .then(function (response) {
            $("#accountno,#currentcasa").select2({
                placeholder: "Select account number",
                data: response
            });
            $("#update-accountno").select2({
                placeholder: "Select account number",
                data: response,
                dropdownParent: $("#outward-update-modal")
            });
        });

    // Event Listener
    $(document).on("select2:open", function () {
        $('.select2-results__options').perfectScrollbar();
    });
}

var utilities = {
    clearDetails: function () {
        var form = $("#outward-cheque-form");

        $("#batch-cheque-form").trigger("reset");

        // clear previous values
        form.find("#accountnolabel").text("-");
        form.find("#accountname").text("-");
        form.find("#balance").text("-");
        form.find("#productname").text("-");

        // clear data-table
        $("#casa-mandate-table").bootstrapTable("removeAll");

        // hide stamp charge amount label
        $("#stamp-duty-amount").parent()
            .addClass("d-none");
    },
    clearUpdateDetails: function () {
        var form = $("#edit-outward-form");

        // clear previous values
        form.find("#update-accountnolabel").text("-");
        form.find("#update-accountname").text("-");
        form.find("#update-balance").text("-");
        form.find("#update-productname").text("-");

        // clear data-table
        $("#update-casa-mandate-table")
            .bootstrapTable("removeAll");

        // hide stamp charge amount label
        $("#update-stamp-duty-amount").parent()
            .addClass("d-none");
    },
    showStampCharge: function () {
        $("#stamp-duty-amount").text(stampDutyAmount.charge);
        $("#stamp-duty-amount").parent()
            .removeClass("d-none");
    },
    showUpdateStampCharge: function () {
        $("#update-stamp-duty-amount").text(stampDutyAmount.charge);
        $("#update-stamp-duty-amount").parent()
            .removeClass("d-none");
    },
    hideNotifyStampCharge: function () {
        // notify users of stamp duty setup
        $.notify(
            {
                icon: "now-ui-icons travel_info",
                message: "Cannot enable stamp duty charge because its setup is not completed."
            },
            {
                type: "danger",
                placement: {
                    from: "top",
                    align: "right"
                }
            }
        );
        // hide label + uncheck control
        $("#stamp-duty-amount").parent()
            .addClass("d-none");
        $("#chargestampduty").prop("checked", false);
    },
    hideNotifyUpdateStampCharge: function () {
        // notify users of stamp duty setup
        $.notify(
            {
                icon: "now-ui-icons travel_info",
                message: "Cannot enable stamp duty charge because its setup has not been completed."
            },
            {
                type: "danger",
                placement: {
                    from: "top",
                    align: "right"
                }
            }
        );
        // hide label + uncheck control
        $("#update-stamp-duty-amount").parent()
            .addClass("d-none");
        $("#update-chargestampduty").prop("checked", false);
    },
    dateFormatter: function (date) {
        return moment(date).format("DD MMMM, YYYY");
    },
    markCells: function (value) {
        var style;
        switch (value) {
            case ApprovalStatus.AMMEND:
                style = {
                    classes: 'bg-warning text-white'
                }
                break;
            case ApprovalStatus.DISAPPROVED:
                style = {
                    classes: 'bg-danger text-white'
                }
                break;
            case ApprovalStatus.APPROVED:
                style = {
                    classes: 'bg-success text-white'
                }
                break;
            case ApprovalStatus.PENDING:
                style = {
                    classes: 'bg-info text-white'
                }
                break;
            default:
                style = {};
                break;
        }
        return style;
    },
    COAFormatter: function (value) {
        return chartofaccounts[value];
    },
    getProductName: function (id) {
        return products[id].productName;
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
    filterMandates: function (mandates) {
        return $.grep(mandates, function (item) {
            return item.isDeleted == false;
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
    outwardDetailFormatter: function (index, row, el) {
        var container = $("<div class='row mx-0'></div>");
        container.append(
            $("<div class='col-xs-12 col-md-6 mb-3 mt-2'>"
                + "<b class='text-muted pull-left'>Bank Ledger:</b> "
                + "<span class='pull-right'>" + utilities.COAFormatter(row.bankledgerid) + "</span></div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-3 mt-2'>"
            + "<b class='text-muted pull-left'>Charge Stamp Duty:</b> "
            + "<span class='pull-right'>" + (row.chargestampduty ? "Yes" : "No") + "</span></div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-2'>"
            + "<b class='text-muted pull-left'>Created By:</b> "
            + "<span class='pull-right'>" + (row.createdby ? row.createdby : "-") + "</span></div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-2'>"
            + "<b class='text-muted pull-left'>Date Created:</b> "
            + "<span class='pull-right'>" + utilities.dateFormatter(row.datecreated) + "</span></div>"));
        container.append($("<div class='col-12 my-2'>"
            + "<b class='text-muted pull-left'>Narration:</b> "
            + "<span class='pull-right'>" + row.narration + "</span></div>"));
        el.append(container);
    },
    editFormatter: function (value, row) {
        if (value == ApprovalStatus.INENTRYSTATE ||
            value == ApprovalStatus.PENDING ||
            value == ApprovalStatus.AMMEND) {
            return [
                '<button type="button" class="edit btn btn-sm btn-warning" ',
                'onclick = "initUpdate(' + row.id + ')" title="Edit">',
                '<i class="now-ui-icons ui-2_settings-90"></i>',
                '</button>'
            ].join('');
        }
        return "";
    },
    deleteFormatter: function (value, row) {
        if (value == ApprovalStatus.INENTRYSTATE ||
            value == ApprovalStatus.PENDING ||
            value == ApprovalStatus.AMMEND) {
            return [
                '<button type="button" class="edit btn btn-sm btn-danger" ',
                'onclick = "cancel(' + row.id + ')" title="Cancel">',
                '<i class="now-ui-icons ui-1_simple-remove"></i>',
                '</button>'
            ].join('');
        }
        return "";
    },
    approvalStatusFormatter: function (value) {
        var statusString;
        switch (value) {
            case 1:
                statusString = "In Entry State";
                break;
            case 2:
                statusString = "Approved";
                break;
            case 3:
                statusString = "Disapproved";
                break;
            case 4:
                statusString = "Ammend";
                break;
            case 5:
                statusString = "Pending";
                break;
            case 6:
                statusString = "Cancelled";
                break;
            default:
                statusString = "";
                break;
        }
        return statusString;
    },
    tableCheckBoxFormatter: function (value, row) {
        var enable = (row.approvalstatus == ApprovalStatus.INENTRYSTATE ||
            row.approvalstatus == ApprovalStatus.AMMEND);
        return [
            "<div class='form-check ml-3 mb-1" + (enable ? "" : " disabled") + "'>",
                "<label class='form-check-label'>",
                    "<input name='table-select-item' class='form-check-input'" + 
                    (enable ? " " : " disabled ") + "onchange='onCheckHandler(this)' "
                    + "type='checkbox'" + (row.check ? " checked ":" ") + "id='"+ row.id +"'>",
                    "<span class='form-check-sign'></span>",
                "</label>",
            "</div>"
        ].join("");
    }
};