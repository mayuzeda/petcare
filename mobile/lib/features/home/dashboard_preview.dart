import 'package:material_ui/material_ui.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models.dart';
import '../../widgets/brand.dart';
import '../../widgets/cards.dart';
import '../../widgets/charts.dart';
import '../shell/nav_items.dart';

/// Miniatura não interativa do dashboard, usada na home pública.
class DashboardPreview extends StatelessWidget {
  const DashboardPreview({super.key});

  static const _canvas = Size(1120, 720);

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Theme(
        data: AppTheme.light(),
        child: FittedBox(
          fit: BoxFit.fitWidth,
          alignment: Alignment.topCenter,
          child: SizedBox.fromSize(
            size: _canvas,
            child: const ColoredBox(
              color: AppColors.canvasLight,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _MiniMenu(),
                  Expanded(child: _MiniContent()),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _MiniMenu extends StatelessWidget {
  const _MiniMenu();

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      width: 220,
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(18, 22, 18, 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const PetcareLogo(height: 22),
          const SizedBox(height: 26),
          for (final (i, item) in navGroups.first.items.indexed)
            Container(
              height: 42,
              margin: const EdgeInsets.only(bottom: 4),
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(color: i == 0 ? scheme.primary : null, borderRadius: BorderRadius.circular(12)),
              child: Row(
                children: [
                  Icon(
                    i == 0 ? item.selectedIcon : item.icon,
                    size: 19,
                    color: i == 0 ? Colors.white : scheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 12),
                  Flexible(
                    child: Text(
                      item.label,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 13.5,
                        fontWeight: i == 0 ? FontWeight.w700 : FontWeight.w500,
                        color: i == 0 ? Colors.white : scheme.onSurface,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: AppColors.amberSoft, borderRadius: BorderRadius.circular(16)),
            child: const Row(
              children: [
                Icon(Icons.video_call_rounded, color: AppColors.amberDeep),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Vet online agora',
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Color(0xFF8A4B00)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MiniContent extends StatelessWidget {
  const _MiniContent();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    return Padding(
      padding: const EdgeInsets.fromLTRB(26, 20, 26, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 260,
                height: 40,
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: scheme.outlineVariant),
                ),
                child: Row(
                  children: [
                    Icon(Icons.search_rounded, size: 18, color: scheme.onSurfaceVariant),
                    const SizedBox(width: 8),
                    Text('Buscar…', style: TextStyle(color: scheme.onSurfaceVariant, fontSize: 12)),
                  ],
                ),
              ),
              const Spacer(),
              Icon(Icons.notifications_none_rounded, color: scheme.onSurfaceVariant),
              const SizedBox(width: 16),
              const CircleAvatar(
                radius: 16,
                backgroundColor: AppColors.indigo100,
                child: Text(
                  'G',
                  style: TextStyle(color: AppColors.indigo700, fontWeight: FontWeight.w800),
                ),
              ),
              const SizedBox(width: 8),
              const Text('Gustavo', style: TextStyle(fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 20),
          Text('Bom dia, Gustavo', style: theme.textTheme.headlineSmall),
          Text(
            'Acompanhe a saúde e a rotina da Bella hoje.',
            style: theme.textTheme.bodyMedium?.copyWith(color: scheme.onSurfaceVariant),
          ),
          const SizedBox(height: 16),
          const Row(
            children: [
              Expanded(
                child: StatCard(
                  title: 'Batimentos',
                  value: '82',
                  unit: 'bpm',
                  icon: Icons.favorite_rounded,
                  color: AppColors.indigo600,
                  progress: 0.96,
                  changePct: 3.4,
                  caption: 'Média 24h • faixa 60–140',
                ),
              ),
              SizedBox(width: 14),
              Expanded(
                child: StatCard(
                  title: 'Temperatura',
                  value: '38,3',
                  unit: '°C',
                  icon: Icons.thermostat_rounded,
                  color: AppColors.amberDeep,
                  progress: 0.92,
                  changePct: -0.5,
                  caption: 'Média 24h • faixa 37,5–39,2 °C',
                ),
              ),
              SizedBox(width: 14),
              Expanded(
                child: StatCard(
                  title: 'Passos',
                  value: '8.450',
                  unit: '',
                  icon: Icons.directions_walk_rounded,
                  color: AppColors.success,
                  progress: 0.84,
                  changePct: 12.7,
                  caption: 'Últimas 24h • meta 10.000',
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  flex: 3,
                  child: SectionCard(
                    title: 'Atividade semanal',
                    subtitle: 'Minutos ativos por dia',
                    child: TrackBarChart(
                      height: 190,
                      formatValue: _minutes,
                      data: [
                        BarDatum(label: 'Qua', value: 132),
                        BarDatum(label: 'Qui', value: 158),
                        BarDatum(label: 'Sex', value: 176),
                        BarDatum(label: 'Sáb', value: 121),
                        BarDatum(label: 'Dom', value: 149),
                        BarDatum(label: 'Seg', value: 184),
                        BarDatum(label: 'Ter', value: 96),
                      ],
                    ),
                  ),
                ),
                SizedBox(width: 14),
                Expanded(
                  flex: 2,
                  child: SectionCard(
                    title: 'Onde a Bella passa o tempo',
                    child: LocationDonut(
                      height: 170,
                      centerValue: '168h',
                      centerLabel: 'monitoradas',
                      locations: [
                        LocationShare(location: 'casa', minutes: 5520, percentage: 55),
                        LocationShare(location: 'quintal', minutes: 3600, percentage: 36),
                        LocationShare(location: 'parque', minutes: 480, percentage: 5),
                        LocationShare(location: 'rua', minutes: 360, percentage: 4),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

String _minutes(double v) => '${v.round()}';
