<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Reset Password</title>
  </head>
  <body>
    <div style="max-width:600px; font-family:arial; margin:20px auto; border:1px solid #ededed; font-size:14px;">
        <div style="background: #067ab6;">
           <span style="color:#fff; font-size: 36px; padding: 12px 22px; display:inline-block;text-align: center; width: 100%;">
               {{ HTML::image('resources/assets/images/logo.png') }}
           </span>
        </div>
        <div style="display: block; padding: 20px; text-align: left; font-size:16px; color: #2E5075; background: #f8f8f8;">
            <h1>Dear {{$name}},</h1>
            <p>Your Tappit account email has been changed "{{$old}}" to "{{$new}}" .</p>
        </div>
        <div style="background: #f0f0f0; border-top: 1px solid #d1d1d1; color: #606060; display: block; font-size: 12px; line-height: 18px; padding: 1px 0;
    text-align: center;">
            <p>Thanks & Regards, <br>Tappit Team</p>            
        </div>
    </div>
  </body>
</html>