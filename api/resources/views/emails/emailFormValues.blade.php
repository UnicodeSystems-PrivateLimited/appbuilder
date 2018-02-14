<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Email Form Values</title>
    </head>
  <body>
        <div style="max-width:600px; font-family:arial; margin:20px auto; font-size:14px;">
            <p>Hello,<br/>User has submitted via your form with following details:</p>
            
            <?php if (isset($fields)) { ?>
                <table style="border-collapse: collapse;">
                    <?php foreach ($sorted_field as $index => $val) {
//                    foreach ($fields as $key => $item){
                        if ($val->field_type_id == 16) {
                            // File Upload field 
                            continue;
                        } else if ($val->field_type_id == 11) {
                            // Address field
                    ?>
                    <tr>
                        <td style="border:1px solid #b3b3b3; background:#eee;padding:10px"> {{$fields[$val->id]['label']}} </td>
                        <td style="border:1px solid #b3b3b3; background:#fff;padding:10px"> 
                            <?php 
                                $arr =  $fields[$val->id]['value'];
                                foreach($arr as $key_addr => $val_addr){ 
                            ?>
                                    {{$val_addr}}&nbsp;    
                            <?php  } ?>
                        </td>
                    </tr>
                    <?php } else if ($val->field_type_id == 15) { ?>
                    <tr>
                        <td colspan="2" style="border:1px solid #b3b3b3; background:#eee;padding:10px; text-align: center; font-weight:  bold;"> {{$fields[$val->id]['label']}} </td>
                    </tr>
                    <?php } else { ?>
                    <tr>
                        <td style="border:1px solid #b3b3b3; background:#eee;padding:10px"> {{$fields[$val->id]['label']}} </td>
                        <td style="border:1px solid #b3b3b3; background:#fff;padding:10px"> {{$fields[$val->id]['value']}} </td>
                    </tr>
                    <?php } 
                    }
                    ?>
                </table>
            <?php   
                }
            ?> 
            
            <p style="text-align: center;">Thanks & Regards, <br>Tappit Team</p>
        </div>
  </body>
</html>
