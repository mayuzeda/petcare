import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_colors.dart';
import '../../state/pets_controller.dart';
import '../../state/session_controller.dart';
import 'nav_items.dart';
import 'search_box.dart';
import 'notifications_sheet.dart';
import 'side_menu.dart';

class DashboardShell extends StatefulWidget {
  const DashboardShell({super.key, required this.location, required this.child});

  final String location;
  final Widget child;

  static const railBreakpoint = 640.0;
  static const expandedBreakpoint = 1100.0;

  @override
  State<DashboardShell> createState() => _DashboardShellState();
}

class _DashboardShellState extends State<DashboardShell> {
  final _scaffoldKey = GlobalKey<ScaffoldState>();
  bool? _expandedOverride;

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final persistent = width >= DashboardShell.railBreakpoint;
    final expanded = _expandedOverride ?? width >= DashboardShell.expandedBreakpoint;

    final body = Column(
      children: [
        _TopBar(
          title: navItemFor(widget.location).label,
          showMenuButton: !persistent,
          onMenu: () => _scaffoldKey.currentState?.openDrawer(),
        ),
        Expanded(child: widget.child),
      ],
    );

    return Scaffold(
      key: _scaffoldKey,
      drawer: persistent
          ? null
          : Drawer(
              width: SideMenu.expandedWidth,
              child: SideMenu(location: widget.location, expanded: true, onNavigate: () => Navigator.of(context).pop()),
            ),
      body: persistent
          ? Row(
              children: [
                SideMenu(
                  location: widget.location,
                  expanded: expanded,
                  onToggle: () => setState(() => _expandedOverride = !expanded),
                ),
                Expanded(child: body),
              ],
            )
          : body,
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({required this.title, required this.showMenuButton, required this.onMenu});

  final String title;
  final bool showMenuButton;
  final VoidCallback onMenu;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final session = context.watch<SessionController>();
    final unread = context.select<PetsController, int>((c) => c.unreadNotifications);
    final wide = MediaQuery.sizeOf(context).width >= 900;
    final user = session.user;

    return SafeArea(
      bottom: false,
      left: false,
      child: Padding(
        padding: EdgeInsets.fromLTRB(showMenuButton ? 8 : 32, 16, 20, 8),
        child: Row(
          children: [
            if (showMenuButton) IconButton(tooltip: 'Menu', onPressed: onMenu, icon: const Icon(Icons.menu_rounded)),
            if (wide)
              const SizedBox(width: 340, child: SearchBox())
            else
              Expanded(
                child: Text(title, style: theme.textTheme.titleLarge, overflow: TextOverflow.ellipsis),
              ),
            if (wide) const Spacer(),
            if (session.isDemo)
              Padding(
                padding: const EdgeInsets.only(right: 4),
                child: Tooltip(
                  message: 'Você está explorando dados de demonstração',
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(color: AppColors.amberSoft, borderRadius: BorderRadius.circular(10)),
                    child: const Text(
                      'Demo',
                      style: TextStyle(color: Color(0xFF8A4B00), fontWeight: FontWeight.w700, fontSize: 13),
                    ),
                  ),
                ),
              ),
            IconButton(
              tooltip: 'Notificações',
              onPressed: () => showNotificationsSheet(context),
              icon: Badge(
                isLabelVisible: unread > 0,
                label: Text('$unread'),
                backgroundColor: AppColors.amberDeep,
                child: const Icon(Icons.notifications_none_rounded),
              ),
            ),
            const SizedBox(width: 4),
            PopupMenuButton<String>(
              tooltip: 'Conta',
              position: PopupMenuPosition.under,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              onSelected: (v) {
                if (v == 'logout') context.read<SessionController>().logout();
              },
              itemBuilder: (_) => [
                PopupMenuItem(
                  enabled: false,
                  child: ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(user?.name ?? ''),
                    subtitle: Text(user?.email ?? ''),
                  ),
                ),
                const PopupMenuDivider(),
                const PopupMenuItem(
                  value: 'logout',
                  child: ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Icon(Icons.logout_rounded),
                    title: Text('Sair'),
                  ),
                ),
              ],
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 19,
                    backgroundColor: AppColors.indigo100,
                    child: Text(
                      (user?.name ?? '?').characters.first.toUpperCase(),
                      style: const TextStyle(color: AppColors.indigo700, fontWeight: FontWeight.w800),
                    ),
                  ),
                  if (wide) ...[
                    const SizedBox(width: 10),
                    Text(user?.name ?? '', style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700)),
                    const Icon(Icons.expand_more_rounded),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
