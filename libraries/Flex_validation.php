<?php defined('BASEPATH') or exit('No direct script access allowed');

require_once(BASEPATH . 'libraries/Form_validation.php');

class Flex_validation extends CI_Form_validation
{
  public const FLEX_MODE_STRICT = 0;
  public const FLEX_MODE_MIXED = 1;

  protected $mode;
  protected $pre_check_values = [];
  protected $post_check_values = [];

  public function __construct($rules = [])
  {
    parent::__construct($rules);
    $this->set_mode(self::FLEX_MODE_STRICT);
  }

  public function set_mode($mode)
  {
    if (in_array($mode, [self::FLEX_MODE_STRICT, self::FLEX_MODE_MIXED])) {
      $this->mode = $mode;
      return $this;
    }
    throw new Exception('Invalid flex mode flag');
  }

  public function set_rules($field, $label = '', $rules = array(), $errors = array())
  {
    // Set a dummy array as validation data, otherwise form_validation will
    // exit if request method is not POST.
    $this->set_data(['dummy' => 'array']);
    // Run the parent function
    parent::set_rules($field, $label, $rules, $errors);
    // If the field is an array, we've already been here
    if (is_array($field)) {
      return $this;
    }
    // Make sure the parent function addes this rule
    if (!isset($this->_field_data[$field])) {
      throw new Exception('Invalid field rule');
    }
    // Strip field name of any array indicators
    sscanf($field, '%[^[][', $field);
    // Save the field value to validate later
    $this->pre_check_values[$field] = $this->get_field($field);
    // Set the new validation data array
    $this->set_data($this->pre_check_values);
    return $this;
  }

  public function run($group = '')
  {
    // Run parent function
    $result = parent::run($group);
    // If successfull, transfer pre check values to post check values
    if ($result) {
      $this->post_check_values = $this->pre_check_values;
    }
    return $result;
  }

  public function reset_validation()
  {
    $this->post_check_values = [];
    $this->pre_check_values = [];
    return parent::reset_validation();
  }

  public function value($field_name)
  {
    return isset($this->post_check_values[$field_name]) ? $this->post_check_values[$field_name] : null;
  }

  public function values($field_names)
  {
    $rval = [];
    foreach ($field_names as $field_name) {
      $rval[$field_name] = $this->value($field_name);
    }
    return $rval;
  }

  public function values_if_set($field_names)
  {
    $rval = [];
    foreach ($field_names as $field_name) {
      if (isset($this->post_check_values[$field_name])) {
        $rval[$field_name] = $this->post_check_values[$field_name];
      }
    }
    return $rval;
  }

  public function all_values() {
    return $this->post_check_values;
  }

  public function all_set_values() {
    return array_filter($this->post_check_values, function ($value) {
      return $value !== null;
    });
  }

  public function has_value($field_name) {
    return isset($this->post_check_values[$field_name]);
  }

  protected function get_field($field)
  {
    if ($this->mode === self::FLEX_MODE_MIXED) {
      $sources = [$this->CI->input->method(), 'GET', 'POST'];
      foreach ($sources as $method) {
        $value = $this->get_value($method, $field);
        if ($value != null) {
          return $value;
        }
      }
    } else if ($this->mode === self::FLEX_MODE_STRICT) {
      return $this->get_value($this->CI->input->method(), $field);
    }
    return null;
  }

  protected function get_value($method, $field)
  {
    $method = strtoupper($method);
    if ($method === 'GET') {
      return isset($_GET[$field]) ? $_GET[$field] : null;
    } else if ($method === 'POST') {
      return isset($_POST[$field]) ? $_POST[$field] : null;
    }
    return null;
  }

  //////////////////////////// Extra validation methods //////////////////////////////

  /**
   * Float number
   *
   * @param	string
   * @return	bool
   */
  public function decimal($str)
  {
    if (preg_match('/^[+-]?([0-9]*[.,])?[0-9]+$/', $str)) {
      return true;
    }
    $this->set_message('decimal', '{field} must be a decimal number.');
    return false;
  }

  /**
   * Validation check date
   */
  // http://stackoverflow.com/questions/7099481/how-to-check-strings-date-format-in-php
  function date($date)
  {
    if (!$date) return true;
    if (preg_match("/^(\d{4})-(\d{2})-(\d{2})$/", $date, $matches)) {
      if (checkdate($matches[2], $matches[3], $matches[1])) {
        return true;
      }
    }
    $this->set_message('date', '{field} must be a valid date.');
    return false;
  }

  /**
   * Validation check time
   */
  function time($time)
  {
    if (!$time) return true;
    if (preg_match("/^(\d{2}):(\d{2})$/", $time, $matches)) {
      if (($matches[1] >= 0) && ($matches[1] < 24) && ($matches[2] >= 0) && ($matches[1] <= 59)) {
        return true;
      }
    }
    $this->set_message('time', '{field} must be a valid time.');
    return false;
  }
}
