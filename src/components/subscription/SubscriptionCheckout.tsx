import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription, PlanType } from '@/contexts/SubscriptionContext';
import { paymentService } from '@/services/PaymentService';
import { CreditCard } from 'lucide-react';

interface SubscriptionCheckoutProps {
  planType: PlanType;
  billingCycle: 'monthly' | 'annual';
  onSuccess?: () => void;
  onCancel?: () => void;
}

const SubscriptionCheckout = ({
  planType,
  billingCycle,
  onSuccess,
  onCancel
}: SubscriptionCheckoutProps): JSX.Element => {
  const { user } = useAuth();
  const { upgradePlan, getCurrentPlan } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'paypal'>('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: '',
    paypalEmail: ''
  });

  const currentPlan = getCurrentPlan();
  const selectedPlan = planType === 'free' ? 'free' : planType === 'pro' ? 'pro' : 'enterprise';

  // Calculate price based on billing cycle
  const getPrice = () => {
    const basePrice = planType === 'free' ? 0 : planType === 'pro' ? 15 : 99;
    if (billingCycle === 'annual') {
      return (basePrice * 0.8 * 12).toFixed(2); // 20% discount for annual
    }
    return basePrice.toFixed(2);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setFormData({ ...formData, [name]: formatted });
      return;
    }

    // Format expiry date
    if (name === 'cardExpiry') {
      const cleaned = value.replace(/\D/g, '');
      let formatted = cleaned;

      if (cleaned.length > 2) {
        formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
      }

      setFormData({ ...formData, [name]: formatted });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to continue with your purchase.',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent and payment intent  to payment gateway
      if (paymentMethod === 'credit_card') {
        toast({
          title: 'Preparing payment',
          description: 'You will be redirected to complete your payment.',
          variant: 'default'
        });

        try {
          // In a real implementation, this would call your backend API to create a payment intent
          // For now, we'll simulate the API call and redirect
          
          // Create a form to submit to Stripe Checkout
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = 'https://checkout.stripe.com/create-checkout-session';
          form.target = '_self'; // Changed to _self to redirect in the same window

          // Add necessary fields
          const fields = {
            'price_data[currency]': 'usd',
            'price_data[unit_amount]': Math.round(parseFloat(getPrice()) * 100), // Convert to cents
            'price_data[product_data][name]': `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan (${billingCycle})`,
            'line_items[0][quantity]': 1,
            'mode': 'subscription',
            'payment_method_types[]': 'card',
            'customer_email': user.email,
            'client_reference_id': user.email,
            'success_url': window.location.origin + '/profile?payment_success=true',
            'cancel_url': window.location.origin + '/profile?payment_canceled=true',
            'billing_address_collection': 'required',
            'allow_promotion_codes': 'true'
          };

          // Add fields to form
          Object.entries(fields).forEach(([key, value]) => {
            const hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.name = key;
            hiddenField.value = value.toString();
            form.appendChild(hiddenField);
          });

          // Add form to body and submit
          document.body.appendChild(form);
          form.submit();
          
          // Remove form after submission
          document.body.removeChild(form);
          
          // Show success message
          toast({
            title: 'Redirecting to payment page',
            description: 'Please complete your payment in the new window.',
            variant: 'default'
          });
          
          // We don't call upgradePlan here - it should be called after successful payment confirmation
          // This would typically be handled by a webhook from Stripe to your backend
          
          // For demo purposes, we'll simulate a successful payment after a delay
          setTimeout(() => {
            if (onSuccess) {
              onSuccess();
            } else {
              navigate('/profile');
            }
          }, 3000);
        } catch (error) {
          console.error('Error creating payment session:', error);
          toast({
            title: 'Payment error',
            description: 'There was an error setting up the payment. Please try again.',
            variant: 'destructive'
          });
        }
      } else if (paymentMethod === 'paypal') {
        toast({
          title: 'Preparing payment',
          description: 'You will be redirected to PayPal to complete your payment.',
          variant: 'default'
        });

        try {
          // Create a form to submit to PayPal
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = 'https://www.paypal.com/cgi-bin/webscr';
          form.target = '_self'; // Changed to _self to redirect in the same window

          // Add necessary fields
          const fields = {
            'cmd': '_xclick-subscriptions',
            'business': 'sb-43faib25951715@business.example.com', // PayPal sandbox business email
            'item_name': `ElMeet ${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan (${billingCycle})`,
            'currency_code': 'USD',
            'a3': getPrice(), // Regular subscription price
            'p3': billingCycle === 'monthly' ? '1' : '12', // Billing cycle (1 month or 12 months)
            't3': 'M', // M for months
            'src': '1', // Recurring payments
            'sra': '1', // Reattempt on failure
            'no_note': '1',
            'return': window.location.origin + '/profile?payment_success=true',
            'cancel_return': window.location.origin + '/profile?payment_canceled=true',
            'custom': user.email,
            'notify_url': window.location.origin + '/api/paypal-ipn'
          };

          // Add fields to form
          Object.entries(fields).forEach(([key, value]) => {
            const hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.name = key;
            hiddenField.value = value.toString();
            form.appendChild(hiddenField);
          });

          // Add form to body and submit
          document.body.appendChild(form);
          form.submit();
          
          // Remove form after submission
          document.body.removeChild(form);
          
          // Show success message
          toast({
            title: 'Redirecting to PayPal',
            description: 'Please complete your payment in the new window.',
            variant: 'default'
          });
          
          // For demo purposes, we'll simulate a successful payment after a delay
          setTimeout(() => {
            if (onSuccess) {
              onSuccess();
            } else {
              navigate('/profile');
            }
          }, 3000);
        } catch (error) {
          console.error('Error creating PayPal session:', error);
          toast({
            title: 'Payment error',
            description: 'There was an error setting up the payment. Please try again.',
            variant: 'destructive'
          });
        }
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Payment failed',
        description: error.message || 'There was an error processing your payment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/pricing');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Purchase</CardTitle>
        <CardDescription>
          {planType === 'free'
            ? 'Confirm your free plan'
            : `Subscribe to the ${planType.charAt(0).toUpperCase() + planType.slice(1)} plan`}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Order summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Order Summary</h3>
            <div className="flex justify-between mb-2">
              <span>{planType.charAt(0).toUpperCase() + planType.slice(1)} Plan</span>
              <span>${getPrice()}</span>
            </div>
            <div className="text-sm text-gray-500 mb-2">
              {billingCycle === 'monthly' ? 'Monthly billing' : 'Annual billing (20% discount)'}
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between font-medium">
              <span>Total</span>
              <span>${getPrice()}</span>
            </div>
          </div>

          {planType !== 'free' && (
            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="credit_card" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="credit_card"
                    onClick={() => setPaymentMethod('credit_card')}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Credit Card
                  </TabsTrigger>
                  <TabsTrigger
                    value="paypal"
                    onClick={() => setPaymentMethod('paypal')}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 6.082-8.558 6.082h-2.19a1.87 1.87 0 0 0-1.846 1.582l-1.187 7.527h5.47a.641.641 0 0 0 .633-.74l.44-2.78a.641.641 0 0 1 .633-.739h1.497c4.299 0 6.837-2.75 7.668-6.443.383-1.703.324-3.11-.912-4.202z" />
                    </svg>
                    PayPal
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="credit_card" className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      name="cardName"
                      placeholder="John Doe"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="4242 4242 4242 4242"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cardExpiry">Expiry Date</Label>
                      <Input
                        id="cardExpiry"
                        name="cardExpiry"
                        placeholder="MM/YY"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cardCvc">CVC</Label>
                      <Input
                        id="cardCvc"
                        name="cardCvc"
                        placeholder="123"
                        value={formData.cardCvc}
                        onChange={handleInputChange}
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="paypal" className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="paypalEmail">PayPal Email</Label>
                    <Input
                      id="paypalEmail"
                      name="paypalEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.paypalEmail}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    You will be redirected to PayPal to complete your payment securely.
                  </p>
                </TabsContent>
              </Tabs>
            </form>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleCancel} disabled={isProcessing}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isProcessing}>
          {isProcessing ? 'Processing...' : planType === 'free' ? 'Confirm' : 'Pay Now'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SubscriptionCheckout;