$(document).ready(function ()
{
  Api.Get("/api/stock-groups", function (data)
  {
    if (!data.Success)
    {
      // Message about adding some stock
      var $msg = $("<div>",
        {
          "class": "alert alert-danger",
          "text": "Please add some Stock Groups before adding a Stock Item."
        });

      $("main.container").prepend($msg);

      // Disable submitting
      $("#btnSubmit").prop("disabled", "disabled");

      return;
    }

    var $ddl = $("#ddlGroups");

    for (var i = 0; i < data.Results.length; i++)
    {
      var res = data.Results[i];
      
      var $opt = $("<option>", { "value": res.Id, "text": res.Name });

      $ddl.append($opt);
    }
  });
});

setTimeout(function () { $("#messageSuccess").slideUp(200); }, 3000);

$("#txtName").on("keyup", function ()
{
  var $this = $(this);

  new Throttler("NameKeyUp", 800, function ()
  {
    Api.Get("/api/stock/" + encodeURIComponent($this.val()), function (res)
    {
      // Error if stock item found
      if (res.Success)
      {
        $("#msgExisting").fadeIn(100);

        Validation.Error($this);
      }
      else
      {
        $("#msgExisting").fadeOut(100);

        Validation.Success($this);
      }
    });
  }, true);
});

$("#numQuantity").on("blur", function ()
{
  var $this = $(this);

  if ($this.val() < 1)
    Validation.Error($this);
  else
    Validation.Success($this);
});

$("#numReorder").on("blur", function ()
{
  var $this = $(this);

  if ($this.val() < 0)
    Validation.Error($this);
  else
    Validation.Success($this);
});
