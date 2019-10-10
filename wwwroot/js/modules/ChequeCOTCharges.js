var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) == '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}

var chartOfAccounts = {}, chargeType, updateRow;

$(document).ready(function () {
    initAPI();
    prepareFormValidations();
});

function initAPI() {
    $.ajax(url_path + "/Setup/LoadChartOfAccount")
        .then(
        function (response) {
            // Use for select2
            initChequeChargeSelectTwoConfig(response);

            // format chartOfAccount object with data
            $.each(response, function (index, item) {
                chartOfAccounts[item.id] = item.text;
            });

            // initialize data-table
            $("#cheque-charge-table").bootstrapTable({}); 
        }
    );
};

function prepareFormValidations() {
    jQuery.validator.setDefaults({
        onfocusout: false,
        onkeyup: false,
        onclick: false,
        normalizer: function (value) {           
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

    $("#cheque-charge-form, #edit-cheque-charge-form")
        .each(function() {
            $(this).validate({
                rules: {
                    percentage: {
                        range: [0, 100]
                    }
                },
                messages: {
                    chargeType: {
                        required: "Please select one charge type"
                    },
                    accountledgerid: {
                        required: "Credit ledger is required"
                    },
                    percentage: {
                        required: "Rate percent is required",
                            range: "Please enter a rate value between 0 and 100 inclusive"
                    },
                    maxamount: {
                        required: "Maximum amount is required",
                        decimal: "Invalid maximum amount"
                    }
                }
            })
        });

    $("#cot-form").validate({
        messages: {
            feeamount: {
                number: "Fee amount is invalid",
                required: "Fee amount is required"
            },
            mintransactionamount: {
                number: "Minimum transaction amount is invalid",
                required: "Minimum transaction amount is required"
            },
            creditledgerid: {
                required: "Credit ledger is required"
            }
        }
    });  
}

function openCOTModal() {
    $("#cot-form").find("button[type=reset]")
        .trigger("click");

    $("#COT-header-title").text("Create");
    $("#COT-save-button").show();
    $("#COT-update-button").hide();
    $("#cot-setup-modal").modal("show");
}

function COTDetail(index, row, el) {
    var container = $("<div class='row mx-0'></div>");
    container.append($("<div class='col-xs-12 col-md-6 my-2'><b class='pull-left'>Credit Ledger:</b> "
        + "<span class='pull-right'>" + chartMapper(row.creditLedgerId) + "</span></div>"));
    container.append($("<div class='col-xs-12 col-md-6 my-2'><b class='pull-left'>Remarks:</b> "
        + "<span class='pull-right'>" + row.remark + "</span></div>"));
    el.append(container);
}

function resetForm(formid) {
    $(formid)
        .find("select").val(null).trigger("change");
}

function chargeTypeFormatter(value) {
    return (value ? "Discount Charge" : "Return Charge");
}

function editChequeChargeFormatter(value, row, index) {
    return [
        '<button type="button" class="edit btn btn-sm btn-warning" title="Edit">',
        '<i class="now-ui-icons ui-2_settings-90"></i>',
        '</button>'
    ].join('');
}

function initChequeChargeSelectTwoConfig(data) {
    $.fn.select2.defaults.set("theme", "bootstrap4");
    $.fn.select2.defaults.set("dropdownParent", $("#cheque-charge-modal"));
    $.fn.select2.defaults.set("width", "100%");
    $.fn.select2.defaults.set("allowClear", true);

    $("#accountledgerid").select2({
        placeholder: "Choose Credit Ledger Account",
        data: data
    });
    $("#Uaccountledgerid").select2({
        placeholder: "Choose Credit Ledger Account",
        data: data,
        dropdownParent: $("#edit-cheque-charge")
    });
    $("#creditledgerid").select2({
        placeholder: "Choose Credit Ledger Account",
        data: data,
        dropdownParent: $("#cot-setup-modal")
    });

    // Event Listeners
    $(document).on("select2:open", function () {
        $('.select2-results__options').perfectScrollbar();
    });
}

function deleteChequeChargeFormatter(value, row, index) {
    return [
        '<button type="button" class="remove btn btn-sm btn-danger" title="Delete">',
        '<i class="now-ui-icons ui-1_simple-remove"></i> ',
        '</button>'
    ].join('');
}

function dateFormatter(value) {
    var format = moment(value).format("DD MMMM, YYYY");
    var html = '<div>' + format + '</div>';
    return html;
}

window.chequeChargeEvents = {
    'click .edit': function (e, value, row) {
        updateRow = row;
        var form = $("#edit-cheque-charge-form");
        form.trigger("reset");

        (row.isdiscountcharge) ? $("#edit-title").text("Discount")
            : $("#edit-title").text("Return");

        // populate fields
        form.find("[name=accountledgerid]")
            .val(row.accountledgerid).trigger("change");
        form.find("[name=percentage]").val(row.percentage);
        form.find("[name=maxamount]").val(row.maxamount);
        form.find("[name=id]").val(row.id);
        form.find("[name=isdiscountcharge]").val(row.isdiscountcharge);
        form.find("[name=isreturncharge]").val(row.isreturncharge);
        form.find("[name=datecreated]").val(row.datecreated);

        // open modal
        $("#edit-cheque-charge").modal("show");
    },
    'click .remove': function (e, value, row) {
        swal({
            title: "Are you sure?",
            text: "You are about to delete this cheque charge!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ff9800",
            confirmButtonText: "Yes, proceed",
            cancelButtonText: "No, cancel!",
            showLoaderOnConfirm: true,
            preConfirm: function () {
                return new Promise(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 1000);
                });
            }
        }).then(function (isConfirm) {            
            if (isConfirm) {
                $.ajax({
                    url: url_path
                        + '/Setup/DeleteChequeCharge/'
                        + row.id,
                    type: 'POST'
                }).then(
                    function () {
                        swal({
                            title: 'Delete cheque charge',
                            text: 'Record deleted successfully!',
                            type: 'success'
                        });
                        $("#cheque-charge-table").bootstrapTable("refresh");
                    },
                    function () {
                        swal({
                            title: 'Delete cheque charge',
                            text: 'An error was encountered while deleting the cheque charge. Please try again.',
                            type: 'error'
                        });
                    }
                );
            }
        }, function (isRejected) {
            return;
        });
    }
};

window.cotEvents = {
    'click .edit': function (e, value, row) {
        // populate modal form
        var form = $("#cot-form");
        form.find("[name=id]").val(row.id);
        form.find("[name=datecreated]").val(row.dateCreated);
        form.find("[name=createdby]").val(row.createdBy);
        form.find("[name=approvedby]").val(row.approvedBy);
        form.find("[name=dateapproved]").val(row.dateApproved);
        form.find("[name=branchcode]").val(row.branchCode);
        form.find("[name=companycode]").val(row.companyCode);
        form.find("[name=feename]").val(row.feeName);
        form.find("[name=feeamount]").val(row.feeAmount);
        form.find("[name=mintransactionamount]")
            .val(row.minTransactionAmount);
        form.find("[name=creditledgerid]")
            .val(row.creditLedgerId).trigger("change");
        form.find("[name=remark]").val(row.remark);

        // swap in update elements
        $("#COT-header-title").text("Update");
        $("#COT-save-button").hide();
        $("#COT-update-button").show();

        $("#cot-setup-modal").modal("show");
    },
    'click .remove': function (e, value, row) {
        swal({
            title: "Are you sure?",
            text: "You are about to delete the COT entry!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ff9800",
            confirmButtonText: "Yes, proceed",
            cancelButtonText: "No, cancel!",
            showLoaderOnConfirm: true,
            preConfirm: function () {
                return new Promise(function (resolve) {
                    setTimeout(function () {
                        resolve();
                    }, 1000);
                });
            }
        }).then(
            function () {
                $.ajax({
                    url: url_path + "/Setup/DeleteCOT/" + row.id,
                    method: "POST"
                }).then(
                    function () {
                        // refresh data-table
                        $("#cot-setup-table").bootstrapTable("refresh");
                        swal({
                            title: 'Delete COT entry',
                            text: 'COT entry deleted successfully!',
                            type: 'success'
                        });
                    },
                    function () {
                        swal({
                            title: 'Delete COT entry',
                            text: 'An error was encountered while deleting the COT entry. Please try again.',
                            type: 'error'
                        });
                    }
                );
            },
            function () { return; }
        );
    }
};

function Save() {
    var form = $("#cheque-charge-form");
    if (!form.valid()) return;

    chargeType = (form.find("#discount").is(":checked")) ? "discount" : "return";

    swal({
        title: "Are you sure?",
        text: chargeType + " cheque charge will be saved!",
        type: "question",
        showCancelButton: true,
        confirmButtonColor: "#ff9800",
        confirmButtonText: "Yes, continue",
        cancelButtonText: "No, stop!",
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
            var data = {
                accountledgerid: form.find("#accountledgerid").val(),
                percentage: form.find("#percentage").val(),
                maxamount: form.find("#maxamount").val(),
            }
            $.ajax(url_path + "/Setup/AddChequeCharge/" + chargeType, {
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(data),
            }).then(
                function (response) {
                    if (response[1] == null) {
                        resetForm($("#cheque-charge-form").trigger("reset"))
                        // close modal + refresh data-table
                        $("#cheque-charge-modal").modal("hide");
                        $("#cheque-charge-table").bootstrapTable("refresh");
                        return swal({
                            title: 'Add cheque charge',
                            text: 'Cheque charge added successfully.',
                            type: 'success'
                        });
                    }
                    swal({
                        title: 'Add cheque charge',
                        text: response[1],
                        type: 'error'
                    });
                },
                function () {
                    swal({
                        title: 'Add cheque charge',
                        text: 'An error was encountered while adding new cheque charge. Please try again.',
                        type: 'error'
                    });
                }
            );
        },
        function (isRejected) {
            return;
        }
    );
}

function SaveCOT() {
    var form = $("#cot-form");
    if (!form.valid()) return;

    swal({
        title: "Are you sure?",
        text: "COT entry will be saved!",
        type: "question",
        showCancelButton: true,
        confirmButtonColor: "#ff9800",
        confirmButtonText: "Yes, continue",
        cancelButtonText: "No, stop!",
        showLoaderOnConfirm: true,
        preConfirm: function () {
            return new Promise(function (resolve) {
                setTimeout(function () {
                    resolve();
                }, 1000);
            });
        }
    }).then(
        function () {
            var feename = $.trim(form.find("[name=feename]").val());
            var data = {
                feeamount: form.find("[name=feeamount]").val(),
                creditledgerid: form.find("[name=creditledgerid]").val(),
                mintransactionamount: form.find("[name=mintransactionamount]").val(),
                feename: feename.length ? feename : null,
                remark: $.trim(form.find("[name=remark]").val())
            };
            $.ajax(url_path + "/Setup/AddCOT", {
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(data),
                dataType: "json"
            }).then(
                function (response) { 
                    if (response[0] == "error") {
                        return swal({
                            title: 'Add COT entry',
                            text: response[1],
                            type: 'error'
                        });
                    }
                    resetForm($("#cot-form").trigger("reset"));
                    $("#cot-setup-modal").modal("hide");
                    $("#cot-setup-table").bootstrapTable("refresh");
                    // success sweet alert
                    return swal({
                        title: 'Add COT entry',
                        text: 'COT entry added successfully.',
                        type: 'success'
                    });
                },
                function () {
                    swal({
                        title: 'Add COT Entry',
                        text: 'An error was encountered while adding new COT entry. Please try again.',
                        type: 'error'
                    });
                }
            );
        },
        function () { return; }
    );
}

function Update() {
    var form = $("#edit-cheque-charge-form");
    if (!form.valid()) return;
    swal({
        title: "Are you sure?",
        text: (updateRow.isdiscountcharge ? "Discount" : "Return")
            + " cheque charge will be updated!",
        type: "question",
        showCancelButton: true,
        confirmButtonColor: "#ff9800",
        confirmButtonText: "Yes, continue",
        cancelButtonText: "No, stop!",
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
            var data = {
                id: form.find("[name=id]").val(),
                isdiscountcharge: form.find("[name=isdiscountcharge]").val(),
                isreturncharge: form.find("[name=isreturncharge]").val(),
                accountledgerid: form.find("[name=accountledgerid]").val(),
                percentage: form.find("[name=percentage]").val(),
                datecreated: form.find("[name=datecreated]").val(),
                maxamount: form.find("[name=maxamount]").val(),
            }
            $.ajax(url_path + "/Setup/UpdateChequeCharge/" + chargeType, {
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(data),
            }).then(
                function () {
                    resetForm($("#edit-cheque-charge-form").trigger("reset"))
                    // close modal + refresh data-table
                    $("#edit-cheque-charge").modal("hide");
                    $("#cheque-charge-table").bootstrapTable("refresh");
                    swal({
                        title: 'Update cheque charge',
                        text: (updateRow.isdiscountcharge ? "Discount" : "Return")
                            + ' cheque charge updated successfully.',
                        type: 'success'
                    });
                },
                function () {
                    swal({
                        title: 'Update cheque charge',
                        text: 'An error was encountered while updating the cheque charge. Please try again.',
                        type: 'error'
                    });
                }
            );
        },
        function (isRejected) { return; }
    );
}

function UpdateCOT() {
    var form = $("#cot-form");
    if (!form.valid()) return;

    swal({
        title: "Are you sure?",
        text: "COT entry will be updated!",
        type: "question",
        showCancelButton: true,
        confirmButtonColor: "#ff9800",
        confirmButtonText: "Yes, continue",
        cancelButtonText: "No, stop!",
        showLoaderOnConfirm: true,
        preConfirm: function () {
            return new Promise(function (resolve) {
                setTimeout(function () {
                    resolve();
                }, 1000);
            });
        }
    }).then(
        function () {
            var feename = $.trim(form.find("[name=feename]").val());
            var data = {
                feeamount: form.find("[name=feeamount]").val(),
                creditledgerid: form.find("[name=creditledgerid]").val(),
                mintransactionamount: form.find("[name=mintransactionamount]").val(),
                feename: feename.length ? feename : null,
                remark: $.trim(form.find("[name=remark]").val()),
                id: form.find("[name=id]").val(),
                datecreated: form.find("[name=datecreated]").val(),
                createdby: form.find("[name=createdby]").val(),
                approvedby: form.find("[name=approvedby]").val(),
                dateapproved: form.find("[name=dateapproved]").val(),
                branchcode: form.find("[name=branchcode]").val(),
                companycode: form.find("[name=companycode]").val(),
            };
            $.ajax(
                url_path + "/Setup/UpdateCOT",
                {
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(data),
                    dataType: "json"
                }
            ).then(
                function (response) {
                    $("#cot-setup-modal").modal("hide");
                    $("#cot-setup-table").bootstrapTable("refresh");
                    // success sweet alert
                    return swal({
                        title: 'Update COT entry',
                        text: 'COT entry updated successfully.',
                        type: 'success'
                    });
                },
                function () {
                    swal({
                        title: 'Update COT Entry',
                        text: 'An error was encountered while updating COT entry. Please try again.',
                        type: 'error'
                    });
                }
            );
        },
        function () { return; }
    );
}

function chartMapper(value) {
    return chartOfAccs[value];
}