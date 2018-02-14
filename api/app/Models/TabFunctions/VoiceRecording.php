<?php

namespace App\Models\TabFunctions;

use Illuminate\Database\Eloquent\Model;
use DB;
use Illuminate\Database\Eloquent\Collection;
use App\Helpers\Helper;

class VoiceRecording extends Model {

    protected $table = 'tp_func_voice_recording';
    protected $guarded = ['id']; 
       
    
    /**
     * get last voice recording info
     */
    public static function getLastVoiceData(int $tabId) {
        return self::select('id','subject','email_id','description')
            ->where('tab_id', $tabId)
            ->first();
    }

    /**
     * get voice recording info
     */
    public static function getVoiceData(int $id) {
        return self::select('id','tab_id','subject','email_id','description','created_at')
            ->where('id',$id)
            ->first();
    }
    

}