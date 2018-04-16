console.log('Cookies="'+document.cookie+'"');

if(document.cookie == ""){
    document.getElementById('connected').style.display = 'none';
    console.log("Not connected")
}
else{
    document.getElementById('unsigned').style.display = 'none';
    console.log("Connected");
}
