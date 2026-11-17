import 'dart:async';

import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../core/format.dart';
import '../../core/theme/app_colors.dart';
import '../../state/pets_controller.dart';
import '../../widgets/page.dart';

class _Message {
  const _Message(this.text, this.mine, this.at);
  final String text;
  final bool mine;
  final DateTime at;
}

/// Conversa com a clínica de referência. As respostas são simuladas até a integração com o canal de mensagens.
class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _input = TextEditingController();
  final _scroll = ScrollController();
  late final List<_Message> _messages;
  bool _typing = false;
  Timer? _replyTimer;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    final pet = context.read<PetsController>().selected?.name ?? 'seu pet';
    _messages = [
      _Message(
        'Olá! Aqui é a Dra. Marina, da Clínica PetVet. Como $pet está hoje?',
        false,
        now.subtract(const Duration(minutes: 42)),
      ),
      _Message(
        'Oi, doutora! Ela comeu bem, mas está mais quieta que o normal.',
        true,
        now.subtract(const Duration(minutes: 38)),
      ),
      _Message(
        'Entendi. Vou acompanhar os sinais da coleira. Se notar febre ou falta de apetite, me avise por aqui.',
        false,
        now.subtract(const Duration(minutes: 35)),
      ),
    ];
  }

  @override
  void dispose() {
    _replyTimer?.cancel();
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  void _send() {
    final text = _input.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _messages.add(_Message(text, true, DateTime.now()));
      _typing = true;
    });
    _input.clear();
    _scrollToEnd();
    _replyTimer = Timer(const Duration(milliseconds: 1600), () {
      if (!mounted) return;
      setState(() {
        _typing = false;
        _messages.add(
          _Message(
            'Recebi sua mensagem! Já estou olhando o histórico e retorno em instantes. 🐾',
            false,
            DateTime.now(),
          ),
        );
      });
      _scrollToEnd();
    });
  }

  void _scrollToEnd() => WidgetsBinding.instance.addPostFrameCallback((_) {
    if (_scroll.hasClients) {
      _scroll.animateTo(
        _scroll.position.maxScrollExtent,
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOut,
      );
    }
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final pad = pagePadding(context);

    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 820),
        child: Column(
          children: [
            Padding(
              padding: EdgeInsets.fromLTRB(pad, 8, pad, 8),
              child: Row(
                children: [
                  const CircleAvatar(
                    radius: 22,
                    backgroundColor: AppColors.indigo100,
                    child: Text(
                      'M',
                      style: TextStyle(color: AppColors.indigo700, fontWeight: FontWeight.w800),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Dra. Marina Lopes', style: theme.textTheme.titleMedium),
                        Text(
                          _typing ? 'digitando…' : 'Clínica PetVet • online',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: AppColors.success,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView.builder(
                controller: _scroll,
                padding: EdgeInsets.symmetric(horizontal: pad, vertical: 8),
                itemCount: _messages.length,
                itemBuilder: (context, i) {
                  final m = _messages[i];
                  return Align(
                    alignment: m.mine ? Alignment.centerRight : Alignment.centerLeft,
                    child: Container(
                      constraints: const BoxConstraints(maxWidth: 480),
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.fromLTRB(14, 10, 14, 8),
                      decoration: BoxDecoration(
                        color: m.mine ? scheme.primary : scheme.surface,
                        borderRadius: BorderRadius.only(
                          topLeft: const Radius.circular(18),
                          topRight: const Radius.circular(18),
                          bottomLeft: Radius.circular(m.mine ? 18 : 4),
                          bottomRight: Radius.circular(m.mine ? 4 : 18),
                        ),
                        border: m.mine ? null : Border.all(color: scheme.outlineVariant),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            m.text,
                            style: TextStyle(color: m.mine ? scheme.onPrimary : scheme.onSurface, height: 1.35),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            Fmt.time(m.at),
                            style: TextStyle(
                              fontSize: 11,
                              color: (m.mine ? scheme.onPrimary : scheme.onSurfaceVariant).withValues(alpha: 0.75),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            SafeArea(
              top: false,
              child: Padding(
                padding: EdgeInsets.fromLTRB(pad, 8, pad, 12),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _input,
                        textCapitalization: TextCapitalization.sentences,
                        onSubmitted: (_) => _send(),
                        decoration: const InputDecoration(hintText: 'Escreva uma mensagem…'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton.filled(
                      tooltip: 'Enviar',
                      style: IconButton.styleFrom(minimumSize: const Size(52, 52)),
                      onPressed: _send,
                      icon: const Icon(Icons.send_rounded),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
