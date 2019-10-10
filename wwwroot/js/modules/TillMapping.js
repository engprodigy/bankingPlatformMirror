var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) == '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}

$(document).ready(function ($) {
    inittiMapValidation();
    initMapSelectTwoConfig();
});

function inittiMapValidation() {
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
    $("#frmTillMap").validate({
        messages: {
            name: {
                required: "Name is required"
            }
        }
    });
}

function initMapSelectTwoConfig() {
    $.fn.select2.defaults.set("theme", "bootstrap4");
    $.fn.select2.defaults.set("dropdownParent", $(".modal").first());
    $.fn.select2.defaults.set("width", "100%");
    $.fn.select2.defaults.set("allowClear", true);

    var form = $("#frmTillMap");


    // $.ajax(url_path + "/GetOperationType")
    //$.ajax(url_path + "/TellerAndTill/GetOperationType")

    $.ajax(url_path + "/GetTillType")
        .then(function (response) {
            form.find("#tilltypeid").select2({
                placeholder: "Select Till Type",
                data: response,
                dropdownParent: $("#AddNewMap.modal")
            });
        });

    $.ajax(url_path + "/GetChartOfAccount")
        .then(function (response) {
            form.find("#chartofaccountid").select2({
                placeholder: "Select Ledger",
                data: response,
                dropdownParent: $("#AddNewMap.modal")
            });
        });

    $.ajax(url_path + "/GetTillDefinition")
        .then(function (response) {
            form.find("#tilldefinationid").select2({
                placeholder: "Select Defined Name",
                data: response,
                dropdownParent: $("#AddNewMap.modal")
            });
        });
}


window.mappingEvents = {
    'click .edit': function (e, value, row, index) {
        var form = $("#frmTillMap");
        form.trigger("reset");
        if (row.state = true) {
            form.find("[name=id]").val(row.id);
            form.find("[name=tilltypeid]").val(row.tilltypeid).change();
            form.find("[name=chartofaccountid]").val(row.chartofaccountid).change();
            form.find("[name=tilldefinationid]").val(row.tilldefinationid).change();
            form.find("[name=tilldefinationname]").val(row.tilldefinationname);           
            form.find("[name=accountid]").val(row.accountid);
            form.find("[name=datecreated]").val(row.datecreated);
            form.find("[name=createdby]").val(row.createdby);

            $("#tillmapTitle").text("Update");
            $('#btnAddTillMap').hide();
            $("#btnTillMapUpdate").show();
            $('#AddNewMap').modal('show');
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
                    url: url_path + '/DeleteTillMapping',
                    type: 'POST',
                    data: { id: row.id },
                    success: function (data) {
                        swal("Deleted succesfully");
                        $('#tillMapTable').bootstrapTable('refresh');
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

function refresh() {

    setTimeout(function () {
        location.reload()
    }, 100);
}

function updateTillMap() {
    swal({
        title: "Are you sure?",
        text: "Till Mapping will be updated!",
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
            var form = $("#frmTillMap");
            var data = {
                id: form.find("#id").val(),
                tilldefinationid: form.find("#tilldefinationid").val(),
                chartofaccountid: form.find("#chartofaccountid").val(),
                tilltypeid: form.find("#tilltypeid").val(),
                tilldefinationname: form.find("#tilldefinationname").val(),
                accountid: form.find("#accountid").val(),
                datecreated: form.find("#datecreated").val(),
                createdby: form.find("#createdby").val(),

            };
            form.find("#btnTillMapUpdate").attr("disabled", "true");
            $.ajax({
                //url: url_path + '/TellerAndTill/updateTellerLimit',
                url: url_path + '/updateTillMap',
                type: 'POST',
                data: data,
                dataType: "json",
                success: function (result) {
                    swal({
                        title: 'Till Mapping',
                        text: 'Till Mapping updated successfully!',
                        type: 'success'
                    }).then(function () {
                        $('#tillMapTable').
                            bootstrapTable('refresh');
                        $("#btnTillMapUpdate").removeAttr("disabled");
                        $('#AddNewMap').modal('hide');
                    });
                },
                error: function (e) {
                    swal({
                        title: 'Till Mapping',
                        text: 'Till Mapping encountered an error during update',
                        type: 'error'
                    }).then(function () {
                        $("#btnTillMapUpdate").removeAttr("disabled");
                    });
                }
            });
        }
    }, function (isRejected) {
        return;
    });
}

function openTillmapModal() {
    var form = $("#frmTillMap");
    form.trigger("reset");
    $("#tillmapTitle").text("Add");
    form.find('#btnAddTillMap').show();
    form.find("#btnTillMapUpdate").hide();
    $('#AddNewMap').modal('show');
}

function AddTillMap() {
    swal({
        title: "Are you sure?",
        text: "Till Mapping will be saved!",
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
                var form = $("#frmTillMap");
                form.find("#btnAddTillMap").attr("disabled", "true");
                debugger
                var data = {
                    createdby: form.find('#createdby').val(),
                    datecreated: form.find('#datecreated').val(),
                    tilldefinationname: form.find('#tilldefinationname').val(),
                    tilltypeid: form.find('#tilltypeid').val(),
                    chartofaccountid: form.find('#chartofaccountid').val(),
                    tilldefinationid: form.find('#tilldefinationid').val()
                    
                }
                $.ajax({
                    //url: url_path + '/TellerAndTill/AddTellerLimit',
                    url: url_path + '/AddTillMap',
                    type: 'POST',
                   // data: JSON.stringify(data),
                    data:data,
                    dataType: "json",
                   // contentType: "application/json",
                    success: function (result) {
                        swal({
                            title: 'Till Mapping',
                            text: 'Till Mapped successfully!',
                            type: 'success'
                        }).then(function () {
                            $('#tillMapTable').
                                bootstrapTable('refresh');
                            $("#btnAddTillMap").removeAttr("disabled");
                            $('#AddNewMap').modal('hide');
                            refresh();
                        });
                    },
                    error: function (e) {
                        swal({
                            title: 'Till Mapping',
                            text: 'Till Mapping encountered an error',
                            type: 'error'
                        }).then(function () {
                            $("#btnAddTillMap").removeAttr("disabled");
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

function deleteFormatter(value, row, index) {
    return [
        '<button type="button" class="remove btn btn-sm btn-danger" title="Delete">',
        '<i class="now-ui-icons ui-1_simple-remove"></i> ',
        '</button>'
    ].join('');
}

function editFormatter(value, row, index) {
    return [
        '<button type="button" class="edit btn btn-sm btn-warning" title="Edit">',
        '<i class="now-ui-icons ui-2_settings-90"></i>',
        '</button>'
    ].join('');
}

var utilities = {

    tillMapTypeTableFormatter: function (index, row, el) {
        var container = $("<div class='row mx-0'></div>");
        container.append($("<div class='col-xs-12 col-md-6 mb-3 mt-2'><b>Till Type :</b> "
            + row.tilltype.type + "</div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-3 mt-2'><b>Ledger Number :</b> "
            + row.accountid + "</div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-2'><b>Date Created :</b> "
            + moment(row.datecreated).format("MMMM DD, YYYY") + "</div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-3 mt-2'><b>CreatedBy :</b> "
            + row.createdby + "</div>"));
        el.append(container);
    }

};