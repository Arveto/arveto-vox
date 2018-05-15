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
    document.getElementById('connected').style.display = 'none';
    console.log("Not connected")
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


    //Sticky header
var header = document.getElementById("nav");
var sticky = header.offsetTop;

document.addEventListener('scroll', () =>{
    if (window.pageYOffset >= sticky){
        header.classList.add("sticky");
    }
    else{
        header.classList.remove("sticky");
    }
});
