import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';

import '../data/models.dart';
import '../features/activity/activity_screen.dart';
import '../features/agenda/agenda_screen.dart';
import '../features/auth/login_screen.dart';
import '../features/chat/chat_screen.dart';
import '../features/dashboard/dashboard_screen.dart';
import '../features/documents/documents_screen.dart';
import '../features/health/health_screen.dart';
import '../features/home/home_screen.dart';
import '../features/pets/pets_screen.dart';
import '../features/shell/dashboard_shell.dart';
import '../features/telemedicine/telemedicine_screen.dart';
import '../state/session_controller.dart';

GoRouter buildRouter(SessionController session) {
  NoTransitionPage<void> page(Widget child) => NoTransitionPage(child: child);

  return GoRouter(
    initialLocation: session.isSignedIn ? '/app' : '/',
    refreshListenable: session,
    redirect: (context, state) {
      final path = state.matchedLocation;
      final inApp = path.startsWith('/app');
      if (!session.isSignedIn && inApp) return '/';
      if (session.isSignedIn && !inApp) return '/app';
      return null;
    },
    routes: [
      GoRoute(path: '/', builder: (_, _) => const HomeScreen()),
      GoRoute(
        path: '/entrar',
        builder: (_, state) => LoginScreen(register: state.uri.queryParameters['modo'] == 'cadastro'),
      ),
      ShellRoute(
        builder: (context, state, child) => DashboardShell(location: state.matchedLocation, child: child),
        routes: [
          GoRoute(path: '/app', pageBuilder: (_, _) => page(const DashboardScreen())),
          GoRoute(path: '/app/pets', pageBuilder: (_, _) => page(const PetsScreen())),
          GoRoute(path: '/app/saude', pageBuilder: (_, _) => page(const HealthScreen())),
          GoRoute(path: '/app/atividade', pageBuilder: (_, _) => page(const ActivityScreen())),
          GoRoute(path: '/app/agenda', pageBuilder: (_, _) => page(const AgendaScreen())),
          GoRoute(
            path: '/app/consultas',
            pageBuilder: (_, _) => page(
              const AgendaScreen(
                key: ValueKey('consultas'),
                type: EventType.consulta,
                title: 'Consultas',
                subtitle: 'Consultas de rotina e com especialistas',
              ),
            ),
          ),
          GoRoute(
            path: '/app/exames',
            pageBuilder: (_, _) => page(
              const AgendaScreen(
                key: ValueKey('exames'),
                type: EventType.exame,
                title: 'Exames',
                subtitle: 'Exames agendados e resultados',
              ),
            ),
          ),
          GoRoute(
            path: '/app/vermifugos',
            pageBuilder: (_, _) => page(
              const AgendaScreen(
                key: ValueKey('vermifugos'),
                type: EventType.vermifugo,
                title: 'Vermífugos e antiparasitários',
                subtitle: 'Controle de vermes, pulgas e carrapatos',
              ),
            ),
          ),
          GoRoute(path: '/app/documentos', pageBuilder: (_, _) => page(const DocumentsScreen())),
          GoRoute(path: '/app/telemedicina', pageBuilder: (_, _) => page(const TelemedicineScreen())),
          GoRoute(path: '/app/chat', pageBuilder: (_, _) => page(const ChatScreen())),
        ],
      ),
    ],
  );
}
