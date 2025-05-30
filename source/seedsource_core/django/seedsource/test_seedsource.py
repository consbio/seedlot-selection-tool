from django.contrib.auth import get_user_model
from django.core.urlresolvers import reverse
from django.test import Client
from django.test import TestCase


class ToolViewTestCase(TestCase):
    def setUp(self):
        get_user_model().objects.create(username='test@example.com')

    def tearDown(self):
        get_user_model().objects.all().delete()

    def test_view(self):
        c = Client()
        response = c.get(reverse('tool_page'))
        self.assertEqual(response.status_code, 200)
