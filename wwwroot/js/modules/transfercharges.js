var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) == '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}
var chartOfAccs = {};

$(document).ready(function () {
    initchargesValidation();
    prepareChartofAccount();
});

function prepareChartofAccount() {
    $.ajax(url_path + "/Setup/LoadChartOfAccount")
        .then(
        function (response) {
            // use for select 2
            initchargesSelectTwoConfig(response);

            // format api data
            $.each(response, function (index, item) {
                chartOfAccs[item.id] = item.text;
            });

            // initialize data-table
            $("#chargeTable").bootstrapTable({
                search: true,
                toolbar: "#transfercharges-toolbar",
                searchAlign: "right",
                showPaginationSwitch: true,
                mobileResponsive: true,
                showRefresh: true,
                showToggle: true,
                buttonsClass: "danger",
                columns: [
                    {
                        field: "chartofaccountid",
                        title: "Credit Name",
                        formatter: chartMapper
                    },{
                        field: "maxamount",
                        title: "Max. Amt.",
                        align: "right",
                        formatter: toCommaSeperated
                    },{
                        field: "minamount",
                        title: "Min. Amt.",
                        align: "right",
                        formatter: toCommaSeperated
                    },{
                        field: "amounttocharge",
                        title: "Charge Amt.",
                        align: "right",
                        formatter: toCommaSeperated
                    },{
                        events: chargeEvents,
                        formatter: editFormatter,
                        width: "5%",
                        align: "center"
                    },{
                        events: chargeEvents,
                        formatter: deleteFormatter,
                        width: "5%",
                        align: "center"
                    },
                ]
            });
        }
    );
}

function initchargesValidation() {
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
    $("#frmCharges").validate({
        messages: {
            amounttocharge: {
                required: "Charge Amount is required"
            }
        }
    });
}

function dateFormatter(value, row, $element) {
    var format = moment(value).format("DD MMMM, YYYY");
    var html = '<div>' + format + '</div>';
    return html;
}

function editFormatter(value, row, index) {
    return [
        '<button type="button" class="edit btn btn-sm btn-warning" title="Edit">',
        '<i class="now-ui-icons ui-2_settings-90"></i>',
        '</button>'
    ].join('');
}

function initchargesSelectTwoConfig(data) {
    $.fn.select2.defaults.set("theme", "bootstrap4");
    $.fn.select2.defaults.set("dropdownParent", $(".modal").first());
    $.fn.select2.defaults.set("width", "100%");
    $.fn.select2.defaults.set("allowClear", true);

    $("#chartofaccountid").select2({
        placeholder: "Select customer Ledger Account",
        data: data,
        dropdownParent: $("#AddNewcharges.modal"),
    });    

    // select2 events
    $(document).on("select2:open", function () {
        $(".select2-results__options").perfectScrollbar()
    });
}

function deleteFormatter(value, row, index) {
    return [
        '<button type="button" class="remove btn btn-sm btn-danger" title="Delete">',
        '<i class="now-ui-icons ui-1_simple-remove"></i> ',
        '</button>'
    ].join('');
}

window.chargeEvents = {
    'click .edit': function (e, value, row, index) {      
        var form = $("#frmCharges");
        form.trigger("reset");
        if (row.state = true) {
            form.find("[name=transferchargeid]").val(row.transferchargeid);
            form.find("[name=chartofaccountid]").val(row.chartofaccountid).change();
            form.find("[name=maxamount]").val(toCommaSeperated(row.maxamount));
            form.find("[name=minamount]").val(toCommaSeperated(row.minamount));
            form.find("[name=createdby]").val(row.createdby);
            form.find("[name=amounttocharge]").val(toCommaSeperated(row.amounttocharge));
            form.find("[name=datetimecreated]").val(row.datetimecreated); 
            $("#transferChargesTitle").text("Update");
            $('#btnAddcharge').hide();
            $("#btnchargeUpdate").show();
            $('#AddNewcharges').modal('show');
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
                    url: url_path + '/Setup/DeleteTransferCharges',
                    type: 'POST',
                    data: { transferchargeid: row.transferchargeid },
                    success: function (data) {
                        swal("Deleted succesfully");
                        $('#chargeTable').bootstrapTable('refresh');
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

function UpdateTransferCharges() {
    swal({
        title: "Are you sure?",
        text: "KYC will be updated!",
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
            var form = $("#frmCharges");
            var data = {
                transferchargeid: form.find("#transferchargeid").val(),
                chartofaccountid: form.find("#chartofaccountid").val(),
                maxamount: form.find("#maxamount").val(),
                minamount: form.find("#minamount").val(),
                amounttocharge: form.find("#amounttocharge").val(),
                datetimecreated: form.find("#datetimecreated").val(),
                createdby: form.find('#createdby').val(),
              
            };
            form.find("#btnchargeUpdate").attr("disabled", "true");
            $.ajax({
                url: url_path + '/Setup/UpdateTransferCharges',        
                type: 'POST',
                data: data,
                dataType: "json",
                success: function (result) {
                    swal({
                        title: 'Transfer Charge',
                        text: 'Transfer Charge updated successfully!',
                        type: 'success'
                    }).then(function () {
                        $('#chargeTable').
                            bootstrapTable('refresh');
                        $("#btnchargeUpdate").removeAttr("disabled");
                        $('#AddNewcharges').modal('hide');
                    });
                },
                error: function (e) {
                    swal({
                        title: 'Transfer Charge',
                        text: 'Transfer Charge encountered an error during update',
                        type: 'error'
                    }).then(function () {
                        $("#btnchargeUpdate").removeAttr("disabled");
                    });
                }
            });
        }
    }, function (isRejected) {
        return;
    });
}

function openchargesModal() {
    var form = $("#frmCharges");
    form.trigger("reset");
    $("#transferChargesTitle").text("Add");
    form.find('#btnAddcharge').show();
    form.find("#btnchargeUpdate").hide();
    $('#AddNewcharges').modal('show');
}

function AddTransferCharges() {
    swal({
        title: "Are you sure?",
        text: "Transfer Charge will be saved!",
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
                var form = $("#frmCharges");
                form.find("#btnAddcharge").attr("disabled", "true");
                var data = {                    
                    chartofaccountid: form.find('#chartofaccountid').val(),
                    amounttocharge: form.find('#amounttocharge').val(),    
                    creditledger: form.find('#creditledger').val(),
                    maxamount: form.find('#maxamount').val(),
                    minamount: form.find('#minamount').val()                       
                }
                $.ajax({
                    url: url_path + '/Setup/AddTransferCharges',                   
                    method: 'POST',
                    data: JSON.stringify(data),
                    contentType: "application/json",
                    success: function (result) {
                        swal({
                            title: 'Transfer Charges',
                            text: 'Transfer Charges saved successfully!',
                            type: 'success'
                        }).then(function () {
                            $('#chargeTable').
                                bootstrapTable('refresh');
                            $("#btnAddcharge").removeAttr("disabled");
                            $('#AddNewcharges').modal('hide');
                        });
                    },
                    error: function (e) {
                        swal({
                            title: 'Transfer Charges',
                            text: 'Transfer Charges encountered an error',
                            type: 'error'
                        }).then(function () {
                            $("#btnAddcharge").removeAttr("disabled");
                        });
                    }
                });
            }
        }, function (isRejected) {
            return;
        });
}

function chartMapper(value) {
    return chartOfAccs[value];
}
function toCommaSeperated(value) {
    //var value = this;
    
    if (isNaN(value)) {
        value = 0;
    }
    while (/(\d+)(\d{3})/.test(value.toString())) {
        value = value.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
    }
    return value;
}

function valueFormatter(value, row, $element) {
    var format = parseFloat(value.toString().replace(/,/g, "")).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var html = '<div class="text-right">' + format + '</div>';
    return html;
}

function getFieldInputValue(inputField) {
    //debugger
    var inputValue = inputField.value;
    var inputId = inputField.id;
    
    
    if (isNaN(inputValue)) {
        value = 0;
    }
   // while (/(\d+)(\d{3})/.test(inputValue.toString())) {
    if (/(,)/.test(inputValue.toString())) {
        inputValue = inputValue.toString().replace(/(,)/g, "");
       while (/(\d+)(\d{3})/.test(inputValue.toString())) {
            inputValue = inputValue.replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
        }
        //inputValue = inputValue.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
    } else {
    /*if (/(\d+)(\d{3})/.test(inputValue.toString())) {
        inputValue = inputValue.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
        }*/
        while (/(\d+)(\d{3})/.test(inputValue.toString())) {
            inputValue = inputValue.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
        }
    }
    var form = $("#frmCharges");
    form.find("#" + inputId).val(inputValue);
   // form.find("[name=minamount]").val(toCommaSeperated(row.minamount));
}