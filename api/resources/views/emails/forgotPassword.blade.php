<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Reset Password</title>
    </head>
    <body>
        <div style="max-width:600px; font-family:arial; margin:20px auto; border:1px solid #ededed; font-size:14px;">
            <div style="background:#6A67CE; border-radius: 3px 3px 0 0;">
                <span style="color: #fff;font-size: 36px;padding: 12px 0px 5px;display: inline-block;text-align: center;width: 100%;">
                    <span style="vertical-align: middle;">{{ HTML::image('resources/assets/images/logo.png') }}</span>
                </span>
            </div>
            <div style="display: block;padding: 20px;text-align: left;font-size: 16px;color: #2e5075;background: #fff;border: 1px solid rgb(221,221,221);">
                <h1 style="font-size: 24px;font-weight: 400;color: rgb(27,36,50);">Dear {{$name}},</h1>
                <p style="color: rgb(103,109,118);font-size: 16px;margin: 20px 0 20px;line-height: 24px;">We have received a request to reset the password for your <strong style="color: #6a67ce; font-weight: bold">Tappit Account</strong>. 
                    To reset your <strong style="color: #6a67ce; font-weight: bold">password</strong>, click on the link below (or copy and paste the URL into your browser) :</p>
                <a style="color: #fff!important;background: #6A67CE;text-decoration: none; text-align:center;padding: 15px 0;display: inline-block;width: 231px;font-size: 16px;font-weight: 600;border-radius: 3px;" href="{{$link}}">Click Here</a>
                <p style="margin: 30px 0 0;">If you ignore this message, your password won't be changed</p>
                <div style="background: #fff;color: #606060;display: block;font-size: 12px;line-height: 18px;padding: 20px 0 0;text-align: center;">
                <p style="color: #6a67ce;font-weight: 600;">Thanks & Regards, <br>Tappit Team</p>            
            </div>
            </div>
            
        </div>
    </body>
</html>
