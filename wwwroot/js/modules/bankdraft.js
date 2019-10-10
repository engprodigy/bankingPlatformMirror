var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) == '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}

var chartOfAccs = {};

$(document).ready(function ($) {
    initdraftValidation();
    prepareAPI();
});

function prepareAPI() {
    $.ajax(url_path + "/Setup/LoadChartOfAccount")
        .then(
        function (response) {
            // Use for select2
            initdraftSelectTwoConfig(response);

            // format api data
            $.each(response, function (index, item) {
                chartOfAccs[item.id] = item.text;
            });

            // initialize data-table
            $("#draftTable").bootstrapTable({
                search: true,
                toolbar: "#draft-toolbar",
                searchAlign: "right",
                showPaginationSwitch: true,
                mobileResponsive: true,
                showRefresh: true,
                showToggle: true,
                buttonsClass: "danger",
                columns: [
                    {
                        field: "name",
                        title: "Name"
                    },{
                        field: "amount",
                        title: "Amount",
                        align: "right"
                    }, {
                        field: "principalgl",
                        title: "Principal GL",
                        formatter: chartMapper
                    }, {
                        field: "interestgl",
                        title: "Interest GL",
                        formatter: chartMapper
                    }, {
                        field: "israte",
                        title: "Fixed Rate",
                        formatter: "israteFormatter",
                        width: "5%",
                        align: "center"
                    }, {
                        events: draftEvents,
                        formatter: editFormatter,
                        width: "5%",
                        align: "center"
                    }, {
                        events: draftEvents,
                        formatter: deleteFormatter,
                        width: "5%",
                        align: "center"
                    },
                ]
            }); 
        }
    );
};

function initdraftValidation() {
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
    $("#frmDraft").validate({
        messages: {
            name: {
                required: "Name is required"
            }
        }
    });
}

function dateFormatter(value, row, $element) {
    var format = moment(value).format("DD MMMM, YYYY");
    var html = '<div>' + format + '</div>';
    return html;
}

function israteFormatter(value, row, index) {
    return (value ? "Yes" : "No");
}

function editFormatter(value, row, index) {
    return [
        '<button type="button" class="edit btn btn-sm btn-warning" title="Edit">',
        '<i class="now-ui-icons ui-2_settings-90"></i>',
        '</button>'
    ].join('');
}

function initdraftSelectTwoConfig(data) {
    $.fn.select2.defaults.set("theme", "bootstrap4");
    $.fn.select2.defaults.set("dropdownParent", $(".modal").first());
    $.fn.select2.defaults.set("width", "100%");
    $.fn.select2.defaults.set("allowClear", true);

    var form = $("#frmDraft");
    form.find("#principalgl").select2({
        placeholder: "Select Principal Ledger Account",
        data: data,
        dropdownParent: $("#AddNewDraft.modal"),
    });
    form.find("#interestgl").select2({
        placeholder: "Select Interest Ledger Account",
        data: data,
        dropdownParent: $("#AddNewDraft.modal"),
    });  
}

function deleteFormatter(value, row, index) {
    return [
        '<button type="button" class="remove btn btn-sm btn-danger" title="Delete">',
        '<i class="now-ui-icons ui-1_simple-remove"></i> ',
        '</button>'
    ].join('');
}

window.draftEvents = {
    'click .edit': function (e, value, row, index) {
        var form = $("#frmDraft");
        form.trigger("reset");
        if (row.state = true) {
            form.find("[name=bankdraftid]").val(row.bankdraftid);
            form.find("[name=chartofaccountid]").val(row.chartofaccountid);
            form.find("[name=name]").val(row.name);
            form.find("[name=amount]").val(row.amount);
            form.find("[name=principalgl]").val(row.principalgl).change();
            form.find("[name=interestgl]").val(row.interestgl).change();  
            form.find("[name=datetimecreated]").val(row.datetimecreated);           
            form.find("[name=datetimeupdated]").val(row.datetimeupdated);
            form.find("[name=lastupdatedby]").val(row.lastupdatedby);
            form.find("[name=israte]").prop("checked", row.israte);  

            form.find("[name=companyid]").val(row.companyid);
            form.find("[name=destinationbranchid]").val(row.destinationbranchid);
            form.find("[name=sourcebranchid]").val(row.sourcebranchid);
            form.find("[name=createdby]").val(row.createdby);

            $("#bankDraftTitle").text("Update");
            $('#btnAddBankDraft').hide();
            $("#btnDraftUpdate").show();
            $('#AddNewDraft').modal('show');
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
                    url: url_path + '/Setup/DeleteBankDraft',
                    type: 'POST',
                    data: { bankdraftid: row.bankdraftid },
                    success: function (data) {
                        swal("Deleted succesfully");
                        $('#draftTable').bootstrapTable('refresh');
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

function updateBankDraft() {
    swal({
        title: "Are you sure?",
        text: "Bank Draft will be updated!",
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
            var form = $("#frmDraft");
            var data = {
                bankdraftid: form.find("#bankdraftid").val(),
                chartofaccountid: form.find("#chartofaccountid").val(),
                name: form.find("#name").val(),
                amount: form.find("#amount").val(),
                principalgl: form.find("#principalgl").val(),
                interestgl: form.find("#interestgl").val(),
                datetimecreated: form.find("#datetimecreated").val(),
                datetimeupdated: form.find("#datetimeupdated").val(),
                lastupdatedby: form.find("#lastupdatedby").val(),
                israte: form.find("#israte").prop("checked"),

                companyid: form.find("#companyid").val(),
                destinationbranchid: form.find("#destinationbranchid").val(),
                sourcebranchid: form.find("#sourcebranchid").val(),
                createdby: form.find("#createdby").val()
            };
            form.find("#btnDraftUpdate").attr("disabled", "true");
            $.ajax({
                url: url_path + '/Setup/updateBankDraft',
                type: 'POST',
                data: data,
                dataType: "json",
                success: function (result) {
                    swal({
                        title: 'Bank Draft',
                        text: 'Bank Draft updated successfully!',
                        type: 'success'
                    }).then(function () {
                        $('#draftTable').
                            bootstrapTable('refresh');
                        $("#btnDraftUpdate").removeAttr("disabled");
                        $('#AddNewDraft').modal('hide');
                    });
                },
                error: function (e) {
                    swal({
                        title: 'Bank Draft',
                        text: 'Bank Draft encountered an error during update',
                        type: 'error'
                    }).then(function () {
                        $("#btnDraftUpdate").removeAttr("disabled");
                    });
                }
            });
        }
    }, function (isRejected) {
        return;
    });
}

function openDraftModal() {
    var form = $("#frmDraft");
    form.trigger("reset");
    $("#bankDraftTitle").text("Add");
    form.find('#btnAddBankDraft').show();
    form.find("#btnDraftUpdate").hide();
    $('#AddNewDraft').modal('show');
}

function AddBankDraft() {
    swal({
        title: "Are you sure?",
        text: "Bank Draft will be saved!",
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
                var form = $("#frmDraft");
                form.find("#btnAddBankDraft").attr("disabled", "true");

                $(".principalgl").on("change", function () {
                    var principalgl = $(this).val();
                    $("#textBoxprincipal").val(principalgl);
                });

                $(".interestgl").on("change", function () {
                    var interestLedger = $(this).val();
                    $("#textBoxinterest").val(interestLedger);
                });

                var data = {
                    bankdraftid: form.find('#bankdraftid').val(),
                    chartofaccountid: form.find('#chartofaccountid').val(),
                    name: form.find('#name').val(), 
                    amount: form.find('#amount').val(),
                    principalgl: form.find('#principalgl').val(),
                    interestgl: form.find('#interestgl').val(),
                    companyid: form.find('#companyid').val(),
                    createdby: form.find('#createdby').val(),
                    sourcebranchid: form.find('#sourcebranchid').val(),
                    destinationbranchid: form.find('#destinationbranchid').val(),
                    israte: form.find('#israte').prop("checked"),
                }
                $.ajax({
                    url: url_path + '/Setup/AddBankDraft',
                    type: 'POST',
                    data: data,
                    dataType: "json",
                    success: function (result) {
                        swal({
                            title: 'Bank Draft',
                            text: 'Bank Draft saved successfully!',
                            type: 'success'
                        }).then(function () {
                            $('#draftTable').
                                bootstrapTable('refresh');
                            $("#btnAddBankDraft").removeAttr("disabled");
                            $('#AddNewDraft').modal('hide');
                        });
                    },
                    error: function (e) {
                        swal({
                            title: 'Bank Draft',
                            text: 'Bank Draft encountered an error',
                            type: 'error'
                        }).then(function () {
                            $("#btnAddBankDraft").removeAttr("disabled");
                        });
                    }
                });
            }
        },
        function (isRejected) {
            return;
        }
    );
}

function chartMapper(value) {
    return chartOfAccs[value];
}