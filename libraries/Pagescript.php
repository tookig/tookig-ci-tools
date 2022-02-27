<?php defined('BASEPATH') OR exit('No direct script access allowed');

class Pagescript {
  // Scripts to include in page header
  protected $scripts = [];
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

  public function add_script_url($scriptUrl) {
    $this->scripts[] = $scriptUrl;
  }

  public function add_inject($key, $value) {
    $this->injects[$key] = $value;
  }

  public function renderScriptTags($returnAsString = true) {
    $val = '';
    foreach ($this->scripts as $script) {
      $val .= "<script type='text/javascript' src='$script'></script>";
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