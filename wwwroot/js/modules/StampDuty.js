var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) == '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}

$(document).ready(function () {
    initStampFormValidations();
    $(".modal").perfectScrollbar();
    initCheckTypeCreditLedgerSelectTwoConfig2();
});

function AddStampCharge() {
    var form = $("#stamp-duty-form");
    if (!form.valid()) { return; }

    swal({
        title: "Are you sure?",
        text: "Stamp duty charge will be added",
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
            var data = {
                charge: form.find("[name=charge]").val(),
                chartofaccountid: form.find("[name=creditledgerstampduty]").val(),
            };
            $.ajax(
                url_path + "/Setup/AddStampDuty",
                {
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(data)
                }).then(
                    function (response) {
                        if (response[0] == "error") {
                            return swal({
                                title: "Add stamp duty",
                                type: "error",
                                text: response[1]
                            });
                        }
                        swal({
                            title: "Add stamp duty",
                            type: "success",
                            text: "Stamp duty charge saved successfully!"
                        });
                        $("#stamp-duty-table").bootstrapTable("refresh");
                        $("#stamp-duty-modal").modal("hide");
                    },
                    function (error) {
                        // show error message
                        swal({
                            title: "Add stamp duty",
                            type: "error",
                            text: "There was an error saving this record. Please try again."
                        });
                    }
                );
        },
        function (isRejected) { return }
    );
}

function UpdateStampCharge() {
    var form = $("#stamp-duty-form");
    if (!form.valid()) {
        return;
    }

    swal({
        title: "Are you sure?",
        text: "Stamp duty charge will be updated",
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
            var data = {
                id: form.find("[name=id]").val(),
                charge: form.find("[name=charge]").val(),
                datecreated: form.find("[name=datecreated]").val(),
                chartofaccountid: form.find("[name=creditledgerstampduty]").val(),
            };
            $.ajax(
                url_path + "/Setup/UpdateStampDuty",
                {
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(data)
                }).then(
                    function (response) {
                        swal({
                            title: "Update stamp duty",
                            type: "success",
                            text: "Stamp duty charge updated successfully!"
                        });
                        $("#stamp-duty-table").bootstrapTable("refresh");
                        $("#stamp-duty-modal").modal("hide");
                    },
                    function (error) {
                        swal({
                            title: "Update stamp duty",
                            type: "error",
                            text: "There was an error updating this record. Please try again."
                        });
                    }
                );
        },
        function (isRejected) { return }
    );
}

var stampDutyEvents = {
    'click .edit': function (e, value, row) {
        openUpdateStampModal(row);
    },
    'click .remove': function (e, value, row) {
        swal({
            title: "Are you sure?",
            text: "You are about to delete this record!",
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
            $.ajax({
                url: url_path + '/Setup/DeleteStampDuty/' + row.id,
                type: 'POST',
                success: function (data) {
                    swal("Record deleted succesfully");
                    $("#stamp-duty-table").bootstrapTable("refresh");
                },
                error: function (e) {
                    swal("An exception occured!");
                }
            });
        }, function (isRejected) {
            return;
        });
    }
};

function initStampFormValidations() {
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

    jQuery.validator.addMethod("positive",
        function (value, element) {
            return this.optional(element) || Number(UnFormatMoney(value)) >= 0
        }, jQuery.validator.format("Value can not be negative!")
    );

    $("#stamp-duty-form").on("submit",
        function (e) { e.preventDefault(); }
    );

    $("#stamp-duty-form").validate({
        rules: {
            charge: {
                number: true,
                positive: true
            }
        },
        messages: {
            charge: {
                required: "Stamp duty charge is required",
                number: "Insert a valid amount in charge input",
                positive: "Charge value can not be negative"
            }
        },
        onsubmit: false
    });
}

function openNewStampModal() {
    // reset form
    $("#stamp-duty-form").trigger("reset");

    // hide/show buttons
    $("#btn-update-stamp-charge").hide();
    $("#btn-add-stamp-charge").show();

    // swap modal header then show
    $("#stamp-form-header").text("New");
    $("#stamp-duty-modal").modal("show");
}

function openUpdateStampModal(row) {
    var form = $("#stamp-duty-form");
    // reset form
    form.trigger("reset");

    // populate form
    form.find("[name=id]").val(row.id);
    form.find("[name=charge]").val(row.charge);
    form.find("[name=datecreated]").val(row.datecreated);
    form.find("#creditledgerstampduty").val(row.chartofaccountid);
    form.find("#creditledgerstampduty").trigger('change'); // Notify any JS components that the value changed

    // hide/show buttons
    $("#btn-update-stamp-charge").show();
    $("#btn-add-stamp-charge").hide();

    // swap modal header then show
    $("#stamp-form-header").text("Update");
    $("#stamp-duty-modal").modal("show");
}

function initCheckTypeCreditLedgerSelectTwoConfig2() {
    $.fn.select2.defaults.set("theme", "bootstrap4");
    $.fn.select2.defaults.set("dropdownParent", $(".modal").first());
    $.fn.select2.defaults.set("width", "100%");
    $.fn.select2.defaults.set("allowClear", true);
    
    $.ajax(
        url_path + "/Setup/LoadChartOfAccount")
        .then(function (response) {
            //alert(response);
            $("#creditledgerstampduty").select2({
                placeholder: "Select credit ledger type",
                data: response,
                dropdownParent: $("#stamp-duty-modal.modal"),
            });
        });

}