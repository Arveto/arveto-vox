    //Allows getting cookie by its name
function getCookie(name){
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}


    // This function will attempt to remove a cookie from all paths.
function eraseCookie(name) {

    var pathBits = location.pathname.split('/');
    var pathCurrent = ' path=';

    // do a simple pathless delete first.
    document.cookie = name + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT;';

    for (var i = 0; i < pathBits.length; i++) {
        pathCurrent += ((pathCurrent.substr(-1) != '/') ? '/' : '') + pathBits[i];
        document.cookie = name + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT;' + pathCurrent + ';';
    }
}


    //Header modification (if connected or not)
if(document.cookie == ""){
    window.location("../../login");
}
else{
    document.getElementById('unsigned').style.display = 'none';
    console.log("Connected");

    document.getElementById("username").text = "Bienvenue, " + getCookie("pseudo");

    document.getElementById("disconnect").addEventListener("click", () =>{
        eraseCookie('password');
        eraseCookie('pseudo');
        location.reload();
    });
}


    //Dynamic header
document.addEventListener('scroll', (banner, display, categories, position) =>{
    console.log('Scroll!');
    var banner = document.getElementById('banner');
    var header = document.getElementById('header');

    if(window.scrollY >= 150){
        banner.style.display = 'none';
        header.style.position = 'fixed';
    }
    else{
        banner.style.display = '';
        header.style.position = '';

        console.log('Redisplaying banner?');
    }
});


//Publish
var publish = document.getElementById("publish");
publish.addEventListener('click', () => {
    let text = simplemde.value();

    text = text.replace(/(\r\n|\n|\r)/gm, "<br>");

    let numCat = parseInt(document.getElementById("category").value);

    let title = document.getElementById("text").value;

    document.getElementById("text").value = text;
    document.getElementById("authorPseudo").value = getCookie('pseudo');
    document.getElementById("authorPass").value = getCookie('password');

    if(text != '' && title != '' && numCat != NaN){
        document.getElementById('articleForm').submit();
    }
});
