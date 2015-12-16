$(document).ready(function () {
    Inventory.StockIssueEvent.Subscribe(function (data) {
        var $item = $(".stock-item[data-stockid=\"" + data.Id + "\"]");
        $item.find(".quantity").text("In Stock: " + data.Quantity);
        if (data.Quantity < 1)
            $item.find("button").attr("disabled", "disabled");
    });
    Inventory.StockAddEvent.Subscribe(function (data) {
        // TODO: Test this
        var $item = $(Templates["stockItem"](data));
        if (data.Quantity < 1)
            $item.attr("disabled", "disabled");
        var $list = $('.list-group[data-groupid="' + data.StockGroupId + '"]');
        if ($list.length == 0) {
            var $group = $(Templates["stockGroup"](data));
            $group
                .children(".list-group")
                .append($item);
            $("#stock").append($group);
        }
        else {
            $list.append($item);
        }
    });
    StockGroups.StockGroupUpdateEvent.Subscribe(function (group) {
        $(".panel-heading[data-groupid=\"" + group.Id + "\"]").text(group.Name);
    });
});
