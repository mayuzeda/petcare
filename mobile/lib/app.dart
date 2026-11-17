import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/router.dart';
import 'core/theme/app_theme.dart';
import 'state/pets_controller.dart';
import 'state/session_controller.dart';
import 'state/theme_controller.dart';

class PetcareApp extends StatefulWidget {
  const PetcareApp({super.key, required this.prefs});

  final SharedPreferences prefs;

  @override
  State<PetcareApp> createState() => _PetcareAppState();
}

class _PetcareAppState extends State<PetcareApp> {
  late final SessionController _session = SessionController(widget.prefs)..restore();
  late final ThemeController _theme = ThemeController(widget.prefs);
  late final GoRouter _router = buildRouter(_session);

  @override
  void dispose() {
    _router.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: _session),
        ChangeNotifierProvider.value(value: _theme),
        ChangeNotifierProxyProvider<SessionController, PetsController>(
          create: (_) => PetsController(),
          update: (_, session, pets) => pets!..attach(session.repository),
        ),
      ],
      child: Consumer<ThemeController>(
        builder: (context, theme, _) => MaterialApp.router(
          title: 'PetCare',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.light(),
          darkTheme: AppTheme.dark(),
          themeMode: theme.mode,
          routerConfig: _router,
          locale: const Locale('pt', 'BR'),
          supportedLocales: const [Locale('pt', 'BR')],
          localizationsDelegates: GlobalMaterialLocalizations.delegates,
        ),
      ),
    );
  }
}
