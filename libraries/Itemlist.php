<?php defined('BASEPATH') OR exit('No direct script access allowed');

require_once(APPPATH.'third_party/tokig_tools/helpers/ajax_traits.php');

class Itemlist {
  use AjaxTrait;

  const SUCCESS = 200;
  const BAD_REQUEST = 400;
  const UNAUTHORIZED = 401;
  const FORBIDDEN = 403;
  const INTERNAL = 500;

  public function __construct() {
    $this->config->load('itemlist', true);
    $this->load->helper('itemlist');
  }

  /**
   * Hack to get away from creating a member for CI super global
   */
  public function __get($var) {
		return get_instance()->$var;
	}

  /**
   * Create a list config object.
   *  
   * @param String|Object|Array $settings    - A string with the name of the setting from the 
   *                                           itemlist-php config file.
   */
  function lookup_list($settings) {
    // Get lists from settings
    $lists_available = $this->config->item('itemlists', 'itemlist');
    // Get settings
    if (in_array($settings, array_keys($lists_available))) {
      return (object)$lists_available[$settings];
    }
    return false;
  }

  function api_call($list_instance, $params) {
    // Make sure the called method is valid
    if (!isset($params[0]) || !in_array($params[0], ['get', 'update', 'delete'])) {
      $this->_add_errors('Invalid method')->_fail(self::BAD_REQUEST);
    }
    // Call method
    $this->{$params[0]}($list_instance);
  }  

  function get($list_instance) {
    // Authorize
    $list_instance->authorize('get');
    // Get from database
    $response = $this->generic_get_items($list_instance);
    // Return
    if ($response->statusCode !== self::SUCCESS) {
      $this->_add_errors($response->errors)->_fail($response->statusCode);
    }
    $this->_success(['items' => $response->items, 'count' => $response->count]);
  }

  function update($list_instance) {
    // Authorize
    $list_instance->authorize('update');
    // Go through all fields and add validation.
    $this->load->library('flex_validation');
    foreach ($list_instance->fields as $field) {
      $validation = 'trim|' . $field['validation'];
      if ($field['name'] !== $list_instance->identity_field) {
        $validation .= '|required';
      }
      $this->flex_validation->set_rules($field['name'], $field['description'], $validation);
    }
    // Validate
    if (!$this->flex_validation->run()) {
      $this->_add_errors($this->flex_validation->error_array())->_fail(self::BAD_REQUEST);
    }
    // Get data and create add/update object
    $update = [];
    foreach ($list_instance->fields as $field) {
      $update[$field['name']] = $this->flex_validation->value($field['name'])?:false;
    }
    // Run dataset
    if ($update[$list_instance->identity_field] === false) {
      $update[$list_instance->identity_field] = $list_instance->add($update);
    } else {
      $list_instance->update($update);
    }
    // Return
    $this->_success(['item' => $list_instance->get($update)]);
  }

  function delete($list_instance) {
    // Authorize
    $list_instance->authorize('delete');
    // Get identity field
    $identity = false;
    foreach ($list_instance->fields as $field) {
      if ($field['name'] === $list_instance->identity_field) {
        $identity = $field;
        break;
      }
    }
    // Make sure we found an identity field
    if ($identity === false) {
      $this->_add_errors('Identity field missing')->_fail(self::INTERNAL);
    }
    // Validate
    $this->load->library('flex_validation');
    $validation = 'trim|required|' . $identity['validation'];
    $this->flex_validation->set_rules($identity['name'], $identity['description'], $validation);
    if (!$this->flex_validation->run()) {
      $this->_add_errors($this->flex_validation->error_array())->_fail(self::BAD_REQUEST);
    }
    // Delete
    $list_instance->delete((object)[$identity['name'] => $this->flex_validation->value($identity['name'])]);
    // Return
    $this->_success();
  }

  /**
   * Helper function for getting list items from database.
   *
   * This method can be used to get items from a database table using the
   * filter options sent by the JavaScript itemList-control.
   *
   * @param Object $list_instance           - List instance object
   * 
   * @return Object                           A response object that determines the outcome of the table query.
   */
  function generic_get_items($list_instance) {
    // Response object
    $response = (object)[
      'statusCode' => self::INTERNAL,
      'errors' => [],
      'items' => [],
      'count' => 0
    ];
    // Validate POST data
    $this->load->library('flex_validation');
    $this->flex_validation->set_rules($this->item_list_validation($list_instance->get_sortable()));
    if (!$this->flex_validation->run()) {
      $response->statusCode = self::BAD_REQUEST;
      $response->errors = array_values($this->flex_validation->error_array());
      return $response;
    }
    // Create parameters
    $params = $this->item_list_parameters($list_instance->default_sort);
    // Get objects
    $items = $list_instance->get_list_items($params);
    $count = $list_instance->get_list_count($params['search']);
    // Return
    $response->statusCode = self::SUCCESS;
    $response->items = $items;
    $response->count = $count;
    return $response;
  }

  /**
   * Returns an array that can be used for validating input from the itemList
   * client control.
   */
  protected function item_list_validation($sortFields = []) {
    return [[
        'field' => 'startIndex',
        'label' => 'Start index',
        'rules' => 'trim|is_natural'
      ],[
        'field' => 'maxCount',
        'label' => 'Max count',
        'rules' => 'trim|is_natural_no_zero'
      ],[
        'field' => 'sortBy',
        'label' => 'Sort by',
        'rules' => 'trim|alpha_dash'  . (empty($sortFields) ? '' : '|in_list['.implode(',', $sortFields).']')
      ],[
        'field' => 'sortOrder',
        'label' => 'Sort order',
        'rules' => 'trim|in_list[asc,desc]'
      ],[
        'field' => 'search',
        'label' => 'Search',
        'rules' => 'trim'
      ]
    ];
  }

  /**
   * Get the standard parameters for an item list sort/search.
   * @param string $defaultSortBy - Default value for the sorting if not provided in request
   */
  protected function item_list_parameters($defaultSortBy) {
    $params = [];
    $params['offset'] = $this->flex_validation->value('startIndex') ?: 0;
    $params['count'] = $this->flex_validation->value('maxCount') ?: false;
    $params['sortBy'] = $this->flex_validation->value('sortBy') ?: $defaultSortBy;
    $params['sortOrder'] = $this->flex_validation->value('sortOrder') ?: 'asc';
    $params['search'] = $this->flex_validation->value('search') ?: false;
    return $params;
  }
}
