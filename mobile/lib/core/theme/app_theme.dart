import 'package:google_fonts/google_fonts.dart';
import 'package:material_ui/material_ui.dart';

import 'app_colors.dart';

abstract final class AppTheme {
  static const radius = 20.0;

  static ThemeData light() => _build(
    Brightness.light,
    ColorScheme.fromSeed(seedColor: AppColors.indigo600).copyWith(
      primary: AppColors.indigo600,
      onPrimary: Colors.white,
      primaryContainer: AppColors.indigo100,
      onPrimaryContainer: AppColors.indigo950,
      secondary: AppColors.amber,
      onSecondary: AppColors.indigo950,
      secondaryContainer: AppColors.amberSoft,
      onSecondaryContainer: const Color(0xFF5C3A00),
      tertiary: AppColors.success,
      error: AppColors.danger,
      surface: Colors.white,
      onSurface: AppColors.indigo950,
      onSurfaceVariant: const Color(0xFF6B6F86),
      surfaceContainerLowest: Colors.white,
      surfaceContainerLow: const Color(0xFFF9FAFE),
      surfaceContainer: AppColors.canvasLight,
      surfaceContainerHigh: const Color(0xFFECEEF7),
      surfaceContainerHighest: const Color(0xFFE4E6F2),
      outline: const Color(0xFFB9BCD0),
      outlineVariant: AppColors.outlineLight,
    ),
    AppColors.canvasLight,
  );

  static ThemeData dark() => _build(
    Brightness.dark,
    ColorScheme.fromSeed(seedColor: AppColors.indigo600, brightness: Brightness.dark).copyWith(
      primary: AppColors.indigo400,
      onPrimary: AppColors.indigo950,
      primaryContainer: AppColors.indigo700,
      onPrimaryContainer: AppColors.indigo50,
      secondary: AppColors.amber,
      onSecondary: AppColors.indigo950,
      secondaryContainer: const Color(0xFF4A3410),
      onSecondaryContainer: AppColors.amberSoft,
      tertiary: AppColors.success,
      error: const Color(0xFFF87171),
      surface: AppColors.surfaceDark,
      onSurface: const Color(0xFFF1F0FF),
      onSurfaceVariant: const Color(0xFFA6A3D1),
      surfaceContainerLowest: AppColors.canvasDark,
      surfaceContainerLow: const Color(0xFF14123A),
      surfaceContainer: AppColors.canvasDark,
      surfaceContainerHigh: AppColors.surfaceDarkHigh,
      surfaceContainerHighest: const Color(0xFF2A2763),
      outline: const Color(0xFF4A4790),
      outlineVariant: AppColors.outlineDark,
    ),
    AppColors.canvasDark,
  );

  static ThemeData _build(Brightness brightness, ColorScheme scheme, Color canvas) {
    final base = ThemeData(brightness: brightness, colorScheme: scheme, useMaterial3: true);
    final text = _scale(
      GoogleFonts.plusJakartaSansTextTheme(base.textTheme)
          .apply(bodyColor: scheme.onSurface, displayColor: scheme.onSurface),
      0.9,
    );
    final shape = RoundedRectangleBorder(borderRadius: BorderRadius.circular(14));

    return base.copyWith(
      scaffoldBackgroundColor: canvas,
      textTheme: text.copyWith(
        headlineMedium: text.headlineMedium?.copyWith(fontWeight: FontWeight.w700, letterSpacing: -0.5),
        headlineSmall: text.headlineSmall?.copyWith(fontWeight: FontWeight.w700, letterSpacing: -0.3),
        titleLarge: text.titleLarge?.copyWith(fontWeight: FontWeight.w700),
        titleMedium: text.titleMedium?.copyWith(fontWeight: FontWeight.w600),
        labelLarge: text.labelLarge?.copyWith(fontWeight: FontWeight.w600),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: canvas,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        foregroundColor: scheme.onSurface,
        titleTextStyle: text.titleLarge?.copyWith(fontWeight: FontWeight.w700),
      ),
      cardTheme: CardThemeData(
        color: scheme.surface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radius),
          side: BorderSide(color: scheme.outlineVariant.withValues(alpha: 0.6)),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(0, 42),
          padding: const EdgeInsets.symmetric(horizontal: 18),
          shape: shape,
          textStyle: text.labelLarge?.copyWith(fontWeight: FontWeight.w700, fontSize: 13),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size(0, 42),
          padding: const EdgeInsets.symmetric(horizontal: 18),
          shape: shape,
          side: BorderSide(color: scheme.outlineVariant),
          textStyle: text.labelLarge?.copyWith(fontWeight: FontWeight.w700, fontSize: 13),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(shape: shape, textStyle: text.labelLarge),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: brightness == Brightness.light ? Colors.white : AppColors.surfaceDarkHigh,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: scheme.outlineVariant),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: scheme.outlineVariant),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: scheme.primary, width: 1.6),
        ),
      ),
      chipTheme: base.chipTheme.copyWith(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        side: BorderSide(color: scheme.outlineVariant),
        labelStyle: text.labelMedium?.copyWith(fontWeight: FontWeight.w600),
      ),
      segmentedButtonTheme: SegmentedButtonThemeData(
        style: SegmentedButton.styleFrom(
          shape: shape,
          selectedBackgroundColor: scheme.primary,
          selectedForegroundColor: scheme.onPrimary,
          side: BorderSide(color: scheme.outlineVariant),
        ),
      ),
      dividerTheme: DividerThemeData(color: scheme.outlineVariant, thickness: 1, space: 1),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: scheme.surface,
        surfaceTintColor: Colors.transparent,
        showDragHandle: true,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
      ),
      drawerTheme: DrawerThemeData(
        backgroundColor: scheme.surface,
        surfaceTintColor: Colors.transparent,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.horizontal(right: Radius.circular(28))),
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.indigo950,
        contentTextStyle: text.bodyMedium?.copyWith(color: Colors.white),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: scheme.primary,
        foregroundColor: scheme.onPrimary,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      ),
    );
  }

  static TextTheme _scale(TextTheme theme, double factor) {
    TextStyle? shrink(TextStyle? style) {
      final size = style?.fontSize;
      if (style == null || size == null) return style;
      return style.copyWith(fontSize: size * factor);
    }

    return theme.copyWith(
      displayLarge: shrink(theme.displayLarge),
      displayMedium: shrink(theme.displayMedium),
      displaySmall: shrink(theme.displaySmall),
      headlineLarge: shrink(theme.headlineLarge),
      headlineMedium: shrink(theme.headlineMedium),
      headlineSmall: shrink(theme.headlineSmall),
      titleLarge: shrink(theme.titleLarge),
      titleMedium: shrink(theme.titleMedium),
      titleSmall: shrink(theme.titleSmall),
      bodyLarge: shrink(theme.bodyLarge),
      bodyMedium: shrink(theme.bodyMedium),
      bodySmall: shrink(theme.bodySmall),
      labelLarge: shrink(theme.labelLarge),
      labelMedium: shrink(theme.labelMedium),
      labelSmall: shrink(theme.labelSmall),
    );
  }
}
