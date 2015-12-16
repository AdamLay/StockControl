this["Templates"] = this["Templates"] || {};
this["Templates"]["auditLog"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<li>\r\n    <div class=\"timeline-badge\">\r\n        <i class=\"fa\"></i>\r\n    </div>\r\n    <div id=\""
    + alias4(((helper = (helper = helpers.Id || (depth0 != null ? depth0.Id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"Id","hash":{},"data":data}) : helper)))
    + "\" class=\"timeline-panel\">\r\n        <div class=\"timeline-heading\">\r\n            <h4 class=\"timeline-title\">"
    + alias4(((helper = (helper = helpers.Title || (depth0 != null ? depth0.Title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"Title","hash":{},"data":data}) : helper)))
    + "</h4>\r\n            <p>\r\n                <small class=\"text-muted\">"
    + alias4(((helper = (helper = helpers.Timestamp || (depth0 != null ? depth0.Timestamp : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"Timestamp","hash":{},"data":data}) : helper)))
    + "</small>\r\n            </p>\r\n        </div>\r\n        <div class=\"timeline-body\">\r\n            <p>"
    + alias4(((helper = (helper = helpers.Message || (depth0 != null ? depth0.Message : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"Message","hash":{},"data":data}) : helper)))
    + "</p>\r\n        </div>\r\n    </div>\r\n</li>";
},"useData":true});
this["Templates"]["notification"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<a href=\"/audit?id="
    + alias4(((helper = (helper = helpers.Id || (depth0 != null ? depth0.Id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"Id","hash":{},"data":data}) : helper)))
    + "\" class=\"list-group-item new\" style=\"display:block;\">\r\n    <i class=\"fa "
    + alias4(helpers["valueOf"].call(alias1,(depth0 != null ? depth0.GetIcon : depth0),{"name":"valueOf","hash":{},"data":data}))
    + "\"></i> "
    + alias4(((helper = (helper = helpers.Title || (depth0 != null ? depth0.Title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"Title","hash":{},"data":data}) : helper)))
    + "\r\n    <span data-time=\""
    + alias4(helpers["valueOf"].call(alias1,(depth0 != null ? depth0.GetTimestampTicks : depth0),{"name":"valueOf","hash":{},"data":data}))
    + "\" class=\"pull-right text-muted small\">"
    + alias4(helpers["valueOf"].call(alias1,(depth0 != null ? depth0.GetFormattedTimestamp : depth0),{"name":"valueOf","hash":{},"data":data}))
    + "</span>\r\n</a>";
},"useData":true});
this["Templates"]["stockGroup"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div data-groupid=\""
    + alias4(((helper = (helper = helpers.StockGroupId || (depth0 != null ? depth0.StockGroupId : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"StockGroupId","hash":{},"data":data}) : helper)))
    + "\" class=\"panel-heading\">"
    + alias4(((helper = (helper = helpers.StockGroup || (depth0 != null ? depth0.StockGroup : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"StockGroup","hash":{},"data":data}) : helper)))
    + "</div>\r\n<ul data-groupid=\""
    + alias4(((helper = (helper = helpers.StockGroupId || (depth0 != null ? depth0.StockGroupId : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"StockGroupId","hash":{},"data":data}) : helper)))
    + "\" class=\"list-group\"></ul>";
},"useData":true});
this["Templates"]["stockItem"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression;

  return "<li class=\"list-group-item stock-item\" data-stockid=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.Id : stack1), depth0))
    + "\">\r\n    <button class=\"btn btn-primary pull-right\" onclick=\"Inventory.IssueStock("
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.Id : stack1), depth0))
    + ")\" title=\"Release 1 item from inventory\">\r\n        <i class=\"fa fa-gbp\"></i> Issue\r\n    </button>\r\n    <h3 class=\"name\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.Name : stack1), depth0))
    + "</h3>\r\n    <div class=\"quantity\">In Stock: "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.Quantity : stack1), depth0))
    + "</div>\r\n</li>";
},"useData":true});