$(document).ready(function () {
    Inventory.StockIssueEvent.Subscribe(function (data) {
        var $item = $(".stock-item[data-stockid=\"" + data.Id + "\"]");
        $item.find(".quantity").text("In Stock: " + data.Quantity);
        if (data.Quantity < 1)
            $item.find("button").attr("disabled", "disabled");
    });
    Inventory.StockAddEvent.Subscribe(function (data) {
        var $list = $('.list-group[data-groupid="' + data.StockGroupId + '"]');
        if ($list.length == 0) {
            var $group = $(Templates["stockGroup"]({ group: { Id: data.StockGroupId, Name: data.StockGroup, Items: [data] } }));
            $("#stock").append($group);
        }
        else {
            var $item = $(Templates["stockItem"]({ item: data }));
            $list.append($item);
        }
    });
    Inventory.StockUpdateEvent.Subscribe(function (data) {
        $('[data-stockid="' + data.Id + '"]').replaceWith(Templates["stockItem"]({ item: data }));
    });
    Inventory.StockAdjustEvent.Subscribe(function (data) {
        var $item = $('[data-stockid="' + data.Id + '"]');
        $item.find(".quantity").text("In Stock: " + data.Quantity);
        if (data.Quantity == 0) {
            $item.find("button").attr("disabled", "disabled");
        }
        else {
            $item.find("button").removeAttr("disabled");
        }
    });
    Inventory.StockDeleteEvent.Subscribe(function (id) {
        $('[data-stockid="' + id + '"]').remove();
    });
    StockGroups.StockGroupUpdateEvent.Subscribe(function (group) {
        $(".panel-heading[data-groupid=\"" + group.Id + "\"]").text(group.Name);
    });
    StockGroups.StockGroupDeleteEvent.Subscribe(function (id) {
        $('[data-groupid="' + id + '"]').remove();
    });
});
var toggleGroup = function (elem) {
    var $elem = $(elem);
    $elem.toggleClass("closed");
    $elem.next().slideToggle(200);
};
