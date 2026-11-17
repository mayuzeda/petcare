import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../core/format.dart';
import '../../core/ui_meta.dart';
import '../../data/models.dart';
import '../../state/pets_controller.dart';
import '../../widgets/async_view.dart';
import '../../widgets/cards.dart';

Future<void> showNotificationsSheet(BuildContext context) async {
  final pets = context.read<PetsController>();
  await showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    constraints: const BoxConstraints(maxWidth: 560),
    builder: (_) => ChangeNotifierProvider.value(
      value: pets,
      child: const FractionallySizedBox(heightFactor: 0.75, child: _NotificationsList()),
    ),
  );
  await pets.refreshNotifications();
}

class _NotificationsList extends StatefulWidget {
  const _NotificationsList();

  @override
  State<_NotificationsList> createState() => _NotificationsListState();
}

class _NotificationsListState extends State<_NotificationsList> {
  var _version = 0;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final controller = context.read<PetsController>();
    final repo = controller.repository;
    final petNames = {for (final p in controller.pets) p.id: p.name};

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 0, 12, 8),
          child: Row(
            children: [
              Expanded(child: Text('Notificações', style: theme.textTheme.titleLarge)),
              TextButton(
                onPressed: () async {
                  await repo.markAllNotificationsRead();
                  setState(() => _version++);
                },
                child: const Text('Marcar todas como lidas'),
              ),
            ],
          ),
        ),
        Expanded(
          child: AsyncView<List<AppNotification>>(
            key: ValueKey(_version),
            load: repo.notifications,
            builder: (context, items, _) {
              if (items.isEmpty) {
                return const EmptyState(icon: Icons.notifications_off_outlined, title: 'Nada por aqui ainda');
              }
              return ListView.separated(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                itemCount: items.length,
                separatorBuilder: (_, _) => const SizedBox(height: 8),
                itemBuilder: (context, i) {
                  final n = items[i];
                  return Material(
                    color: n.read ? Colors.transparent : theme.colorScheme.primaryContainer.withValues(alpha: 0.45),
                    borderRadius: BorderRadius.circular(16),
                    child: ListTile(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      leading: IconBadge(icon: notificationIcon(n.type), color: notificationColor(n.type)),
                      title: Text(n.title, style: const TextStyle(fontWeight: FontWeight.w700)),
                      subtitle: Text(
                        '${n.message}\n${[if (n.petId != null) petNames[n.petId], Fmt.timeAgo(n.createdAt)].whereType<String>().join(' • ')}',
                      ),
                      isThreeLine: true,
                      onTap: n.read
                          ? null
                          : () async {
                              await repo.markNotificationRead(n.id);
                              setState(() => _version++);
                            },
                    ),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}
