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
    var name = dir(url);
    list += '</ul><p>' + name + '</p><ul id="' + name + '">';
    return list;
}

var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        setList(this);
    }
};
xmlhttp.open('GET', 'sitemap.xml', true);
xmlhttp.send();

function setList(xml) {
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
        sitename = url.split('/');
        sitename = sitename[sitename.length - 1];
        if (sitename === '404' || sitename === 'sitemap') {
            continue;
        }
        sitename = switchName(sitename);

        if (dirOld !== dir(url)) {
            list = dirchange(url, list);
            dirOld = dir(url);
        }
        list += "<li><a href='" + url + "'>" + sitename + '</a></li>';
    }
    list += '</ul>';
    document.getElementsByClassName('sitemapcontainer')[0].innerHTML = list;
    sortProjectList();
}

function switchName(sitename) {
    switch (sitename) {
        case '':
            sitename = 'Startseite';
            break;
        case 'all':
            sitename = 'Alle Projekte';
            break;
        case 'johns_adventure':
            sitename = "John's Adventure";
            break;
        case 'zddz':
            sitename = 'Zusammen durch die Zeit';
            break;
        case 'waldstein':
            sitename = 'Das Geheimnis des Waldsteins';
            break;
        case 'johns_adventure':
            sitename = "John's Adventure";
            break;
        case 'projects':
            sitename = 'Alle Projekte';
            break;
        case 'panzerknacker':
            sitename = 'Die Panzerknacker schlagen zu';
            break;
        case 'probe':
            sitename = 'Die Probe';
            break;
        case 'unterwelt':
            sitename = 'M&uuml;nchbergs TRAUMhafte Unterwelt';
            break;
        case 'stadtkasse':
            sitename = 'Die geklaute Stadtkasse';
            break;
        case 'grundschule':
            sitename = 'Workshops mit der Grundschule M&uuml;nchberg';
            break;
        case 'clipped':
            sitename = 'Clipped - &Uuml;bersteuert';
            break;
        case 'stuhlgeschichten':
            sitename = 'Stuhlgeschichten - Menschen auf St&uuml;hlen';
            break;
        default:
            sitename = sitename.replace('_', ' ');
    }
    return capitalizeFLetter(sitename);
}

function sortProjectList() {
    var list, i, switching, b, shouldSwitch;
    list = document.getElementById('Projekte');
    switching = true;
    while (switching) {
        switching = false;
        b = list.getElementsByTagName('li');
        for (i = 0; i < b.length - 1; i++) {
            shouldSwitch = false;
            if (b[i].firstElementChild.innerHTML.toLowerCase() > b[i + 1].firstElementChild.innerHTML.toLowerCase()) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            b[i].parentNode.insertBefore(b[i + 1], b[i]);
            switching = true;
        }
    }
}