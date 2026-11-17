import 'package:flutter/foundation.dart';

abstract final class AppConfig {
  static const _apiFromEnv = String.fromEnvironment('API_URL');

  /// URL da API. Defina com `--dart-define=API_URL=https://api.seudominio.com`.
  /// Sem definição, usa o backend local (o emulador Android enxerga o host em 10.0.2.2).
  static String get apiUrl {
    if (_apiFromEnv.isNotEmpty) return _apiFromEnv;
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) return 'http://10.0.2.2:3333';
    return 'http://localhost:3333';
  }
}
