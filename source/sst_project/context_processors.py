from django.conf import settings

GOOGLE_ANALYTICS_ID = getattr(settings, 'GOOGLE_ANALYTICS_ID', None)
ENABLE_GOOGLE_ANALYTICS = getattr(settings, 'ENABLE_GOOGLE_ANALYTICS', False)


def google_analytics(request):
    return {
        'ga_id': GOOGLE_ANALYTICS_ID,
        'enable_ga': ENABLE_GOOGLE_ANALYTICS
    }
