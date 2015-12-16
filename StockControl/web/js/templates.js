Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<li>\r\n    <div class=\"timeline-badge\">\r\n        <i class=\"fa\"></i>\r\n    </div>\r\n    <div id=\""
    + alias3(((helper = (helper = helpers.Id || (depth0 != null ? depth0.Id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"Id","hash":{},"data":data}) : helper)))
    + "\" class=\"timeline-panel\">\r\n        <div class=\"timeline-heading\">\r\n            <h4 class=\"timeline-title\">"
    + alias3(((helper = (helper = helpers.Title || (depth0 != null ? depth0.Title : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"Title","hash":{},"data":data}) : helper)))
    + "</h4>\r\n            <p>\r\n                <small class=\"text-muted\">"
    + alias3(((helper = (helper = helpers.Timestamp || (depth0 != null ? depth0.Timestamp : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"Timestamp","hash":{},"data":data}) : helper)))
    + "</small>\r\n            </p>\r\n        </div>\r\n        <div class=\"timeline-body\">\r\n            <p>"
    + alias3(((helper = (helper = helpers.Message || (depth0 != null ? depth0.Message : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"Message","hash":{},"data":data}) : helper)))
    + "</p>\r\n        </div>\r\n    </div>\r\n</li>";
},"useData":true})
Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<li class=\"list-group-item stock-item\" data-stockid=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.Id : stack1), depth0))
    + "\">\r\n    <button class=\"btn btn-primary pull-right\" onclick=\"Inventory.IssueStock("
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.Id : stack1), depth0))
    + ")\" title=\"Release 1 item from inventory\">\r\n        <i class=\"fa fa-gbp\"></i> Issue\r\n    </button>\r\n    <h3 class=\"name\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.Name : stack1), depth0))
    + "</h3>\r\n    <div class=\"quantity\">In Stock: "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.item : depth0)) != null ? stack1.Quantity : stack1), depth0))
    + "</div>\r\n</li>";
},"useData":true})