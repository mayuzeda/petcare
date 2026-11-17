import 'package:material_ui/material_ui.dart';

import '../data/repository.dart';
import 'cards.dart';

/// Carrega dados assíncronos e expõe `reload` ao builder. Troque a `key` para recarregar ao mudar parâmetros.
class AsyncView<T> extends StatefulWidget {
  const AsyncView({super.key, required this.load, required this.builder});

  final Future<T> Function() load;
  final Widget Function(BuildContext context, T data, Future<void> Function() reload) builder;

  @override
  State<AsyncView<T>> createState() => _AsyncViewState<T>();
}

class _AsyncViewState<T> extends State<AsyncView<T>> {
  T? _data;
  Object? _error;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  Future<void> _reload() async {
    setState(() {
      _loading = _data == null;
      _error = null;
    });
    try {
      final data = await widget.load();
      if (mounted) setState(() => _data = data);
    } catch (e) {
      if (mounted) setState(() => _error = e);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(
        child: Padding(padding: EdgeInsets.all(48), child: CircularProgressIndicator()),
      );
    }
    if (_error != null && _data == null) {
      return EmptyState(
        icon: Icons.cloud_off_rounded,
        title: 'Não foi possível carregar',
        message: _error is ApiException ? (_error as ApiException).message : 'Erro inesperado: $_error',
        action: FilledButton.tonalIcon(
          onPressed: _reload,
          icon: const Icon(Icons.refresh_rounded),
          label: const Text('Tentar novamente'),
        ),
      );
    }
    return widget.builder(context, _data as T, _reload);
  }
}
