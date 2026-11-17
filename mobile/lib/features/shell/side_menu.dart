import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_colors.dart';
import '../../state/session_controller.dart';
import '../../state/theme_controller.dart';
import '../../widgets/brand.dart';
import 'nav_items.dart';

class SideMenu extends StatelessWidget {
  const SideMenu({super.key, required this.location, required this.expanded, this.onToggle, this.onNavigate});

  final String location;
  final bool expanded;
  final VoidCallback? onToggle;
  final VoidCallback? onNavigate;

  static const expandedWidth = 264.0;
  static const collapsedWidth = 84.0;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final current = navItemFor(location);
    final width = expanded ? expandedWidth : collapsedWidth;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 260),
      curve: Curves.easeOutCubic,
      width: width,
      decoration: BoxDecoration(
        color: scheme.surface,
        border: Border(right: BorderSide(color: scheme.outlineVariant.withValues(alpha: 0.6))),
      ),
      child: ClipRect(
        child: OverflowBox(
          alignment: Alignment.topLeft,
          minWidth: width,
          maxWidth: width,
          child: _content(context, scheme, current),
        ),
      ),
    );
  }

  Widget _content(BuildContext context, ColorScheme scheme, NavItem current) {
    return SafeArea(
      right: false,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _Header(expanded: expanded, onToggle: onToggle),
          Expanded(
            child: ListView(
              padding: EdgeInsets.symmetric(horizontal: expanded ? 16 : 12, vertical: 12),
              children: [
                for (final (index, group) in navGroups.indexed) ...[
                  if (index > 0)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      child: Divider(color: scheme.outlineVariant, indent: 8, endIndent: 8),
                    ),
                  if (group.title != null && expanded)
                    Padding(
                      padding: const EdgeInsets.fromLTRB(14, 0, 0, 8),
                      child: Text(
                        group.title!.toUpperCase(),
                        style: TextStyle(
                          fontSize: 11,
                          letterSpacing: 1.1,
                          fontWeight: FontWeight.w700,
                          color: scheme.onSurfaceVariant,
                        ),
                      ),
                    ),
                  for (final item in group.items)
                    _MenuTile(
                      item: item,
                      selected: item == current,
                      expanded: expanded,
                      badge: item.path == '/app/chat' ? 3 : null,
                      onTap: () {
                        context.go(item.path);
                        onNavigate?.call();
                      },
                    ),
                ],
              ],
            ),
          ),
          Padding(
            padding: EdgeInsets.fromLTRB(expanded ? 16 : 12, 8, expanded ? 16 : 12, 16),
            child: Column(
              children: [
                _ThemeSwitch(expanded: expanded),
                const SizedBox(height: 8),
                _MenuTile(
                  item: const NavItem('Sair', Icons.logout_rounded, Icons.logout_rounded, ''),
                  selected: false,
                  expanded: expanded,
                  onTap: () => context.read<SessionController>().logout(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.expanded, this.onToggle});

  final bool expanded;
  final VoidCallback? onToggle;

  @override
  Widget build(BuildContext context) {
    final toggle = onToggle == null
        ? null
        : IconButton(
            tooltip: expanded ? 'Recolher menu' : 'Expandir menu',
            onPressed: onToggle,
            icon: Icon(expanded ? Icons.keyboard_double_arrow_left_rounded : Icons.keyboard_double_arrow_right_rounded),
          );

    return Padding(
      padding: EdgeInsets.fromLTRB(expanded ? 20 : 0, 24, expanded ? 8 : 0, 20),
      child: expanded
          ? Row(
              children: [
                const Expanded(
                  child: Align(alignment: Alignment.centerLeft, child: PetcareLogo(height: 20)),
                ),
                ?toggle,
              ],
            )
          : Column(
              children: [
                const SizedBox(height: 14, child: PetcareLogo(height: 10)),
                if (toggle != null) ...[const SizedBox(height: 8), toggle],
              ],
            ),
    );
  }
}

class _MenuTile extends StatelessWidget {
  const _MenuTile({
    required this.item,
    required this.selected,
    required this.expanded,
    required this.onTap,
    this.badge,
  });

  final NavItem item;
  final bool selected;
  final bool expanded;
  final VoidCallback onTap;
  final int? badge;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final fg = selected ? scheme.onPrimary : scheme.onSurfaceVariant;

    final icon = Badge(
      isLabelVisible: badge != null && !expanded,
      label: Text('${badge ?? ''}'),
      backgroundColor: AppColors.amberDeep,
      child: Icon(selected ? item.selectedIcon : item.icon, color: fg, size: 18),
    );

    final tile = Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          height: 40,
          padding: EdgeInsets.symmetric(horizontal: expanded ? 12 : 0),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            gradient: selected
                ? LinearGradient(colors: [scheme.primary, Color.lerp(scheme.primary, AppColors.indigo400, 0.35)!])
                : null,
            boxShadow: selected
                ? [BoxShadow(color: scheme.primary.withValues(alpha: 0.28), blurRadius: 14, offset: const Offset(0, 6))]
                : null,
          ),
          child: expanded
              ? Row(
                  children: [
                    icon,
                    const SizedBox(width: 14),
                    Expanded(
                      child: Text(
                        item.label,
                        maxLines: 1,
                        overflow: TextOverflow.fade,
                        softWrap: false,
                        style: TextStyle(
                          color: selected ? scheme.onPrimary : scheme.onSurface,
                          fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                          fontSize: 13,
                        ),
                      ),
                    ),
                    if (badge != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          border: Border.all(color: selected ? scheme.onPrimary : scheme.outlineVariant),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '$badge',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: fg),
                        ),
                      ),
                  ],
                )
              : Center(child: icon),
        ),
      ),
    );

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: expanded ? tile : Tooltip(message: item.label, preferBelow: false, child: tile),
    );
  }
}

class _ThemeSwitch extends StatelessWidget {
  const _ThemeSwitch({required this.expanded});

  final bool expanded;

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<ThemeController>();
    final scheme = Theme.of(context).colorScheme;
    final isDark = controller.mode == ThemeMode.dark;

    if (!expanded) {
      return IconButton.filledTonal(
        tooltip: isDark ? 'Tema claro' : 'Tema escuro',
        onPressed: () => controller.set(isDark ? ThemeMode.light : ThemeMode.dark),
        icon: Icon(isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded),
      );
    }

    Widget option(IconData icon, ThemeMode mode, String tooltip) {
      final active = controller.mode == mode;
      return Tooltip(
        message: tooltip,
        child: GestureDetector(
          onTap: () => controller.set(mode),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: 36,
            height: 32,
            decoration: BoxDecoration(
              color: active ? scheme.primary : Colors.transparent,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 16, color: active ? scheme.onPrimary : scheme.onSurfaceVariant),
          ),
        ),
      );
    }

    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        padding: const EdgeInsets.all(3),
        decoration: BoxDecoration(color: scheme.surfaceContainerHigh, borderRadius: BorderRadius.circular(12)),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            option(Icons.light_mode_rounded, ThemeMode.light, 'Tema claro'),
            option(Icons.dark_mode_rounded, ThemeMode.dark, 'Tema escuro'),
          ],
        ),
      ),
    );
  }
}
