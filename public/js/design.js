function saveSVG () {
    saveSvgAsPng(document.getElementById("design"), "TheSweaterGuys.png");
}

$("#upload input").change(function (){
    $("#upload").submit();
});

$("#color").change(function(){
    $("#base").css("fill", $(this).val());
});

$(document).ready(function() {
    // position logo and resize box
    $("#drag").attr({"x": (723.16 - $("#drag").width()) / 2, "y": (848.07 - $("#drag").height()) / 2});
    let logo = document.querySelector("#drag").getClientRects()[0];
    $("#dragMeDaddy").css({"width": logo.width, "height": logo.height});
    $("#dragMeDaddy").css({"left": logo.left, "top": logo.top - 80});

    // log drag
    $("#dragMeDaddy").draggable({
        alsoDrag: "#drag",
        drag: function (event, ui) {
            let designerBox = document.querySelector("#designer").getClientRects()[0];
            let x = ui.position.left * 723.16 / designerBox.width - 120;
            let y = ui.position.top * 848.07 / designerBox.height - 120;
            $("#drag").attr("x", x).attr("y", y);
            $("#x").val(x - 722 / 2 + $("#drag").width() / 2);
            $("#y").val(y - 867 / 2 + $("#drag").height() / 2);
            $("#width").val($("#drag").width() / 722);
            $("#height").val($("#drag").height() / 867);
        }
    }).resizable({
        alsoResize: "#drag",
        aspectRatio: true,
        stop: function(){
            $("#width").val($("#drag").width() / 722);
            $("#height").val($("#drag").height() / 867);
        }});
});

$("#upload").on("submit",(function(e) {
    $("#uploadBox").fadeOut("1s", function(){
        $("#uploadBox").css({"display": "none", "height": 0});
    });

    e.preventDefault();
    let formData = new FormData(this);

    $.ajax({
        type: $(this).attr("method"),
        url: $(this).attr("action"),
        data: formData,
        cache: false,
        async: false,
        contentType: false,
        processData: false,
        error: function (data) {
            alert("error");
            console.log(data);
        }
    }).done(function(data){
        $("#dragMeDaddy").fadeIn("1s");
        $("#drag").attr("href", data[1]);
        $("#logo").val(data[0]);
        console.log(data);
    });
}));