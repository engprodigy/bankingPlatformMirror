var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) == '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}

$(document).ready(function ($) {
    inittellerValidation();
    initTLSelectTwoConfig();   
    convertAmount();
   // $('input.number').number(true,2);
});


function convertAmount() {
    var amountMax = document.getElementById("maxamount");
    var amountMin = document.getElementById("minamount");
    
    amountMax.value = Number(amountMax.value).toFixed(2);
    amountMin.value = Number(amountMin.value).toFixed(2);
  
    //console.log(Number(amount.value).toFixed(2));
}

function inittellerValidation() {
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
    $("#frmTellerLimit").validate({
        messages: {
            name: {
                required: "Name is required"
            }
        }
    });
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

function initTLSelectTwoConfig() {
    $.fn.select2.defaults.set("theme", "bootstrap4");
    $.fn.select2.defaults.set("dropdownParent", $(".modal").first());
    $.fn.select2.defaults.set("width", "100%");
    $.fn.select2.defaults.set("allowClear", true);

    var form = $("#frmTellerLimit");

    $.ajax(url_path + "/GetOperationType") 
        .then(function (response) {
            $("#operationtypeid").select2({
                placeholder: "Select Operation Type",
                data: response,
                dropdownParent: $("#AddNewTeller.modal"),
            });
        });
}

window.tellerEvents = {
    'click .edit': function (e, value, row, index) {
        var form = $("#frmTellerLimit");
        form.trigger("reset");
        if (row.state = true) {
            form.find("[name=id]").val(row.id);
            form.find("[name=operationtypeid]").val(row.operationtypeid).change();          
            form.find("[name=maxamount]").val(row.maxamount);
            form.find("[name=minamount]").val(row.minamount);
            form.find("[name=operationname]").val(row.operationname).change();  
            form.find("[name=branchid]").val(row.branchid);           
            form.find("[name=companyid]").val(row.companyid);
          
            $("#tellerTitle").text("Update");
            $('#btnAddTeller').hide();
            $("#btnTellerUpdate").show();
            $('#AddNewTeller').modal('show');
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
                    url: url_path + '/DeleteTellerLimit',
                    type: 'POST',
                    data: { id: row.id },
                    success: function (data) {
                        swal("Deleted succesfully");
                        $('#tellerTable').bootstrapTable('refresh');
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

function updateTellerLimit() {
    swal({
        title: "Are you sure?",
        text: "Teller Till will be updated!",
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
            var form = $("#frmTellerLimit");
            var data = {
                id: form.find("#id").val(),
                operationtypeid: form.find("#operationtypeid").val(),
                operationname: form.find("#operationname").val(),
                maxamount: form.find("#maxamount").val(),
                minamount: form.find("#minamount").val(),  
                companyid: form.find("#companyid").val(),
                branchid: form.find("#branchid").val(),
             
            };
            form.find("#btnTellerUpdate").attr("disabled", "true");
            $.ajax({               
                //url: url_path + '/TellerAndTill/updateTellerLimit',
                url: url_path + '/updateTellerLimit',
                type: 'POST',
                data: data,
                dataType: "json",
                success: function (result) {
                    swal({
                        title: 'Bank Draft',
                        text: 'Teller Limit updated successfully!',
                        type: 'success'
                    }).then(function () {
                        $('#tellerTable').
                            bootstrapTable('refresh');
                        $("#btnTellerUpdate").removeAttr("disabled");
                        $('#AddNewTeller').modal('hide');
                    });
                },
                error: function (e) {
                    swal({
                        title: 'Teller Limit',
                        text: 'Teller Limit encountered an error during update',
                        type: 'error'
                    }).then(function () {
                        $("#btnTellerUpdate").removeAttr("disabled");
                    });
                }
            });
        }
    }, function (isRejected) {
        return;
    });
}

function openTellerModal() {
    var form = $("#frmTellerLimit");
    form.trigger("reset");
    $("#tellerTitle").text("Add");
    form.find('#btnAddTeller').show();
    form.find("#btnTellerUpdate").hide();
    $('#AddNewTeller').modal('show');
}

function AddTellerLimit() {
    swal({
        title: "Are you sure?",
        text: "Teller Limit will be saved!",
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
                var form = $("#frmTellerLimit");
                form.find("#btnAddTeller").attr("disabled", "true");
                debugger
                var data = {         
                    operationtypeid: form.find('#operationtypeid').val(),
                    operationname: form.find('#operationname').val(), 
                    maxamount: form.find('#maxamount').val(),
                    minamount: form.find('#minamount').val(),
                    branchid: form.find('#branchid').val(),                 
                    companyid: form.find('#companyid').val(),              

                }
                $.ajax({
                    //url: url_path + '/TellerAndTill/AddTellerLimit',
                    url: url_path + '/AddTellerLimit',
                    type: 'POST',
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: "application/json",
                    success: function (result) {
                        swal({
                            title: 'Teller Limit',
                            text: 'Teller Limit saved successfully!',
                            type: 'success'
                        }).then(function () {
                            $('#tellerTable').
                                bootstrapTable('refresh');
                            $("#btnAddTeller").removeAttr("disabled");
                            $('#AddNewTeller').modal('hide');
                            window.location.reload();
                        });
                    },
                    error: function (e) {
                        swal({
                            title: 'Teller Limit',
                            text: 'Teller Limit encountered an error',
                            type: 'error'
                        }).then(function () {
                            $("#btnAddTeller").removeAttr("disabled");
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

function maxAmountFormatter(value, row, index) {
    return (value.maxamount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function minAmountFormatter(value, row, index) {
    return (value).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function minamtFormatter(value, row, $element) {
    var format = (value).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var html = '<div>' + format + '</div>';
    return html;
}

function maxamtFormatter(value, row, $element) {
    var format = (value).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var html = '<div>' + format + '</div>';
    return html;
}

var utility = { 

    tellerLimitTableFormatter: function (index, row, el) {
        var container = $("<div class='row mx-0'></div>");
        container.append($("<div class='col-xs-12 col-md-6 mb-3 mt-2'><b>Branch Code :</b> "
            + row.branchid + "</div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-3 mt-2'><b>Maximum Amount:</b> "
            + (row.maxamount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "</div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-3 mt-2'><b>Minimum Amount:</b> "
            + (row.minamount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "</div>"));       
        el.append(container);
    }

};




