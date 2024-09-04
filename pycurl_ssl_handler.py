# pycurl_ssl_handler.py
import pycurl
import certifi
from io import BytesIO

def fetch_url(url):
    c = pycurl.Curl()
    c.setopt(pycurl.URL, url)
    c.setopt(pycurl.CAINFO, certifi.where())
    response_buffer = BytesIO()
    c.setopt(pycurl.WRITEFUNCTION, response_buffer.write)

    try:
        c.perform()
        response_code = c.getinfo(pycurl.RESPONSE_CODE)
        response_body = response_buffer.getvalue().decode('utf-8')
        return response_code, response_body
    except pycurl.error as e:
        return None, str(e)
    finally:
        c.close()

if __name__ == "__main__":
    url = 'https://www.example.com/'
    code, body = fetch_url(url)
    if code:
        print(f"Response Code: {code}")
        print("Response Body:")
        print(body)
    else:
        print(f"Error: {body}")
