var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) == '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}
var chequeLeaves, chequebook = {};

$(document).ready(function () {    
    $(".modal").perfectScrollbar();
});

function validate() {
    var text = $("input[name=stop-value]").val().trim();

    // value is required
    if (!text.length) {
        return utilities.createError("Stop value is required");
    }

    // split & trim, and remove empty values
    var values = text.split(",");
    values = $.map(values, function (el) {
        var trimmed = el.trim();
        if (trimmed.length) {
            return trimmed;
        }
        return null;
    });

    var errors = [], single = [], ranged = [];
    // check that values/ranges are within chequebook
    // start and end numbers
    $.each(values, function (index, val) {
        if (val.lastIndexOf('-') > 0) {
            // ranged integer string
            if (utilities.validateRanged(
                val, chequebook.start, chequebook.end)) {
                return ranged.push(val);
            }
            return errors.push("> " + val);
        } else {
            // single integer string
            if (utilities.validateSingle(
                val, chequebook.start, chequebook.end)) {
                return single.push(val);
            }
            return errors.push("> " + val);
        }
    });

    if (errors.length > 0) {
        return utilities.createError(
            "The following stop values are invalid:<br>"
            + errors.join("<br>")
        );          
    }

    // validate used cheque numbers
    $.each(chequeLeaves.used, function (index, item) {
        if ($.inArray(item.leafno.toString(), single) >= 0) {
            errors.push("> " + item.leafno);
        }
    });
    $.each(chequeLeaves.used, function (index, item) {
        for (var val of ranged) {
            var splitted = val.split('-');
            if (item.leafno >= Number(splitted[0]) &&
                item.leafno <= Number(splitted[1])
            ) {
                errors.push("> "+ val + ": " + item.leafno);
                break;
            }
        }
    });

    if (errors.length > 0) {
        return utilities.createError(
            "The following stop value(s)/range(s) are already " +
            "used or contain cheques that have been used :<br>" +
            errors.join("<br>")
        );
    }

    save(single, ranged);
}

function save(single_arr, ranged_arr) {
    var total = $.map(single_arr, function (item) {
        return Number(item);
    });
    $.each(ranged_arr, function (index, value) {
        total = total.concat(
            utilities.range(
                $.map(value.split('-'), function (el) {
                    return Number(el);
                })
            )
        );
    });

    swal({
        title: "Are you sure?",
        text: "Cheque leaves will be stopped",
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
            if (isConfirm) {
                // disable submit button
                $("#StopLeavesButton").attr("disabled", true);
                $.ajax(url_path + "/../StopCheques", {
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify({
                        tostop: total,
                        chequebookid: chequebook.id,
                        stopped: $.map(chequeLeaves.stopped, function (item) {
                            return item.leafno
                        })
                    })
                }).then(
                    function (response) {
                        swal({
                            title: "Stop Cheque Leaves",
                            text: "Cheque leaves successfully stopped!",
                            type: 'success',
                            allowOutsideClick: false,
                            allowEscapeKey: false
                        }).then(function () {
                            // Unfreeze submit button
                            $("#StopLeavesButton").removeAttr("disabled");
                            // hide modal
                            $("#chequeModal").modal("hide");
                        });
                    },
                    function (error) {
                        swal({
                            title: 'Stop Cheque Leaves',
                            text: 'An error occured while stopping cheques. Please try again',
                            type: 'error',
                            allowOutsideClick: false,
                            allowEscapeKey: false
                        }).then(function () {
                            // Unfreeze submit button
                            $("#StopLeavesButton").removeAttr("disabled");
                        });
                    }
                );
            }
        },
        function (isRejected) { return; }
    );
}

function openModal(id) {
    $.ajax(url_path + "/../LoadChequeLeaves/" + id).then
        (
            function (response) {
                chequeLeaves = response;
                var row = $("#cheques-data-table")
                    .bootstrapTable("getRowByUniqueId", id);

                chequebook.start = row.startrange;
                chequebook.end = row.endrange;
                chequebook.id = row.id;

                // change modal header text
                var modal = $("#chequeModal");
                modal.find("#cheque-status-detail")
                    .text(row.accountno + " - " + row.chequebooktype.chequetype);

                // populate inputs with cheque start and end ranges
                modal.find("#start").val(row.startrange);
                modal.find("#end").val(row.endrange);

                // clear form's stop value
                modal.find('[name=stop-value]').val('');

                // show modal
                $("#chequeModal").modal("show");
            },
            function (error) {
            swal("An exception occured");
        }
        );
}

var utilities = {
    chequeDetailFormatter: function (index, row, el) {
        var container = $("<div class='row mx-0'></div>");
        container.append($("<div class='col-xs-12 col-md-6 mb-3 mt-2'><b>Charge:</b> "
            + "<span class='float-right'>" + row.charge + "</span>" + "</div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-3 mt-2'><b>Counter Cheque:</b> "
            + "<span class='float-right'>" + (row.iscountercheque ? "Yes" : "No") + "</span>" + "</div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-2'><b>Remark:</b> "
            + "<span class='float-right'>" + (row.remark == null ? "-" : row.remark) + "</span>" + "</div>"));
        container.append($("<div class='col-xs-12 col-md-6 mb-2'><b>Date Created:</b> "
            + "<span class='float-right'>" + moment(row.datecreated).format("MMMM DD, YYYY") + "</span>" + "</div>"));
        el.append(container);
    },
    blockChequeBtnFormatter: function (val, row) {
        return [
            "<button class='btn btn-danger btn-icon' ",
            "onclick='openModal(" + row.id + ")'>",
            "<i class='now-ui-icons ui-1_settings-gear-63'>",
            "</i></button>"
        ].join("");
    },
    createChequeStatusHelpher: function (id) {
        var el = document.createElement("span");
        el.setAttribute("id", id);
        el.textContent = id;
        el.setAttribute("class", "cheque-status-box bg-success");
        return el;
    },
    createError: function (error) {
        $.notify(
            {
                icon: "now-ui-icons travel_info",
                message: error
            },
            {
                type: "danger",
                placement: {
                    from: "top",
                    align: "right"
                }
            }
        );
    },
    strictParseInt: function (subject) {
        if (/^[0-9]+$/.test(subject)) {
            return Number(subject);
        }
        return NaN;
    },
    validateSingle: function (val, start, end) {
        if (isNaN(utilities.strictParseInt(val))) return false;
        
        if (parseInt(start) > parseInt(val)
            || parseInt(end) < parseInt(val)
        ) return false;

        return true;
    },
    validateRanged: function (val, start, end) {
        var splitArray = val.split('-');

        if (splitArray.length !== 2) return false;

        splitArray = $.map(splitArray, function (el) {
            return $.trim(el);
        });

        if (!(parseInt(splitArray[1]) > parseInt(splitArray[0]))) {
            return false;
        }

        if (!utilities.validateSingle(splitArray[0], start, end)) {
            return false;
        }
        if (!utilities.validateSingle(splitArray[1], start, end)) {
            return false;
        }

        return true;
    },
    range: function (tuple) {
        var start = tuple[0], end = tuple[1];
        var list = [];
        for (var counter = start; counter <= end; counter++) {
            list.push(counter);
        }
        return list;
    }
};