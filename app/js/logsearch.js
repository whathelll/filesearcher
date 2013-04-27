function requestFor(filename, searchtext, callback) {

    var fname = "" || filename;
    var stext = "" || searchtext;

    var url = "logquery" + "?filename=" + fname + "&text=" + stext;

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, true);
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            callback(xmlHttp.responseText);
        }
    };
    xmlHttp.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    xmlHttp.send();
}

function formatDate(date) {
    var s = date.replace("T", " ").replace(".000Z", '');

    return s;
}

var handleUpdate = function(response) {
    //console.log(response);
    var result = JSON.parse(response);
    console.log(result);
    var s = "";
    if(result.errors || !result.listoffiles || result.listoffiles.length == 0) {
        document.getElementById("message").innerHTML = "no files found";
        document.getElementById("filelist").innerHTML = "";
    } else {
        document.getElementById("message").innerHTML = "";
        result.listoffiles.forEach(function(file){
            //console.log(typeof file.mtime);
            s += '<li><div class="filename"><a href="logsearch/' + file.filename + '">' + file.filename + '</a></div>';
            s += '<div class="modifieddate">' + formatDate(file.mtime) + '</div>';
            s += '<div class="size">' + file.size + '</div>';
            s += '</li>';
        });
        document.getElementById("filelist").innerHTML = s;
    }


}


window.onload = function() {
    requestFor("", "", handleUpdate);


    var filename = document.getElementById("filename");
    var searchtext = document.getElementById("searchtext");
    var prevfilename = filename.value;
    var prevsearchtext = searchtext.value;

    filename.onkeyup = function() {
        if(prevfilename != filename.value) {
            prevfilename = filename.value;
            requestFor(filename.value, searchtext.value, handleUpdate);
        }
    }

    searchtext.onkeyup = function() {
        if(prevsearchtext != searchtext.value) {
            prevsearchtext = searchtext.value;
            requestFor(filename.value, searchtext.value, handleUpdate);
        }
    }

}



