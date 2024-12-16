
**Lab 3: BDD and End-to-End Testing (Python)**

*   **Title:** Lab 3: BDD and End-to-End Testing (Python)
*   **Objective:** Combine BDD with a real application, to write and execute more realistic end-to-end tests using Python Behave.
*   **Concepts Introduced:**
   *  **Behavior Driven Development**: Writing test descriptions using Gherkin syntax.
   *  **End to End Testing**: Test the entire flow and integration of the system.
   *  **Automated Testing**: Run BDD tests from command line.
*   **Description:** You will create a more realistic system by implementing an end-to-end test for a checkout process in an e-commerce site, and then use BDD to implement tests in Behave framework.
*   **Steps:**
   1.  **Create Project Directory:** Open a terminal or command prompt.
      *  Create a new directory: `mkdir bdd-ecommerce-tests && cd bdd-ecommerce-tests`
   2.  **Install Behave:** Run `pip3 install behave`.
   3.  **Create the `features` directory:** Create a subdirectory called `features` by running `mkdir features`
1. **Create `features/checkout.feature`**: Create a file called `features/checkout.feature` and paste the following code:
      ```gherkin
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
      ```
      *   **Explanation:** These test scenarios describe a real world shopping cart check-out procedure.
   1.  **Create `features/steps` directory:** Run `mkdir features/steps`.
   2.  **Create `features/steps/checkout_steps.py`:** Create a file named `features/steps/checkout_steps.py` and paste the following content. The implementation of each scenario step is shown below
      ```python
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
      ```
   * **Explanation**: This implementation is purely for demonstrating the use of the Gherkin syntax, and is limited in its capabilities, but it does provide a testable example.
   7. **Run the Tests:**  From the root folder `bdd-ecommerce-tests`, run `behave` from the command line to run the BDD tests. Behave will parse the feature file and run the steps in the python implementation.
   8. Fix the errors and run the tests again

---
