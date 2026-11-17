import 'dart:math' as math;

import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../core/theme/app_colors.dart';
import '../../state/session_controller.dart';
import '../../widgets/brand.dart';
import 'dashboard_preview.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _featuresKey = GlobalKey();
  final _stepsKey = GlobalKey();
  bool _showBanner = true;

  void _scrollTo(GlobalKey key) => Scrollable.ensureVisible(
    key.currentContext!,
    duration: const Duration(milliseconds: 500),
    curve: Curves.easeOutCubic,
  );

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final wide = width >= 840;

    return Scaffold(
      backgroundColor: AppColors.indigo950,
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_showBanner) _AnnouncementBar(onClose: () => setState(() => _showBanner = false)),
            _Hero(wide: wide, onFeatures: () => _scrollTo(_featuresKey), onSteps: () => _scrollTo(_stepsKey)),
            _Features(key: _featuresKey, wide: wide),
            _HowItWorks(key: _stepsKey, wide: wide),
            _FinalCta(wide: wide),
          ],
        ),
      ),
    );
  }
}

class _AnnouncementBar extends StatelessWidget {
  const _AnnouncementBar({required this.onClose});

  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.amber,
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 6, 4, 6),
          child: Row(
            children: [
              const Expanded(
                child: Text.rich(
                  TextSpan(
                    children: [
                      WidgetSpan(
                        alignment: PlaceholderAlignment.middle,
                        child: Icon(Icons.auto_awesome_rounded, size: 16, color: AppColors.indigo950),
                      ),
                      TextSpan(text: '  Novidade: telemedicina 24h com veterinários especialistas'),
                    ],
                  ),
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppColors.indigo950, fontWeight: FontWeight.w600, fontSize: 12),
                ),
              ),
              IconButton(
                visualDensity: VisualDensity.compact,
                tooltip: 'Fechar',
                onPressed: onClose,
                icon: const Icon(Icons.close_rounded, size: 18, color: AppColors.indigo950),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Hero extends StatelessWidget {
  const _Hero({required this.wide, required this.onFeatures, required this.onSteps});

  final bool wide;
  final VoidCallback onFeatures;
  final VoidCallback onSteps;

  @override
  Widget build(BuildContext context) {
    final titleSize = wide ? 52.0 : 34.0;
    final white = Colors.white;

    return ClipRect(
      child: Stack(
        children: [
          const Positioned.fill(child: CustomPaint(painter: _GridPainter())),
          Positioned(left: -180, bottom: -120, child: _Glow(size: wide ? 560 : 380)),
          Positioned(right: -200, bottom: 40, child: _Glow(size: wide ? 520 : 340)),
          SafeArea(
            top: false,
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1180),
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: wide ? 56 : 24),
                  child: Column(
                    children: [
                      _NavBar(wide: wide, onFeatures: onFeatures, onSteps: onSteps),
                      SizedBox(height: wide ? 88 : 48),
                      const _Pill(text: 'Para cães, gatos e toda a família'),
                      const SizedBox(height: 22),
                      Text.rich(
                        TextSpan(
                          children: [
                            const TextSpan(text: 'A saúde do seu pet\n'),
                            TextSpan(
                              text: 'na palma da mão',
                              style: GoogleFonts.instrumentSerif(
                                fontStyle: FontStyle.italic,
                                fontWeight: FontWeight.w400,
                                color: AppColors.amber,
                                fontSize: titleSize * 1.12,
                                height: 1.05,
                              ),
                            ),
                          ],
                        ),
                        textAlign: TextAlign.center,
                        style: GoogleFonts.plusJakartaSans(
                          color: white,
                          fontSize: titleSize,
                          fontWeight: FontWeight.w700,
                          height: 1.1,
                          letterSpacing: -1.2,
                        ),
                      ),
                      const SizedBox(height: 20),
                      ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 560),
                        child: Text(
                          'Sinais vitais pela coleira inteligente, vacinas e consultas organizadas e '
                          'veterinários a um toque. Tudo em um só app, simples e seguro.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: white.withValues(alpha: 0.75),
                            fontSize: wide ? 15 : 14,
                            height: 1.55,
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),
                      Wrap(
                        spacing: 12,
                        runSpacing: 12,
                        alignment: WrapAlignment.center,
                        children: [
                          FilledButton.icon(
                            style: FilledButton.styleFrom(
                              backgroundColor: AppColors.amber,
                              foregroundColor: AppColors.indigo950,
                            ),
                            onPressed: () => context.go('/entrar?modo=cadastro'),
                            iconAlignment: IconAlignment.end,
                            icon: const Icon(Icons.north_east_rounded, size: 18),
                            label: const Text('Começar agora'),
                          ),
                          FilledButton.icon(
                            style: FilledButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: AppColors.indigo950,
                            ),
                            onPressed: () => context.read<SessionController>().startDemo(),
                            iconAlignment: IconAlignment.end,
                            icon: const Icon(Icons.play_arrow_rounded, size: 20),
                            label: const Text('Ver demonstração'),
                          ),
                        ],
                      ),
                      SizedBox(height: wide ? 64 : 40),
                      const _PreviewFrame(),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _NavBar extends StatelessWidget {
  const _NavBar({required this.wide, required this.onFeatures, required this.onSteps});

  final bool wide;
  final VoidCallback onFeatures;
  final VoidCallback onSteps;

  @override
  Widget build(BuildContext context) {
    final link = TextButton.styleFrom(
      foregroundColor: Colors.white,
      minimumSize: const Size(0, 32),
      padding: const EdgeInsets.symmetric(horizontal: 10),
      textStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13),
    );
    return Padding(
      padding: const EdgeInsets.only(top: 28),
      child: Row(
        children: [
          const PetcareLogo(height: 20),
          const Spacer(),
          if (wide) ...[
            TextButton(style: link, onPressed: onFeatures, child: const Text('Recursos')),
            TextButton(style: link, onPressed: onSteps, child: const Text('Como funciona')),
            TextButton(
              style: link,
              onPressed: () => context.read<SessionController>().startDemo(),
              child: const Text('Demonstração'),
            ),
            const Spacer(),
            TextButton(style: link, onPressed: () => context.go('/entrar'), child: const Text('Entrar')),
            const SizedBox(width: 12),
          ],
          OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.white,
              side: BorderSide(color: AppColors.amber.withValues(alpha: 0.8)),
              minimumSize: const Size(0, 34),
              padding: const EdgeInsets.symmetric(horizontal: 14),
              textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
            ),
            onPressed: () => context.go(wide ? '/entrar?modo=cadastro' : '/entrar'),
            iconAlignment: IconAlignment.end,
            icon: const Icon(Icons.north_east_rounded, size: 14),
            label: Text(wide ? 'Criar conta' : 'Entrar'),
          ),
        ],
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
    decoration: BoxDecoration(
      color: Colors.white.withValues(alpha: 0.04),
      borderRadius: BorderRadius.circular(30),
      border: Border.all(color: AppColors.amber.withValues(alpha: 0.4)),
    ),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 7,
          height: 7,
          decoration: const BoxDecoration(color: AppColors.amber, shape: BoxShape.circle),
        ),
        const SizedBox(width: 8),
        Flexible(
          child: Text(
            text,
            style: const TextStyle(color: AppColors.amber, fontSize: 13, fontWeight: FontWeight.w500),
          ),
        ),
      ],
    ),
  );
}

class _Glow extends StatelessWidget {
  const _Glow({required this.size});

  final double size;

  @override
  Widget build(BuildContext context) => IgnorePointer(
    child: Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [
            AppColors.amber.withValues(alpha: 0.45),
            AppColors.amberDeep.withValues(alpha: 0.12),
            Colors.transparent,
          ],
          stops: const [0, 0.45, 1],
        ),
      ),
    ),
  );
}

class _GridPainter extends CustomPainter {
  const _GridPainter();

  static const cell = 56.0;

  @override
  void paint(Canvas canvas, Size size) {
    final line = Paint()
      ..color = Colors.white.withValues(alpha: 0.045)
      ..strokeWidth = 1;
    final fill = Paint()..color = Colors.white.withValues(alpha: 0.045);
    final cols = (size.width / cell).ceil();
    final rows = math.min(14, (size.height / cell).ceil());
    final offsetX = (size.width - cols * cell) / 2;

    for (var c = 0; c <= cols; c++) {
      final x = offsetX + c * cell;
      canvas.drawLine(Offset(x, 0), Offset(x, rows * cell), line);
    }
    for (var r = 0; r <= rows; r++) {
      canvas.drawLine(Offset(offsetX, r * cell), Offset(offsetX + cols * cell, r * cell), line);
    }
    final rand = math.Random(7);
    for (var i = 0; i < cols * rows ~/ 9; i++) {
      final c = rand.nextInt(cols);
      final r = rand.nextInt(rows);
      final distanceFromCenter = ((c * cell + offsetX) - size.width / 2).abs() / size.width;
      if (distanceFromCenter < 0.18) continue;
      canvas.drawRect(Rect.fromLTWH(offsetX + c * cell + 1, r * cell + 1, cell - 2, cell - 2), fill);
    }

    final fade = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Colors.transparent, AppColors.indigo950],
      ).createShader(Rect.fromLTWH(0, rows * cell * 0.55, size.width, rows * cell * 0.45));
    canvas.drawRect(Rect.fromLTWH(0, rows * cell * 0.55, size.width, rows * cell * 0.45 + 1), fade);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _PreviewFrame extends StatelessWidget {
  const _PreviewFrame();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.08),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
        border: Border.all(color: Colors.white.withValues(alpha: 0.14)),
      ),
      child: ClipRRect(
        borderRadius: const BorderRadius.vertical(top: Radius.circular(22)),
        child: const DashboardPreview(),
      ),
    );
  }
}

class _Features extends StatelessWidget {
  const _Features({super.key, required this.wide});

  final bool wide;

  static const _items = [
    (
      Icons.monitor_heart_rounded,
      AppColors.indigo600,
      'Sinais vitais em tempo real',
      'Batimentos e temperatura medidos pela coleira, com alertas quando algo sai do normal.',
    ),
    (
      Icons.share_location_rounded,
      AppColors.success,
      'GPS e atividade',
      'Passos, distância e os lugares onde seu pet passa o dia — casa, quintal ou parque.',
    ),
    (
      Icons.calendar_month_rounded,
      AppColors.amberDeep,
      'Agenda inteligente',
      'Vacinas, vermífugos, remédios e consultas com lembretes antes de cada cuidado.',
    ),
    (
      Icons.video_call_rounded,
      AppColors.violet,
      'Telemedicina 24h',
      'Fale com clínicos e especialistas por vídeo, sem sair de casa.',
    ),
    (
      Icons.folder_rounded,
      AppColors.sky,
      'Documentos organizados',
      'Carteira de vacinação, receitas e exames sempre à mão, separados por pet.',
    ),
    (
      Icons.family_restroom_rounded,
      AppColors.rose,
      'Toda a família',
      'Vários pets no mesmo app, com histórico individual de cada um.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      color: AppColors.canvasLight,
      padding: EdgeInsets.symmetric(horizontal: wide ? 40 : 20, vertical: wide ? 96 : 56),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1180),
          child: Column(
            children: [
              const _SectionEyebrow('Recursos'),
              const SizedBox(height: 12),
              Text(
                'Tudo o que seu pet precisa,\nnum só lugar',
                textAlign: TextAlign.center,
                style: theme.textTheme.headlineMedium?.copyWith(
                  color: AppColors.indigo950,
                  fontSize: wide ? 34 : 26,
                  height: 1.15,
                ),
              ),
              const SizedBox(height: 40),
              LayoutBuilder(
                builder: (context, c) {
                  final columns = c.maxWidth >= 900 ? 3 : (c.maxWidth >= 560 ? 2 : 1);
                  final itemWidth = (c.maxWidth - (columns - 1) * 16) / columns;
                  return Wrap(
                    spacing: 16,
                    runSpacing: 16,
                    children: [
                      for (final (icon, color, title, text) in _items)
                        SizedBox(
                          width: itemWidth,
                          child: Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(24),
                              border: Border.all(color: AppColors.outlineLight),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: color.withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Icon(icon, color: color),
                                ),
                                const SizedBox(height: 18),
                                Text(title, style: theme.textTheme.titleMedium?.copyWith(color: AppColors.indigo950)),
                                const SizedBox(height: 6),
                                Text(
                                  text,
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    color: const Color(0xFF6B6F86),
                                    height: 1.45,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SectionEyebrow extends StatelessWidget {
  const _SectionEyebrow(this.text, {this.onDark = false});

  final String text;
  final bool onDark;

  @override
  Widget build(BuildContext context) => Text(
    text.toUpperCase(),
    style: TextStyle(
      color: onDark ? AppColors.amber : AppColors.indigo600,
      fontWeight: FontWeight.w800,
      letterSpacing: 2,
      fontSize: 12,
    ),
  );
}

class _HowItWorks extends StatelessWidget {
  const _HowItWorks({super.key, required this.wide});

  final bool wide;

  static const _steps = [
    ('Crie sua conta', 'Cadastre-se em menos de um minuto e adicione seus pets.'),
    ('Pareie a coleira', 'Informe o código da coleira PetCare para ativar o monitoramento.'),
    ('Acompanhe tudo', 'Receba alertas, organize cuidados e fale com veterinários.'),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final steps = [
      for (final (i, (title, text)) in _steps.indexed)
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.05),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '0${i + 1}',
                style: GoogleFonts.instrumentSerif(color: AppColors.amber, fontSize: 44, fontStyle: FontStyle.italic),
              ),
              const SizedBox(height: 8),
              Text(title, style: theme.textTheme.titleMedium?.copyWith(color: Colors.white)),
              const SizedBox(height: 6),
              Text(text, style: theme.textTheme.bodyMedium?.copyWith(color: Colors.white70, height: 1.45)),
            ],
          ),
        ),
    ];

    return Container(
      color: AppColors.indigo950,
      padding: EdgeInsets.symmetric(horizontal: wide ? 40 : 20, vertical: wide ? 96 : 56),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1180),
          child: Column(
            children: [
              const _SectionEyebrow('Como funciona', onDark: true),
              const SizedBox(height: 12),
              Text(
                'Comece a cuidar melhor em 3 passos',
                textAlign: TextAlign.center,
                style: theme.textTheme.headlineMedium?.copyWith(color: Colors.white, fontSize: wide ? 34 : 26),
              ),
              const SizedBox(height: 40),
              if (wide)
                IntrinsicHeight(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      for (final (i, s) in steps.indexed) ...[if (i > 0) const SizedBox(width: 16), Expanded(child: s)],
                    ],
                  ),
                )
              else
                Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [for (final s in steps) Padding(padding: const EdgeInsets.only(bottom: 12), child: s)],
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FinalCta extends StatelessWidget {
  const _FinalCta({required this.wide});

  final bool wide;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      color: AppColors.canvasLight,
      padding: EdgeInsets.fromLTRB(wide ? 40 : 20, wide ? 80 : 48, wide ? 40 : 20, 32),
      child: SafeArea(
        top: false,
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1180),
            child: Column(
              children: [
                Container(
                  width: double.infinity,
                  padding: EdgeInsets.all(wide ? 56 : 28),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(32),
                    gradient: const LinearGradient(
                      colors: [AppColors.indigo900, AppColors.indigo600],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: Column(
                    children: [
                      Text.rich(
                        TextSpan(
                          children: [
                            const TextSpan(text: 'Seu melhor amigo merece '),
                            TextSpan(
                              text: 'o melhor cuidado',
                              style: GoogleFonts.instrumentSerif(
                                fontStyle: FontStyle.italic,
                                color: AppColors.amber,
                                fontWeight: FontWeight.w400,
                              ),
                            ),
                          ],
                        ),
                        textAlign: TextAlign.center,
                        style: theme.textTheme.headlineMedium?.copyWith(color: Colors.white, fontSize: wide ? 32 : 24),
                      ),
                      const SizedBox(height: 24),
                      Wrap(
                        spacing: 12,
                        runSpacing: 12,
                        alignment: WrapAlignment.center,
                        children: [
                          FilledButton(
                            style: FilledButton.styleFrom(
                              backgroundColor: AppColors.amber,
                              foregroundColor: AppColors.indigo950,
                            ),
                            onPressed: () => context.go('/entrar?modo=cadastro'),
                            child: const Text('Criar conta grátis'),
                          ),
                          OutlinedButton(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.white,
                              side: const BorderSide(color: Colors.white54),
                            ),
                            onPressed: () => context.go('/entrar'),
                            child: const Text('Já tenho conta'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                Wrap(
                  alignment: WrapAlignment.spaceBetween,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  spacing: 16,
                  runSpacing: 8,
                  children: [
                    const PetcareLogo(height: 16),
                    Text(
                      '© ${DateTime.now().year} PetCare • Feito com carinho para quem tem pet',
                      style: theme.textTheme.bodySmall?.copyWith(color: const Color(0xFF6B6F86)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
