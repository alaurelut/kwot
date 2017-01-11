var bgImageArray = ["migrants.jpg", "tribu.jpg", "trump.jpg"],
    base = "img/",
    secs = 5;
var textArray = [
    "<span>La «stratégie» Twitter</span><br>du président élu Trump</span>",
    "<span>Migrants à Calais : <br>\"Tolérance zéro\" dit la préfète </span>",
    "<span>Photos inédites<br>d'une tribu isolée</span>"
];
var pictoArray = [
    "picto_veille.png",
    "picto_analyse.png",
    "picto_diffusion.png"
];


var pictoTitle = [
    "Veille",
    "Analyse",
    "Diffusion"
];
bgImageArray.forEach(function(img) {
    new Image().src = base + img;
    // caches images, avoiding white flash between background replacements
});

var fond = "no-repeat center center fixed";

function backgroundSequence() {
    var k = 0;

    setInterval(function() {
        $('#text').animate({ 'opacity': 0 }, 1000, function() {
            $(this).html(textArray[k]);
        }).animate({ 'opacity': 1 }, 1000);

        $('#picto-title').animate({ 'opacity': 0 }, 1000, function() {
            $(this).html(pictoTitle[k]);
        }).animate({ 'opacity': 1 }, 1000);

        $('#picto-veille').animate({ 'opacity': 0 }, 1000, function() {
            $(this).attr("src", base + pictoArray[k]);
        }).animate({ 'opacity': 1 }, 1000);

        /*        $('#absolute').animate({ 'opacity': 0 }, 500, function() {
                    $(this).css('background', "url(" + base + bgImageArray[k] + ") no-repeat center center fixed");
        		}).animate({ 'opacity': 1 }, 500);
        */
        $('html').css('background', 'url(' + base + bgImageArray[k] + ')' + fond);
        $('html').css('-webkit-background-size', 'cover');
        $('html').css('-moz-background-size', 'cover');
        $('html').css('-o-background-size', 'cover');
        $('html').css('background-size', 'cover');
        if (k + 1 == bgImageArray.length) {
            k = 0;
        } else {
            k++;
        }
    }, 6000);


}
backgroundSequence();
