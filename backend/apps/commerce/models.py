import uuid
from django.db import models

class Products(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    product_type = models.CharField(max_length=255, null=True, blank=True)
    role_type = models.CharField(max_length=255, null=True, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=255, null=True, blank=True)
    billing_cycle = models.CharField(max_length=255, null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'products'

class Orders(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='orders_user')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'orders'

class OrderItems(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey('Orders', on_delete=models.CASCADE, null=True, blank=True, related_name='order_items_order')
    product = models.ForeignKey('Products', on_delete=models.CASCADE, null=True, blank=True, related_name='order_items_product')
    quantity = models.IntegerField(null=True, blank=True)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    total_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    reference_entity_type = models.CharField(max_length=255, null=True, blank=True)
    reference_entity_id = models.UUIDField(null=True, blank=True)

    class Meta:
        db_table = 'order_items'

class SubscriptionPlans(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, null=True, blank=True)
    role_type = models.CharField(max_length=255, null=True, blank=True)
    billing_cycle = models.CharField(max_length=255, null=True, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=255, null=True, blank=True)
    features = models.JSONField(null=True, blank=True)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'subscription_plans'

class Subscriptions(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='subscriptions_user')
    plan = models.ForeignKey('SubscriptionPlans', on_delete=models.CASCADE, null=True, blank=True, related_name='subscriptions_plan')
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    auto_renew = models.BooleanField(default=False)
    status = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'subscriptions'

class SubscriptionUsage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subscription = models.ForeignKey('Subscriptions', on_delete=models.CASCADE, null=True, blank=True, related_name='subscription_usage_subscription')
    feature_key = models.CharField(max_length=255, null=True, blank=True)
    used_count = models.IntegerField(null=True, blank=True)
    limit_count = models.IntegerField(null=True, blank=True)
    last_updated = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'subscription_usage'

class Payments(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey('Orders', on_delete=models.CASCADE, null=True, blank=True, related_name='payments_order')
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='payments_user')
    amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=255, null=True, blank=True)
    payment_method = models.CharField(max_length=255, null=True, blank=True)
    gateway_transaction_id = models.CharField(max_length=255, null=True, blank=True)
    idempotency_key = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=255, null=True, blank=True)
    gateway_response = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'payments'

class PaymentWebhookLogs(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    gateway_name = models.CharField(max_length=255, null=True, blank=True)
    event_type = models.CharField(max_length=255, null=True, blank=True)
    payload = models.JSONField(null=True, blank=True)
    processed = models.BooleanField(default=False)
    received_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'payment_webhook_logs'

class Invoices(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey('Orders', on_delete=models.CASCADE, null=True, blank=True, related_name='invoices_order')
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='invoices_user')
    invoice_number = models.CharField(max_length=255, null=True, blank=True)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    pdf_url = models.TextField(null=True, blank=True)
    issued_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'invoices'

class Refunds(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment = models.ForeignKey('Payments', on_delete=models.CASCADE, null=True, blank=True, related_name='refunds_payment')
    amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    reason = models.TextField(null=True, blank=True)
    refund_status = models.CharField(max_length=255, null=True, blank=True)
    gateway_refund_id = models.CharField(max_length=255, null=True, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'refunds'

class RevenueDistributions(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_item = models.ForeignKey('OrderItems', on_delete=models.CASCADE, null=True, blank=True, related_name='revenue_distributions_order_item')
    beneficiary_type = models.CharField(max_length=255, null=True, blank=True)
    beneficiary_id = models.UUIDField(null=True, blank=True)
    gross_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    commission_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'revenue_distributions'

class Wallets(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField('users.CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='wallets_user')
    wallet_type = models.CharField(max_length=255, null=True, blank=True)
    balance = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'wallets'

class WalletTransactions(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey('Wallets', on_delete=models.CASCADE, null=True, blank=True, related_name='wallet_transactions_wallet')
    transaction_type = models.CharField(max_length=255, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    reference_type = models.CharField(max_length=255, null=True, blank=True)
    reference_id = models.UUIDField(null=True, blank=True)
    status = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'wallet_transactions'

class CreditTypes(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=False)

    class Meta:
        db_table = 'credit_types'

class CreditBalances(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='credit_balances_user')
    credit_type = models.ForeignKey('CreditTypes', on_delete=models.CASCADE, null=True, blank=True, related_name='credit_balances_credit_type')
    available_credits = models.IntegerField(null=True, blank=True)
    reserved_credits = models.IntegerField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        db_table = 'credit_balances'
        unique_together = [['user', 'credit_type']]

class CreditTransactions(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='credit_transactions_user')
    credit_type = models.ForeignKey('CreditTypes', on_delete=models.CASCADE, null=True, blank=True, related_name='credit_transactions_credit_type')
    transaction_type = models.CharField(max_length=255, null=True, blank=True)
    amount = models.IntegerField(null=True, blank=True)
    reference_type = models.CharField(max_length=255, null=True, blank=True)
    reference_id = models.UUIDField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'credit_transactions'

class CreditPackages(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey('Products', on_delete=models.CASCADE, null=True, blank=True, related_name='credit_packages_product')
    credit_type = models.ForeignKey('CreditTypes', on_delete=models.CASCADE, null=True, blank=True, related_name='credit_packages_credit_type')
    credit_amount = models.IntegerField(null=True, blank=True)
    validity_days = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'credit_packages'

class CreditReservations(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='credit_reservations_user')
    credit_type = models.ForeignKey('CreditTypes', on_delete=models.CASCADE, null=True, blank=True, related_name='credit_reservations_credit_type')
    reserved_amount = models.IntegerField(null=True, blank=True)
    reference_type = models.CharField(max_length=255, null=True, blank=True)
    reference_id = models.UUIDField(null=True, blank=True)
    status = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = 'credit_reservations'


