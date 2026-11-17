import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../../core/format.dart';
import '../../core/theme/app_colors.dart';
import '../../data/models.dart';
import '../../state/pets_controller.dart';
import '../../widgets/async_view.dart';
import '../../widgets/cards.dart';
import '../../widgets/charts.dart';
import '../../widgets/page.dart';
import '../health/health_screen.dart';

class ActivityScreen extends StatefulWidget {
  const ActivityScreen({super.key});

  @override
  State<ActivityScreen> createState() => _ActivityScreenState();
}

class _ActivityScreenState extends State<ActivityScreen> {
  var _range = TimeRange.week;

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<PetsController>();
    return PageScaffold(
      title: 'Atividade e GPS',
      subtitle: 'Passos, distância e locais registrados pela coleira',
      trailing: RangeSelector(value: _range, onChanged: (r) => setState(() => _range = r)),
      children: [
        const PetSwitcher(),
        const SizedBox(height: 12),
        WithSelectedPet(
          builder: (context, pet) => !pet.hasCollar
              ? const EmptyState(
                  icon: Icons.location_off_rounded,
                  title: 'Sem coleira pareada',
                  message: 'Pareie a coleira PetCare para ver atividade e localização.',
                )
              : AsyncView<ActivityReport>(
                  key: ValueKey('${pet.id}-${_range.name}'),
                  load: () => controller.repository.activity(pet.id, _range),
                  builder: (context, report, _) => _ActivityContent(report: report, range: _range),
                ),
        ),
      ],
    );
  }
}

class _ActivityContent extends StatelessWidget {
  const _ActivityContent({required this.report, required this.range});

  final ActivityReport report;
  final TimeRange range;

  @override
  Widget build(BuildContext context) {
    final days = switch (range) {
      TimeRange.day => 1,
      TimeRange.week => 7,
      TimeRange.month => 30,
    };
    final goal = report.dailyStepsGoal * days;
    final current = report.locations.isEmpty ? null : report.locations.first;

    final totals = [
      StatCard(
        title: 'Passos',
        value: Fmt.integer(report.totalSteps),
        unit: '',
        icon: Icons.directions_walk_rounded,
        color: AppColors.success,
        progress: goal == 0 ? 0 : report.totalSteps / goal,
        caption: 'Meta do período: ${Fmt.integer(goal)}',
      ),
      StatCard(
        title: 'Distância',
        value: Fmt.decimal1(report.totalDistanceM / 1000),
        unit: 'km',
        icon: Icons.route_rounded,
        color: AppColors.indigo600,
        progress: (report.totalDistanceM / (days * 5000)).clamp(0, 1),
        caption: 'Média de ${Fmt.distance(report.totalDistanceM ~/ days)}/dia',
      ),
      StatCard(
        title: 'Tempo ativo',
        value: Fmt.duration(report.totalActiveMinutes),
        unit: '',
        icon: Icons.timer_rounded,
        color: AppColors.amberDeep,
        progress: (report.totalActiveMinutes / (days * 180)).clamp(0, 1),
        caption: 'Média de ${Fmt.duration(report.totalActiveMinutes ~/ days)}/dia',
      ),
    ];

    final steps = SectionCard(
      title: 'Passos',
      subtitle: range == TimeRange.day ? 'Por hora, últimas 24h' : 'Por dia',
      child: TrackBarChart(
        color: AppColors.success,
        highlightLast: range != TimeRange.day,
        data: [for (final p in report.points) BarDatum(label: p.label, value: p.steps.toDouble())],
        formatValue: (v) => v >= 1000 ? '${(v / 1000).toStringAsFixed(v >= 10000 ? 0 : 1)}k' : '${v.round()}',
        tooltipSuffix: ' passos',
      ),
    );

    final places = SectionCard(
      title: 'Locais frequentados',
      subtitle: current == null ? null : 'Mais tempo em: ${current.label}',
      child: report.locations.isEmpty
          ? const SizedBox(height: 120, child: Center(child: Text('Sem dados de localização')))
          : LocationDonut(
              locations: report.locations,
              centerValue: Fmt.duration(report.locations.fold(0, (a, l) => a + l.minutes)),
              centerLabel: 'monitorados',
            ),
    );

    return LayoutBuilder(
      builder: (context, c) {
        final wide = c.maxWidth >= 900;
        return Column(
          children: [
            if (c.maxWidth >= 720)
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  for (final (i, t) in totals.indexed) ...[if (i > 0) const SizedBox(width: 12), Expanded(child: t)],
                ],
              )
            else
              Column(
                children: [for (final t in totals) Padding(padding: const EdgeInsets.only(bottom: 12), child: t)],
              ),
            const SizedBox(height: 16),
            if (wide)
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(flex: 3, child: steps),
                  const SizedBox(width: 16),
                  Expanded(flex: 2, child: places),
                ],
              )
            else ...[
              steps,
              const SizedBox(height: 16),
              places,
            ],
          ],
        );
      },
    );
  }
}
