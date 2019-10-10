var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) == '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}

$(document).ready(function () {
    initFormValidations();
    $(".modal").perfectScrollbar();
    initCheckTypeCreditLedgerSelectTwoConfig();
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

    

    $("#frmChequeType").validate({
        rules: {
            leavesno: {
                digits: true
            },
            charge: {
                number: true
            }
           /* creditledger: {
                digits: true
            }*/
        },
        messages: {
            chequetype: {
                required: "Cheque book type is required"
            },
            leavesno: {
                required: "Number of leaves is required",
                digits: "Number of leaves can only contain digits"
            },
            charge: {
                number: "Insert a valid price for the charge field"
            },
            creditledger: {
                required: "Credit ledger is required"
            }
        }
    });
}

function initCheckTypeCreditLedgerSelectTwoConfig() {
    $.fn.select2.defaults.set("theme", "bootstrap4");
    $.fn.select2.defaults.set("dropdownParent", $(".modal").first());
    $.fn.select2.defaults.set("width", "100%");
    $.fn.select2.defaults.set("allowClear", true);
   
    $.ajax(
        url_path + "/Setup/LoadChartOfAccount")
        .then(function (response) {
           // alert(response);
            $("#creditledger").select2({
                placeholder: "Select credit ledger type",
                data: response,
                dropdownParent: $("#chequeTypeModal.modal"),
            });
        });

}

function openNewChequeModal() {
    // reset form
    $("#frmChequeType").trigger("reset");
    $("#chequeTypeHeader").text("New");
    $("#btnUpdateChequeType").hide();
    $("#btnAddChequeType").show();

    $("#chequeTypeModal").modal("show");
}

function AddChequeType() {
    // check if form is valid
    var form = $("#frmChequeType");
    if (!form.valid()) {
        return;
    }
    debugger
    var data = {};
    data.chequetype = form.find("[name=chequetype]").val();
    data.charge = form.find("[name=charge]").val();
    data.leavesno = form.find("[name=leavesno]").val();
    data.creditledger = form.find("[name=creditledger]").val();
    data.remark = form.find("[name=remark]").val();
    data.isdeleted = !form.find("[name=isdeleted]").prop("checked");

    swal({
        title: "Are you sure?",
        text: "Cheque type data will be submitted",
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
                $.ajax(
                    url_path + "/Setup/AddChequeBook",
                    {
                        method: "POST",
                        contentType: "application/json",
                        data: JSON.stringify(data)
                    }).then(
                        function (response) {
                            // show success message + refresh data-table 
                            // + close modal
                            swal({
                                title: "Add cheque type",
                                type: "success",
                                text: "Cheque type saved successfully!"
                            });
                            $("#cheque-type-table").bootstrapTable("refresh");
                            $("#chequeTypeModal").modal("hide");
                        },
                        function (error) {
                            // show error message
                            swal({
                                title: "Add cheque type",
                                type: "error",
                                text: "There was an error saving this record. Please try again."
                            });
                        }
                    );
            }
        },
        function (isRejected) { return }
    );    
}

function UpdateChequeType() {
    // check if form is valid
    var form = $("#frmChequeType");
    if (!form.valid()) {
        return;
    }
    //debugger
    var data = {};
    data.id = form.find("[name=id]").val();
    data.chequetype = form.find("[name=chequetype]").val();
    data.charge = form.find("[name=charge]").val();
    data.leavesno = form.find("[name=leavesno]").val();
    //data.creditledger = form.find("[name=creditledger]").val();#creditledger
    data.creditledger = form.find("#creditledger").val();
    //form.find("#creditledger").trigger('change'); // Notify any JS components that the value changed
    data.remark = form.find("[name=remark]").val();
    data.isdeleted = !form.find("[name=isdeleted]").prop("checked");

    swal({
        title: "Are you sure?",
        text: "Cheque type data will be updated",
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
                $.ajax(
                    url_path + "/Setup/UpdateChequeBook",
                    {
                        method: "POST",
                        contentType: "application/json",
                        data: JSON.stringify(data)
                    }).then(
                        function (response) {
                            // show success message + refresh data-table 
                            // + close modal
                            swal({
                                title: "Update cheque type",
                                type: "success",
                                text: "Cheque type updated successfully!"
                            });
                            $("#cheque-type-table").bootstrapTable("refresh");
                            $("#chequeTypeModal").modal("hide");
                        },
                        function (error) {
                            // show error message
                            swal({
                                title: "Update cheque type",
                                type: "error",
                                text: "There was an error updating this record. Please try again."
                            });
                        }
                    );
            }
        },
        function (isRejected) { return }
    );
}

function deleteChequeType(id) {
    swal({
        title: "Are you sure?",
        text: "Cheque type will be permanently deleted!",
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
                $.ajax(
                    url_path + "/Setup/DeleteChequeBook/",
                    {
                        method: "POST",
                        contentType: "application/json",
                        data: JSON.stringify({
                            id: id
                        })
                    }
                ).then(
                    function (response) {
                        // show success message + refresh data-table 
                        // + close modal
                        swal({
                            title: "Delete cheque type",
                            type: "success",
                            text: "Cheque type deleted successfully!"
                        });
                        $("#cheque-type-table").bootstrapTable("refresh");
                        $("#chequeTypeModal").modal("hide");
                    },
                    function (error) {
                        // show error message
                        swal({
                            title: "Delete cheque type",
                            type: "error",
                            text: "There was an error deleting this record. Please try again."
                        });
                    }
                );
            }
        },
        function (isRejected) { return }
    );
}

var utilities = {
    editChequetypeFormatter: function (val, row, index) {
        return [
            "<button class='btn btn-warning btn-icon' ",
            "onclick='utilities.populateChequeTypeFrm(" + row.id + ")'>",
            "<i class='now-ui-icons ui-2_settings-90'>",
            "</i></button>"
        ].join("");
    },
    deleteChequetypeFormatter: function (val, row, index) {
        return [
            "<button class='btn btn-danger btn-icon' ",
            "onclick='deleteChequeType(" + row.id + ")'>",
            "<i class='now-ui-icons ui-1_simple-remove'>",
            "</i></button>"
        ].join("");
    },
    populateChequeTypeFrm: function (id) {
        //debugger
        var row = $("#cheque-type-table").bootstrapTable("getRowByUniqueId", id);

        // reset form
        var form = $("#frmChequeType");
        form.trigger("reset");
        $("#chequeTypeHeader").text("Edit");
        $("#btnUpdateChequeType").show();
        $("#btnAddChequeType").hide();

        // populate form fields
        form.find("[name=id]").val(row.id);
        form.find("[name=chequetype]").val(row.chequetype);
        form.find("[name=charge]").val(row.charge);
        form.find("[name=leavesno]").val(row.leavesno);
        //form.find("[name=creditledger]").val(row.creditledger); 
        debugger
        form.find("#creditledger").val(row.creditledger);
        form.find("#creditledger").trigger('change'); // Notify any JS components that the value changed
        form.find("[name=remark]").val(row.remark);
        if (!row.isdeleted) {
            form.find("[name=isdeleted]").prop("checked", true);
        }
        

        $("#chequeTypeModal").modal("show");

    },
    chequeTypeActiveFormatter: function (val) {
        if (val) return "No";
        return "Yes";
    },
    chequeTypeTableFormatter: function (index, row, el) {
        var container = $("<div class='row mx-0'></div>");
        container.append($("<div class='col-xs-12 col-md-6'><b>Credit Ledger:</b> "
            + row.creditledger + "</div>"));
        container.append($("<div class='col-xs-12 col-md-6'><b>Remark:</b> "
            + (row.remark == null ? "-" : row.remark ) + "</div>"));
        el.append(container);
    }
};