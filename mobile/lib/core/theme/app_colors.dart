import 'package:material_ui/material_ui.dart';

/// Paleta PetCare: índigo profundo (marca) + âmbar do logotipo, com variantes tonais.
abstract final class AppColors {
  // Índigo — base da marca
  static const indigo950 = Color(0xFF1E1B4B);
  static const indigo900 = Color(0xFF312E81);
  static const indigo700 = Color(0xFF4338CA);
  static const indigo600 = Color(0xFF4F46E5);
  static const indigo400 = Color(0xFF818CF8);
  static const indigo200 = Color(0xFFC7D2FE);
  static const indigo100 = Color(0xFFE0E7FF);
  static const indigo50 = Color(0xFFEEF2FF);

  // Âmbar — cor do logotipo e destaques
  static const amber = Color(0xFFFBA31F);
  static const amberDeep = Color(0xFFF97316);
  static const amberSoft = Color(0xFFFFF1DB);

  // Superfícies
  static const canvasLight = Color(0xFFF4F5FB);
  static const outlineLight = Color(0xFFE6E8F2);
  static const canvasDark = Color(0xFF0E0C29);
  static const surfaceDark = Color(0xFF181640);
  static const surfaceDarkHigh = Color(0xFF221F55);
  static const outlineDark = Color(0xFF2E2B66);

  // Semânticas
  static const success = Color(0xFF10B981);
  static const successSoft = Color(0xFFD1FAE5);
  static const danger = Color(0xFFEF4444);
  static const dangerSoft = Color(0xFFFEE2E2);
  static const warning = Color(0xFFEAB308);
  static const info = Color(0xFF3B82F6);
  static const violet = Color(0xFF8B5CF6);
  static const sky = Color(0xFF0EA5E9);
  static const rose = Color(0xFFF472B6);

  /// Sequência usada em gráficos de categorias (donut, legendas).
  static const chart = [indigo600, amber, success, sky, rose, violet];
}
