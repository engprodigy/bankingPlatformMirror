var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) == '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}

$(document).ready(function ($) {
    inittillValidation();
    inittilllimitSelectTwoConfig();
});

function inittillValidation() {
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

function inittilllimitSelectTwoConfig() {
    $.fn.select2.defaults.set("theme", "bootstrap4");
    $.fn.select2.defaults.set("dropdownParent", $(".modal").first());
    $.fn.select2.defaults.set("width", "100%");
    $.fn.select2.defaults.set("allowClear", true);

    var form = $("#frmTill");

    $.ajax(url_path + "/GetTillMapping")
        .then(function (response) {
            form.find("#Tillmappingid").select2({
                placeholder: "Select Till Defined Name",
                data: response,
                dropdownParent: $("#AddNewTill.modal"),
            });           
        });

    $.ajax(url_path + "/GetTillFunction")
        .then(function (response) {
            form.find("#tillfunctionid").select2({
                placeholder: "Select function",
                data: response,
                dropdownParent: $("#AddNewTill.modal"),
            });
        });

}

window.tillEvents = {
    'click .edit': function (e, value, row, index) {
        var form = $("#frmTill");
        form.trigger("reset");
        if (row.state = true) {
            form.find("[name=id]").val(row.id);
            form.find("[name=tillmappingid]").val(row.tillmappingid).change();     
            form.find("[name=tillfunctionid]").val(row.tillfunctionid).change();
            form.find("[name=datecreated]").val(row.datecreated);
            form.find("[name=companyid]").val(row.companyid);
            form.find("[name=branchid]").val(row.branchid);
            form.find("[name=createdby]").val(row.createdby);

            $("#tillTitle").text("Update");
            $('#btnAddTill').hide();
            $("#btnTillUpdate").show();
            $('#AddNewTill').modal('show');
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
                    url: url_path + '/DeleteTillLimit',
                    type: 'POST',
                    data: { id: row.id },
                    success: function (data) {
                        swal("Deleted succesfully");
                        $('#tillTable').bootstrapTable('refresh');
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

function updateTillLimit() {
    swal({
        title: "Are you sure?",
        text: "Till Limit will be updated!",
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
            var form = $("#frmTill");
            var data = {
                id: form.find("#id").val(),
                tillmappingid: form.find("#Tillmappingid").val(),   
                tillfunctionid: form.find("#tillfunctionid").val(),
                accountnumber: form.find("#accountnumber").val(),
                tillfunction: form.find("#tillfunction").val(),
                tillname: form.find("#tillname").val(),
                datecreated: form.find("#datecreated").val(),           
                companyid: form.find("#companyid").val(),   
                branchid: form.find("#branchid").val(),           
                createdby: form.find("#createdby").val()

            };
            form.find("#btnTillUpdate").attr("disabled", "true");
            $.ajax({
                url: url_path + '/updateTillLimit',
                type: 'POST',
                data: data,
                dataType: "json",
                success: function (result) {
                    swal({
                        title: 'Till Limit',
                        text: 'Till Limit updated successfully!',
                        type: 'success'
                    }).then(function () {
                        $('#tillTable').
                            bootstrapTable('refresh');
                        $("#btnTillUpdate").removeAttr("disabled");
                        $('#AddNewTill').modal('hide');
                    });
                },
                error: function (e) {
                    swal({
                        title: 'Till Limit',
                        text: 'Till Limit encountered an error during update',
                        type: 'error'
                    }).then(function () {
                        $("#btnTillUpdate").removeAttr("disabled");
                    });
                }
            });
        }
    }, function (isRejected) {
        return;
    });
}

function refresh() {

    setTimeout(function () {
        location.reload()
    }, 100);
}

function openTillModal() {
    var form = $("#frmTill");
    form.trigger("reset");
    $("#tillTitle").text("Add");
    form.find('#btnAddTill').show();
    form.find("#btnTillUpdate").hide();
    $('#AddNewTill').modal('show');
}

function AddTillLimit() {
    swal({
        title: "Are you sure?",
        text: "Till Limit will be saved!",
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
                var form = $("#frmTill");
                form.find("#btnAddTill").attr("disabled", "true");
               
                var data = {
                    
                    tillmappingid: form.find('#Tillmappingid').val(),
                    tillfunctionid: form.find('#tillfunctionid').val(),                  
                    tillfunction: form.find('#tillfunction').val(),
                    accountnumber: form.find('#accountnumber').val(),
                    tillname: form.find('#tillname').val(),   
                    companyid: form.find('#companyid').val(),
                    branchid: form.find('#branchid').val(),
                    createdby: form.find('#createdby').val()
                }

                if (form.find('#datecreated').val()) {
                    data.datecreated = form.find('#datecreated').val();
                }
                $.ajax({
                    url: url_path + '/AddTillLimit',
                    type: 'POST',
                    data: JSON.stringify(data),
                   // data: data,
                    dataType: "json",
                    contentType: "application/json",
                    success: function (data) {
                        swal({
                            title: 'Till Limit',
                            text: 'Till Limit saved successfully!',
                            type: 'success'
                        }).then(function () {
                            $('#tillTable').
                                bootstrapTable('refresh');
                            $("#btnAddTill").removeAttr("disabled");
                            $('#AddNewTill').modal('hide');
                            refresh()
                        });
                    },
                    error: function (e) {
                        swal({
                            title: 'Till Limit',
                            text: 'Till Limit encountered an error',
                            type: 'error'
                        }).then(function () {
                            $("#btnAddTill").removeAttr("disabled");
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

var tilllimUtilities = {

    tilllimitTableFormatter: function (index, row, el) {
        var container = $("<div class='row mx-0'></div>");
        container.append($("<div class='col-xs-12 col-md-6 mb-3 mt-2'><b>Branch Code :</b> "
            + row.branchid + "</div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-3 mt-2'><b>Ledger Account :</b> "
            + row.ledgeraccount + "</div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-2'><b>Date Created :</b> "
            + moment(row.datecreated).format("MMMM DD, YYYY") + "</div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-3 mt-2'><b>Created By :</b> "
            + row.createdby + "</div>"));
        el.append(container);
    }

};