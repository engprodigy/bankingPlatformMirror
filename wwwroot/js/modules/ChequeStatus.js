var url_path = window.location.pathname;
if (url_path.charAt(url_path.length - 1) == '/') {
    url_path = url_path.slice(0, url_path.length - 1);
}

$(document).ready(function () {    
    $(".modal").perfectScrollbar();
});

function populateStatus(chequeLeaves, row) {
    // remove previous results
    var chequeBox = $("#status-display-box");
    chequeBox.empty();

    // create all cheque boxes
    var counter = row.startrange;
    while (row.endrange >= counter) {
        chequeBox.append(
            utilities.createChequeStatusHelpher(counter)
        );
        counter++;
    }

    var used = 0; stopped = 0;
    // mark used cheques
    $.each(chequeLeaves.used, function (index, item) {
        chequeBox.find("#leaf_" + item.leafno)
            .removeClass("bg-success")
            .addClass("bg-danger");
        used++;
    });

    // mark stopped cheques
    $.each(chequeLeaves.stopped, function (index, item) {
        chequeBox.find("#leaf_" + item.leafno)
            .removeClass("bg-success")
            .addClass("bg-warning");
        stopped++;
    });

    // insert stopped & used counts into header panels
    $("span#used-leaves-count").text(used);
    $("span#stopped-leaves-count").text(stopped);
    $("span#unused-leaves-count")
        .text(row.leavesno - (used + stopped));

    // show modal
    $("#leavesStatusModal").modal("show");
}

function openModal(id) {
    $.ajax(url_path + "/../LoadChequeLeaves/" + id).then        
        (function (response) {
            var row = $("#status-data-table")
                .bootstrapTable("getRowByUniqueId", id);
            // change modal header text
            var modal = $("#leavesStatusModal");
            modal.find("#cheque-status-detail")
                .text(row.accountno + " - " + row.chequebooktype.chequetype);
            populateStatus(response, row);
            // change leaves total count
            modal.find(".total-leaves-count")
                .text(row.leavesno);
        },
        function (error) {
            swal("An exception occured");
        });
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
    viewStatusFormatter: function (val, row) {
        return [
            "<button class='btn btn-info btn-icon' ",
            "onclick='openModal(" + row.id + ")'>",
            "<i class='now-ui-icons gestures_tap-01'>",
            "</i></button>"
        ].join("");
    },
    createChequeStatusHelpher: function (id) {
        var el = document.createElement("span");
        el.setAttribute("id", "leaf_" + id);
        el.textContent = id;
        el.setAttribute("class", "cheque-status-box bg-success");
        return el;
    }
};