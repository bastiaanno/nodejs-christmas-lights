$(function() {
    document.title = "Kerstlampjes " + new Date().getFullYear();
    var socket = io();
    socket.on('status', function(status) {
        if (status.on) {
            $("#div1").html("<p id='demo' style='text-align: center' class='w3-green w3-round'>AAN</p>");
            $(".lightrope").show();
            $("#toggleLights").removeClass("w3-light-green");
            $("#toggleLights").addClass("w3-red");
            $("#toggleLights").html('<i class="far fa-lightbulb"></i>&nbsp;UIT');
        } else if (!status.on) {
            $("#div1").html("<p id='demo' style='text-align: center' class='w3-red w3-round'>UIT</p>");
            $(".lightrope").hide();
            $("#toggleLights").removeClass("w3-red");
            $("#toggleLights").addClass("w3-light-green");
            $("#toggleLights").html('<i class="fas fa-lightbulb"></i>&nbsp;AAN');
        }
    });
    socket.on('gpio connected', function() {
        $("#toggleLights").prop('disabled', false);
        $("#error").html("verbinding gemaakt").delay(2000).fadeOut();
    });
    socket.on('gpio disconnected', function() {
        $("#toggleLights").prop('disabled', true);
        $("#error").html("Geen verbinding met Pi,</br>zet Pi aan of herstart Pi.");
        $("#error").show();
    });


    $("#toggleLights").click(function() {
        socket.emit('toggle');
    });
});