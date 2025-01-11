# Disable security headers temporarily to troubleshoot CSRF issues
X_CONTENT_TYPE_OPTIONS = ""
ENHANCED_COOKIE_PROTECTION = False
X_XSS_PROTECTION = "0"

# Proxy-related settings
SECURE_PROXY_SSL_HEADER = ('X-Forwarded-Proto', 'https')

# Cookie settings for CSRF
CSRF_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SECURE = True

# Additional CSRF settings
WTF_CSRF_CHECK_DEFAULT = False        # Disable CSRF check temporarily
WTF_CSRF_ENABLED = False             # Disable CSRF protection temporarily
CSRF_TOKEN_VALID_DAYS = 1            # Extend token validity
