<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Base directory for script files. Can be an array if there is more then one script folder.
 * If this is an array, the folders will be searched in order.
 */
$config['js_dir'] = [
  'assets/scripts/',
  'application/third_party/tookig-ci-tools/scripts'
];

/**
 * Base directory for style files. Can be an array if there is more then one style folder.
 * If this is an array, the folders will be searched in order.
 */
$config['css_dir'] = 'assets/css/';

/**
 * Directory to store output files. Must be writeable.
 */
$config['cache_dir'] = 'assets/cache/';