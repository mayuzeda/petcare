import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_colors.dart';
import '../../core/ui_meta.dart';
import '../../data/models.dart';
import '../../data/repository.dart';
import '../../state/pets_controller.dart';
import '../../widgets/async_view.dart';
import '../../widgets/cards.dart';
import '../../widgets/page.dart';

class TelemedicineScreen extends StatelessWidget {
  const TelemedicineScreen({super.key});

  Future<void> _request(BuildContext context, Pet pet, Specialty s) async {
    final symptoms = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      constraints: const BoxConstraints(maxWidth: 560),
      builder: (_) => _RequestSheet(pet: pet, specialty: s),
    );
    if (symptoms == null || !context.mounted) return;

    final messenger = ScaffoldMessenger.of(context);
    try {
      await context.read<PetsController>().repository.requestTeleconsult(
        petId: pet.id,
        specialtyId: s.id,
        symptoms: symptoms.isEmpty ? null : symptoms,
      );
      if (!context.mounted) return;
      await showDialog<void>(
        context: context,
        builder: (context) => AlertDialog(
          icon: const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 48),
          title: const Text('Você está na fila!'),
          content: Text(
            'Um profissional de ${s.name.toLowerCase()} vai atender ${pet.name} em cerca de '
            '${s.waitMin}–${s.waitMax} minutos. Avisaremos por notificação.',
          ),
          actions: [FilledButton(onPressed: () => Navigator.pop(context), child: const Text('Entendi'))],
        ),
      );
    } on ApiException catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final controller = context.watch<PetsController>();
    return PageScaffold(
      title: 'Telemedicina',
      subtitle: 'Atendimento veterinário por vídeo, 24 horas',
      children: [
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            gradient: const LinearGradient(colors: [AppColors.indigo950, AppColors.indigo700]),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.success.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text(
                        '● 12 veterinários online',
                        style: TextStyle(color: Color(0xFF6EE7B7), fontWeight: FontWeight.w700, fontSize: 12),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Precisa de ajuda agora?',
                      style: theme.textTheme.headlineSmall?.copyWith(color: Colors.white),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Escolha uma especialidade abaixo. Em emergências graves, procure o hospital veterinário mais próximo.',
                      style: theme.textTheme.bodyMedium?.copyWith(color: Colors.white70),
                    ),
                  ],
                ),
              ),
              if (MediaQuery.sizeOf(context).width >= 600) ...[
                const SizedBox(width: 24),
                const Icon(Icons.video_camera_front_rounded, size: 88, color: AppColors.amber),
              ],
            ],
          ),
        ),
        const SizedBox(height: 16),
        const PetSwitcher(),
        const SizedBox(height: 8),
        WithSelectedPet(
          builder: (context, pet) => AsyncView<List<Specialty>>(
            load: controller.repository.specialties,
            builder: (context, specialties, _) => LayoutBuilder(
              builder: (context, c) {
                final columns = c.maxWidth >= 900 ? 4 : (c.maxWidth >= 560 ? 2 : 1);
                final itemWidth = (c.maxWidth - (columns - 1) * 12) / columns;
                return Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  children: [
                    for (final (i, s) in specialties.indexed)
                      SizedBox(
                        width: itemWidth,
                        child: Card(
                          clipBehavior: Clip.antiAlias,
                          child: InkWell(
                            onTap: () => _request(context, pet, s),
                            child: Padding(
                              padding: const EdgeInsets.all(18),
                              child: Row(
                                children: [
                                  IconBadge(
                                    icon: specialtyIcon(s.icon),
                                    color: AppColors.chart[i % AppColors.chart.length],
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          s.name,
                                          style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          s.description,
                                          style: theme.textTheme.bodySmall?.copyWith(
                                            color: theme.colorScheme.onSurfaceVariant,
                                          ),
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        const SizedBox(height: 6),
                                        Row(
                                          children: [
                                            Icon(Icons.schedule_rounded, size: 14, color: theme.colorScheme.primary),
                                            const SizedBox(width: 4),
                                            Text(
                                              '${s.waitMin}–${s.waitMax} min',
                                              style: theme.textTheme.labelSmall?.copyWith(
                                                color: theme.colorScheme.primary,
                                                fontWeight: FontWeight.w700,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                  Icon(Icons.chevron_right_rounded, color: theme.colorScheme.onSurfaceVariant),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                  ],
                );
              },
            ),
          ),
        ),
      ],
    );
  }
}

class _RequestSheet extends StatefulWidget {
  const _RequestSheet({required this.pet, required this.specialty});

  final Pet pet;
  final Specialty specialty;

  @override
  State<_RequestSheet> createState() => _RequestSheetState();
}

class _RequestSheetState extends State<_RequestSheet> {
  final _symptoms = TextEditingController();

  @override
  void dispose() {
    _symptoms.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.specialty;
    return Padding(
      padding: EdgeInsets.fromLTRB(24, 0, 24, 24 + MediaQuery.viewInsetsOf(context).bottom),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('${s.name} para ${widget.pet.name}', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 4),
          Text('Espera estimada: ${s.waitMin}–${s.waitMax} minutos'),
          const SizedBox(height: 16),
          TextField(
            controller: _symptoms,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'O que está acontecendo?',
              hintText: 'Descreva sintomas, desde quando e qualquer mudança de comportamento.',
            ),
          ),
          const SizedBox(height: 20),
          FilledButton.icon(
            onPressed: () => Navigator.pop(context, _symptoms.text.trim()),
            icon: const Icon(Icons.video_call_rounded),
            label: const Text('Entrar na fila de atendimento'),
          ),
        ],
      ),
    );
  }
}
