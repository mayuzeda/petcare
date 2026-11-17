import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../core/format.dart';
import '../../core/ui_meta.dart';
import '../../data/models.dart';
import '../../data/repository.dart';
import '../../state/pets_controller.dart';

/// Retorna `true` quando um evento foi criado.
Future<bool?> showEventFormSheet(BuildContext context, {EventType? type}) {
  final controller = context.read<PetsController>();
  return showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    constraints: const BoxConstraints(maxWidth: 560),
    builder: (_) => ChangeNotifierProvider.value(
      value: controller,
      child: _EventForm(initialType: type),
    ),
  );
}

class _EventForm extends StatefulWidget {
  const _EventForm({this.initialType});

  final EventType? initialType;

  @override
  State<_EventForm> createState() => _EventFormState();
}

class _EventFormState extends State<_EventForm> {
  final _form = GlobalKey<FormState>();
  final _title = TextEditingController();
  final _notes = TextEditingController();
  late EventType _type = widget.initialType ?? EventType.consulta;
  late String? _petId = context.read<PetsController>().selected?.id;
  DateTime _date = DateTime.now().add(const Duration(days: 1));
  TimeOfDay _time = const TimeOfDay(hour: 10, minute: 0);
  bool _reminder = true;
  bool _saving = false;

  @override
  void dispose() {
    _title.dispose();
    _notes.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_form.currentState!.validate() || _petId == null) return;
    setState(() => _saving = true);
    final navigator = Navigator.of(context);
    final messenger = ScaffoldMessenger.of(context);
    try {
      await context.read<PetsController>().repository.createEvent(
        EventDraft(
          petId: _petId!,
          title: _title.text.trim(),
          type: _type,
          startsAt: DateTime(_date.year, _date.month, _date.day, _time.hour, _time.minute),
          reminder: _reminder,
          notes: _notes.text.trim().isEmpty ? null : _notes.text.trim(),
        ),
      );
      navigator.pop(true);
      messenger.showSnackBar(const SnackBar(content: Text('Cuidado agendado!')));
    } on ApiException catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(e.message)));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final pets = context.watch<PetsController>().pets;
    final when = DateTime(_date.year, _date.month, _date.day, _time.hour, _time.minute);

    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
        child: Form(
          key: _form,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Novo cuidado', style: theme.textTheme.titleLarge),
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  for (final t in EventType.values)
                    ChoiceChip(
                      avatar: Icon(t.icon, size: 18, color: _type == t ? Colors.white : t.color),
                      label: Text(t.label),
                      selected: _type == t,
                      selectedColor: t.color,
                      showCheckmark: false,
                      labelStyle: TextStyle(color: _type == t ? Colors.white : null, fontWeight: FontWeight.w600),
                      onSelected: (_) => setState(() => _type = t),
                    ),
                ],
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                initialValue: _petId,
                decoration: const InputDecoration(labelText: 'Pet'),
                items: [for (final p in pets) DropdownMenuItem(value: p.id, child: Text(p.name))],
                onChanged: (v) => setState(() => _petId = v),
                validator: (v) => v == null ? 'Escolha o pet' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _title,
                textCapitalization: TextCapitalization.sentences,
                decoration: InputDecoration(labelText: 'Título', hintText: 'Ex.: ${_type.label} de rotina'),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Informe um título' : null,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        final picked = await showDatePicker(
                          context: context,
                          initialDate: _date,
                          firstDate: DateTime.now().subtract(const Duration(days: 365)),
                          lastDate: DateTime.now().add(const Duration(days: 365 * 3)),
                        );
                        if (picked != null) setState(() => _date = picked);
                      },
                      icon: const Icon(Icons.event_rounded),
                      label: Text(Fmt.date(when)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        final picked = await showTimePicker(context: context, initialTime: _time);
                        if (picked != null) setState(() => _time = picked);
                      },
                      icon: const Icon(Icons.schedule_rounded),
                      label: Text(Fmt.time(when)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _notes,
                maxLines: 2,
                decoration: const InputDecoration(labelText: 'Observações (opcional)'),
              ),
              const SizedBox(height: 4),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                value: _reminder,
                onChanged: (v) => setState(() => _reminder = v),
                title: const Text('Lembrar-me antes'),
                subtitle: const Text('Notificação no dia anterior e uma hora antes'),
              ),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: _saving ? null : _submit,
                child: _saving
                    ? const SizedBox.square(dimension: 22, child: CircularProgressIndicator(strokeWidth: 2.5))
                    : const Text('Agendar'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
