var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) == '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}


function loginFormatter(value, row, index) {
    return [
        '<button type="button" class="edit btn btn-sm btn-success" title="Edit">',
        '<i class="now-ui-icons users_single-02"></i> Click To login',
        '</button>' 
    ].join('');
}

$(document).ready(function () {
    initLoginFormValidations();  
});

function initLoginFormValidations() {
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

    $("#tellerLoginTable").validate({
        rules: {
            startrange: {
                digits: true
            }
        },
        
    });
}

window.tellerLoginEvents = {
    'click .edit': function (e, value, row, index) {
        var form = $("#frmtellerlogin");
        form.trigger("reset");

        var Id = row.id;
        if (row.state = true) {
            debugger
            var data = JSON.stringify(row);
            $.getJSON("../TellerAndTill/GetAlreadyLoggedin", { id: Id }, function (value) {

                form.find("[name=id]").val(row.id);
                form.find("[name=ledgername]").val(row.ledgername);
                form.find("[name=accountid]").val(row.accountid);
                form.find("[name=accountbalance]").val(row.accountbalance);
                form.find("[name=tellerno]").val(row.tellerno);

                form.find("[name=tellerlogindate]").val(row.tellerlogindate);
                form.find("[name=tellerlogintime]").val(row.tellerlogintime);
                form.find("[name=closingbalance]").val(row.closingbalance);
                form.find("[name=assignuser]").val(row.assignuser);
                form.find("[name=companyid]").val(row.companyid);
                form.find("[name=branchid]").val(row.branchid);
                form.find("[name=username]").val(row.username);
                form.find("[name=isactive]").prop("checked", row.isactive);
               
                //$("#btntellerLogin").show();
                $('#AddNewTellerLogin').modal('show');
                $("#btnPreviouslyLogin").show();
                getTellerLogin();

                console.log("JSON Data: " + json);

            });


         
        }
    },
};

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

function previouslyLogin() {

    //var id = $("#username").text().trim();
    // var id = $.trim($(".info").first().find("span:first").text());
    var id;
    id = $.trim($(".info").first().find("span:first").text());


    swal({
        title: "Are you sure",
        text: "You Previousely access this Operation?",
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
            var data = {
                id: id
            };
            $.ajax({
                url: url_path + '../GetAlreadyLoggedin/' + id,
                type: 'POST',
                data: data,
                dataType: "json",
                success: function (data) {
                    if (data == 0) {
                                               
                        swal({
                            title: 'Teller Operation',
                            text: 'You are yet to Login!',
                            type: 'success'
                        }).then(function () {

                            $("#btntellerLoginpUpdate").removeAttr("disabled");
                            $('#AddNewTellerLogin').modal('hide');

                        });

                    }
                    else {
                        window.location.assign(url_path + "/../TellerPosting")
                    }
                },
                error: function (e) {
                    swal({
                        title: 'Teller Operation',
                        text: 'Teller Operation encountered an error!',
                        type: 'error'
                    }).then(function () {
                        $("#btntellerLogin").removeAttr("disabled");
                    });
                }
            });
        }
    }, function (isRejected) {
        return;
    });

}

function getTellerLogin() {

    //var id = $("#username").text().trim();
    debugger
    var id;
    id = $.trim($(".info").first().find("span:first").text());
    //id = $('#tellerLoginTable').attr();           //I commented this line and used the above id = $.trim($(".info").first().find("span:first").text());
    swal({
        title: "Are you sure?",
        text: "You want to perform Teller Operation!",
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
            var data = {
                Id: id

            };
            debugger
            $.ajax({
                url: url_path + '/../GetAlreadyLoggedin/' + id,
                type: 'POST',
                data: data,
                dataType: "json",
                success: function (data) {
                    if (data == 0) {
                        $.ajax({
                            url: url_path + '/../GetTellerUserName/' + id,
                            type: 'GET',
                            dataType: "json",
                            error: function (e) {
                                swal({
                                    title: 'Teller Login',
                                    text: 'You do not have the privilege to perform Teller Operation',
                                    type: 'error'
                                }).then(function () {
                                    $("#btnAccess").removeAttr("disabled");
                                });
                            }
                        }).then(function (isConfirm) {
                            if (isConfirm) {
                                var form = $("#frmtellerlogin");
                                var data = {
                                    id: form.find("#id").val(),
                                    ledgername: form.find("#ledgername").val(),
                                    accountid: form.find("#accountid").val(),
                                    isactive: form.find('#isactive').prop("checked"),
                                    assignuser: id
                                };
                                form.find("#btntellerLogin").attr("disabled", "true");
                                $.ajax({
                                    url: url_path + '/../getTellerLogin',
                                    type: 'POST',
                                    data: data,
                                    dataType: "json",
                                    success: function (result) {
                                        swal({
                                            title: 'Teller Login',
                                            text: 'Teller Logged in successfully!',
                                            type: 'success'
                                        }).then(function () {
                                            //sleep(100);
                                            //$('#tellerLoginTable').
                                            //    bootstrapTable('refresh');
                                            $("#btnTellerSetupUpdate").removeAttr("disabled");
                                            $('#AddNewTellerLogin').modal('hide');

                                            // var tellerOperationURL = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname + window.location.search

                                            window.location.assign(url_path + "/../TellerPosting")
                                        });
                                    },
                                    error: function (e) {
                                        swal({
                                            title: 'Teller Login',
                                            text: 'You do not have privilege to login to Teller Operation',
                                            type: 'error'
                                        }).then(function () {
                                            $("#btntellerLogin").removeAttr("disabled");
                                        });
                                    }
                                });
                            }
                        }, function (isRejected) {
                            return;
                        });   
                    }
                    else {
                        window.location.assign(url_path + "/../TellerPosting")
                    }                    
                },
                error: function (e) {
                    swal({
                        title: 'Teller Operation',
                        text: 'Teller Operation encountered an error!',
                        type: 'error'
                    }).then(function () {
                        $("#btntellerLogin").removeAttr("disabled");
                    });
                }
            });
        }
    }, function (isRejected) {
        return;
    });
        
}
