Feature: Checkout Process
Background:
   Given that a customer is logged in
      And has items in their cart

   Scenario: Successful checkout with valid payment
      When the customer confirms the order
      And enters valid payment information
      Then the order should be placed successfully
      And the payment should be accepted
      And the order confirmation is shown to the user
   Scenario: Checkout with no items
      When the customer confirms the order
         Then an error message should be displayed indicating that the cart is empty
   Scenario: Checkout with insufficient funds
      When the customer confirms the order
         And enters an invalid credit card
         Then an error message should be displayed that the transaction can not be processed