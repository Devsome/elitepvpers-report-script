// ==UserScript==
// @name          Report SRO Advertisting Signatur
// @namespace     http://tampermonkey.net/
// @version       0.1
// @description   Displaying a button to scan all the Signatur Images and show larger then 700 KB
// @author        Devsome
// @match         https://www.tampermonkey.net/index.php?version=4.9&ext=dhdg&updated=true
// @grant         none
// @require       http://code.jquery.com/jquery-3.4.1.min.js
// @include       https://www.elitepvpers.com/forum/*
// @include       http://www.elitepvpers.com/forum/*
// ==/UserScript==

(function() {
    'use strict';
    // start of script

    $('img[src*="/reply.gif"]').each(function () {
      $(this).parent().after(
        '<img id="scanSignatur" style="cursor: pointer" width="96" height="20" src="https://devsome.com/signatur.png" alt="Scan Signatur" border="0" title="Scan Signatur">'
      );
    });

    let state = false;
    let countFound = 0;
    $('#scanSignatur').click(function() {
      $(this).remove();
      $('[id^=post_signature_] img').each(function( index ) {
        let src = $(this).attr('src');
        let that = $(this);
        $.post({
           url: "https://devsome.com/signatur.php",
           data: { s: src, k: 'meinSecretToken' },
           async: false,
           success: function (data) {
             if(data.size > 700) {
               countFound += 1;
               state = true;
               let sig = that.parents('[id^=post_signature_]');

               sig.addClass('file-size-exceeded');
               sig.children().first().before(
                   $(document.createElement('span')).addClass('file-size-notification')
               );
               sig.find('.file-size-notification').text('Total File Size > 700 KB (' + 'msg' + ')');
               sig.css('background-color', 'rgba(237,20,61,0.1)');

               let post = sig.parents('[id^=post_message_]');
             }

           }
        }).done(function() {
          if(!state) {
            $("body").qtip({
                content: {
                    text: 'Alle Signaturen sind ok!',
                    title: 'Signatur',
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
          } else {
            $("body").qtip({
                content: {
                    text: 'Es gibt eine ' + countFound + ' Signatur die mehr als 700 KB haben!',
                    title: 'Signatur',
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
        });
      });
    });

// end of script
})();
