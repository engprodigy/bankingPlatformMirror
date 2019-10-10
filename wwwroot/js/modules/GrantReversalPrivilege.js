var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) == '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}

var staffInfo = {};

$(document).ready(function ($) {
    initReversalValidation();
    InitDataTable();
    initSelectTwoConfig();
});

function InitDataTable() {
    $.ajax(url_path + "/Setup/ListStaffs")
        .then(
            function (response) {
                // format api data
                $.each(response, function (index, item) {
                    staffInfo[item.id] = item.text;
                });

                // initialize data-table
                $("#reversalTable").bootstrapTable({
                    search: true,
                    toolbar: "#reversal-toolbar",
                    searchAlign: "right",
                    showPaginationSwitch: true,
                    mobileResponsive: true,
                    showRefresh: true,
                    showToggle: true,
                    buttonsClass: "danger",
                    columns: [
                        {
                            field: "staffinformationid",
                            title: "Staff Name",
                            formatter: staffMapper
                        }, {
                            field: "datetimecreated",
                            sortable: true,
                            title: "Created On",
                            formatter: dateFormatter
                        }, {
                            field: "canreversealltransaction",
                            title: "Can Reverse",
                            sortable: true,
                            width: "5%",
                            align: "center",
                            formatter: canReverseFormatter
                        }, {
                            events: ReversalEvents,
                            formatter: editFormatter,
                            width: "5%",
                            align: "center"
                        }, {
                            events: ReversalEvents,
                            formatter: deleteFormatter,
                            width: "5%",
                            align: "center"
                        },
                    ]
                });
            }
        );
}

function initReversalValidation() {
    // defaults
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
    $("#frmReversal").validate({
        messages: {
            staffcode: {
                required: "Reversal Privilege is required"
            }
        }
    });
}

function dateFormatter(value, row, $element) {
    var format = moment(value).format("DD MMMM, YYYY");
    var html = '<div>' + format + '</div>';
    return html;
}

function initSelectTwoConfig() {
    $.fn.select2.defaults.set("theme", "bootstrap4");
    $.fn.select2.defaults.set("dropdownParent", $(".modal").first());
    $.fn.select2.defaults.set("width", "100%");
    $.fn.select2.defaults.set("allowClear", true);

    var form = $("#frmReversal");

    $.ajax(url_path + "/Setup/ListStaffs")
        .then(function (response) {
            $("#staffinformationid").select2({
                placeholder: "Select customer Staff Name",
                data: response,
                dropdownParent: $("#AddNewReversal.modal"),
            });
        });
}

function canReverseFormatter(value, row, index) {
    return (value ? "Yes" : "No");
}

function editFormatter(value, row, index) {
    return [
        '<button type="button" class="edit btn btn-sm btn-warning" title="Edit">',
        '<i class="now-ui-icons ui-2_settings-90"></i>',
        '</button>'
    ].join('');
}

function deleteFormatter(value, row, index) {
    return [
        '<button type="button" class="remove btn btn-sm btn-danger" title="Delete">',
        '<i class="now-ui-icons ui-1_simple-remove"></i> ',
        '</button>'
    ].join('');
}

window.ReversalEvents = {
    'click .edit': function (e, value, row, index) {
        var form = $("#frmReversal");
        form.trigger("reset");
        if (row.state = true) {
            form.find("[name=reversalsetupid]").val(row.reversalsetupid);
            form.find("[name=staffinformationid]").val(row.staffinformationid).change();
            form.find("[name=createdby]").val(row.createdby);
            form.find("[name=datetimecreated]").val(row.datetimecreated);
            form.find("[name=branchid]").val(row.branchid);
            form.find("[name=companyid]").val(row.companyid);
            form.find("[name=canreversealltransaction]").prop("checked", row.canreversealltransaction);

            $("#reversalPrivilegeTitle").text("Update");
            $('#btnAddReversalG').hide();
            $("#btnReversalUpdate").show();
            $('#AddNewReversal').modal('show');
        }
    },
    'click .remove': function (e, value, row, index) {
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
            if (isConfirm) {
                $.ajax({
                    url: url_path + '/Setup/DeleteReversalPrivilege',
                    type: 'POST',
                    data: { reversalsetupid: row.reversalsetupid },
                    success: function (data) {
                        swal("Deleted succesfully");
                        $('#reversalTable').bootstrapTable('refresh');
                    },
                    error: function (e) {
                        swal("An exception occured!");
                    }
                });
            }
        }, function (isRejected) {
            return;
        });   
    }
};

function updateReversalPrivilege() {
    swal({
        title: "Are you sure?",
        text: "Reversal Privilege will be updated!",
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
                }, 1000);
            });
        }
    }).then(function (isConfirm) {
        if (isConfirm) {
            var form = $("#frmReversal");
            var data = {
                reversalsetupid: form.find("#reversalsetupid").val(),
                staffinformationid: form.find("#staffinformationid").val(),             
                datetimecreated: form.find("#datetimecreated").val(),  
                canreversealltransaction: form.find('#canreversealltransaction').prop("checked"),
            };
            form.find("#btnReversalUpdate").attr("disabled", "true");
            $.ajax({
                url: url_path + '/Setup/updateReversalPrivilege',
                type: 'POST',
                data: data,
                dataType: "json",
                success: function (result) {
                    swal({
                        title: 'Reversal Privilege',
                        text: 'Reversal Privilege updated successfully!',
                        type: 'success'
                    }).then(function () {
                        $('#reversalTable').
                            bootstrapTable('refresh');
                        $("#btnReversalUpdate").removeAttr("disabled");
                        $('#AddNewReversal').modal('hide');
                    });
                },
                error: function (e) {
                    swal({
                        title: 'Reversal Privilege',
                        text: 'Reversal Privilege encountered an error during update',
                        type: 'error'
                    }).then(function () {
                        $("#btnReversalUpdate").removeAttr("disabled");
                    });
                }
            });
        }
    }, function (isRejected) {
        return;
    });
}

function openReversalModal() {
    var form = $("#frmReversal");
    form.trigger("reset");
    $("#reversalPrivilegeTitle").text("Add");
    form.find('#btnAddReversalG').show();
    form.find("#btnReversalUpdate").hide();
    $('#AddNewReversal').modal('show');
}

function AddReversalG() {
    swal({
        title: "Are you sure?",
        text: "Reversal Privilege will be saved!",
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
            if (isConfirm) {
                var form = $("#frmReversal");
                form.find("#btnAddReversalG").attr("disabled", "true");
                var data = {
                    reversalsetupid: form.find('#reversalsetupid').val(),
                    staffinformationid: form.find('#staffinformationid').val(),
                    canreversealltransaction: form.find('#canreversealltransaction').prop("checked"),
                }
                $.ajax({
                    url: url_path + '/Setup/AddReversalG',
                    type: 'POST',
                    data: data,
                    dataType: "json",
                    success: function (result) {
                        swal({
                            title: 'Reversal Privilege',
                            text: 'Reversal Privilege saved successfully!',
                            type: 'success'
                        }).then(function () {
                            $('#reversalTable').
                                bootstrapTable('refresh');
                            $("#btnAddReversalG").removeAttr("disabled");
                            $('#AddNewReversal').modal('hide');
                        });
                    },
                    error: function (e) {
                        swal({
                            title: 'Reversal Privilege',
                            text: 'Reversal Privilege encountered an error',
                            type: 'error'
                        }).then(function () {
                            $("#btnAddReversalG").removeAttr("disabled");
                        });
                    }
                });
            }
        }, function (isRejected) {
            return;
        });
}

function staffMapper(value) {
    return staffInfo[value];
}
