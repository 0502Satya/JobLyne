from rest_framework.permissions import BasePermission

class IsCandidate(BasePermission):
    """
    Allows access only to authenticated users with account_type 'CANDIDATE'.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.account_type == 'CANDIDATE'
        )

class IsCompany(BasePermission):
    """
    Allows access only to authenticated users with account_type 'COMPANY'.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.account_type == 'COMPANY'
        )

class IsRecruiter(BasePermission):
    """
    Allows access only to authenticated users with account_type 'RECRUITER'.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.account_type == 'RECRUITER'
        )

class IsCorporate(BasePermission):
    """
    Allows access only to authenticated users with account_type 'COMPANY' or 'RECRUITER'.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.account_type in ['COMPANY', 'RECRUITER']
        )
