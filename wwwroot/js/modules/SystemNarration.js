var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) == '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}

$(document).ready(function () {
    initNarrationFormValidations();
    $(".modal").perfectScrollbar();
});

function AddSystemNarration() {
    var form = $("#system-narration-form");
    if (!form.valid()) { return; }

    swal({
        title: "Are you sure?",
        text: "System narration record will be saved",
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
            var data = {
                text: form.find("[name=text]").val(),
                isdefault: form.find("[name=isdefault]").attr("checked")
            };
            $.ajax(
                url_path + "/Setup/AddSystemNarration",
                {
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(data)
                }).then(
                    function (response) {
                        swal({
                            title: "Add system narration",
                            type: "success",
                            text: "System narration record saved successfully!"
                        });
                        $("#system-narration-table").bootstrapTable("refresh");
                        $("#system-narration-modal").modal("hide");
                    },
                    function (error) {
                        // show error message
                        swal({
                            title: "Add system narration",
                            type: "error",
                            text: "There was an error saving this record. Please try again."
                        });
                    }
                );
        },
        function (isRejected) { return }
    );
}

function UpdateSystemNarration() {
    var form = $("#system-narration-form");
    if (!form.valid()) {
        return;
    }

    swal({
        title: "Are you sure?",
        text: "System narration record will be updated",
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
            var data = {
                id: form.find("[name=id]").val(),
                text: form.find("[name=text]").val(),
                isdefault: form.find("[name=isdefault]").attr("checked"),
                datecreated: form.find("[name=datecreated]").val(),
                createdby: form.find("[name=createdby]").val(),
            };
            $.ajax(
                url_path + "/Setup/UpdateSystemNarration",
                {
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(data)
                }).then(
                    function (response) {
                        swal({
                            title: "Update system narration",
                            type: "success",
                            text: "System narration record updated successfully!"
                        });
                        $("#system-narration-table").bootstrapTable("refresh");
                        $("#system-narration-modal").modal("hide");
                    },
                    function (error) {
                        swal({
                            title: "Update system narration",
                            type: "error",
                            text: "There was an error updating this record. Please try again."
                        });
                    }
                );
        },
        function (isRejected) { return }
    );
}

var systemNarrationEvents = {
    'click .edit': function (e, value, row) {
        openUpdateNarrationModal(row);
    },
    'click .remove': function (e, value, row) {
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
            $.ajax({
                url: url_path + '/Setup/DeleteSystemNarration/' + row.id,
                type: 'POST',
                success: function () {
                    swal("Record deleted succesfully");
                    $("#system-narration-table").bootstrapTable("refresh");
                },
                error: function (e) {
                    swal("An exception occured!");
                }
            });
        }, function (isRejected) {
            return;
        });
    }
};

function initNarrationFormValidations() {
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

    $("#system-narration-form").on("submit",
        function (e) { e.preventDefault(); }
    );

    $("#system-narration-form").validate({
        messages: {
            text: {
                required: "System narration text is required",
            }
        },
        onsubmit: false
    });
}

function openNewNarrationModal() {
    // reset form
    $("#system-narration-form").trigger("reset");

    // hide/show buttons
    $("#btn-update-system-narration").hide();
    $("#btn-add-system-narration").show();

    // swap modal header then show
    $("#system-narration-header").text("New");
    $("#system-narration-modal").modal("show");
}

function openUpdateNarrationModal(row) {
    var form = $("#system-narration-form");
    // reset form
    form.trigger("reset");

    // populate form
    form.find("[name=id]").val(row.id);
    form.find("[name=text]").val(row.text);
    if (row.isdefault) {
        form.find("[name=isdefault]")
            .attr("checked", true);
    }
    form.find("[name=datecreated]").val(row.datecreated);
    form.find("[name=createdby]").val(row.createdby);

    // hide/show buttons
    $("#btn-update-system-narration").show();
    $("#btn-add-system-narration").hide();

    // swap modal header then show
    $("#system-narration-header").text("Update");
    $("#system-narration-modal").modal("show");
}