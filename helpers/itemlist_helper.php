<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once(APPPATH.'third_party/tookig-ci-tools/helpers/ajax_traits.php');

if (!trait_exists('ItemListControllerTrait')) {
  trait ItemListControllerTrait {
    /**
     * Override this to provide the item list with a custom implementation
     * 
     * @param String $list - Name of list to use (as indexed in the itemlist.php config file)
     */
    function _get_itemlist_instance($list) {
      $this->load->helper('itemlist');
      return new ItemlistDefaultInstance($list);
    }

    /**
     * Called by the CI core when controller is invoked.
     */
    function _remap($list, $params) {
      get_instance()->load->library('itemlist');
      get_instance()->itemlist->api_call($this->_get_itemlist_instance($list), $params);
    }
  }
}

if (!class_exists('ItemlistDefaultInstance')) {
  /**
   * Default item list instance. Override this to add your own behaviour to list item retrieval and
   * item modification.
   */
  class ItemlistDefaultInstance {
    use AjaxTrait;

    const SUCCESS = 200;
    const BAD_REQUEST = 400;
    const UNAUTHORIZED = 401;
    const FORBIDDEN = 403;
    const INTERNAL = 500;

    public $name;
    public $table;
    public $identity_field;
    public $default_sort;
    public $readonly;
    public $fields = [];

    /**
     * Hack to get away from creating a member for CI super global
     */
    public function __get($var) {
      return get_instance()->$var;
    }

    /**
     * Constructor
     * 
     * @param String|Object|Array $list_name    - A string with the name of the setting from the 
     *                                            itemlist-php config file.
     */
    function __construct($list_name) {
      // Load itemlist lib
      $this->load->library('itemlist');
      // Get settings
      $settings = $this->itemlist->lookup_list($list_name);
      if (!$settings) {
        $this->_add_errors('Listitem settings not valid')->_fail(400);
      }
      // Save settings
      $this->name = $list_name;
      $this->table = $settings->table;
      $this->identity_field = $settings->identity_field;
      $this->default_sort = $settings->default_sort;
      $this->fields = $settings->fields;
      $this->readonly = property_exists($settings, 'readonly') ? $settings->readonly : true;
    }

    /**
     * Authorize a request
     * 
     * Default behaviour is to just check if csrf protection is enabled, and in that case enforce it.
     * 
     * This function should end the request if the authorization fails.
     * 
     * @param String $request - Type of request; 'get', 'update' or 'delete'.
     */
    function authorize($request) {
      if ($this->readonly && in_array(strtolower($request), ['update', 'delete'])) {
        $this->_add_errors('List is read only')->_fail(403);
      }
      if ($this->config->item('csrf_protection') !== false) {
        $this->_csrf_verify();
      }
    }

    /**
     * Get items from database
     * 
     * @param mixed $id - Identity of item to get
    */ 
    function get($id) {
      return $this->db->where($this->identity_field, $id)->get($this->table)->row();
    }

    /**
     * Add an item to the database
     * 
     * @param Object $item - Item to add
     */
    function add($item) {
      $this->db->insert($this->table, $item);
      return $this->db->insert_id();
    }

    /**
     * Update an item
     * 
     * @param Object $item - Item to update
     */
    function update($item) {
      if (is_array($item)) {
        $item = (object)$item;
      }
      $this->db->where($this->identity_field, $item->{$this->identity_field})->set($item)->update($this->table);
    }

    /**
     * Delete an item
     * 
     * @param Object $item - Item to delete
     */
    function delete($item) {
      if (is_array($item)) {
        $item = (object)$item;
      }
      $this->db->where($this->identity_field, $item->{$this->identity_field})->delete($this->table);
    }

    /**
     * Get items from a table using the filters used by the item list client control.
     * @param Object[] $filters       - Filters to use when getting data. See the
     *                                  apply_standard_filter method.  
     *
     * @return Object[]                 Array with database objects.
     */
    public function get_list_items($filters) {
      // Get from table
      $this->db->from($this->table);
      $this->apply_standard_filter($filters);
      // Get data from database
      $data = $this->db->get()->result();
      // Return data
      return $data;
    }

    /**
     * Get the total number of items for a table search
     * @param String $search                 - Optional string to search table for
     * @param Number Number of records in table matching where and search.
     */
    public function get_list_count($search = false) {
      $searchFields = $this->get_searchable();
      $this->db->from($this->table);
      if ($search) {
        foreach ($searchFields as $fieldName) {
          $this->db->like($fieldName, $search);
        }
      }
      return $this->db->count_all_results();
    }


    /**
    * Apply the standard filter options to the database object
    *
    * @param object[] $filters                Array with filter options:
    * @param string $filters['search']        Search string
    * @param int/bool $filters['count']       Max number of rows to return, or false to get everything
    * @param int/bool $filters['offset']      Start row (offset) for a LIMIT
    * @param string $filters['sortBy']        Sort by this column
    * @param bool   $filters['sortOrder']     Can be 'asc' (default) or 'desc'
    * @param string[] $searchFields           Name of the fields in the database that are searchable
    */
    protected function apply_standard_filter($filters = []) {
      // Set default filters
      $filters = (object)array_merge([
        'search' => false,
        'count' => false,
        'offset' => false,
        'sortBy' => false,
        'sortOrder' => 'asc'
      ], $filters);
      // Get searchable fields
      $searchFields = $this->get_searchable();
      // Apply search
      if ($filters->search && (count($searchFields) > 0)) {
        $this->db->group_start();
        foreach ($searchFields as $fieldName) {
          $this->db->or_like($fieldName, $filters->search);
        }
        $this->db->group_end();
      }
      // Set order and limits
      if ($filters->sortBy) {
        $this->db->order_by($filters->sortBy, $filters->sortOrder);
      }
      if ($filters->count!==false) {
        if ($filters->offset!==false) {
            $this->db->limit($filters->count, $filters->offset);
        }
        else {
            $this->db->limit($filters->count);
        }
      }
    }

    /**
     * Get a list of all searchable fields
     */
    public function get_searchable () {
      $searchable = [];
      foreach ($this->fields as $field) {
        if ($field['is_searchable']) $searchable[] = $field['name'];
      }
      return $searchable;
    }

    /**
     * Get a list of all sortable fields
     */
    public function get_sortable() {
      $sortable = [];
      foreach ($this->fields as $field) {
        if ($field['is_sortable']) $sortable[] = $field['name'];
      }
      return $sortable;
    }

    /**
     * When using the create_item_list html-helper, this function will be called to
     * translate table headers and option list items. Override this to provide custom
     * translations.
     * 
     * @param String $field           -  The field id of the field to be translated
     * @param String [$option]        -  (optional) The option value to be translated
     */
    public function custom_lang($field, $option = false) {
      return false;
    }
  }
}