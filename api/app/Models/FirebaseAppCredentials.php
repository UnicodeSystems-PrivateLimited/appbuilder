<?php

namespace App\Models;
use DB;
use Illuminate\Database\Eloquent\Model;

class FirebaseAppCredentials extends Model {

    protected $table = 'firebase_app_credentials';
    protected $guarded = ['id'];

    public static function getServerKey(int $appID) {
        return self::where('app_id', $appID)
            ->value('server_key');
    }

    public static function getSenderID(int $appID) {
        return self::where('app_id', $appID)
            ->value('sender_id');
    }

    //----------------------Qadir Code Start------------------------------//

    public static function getServerId() {
        return $query = self::select('server_key', 'sender_id')
            ->groupBy('sender_id', 'server_key')->orderBy('id', 'DESC')->take(10)->get();
    }

    public static function getAppServerKey(int $app_id) {
        return $query = self::select('id', 'app_id', 'server_key', 'sender_id')
                        ->where('app_id', $app_id)
                        ->first();
    }

    public static function saveServerKeyData($id = false, $app_id, $server_key, $sender_id) {
        if($id !== false && $id != '') {
            DB::table('firebase_app_credentials')->where('id', $id)->update([
                'app_id' => $app_id, 'server_key' => $server_key, 'sender_id'=>$sender_id
            ]);
        } else {
            $data = ['app_id' => $app_id, 'server_key' => $server_key, 'sender_id'=>$sender_id];
            $id = self::create($data)->id;
        }
        return $id;
    }

    //----------------------Qadir Code End------------------------------//

}