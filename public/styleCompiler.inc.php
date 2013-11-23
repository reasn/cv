<?php
require_once __DIR__ . "/vendor/leafo/lessphp/lessc.inc.php";

$less = new lessc();

header('Content-Type: text/css');

echo $less->compile(file_get_contents(__DIR__ . '/css/style.less.css'));
