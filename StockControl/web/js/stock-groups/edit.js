function sgUpdate(id) {
    Api.Update("/stock-groups/" + id, { Name: $("#txtGroup_" + id).val().trim() }, function (data) {
        var msg = data.Success ? "Name updated successfully" : "Name failed to update";
        alertTop(msg, data.Success);
    });
}
function sgDelete(id) {
    Api.Delete("/stock-groups/" + id, function (data) {
        var msg = data.Success ? "Stock Group deleted successfully" : data.Message || "Failed to delete Stock Group";
        alertTop(msg, data.Success);
        if (data.Success) {
            $("#row_" + id).remove();
        }
    });
}
//# sourceMappingURL=edit.js.map