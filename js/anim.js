var bgImageArray = ["migrants.jpg", "tribu.jpg", "trump.jpg"],
    base = "img/",
    secs = 5;
var textArray = [
    "Kwot aspire les commentaires, partages des articles publiés sur les réseaux sociaux et les médias en ligne.<br><br> Il analyse et optimise votre rédaction web.",
    "Kwot fdssdfsd les sdfsdfdsf, partdsfsdfsdfsfsfds les réseadfsdffux sociaux et les médias en ligne.<br><br> Il anasdfsdfsdf dfs dsfsd fds fsdfsdfsdf action web.",
    "Kwot fdssdfsd les sdfsdfdsf, fdsfdsfds les réseadfsdffux ffff et les médias fdsfds fd.<br><br> Il dfsdfsd dfs dsfsd fds dfsd action web."
   
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


function backgroundSequence() {
    var k = 0;

    setInterval(function() {
        $('#textRight').animate({ 'opacity': 0 }, 1000, function() {
         $(this).html(textArray[k]);
         console.log('soin');
        }).animate({ 'opacity': 1 }, 1000);



        if (k + 1 == bgImageArray.length) {
            k = 0;
        } else {
            k++;
        }
    }, 2000);


}
backgroundSequence();
