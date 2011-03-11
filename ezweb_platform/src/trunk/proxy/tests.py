import errno
from httplib import HTTPMessage
from StringIO import StringIO
import urllib2

from django.contrib.auth.models import User
from django.test import TestCase, Client

from proxy.views import EZWEB_PROXY


class FakeDownloader(object):

    def __init__(self):
        self.reset()

    def reset(self):
        self._responses = {}
        self._cookie_responses = {}
        self._exceptions = {}

    def set_response(self, url, response):
        self._responses[url] = (url, 200, response, 'OK')

    def set_cookie_response(self, url, headers):
        self._cookie_responses[url] = headers

    def set_exception(self, url, exception):
        self._exceptions[url] = exception

    def set_http_error(self, url, error_code=404, msg='Not Found', data=''):
        self._responses[url] = (url, error_code, data, msg)

    def set_url_error(self, url):
        self.set_exception(url, urllib2.URLError((errno.ECONNREFUSED,)))

    def build_response(self, url, code, data, msg, headers={}):
        response = urllib2.addinfourl(StringIO(data), headers, url)
        response.code = code
        response.msg = msg

        return response

    def __call__(self, opener, method, url, data, headers):

        if url in self._exceptions:
            raise self._exceptions[url]

        if url in self._cookie_responses:
            plain_headers = self._cookie_responses[url]
            headers_text = '\n'.join([header_name + ': ' + plain_headers[header_name] for header_name in plain_headers])
            response_headers = HTTPMessage(StringIO(headers_text))
            return self.build_response(url, 200, headers['Cookie'], 'OK', response_headers)

        elif url in self._responses:
            return self.build_response(*self._responses[url])
        else:
            return self.build_response(url, 404, '', 'Not Found')


class ProxyTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user('test', 'test@example.com', 'test')
        self._original_function = EZWEB_PROXY._do_request
        EZWEB_PROXY._do_request = FakeDownloader()

    def tearDown(self):
        EZWEB_PROXY._do_request = self._original_function

    def test_basic_proxy_requests(self):
        EZWEB_PROXY._do_request.set_response('http://example.com/path', 'data')

        client = Client()

        # Check authentication
        response = client.get('/proxy/http/example.com/path', HTTP_HOST='localhost', HTTP_REFERER='http://localhost')
        self.assertEquals(response.status_code, 403)

        client.login(username='test', password='test')

        # Basic GET request
        response = client.get('/proxy/http/example.com/path', HTTP_HOST='localhost', HTTP_REFERER='http://localhost')
        self.assertEquals(response.status_code, 200)
        self.assertEquals(response.content, 'data')

        # Basic POST request
        response = client.post('/proxy/http/example.com/path', {}, HTTP_HOST='localhost', HTTP_REFERER='http://localhost')
        self.assertEquals(response.status_code, 200)
        self.assertEquals(response.content, 'data')

        # Http Error 404
        response = client.get('/proxy/http/example.com/non_existing_file.html', HTTP_HOST='localhost', HTTP_REFERER='http://localhost')
        self.assertEquals(response.status_code, 404)
        self.assertEquals(response.content, '')

        # Simulating an error connecting to the server
        EZWEB_PROXY._do_request.set_url_error('http://example.com/path')
        response = client.get('/proxy/http/example.com/path', HTTP_HOST='localhost', HTTP_REFERER='http://localhost')
        self.assertEquals(response.status_code, 504)
        self.assertEquals(response.content, '')

    def test_cookies(self):

        client = Client()
        client.login(username='test', password='test')
        client.cookies['test'] = 'test'

        EZWEB_PROXY._do_request.reset()
        EZWEB_PROXY._do_request.set_cookie_response('http://example.com/path', {'Set-Cookie': 'newcookie=test; path=/'})
        response = client.get('/proxy/http/example.com/path', HTTP_HOST='localhost', HTTP_REFERER='http://localhost')
        self.assertEquals(response.status_code, 200)
        self.assertEquals(response.content, 'test=test')
        self.assertTrue('newcookie' in response.cookies)
        self.assertEquals(response.cookies['newcookie'].value, 'test')
        self.assertEquals(response.cookies['newcookie']['path'], '/proxy/http/example.com/')
