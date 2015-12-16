$(document).ready(function () {
    Inventory.StockIssueEvent.Subscribe(function (data) {
        var $item = $(".stock-item[data-stockid=\"" + data.Id + "\"]");
        $item.find(".quantity").text("In Stock: " + data.Quantity);
        if (data.Quantity < 1)
            $item.find("button").attr("disabled", "disabled");
    });
    Inventory.StockAddEvent.Subscribe(function (data) {
        var html = '';
        html += '<li data-stockid="' + data.Id + '" class="list-group-item stock-item">';
        html += '<button onclick="Inventory.IssueStock(' + data.Id + ')" title="Release 1 item from inventory" ' + (data.Quantity < 1 ? 'disabled="disabled"' : '') + ' class="btn btn-primary pull-right">';
        html += '<i class="fa fa-gbp"></i> Issue';
        html += '</button>';
        html += '<h3 class="name">' + data.Name + '</h3>';
        html += '<div class="quantity">In Stock: ' + data.Quantity + '</div>';
        html += '</li>';
        var $list = $('.list-group[data-groupid="' + data.StockGroupId + '"]');
        if ($list.length == 0) {
            var newGroup = '';
            newGroup += '<div class="panel-heading" data-groupid="' + data.StockGroupId + '">' + data.StockGroup + '</div>';
            newGroup += '<ul class="list-group"  data-groupid="' + data.StockGroupId + '">';
            html = newGroup + html;
            html += '</ul>';
            $("#stock").append(html);
        }
        else {
            $list.append(html);
        }
    });
    StockGroups.StockGroupUpdateEvent.Subscribe(function (group) {
        var $group = $(".panel-heading[data-groupid=\"" + group.Id + "\"]");
        $group.text(group.Name);
    });
});
