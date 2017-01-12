var textArray = [
    `
    Ne prenez plus la peine d’écumer vos 10 sites d’information chaque matin. Pour ne pas en perdre une miette, nous vous permettons de détecter les sujets les plus populaires et émergents sur le web. Une recherche personnalisée est à votre disposition pour accéder à la thématique qui vous intéresse.`,
    `
    Plusieurs réseaux sociaux à fournir en contenu ? Vous travaillez pour un média ? Aucun problème. Partager vos articles et vos publications directement à partir de notre plateforme sur vos supports préférés`,
    `
    Notre intelligence artificielle est à votre service pour analyser les commentaires de vos lecteurs. Elle trie et catégorise les avis selon vos critères. Vous pourrez ainsi adapter et optimiser en direct votre rédaction.`,
    `<div id="contentLogo">
     <img src="img/title.svg" alt="">
   </div>
   <div>Kwot aspire les commentaires, partages des articles publiés sur les réseaux sociaux et les médias en ligne. Il analyse et optimise votre rédaction web.</div>`
];

var pictoArray = [
    "img/picto_veille.png",
    "img/picto_diffusion.png",
    "img/picto_analyse.png"
];


var pictoTitle = [
    "Veille",
    "Diffusion",
    "Analyse"
];
var k = 0;
var saveContent = `<img src="img/picto_analyse.png" id="picto-veille" alt="" style="opacity: 1;">
                <div id="picto-title" style="opacity: 1;">Analyse</div>`;

function backgroundSequence(div) {
    if (div == 'left') {
        k--;
        if(k == 0){
            $('#arrowLeft').css('display', 'none');    
        }
        if (k == 2) {

            $('#app').animate({ 'opacity': 0 }, 500);

                $('#contentLeft').animate({ 'opacity': 1 }, 500, function() {
                    $('#content').css('marginTop', '16%');
                    $('#contentLeft').css('display', 'flex');
                    $('#arrowRight').css('display', 'block');
                    $('#contentLeft').html(saveContent);
                })
        } 

        $('#textRight').animate({ 'opacity': 0 }, 500, function() {
            $(this).html(textArray[k]);
        }).animate({ 'opacity': 1 }, 500);

        $('#picto-veille').animate({ 'opacity': 0 }, 500, function() {
            $(this).attr('src', pictoArray[k]);
        }).animate({ 'opacity': 1 }, 500);

        $('#picto-title').animate({ 'opacity': 0 }, 500, function() {
            $(this).html(pictoTitle[k]);
        }).animate({ 'opacity': 1 }, 500);

        k = k < 0 ? 3 : k;
    } else {

        k++;
        if (k == 3) {

            $('#contentLeft').animate({ 'opacity': 0 }, 500, function() {
                $('#contentLeft').html('');
                $('#contentLeft').css('display', 'none');
                $('#arrowRight').css('display', 'none');
                $('#content').css('margin-top', '0');
                $('#app').animate({ 'opacity': 1 }, 500);
            }).animate({ 'opacity': 1 }, 500);

            $('#textRight').animate({ 'opacity': 0 }, 500, function() {
                $(this).html(textArray[k]);
                $('#app').animate({ 'opacity': 1 }, 500);
            }).animate({ 'opacity': 1 }, 500);
        } else {
            $('#textRight').animate({ 'opacity': 0 }, 500, function() {
                $(this).html(textArray[k]);
                $('#arrowLeft').css('display', 'block');
            }).animate({ 'opacity': 1 }, 500);
            $('#picto-veille').animate({ 'opacity': 0 }, 500, function() {
                $(this).attr('src', pictoArray[k]);
            }).animate({ 'opacity': 1 }, 500);
            $('#picto-title').animate({ 'opacity': 0 }, 500, function() {
                $(this).html(pictoTitle[k]);
            }).animate({ 'opacity': 1 }, 500);
        }
        k = k > 3 ? 0 : k;
    }

}


$(document).ready(function() {
    $('#slideLeft').on('click', function() {
        backgroundSequence('left');
    })
    $('#slideRight').on('click', function() {
        backgroundSequence('right');
    })
})
