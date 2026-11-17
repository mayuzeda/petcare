import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../core/format.dart';
import '../../core/ui_meta.dart';
import '../../data/models.dart';
import '../../data/repository.dart';
import '../../state/pets_controller.dart';
import '../../widgets/async_view.dart';
import '../../widgets/cards.dart';
import '../../widgets/page.dart';

class DocumentsScreen extends StatefulWidget {
  const DocumentsScreen({super.key});

  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  DocumentCategory? _category;
  var _version = 0;

  Future<void> _run(Future<void> Function() action) async {
    final messenger = ScaffoldMessenger.of(context);
    try {
      await action();
      setState(() => _version++);
    } on ApiException catch (e) {
      messenger.showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  Future<void> _add(Pet pet) async {
    final result = await showModalBottomSheet<(String, DocumentCategory, String?)>(
      context: context,
      isScrollControlled: true,
      constraints: const BoxConstraints(maxWidth: 560),
      builder: (_) => _DocumentForm(initialCategory: _category ?? DocumentCategory.exames),
    );
    if (result == null || !mounted) return;
    final repo = context.read<PetsController>().repository;
    await _run(() => repo.createDocument(pet.id, name: result.$1, category: result.$2, notes: result.$3));
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<PetsController>();
    final repo = controller.repository;
    final pet = controller.selected;

    return PageScaffold(
      title: 'Documentos',
      subtitle: pet == null ? null : 'Carteira de vacinação, receitas e exames de ${pet.name}',
      fab: pet == null
          ? null
          : FloatingActionButton.extended(
              onPressed: () => _add(pet),
              icon: const Icon(Icons.upload_file_rounded),
              label: const Text('Adicionar'),
            ),
      children: [
        const PetSwitcher(),
        const SizedBox(height: 8),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              for (final c in [null, ...DocumentCategory.values])
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(c?.label ?? 'Todos'),
                    selected: _category == c,
                    showCheckmark: false,
                    onSelected: (_) => setState(() => _category = c),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        WithSelectedPet(
          builder: (context, pet) => AsyncView<List<PetDocument>>(
            key: ValueKey('${pet.id}-$_version'),
            load: () => repo.documents(pet.id),
            builder: (context, docs, _) {
              final list = docs.where((d) => _category == null || d.category == _category).toList();
              if (list.isEmpty) {
                return const EmptyState(
                  icon: Icons.folder_open_rounded,
                  title: 'Nenhum documento',
                  message: 'Guarde aqui receitas, exames e a carteira de vacinação.',
                );
              }
              return Card(
                child: Column(
                  children: [
                    for (final (i, d) in list.indexed) ...[
                      if (i > 0) const Divider(indent: 72),
                      ListTile(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                        leading: IconBadge(
                          icon: d.fileType == 'pdf' ? Icons.picture_as_pdf_rounded : Icons.image_rounded,
                          color: d.category.color,
                        ),
                        title: Text(d.name, style: const TextStyle(fontWeight: FontWeight.w700)),
                        subtitle: Text(
                          [
                            d.category.label,
                            Fmt.date(d.uploadedAt),
                            if (d.fileSize > 0) d.formattedSize,
                            ?d.notes,
                          ].join(' • '),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              tooltip: d.favorite ? 'Remover dos favoritos' : 'Favoritar',
                              onPressed: () => _run(() => repo.setDocumentFavorite(d.id, !d.favorite)),
                              icon: Icon(
                                d.favorite ? Icons.star_rounded : Icons.star_outline_rounded,
                                color: d.favorite ? const Color(0xFFFBA31F) : null,
                              ),
                            ),
                            IconButton(
                              tooltip: 'Excluir',
                              onPressed: () => _run(() => repo.deleteDocument(d.id)),
                              icon: const Icon(Icons.delete_outline_rounded),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _DocumentForm extends StatefulWidget {
  const _DocumentForm({required this.initialCategory});

  final DocumentCategory initialCategory;

  @override
  State<_DocumentForm> createState() => _DocumentFormState();
}

class _DocumentFormState extends State<_DocumentForm> {
  final _form = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _notes = TextEditingController();
  late DocumentCategory _category = widget.initialCategory;

  @override
  void dispose() {
    _name.dispose();
    _notes.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
        child: Form(
          key: _form,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Novo documento', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 16),
              SegmentedButton<DocumentCategory>(
                showSelectedIcon: false,
                segments: [for (final c in DocumentCategory.values) ButtonSegment(value: c, label: Text(c.label))],
                selected: {_category},
                onSelectionChanged: (s) => setState(() => _category = s.first),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _name,
                textCapitalization: TextCapitalization.sentences,
                decoration: const InputDecoration(labelText: 'Nome do documento'),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Informe o nome' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _notes,
                decoration: const InputDecoration(labelText: 'Observações (opcional)'),
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: () {
                  if (!_form.currentState!.validate()) return;
                  Navigator.pop(context, (
                    _name.text.trim(),
                    _category,
                    _notes.text.trim().isEmpty ? null : _notes.text.trim(),
                  ));
                },
                child: const Text('Salvar documento'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
