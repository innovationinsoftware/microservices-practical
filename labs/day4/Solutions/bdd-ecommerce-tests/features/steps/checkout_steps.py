from behave import *

@given('that a customer is logged in')
def step_impl(context):
   context.logged_in = True

@given('has items in their cart')
def step_impl(context):
   context.cart_has_items = True


@when('the customer confirms the order')
def step_impl(context):
   if context.logged_in == True and context.cart_has_items == True:
    context.has_items_ok = True
   else:
    context.has_items_ok = False


@when('enters valid payment information')
def step_impl(context):
    context.valid_payment = True


@then('the order should be placed successfully')
def step_impl(context):
   assert context.has_items_ok == True
@then('the payment should be accepted')
def step_impl(context):
   assert context.valid_payment == True

@then('the order confirmation is shown to the user')
def step_impl(context):
   assert True == True
@then('an error message should be displayed indicating that the cart is empty')
def step_impl(context):
      assert context.has_items_ok == False

@when('enters an invalid credit card')
def step_impl(context):
    context.invalid_payment = True
    
@then('an error message should be displayed that the transaction can not be processed')
def step_impl(context):
   assert context.invalid_payment == True