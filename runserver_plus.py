from django.core.management.commands.runserver import Command as runserver
from django.conf import settings
import ssl

class Command(runserver):
    def add_arguments(self, parser):
        super().add_arguments(parser)
        parser.add_argument('--cert', dest='cert', type=str, help='SSL certificate file')
        parser.add_argument('--key', dest='key', type=str, help='SSL key file')

    def handle(self, *args, **options):
        cert = options['cert']
        key = options['key']
        if cert and key:
            self.stdout.write(self.style.SUCCESS(
                f"Starting development server at https://{self.addr}:{self.port}/"))
            self.stdout.write(self.style.SUCCESS(
                f"Using SSL certificate: {cert}"))
            self.stdout.write(self.style.SUCCESS(
                f"Using SSL key: {key}"))
            # Use SSL context if cert and key are provided
            self.run(
                lambda: self.server(
                    (self.addr, int(self.port)), self.get_handler(), ssl_context=(
                        ssl.create_default_context(
                            purpose=ssl.Purpose.CLIENT_AUTH,
                            cafile=cert
                        ),
                        ssl.create_default_context(
                            purpose=ssl.Purpose.CLIENT_AUTH,
                            cafile=key
                        )
                    )
                )
            )
        else:
            super().handle(*args, **options)
