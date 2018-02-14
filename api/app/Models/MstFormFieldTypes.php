<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Helpers\Helper;

class MstFormFieldTypes extends Model {

    protected $table = 'mst_form_field_types';
    protected $guarded = ['id'];

}