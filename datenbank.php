<?php
header('Access-Control-Allow-Origin: *');

$src = $_REQUEST['s'];
$key = $_REQUEST['k'];


if ($key === 'meinSecretToken') {

    session_start();
    $cfg['sql_host'] = 'localhost';
    $cfg['sql_user'] = 'sqlUsername';
    $cfg['sql_pass'] = 'sqlPassword';
    $cfg['sql_db'] = 'datenbank';


    $sqlLink = mysql_connect($cfg[sql_host], $cfg[sql_user], $cfg[sql_pass]);
    if (!$sqlLink) {
        die('Ups');
    }
    mysql_select_db($cfg[sql_db], $sqlLink);

    $query = mysql_query("select url, size from epvp_signatur where url='$src'");
    $result = mysql_num_rows($query);
    if ($result > 0) {
        $data = mysql_fetch_array($query);
        header('Content-Type: application/json');
        die(
        json_encode([
            'state' => false,
            'size' => $data['size'],
            'error' => 'Image exist in Database',
        ])
        );
    } else {
        $size = remote_filesize($src);
        $size = round($size / 1024);
        mysql_query("insert into epvp_signatur(url, size) values('$src', '$size')");
    }


    $size = remote_filesize($src);
    $size = round($size / 1024);
    header('Content-Type: application/json');

    if ($size >= 701) {
        die(json_encode([
            'state' => true,
            'size' => $size,
        ]));
    }
    die(json_encode([
        'state' => false,
        'size' => $size,
    ]));

} else {
    die ('Something is wrong');
}


function remote_filesize($url)
{
    static $regex = '/^Content-Length: *+\K\d++$/im';
    if (!$fp = @fopen($url, 'rb')) {
        return false;
    }
    if (
        isset($http_response_header) &&
        preg_match($regex, implode("\n", $http_response_header), $matches)
    ) {
        return (int)$matches[0];
    }
    return strlen(stream_get_contents($fp));
}
