from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WalletBalanceView, CreditBalanceView, SubscriptionViewSet

router = DefaultRouter()
router.register(r'commerce/subscriptions', SubscriptionViewSet, basename='commerce-subscription')

urlpatterns = [
    path('commerce/wallet/', WalletBalanceView.as_view(), name='commerce_wallet'),
    path('commerce/credits/', CreditBalanceView.as_view(), name='commerce_credits'),
    path('', include(router.urls)),
]
