import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_colors.dart';
import '../../data/repository.dart';
import '../../state/session_controller.dart';
import '../../widgets/brand.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key, this.register = false});

  final bool register;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _form = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  late bool _register = widget.register;
  bool _loading = false;
  bool _obscure = true;
  String? _error;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_form.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    final session = context.read<SessionController>();
    try {
      if (_register) {
        await session.register(_name.text, _email.text, _password.text);
      } else {
        await session.login(_email.text, _password.text);
      }
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final wide = MediaQuery.sizeOf(context).width >= 900;
    final form = _buildForm(context);

    if (wide) {
      return Scaffold(
        body: Row(
          children: [
            const Expanded(child: _BrandPanel()),
            Expanded(
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(40),
                  child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 420), child: form),
                ),
              ),
            ),
          ],
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.indigo950,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 8, 20, 24),
              child: Row(
                children: [
                  IconButton(
                    tooltip: 'Voltar',
                    color: Colors.white,
                    onPressed: () => context.go('/'),
                    icon: const Icon(Icons.arrow_back_rounded),
                  ),
                  const Spacer(),
                  const PetcareLogo(height: 18),
                ],
              ),
            ),
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Theme.of(context).scaffoldBackgroundColor,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
                ),
                child: SingleChildScrollView(
                  padding: EdgeInsets.fromLTRB(24, 32, 24, 24 + MediaQuery.paddingOf(context).bottom),
                  child: form,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildForm(BuildContext context) {
    final theme = Theme.of(context);
    return Form(
      key: _form,
      child: AutofillGroup(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(_register ? 'Crie sua conta' : 'Bem-vindo de volta', style: theme.textTheme.headlineSmall),
            const SizedBox(height: 6),
            Text(
              _register ? 'Comece a acompanhar a saúde do seu pet hoje.' : 'Entre para ver como seus pets estão.',
              style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
            ),
            const SizedBox(height: 24),
            SegmentedButton<bool>(
              segments: const [
                ButtonSegment(value: false, label: Text('Entrar')),
                ButtonSegment(value: true, label: Text('Criar conta')),
              ],
              selected: {_register},
              showSelectedIcon: false,
              onSelectionChanged: (s) => setState(() {
                _register = s.first;
                _error = null;
              }),
            ),
            const SizedBox(height: 20),
            if (_register) ...[
              TextFormField(
                controller: _name,
                textCapitalization: TextCapitalization.words,
                autofillHints: const [AutofillHints.name],
                decoration: const InputDecoration(
                  labelText: 'Seu nome',
                  prefixIcon: Icon(Icons.person_outline_rounded),
                ),
                validator: (v) => (v == null || v.trim().length < 2) ? 'Informe seu nome' : null,
              ),
              const SizedBox(height: 12),
            ],
            TextFormField(
              controller: _email,
              keyboardType: TextInputType.emailAddress,
              autofillHints: const [AutofillHints.email],
              decoration: const InputDecoration(labelText: 'E-mail', prefixIcon: Icon(Icons.mail_outline_rounded)),
              validator: (v) => (v == null || !v.contains('@')) ? 'Informe um e-mail válido' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _password,
              obscureText: _obscure,
              autofillHints: [_register ? AutofillHints.newPassword : AutofillHints.password],
              onFieldSubmitted: (_) => _submit(),
              decoration: InputDecoration(
                labelText: 'Senha',
                prefixIcon: const Icon(Icons.lock_outline_rounded),
                suffixIcon: IconButton(
                  tooltip: _obscure ? 'Mostrar senha' : 'Ocultar senha',
                  onPressed: () => setState(() => _obscure = !_obscure),
                  icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                ),
              ),
              validator: (v) {
                if (v == null || v.isEmpty) return 'Informe a senha';
                if (_register && v.length < 6) return 'Use pelo menos 6 caracteres';
                return null;
              },
            ),
            if (_error != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: AppColors.dangerSoft, borderRadius: BorderRadius.circular(12)),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline_rounded, color: AppColors.danger, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(_error!, style: const TextStyle(color: Color(0xFF991B1B))),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 24),
            FilledButton(
              onPressed: _loading ? null : _submit,
              child: _loading
                  ? const SizedBox.square(dimension: 22, child: CircularProgressIndicator(strokeWidth: 2.5))
                  : Text(_register ? 'Criar conta' : 'Entrar'),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                const Expanded(child: Divider()),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Text('ou', style: theme.textTheme.bodySmall),
                ),
                const Expanded(child: Divider()),
              ],
            ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: _loading ? null : () => context.read<SessionController>().startDemo(),
              icon: const Icon(Icons.play_circle_outline_rounded),
              label: const Text('Explorar com dados de demonstração'),
            ),
          ],
        ),
      ),
    );
  }
}

class _BrandPanel extends StatelessWidget {
  const _BrandPanel();

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(48),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(32),
        gradient: const LinearGradient(
          colors: [AppColors.indigo950, AppColors.indigo900],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          InkWell(onTap: () => context.go('/'), child: const PetcareLogo(height: 26)),
          const Spacer(),
          Text.rich(
            TextSpan(
              children: [
                const TextSpan(text: 'Cuidar bem é\n'),
                TextSpan(
                  text: 'acompanhar de perto',
                  style: GoogleFonts.instrumentSerif(
                    fontStyle: FontStyle.italic,
                    color: AppColors.amber,
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ],
            ),
            style: GoogleFonts.plusJakartaSans(
              color: Colors.white,
              fontSize: 44,
              fontWeight: FontWeight.w700,
              height: 1.1,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Sinais vitais, agenda, documentos e veterinários em um só lugar.',
            style: TextStyle(color: Colors.white70, fontSize: 16),
          ),
          const SizedBox(height: 32),
          const Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _Feature(Icons.monitor_heart_rounded, 'Coleira inteligente'),
              _Feature(Icons.calendar_month_rounded, 'Lembretes'),
              _Feature(Icons.video_call_rounded, 'Telemedicina'),
            ],
          ),
        ],
      ),
    );
  }
}

class _Feature extends StatelessWidget {
  const _Feature(this.icon, this.label);

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
    decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(30)),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: AppColors.amber),
        const SizedBox(width: 8),
        Text(
          label,
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
      ],
    ),
  );
}
