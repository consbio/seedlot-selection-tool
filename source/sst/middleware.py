from urllib.parse import urlparse

from django.conf import settings
from django.utils import deprecation

IFRAME_WHITELIST_DOMAINS = getattr(settings, "IFRAME_WHITELIST_DOMAINS", [])


class AllowIframeMiddleware(deprecation.MiddlewareMixin):
    """Middleware that allows the site to be loaded in an iframe from whitelisted origins."""

    def process_response(self, request, response):
        """
        Check the referer against whitelisted domains.

        Note that if a page on a whitelisted domain is vulnerable to XSS, an attacker could conceivably force a
        redirect from the whitelisted domain to the target site, in which case the Referer header would show the
        whitelisted domain, not the page embedding the iframe.
        """

        referer = request.META.get('HTTP_REFERER')
        if referer:
            o = urlparse(referer)
            is_whitelisted = any(
                (
                    d
                    for d in IFRAME_WHITELIST_DOMAINS
                    if o.hostname and o.hostname.endswith(d)
                )
            )
            if is_whitelisted:
                response.xframe_options_exempt = True
                return response

        return response
