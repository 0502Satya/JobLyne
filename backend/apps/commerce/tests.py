from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient

from apps.users.models import CustomUser
from apps.commerce.models import (
    Wallets, WalletTransactions, CreditTypes, CreditBalances,
    CreditTransactions, SubscriptionPlans, Subscriptions, SubscriptionUsage, Invoices
)

User = get_user_model()

class JobLyneCommerceTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="recruiter_billing_test@example.com",
            password="Password123",
            account_type="RECRUITER",
            is_verified=True
        )

    def test_wallet_balance_get_auto_seed(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('commerce_wallet')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(float(response.data["balance"]), 250.00)
        self.assertEqual(response.data["currency"], "USD")
        self.assertEqual(len(response.data["recent_transactions"]), 1)
        self.assertEqual(response.data["recent_transactions"][0]["reference_type"], "initial_seed")

    def test_wallet_deposit(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('commerce_wallet')
        response = self.client.post(url, {"amount": "100.50"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(float(response.data["balance"]), 350.50)
        self.assertEqual(len(response.data["recent_transactions"]), 2)
        self.assertEqual(response.data["recent_transactions"][0]["reference_type"], "topup")
        self.assertEqual(float(response.data["recent_transactions"][0]["amount"]), 100.50)

    def test_wallet_deposit_invalid(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('commerce_wallet')
        response = self.client.post(url, {"amount": "-50.00"})
        self.assertEqual(response.status_code, 400)
        response_bad = self.client.post(url, {"amount": "not_a_number"})
        self.assertEqual(response_bad.status_code, 400)

    def test_credit_balance_get_auto_seed(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('commerce_credits')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["credit_type_name"], "Talent Sourcing Credit")
        self.assertEqual(response.data["available_credits"], 5)
        self.assertEqual(response.data["reserved_credits"], 0)

    def test_subscription_plans_list(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('commerce-subscription-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn("plans", response.data)
        self.assertIn("active_subscription", response.data)
        self.assertIn("invoices", response.data)
        self.assertEqual(len(response.data["plans"]), 3)
        self.assertIsNone(response.data["active_subscription"])

    def test_subscription_purchase_success(self):
        self.client.force_authenticate(user=self.user)
        
        # First query standard plans to retrieve plan IDs
        list_url = reverse('commerce-subscription-list')
        list_resp = self.client.get(list_url)
        standard_plan = next(p for p in list_resp.data["plans"] if p["name"] == "Pro Headhunter")
        
        purchase_url = reverse('commerce-subscription-list')
        response = self.client.post(purchase_url, {"plan_id": standard_plan["id"]})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], "active")
        self.assertEqual(response.data["plan_details"]["name"], "Pro Headhunter")
        
        # Verify wallet balance was deducted
        wallet = Wallets.objects.get(user=self.user)
        self.assertEqual(float(wallet.balance), 250.00 - 149.00) # Pro costs $149
        
        # Verify credits were granted (initial 5 + Pro grant of 50 = 55)
        credit = CreditBalances.objects.get(user=self.user)
        self.assertEqual(credit.available_credits, 55)
        
        # Verify subscription usage limits created
        usages = SubscriptionUsage.objects.filter(subscription_id=response.data["id"])
        self.assertTrue(usages.filter(feature_key="cv_unlocks").exists())
        self.assertEqual(usages.get(feature_key="cv_unlocks").limit_count, 50)

    def test_subscription_purchase_insufficient_funds(self):
        self.client.force_authenticate(user=self.user)
        
        list_url = reverse('commerce-subscription-list')
        list_resp = self.client.get(list_url)
        elite_plan = next(p for p in list_resp.data["plans"] if p["name"] == "Agency Elite") # Costs $399
        
        purchase_url = reverse('commerce-subscription-list')
        response = self.client.post(purchase_url, {"plan_id": elite_plan["id"]})
        self.assertEqual(response.status_code, 400)
        self.assertIn("Insufficient wallet balance", response.data["error"])
        
        # Wallet and subscription statuses unchanged
        wallet = Wallets.objects.get(user=self.user)
        self.assertEqual(float(wallet.balance), 250.00)
        self.assertEqual(Subscriptions.objects.filter(user=self.user, status="active").count(), 0)
