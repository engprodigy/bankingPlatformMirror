var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) == '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}

$(document).ready(function ($) {
    initTillMapValidation();  
    changeText();
});

function dateFormatter(value, row, $element) {
    var format = moment(value).format("DD MMMM, YYYY");
    var html = '<div>' + format + '</div>';
    return html;
}

function editDefinedFormatter(value, row, index) {
    return [
        '<button type="button" class="edit btn btn-sm btn-warning" title="Edit">',
        '<i class="now-ui-icons ui-2_settings-90"></i>',
        '</button>'
    ].join('');
}

function deleteDefinedFormatter(value, row, index) {
    return [
        '<button type="button" class="remove btn btn-sm btn-danger" title="Delete">',
        '<i class="now-ui-icons ui-1_simple-remove"></i> ',
        '</button>'
    ].join('');
}

function changeText() {
    var name = document.getElementById("tellername");
    name.value = name.value.toUpperCase();
}

function initTillMapValidation() {
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
    $("#frmTiilldef").validate({
        messages: {
            name: {
                required: "Name is required"
            }
        }
    });
}

window.definitionEvents = {
    'click .edit': function (e, value, row, index) {
        var form = $("#frmTiilldef");
        form.trigger("reset");
        if (row.state = true) {
            form.find("[name=id]").val(row.id);
            form.find("[name=tellername]").val(row.tellername);           
            form.find("[name=createdby]").val(row.createdby);
            form.find("[name=updatedby]").val(row.updatedby);
            form.find("[name=datecreated]").val(row.datecreated);
            form.find("[name=dateupdated]").val(row.dateupdated);
            form.find("[name=comment]").val(row.comment);

            $('#definitionTitle').text("Update");  
            $('#btnAddDefinition').hide();
           // $('btnDefineUpdate').show();   
            form.find('#btnDefineUpdate').show();
            $('#AddNewDefinition').modal('show');            
            
                      
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
                    url: url_path + '/DeleteTillDefinition',
                    type: 'POST',
                    data: { id: row.id },
                    success: function (data) {
                        swal("Deleted succesfully");
                        $('#definitionTable').bootstrapTable('refresh');
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

function updateTillDefinition() {
    swal({
        title: "Are you sure?",
        text: "Till Definition will be updated!",
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
            var form = $("#frmTiilldef");
            debugger
            var data = {
                id: form.find("#id").val(),
                tellername: form.find("#tellername").val(),            
                updatedby: form.find("#updatedby").val(),
                datecreated: form.find("#datecreated").val(),
                dateupdated: form.find("#dateupdated").val(),
                createdby: form.find("#createdby").val(),
                comment: form.find("[name=comment]").val()
            };
            form.find("#btnDefineUpdate").attr("disabled", "true");
            $.ajax({
                url: url_path + '/updateTillDefinition',
                type: 'POST',
                data: data,
                dataType: "json",
                success: function (result) {
                    swal({
                        title: 'Till Definition',
                        text: 'Till Definition updated successfully!',
                        type: 'success'
                    }).then(function () {
                        $('#definitionTable').
                            bootstrapTable('refresh');
                        form.find("#btnDefineUpdate").removeAttr("disabled");
                        //$('btnDefineUpdate').removeAttr("disabled");                    
                        $('#AddNewDefinition').modal('hide');
                    });
                },
                error: function (e) {
                    swal({
                        title: 'Teller Setup',
                        text: 'Till Definition encountered an error during update',
                        type: 'error'
                    }).then(function () {
                       // $("#btnDefineUpdate").removeAttr("disabled");
                        form.find("#btnDefineUpdate").removeAttr("disabled");
                    });
                }
            });
        }
    }, function (isRejected) {
        return;
    });
}

function openDefinitionModal() {
    var form = $("#frmTiilldef");
    form.trigger("reset");
    $("#definitionTitle").text("New");
    form.find('#btnAddDefinition').show();
    form.find("#btnDefineUpdate").hide();
    $('#AddNewDefinition').modal('show');
}

function AddTillDefinition() {
    swal({
        title: "Are you sure?",
        text: "Till Definition will be saved!",
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
        function(isConfirm) {
            if (isConfirm) {
                var form = $("#frmTiilldef");
                form.find("#btnAddDefinition").attr("disabled", "true");

                var data = {                              
                    tellername: form.find('#tellername').val(),
                    comment:  $.trim($("[name=comment]").val())
                }
                                
                $.ajax({
                    url: url_path + '/AddTillDefinition',
                    type: 'POST',
                    data: data,
                    //data: JSON.stringify(data),                    
                    dataType: "json",
                   // contentType: "application/json",  
                    success: function (result) {
                        swal({
                            title: 'Till Definition',
                            text: 'Till Definition saved successfully!',
                            type: 'success'
                        }).then(function () {
                            $('#definitionTable').
                                bootstrapTable('refresh');
                            $("#btnAddDefinition").removeAttr("disabled");
                            $('#AddNewDefinition').modal('hide');
                            window.location.reload();
                        });
                    },
                    error: function (e) {
                        swal({
                            title: 'Till Definition',
                            text: 'Till Definition encountered an error',
                            type: 'error'
                        }).then(function () {
                            $("#btnAddDefinition").removeAttr("disabled");
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


var define = {

    tillDefineTableFormatter: function (index, row, el) {
        var container = $("<div class='row mx-0'></div>");
        container.append($("<div class='col-xs-12 col-md-6 mb-3 mt-2'><b>Createdby :</b> "
            + row.createdby + "</div>"));       
        container.append($("<div class='col-xs-12 col-md-6 mb-2'><b>Date Created :</b> "
            + moment(row.datecreated).format("MMMM DD, YYYY") + "</div>"));       
        el.append(container);
    }

};
