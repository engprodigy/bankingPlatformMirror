var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) === '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}

$(document).ready(function ($) {
    initSetupTellerValidation();
    initSetupTellerSelectTwoConfig();
   
});

function initSetupTellerValidation() {
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
    $("#frmtellersetup").validate({
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

function initSetupTellerSelectTwoConfig() {
    $.fn.select2.defaults.set("theme", "bootstrap4");
    $.fn.select2.defaults.set("dropdownParent", $(".modal").first());
    $.fn.select2.defaults.set("width", "100%");
    $.fn.select2.defaults.set("allowClear", true);

    var form = $("#frmtellersetup");

    $.ajax(url_path + "/GetTillLimitInfo")
        .then(function (response) {
            form.find("#tilllimitid").select2({
                placeholder: "Select Teller Till Ledger",
                data: response,
                dropdownParent: $("#AddNewTellerset.modal"),
            });
        });

    $.ajax(url_path + "/GetStaffInfo")
        .then(function (response) {
            form.find("#staffinformationid").select2({
                placeholder: "Select Till user",
                data: response,
                dropdownParent: $("#AddNewTellerset.modal")
            });
        });


    $.ajax(url_path + "/GetTillMapping")
        .then(function (response) {
            form.find("#tillmappingid").select2({
                placeholder: "Select Teller Mapped Account",
                data: response,
                dropdownParent: $("#AddNewTellerset.modal")
            });
        }); 
}

window.tellersetupEvents = {
    'click .edit': function (e, value, row, index) {
        var form = $("#frmtellersetup");
        form.trigger("reset");
        if (row.state === true) {
            form.find("[name=id]").val(row.id);
            form.find("[name=tillmappingid]").val(row.tillmappingid).change();     
            form.find("[name=staffinformationid]").val(row.staffinformationid).change();
            form.find("[name=tilllimitid]").val(row.tilllimitid).change();
            form.find("[name=tillaccountnumber]").val(row.tillaccountnumber);
            form.find("[name=tilllimitamount]").val(row.tilllimitamount);
            form.find("[name=tilluser]").val(row.tilluser);
            form.find("[name=tillname]").val(row.tillname);        
            form.find("[name=datecreated]").val(row.datecreated);
            form.find("[name=companyid]").val(row.companyid);
            form.find("[name=branchid]").val(row.branchid);
            form.find("[name=createdby]").val(row.createdby);
            form.find("[name=tellertillaccount]").val(row.tellertillaccount);
            

            $("#tellerSetupTitle").text("Update");
            $('#btnAddTellerSetup').hide();
            $("#btnTellerSetupUpdate").show();
            $('#AddNewTellerset').modal('show');
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
                    url: url_path + '/DeleteTellerSetup',
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

function updateTellerSetup() {
    swal({
        title: "Are you sure?",
        text: "Teller Setup will be updated!",
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
            var form = $("#frmtellersetup");
            var data = {
                id: form.find("#id").val(),
                tillmappingid: form.find("#tillmappingid").val(),   
                staffinformationid: form.find("#staffinformationid").val(),
                tillaccountnumber: form.find("#tillaccountnumber").val(),
                tilllimitamount: form.find("#tilllimitamount").val(),
                tillname: form.find("#tillname").val(),
                tilluser: form.find("#tilluser").val(),
                tilllimitid: form.find("#tilllimitid").val(),
                datecreated: form.find("#datecreated").val(),          
                companyid: form.find("#companyid").val(),   
                branchid: form.find("#branchid").val(),           
                createdby: form.find("#createdby").val(),
                tellertillaccount: form.find("#tellertillaccount").val()
            };
            form.find("#btnTellerSetupUpdate").attr("disabled", "true");
            $.ajax({
                url: url_path + '/updateTellerSetup',
                type: 'POST',
                data: data,
                dataType: "json",
                success: function (result) {
                    swal({
                        title: 'Teller Setup',
                        text: 'Teller Setup updated successfully!',
                        type: 'success'
                    }).then(function () {
                        $('#tellersetTable').
                            bootstrapTable('refresh');
                        $("#btnTellerSetupUpdate").removeAttr("disabled");
                        $('#AddNewTellerset').modal('hide');
                    });
                },
                error: function (e) {
                    swal({
                        title: 'Teller Setup',
                        text: 'Teller Setup encountered an error during update',
                        type: 'error'
                    }).then(function () {
                        $("#btnTellerSetupUpdate").removeAttr("disabled");
                    });
                }
            });
        }
    }, function (isRejected) {
        return;
    });
}

function opentellersetModal() {
    var form = $("#frmtellersetup");
    form.trigger("reset");
    $("#tellerSetupTitle").text("Add");
    form.find('#btnAddTellerSetup').show();
    form.find("#btnTellerSetupUpdate").hide();
    $('#AddNewTellerset').modal('show');
}

function AddTellerSetup() {
    swal({
        title: "Are you sure?",
        text: "Teller Setup will be saved!",
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
                var form = $("#frmtellersetup");
                form.find("#btnAddTellerSetup").attr("disabled", "true");
                debugger
                var data = {

                    tillmappingid: form.find('#tillmappingid').val(),
                    staffinformationid: form.find('#staffinformationid').val(), 
                    tilllimitid: form.find("#tilllimitid").val(),
                    tilllimitamount: form.find('#tilllimitamount').val(),
                    tillaccountnumber: form.find('#tillaccountnumber').val(),
                    tillname: form.find('#tillname').val(), 
                    tilluser: form.find("#tilluser").val(),
                    companyid: form.find('#companyid').val(),               
                    datecreated: form.find('#datecreated').val(),
                    branchid: form.find('#branchid').val(),
                    createdby: form.find('#createdby').val(),
                    tellertillaccount: form.find('#tellertillaccount').val()
                }
                $.ajax({
                    url: '../TellerAndTill/AddTellerSetup',
                    //url: url_path + '/AddTellerSetup',
                    type: 'POST',
                   //data: JSON.stringify(data),
                    data: data,
                    dataType: "json",
                    //contentType: "application/json",
                    success: function (result) {
                        swal({
                            title: 'Teller Setup',
                            text: 'Teller Setup saved successfully!',
                            type: 'success'
                        }).then(function () {
                            $('#tellersetTable').
                                bootstrapTable('refresh');
                            $("#btnAddTellerSetup").removeAttr("disabled");
                            $('#AddNewTellerset').modal('hide');
                            
                        });
                    },
                    error: function (e) {
                        swal({
                            title: 'Teller Setup',
                            text: 'Teller Setup encountered an error',
                            type: 'error'
                        }).then(function () {
                            $("#btnAddTellerSetup").removeAttr("disabled");
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

function tillamtFormatter(value, row, $element) {
    var format = (value).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var html = '<div>' + format + '</div>';
    return html;
}

var tsutility = {

    tsTableFormatter: function (index, row, el) {
        var container = $("<div class='row mx-0'></div>");
        container.append($("<div class='col-xs-12 col-md-6 mb-3 mt-2'><b>Till Ledger Account :</b> "
            + row.tillaccountnumber + "</div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-3 mt-2'><b>Till User :</b> "
            + row.tilluser + "</div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-3 mt-2'><b>Till Limit :</b> "
            + (row.tilllimitamount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "</div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-3 mt-2'><b>Created by :</b> "
            + row.createdby + "</div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-2'><b>Date Created :</b> "
            + moment(row.datecreated).format("MMMM DD, YYYY") + "</div>"));
        el.append(container);
    }

};