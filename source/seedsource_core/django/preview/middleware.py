from django.conf import settings
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.utils.timezone import now

PREVIEW_MODE = getattr(settings, "PREVIEW_MODE", False)
PREVIEW_PASSWORD = getattr(settings, "PREVIEW_PASSWORD", "")
PREVIEW_EXPIRES = getattr(settings, "PREVIEW_EXPIRES", None)
SEEDSOURCE_TITLE = getattr(settings, 'SEEDSOURCE_TITLE', 'Seedlot Selection Tool')


class PreviewAccessMiddleware(object):
    """
    When PREVIEW_MODE = True in settings, requires users to provide a site-level password before accessing any part
    of the site.
    """

    def process_request(self, request):
        expired = False
        if PREVIEW_EXPIRES:
            expired = now() >= PREVIEW_EXPIRES

        is_tile = request.path.startswith('/tiles/')

        if not PREVIEW_MODE or request.session.get('authorized_for_preview', False) or expired or is_tile:
            return
        elif request.POST.get("password") == PREVIEW_PASSWORD and PREVIEW_PASSWORD:
            request.session['authorized_for_preview'] = True
            return HttpResponseRedirect(request.path)
        else:
            response = render_to_response("preview_login.html", {'title': SEEDSOURCE_TITLE})
            response.status_code = 401
            return response
