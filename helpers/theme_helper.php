<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

if (!function_exists('render_partial')) {
  function render_partial($tag) {
    get_instance()->theme->render_partial($tag);
  }  
}