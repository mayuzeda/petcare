import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../core/ui_meta.dart';
import '../../data/models.dart';
import '../../data/repository.dart';
import '../../state/pets_controller.dart';
import '../../widgets/async_view.dart';
import '../../widgets/cards.dart';
import '../../widgets/page.dart';
import 'event_form_sheet.dart';
import 'event_row.dart';

class AgendaScreen extends StatefulWidget {
  const AgendaScreen({super.key, this.type, this.title = 'Agenda', this.subtitle});

  /// Quando definido, a tela mostra somente esse tipo de cuidado (ex.: Consultas).
  final EventType? type;
  final String title;
  final String? subtitle;

  @override
  State<AgendaScreen> createState() => _AgendaScreenState();
}

class _AgendaScreenState extends State<AgendaScreen> {
  String? _petId;
  EventType? _typeFilter;
  var _version = 0;

  EventType? get _type => widget.type ?? _typeFilter;

  Future<void> _create() async {
    final created = await showEventFormSheet(context, type: _type);
    if (created == true) setState(() => _version++);
  }

  Future<void> _update(PetEvent e, EventStatus? status) async {
    final repo = context.read<PetsController>().repository;
    final messenger = ScaffoldMessenger.of(context);
    try {
      if (status == null) {
        await repo.deleteEvent(e.id);
      } else {
        await repo.updateEventStatus(e.id, status);
      }
      setState(() => _version++);
    } on ApiException catch (err) {
      messenger.showSnackBar(SnackBar(content: Text(err.message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<PetsController>();
    final names = {for (final p in controller.pets) p.id: p.name};

    return PageScaffold(
      title: widget.title,
      subtitle: widget.subtitle ?? 'Tudo o que está programado para seus pets',
      onRefresh: () async => setState(() => _version++),
      fab: controller.pets.isEmpty
          ? null
          : FloatingActionButton.extended(
              onPressed: _create,
              icon: const Icon(Icons.add_rounded),
              label: const Text('Agendar'),
            ),
      children: [
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _filter('Todos os pets', _petId == null, () => setState(() => _petId = null)),
              for (final p in controller.pets) _filter(p.name, _petId == p.id, () => setState(() => _petId = p.id)),
            ],
          ),
        ),
        if (widget.type == null) ...[
          const SizedBox(height: 8),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _filter('Todos os tipos', _typeFilter == null, () => setState(() => _typeFilter = null)),
                for (final t in EventType.values)
                  _filter(
                    t.label,
                    _typeFilter == t,
                    () => setState(() => _typeFilter = t),
                    icon: t.icon,
                    color: t.color,
                  ),
              ],
            ),
          ),
        ],
        const SizedBox(height: 16),
        AsyncView<List<PetEvent>>(
          key: ValueKey('$_petId-${_type?.name}-$_version'),
          load: () => controller.repository.events(petId: _petId, type: _type),
          builder: (context, events, _) {
            if (events.isEmpty) {
              return EmptyState(
                icon: _type?.icon ?? Icons.event_available_rounded,
                title: 'Nada agendado por aqui',
                message: 'Crie um lembrete para não esquecer nenhum cuidado.',
              );
            }
            final overdue = events.where((e) => e.status == EventStatus.atrasado).toList();
            final upcoming = events.where((e) => e.status == EventStatus.agendado).toList();
            final past = events
                .where((e) => e.status == EventStatus.concluido || e.status == EventStatus.cancelado)
                .toList()
                .reversed
                .toList();
            return Column(
              children: [
                if (overdue.isNotEmpty) _group('Atrasados', overdue, names),
                if (upcoming.isNotEmpty) _group('Próximos', upcoming, names),
                if (past.isNotEmpty) _group('Histórico', past, names),
              ],
            );
          },
        ),
      ],
    );
  }

  Widget _filter(String label, bool selected, VoidCallback onTap, {IconData? icon, Color? color}) => Padding(
    padding: const EdgeInsets.only(right: 8),
    child: FilterChip(
      avatar: icon == null ? null : Icon(icon, size: 16, color: color),
      label: Text(label),
      selected: selected,
      showCheckmark: false,
      onSelected: (_) => onTap(),
    ),
  );

  Widget _group(String title, List<PetEvent> events, Map<String, String> names) => Padding(
    padding: const EdgeInsets.only(bottom: 16),
    child: SectionCard(
      title: title,
      trailing: StatusChip(label: '${events.length}', color: Theme.of(context).colorScheme.primary),
      child: Column(
        children: [
          for (final (i, e) in events.indexed) ...[
            if (i > 0) const Divider(height: 4),
            EventRow(
              event: e,
              petName: names[e.petId],
              trailing: PopupMenuButton<String>(
                tooltip: 'Ações',
                onSelected: (v) => _update(e, switch (v) {
                  'done' => EventStatus.concluido,
                  'cancel' => EventStatus.cancelado,
                  'reopen' => EventStatus.agendado,
                  _ => null,
                }),
                itemBuilder: (_) => [
                  if (e.status == EventStatus.agendado || e.status == EventStatus.atrasado) ...const [
                    PopupMenuItem(value: 'done', child: Text('Marcar como concluído')),
                    PopupMenuItem(value: 'cancel', child: Text('Cancelar')),
                  ] else
                    const PopupMenuItem(value: 'reopen', child: Text('Reabrir')),
                  const PopupMenuItem(value: 'delete', child: Text('Excluir')),
                ],
              ),
            ),
          ],
        ],
      ),
    ),
  );
}
