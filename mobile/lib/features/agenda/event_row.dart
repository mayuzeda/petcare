import 'package:material_ui/material_ui.dart';

import '../../core/format.dart';
import '../../core/ui_meta.dart';
import '../../data/models.dart';
import '../../widgets/cards.dart';

/// Linha de evento que vira "tabela" em telas largas e lista compacta no celular.
class EventRow extends StatelessWidget {
  const EventRow({
    super.key,
    required this.event,
    this.petName,
    this.trailing,
    this.onTap,
    this.dense = false,
  });

  final PetEvent event;
  final String? petName;
  final Widget? trailing;
  final VoidCallback? onTap;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final muted = theme.colorScheme.onSurfaceVariant;
    final subtitle = [event.type.label, ?petName].join(' • ');

    final title = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          event.title,
          style: theme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w700,
            decoration: event.status == EventStatus.cancelado
                ? TextDecoration.lineThrough
                : null,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 2),
        Text(
          subtitle,
          style: theme.textTheme.bodySmall?.copyWith(color: muted),
        ),
      ],
    );

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: dense ? 4 : 10, horizontal: 4),
        child: LayoutBuilder(
          builder: (context, c) {
            final wide = c.maxWidth >= 520;
            return Row(
              children: [
                IconBadge(
                  icon: event.type.icon,
                  color: event.type.color,
                  size: dense ? 32 : 42,
                ),
                const SizedBox(width: 14),
                if (wide) ...[
                  Expanded(flex: 5, child: title),
                  Expanded(
                    flex: 3,
                    child: Text(
                      Fmt.relativeDay(event.startsAt),
                      style: theme.textTheme.bodyMedium?.copyWith(color: muted),
                    ),
                  ),
                  SizedBox(
                    width: 110,
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: StatusChip(
                        label: event.status.label,
                        color: event.status.color,
                      ),
                    ),
                  ),
                ] else
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        title,
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Icon(
                              Icons.schedule_rounded,
                              size: 14,
                              color: muted,
                            ),
                            const SizedBox(width: 4),
                            Flexible(
                              child: Text(
                                Fmt.relativeDay(event.startsAt),
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: muted,
                                  fontWeight: FontWeight.w600,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(width: 8),
                            StatusChip(
                              label: event.status.label,
                              color: event.status.color,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ?trailing,
              ],
            );
          },
        ),
      ),
    );
  }
}
