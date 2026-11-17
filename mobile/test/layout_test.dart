import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:material_ui/material_ui.dart';
import 'package:petcare/app.dart';
import 'package:petcare/features/home/home_screen.dart';
import 'package:petcare/features/shell/dashboard_shell.dart';
import 'package:petcare/features/shell/nav_items.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUpAll(() async {
    GoogleFonts.config.allowRuntimeFetching = false;
    await initializeDateFormatting('pt_BR');
  });

  const sizes = {'celular': Size(390, 844), 'tablet': Size(820, 1180), 'desktop': Size(1440, 900)};

  for (final MapEntry(key: name, value: size) in sizes.entries) {
    testWidgets('home pública sem overflow ($name)', (tester) async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      tester.view.physicalSize = size;
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.reset);

      await tester.pumpWidget(PetcareApp(prefs: prefs));
      await tester.pump(const Duration(seconds: 1));
      expect(find.byType(HomeScreen), findsOneWidget);

      await tester.drag(find.byType(SingleChildScrollView).first, const Offset(0, -3000));
      await tester.pump(const Duration(seconds: 1));
    });

    testWidgets('todas as seções do menu sem overflow ($name)', (tester) async {
      SharedPreferences.setMockInitialValues({'session.demo': true});
      final prefs = await SharedPreferences.getInstance();
      tester.view.physicalSize = size;
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.reset);

      await tester.pumpWidget(PetcareApp(prefs: prefs));
      await tester.pump(const Duration(seconds: 1));

      for (final item in allNavItems) {
        GoRouter.of(tester.element(find.byType(DashboardShell))).go(item.path);
        await tester.pump();
        await tester.pump(const Duration(seconds: 1));
        await tester.pump(const Duration(seconds: 1));
        expect(find.byType(DashboardShell), findsOneWidget, reason: item.path);
      }
    });
  }
}
