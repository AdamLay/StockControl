setTimeout(function () { $("#messageSuccess").slideUp(200); }, 3000);
$("#txtName").on("keyup", function () {
    var $this = $(this);
    new Throttler("NameKeyUp", 800, function () {
        Api.Get("/api/stock-groups/" + encodeURIComponent($this.val()), function (res) {
            if (res.Success) {
                $("#msgExisting").fadeIn(100);
                Validation.Error($this);
            }
            else {
                $("#msgExisting").fadeOut(100);
                Validation.Success($this);
            }
        });
    }, true);
});
