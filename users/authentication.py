from django.conf import settings
from rest_framework import exceptions
from rest_framework.authentication import CSRFCheck
from rest_framework_simplejwt.authentication import JWTAuthentication

SAFE_METHODS = ('GET', 'HEAD', 'OPTIONS')


def enforce_csrf(request):
    if request.method in SAFE_METHODS:
        return
    check = CSRFCheck(get_response=lambda req: None)
    check.process_request(request)
    reason = check.process_view(request, None, (), {})
    if reason:
        print(f"CSRF Failed! Reason: {reason}")
        print(f"Headers: {request.META.get('HTTP_X_CSRFTOKEN')}")
        print(f"Cookies: {request.COOKIES.get('csrftoken')}")
        raise exceptions.PermissionDenied('CSRF Failed: %s' % reason)

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)
        
        if header is None:
            raw_token = request.COOKIES.get(getattr(settings, 'JWT_AUTH_COOKIE', 'access'))
        else:
            raw_token = self.get_raw_token(header)
            
        if raw_token is None:
            return None
            
        validated_token = self.get_validated_token(raw_token)
        enforce_csrf(request)
        return self.get_user(validated_token), validated_token
