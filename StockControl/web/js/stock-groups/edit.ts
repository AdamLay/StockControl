$("#confirmDelete").on("show.bs.modal", function (event)
{
  var $button = $(event.relatedTarget); // Button that triggered the modal
  var id = parseInt($button.data("groupid")); // Extract info from data-* attributes

  var $modal = $(this);
  
  $modal.find(".modal-body p").text("Are you sure you want to delete stock group " + id + "?");

  $modal.find(".modal-footer .btn-ok").off("click").on("click", function ()
  {
    sgDelete(id);
  });
})

function sgUpdate(id: number)
{
  Api.Update("/stock-groups/" + id, { Name: $("#txtGroup_" + id).val().trim() }, function (data)
  {
    var msg = data.Success ? "Name updated successfully" : "Name failed to update";

    alertTop(msg, data.Success);
  });
}

function sgDelete(id: number)
{
  Api.Delete("/stock-groups/" + id, function (data)
  {
    var msg = data.Success ? "Stock Group deleted successfully" : data.Message || "Failed to delete Stock Group";

    alertTop(msg, data.Success);

    if (data.Success)
    {
      $("#row_" + id).remove();
    }
  });
}