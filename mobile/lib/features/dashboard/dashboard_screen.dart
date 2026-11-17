import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../core/format.dart';
import '../../core/theme/app_colors.dart';
import '../../data/models.dart';
import '../../state/pets_controller.dart';
import '../../state/session_controller.dart';
import '../../widgets/async_view.dart';
import '../../widgets/cards.dart';
import '../../widgets/charts.dart';
import '../../widgets/page.dart';
import '../agenda/event_row.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  var _version = 0;

  @override
  Widget build(BuildContext context) {
    final user = context.select<SessionController, AppUser?>((s) => s.user);
    final controller = context.watch<PetsController>();
    final pet = controller.selected;

    return PageScaffold(
      compact: true,
      title: '${Fmt.greeting()}, ${user?.firstName ?? ''}',
      subtitle: pet == null
          ? 'Vamos começar cadastrando o seu pet.'
          : 'Acompanhe a saúde e a rotina de ${pet.name} hoje.',
      trailing: controller.pets.isEmpty
          ? null
          : const PetSwitcher(inline: true),
      belowTitle: const _QuickActions(),
      onRefresh: () async {
        await controller.refreshNotifications();
        setState(() => _version++);
      },
      children: [
        WithSelectedPet(
          builder: (context, pet) => AsyncView<DashboardData>(
            key: ValueKey('${pet.id}-$_version'),
            load: () => controller.repository.dashboard(pet.id),
            builder: (context, data, _) => _DashboardContent(data: data),
          ),
        ),
      ],
    );
  }
}

class _QuickActions extends StatelessWidget {
  const _QuickActions({this.alignment = WrapAlignment.start});

  final WrapAlignment alignment;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    Widget action(IconData icon, String label, String path, {Color? color}) =>
        Material(
          type: MaterialType.transparency,
          child: InkWell(
            onTap: () => context.go(path),
            borderRadius: BorderRadius.circular(20),
            child: Ink(
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: theme.colorScheme.outlineVariant),
              ),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(10, 6, 12, 6),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      icon,
                      size: 16,
                      color: color ?? theme.colorScheme.primary,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      label,
                      style: theme.textTheme.labelMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );

    return Wrap(
      alignment: alignment,
      spacing: 8,
      runSpacing: 8,
      children: [
        action(
          Icons.add_circle_outline_rounded,
          'Agendar cuidado',
          '/app/agenda',
        ),
        action(
          Icons.video_call_rounded,
          'Falar com vet',
          '/app/telemedicina',
          color: AppColors.amberDeep,
        ),
        action(Icons.monitor_heart_rounded, 'Sinais vitais', '/app/saude'),
        action(Icons.folder_rounded, 'Documentos', '/app/documentos'),
      ],
    );
  }
}

class _DashboardContent extends StatelessWidget {
  const _DashboardContent({required this.data});

  final DashboardData data;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, c) {
        final w = c.maxWidth;
        final wide = w >= 980;
        final gap = wide ? 12.0 : 16.0;

        if (!data.hasCollar) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _NoCollarCard(petName: data.pet.name),
              SizedBox(height: gap),
              _UpcomingCard(data: data),
              SizedBox(height: gap),
              _CareTeamCard(team: data.careTeam),
            ],
          );
        }

        final stats = _stats(context, compact: wide);
        final weekly = _WeeklyActivityCard(
          data: data,
          height: wide ? 132 : 180,
          dense: wide,
        );
        final donut = _LocationsCard(
          data: data,
          height: wide ? 118 : 180,
          dense: wide,
        );
        final upcoming = _UpcomingCard(data: data, dense: wide);
        final team = _CareTeamCard(team: data.careTeam, dense: wide);

        if (wide) {
          return Column(
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  for (final (i, s) in stats.indexed) ...[
                    if (i > 0) SizedBox(width: gap),
                    Expanded(child: s),
                  ],
                ],
              ),
              SizedBox(height: gap),
              _ActivityBeside(data: data, gap: gap, upcoming: upcoming),
              SizedBox(height: gap),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(flex: 3, child: donut),
                  SizedBox(width: gap),
                  Expanded(flex: 2, child: team),
                ],
              ),
            ],
          );
        }

        final statsRow = w >= 720
            ? Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  for (final (i, s) in stats.indexed) ...[
                    if (i > 0) const SizedBox(width: 12),
                    Expanded(child: s),
                  ],
                ],
              )
            : SizedBox(
                height: 210,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  clipBehavior: Clip.none,
                  itemCount: stats.length,
                  separatorBuilder: (_, _) => const SizedBox(width: 12),
                  itemBuilder: (_, i) => SizedBox(
                    width: (w * 0.8).clamp(240, 320),
                    child: stats[i],
                  ),
                ),
              );

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            statsRow,
            SizedBox(height: gap),
            weekly,
            SizedBox(height: gap),
            if (w >= 720)
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(child: donut),
                  SizedBox(width: gap),
                  Expanded(child: team),
                ],
              )
            else ...[
              donut,
              SizedBox(height: gap),
              team,
            ],
            SizedBox(height: gap),
            upcoming,
          ],
        );
      },
    );
  }

  List<Widget> _stats(BuildContext context, {required bool compact}) {
    final hr = data.heartRate;
    final temp = data.temperature;
    final steps = data.steps;
    String range(Range? r, {int decimals = 0}) => r == null
        ? ''
        : decimals == 0
        ? '${r.min.round()}–${r.max.round()}'
        : '${Fmt.decimal1(r.min)}–${Fmt.decimal1(r.max)}';

    return [
      StatCard(
        title: 'Batimentos',
        value: Fmt.integer(hr.value),
        unit: hr.unit,
        icon: Icons.favorite_rounded,
        color: AppColors.indigo600,
        progress: hr.progress,
        changePct: hr.changePct,
        alert: hr.isAlert,
        caption: hr.isAlert
            ? 'Agora ${Fmt.integer(hr.latest ?? 0)} bpm • fora da faixa'
            : 'Média 24h • faixa ${range(hr.normalRange)}',
        compact: compact,
        footer: hr.isAlert ? const _VetLink() : null,
      ),
      StatCard(
        title: 'Temperatura',
        value: Fmt.decimal1(temp.value),
        unit: temp.unit,
        icon: Icons.thermostat_rounded,
        color: AppColors.amberDeep,
        progress: temp.progress,
        changePct: temp.changePct,
        alert: temp.isAlert,
        caption: temp.isAlert
            ? 'Agora ${Fmt.decimal1(temp.latest ?? 0)} °C • acima do normal'
            : 'Média 24h • faixa ${range(temp.normalRange, decimals: 1)} °C',
        compact: compact,
        footer: temp.isAlert ? const _VetLink() : null,
      ),
      StatCard(
        title: 'Passos',
        value: Fmt.integer(steps.value),
        unit: '',
        icon: Icons.directions_walk_rounded,
        color: AppColors.success,
        progress: steps.progress,
        changePct: steps.changePct,
        caption: 'Últimas 24h • meta ${Fmt.integer(steps.goal ?? 0)}',
        compact: compact,
      ),
    ];
  }
}

class _VetLink extends StatelessWidget {
  const _VetLink();

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: TextButton.icon(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.danger,
          minimumSize: const Size(0, 30),
          padding: const EdgeInsets.symmetric(horizontal: 8),
          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          textStyle: const TextStyle(
            fontSize: 12.5,
            fontWeight: FontWeight.w700,
          ),
        ),
        onPressed: () => context.go('/app/telemedicina'),
        icon: const Icon(Icons.video_call_rounded, size: 16),
        label: const Text('Falar com um vet'),
      ),
    );
  }
}

class _ActivityBeside extends StatefulWidget {
  const _ActivityBeside({
    required this.data,
    required this.gap,
    required this.upcoming,
  });

  final DashboardData data;
  final double gap;
  final Widget upcoming;

  @override
  State<_ActivityBeside> createState() => _ActivityBesideState();
}

class _ActivityBesideState extends State<_ActivityBeside> {
  final _upcomingKey = GlobalKey();
  double? _height;

  void _syncHeight() {
    final next = _upcomingKey.currentContext?.size?.height;
    if (!mounted || next == null) return;
    if (_height != null && (next - _height!).abs() < 1) return;
    setState(() => _height = next);
  }

  @override
  Widget build(BuildContext context) {
    WidgetsBinding.instance.addPostFrameCallback((_) => _syncHeight());
    final activity = _WeeklyActivityCard(
      data: widget.data,
      dense: true,
      expand: _height != null,
      height: 132,
    );
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 3,
          child: _height == null
              ? activity
              : SizedBox(height: _height, child: activity),
        ),
        SizedBox(width: widget.gap),
        Expanded(
          flex: 2,
          child: KeyedSubtree(key: _upcomingKey, child: widget.upcoming),
        ),
      ],
    );
  }
}

class _WeeklyActivityCard extends StatelessWidget {
  const _WeeklyActivityCard({
    required this.data,
    this.height = 220,
    this.dense = false,
    this.expand = false,
  });

  final DashboardData data;
  final double height;
  final bool dense;
  final bool expand;

  @override
  Widget build(BuildContext context) {
    final week = data.weeklyActivity;
    final total = week.fold<int>(0, (a, d) => a + d.activeMinutes);
    final goal = week.isEmpty ? 0 : week.first.goalMinutes;
    final bars = [
      for (final d in week)
        BarDatum(label: d.label, value: d.activeMinutes.toDouble()),
    ];
    return SectionCard(
      title: 'Atividade semanal',
      subtitle: 'Minutos ativos por dia • meta de $goal min',
      trailing: StatusChip(
        label: Fmt.duration(total),
        color: AppColors.indigo600,
      ),
      padding: dense
          ? const EdgeInsets.fromLTRB(16, 12, 16, 12)
          : const EdgeInsets.all(24),
      headerGap: dense ? 8 : 20,
      expandChild: expand,
      child: expand
          ? LayoutBuilder(
              builder: (context, constraints) => TrackBarChart(
                height: constraints.maxHeight,
                data: bars,
                formatValue: (v) => '${v.round()}',
                tooltipSuffix: ' min',
              ),
            )
          : TrackBarChart(
              height: height,
              data: bars,
              formatValue: (v) => '${v.round()}',
              tooltipSuffix: ' min',
            ),
    );
  }
}

class _LocationsCard extends StatelessWidget {
  const _LocationsCard({
    required this.data,
    this.height = 200,
    this.dense = false,
  });

  final DashboardData data;
  final double height;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    final hours = data.locations.fold<int>(0, (a, l) => a + l.minutes) ~/ 60;
    return SectionCard(
      title: 'Onde ${data.pet.name} passa o tempo',
      subtitle: 'Últimos 7 dias, pela coleira',
      padding: dense
          ? const EdgeInsets.fromLTRB(16, 12, 16, 12)
          : const EdgeInsets.all(24),
      headerGap: dense ? 8 : 20,
      child: data.locations.isEmpty
          ? SizedBox(
              height: height,
              child: const Center(child: Text('Sem dados de localização')),
            )
          : LocationDonut(
              locations: data.locations,
              centerValue: '${hours}h',
              centerLabel: 'monitoradas',
              height: height,
            ),
    );
  }
}

class _UpcomingCard extends StatelessWidget {
  const _UpcomingCard({required this.data, this.dense = false});

  final DashboardData data;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      title: 'Próximos cuidados',
      subtitle: 'Consultas, vacinas e medicações de ${data.pet.name}',
      trailing: TextButton(
        style: TextButton.styleFrom(
          minimumSize: const Size(0, 32),
          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
        ),
        onPressed: () => context.go('/app/agenda'),
        child: const Text('Ver agenda'),
      ),
      padding: dense
          ? const EdgeInsets.fromLTRB(16, 12, 16, 8)
          : const EdgeInsets.all(24),
      headerGap: dense ? 4 : 20,
      child: data.upcomingEvents.isEmpty
          ? const Padding(
              padding: EdgeInsets.symmetric(vertical: 24),
              child: Center(
                child: Text(
                  'Nenhum cuidado agendado. Que tal criar um lembrete?',
                ),
              ),
            )
          : Column(
              children: [
                for (final (i, e) in data.upcomingEvents.indexed) ...[
                  if (i > 0) Divider(height: dense ? 1 : 4),
                  EventRow(
                    event: e,
                    dense: dense,
                    onTap: () => context.go('/app/agenda'),
                  ),
                ],
              ],
            ),
    );
  }
}

class _CareTeamCard extends StatelessWidget {
  const _CareTeamCard({required this.team, this.dense = false});

  final List<CareMember> team;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SectionCard(
      title: 'Equipe de cuidado',
      subtitle: 'Profissionais que acompanham seus pets',
      padding: dense
          ? const EdgeInsets.fromLTRB(16, 12, 16, 8)
          : const EdgeInsets.all(24),
      headerGap: dense ? 4 : 20,
      child: team.isEmpty
          ? const Padding(
              padding: EdgeInsets.all(16),
              child: Text('Nenhum profissional cadastrado.'),
            )
          : Column(
              children: [
                for (final (i, m) in team.indexed)
                  Padding(
                    padding: EdgeInsets.symmetric(vertical: dense ? 3 : 8),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: dense ? 16 : 21,
                          backgroundColor: AppColors
                              .chart[i % AppColors.chart.length]
                              .withValues(alpha: 0.15),
                          child: Text(
                            m.name
                                .replaceFirst(RegExp(r'^(Dra?\.)\s*'), '')
                                .characters
                                .first,
                            style: TextStyle(
                              fontWeight: FontWeight.w800,
                              color:
                                  AppColors.chart[i % AppColors.chart.length],
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                m.name,
                                style: theme.textTheme.titleSmall?.copyWith(
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              Text(
                                [
                                  m.role,
                                  if (m.lastContactAt != null)
                                    Fmt.timeAgo(m.lastContactAt!),
                                ].join(' • '),
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: theme.colorScheme.onSurfaceVariant,
                                ),
                              ),
                            ],
                          ),
                        ),
                        StarRating(rating: m.rating, size: dense ? 13 : 15),
                      ],
                    ),
                  ),
              ],
            ),
    );
  }
}

class _NoCollarCard extends StatelessWidget {
  const _NoCollarCard({required this.petName});

  final String petName;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: const LinearGradient(
          colors: [AppColors.indigo950, AppColors.indigo700],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.sensors_rounded, color: AppColors.amber, size: 32),
          const SizedBox(height: 12),
          Text(
            'Pareie a coleira de $petName',
            style: theme.textTheme.titleLarge?.copyWith(color: Colors.white),
          ),
          const SizedBox(height: 6),
          Text(
            'Com a coleira PetCare você acompanha batimentos, temperatura, passos e localização em tempo real.',
            style: theme.textTheme.bodyMedium?.copyWith(color: Colors.white70),
          ),
          const SizedBox(height: 16),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.amber,
              foregroundColor: AppColors.indigo950,
            ),
            onPressed: () => context.go('/app/pets'),
            child: const Text('Configurar coleira'),
          ),
        ],
      ),
    );
  }
}
