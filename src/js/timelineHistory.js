const options = {
    scale_factor: 0.5
};

const json = {
    events: [{
            media: {
                url: '/assets/img/projects/johns_adventure.jpg',
                caption: 'John´s Adevnture (Trickfilm, 2020)',
                link: '/projects/johns_adventure.html'
            },
            start_date: {
                year: '2020'
            },
            text: {
                headline: 'John´s Adventure',
                text: '<p>Der verurteilte Verbrecher John begibt sich auf eine Rachemission.</p><a href="/projects/johns_adventure.html">Behind The Scenes</a>'
            },
            group: 'filme'
        },
        {
            media: {
                url: '/assets/img/projects/sackgasse.jpg',
                caption: 'Sackgasse (Kurzfilm, 2017)',
                link: '/projects/sackgasse.html'
            },
            start_date: {
                year: '2017'
            },
            text: {
                headline: 'Sackgasse',
                text: '<p>Die Polizisten Sarah und Benno sind auf Streife und werden auf drei kiffende Jugendliche aufmerksam. Als Sarah einen der Kiffer bis in ein stillgelegtes Fabrikgel&auml;nde verfolgt, merkt sie, dass der Junge ihr Sohn ist. Nun haben die beiden ein ernsthaftes Problem.</p><a href="/projects/sackgasse.html">Behind The Scenes</a>'
            },
            group: 'filme'
        },
        {
            media: {
                url: '/assets/img/projects/lichtblick.jpg',
                caption: 'Lichtblick (Kurzfilm, 2015)',
                link: '/projects/lichtblick.html'
            },
            start_date: {
                year: '2015'
            },
            text: {
                headline: 'Lichtblick',
                text: '<p>Elias Koch braucht dringend Geld und bittet den Computerfreak Lennard um Hilfe bei der Suche nach einem Schatz. Doch wie sollen die zwei an das Geld kommen, wenn nicht beide am selben Strang ziehen?</p><a href="/projects/lichtblick.html">Behind The Scenes</a>'
            },
            group: 'filme'
        },
        {
            media: {
                url: '/assets/img/projects/panzerknacker.jpg',
                caption: 'Panzerknacker (Kurzfilm, 2014/15)',
                link: '/projects/panzerknacker.html'
            },
            start_date: {
                year: '2014'
            },
            text: {
                headline: 'Die Panzerknacker schlagen zu',
                text: '<p>Die gef&uuml;rchteten Panzerknacker sind wieder einmal entwischt und terrorisieren ganz Schwarzenbach, und es gibt nur einen der sie aufhalten kann...</p><a href="/projects/panzerknacker.html">Behind The Scenes</a>'
            },
            group: 'filme'
        },
        {
            media: {
                url: '/assets/img/projects/waldstein.jpg',
                caption: 'Das Geheimnis des Waldsteins (Kurzfilm, 2012)',
                link: '/projects/waldstein.html'
            },
            start_date: {
                year: '2012'
            },
            text: {
                headline: 'Das Geheimnis des Waldsteins',
                text: '<p>Um den Bau von Windkraftanlagen in ihrer Heimat zu verhindern, machen sich Andrea und ihre Freunde auf eine gef&auml;hrliche Schatzsuche durch das Fichtelgebirge. Doch jemand ist hinter ihnen her und die Zeit rennt ihnen davon...</p><a href="/projects/waldstein.html">Behind The Scenes</a>'
            },
            group: 'filme'
        },
        {
            media: {
                url: '/assets/img/projects/unterwelt.jpg',
                caption: 'M&uuml;nchbergs TRAUMhafte Unterwelt (Kurzfilm, 2005)',
                link: '/projects/unterwelt.html'
            },
            start_date: {
                year: '2005'
            },
            text: {
                headline: 'M&uuml;nchbergs TRAUMhafte Unterwelt',
                text: '<p>Sch&uuml;ler der Parkschule M&uuml;nchberg finden beim Skateboardfahren einen Keller. Nach einem Gespr&auml;ch in der Schule untersuchen die Sch&uuml;ler den unterirdischen Gang und machen dabei eine fantastische Entdeckung.</p><a href="/projects/unterwelt.html">Behind The Scenes</a>'
            },
            group: 'filme'
        },
        {
            media: {
                url: '/assets/img/projects/probe.jpg',
                caption: 'Die Probe (Kurzfilm, 2003)',
                link: '/projects/probe.html'
            },
            start_date: {
                year: '2003'
            },
            text: {
                headline: 'Die Probe',
                text: '<p>Zuf&auml;llig entdecken einige Sch&uuml;ler auf dem Schulcomputer die L&ouml;sungen zur anstehenden Mathematik-Probe. Die Mathe-Probe f&auml;llt nach nach der Manipulation erwartungsgem&auml;&szlig; &uuml;berdurchschnittlich gut aus, was die Lehrerin jedoch misstrauisch macht.</p><a href="/projects/probe.html">Behind The Scenes</a>'
            },
            group: 'filme'
        },
        {
            media: {
                url: '/assets/img/projects/stadtkasse.jpg',
                caption: 'Die geklaute Stadtkasse (Kurzfilm, 2001)',
                link: '/projects/stadtkasse.html'
            },
            start_date: {
                year: '2001'
            },
            text: {
                headline: 'Die geklaute Stadtkasse',
                text: '<p>Die Krimikom&ouml;die handelt von drei Jugendlichen, die ihr ganzes Geld versoffen und verspielt haben. Um wieder an etwas Bares zu kommen, schmieden sie den Plan, die Stadtkasse aus dem M&uuml;nchberger Rathaus zu stehlen. Auf ihren Mofas fl&uuml;chten sie mit der Beute, jetzt muss die Kasse nur noch geknackt werden.</p><a href="/projects/stadtkasse.html">Behind The Scenes</a>'
            },
            group: 'filme'
        },
        {
            media: {
                url: '/assets/img/portrait/hugo/portrait.jpg',
                caption: 'Hugo Singer',
                link: '/portrait/hugo.html'
            },
            start_date: {
                year: '2000'
            },
            text: {
                headline: 'Gr&uuml;ndung',
                text: '<p>Hugo Singer gr&uuml;ndet den Arbeitskreis Video</p>'
            }
        }
    ]
};

window.timeline = new TL.Timeline('timeline-embed', json, options);