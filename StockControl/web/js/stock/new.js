$("#txtName").on("keyup", function () {
    var $this = $(this);
    new Throttler("NameKeyUp", 800, function () {
        Api.Get("/api/stock/" + encodeURIComponent($this.val()), function (res) {
            // Error if stock item found
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
$("#numQuantity").on("blur", function () {
    var $this = $(this);
    if ($this.val() < 1)
        Validation.Error($this);
    else
        Validation.Success($this);
});
$("#numReorder").on("blur", function () {
    var $this = $(this);
    if ($this.val() < 0)
        Validation.Error($this);
    else
        Validation.Success($this);
});
