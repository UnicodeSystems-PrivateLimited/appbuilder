@extends('layouts.user')

@section('headcontents')
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
<link rel="stylesheet" href="https://images.cdnstabletransit.net/mobile/assets/styles/spreedly_express.css">
@stop

@section('title')
Payment
@stop

@section('content')
<div class="main-container">
<div class="header text-center">

<h4 class="text-capitalize title-desc" style="font-weight:600; padding-top:10px;">{{$desc}}</h4>
<h4 class="text-capitalize"><span style="border-bottom: 1px solid #ccc; padding: 2px;">Billing Address</span></h4>
</div>
<div class="payment-box layout-align-center-center layout-column">
<div>
<input type="hidden"  id="desc" value="{{$desc}}">
<input type="hidden"  id="total_price" value="{{$total_price}}">
</div>
<div  class="form-group col-xs-12">
      <label>Address1</label>
      <input type="text" name="billing_address1" id="billing_address1"  class="form-control" placeholder="Required">
</div>
<div  class="form-group col-xs-12">
      <label >Address2</label>
      <input type="text" name="billing_address2" id="billing_address2"  class="form-control" placeholder="Optional">
</div>
<div  class="form-group col-xs-12">
      <label >City</label>
      <input type="text" name="billing_city" id="billing_city"  class="form-control" placeholder="Required">
</div>
<div  class="form-group col-xs-12">
      <label >State</label>
      <input type="text" name="billing_state" id="billing_state"  class="form-control" placeholder="Required">
</div>
 <div  class="form-group col-xs-12">
      <label >Zip</label>
      <input type="text" name="billing_zip" id="billing_zip"  class="form-control" placeholder="Required">
 </div>
<div  class="form-group col-xs-12">
      <label >Country</label>
      <input type="text" name="billing_country" id="billing_country"  class="form-control" placeholder="Required" autocomplete="off">
</div>
<form id="payment-form" action="{{route('spreedly-success')}}">
      <input type="hidden" name="payment_method_token" id="payment_method_token">
    </form>
</div>
<div class="button-wrapper col-xs-12" style="margin: 8px 0px 10px;">
    <input type="button" id="next-button" class="btn btn-primary col-xs-12" value="Next" disabled="disable">
</div>

</div>
<script src="https://code.jquery.com/jquery-3.1.0.min.js"></script>
<script src="https://core.spreedly.com/iframe/express-2.min.js"></script>
<script src="https://images.cdnstabletransit.net/mobile/assets/scripts/jquery.autocomplete.js"></script>
<script src="{{ URL::asset('resources/assets/js/spreedly-handler.js') }}"></script>
 @yield('script')
@stop