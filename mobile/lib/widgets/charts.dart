import 'dart:math' as math;

import 'package:fl_chart/fl_chart.dart';
import 'package:material_ui/material_ui.dart';

import '../core/format.dart';
import '../core/theme/app_colors.dart';
import '../core/ui_meta.dart';
import '../data/models.dart';

TextStyle _axisStyle(BuildContext context) =>
    TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant, fontSize: 11, fontWeight: FontWeight.w500);

/// Arredonda o passo do eixo para 1, 2, 2,5 ou 5 × 10ⁿ.
double _niceStep(double raw) {
  final magnitude = math.pow(10, (math.log(raw) / math.ln10).floor()).toDouble();
  final normalized = raw / magnitude;
  final nice = normalized <= 1 ? 1 : (normalized <= 2 ? 2 : (normalized <= 2.5 ? 2.5 : (normalized <= 5 ? 5 : 10)));
  return nice * magnitude;
}

class BarDatum {
  const BarDatum({required this.label, required this.value, this.target});
  final String label;
  final double value;
  final double? target;
}

/// Barras arredondadas com trilho de fundo (estilo "Income statistic" da referência).
class TrackBarChart extends StatelessWidget {
  const TrackBarChart({
    super.key,
    required this.data,
    required this.formatValue,
    this.tooltipSuffix = '',
    this.height = 220,
    this.highlightLast = true,
    this.color = AppColors.indigo600,
  });

  final List<BarDatum> data;
  final String Function(double) formatValue;
  final String tooltipSuffix;
  final double height;
  final bool highlightLast;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final maxValue = data.fold<double>(0, (m, d) => math.max(m, math.max(d.value, d.target ?? 0)));
    final step = _niceStep(maxValue <= 0 ? 1.0 : maxValue * 1.1 / 4);
    final top = step * 4;
    final labelEvery = data.length > 12 ? (data.length / 6).ceil() : 1;

    return SizedBox(
      height: height,
      child: LayoutBuilder(
        builder: (context, c) {
          final slot = c.maxWidth / math.max(1, data.length);
          final barWidth = (slot * 0.55).clamp(4.0, 34.0);
          return BarChart(
            BarChartData(
              maxY: top,
              alignment: BarChartAlignment.spaceAround,
              borderData: FlBorderData(show: false),
              gridData: FlGridData(
                drawVerticalLine: false,
                horizontalInterval: step,
                getDrawingHorizontalLine: (_) =>
                    FlLine(color: scheme.outlineVariant, strokeWidth: 1, dashArray: [4, 4]),
              ),
              titlesData: FlTitlesData(
                topTitles: const AxisTitles(),
                rightTitles: const AxisTitles(),
                leftTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    reservedSize: 40,
                    interval: step,
                    getTitlesWidget: (value, meta) => value >= top * 0.99
                        ? const SizedBox.shrink()
                        : Text(formatValue(value), style: _axisStyle(context)),
                  ),
                ),
                bottomTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    reservedSize: 28,
                    getTitlesWidget: (value, meta) {
                      final i = value.toInt();
                      if (i < 0 || i >= data.length || i % labelEvery != 0) return const SizedBox.shrink();
                      return Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Text(data[i].label, style: _axisStyle(context)),
                      );
                    },
                  ),
                ),
              ),
              barTouchData: BarTouchData(
                touchTooltipData: BarTouchTooltipData(
                  getTooltipColor: (_) => AppColors.indigo950,
                  tooltipBorderRadius: BorderRadius.circular(10),
                  getTooltipItem: (group, groupIndex, rod, rodIndex) => BarTooltipItem(
                    '${data[group.x].label}\n${formatValue(rod.toY)}$tooltipSuffix',
                    const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 12),
                  ),
                ),
              ),
              barGroups: [
                for (var i = 0; i < data.length; i++)
                  BarChartGroupData(
                    x: i,
                    barRods: [
                      BarChartRodData(
                        toY: data[i].value,
                        width: barWidth,
                        color: highlightLast && i == data.length - 1 ? AppColors.amber : color,
                        borderRadius: BorderRadius.circular(barWidth / 2.6),
                        backDrawRodData: BackgroundBarChartRodData(
                          show: true,
                          toY: top,
                          color: color.withValues(alpha: 0.07),
                        ),
                      ),
                    ],
                  ),
              ],
            ),
            duration: const Duration(milliseconds: 500),
          );
        },
      ),
    );
  }
}

/// Donut com total no centro e legenda.
class LocationDonut extends StatelessWidget {
  const LocationDonut({
    super.key,
    required this.locations,
    required this.centerLabel,
    required this.centerValue,
    this.height = 200,
  });

  final List<LocationShare> locations;
  final String centerLabel;
  final String centerValue;
  final double height;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      children: [
        SizedBox(
          height: height,
          child: Stack(
            alignment: Alignment.center,
            children: [
              PieChart(
                PieChartData(
                  startDegreeOffset: -90,
                  sectionsSpace: 3,
                  centerSpaceRadius: height * 0.29,
                  sections: [
                    for (var i = 0; i < locations.length; i++)
                      PieChartSectionData(
                        value: locations[i].percentage,
                        color: locationColor(i),
                        radius: height * 0.17,
                        showTitle: false,
                      ),
                  ],
                ),
              ),
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(centerValue, style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800)),
                  Text(
                    centerLabel,
                    style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Wrap(
          spacing: 16,
          runSpacing: 10,
          alignment: WrapAlignment.center,
          children: [
            for (var i = 0; i < locations.length; i++)
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(color: locationColor(i), borderRadius: BorderRadius.circular(3)),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    '${locations[i].label} ${Fmt.decimal1(locations[i].percentage)}%',
                    style: theme.textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w600),
                  ),
                ],
              ),
          ],
        ),
      ],
    );
  }
}

/// Linha suave com faixa de referência (normal) destacada.
class RangeLineChart extends StatelessWidget {
  const RangeLineChart({
    super.key,
    required this.labels,
    required this.values,
    required this.normal,
    required this.color,
    required this.unit,
    this.decimals = 0,
    this.height = 220,
  });

  final List<String> labels;
  final List<double> values;
  final Range normal;
  final Color color;
  final String unit;
  final int decimals;
  final double height;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    if (values.isEmpty) return SizedBox(height: height);
    final lo = math.min(values.reduce(math.min), normal.min);
    final hi = math.max(values.reduce(math.max), normal.max);
    final pad = (hi - lo) * 0.15 + (decimals > 0 ? 0.2 : 4);
    final minY = lo - pad;
    final maxY = hi + pad;
    final labelEvery = labels.length > 10 ? (labels.length / 6).ceil() : 1;

    String fmt(double v) => decimals == 0 ? v.round().toString() : Fmt.decimal1(v);

    return SizedBox(
      height: height,
      child: LineChart(
        LineChartData(
          minY: minY,
          maxY: maxY,
          minX: 0,
          maxX: (values.length - 1).toDouble(),
          borderData: FlBorderData(show: false),
          gridData: FlGridData(
            drawVerticalLine: false,
            horizontalInterval: (maxY - minY) / 4,
            getDrawingHorizontalLine: (_) => FlLine(color: scheme.outlineVariant, strokeWidth: 1, dashArray: [4, 4]),
          ),
          rangeAnnotations: RangeAnnotations(
            horizontalRangeAnnotations: [
              HorizontalRangeAnnotation(
                y1: normal.min,
                y2: normal.max,
                color: AppColors.success.withValues(alpha: 0.08),
              ),
            ],
          ),
          titlesData: FlTitlesData(
            topTitles: const AxisTitles(),
            rightTitles: const AxisTitles(),
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 40,
                interval: (maxY - minY) / 4,
                getTitlesWidget: (value, meta) => value == meta.max || value == meta.min
                    ? const SizedBox.shrink()
                    : Text(fmt(value), style: _axisStyle(context)),
              ),
            ),
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 28,
                interval: 1,
                getTitlesWidget: (value, meta) {
                  final i = value.toInt();
                  if (value != i.toDouble() || i < 0 || i >= labels.length || i % labelEvery != 0) {
                    return const SizedBox.shrink();
                  }
                  return Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(labels[i], style: _axisStyle(context)),
                  );
                },
              ),
            ),
          ),
          lineTouchData: LineTouchData(
            touchTooltipData: LineTouchTooltipData(
              getTooltipColor: (_) => AppColors.indigo950,
              tooltipBorderRadius: BorderRadius.circular(10),
              getTooltipItems: (spots) => [
                for (final s in spots)
                  LineTooltipItem(
                    '${labels[s.x.toInt()]}\n${fmt(s.y)} $unit',
                    const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 12),
                  ),
              ],
            ),
          ),
          lineBarsData: [
            LineChartBarData(
              spots: [for (var i = 0; i < values.length; i++) FlSpot(i.toDouble(), values[i])],
              isCurved: true,
              preventCurveOverShooting: true,
              color: color,
              barWidth: 3,
              dotData: FlDotData(
                getDotPainter: (spot, _, _, _) => FlDotCirclePainter(
                  radius: 3,
                  color: spot.y > normal.max || spot.y < normal.min ? AppColors.danger : color,
                  strokeWidth: 2,
                  strokeColor: scheme.surface,
                ),
                checkToShowDot: (spot, _) => values.length <= 31,
              ),
              belowBarData: BarAreaData(
                show: true,
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [color.withValues(alpha: 0.25), color.withValues(alpha: 0)],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
