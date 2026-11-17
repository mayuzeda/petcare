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

class RangeSelector extends StatelessWidget {
  const RangeSelector({super.key, required this.value, required this.onChanged});

  final TimeRange value;
  final ValueChanged<TimeRange> onChanged;

  @override
  Widget build(BuildContext context) => SegmentedButton<TimeRange>(
    showSelectedIcon: false,
    segments: [for (final r in TimeRange.values) ButtonSegment(value: r, label: Text(r.label))],
    selected: {value},
    onSelectionChanged: (s) => onChanged(s.first),
  );
}

class HealthScreen extends StatefulWidget {
  const HealthScreen({super.key});

  @override
  State<HealthScreen> createState() => _HealthScreenState();
}

class _HealthScreenState extends State<HealthScreen> {
  var _range = TimeRange.day;

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<PetsController>();
    return PageScaffold(
      title: 'Sinais vitais',
      subtitle: controller.selected == null ? null : 'Batimentos e temperatura de ${controller.selected!.name}',
      trailing: RangeSelector(value: _range, onChanged: (r) => setState(() => _range = r)),
      children: [
        const PetSwitcher(),
        const SizedBox(height: 12),
        WithSelectedPet(
          builder: (context, pet) => !pet.hasCollar
              ? const EmptyState(
                  icon: Icons.sensors_off_rounded,
                  title: 'Sem coleira pareada',
                  message: 'Pareie a coleira PetCare para acompanhar os sinais vitais.',
                )
              : AsyncView<HealthReport>(
                  key: ValueKey('${pet.id}-${_range.name}'),
                  load: () => controller.repository.health(pet.id, _range),
                  builder: (context, report, _) => _HealthContent(report: report),
                ),
        ),
      ],
    );
  }
}

class _HealthContent extends StatelessWidget {
  const _HealthContent({required this.report});

  final HealthReport report;

  @override
  Widget build(BuildContext context) {
    final labels = [for (final p in report.points) p.label];
    final heart = SectionCard(
      title: 'Batimentos cardíacos',
      subtitle: 'Faixa de referência: ${report.heartRateRange.min.round()}–${report.heartRateRange.max.round()} bpm',
      child: Column(
        children: [
          _SummaryRow(summary: report.heartRate, unit: 'bpm', decimals: 0, color: AppColors.indigo600),
          const SizedBox(height: 16),
          RangeLineChart(
            labels: labels,
            values: [for (final p in report.points) p.heartRate.toDouble()],
            normal: report.heartRateRange,
            color: AppColors.indigo600,
            unit: 'bpm',
          ),
        ],
      ),
    );
    final temperature = SectionCard(
      title: 'Temperatura corporal',
      subtitle:
          'Faixa de referência: ${Fmt.decimal1(report.temperatureRange.min)}–${Fmt.decimal1(report.temperatureRange.max)} °C',
      child: Column(
        children: [
          _SummaryRow(summary: report.temperature, unit: '°C', decimals: 1, color: AppColors.amberDeep),
          const SizedBox(height: 16),
          RangeLineChart(
            labels: labels,
            values: [for (final p in report.points) p.temperature],
            normal: report.temperatureRange,
            color: AppColors.amberDeep,
            unit: '°C',
            decimals: 1,
          ),
        ],
      ),
    );

    return LayoutBuilder(
      builder: (context, c) => c.maxWidth >= 980
          ? Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(child: heart),
                const SizedBox(width: 16),
                Expanded(child: temperature),
              ],
            )
          : Column(children: [heart, const SizedBox(height: 16), temperature]),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({required this.summary, required this.unit, required this.decimals, required this.color});

  final SeriesSummary summary;
  final String unit;
  final int decimals;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    String fmt(double v) => decimals == 0 ? Fmt.integer(v) : Fmt.decimal1(v);
    Widget cell(String label, double v) => Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
        decoration: BoxDecoration(color: color.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(14)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
            Text('${fmt(v)} $unit', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)),
          ],
        ),
      ),
    );
    return Row(
      children: [
        cell('Mínima', summary.min),
        const SizedBox(width: 8),
        cell('Média', summary.avg),
        const SizedBox(width: 8),
        cell('Máxima', summary.max),
      ],
    );
  }
}
