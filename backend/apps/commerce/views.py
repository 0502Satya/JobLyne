import uuid
from django.utils import timezone
from django.db import transaction
from rest_framework import status, viewsets, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.commerce.models import (
    Wallets, WalletTransactions, CreditTypes, CreditBalances,
    CreditTransactions, SubscriptionPlans, Subscriptions, SubscriptionUsage,
    Invoices
)
from apps.users.models import CustomUser
from apps.companies.models import Companies

# --- Serializers ---

class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransactions
        fields = ['id', 'transaction_type', 'amount', 'reference_type', 'reference_id', 'status', 'created_at']

class WalletSerializer(serializers.ModelSerializer):
    recent_transactions = serializers.SerializerMethodField()

    class Meta:
        model = Wallets
        fields = ['id', 'wallet_type', 'balance', 'currency', 'created_at', 'recent_transactions']

    def get_recent_transactions(self, obj):
        transactions = WalletTransactions.objects.filter(wallet=obj).order_by('-created_at')[:10]
        return WalletTransactionSerializer(transactions, many=True).data

class CreditBalanceSerializer(serializers.ModelSerializer):
    credit_type_name = serializers.CharField(source='credit_type.name', read_only=True)
    credit_type_description = serializers.CharField(source='credit_type.description', read_only=True)

    class Meta:
        model = CreditBalances
        fields = ['id', 'credit_type_name', 'credit_type_description', 'available_credits', 'reserved_credits', 'expires_at', 'updated_at']

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlans
        fields = ['id', 'name', 'role_type', 'billing_cycle', 'price', 'currency', 'features', 'is_active', 'created_at']

class SubscriptionUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionUsage
        fields = ['id', 'feature_key', 'used_count', 'limit_count', 'last_updated']

class SubscriptionSerializer(serializers.ModelSerializer):
    plan_details = SubscriptionPlanSerializer(source='plan', read_only=True)
    usage = serializers.SerializerMethodField()

    class Meta:
        model = Subscriptions
        fields = ['id', 'plan_details', 'start_date', 'end_date', 'auto_renew', 'status', 'created_at', 'usage']

    def get_usage(self, obj):
        usage_records = SubscriptionUsage.objects.filter(subscription=obj)
        return SubscriptionUsageSerializer(usage_records, many=True).data

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoices
        fields = ['id', 'invoice_number', 'tax_amount', 'total_amount', 'pdf_url', 'issued_at']

# --- Views ---

class WalletBalanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wallet, created = Wallets.objects.get_or_create(
            user=request.user,
            defaults={
                "wallet_type": "recruiter",
                "balance": 250.00,
                "currency": "USD"
            }
        )
        if created:
            WalletTransactions.objects.create(
                wallet=wallet,
                transaction_type="deposit",
                amount=250.00,
                reference_type="initial_seed",
                status="success"
            )

        serializer = WalletSerializer(wallet)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        amount_str = request.data.get("amount")
        if not amount_str:
            return Response({"error": "Deposit amount is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            amount = float(amount_str)
            if amount <= 0:
                raise ValueError()
        except ValueError:
            return Response({"error": "Invalid deposit amount. Must be a positive number."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            wallet, created = Wallets.objects.get_or_create(
                user=request.user,
                defaults={
                    "wallet_type": "recruiter",
                    "balance": 250.00,
                    "currency": "USD"
                }
            )
            # Lock the wallet row to prevent concurrent modifications
            wallet = Wallets.objects.select_for_update().get(pk=wallet.pk)

            if created:
                WalletTransactions.objects.create(
                    wallet=wallet,
                    transaction_type="deposit",
                    amount=250.00,
                    reference_type="initial_seed",
                    status="success"
                )

            wallet.balance = float(wallet.balance) + amount
            wallet.save()

            WalletTransactions.objects.create(
                wallet=wallet,
                transaction_type="deposit",
                amount=amount,
                reference_type="topup",
                status="success"
            )

        serializer = WalletSerializer(wallet)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CreditBalanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        credit_type, _ = CreditTypes.objects.get_or_create(
            name="Talent Sourcing Credit",
            defaults={"description": "Used to unlock candidate contact details", "is_active": True}
        )

        credit_balance, created = CreditBalances.objects.get_or_create(
            user=request.user,
            credit_type=credit_type,
            defaults={
                "available_credits": 5,
                "reserved_credits": 0
            }
        )

        if created:
            CreditTransactions.objects.create(
                user=request.user,
                credit_type=credit_type,
                transaction_type="initial_grant",
                amount=5,
                reference_type="signup"
            )

        serializer = CreditBalanceSerializer(credit_balance)
        return Response(serializer.data, status=status.HTTP_200_OK)

class SubscriptionViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        plans_to_seed = [
            {"name": "Standard", "price": 49.00, "features": {"cv_unlocks": 10, "job_postings": 5}},
            {"name": "Pro Headhunter", "price": 149.00, "features": {"cv_unlocks": 50, "job_postings": 15}},
            {"name": "Agency Elite", "price": 399.00, "features": {"cv_unlocks": 200, "job_postings": 50}},
        ]
        available_plans = SubscriptionPlans.objects.filter(is_active=True).order_by('price')
        if not available_plans.exists():
            for p in plans_to_seed:
                SubscriptionPlans.objects.get_or_create(
                    name=p["name"],
                    defaults={
                        "price": p["price"],
                        "features": p["features"],
                        "currency": "USD",
                        "billing_cycle": "monthly",
                        "role_type": "recruiter",
                        "is_active": True
                    }
                )
            available_plans = SubscriptionPlans.objects.filter(is_active=True).order_by('price')

        active_sub = Subscriptions.objects.filter(user=request.user, status="active").first()
        invoices = Invoices.objects.filter(user=request.user).order_by('-issued_at')[:10]

        response_data = {
            "plans": SubscriptionPlanSerializer(available_plans, many=True).data,
            "active_subscription": SubscriptionSerializer(active_sub).data if active_sub else None,
            "invoices": InvoiceSerializer(invoices, many=True).data
        }
        return Response(response_data, status=status.HTTP_200_OK)

    def create(self, request):
        plan_id = request.data.get("plan_id")
        if not plan_id:
            return Response({"error": "Subscription plan_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            plan = SubscriptionPlans.objects.get(id=plan_id, is_active=True)
        except (SubscriptionPlans.DoesNotExist, ValidationError):
            return Response({"error": "Selected subscription plan does not exist or is inactive."}, status=status.HTTP_404_NOT_FOUND)

        wallet, _ = Wallets.objects.get_or_create(
            user=request.user,
            defaults={
                "wallet_type": "recruiter",
                "balance": 250.00,
                "currency": "USD"
            }
        )

        with transaction.atomic():
            # Lock the wallet row to prevent concurrent modifications
            wallet = Wallets.objects.select_for_update().get(pk=wallet.pk)

            if float(wallet.balance) < float(plan.price):
                raise ValidationError(detail={"error": f"Insufficient wallet balance. You need ${plan.price:.2f} but only have ${wallet.balance:.2f}."})

            wallet.balance = float(wallet.balance) - float(plan.price)
            wallet.save()

            WalletTransactions.objects.create(
                wallet=wallet,
                transaction_type="subscription_payment",
                amount=float(plan.price),
                reference_type="subscription",
                reference_id=plan.id,
                status="success"
            )

            Subscriptions.objects.filter(user=request.user, status="active").update(status="cancelled")

            sub_end = timezone.now() + timezone.timedelta(days=30)
            subscription = Subscriptions.objects.create(
                user=request.user,
                plan=plan,
                start_date=timezone.now(),
                end_date=sub_end,
                auto_renew=True,
                status="active"
            )

            features = plan.features or {}
            for feature_key, limit in features.items():
                SubscriptionUsage.objects.create(
                    subscription=subscription,
                    feature_key=feature_key,
                    used_count=0,
                    limit_count=limit,
                    last_updated=timezone.now()
                )

            cv_unlocks_limit = features.get("cv_unlocks", 10)
            credit_type, _ = CreditTypes.objects.get_or_create(
                name="Talent Sourcing Credit",
                defaults={"description": "Used to unlock candidate contact details", "is_active": True}
            )

            credit_balance, created = CreditBalances.objects.get_or_create(
                user=request.user,
                credit_type=credit_type,
                defaults={"available_credits": 5, "reserved_credits": 0}
            )
            if created:
                CreditTransactions.objects.create(
                    user=request.user,
                    credit_type=credit_type,
                    transaction_type="initial_grant",
                    amount=5,
                    reference_type="signup"
                )

            credit_balance.available_credits = (credit_balance.available_credits or 0) + cv_unlocks_limit
            credit_balance.save()

            CreditTransactions.objects.create(
                user=request.user,
                credit_type=credit_type,
                transaction_type="purchase",
                amount=cv_unlocks_limit,
                reference_type="subscription",
                reference_id=subscription.id
            )

            invoice_num = f"INV-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
            invoice = Invoices.objects.create(
                user=request.user,
                invoice_number=invoice_num,
                tax_amount=0.00,
                total_amount=plan.price,
                pdf_url=f"/invoices/{uuid.uuid4()}.pdf",
                issued_at=timezone.now()
            )

        return Response(SubscriptionSerializer(subscription).data, status=status.HTTP_201_CREATED)
