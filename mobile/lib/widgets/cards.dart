import 'dart:math' as math;

import 'package:material_ui/material_ui.dart';

import '../core/format.dart';
import '../core/theme/app_colors.dart';

class SectionCard extends StatelessWidget {
  const SectionCard({
    super.key,
    this.title,
    this.subtitle,
    this.trailing,
    required this.child,
    this.padding = const EdgeInsets.all(24),
    this.headerGap = 20,
    this.expandChild = false,
  });

  final String? title;
  final String? subtitle;
  final Widget? trailing;
  final Widget child;
  final EdgeInsetsGeometry padding;
  final double headerGap;
  final bool expandChild;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: padding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: expandChild ? MainAxisSize.max : MainAxisSize.min,
          children: [
            if (title != null) ...[
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title!,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        if (subtitle != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 2),
                            child: Text(
                              subtitle!,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: theme.colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                  ?trailing,
                ],
              ),
              SizedBox(height: headerGap),
            ],
            if (expandChild) Expanded(child: child) else child,
          ],
        ),
      ),
    );
  }
}

class TrendChip extends StatelessWidget {
  const TrendChip({
    super.key,
    required this.changePct,
    this.positiveIsGood = true,
  });

  final double changePct;
  final bool positiveIsGood;

  @override
  Widget build(BuildContext context) {
    final up = changePct >= 0;
    final good = up == positiveIsGood;
    final color = changePct == 0
        ? AppColors.indigo600
        : (good ? AppColors.success : AppColors.danger);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            up ? Icons.arrow_upward_rounded : Icons.arrow_downward_rounded,
            size: 13,
            color: color,
          ),
          const SizedBox(width: 3),
          Text(
            Fmt.percent(changePct.abs()),
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class RingProgress extends StatelessWidget {
  const RingProgress({
    super.key,
    required this.value,
    required this.color,
    this.size = 64,
    this.stroke = 7,
    this.label,
  });

  final double value;
  final Color color;
  final double size;
  final double stroke;
  final String? label;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: value.clamp(0, 1)),
      duration: const Duration(milliseconds: 900),
      curve: Curves.easeOutCubic,
      builder: (context, v, _) => SizedBox.square(
        dimension: size,
        child: CustomPaint(
          painter: _RingPainter(
            v,
            color,
            color.withValues(alpha: 0.14),
            stroke,
          ),
          child: Center(
            child: Text(
              label ?? '${(v * 100).round()}%',
              style: theme.textTheme.labelMedium?.copyWith(
                fontWeight: FontWeight.w800,
                fontSize: size * 0.2,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  _RingPainter(this.value, this.color, this.track, this.stroke);

  final double value;
  final Color color;
  final Color track;
  final double stroke;

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    final deflated = rect.deflate(stroke / 2);
    final base = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..color = track;
    canvas.drawArc(deflated, 0, math.pi * 2, false, base);
    final arc = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.round
      ..color = color;
    canvas.drawArc(deflated, -math.pi / 2, math.pi * 2 * value, false, arc);
  }

  @override
  bool shouldRepaint(_RingPainter old) =>
      old.value != value || old.color != color || old.track != track;
}

class StatCard extends StatelessWidget {
  const StatCard({
    super.key,
    required this.title,
    required this.value,
    required this.unit,
    required this.icon,
    required this.color,
    required this.progress,
    required this.caption,
    this.changePct,
    this.alert = false,
    this.compact = false,
    this.footer,
  });

  final String title;
  final String value;
  final String unit;
  final IconData icon;
  final Color color;
  final double progress;
  final String caption;
  final double? changePct;
  final bool alert;
  final bool compact;
  final Widget? footer;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    return Card(
      color: alert ? AppColors.danger.withValues(alpha: 0.07) : null,
      shape: alert
          ? RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
              side: const BorderSide(color: AppColors.danger, width: 1.4),
            )
          : null,
      child: Padding(
        padding: EdgeInsets.fromLTRB(
          compact ? 14 : 18,
          compact ? 10 : 16,
          compact ? 12 : 14,
          compact ? 12 : 18,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                if (changePct != null)
                  TrendChip(changePct: changePct!)
                else
                  SizedBox(height: compact ? 18 : 22),
                const Spacer(),
                Container(
                  padding: EdgeInsets.all(compact ? 5 : 7),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, size: compact ? 16 : 18, color: color),
                ),
              ],
            ),
            SizedBox(height: compact ? 6 : 14),
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: scheme.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(height: 4),
                      FittedBox(
                        fit: BoxFit.scaleDown,
                        alignment: Alignment.centerLeft,
                        child: Text.rich(
                          TextSpan(
                            children: [
                              TextSpan(text: value),
                              TextSpan(
                                text: ' $unit',
                                style: theme.textTheme.titleSmall?.copyWith(
                                  color: scheme.onSurfaceVariant,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                          style:
                              (compact
                                      ? theme.textTheme.titleLarge
                                      : theme.textTheme.headlineMedium)
                                  ?.copyWith(
                                    fontWeight: FontWeight.w800,
                                    color: alert
                                        ? AppColors.danger
                                        : scheme.onSurface,
                                  ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        caption,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: scheme.onSurfaceVariant,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                RingProgress(
                  value: progress,
                  color: alert ? AppColors.danger : color,
                  size: compact ? 46 : 64,
                  stroke: compact ? 5 : 7,
                ),
              ],
            ),
            if (footer != null) ...[SizedBox(height: compact ? 6 : 8), footer!],
          ],
        ),
      ),
    );
  }
}

class StatusChip extends StatelessWidget {
  const StatusChip({super.key, required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
    decoration: BoxDecoration(
      color: color.withValues(alpha: 0.1),
      borderRadius: BorderRadius.circular(10),
      border: Border.all(color: color.withValues(alpha: 0.35)),
    ),
    child: Text(
      label,
      style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w700),
    ),
  );
}

class IconBadge extends StatelessWidget {
  const IconBadge({
    super.key,
    required this.icon,
    required this.color,
    this.size = 42,
  });

  final IconData icon;
  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) => Container(
    width: size,
    height: size,
    decoration: BoxDecoration(
      color: color.withValues(alpha: 0.13),
      borderRadius: BorderRadius.circular(size * 0.32),
    ),
    child: Icon(icon, color: color, size: size * 0.5),
  );
}

class StarRating extends StatelessWidget {
  const StarRating({super.key, required this.rating, this.size = 15});

  final double rating;
  final double size;

  @override
  Widget build(BuildContext context) {
    final muted = Theme.of(context).colorScheme.outlineVariant;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (var i = 1; i <= 5; i++)
          Icon(
            rating >= i
                ? Icons.star_rounded
                : (rating >= i - 0.5
                      ? Icons.star_half_rounded
                      : Icons.star_rounded),
            size: size,
            color: rating >= i - 0.5 ? AppColors.amber : muted,
          ),
      ],
    );
  }
}

class EmptyState extends StatelessWidget {
  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.message,
    this.action,
  });

  final IconData icon;
  final String title;
  final String? message;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconBadge(icon: icon, color: theme.colorScheme.primary, size: 64),
            const SizedBox(height: 16),
            Text(
              title,
              style: theme.textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            if (message != null) ...[
              const SizedBox(height: 6),
              Text(
                message!,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            if (action != null) ...[const SizedBox(height: 20), action!],
          ],
        ),
      ),
    );
  }
}
