import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../core/format.dart';
import '../../core/theme/app_colors.dart';
import '../../data/models.dart';
import '../../data/repository.dart';
import '../../state/pets_controller.dart';
import '../../widgets/cards.dart';
import '../../widgets/page.dart';
import '../../widgets/pet_avatar.dart';
import 'add_pet_sheet.dart';

class PetsScreen extends StatelessWidget {
  const PetsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<PetsController>();
    return PageScaffold(
      title: 'Meus pets',
      subtitle: '${controller.pets.length} ${controller.pets.length == 1 ? 'pet cadastrado' : 'pets cadastrados'}',
      onRefresh: controller.load,
      fab: FloatingActionButton.extended(
        onPressed: () => showAddPetSheet(context),
        icon: const Icon(Icons.add_rounded),
        label: const Text('Novo pet'),
      ),
      children: [
        if (controller.loading && controller.pets.isEmpty)
          const Center(
            child: Padding(padding: EdgeInsets.all(48), child: CircularProgressIndicator()),
          )
        else if (controller.pets.isEmpty)
          const EmptyState(
            icon: Icons.pets_rounded,
            title: 'Nenhum pet ainda',
            message: 'Toque em "Novo pet" para cadastrar o primeiro.',
          )
        else
          LayoutBuilder(
            builder: (context, c) {
              final columns = c.maxWidth >= 900 ? 3 : (c.maxWidth >= 560 ? 2 : 1);
              final itemWidth = (c.maxWidth - (columns - 1) * 16) / columns;
              return Wrap(
                spacing: 16,
                runSpacing: 16,
                children: [
                  for (final pet in controller.pets)
                    SizedBox(
                      width: itemWidth,
                      child: _PetCard(pet: pet),
                    ),
                ],
              );
            },
          ),
      ],
    );
  }
}

class _PetCard extends StatelessWidget {
  const _PetCard({required this.pet});

  final Pet pet;

  Future<void> _confirmDelete(BuildContext context) async {
    final controller = context.read<PetsController>();
    final messenger = ScaffoldMessenger.of(context);
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Remover ${pet.name}?'),
        content: const Text('Agenda, documentos e histórico deste pet também serão apagados.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancelar')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Remover'),
          ),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await controller.remove(pet);
    } on ApiException catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final controller = context.watch<PetsController>();
    final selected = controller.selected?.id == pet.id;

    Widget info(String label, String value) => Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
          const SizedBox(height: 2),
          Text(value, style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700)),
        ],
      ),
    );

    return Card(
      shape: selected
          ? RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
              side: BorderSide(color: theme.colorScheme.primary, width: 1.6),
            )
          : null,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                PetAvatar(pet: pet, size: 60, selected: selected),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(pet.name, style: theme.textTheme.titleLarge),
                      Text(
                        pet.summary,
                        style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                      ),
                    ],
                  ),
                ),
                PopupMenuButton<String>(
                  onSelected: (v) {
                    if (v == 'delete') _confirmDelete(context);
                  },
                  itemBuilder: (_) => const [PopupMenuItem(value: 'delete', child: Text('Remover pet'))],
                ),
              ],
            ),
            const SizedBox(height: 18),
            Row(
              children: [
                info('Peso', pet.weightKg == null ? '—' : '${Fmt.decimal1(pet.weightKg!)} kg'),
                info('Sexo', switch (pet.sex) {
                  'femea' => 'Fêmea',
                  'macho' => 'Macho',
                  _ => '—',
                }),
                info('Nascimento', pet.birthDate == null ? '—' : Fmt.date(pet.birthDate!)),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: (pet.hasCollar ? AppColors.success : AppColors.amberDeep).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Icon(
                    pet.hasCollar ? Icons.sensors_rounded : Icons.sensors_off_rounded,
                    size: 18,
                    color: pet.hasCollar ? AppColors.success : AppColors.amberDeep,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      pet.hasCollar ? 'Coleira #${pet.collarId} conectada' : 'Sem coleira pareada',
                      style: theme.textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: selected
                  ? FilledButton.tonal(onPressed: () => context.go('/app'), child: const Text('Ver painel'))
                  : OutlinedButton(
                      onPressed: () {
                        controller.select(pet);
                        context.go('/app');
                      },
                      child: Text('Selecionar ${pet.name}'),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
