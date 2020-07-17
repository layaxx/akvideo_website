function capitalizeFLetter(string) {
    return string[0].toUpperCase() + string.slice(1);
}

function dir(url) {
    if (url.includes('legal')) {
        return 'Rechtliches';
    }
    if (url.includes('projects')) {
        return 'Projekte';
    }
    return '-';
}

function dirchange(url, list) {
    list += '</ul><p>' + dir(url) + '</p><ul>';
    return list;
}

var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        myFunction(this);
    }
};
xmlhttp.open('GET', 'sitemap.xml', true);
xmlhttp.send();

function myFunction(xml) {
    var i;
    var xmlDoc = xml.responseXML;
    var list = '<p>Stammverzeichnis</p><ul>';
    var collection = xmlDoc.getElementsByTagName('url');
    var allURLs = [];
    for (var i = 0; i < collection.length; i++) {
        url = collection[i].getElementsByTagName('loc')[0].childNodes[0].nodeValue;
        allURLs.push(url);
    }
    allURLs.sort();
    var dirOld = dir(allURLs[0]);
    for (const url of allURLs) {
        if (dirOld !== dir(url)) {
            list = dirchange(url, list);
            dirOld = dir(url);
        }
        sitename = url.split('/');
        sitename = sitename[sitename.length - 1];
        switch (sitename) {
            case '404':
                sitename = 'Fehlerseite';
                break;
            case '':
                sitename = 'Startseite';
                break;
            case 'all':
                sitename = 'Alle Projekte';
                break;
            case 'johns_adventure':
                sitename = "John's Adventure";
                break;
            default:
                sitename = sitename.replace('_', ' ');
        }
        sitename = capitalizeFLetter(sitename);
        list += "<li><a href='" + url + "'>" + sitename + '</a></li>';
    }
    list += '</ul>';
    document.getElementsByClassName('sitemapcontainer')[0].innerHTML = list;
}