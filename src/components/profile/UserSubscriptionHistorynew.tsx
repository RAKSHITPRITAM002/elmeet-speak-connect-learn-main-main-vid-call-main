import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CreditCard, Download, Calendar, CheckCircle } from "lucide-react";

// Types
interface SubscriptionHistoryProps {
  onUpgrade: () => void;
}

interface Subscription {
  plan: "free" | "basic" | "pro" | "enterprise";
  status: "active" | "canceled" | "expired";
  startDate: Date;
  endDate?: Date;
  features: string[];
  price: number;
  billingCycle: "monthly" | "yearly";
  autoRenew: boolean;
}

interface PaymentHistory {
  id: string;
  date: Date;
  amount: number;
  method: "credit_card" | "paypal" | "bank_transfer";
  status: "completed" | "pending" | "failed";
  receiptUrl?: string;
}

const UserSubscriptionHistory: React.FC<SubscriptionHistoryProps> = ({ onUpgrade }) => {
  // In a real app, you would fetch this data from your API
  // For this example, we'll use mock data
  const subscription: Subscription = {
    plan: "pro",
    status: "active",
    startDate: new Date(Date.now() - 86400000 * 30), // 30 days ago
    endDate: new Date(Date.now() + 86400000 * 335), // 335 days from now
    features: [
      "Unlimited meetings",
      "Up to 100 participants",
      "Meeting duration up to 24 hours",
      "Cloud recording (50GB)",
      "Advanced language tools",
      "Custom virtual backgrounds",
      "Polls and quizzes",
      "Role play scenarios",
      "Multimedia player",
      "Priority support"
    ],
    price: 19.99,
    billingCycle: "monthly",
    autoRenew: true
  };

  const paymentHistory: PaymentHistory[] = [
    {
      id: "pay-1",
      date: new Date(Date.now() - 86400000 * 30), // 30 days ago
      amount: 19.99,
      method: "credit_card",
      status: "completed",
      receiptUrl: "#"
    },
    {
      id: "pay-2",
      date: new Date(Date.now() - 86400000 * 60), // 60 days ago
      amount: 19.99,
      method: "credit_card",
      status: "completed",
      receiptUrl: "#"
    },
    {
      id: "pay-3",
      date: new Date(Date.now() - 86400000 * 90), // 90 days ago
      amount: 19.99,
      method: "paypal",
      status: "completed",
      receiptUrl: "#"
    }
  ];

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Toggle auto-renew
  const handleAutoRenewToggle = () => {
    // In a real app, you would update this in your backend
    console.log("Auto-renew toggled");
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>Manage your subscription plan and billing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <Badge className={
                subscription.plan === "free" ? "bg-gray-500" :
                subscription.plan === "basic" ? "bg-blue-500" :
                subscription.plan === "pro" ? "bg-purple-500" :
                "bg-green-500"
              }>
                {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
              </Badge>
              <p className="mt-2 text-sm text-gray-500">
                {subscription.status === "active" ? "Active until" : "Expired on"} {subscription.endDate ? formatDate(subscription.endDate) : "N/A"}
              </p>
            </div>
            <Button onClick={onUpgrade}>Upgrade Plan</Button>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-2">Plan Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Price</p>
                <p className="text-2xl font-bold">${subscription.price}<span className="text-sm text-gray-500">/{subscription.billingCycle}</span></p>
              </div>
              <div>
                <p className="text-sm font-medium">Billing Cycle</p>
                <p>{subscription.billingCycle.charAt(0).toUpperCase() + subscription.billingCycle.slice(1)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Start Date</p>
                <p>{formatDate(subscription.startDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Next Billing Date</p>
                <p>{subscription.endDate ? formatDate(subscription.endDate) : "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Auto-Renew</h3>
                <p className="text-sm text-gray-500">Your subscription will automatically renew at the end of the billing cycle</p>
              </div>
              <Switch checked={subscription.autoRenew} onCheckedChange={handleAutoRenewToggle} />
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-2">Features Included</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {subscription.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View your past payments and download receipts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Date</th>
                  <th className="text-left py-3 px-2">Amount</th>
                  <th className="text-left py-3 px-2">Method</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-right py-3 px-2">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment) => (
                  <tr key={payment.id} className="border-b">
                    <td className="py-3 px-2">{formatDate(payment.date)}</td>
                    <td className="py-3 px-2">${payment.amount.toFixed(2)}</td>
                    <td className="py-3 px-2 capitalize">{payment.method.replace('_', ' ')}</td>
                    <td className="py-3 px-2">
                      <Badge variant={payment.status === "completed" ? "default" : payment.status === "pending" ? "outline" : "destructive"}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-right">
                      {payment.receiptUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-md">
            <div className="flex items-center">
              <CreditCard className="h-6 w-6 mr-4" />
              <div>
                <p className="font-medium">Visa ending in 4242</p>
                <p className="text-sm text-gray-500">Expires 12/2025</p>
              </div>
            </div>
            <Badge>Default</Badge>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline">Add Payment Method</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserSubscriptionHistory;