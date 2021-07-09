<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

if (!function_exists('js_inject')) {
	function js_inject($str, $flags = JSON_UNESCAPED_SLASHES) {
		return json_encode($str, $flags);
	}
}