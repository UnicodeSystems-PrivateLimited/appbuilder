<?php

namespace App\Helpers;

use App\Models\TpAppsConfig;
use App\Models\TpAppsTabEntity;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;

class Helper {

    const PDF_UPLOAD_PATH = 'app/public/functions/pdf/tab';
    const STORAGE = '/storage/';
    const STORAGE_LOCAL_DISK = 'storage/app/';

    /**
     * @param mixed $var
     */
    public static function pr($var) {
        echo '<pre>';
        print_r($var);
        echo '</pre>';
        exit;
    }

    public static function getMilliTimestamp(): int {
        return (int)round(microtime(TRUE) * 1000);
    }

    public static function enableErrors() {
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        ini_set('error_reporting', E_ALL);
    }

    public static function getUploadDirectoryPath(string $path): string {
        return storage_path($path);
    }

    public static function getUploadDirectoryURL(string $path): string {
        return url(self::STORAGE . $path);
    }

    public static function getUploadDirectoryURLEmailTemplate(string $path): string {
        return url($path);
    }

    public static function getUploadDirectoryPathEmailTemplate(string $path): string {
        return url($path);
    }

    public static function makeDirectory(string $path) {
        if (!file_exists($path) and !is_dir($path)) {
//            echo $path; exit;
            mkdir($path, 0777, TRUE);
            chmod($path, 0777);
        }
    }

    /**
     * @param mixed $var
     */
    public static function prettyPrintR($var) {
        print_r(json_decode(json_encode($var)));
    }

    public static function getAppTimeZone($tab_id) {
        $app_details = TpAppsTabEntity:: getAppIdDetails($tab_id);
        $app_id = $app_details->app_id;
        $detail = TpAppsConfig::getAppConfigData($app_id);
        if (!empty($detail)) {
            $config = $detail->config_data;
            $config_arr = json_decode($config, true);
            return $config_arr;
        } else {
            return $detail;
        }
//        if(isset($config_arr)){
//        $timeZoneId = $config_arr['time_zone'];
//        // get timeZone
//        $timeZone = EventsTimeZone::timezone($timeZoneId);
//        $timeZone = $timeZone->time_zone;
//        $config_arr['time_zone'] = $timeZone;
//        }     
    }

    public static function uploadImage(UploadedFile $image, string $uploadPath, string $postfix = '', int $width = NULL, int $height = NULL, bool $maintainAspectRatio = FALSE): string {
        $extension = $image->getClientOriginalExtension();
        $fileName = self::getMilliTimestamp() . $postfix . '.' . $extension;
        Storage::makeDirectory($uploadPath, 0777, TRUE);
        if ($width && $height) {
            Image::make($image->getRealPath())
                ->resize($width, $height, function ($constraint) use ($maintainAspectRatio) {
                    if ($maintainAspectRatio) {
                        $constraint->aspectRatio();
                    }
                })
                ->save(Storage::getAdapter()->getPathPrefix() . $uploadPath . '/' . $fileName);
        } else {
            $image->move(Storage::getAdapter()->getPathPrefix() . $uploadPath, $fileName);
        }
        return $fileName;
    }

    public static function getStorageLocalDiskURL(string $path): string {
        return url(self::STORAGE_LOCAL_DISK . $path);
    }

}
