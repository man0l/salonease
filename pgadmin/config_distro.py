X_CONTENT_TYPE_OPTIONS = ""    # default value is nosniff
ENHANCED_COOKIE_PROTECTION = False
X_XSS_PROTECTION = "0"  # default value is '1; mode=block'
# Proxy-related settings
SECURE_PROXY_SSL_HEADER = ('X-Forwarded-Proto', 'https')
CSRF_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SECURE = True