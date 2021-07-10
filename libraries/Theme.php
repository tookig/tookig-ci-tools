<?php  if (! defined('BASEPATH')) exit('No direct script access allowed');

class Theme {
  protected $theme_view; 
  protected $theme_vars;
  protected $partials = [];

  /**
   * Constructor
   * 
   * @param Array $config         - Array with parameters
   */
  public function __construct($config = []) {
    // Save parameters
    $this->set_theme(isset($config['theme_view']) ? $config['theme_view'] : '', isset($config['theme_vars']) ? $config['theme_vars'] : []);
  }

  /**
   * Hack to get away from creating a member for CI super global
   */
  public function __get($var) {
		return get_instance()->$var;
	}

  public function set_theme($view, $vars = []) {
    $this->theme_view = $view;
    $this->theme_vars = $vars;
  }

  /**
   * Add a partial view to the theme
   * 
   * @param String $tag             - The tag string used to identify this partial in the theme view
   * @param String $view            - Name of the view (as used by CI)
   * @param Array  $vars            - Array with view variables (as used by CI)
   */
  public function add_partial($tag, $view, $vars = []) {
    $this->partials[$tag] = (object)[
      'view' => $view,
      'vars' => $vars
    ];
    return $this;
  }

  /**
   * Render a partial
   * 
   * @param String $tag             - Tag of partial to render
   */
  public function render_partial($tag) {
    if (isset($this->partials[$tag])) {
      $this->load->view($this->partials[$tag]->view, $this->partials[$tag]->vars);
    }
    return $this;
  }

  /**
   * Render the theme to the output (browser) 
   */
  public function render($additional_theme_vars = []) {
    $this->load->helper('theme');
    $this->load->view($this->theme_view, array_merge($this->theme_vars, $additional_theme_vars));
  }
}