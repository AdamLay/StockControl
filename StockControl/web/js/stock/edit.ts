var quantityAdjust = function (id, adjust)
{
  var $ctls = $('[data-stockid="' + id + '"]').find(".quantity-controls");

  var $display = $ctls.find(".quantity-display");

  var qty = parseInt($display.text()) + adjust;

  if (qty < 0)
  {
    $ctls.find(".btn-minus").attr("disabled", "disabled");

    return;
  }
  else
  {
    $ctls.find(".btn-minus").removeAttr("disabled");
  }

  $display.text(qty);

  new Throttler("QuantityAdjustClick_" + id, 1000, function ()
  {
    var newQty = parseInt($display.text());

    Api.Update("/stock/adjust/" + id, { Quantity: newQty, Original: $display.data("original") }, function (data)
    {
      $display.data("original", newQty);
    });

  }, true);
};

$("#confirmDelete").on("show.bs.modal", function (event)
{
  var $button = $(event.relatedTarget); // Button that triggered the modal
  var id = parseInt($button.data("stockid")); // Extract info from data-* attributes

  var $modal = $(this);

  $modal.find(".modal-body p").text("Are you sure you want to delete stock item " + id + "?");

  $modal.find(".modal-footer .btn-ok").off("click").on("click", function ()
  {
    doDelete(id);
  });
})

function doDelete(id: number)
{
  Api.Delete("/stock/" + id, function (data)
  {
    var msg = data.Success ? "Stock Item deleted successfully" : data.Message || "Failed to delete Stock Item";

    alertTop(msg, data.Success);

    if (data.Success)
    {
      $('[data-stockid="' + id + '"]').remove();
    }
  });
}
