import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../core/format.dart';
import '../../data/models.dart';
import '../../data/repository.dart';
import '../../state/pets_controller.dart';

Future<void> showAddPetSheet(BuildContext context) {
  final controller = context.read<PetsController>();
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    constraints: const BoxConstraints(maxWidth: 560),
    builder: (_) => ChangeNotifierProvider.value(value: controller, child: const _AddPetForm()),
  );
}

class _AddPetForm extends StatefulWidget {
  const _AddPetForm();

  @override
  State<_AddPetForm> createState() => _AddPetFormState();
}

class _AddPetFormState extends State<_AddPetForm> {
  final _form = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _breed = TextEditingController();
  final _weight = TextEditingController();
  final _collar = TextEditingController();
  Species _species = Species.cachorro;
  String _sex = 'femea';
  DateTime? _birth;
  bool _saving = false;

  @override
  void dispose() {
    for (final c in [_name, _breed, _weight, _collar]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_form.currentState!.validate()) return;
    setState(() => _saving = true);
    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);
    try {
      final pet = await context.read<PetsController>().add(
        PetDraft(
          name: _name.text.trim(),
          species: _species,
          breed: _breed.text.trim().isEmpty ? null : _breed.text.trim(),
          sex: _sex,
          birthDate: _birth,
          weightKg: double.tryParse(_weight.text.replaceAll(',', '.')),
          collarId: _collar.text.trim().isEmpty ? null : _collar.text.trim(),
        ),
      );
      navigator.pop();
      messenger.showSnackBar(SnackBar(content: Text('${pet.name} foi adicionado(a)!')));
    } on ApiException catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(e.message)));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
        child: Form(
          key: _form,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Novo pet', style: theme.textTheme.titleLarge),
              const SizedBox(height: 20),
              SegmentedButton<Species>(
                segments: const [
                  ButtonSegment(value: Species.cachorro, label: Text('Cachorro'), icon: Icon(Icons.pets_rounded)),
                  ButtonSegment(value: Species.gato, label: Text('Gato'), icon: Icon(Icons.cruelty_free_rounded)),
                  ButtonSegment(value: Species.outro, label: Text('Outro')),
                ],
                selected: {_species},
                onSelectionChanged: (s) => setState(() => _species = s.first),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _name,
                textCapitalization: TextCapitalization.words,
                decoration: const InputDecoration(labelText: 'Nome'),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Informe o nome do pet' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _breed,
                textCapitalization: TextCapitalization.words,
                decoration: const InputDecoration(labelText: 'Raça (opcional)'),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      initialValue: _sex,
                      decoration: const InputDecoration(labelText: 'Sexo'),
                      items: const [
                        DropdownMenuItem(value: 'femea', child: Text('Fêmea')),
                        DropdownMenuItem(value: 'macho', child: Text('Macho')),
                      ],
                      onChanged: (v) => setState(() => _sex = v ?? _sex),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _weight,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: const InputDecoration(labelText: 'Peso (kg)'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                style: OutlinedButton.styleFrom(alignment: Alignment.centerLeft),
                onPressed: () async {
                  final now = DateTime.now();
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _birth ?? DateTime(now.year - 1, now.month, now.day),
                    firstDate: DateTime(now.year - 30),
                    lastDate: now,
                  );
                  if (picked != null) setState(() => _birth = picked);
                },
                icon: const Icon(Icons.cake_outlined),
                label: Text(_birth == null ? 'Data de nascimento (opcional)' : 'Nascimento: ${Fmt.date(_birth!)}'),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _collar,
                decoration: const InputDecoration(
                  labelText: 'Código da coleira (opcional)',
                  helperText: 'Pareie a coleira PetCare para receber sinais vitais e GPS.',
                  prefixIcon: Icon(Icons.sensors_rounded),
                ),
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: _saving ? null : _submit,
                child: _saving
                    ? const SizedBox.square(dimension: 22, child: CircularProgressIndicator(strokeWidth: 2.5))
                    : const Text('Salvar pet'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
