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
    var html = '';

    html += '<li data-stockid="' + data.Id + '" class="list-group-item stock-item">';
    html += '<button onclick="Inventory.IssueStock(' + data.Id + ')" title="Release 1 item from inventory" disabled="disabled" class="btn btn-primary pull-right"><i class="fa fa-gbp"></i> Issue</button>';
    html += '<h3 class="name">' + data.Name + '</h3>';
    html += '<div class="quantity">In Stock: ' + data.Quantity + '</div>';
    html += '</li>';

    $('.list-group[data-groupid="' + data.StockGroupId + '"]').append(html);
  });

  StockGroups.StockGroupUpdateEvent.Subscribe(function (group: IStockGroup)
  {
    var $group = $(".panel-heading[data-groupid=\"" + group.Id + "\"]");

    $group.text(group.Name);
  });
});