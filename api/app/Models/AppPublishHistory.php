<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use DB;

class AppPublishHistory extends Model {

    protected $table = 'tp_app_publish_history';
     protected $guarded = ["id"];

    const TABLE = 'tp_app_publish_history';
    }