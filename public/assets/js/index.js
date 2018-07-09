// scrape button
$("#scrape-btn").on("click", function() {
    $.get("/scrape", function(data) {
        location.reload();
    })
});

// purge button
$("#purge-btn").on("click", function() {
    $.ajax({
        method: "POST",
        url: "/purge"
    })
    .then(function(data) {
        location.reload();
    })
});

// review click
$(document).on("click", ".link", function() {
    var link = $(this).attr("href");
    console.log(link);

    $.ajax({
        method: "POST",
        url: "/update",
        data: {
            link: link
        }
    })
    .then(function(response) {
        res.json(response)
    })
});



