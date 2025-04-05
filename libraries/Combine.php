<?php defined('BASEPATH') OR exit('No direct script access allowed');

class Combine {
  // Default base dir for files.
  protected $js_dir;
  protected $css_dir;
  protected $cache_dir;
  protected $cache_url;

  // Array with info on files to combine
  protected $js_files = [];
  protected $css_files = [];

  // Output files
  protected $output_files = [];

  /**
   * Constructor
   */
  function __construct() {
    // Load config
    $this->load->config('combine', true);
    $this->js_dir = $this->config->item('js_dir', 'combine');
    $this->css_dir = $this->config->item('css_dir', 'combine');
    $this->cache_dir = $this->config->item('cache_dir', 'combine');
    $this->cache_url = $this->config->item('cache_url', 'combine');
    // Make them arrays if they are not already
    foreach ([&$this->js_dir, &$this->css_dir] as &$dirs) {
      if (!is_array($dirs)) {
        $dirs = [$dirs];
      }
      // Add directory separator if not present
      foreach ($dirs as &$dir) {
        if (substr($dir, -1) !== DIRECTORY_SEPARATOR) {
          $dir .= DIRECTORY_SEPARATOR;
        }
      }
    }
    // Add separators to the cache dirss
    foreach ([&$this->cache_dir, &$this->cache_url] as &$dir) {
      if (substr($dir, -1) !== DIRECTORY_SEPARATOR) {
        $dir .= DIRECTORY_SEPARATOR;
      }
    }
  }

  /**
   * Hack to get away from creating a member for CI super global
   */
  public function __get($var) {
		return get_instance()->$var;
	}

  /**
   * Add a javascript file
   * 
   * This function will first look in the js_dir (from the config file) directory. If it can't find it there
   * it will look in the BASEPATH directory. Filename can contain subdirectories.
   * 
   * @param String|Array $file          - Script file(s) to include in output
   */
  function js($file) {
    return $this->add($file, $this->js_files, $this->js_dir);
  }

  /**
   * Add a style file
   * 
   * This function will first look in the css_dir (from the config file) directory. If it can't find it there
   * it will look in the BASEPATH directory. Filename can contain subdirectories.
   * 
   * @param String|Array $file          - Style file(s) to include in output
   */
  function css($file) {
    return $this->add($file, $this->css_files, $this->css_dir);
  }

  /**
   * Create the output.
   * 
   * @param Boolean [$as_string=false]          - Set to true to get a string with the HTML tags, false to echo.
   */
  function display($as_string = false) {
    $this->combine_files($this->js_files, 'js');
    $this->combine_files($this->css_files, 'css');

    $output = '';
    if (isset($this->output_files['js'])) {
      $output .= '<script type="text/javascript" src="' . site_url($this->cache_url . $this->output_files['js']) . '"></script>' . PHP_EOL;
    }
    if (isset($this->output_files['css'])) {
      $output .= '<link type="text/css" rel="stylesheet" href="' . site_url($this->cache_url . $this->output_files['css']) . '" media="screen"/>' . PHP_EOL;
    }
    if ($as_string) {
      return $output;
    }      
    echo $output;
  }

  /**
   * Empty the cache folder of any .js or .css files older than the specified deadline.
   * 
   * @param String $deadline            - Files modified before this time will be deleted. This string should work with
   *                                      the strtotime() php function.
   */
  function empty_cache($deadline = 'now') {
    // Extensions to look for
    $file_extensions = ['.css', '.js'];
    // Deadline as UNIX timestamp
    $timestamp = strtotime($deadline);
    // Get files in cache folder
    $this->load->helper('file');
    $files = get_filenames($this->cache_dir);
    $files = array_filter($files, function ($file) use ($file_extensions) {
      foreach ($file_extensions as $ext) {
        if (substr($file, - strlen($ext)) === $ext) return true;
      }
      return false;
    });
    // Go through all files and delete those older then deadline
    foreach ($files as $file) {
      $mtime = filemtime($this->cache_dir . $file);
      if ($mtime && ($mtime <= $timestamp)) {
        if (unlink($this->cache_dir . $file) === false) {
          log_message('ERROR', "Unable to delete the file {$this->cache_dir}$file");
        }
      }
    }
  }

  /**
   * Add a file
   * 
   * @param String|Array $file    - File(s) to add
   * @param Array  $target_array  - Reference to target array (js_files or css_files)
   * @param Array $source_dirs    - Directories to start looking in
   */
  protected function add($file, &$target_array, $source_dirs) {
    // If files is an array, do them one by one
    if (is_array($file)) {
      foreach ($file as $f) {
        $this->add($f, $target_array, $source_dirs);
      }
      return $this;
    }
    // Base paths to check for file in
    $paths = array_merge($source_dirs, ['']);
    // Check if we can find the file in any of the paths
    foreach ($paths as $path) {
      if (file_exists($path . $file) && !in_array($path . $file, $target_array)) {
        $target_array[] = $path . $file;
        return $this;
      }
    }
    // None found, show error
    show_error("File $file could not be found.");
    return $this;
  }

  protected function combine_files($files, $file_type) {
    $id_string = '';
    $last_update = 0;
    // Go through all files to get an hash and last file update
    foreach ($files as $file) {
      $mtime = filemtime($file);
      if ($mtime && ($mtime > $last_update)) {
        $last_update = $mtime;
      }
      $id_string .= $file;
    }   
    // Create filename
    $output_file = sha1($id_string) . $last_update . '.' . $file_type;
    // Check if this file exists, else create it
    if (!file_exists($this->cache_dir . $output_file)) {
      $this->create_file($files, $this->cache_dir . $output_file);
    }
    $this->output_files[$file_type] = $output_file;
    return $this;
  }

  protected function create_file($files, $output_file) {
    foreach ($files as $file) {
      file_put_contents($output_file, file_get_contents($file) . PHP_EOL, FILE_APPEND);
    }
  }
}