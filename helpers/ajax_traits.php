<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

if (!trait_exists('AjaxTrait')) {
  trait AjaxTrait {
    /**
     * List with errors for this request
     */
    protected $_ajax_errors = [];

    /**
     * Save error(s) to be sent with the response to the client
     *
     * @param [string|array] $errors String or array with strings
     * @return Object Self reference for method chaining
     */
    function _add_errors($errors) {
      if (is_array($errors)) {
        $this->_ajax_errors = array_merge($this->_ajax_errors, array_values($errors));
      } else {
        $this->_ajax_errors[] = $errors;
      }
      return $this;
    }

    /**
     * End an ajax request with a success-response.
     *
     * This function will end an ajax request and return a success response,
     * with the provided data payload. The 'success'-flag of the data payload
     * is set to 1. THe data will be sent as JSON.
     *
     * @param mixed[] $data Data to be sent back to client
     * @param number $json_encoding_options JSON encoding flags (see json_encode docs https://www.php.net/manual/en/json.constants.php)
     */
    function _success($data = [], $json_encoding_options = 0) {
      $ci = &get_instance();
      $data['success'] = 1;
      $ci->output->set_output(json_encode($data, $json_encoding_options));
      $ci->output->_display();
      exit;
    }

    /**
     * End an ajax request with a fail
     *
     * Fails an ajax reuqest, and sets the correct http error code together
     * with optional json data.
     *
     * @param int $code HTTP error code
     * @param object $data JSON data to send back to client
     * @param number $json_encoding_options JSON encoding flags (see json_encode docs https://www.php.net/manual/en/json.constants.php)
     */
    function _fail($code = 500, $data = [], $json_encoding_options = 0) {
      $ci = &get_instance();
      $ci->output->set_status_header($code);
      $data['success'] = 0;
      if (!isset($data['errors']) && (count($this->_ajax_errors) > 0)) {
        $data['errors'] = $this->_ajax_errors;
      }
      $ci->output->set_output(json_encode($data, $json_encoding_options));
      $ci->output->_display();
      exit;
    }

  /**
   * Checks csrf token in ajax request
   * 
   * @param bool [$autofail=true] True if to send an automatic fail response if csrf check fails.
   * @param string [$csrf_parameter_name='csrf_token] Set if to use different token name then sepcified in config.php
   */
  function _csrf_verify($autofail = true, $csrf_parameter_name = false) {
    if ($csrf_parameter_name === false) {
      $csrf_parameter_name = $this->config->item('csrf_token_name');
    }
    $token = $this->input->get_post($csrf_parameter_name);
    if ($token && hash_equals($token, $this->security->get_csrf_hash())) {
      return true;
    }
    if ($autofail) {
      $this->_add_errors('Security error')->_fail(401);
    }
    return false;
  }
  }
}