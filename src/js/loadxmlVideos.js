var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        myFunction(this);
    }
};
xmlhttp.open("GET", "/assets/videos.xml", true);
xmlhttp.send();

function myFunction(xml) {
    var xmlDoc = xml.responseXML;
    var list =
        '<table style="margin-left: auto; margin-right: auto; margin-bottom: 20px;">';
    var collection = xmlDoc.getElementsByTagName("video");
    for (const c of collection) {
        const url = c.getElementsByTagName("url")[0].childNodes[0].nodeValue;
        const name = c.getElementsByTagName("name")[0].childNodes[0].nodeValue;
        const year = c.getElementsByTagName("year")[0].childNodes[0].nodeValue;
        const length = c.getElementsByTagName("length")[0].childNodes[0]
            .nodeValue;
        list +=
            "<tr><td style='text-align:right;'><a href='" +
            url +
            "'>" +
            name +
            "</a></td><td> (" +
            year +
            ")</td><td>[" +
            length +
            "]</td></tr>";
    }
    list += "</table>";
    document.getElementById("videolist").innerHTML = list;
}
