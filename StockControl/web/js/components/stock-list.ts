$(document).ready(function ()
{
  Inventory.StockIssueEvent.Subscribe(function (data: IStockItem)
  {
    var $item = $(".stock-item[data-stockid=\"" + data.Id + "\"]");

    $item.find(".quantity").text("In Stock: " + data.Quantity);

    if (data.Quantity < 1)
      $item.find("button").attr("disabled", "disabled");
  });

  Inventory.StockAddEvent.Subscribe(function (data: IStockItem)
  {
    // TODO: Test this

    

    //if (data.Quantity < 1)
    //  $item.attr("disabled", "disabled");

    var $list = $('.list-group[data-groupid="' + data.StockGroupId + '"]')

    if ($list.length == 0)
    {
      var $group = $(Templates["stockGroup"]({ group: { Id: data.StockGroupId, Name: data.StockGroup, Items: [data] } }));

      //$group
      //  .children(".list-group")
      //  .append($item);

      $("#stock").append($group);
    }
    else
    {
      var $item = $(Templates["stockItem"]({ item: data }));

      $list.append($item);
    }
  });

  StockGroups.StockGroupUpdateEvent.Subscribe(function (group: IStockGroup)
  {
    $(".panel-heading[data-groupid=\"" + group.Id + "\"]").text(group.Name);
  });
});