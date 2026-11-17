import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../data/models.dart';
import '../features/pets/add_pet_sheet.dart';
import '../state/pets_controller.dart';
import 'cards.dart';
import 'pet_avatar.dart';

double pagePadding(BuildContext context) =>
    MediaQuery.sizeOf(context).width < 600 ? 20 : 32;

class PageScaffold extends StatelessWidget {
  const PageScaffold({
    super.key,
    required this.children,
    this.title,
    this.subtitle,
    this.trailing,
    this.belowTitle,
    this.fab,
    this.onRefresh,
    this.compact = false,
  });

  final String? title;
  final String? subtitle;
  final Widget? trailing;
  final Widget? belowTitle;
  final List<Widget> children;
  final Widget? fab;
  final Future<void> Function()? onRefresh;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final pad = pagePadding(context);
    final list = ListView(
      padding: EdgeInsets.fromLTRB(
        pad,
        compact ? 4 : 20,
        pad,
        compact ? 16 : 96,
      ),
      children: [
        if (title != null)
          Padding(
            padding: EdgeInsets.only(bottom: compact ? 10 : 28),
            child: Wrap(
              alignment: WrapAlignment.spaceBetween,
              crossAxisAlignment: compact
                  ? WrapCrossAlignment.start
                  : WrapCrossAlignment.center,
              runSpacing: 12,
              spacing: 12,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title!, style: theme.textTheme.headlineSmall),
                    if (subtitle != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(
                          subtitle!,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ),
                    if (belowTitle != null) ...[
                      const SizedBox(height: 10),
                      belowTitle!,
                    ],
                  ],
                ),
                ?trailing,
              ],
            ),
          ),
        ...children,
      ],
    );
    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: fab,
      body: onRefresh == null
          ? list
          : RefreshIndicator(onRefresh: onRefresh!, child: list),
    );
  }
}

/// Garante um pet selecionado antes de renderizar a tela.
class WithSelectedPet extends StatelessWidget {
  const WithSelectedPet({super.key, required this.builder});

  final Widget Function(BuildContext context, Pet pet) builder;

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<PetsController>();
    if (controller.loading && controller.pets.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }
    if (controller.error != null && controller.pets.isEmpty) {
      return EmptyState(
        icon: Icons.cloud_off_rounded,
        title: 'Não foi possível carregar seus pets',
        message: controller.error,
        action: FilledButton.tonal(
          onPressed: controller.load,
          child: const Text('Tentar novamente'),
        ),
      );
    }
    final pet = controller.selected;
    if (pet == null) {
      return EmptyState(
        icon: Icons.pets_rounded,
        title: 'Cadastre seu primeiro pet',
        message: 'Adicione um pet para acompanhar saúde, agenda e documentos.',
        action: FilledButton.icon(
          onPressed: () => showAddPetSheet(context),
          icon: const Icon(Icons.add_rounded),
          label: const Text('Adicionar pet'),
        ),
      );
    }
    return builder(context, pet);
  }
}

class PetSwitcher extends StatelessWidget {
  const PetSwitcher({super.key, this.inline = false});

  /// Em linha, ao lado de um título. Sem isso, ocupa a largura da página.
  final bool inline;

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<PetsController>();
    final theme = Theme.of(context);
    final tiles = [
      for (final pet in controller.pets)
        Padding(
          padding: const EdgeInsets.only(right: 14),
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () => controller.select(pet),
            child: Column(
              children: [
                PetAvatar(
                  pet: pet,
                  size: 52,
                  selected: pet.id == controller.selected?.id,
                ),
                const SizedBox(height: 4),
                Text(
                  pet.name,
                  style: theme.textTheme.labelMedium?.copyWith(
                    fontWeight: pet.id == controller.selected?.id
                        ? FontWeight.w800
                        : FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => showAddPetSheet(context),
        child: Column(
          children: [
            Container(
              width: 52,
              height: 52,
              margin: const EdgeInsets.all(4.5),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: theme.colorScheme.outline,
                  width: 1.5,
                ),
              ),
              child: Icon(
                Icons.add_rounded,
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            Text('Adicionar', style: theme.textTheme.labelMedium),
          ],
        ),
      ),
    ];
    if (inline) return Row(mainAxisSize: MainAxisSize.min, children: tiles);
    return SizedBox(
      height: 86,
      child: ListView(scrollDirection: Axis.horizontal, children: tiles),
    );
  }
}
