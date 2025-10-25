import 'package:flutter_dotenv/flutter_dotenv.dart';

class Env {
  static Future<void> init() async {
    await dotenv.load(fileName: ".env");
  }

  static String get apiBaseUrl => dotenv.env['API_BASE_URL'] ?? 'https://trusted-gamma.vercel.app/api/trpc';

  static String get betterAuthUrl => dotenv.env['BETTER_AUTH_URL'] ?? 'https://trusted-gamma.vercel.app/api/auth';

  static int get apiTimeoutSeconds => int.parse(dotenv.env['API_TIMEOUT_SECONDS'] ?? '10');

  static int get apiMaxRetries => int.parse(dotenv.env['API_MAX_RETRIES'] ?? '2');

  static String get environment => dotenv.env['ENVIRONMENT'] ?? 'development';

  static bool get useCertificatePinning => dotenv.env['USE_CERTIFICATE_PINNING'] == 'true';
}