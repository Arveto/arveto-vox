//Allows getting cookie by its name
function getCookie(name){
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}


    //Article replacement
    //TODO Debug
let article = document.getElementById("article");

let s1 = '&lt;';
let s2 = '&gt;';
let s3 = '&amp;quot;';
let s4 = '&#39;';
let s5 = '&amp;#39;';
let s6 = '&amp;lt;';
let s7 = '&amp;gt;'

let text = article.innerHTML;

text = text.replace(new RegExp(s1, 'g'), "<")
.replace(new RegExp(s2, 'g'), ">")
.replace(new RegExp(s3, 'g'), '"')
.replace(new RegExp(s4, 'g'), "'")
.replace(new RegExp(s5, 'g'), "'")
.replace(new RegExp(s6, 'g'), "<")
.replace(new RegExp(s7, 'g'), ">");

article.innerHTML = text;


    //Vote article
let upvote = document.getElementById("karmaPlus");
upvote.addEventListener('click', () => {
    document.getElementById("voteType").checked = true;

    if(pseudoCookie != undefined){
        document.getElementById('vote').submit();
    }

});


let downvote = document.getElementById("karmaMinus");
downvote.addEventListener('click', () => {
    document.getElementById("voteType").checked = false;

    if(pseudoCookie != undefined){
        document.getElementById('vote').submit();
    }

});


    //Comments
var submit = document.getElementById("commentButton");
submit.addEventListener('click', () => {

    document.getElementById("commentText").value = document.getElementById("commentTextarea").value;
    document.getElementById("authorPseudo").value = getCookie('pseudo');
    document.getElementById("authorPass").value = getCookie('password');

    if(document.getElementById("commentText") != ''){
        document.getElementById('commentForm').submit();
        location.reload();
    }
});


    //Hide content to non connected users
let pseudoCookie = getCookie('pseudo');
console.log('cookies:'+pseudoCookie);
if(pseudoCookie == undefined){
    document.getElementById("commentForm").style.display = 'none';
}
