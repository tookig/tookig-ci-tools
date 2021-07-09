<?php defined('BASEPATH') OR exit('No direct script access allowed');

$config['itemlists'] = [];
$config['itemlists']['dataset'] = [
  'table' => 'dataset',
  'identity_field' => 'datasetid',
  'default_sort' => 'name',
  'readonly' => true,
  'fields' => [
  [
    'name' => 'datasetid',
    'description' => 'Dataset ID',
    'validation' => 'is_natural_no_zero',
    'is_sortable' => true,
    'is_searchable' => true,
    'is_readonly' => true
  ],
  [
    'name' => 'name',
    'description' => 'Name',
    'validation' => 'min_length[1]|max_length[45]',
    'is_sortable' => true,
    'is_searchable' => true,
    'is_readonly' => false
  ]]
];