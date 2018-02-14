<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>{{$subject}}</title>
    </head>
    <body>
        <div style="max-width:600px; font-family:arial; margin:20px auto; border:1px solid #ededed; font-size:14px;">
            <div style="background:#6A67CE; border-radius: 3px 3px 0 0;">
                <span style="color: #fff;font-size: 36px;padding: 12px 0px 5px;display: inline-block;text-align: center;width: 100%;">
                    <span style="vertical-align: middle;">{{ HTML::image('resources/assets/images/logo.png') }}</span>
                </span>
            </div>
            <div style="display: block;text-align: left; padding: 0 20px; font-size: 16px;color: #2e5075;background: #fff;border: 1px solid rgb(221,221,221);">
                <h1 style="font-size: 24px;font-weight: 400;color: rgb(27,36,50);">Hello {{$app_name}},</h1>
                {!!$body!!}
                <p></p>  
                <div style="background: #fff;color: #606060;display: block;font-size: 12px;line-height: 18px;border-top: 1px solid rgba(204, 204, 204, 0.31);text-align: center;">
                    <p style="color: #6a67ce;font-weight: 600;">Thanks & Regards, <br>Tappit Team</p>            
                </div>			
            </div>


        </div>
    </body>
</html>