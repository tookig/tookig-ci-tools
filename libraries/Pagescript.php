<?php defined('BASEPATH') OR exit('No direct script access allowed');

class Pagescript {
  // Scripts to include in page header
  protected $scripts = [];
  // Styles to include in page header
  protected $styles = [];
  // Injection constants
  protected $injects = [];

  function __construct() {
  }

  /**
   * Hack to get away from creating a member for CI super global
   */
  public function __get($var) {
		return get_instance()->$var;
	}

  public function add_script_url($scriptUrl, $extraTags = '') {
    $this->scripts[] = [
      'url' => $scriptUrl,
      'extra' => $extraTags
    ];
  }

  public function add_style_url($styleUrl) {
    $this->styles[] = $styleUrl;
  }

  public function add_inject($key, $value) {
    $this->injects[$key] = $value;
  }

  public function renderHeaderTags($returnAsString = true) {
    $val = '';
    foreach ($this->styles as $style) {
      $val .= "<link type='text/css' rel='stylesheet' href='$style' media='screen' />";
    }
    foreach ($this->scripts as $script) {
      $val .= "<script type='text/javascript' src='{$script['url']}' {$script['extra']}></script>";
    }
    if ($returnAsString) {
      return $val;
    }
    echo $val;
  }

  public function renderInject($returnAsString = true) {
    $val = '<form id=\'page-script-injections\'>';
    foreach ($this->injects as $key => $value) {
      $val .= "<input type='hidden' name='$key' value='" . js_inject($value) . "'>";
    }
    $val .= '</form>';
    if ($returnAsString) {
      return $val;
    }
    echo $val;
  }

}