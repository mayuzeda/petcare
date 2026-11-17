import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_colors.dart';
import '../../data/models.dart';
import '../../data/repository.dart';
import '../../state/pets_controller.dart';

class SearchBox extends StatefulWidget {
  const SearchBox({super.key});

  @override
  State<SearchBox> createState() => _SearchBoxState();
}

class _SearchBoxState extends State<SearchBox> {
  TextEditingController? _field;

  Future<Iterable<SearchHit>> _options(TextEditingValue value) async {
    final query = value.text.trim();
    if (query.length < 2) return const [];
    try {
      final hits = await context.read<PetsController>().repository.search(query);
      if (!mounted || _field?.text.trim() != query) return const [];
      if (hits.isEmpty) {
        return const [
          SearchHit(
            kind: SearchKind.empty,
            id: '',
            title: 'Nada encontrado',
            subtitle: 'Busque por pet, consulta, exame, documento ou sessão',
          ),
        ];
      }
      return hits;
    } on ApiException catch (error) {
      return [SearchHit(kind: SearchKind.empty, id: '', title: 'Não foi possível buscar', subtitle: error.message)];
    }
  }

  void _open(SearchHit hit) {
    if (hit.kind == SearchKind.empty) return;
    final pets = context.read<PetsController>();
    final pet = pets.pets.where((item) => item.id == hit.petId).firstOrNull;
    if (pet != null) pets.select(pet);
    context.go(_route(hit));
    _field?.clear();
    FocusScope.of(context).unfocus();
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Autocomplete<SearchHit>(
      displayStringForOption: (hit) => hit.kind == SearchKind.empty ? '' : hit.title,
      optionsBuilder: _options,
      onSelected: _open,
      fieldViewBuilder: (context, controller, focusNode, onSubmitted) {
        _field = controller;
        return TextField(
          controller: controller,
          focusNode: focusNode,
          style: TextStyle(fontSize: 13, height: 1.2, color: scheme.onSurface),
          cursorHeight: 16,
          textInputAction: TextInputAction.search,
          decoration: InputDecoration(
            isDense: true,
            hintText: 'Buscar consultas, documentos, sessões…',
            hintStyle: TextStyle(fontSize: 13, color: scheme.onSurfaceVariant),
            prefixIcon: Icon(Icons.search_rounded, size: 16, color: scheme.onSurfaceVariant),
            prefixIconConstraints: const BoxConstraints(minWidth: 34, minHeight: 32),
            contentPadding: const EdgeInsets.fromLTRB(0, 8, 12, 8),
            filled: true,
            fillColor: scheme.surface,
          ),
        );
      },
      optionsViewBuilder: (context, onSelected, options) {
        return Align(
          alignment: Alignment.topLeft,
          child: Material(
            color: scheme.surface,
            elevation: 8,
            shadowColor: AppColors.indigo950.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(14),
            clipBehavior: Clip.antiAlias,
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 380, maxHeight: 360),
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 6),
                shrinkWrap: true,
                children: [
                  for (final hit in options)
                    _ResultTile(hit: hit, onTap: hit.kind == SearchKind.empty ? null : () => onSelected(hit)),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _ResultTile extends StatelessWidget {
  const _ResultTile({required this.hit, required this.onTap});

  final SearchHit hit;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Row(
          children: [
            Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(color: scheme.surfaceContainerHigh, borderRadius: BorderRadius.circular(8)),
              child: Icon(_icon(hit.kind), size: 15, color: scheme.onSurfaceVariant),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    hit.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: scheme.onSurface),
                  ),
                  Text(
                    hit.kind == SearchKind.empty ? hit.subtitle : '${hit.kind.label} · ${hit.subtitle}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(fontSize: 12, color: scheme.onSurfaceVariant),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

IconData _icon(SearchKind kind) => switch (kind) {
  SearchKind.pet => Icons.pets_rounded,
  SearchKind.event => Icons.event_available_rounded,
  SearchKind.document => Icons.description_outlined,
  SearchKind.session => Icons.video_call_outlined,
  SearchKind.care => Icons.medical_services_outlined,
  SearchKind.empty => Icons.search_off_rounded,
};

String _route(SearchHit hit) => switch (hit.kind) {
  SearchKind.pet => '/app/pets',
  SearchKind.document => '/app/documentos',
  SearchKind.session => '/app/telemedicina',
  SearchKind.care => '/app',
  SearchKind.empty => '/app',
  SearchKind.event => switch (hit.type) {
    'consulta' => '/app/consultas',
    'exame' => '/app/exames',
    'vermifugo' => '/app/vermifugos',
    _ => '/app/agenda',
  },
};
