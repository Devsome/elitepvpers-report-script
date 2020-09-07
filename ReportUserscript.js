// ==UserScript==
// @name          Report SRO Advertisting Spam
// @namespace     http://tampermonkey.net/
// @version       0.2
// @description   Marking all Post with given bad words and can report easy
// @author        Devsome
// @match         https://www.tampermonkey.net/index.php?version=4.9&ext=dhdg&updated=true
// @grant         none
// @require       http://code.jquery.com/jquery-3.4.1.min.js
// @include       https://www.elitepvpers.com/forum/*
// @include       http://www.elitepvpers.com/forum/*
// ==/UserScript==

(function () {
    'use strict';
    // start of script


    jQuery.expr[':'].icontains = function (a, i, m) {
        return jQuery(a).text().toUpperCase()
            .indexOf(m[3].toUpperCase()) >= 0;
    };

    let wordArray = [
        'good', 'luck', 'gl', 'thanks', 'shared'
    ];

    var color = '#870A30';
    var rgbaCol = 'rgba(' + parseInt(color.slice(-6, -4), 16)
        + ',' + parseInt(color.slice(-4, -2), 16)
        + ',' + parseInt(color.slice(-2), 16)
        + ',0.5)';

    $(wordArray).each(function () {
        $("[id^=post_message]:icontains(" + this + ")").css('background-color', rgbaCol);
    });

    var originalInit = PostBit_Init;
    PostBit_Init = function (C, D) {
        let retVal = originalInit(C, D);

        let thePost = $('#post' + D);
        let theImage = thePost.find('img[title="Beitrag melden"]').each(function (index) {
            addReportMenu(this);
        });

        return retVal;
    }


    function addReportMenu(obj) {
        let url = $(obj).parent().attr('href');
        let postId = url.split('=').pop();
        let reportedCounter = window.localStorage.getItem('counter');

        if (window.localStorage.getItem(postId) === postId) {
            $(obj).parent().after('<div class="reportOwn" data-url=false>Already Reported!</div>');
        } else {
            $(obj).parent().after(
                '<select class="selectText">' +
                '<option value="">-- Choose --</option>' +
                '<option value="Refrain from commenting in threads with quotes such as Good luck or Good server they will be considered as spam.">GL</option>' +
                '<option value="Post hunting with Welcome or :( to every User is spam.">Hunting</option>' +
                '<option value="This Signatur is larger then 700 KB">Signatur</option>' +
                '<option value="Only purpose is to say thanks. Use thanks button instead.">Use Thanks Button</option>' +
                '<option value="This thread is in the release section, but does not contain a release.">Not a release</option>' +
                '<option value="Illegal user name. $5.6 Usernames which partially or fully contain an URL are forbidden.">Username is URL</option>' +
                '<option value="Meaningless post. $5.2 Making posts that are unnecessary or meaningless one-word posts like #reported or closerequest is forbidden.">Meaningless post</option>' +
                '</select>' +
                '<div class="reportOwn" data-url="' + url + '" data-text="">Report! (' + reportedCounter + ')</div>'
            );
        }
    }

    $('img[title="Beitrag melden"]').each(function (index) {
        addReportMenu(this);
    });

    let userBarItemLink = document.createElement('a');
    userBarItemLink.href = '#showreports';
    userBarItemLink.innerHTML = 'Reports';
    userBarItemLink.onclick = function () {
        return false;
    };

    let userBarItem = document.createElement('li');
    userBarItem.appendChild(userBarItemLink);

    document.getElementById('userbaritems').appendChild(userBarItem);

    let script = document.createElement("script");
    script.src = "https://www.elitepvpers.com/forum/mwmods/bump/js/bump.min.js?v=1.1.2";
    document.getElementsByTagName("head")[0].appendChild(script);

    let css = document.createElement("link");
    css.rel = "stylesheet";
    css.type = "text/css";
    css.href = "https://www.elitepvpers.com/forum/mwmods/bump/css/bump.min.css?v=1.1.2";
    document.getElementsByTagName("head")[0].appendChild(css);

    $(".selectText").change(function () {
        $(this).next('.reportOwn').data('text', $(this).val());
    });

    $('.reportOwn').click(function () {
        event.preventDefault();
        let dataUrl = $(this).data('url');
        if (dataUrl === false) {
            return;
        }
        let securitytoken = SECURITYTOKEN;
        let postId = dataUrl.split('=').pop();
        let textDiv = $(this);

        let reportText = $(this).data('text');
        if (!reportText.trim()) {
            reportText = prompt("No message set, enter a message");
        }

        if (!confirm("Do you really want to report this post with message\n" + reportText)) {
            return;
        }

        $(this).text('Pending');
        $.ajax({
            url: dataUrl,
            type: 'POST',
            data: {
                'reason': reportText,
                'do': 'sendemail',
                'url': 'showthread.php?p=' + postId + '#post' + postId,
                'securitytoken': securitytoken
            },
            datatype: 'json',
            success: function (data) {
                successFunction(textDiv, postId);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('error', textStatus, errorThrown, jqXHR);
                if (textStatus === 'error') {
                    errorFunction(textDiv, postId, jqXHR.responseText);
                    textDiv.text('Retry!');
                }
            }
        });
    });

    function errorFunction(textDiv, postId, text) {
        let regex = /\d+/gm;
        let matchTimer = 0;
        let match;
        while (match = regex.exec(text)) {
            matchTimer = match[0];
        }
        $("body").qtip({
            content: {
                text: 'Du musst noch ' + matchTimer + ' Sekunden warten!',
                title: 'Fehler',
            },
            position: {
                my: "top",
                at: "top",
                target: $(window)
            },
            show: {
                ready: true,
            },
            hide: {
                fixed: true,
                delay: 500
            },
            style: 'qtip qtip-default qtip-red qtip-shadow qtip-rounded qtip-pos-tl',
        });
    }

    function successFunction(textDiv, postId) {
        let n = window.localStorage.getItem('counter');
        if (n === null) {
            n = 0;
        } else {
            n++;
        }

        window.localStorage.setItem(postId, postId);
        window.localStorage.setItem("counter", n);

        textDiv.text('Successfully (' + n + ')');

        $("body").qtip({
            content: {
                text: 'Dies ist nun dein ' + n + ' report!',
                title: 'Erfolgreich',
            },
            position: {
                my: "top",
                at: "top",
                target: $(window)
            },
            show: {
                ready: true,
            },
            hide: {
                fixed: true,
                delay: 500
            },
            style: 'qtip qtip-default qtip-green qtip-shadow qtip-rounded qtip-pos-tl',
        });
    }

// end of script
})();
