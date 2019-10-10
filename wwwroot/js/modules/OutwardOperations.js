var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) == '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}

var chartofaccounts = {};

var ApprovalStatus = {
    INENTRYSTATE: 1,
    APPROVED: 2,
    DISAPPROVED: 3,
    AMMEND: 4,
    PENDING: 5,
    CANCELLED: 6
};

var ClearingOptions = {
    DEFAULT: 0,
    CLEARED: 1,
    RETURNED: 2,
    DEFERRED: 3,
    FORCECLEARED: 4,
    CANCELLED: 5
};

$(document).ready(function () {
    initAPIData();
    initDatePicker();
    initFormValidations();
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

    $("#defer-outward-form").validate({
        messages: {
            chequedate: {
                required: "New cheque date is required!"
            }
        }
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
    });
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

function initAPIData() {
    $.ajax(url_path + "/../LoadBankLedgers")
        .then(function (response) {
            $.each(response, function (index, item) {
                chartofaccounts[item.id] = item.text;
            });
        });
}

function handleForceClear(id) {
    // column update
    swal({
        title: "Force Clear Outward Cheque",
        text: "Outward cheque will be force cleared",
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
            var row = $("#outward-operations-table")
                .bootstrapTable("getRowByUniqueId", id);

            $.ajax(
                url_path + "/../UpdateOutwardCheque/" + ClearingOptions.FORCECLEARED,
                {
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(row)
                }).then(
                    function (response) {
                        $("#outward-operations-table").bootstrapTable("refresh");
                        swal({
                            title: "Force Clear Outward Cheque",
                            type: "success",
                            text: "Outward cheque force cleared successfully!"
                        });
                    },
                    function (error) {
                        swal({
                            title: "Force Clear Outward Cheque",
                            type: "error",
                            text: "There was an error force clearing the cheque. Please try again."
                        });
                    }
                );
        },
        function (isRejected) { return; }
    );
}

function handleReturn(id) {
    // column update
    swal({
        title: "Return Outward Cheque",
        text: "Outward cheque will be returned",
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
            var row = $("#outward-operations-table")
                .bootstrapTable("getRowByUniqueId", id);

            $.ajax(
                url_path + "/../UpdateOutwardCheque/" + ClearingOptions.RETURNED,
                {
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(row)
                }).then(
                    function (response) {
                        $("#outward-operations-table").bootstrapTable("refresh");
                        swal({
                            title: "Return Outward Cheque",
                            type: "success",
                            text: "Outward cheque returned successfully!"
                        });
                    },
                    function (error) {
                        swal({
                            title: "Return Outward Cheque",
                            type: "error",
                            text: "There was an error returning the cheque. Please try again."
                        });
                    }
                );
        },
        function (isRejected) { return; }
    );
}

function handleDefer() {
    // handle cheque date change
    var form = $("#defer-outward-form");
    if (!form.valid()) {
        return;
    }
    var oldDate = form.find("[name=oldchequedate]").val();
    var newDate = form.find("[name=chequedate]").val();
    if (oldDate == newDate) {
        return $.notify(
            {
                icon: "now-ui-icons travel_info",
                message: "New cheque date is the same as current cheque date!"
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
        title: "Defer Outward Cheque",
        text: "Outward cheque will be deferred",
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
            var id = form.find("[name=id]").val();
            var row = $("#outward-operations-table")
                .bootstrapTable("getRowByUniqueId", id);
            row.chequedate = newDate;

            $.ajax(
                url_path + "/../UpdateOutwardCheque/" + ClearingOptions.DEFERRED,
                {
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(row)
                }).then(
                    function (response) {
                        $("#outward-operations-table")
                            .bootstrapTable("refresh");
                        $("#outward-defer-modal")
                            .modal("hide");
                        swal({
                            title: "Defer Outward Cheque",
                            type: "success",
                            text: "Outward cheque deferred successfully!"
                        });
                    },
                    function (error) {
                        swal({
                            title: "Defer Outward Cheque",
                            type: "error",
                            text: "There was an error deferring the cheque. Please try again."
                        });
                    }
                );
        },
        function (isRejected) { return; }
    );
}

function initDefer(id) {
    var row = $("#outward-operations-table")
        .bootstrapTable("getRowByUniqueId", id);

    var form = $("#defer-outward-form");
    form.trigger("reset");

    form.find("[name=id]").val(row.id);
    form.find("[name=oldchequedate]")
        .val(row.chequedate.substr(0, 10));

    $("#outward-defer-modal").modal("show");
}

function handleCancel(id) {
    // column update
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
            var row = $("#outward-operations-table")
                .bootstrapTable("getRowByUniqueId", id);

            $.ajax(
                url_path + "/../UpdateOutwardCheque/" + ClearingOptions.CANCELLED,
                {
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(row)
                }).then(
                    function (response) {
                        $("#outward-operations-table").bootstrapTable("refresh");
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

var utilities = {
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
    clearingStatusFormatter: function (value) {
        var statusString;
        switch (value) {
            case 1:
                statusString = "Cleared";
                break;
            case 2:
                statusString = "Returned";
                break;
            case 3:
                statusString = "Deferred";
                break;
            case 4:
                statusString = "Force-cleared";
                break;
            case 5:
                statusString = "Cancelled";
                break;
            case 0:
                statusString = "Uninitialized";
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
    },
    clearingSelectionFormatter: function (value, row) {
        return [
            "<div class='dropdown'>",
                "<button class='dropdown-toggle btn btn-danger btn-block' ",
                    "type='button' data-toggle='dropdown' aria-haspopup='true' ",
                    "aria-expanded='false'>Choose...",
                "</button>",
                "<div class='dropdown-menu dropdown-menu-right'>",
                    "<a onclick='handleForceClear("+ row.id+ ")' class='dropdown-item'>Force Clear</a>",
                    "<a onclick='handleReturn("+ row.id+ ")' class='dropdown-item'>Return</a>",
                    "<a onclick='initDefer("+ row.id+ ")' class='dropdown-item'>Defer</a>",
                    "<a onclick='handleCancel("+ row.id+ ")' class='dropdown-item'>Cancel</a>",
                "</div>",
            "</div>"
        ].join("");
    }
};