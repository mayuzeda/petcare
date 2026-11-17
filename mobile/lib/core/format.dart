import 'package:intl/intl.dart';

abstract final class Fmt {
  static final _int = NumberFormat.decimalPattern('pt_BR');
  static final _dec1 = NumberFormat('#,##0.0', 'pt_BR');
  static final _dayMonth = DateFormat("d 'de' MMM", 'pt_BR');
  static final _weekdayDayMonth = DateFormat("EEE, d 'de' MMM", 'pt_BR');
  static final _time = DateFormat('HH:mm', 'pt_BR');
  static final _date = DateFormat('dd/MM/yyyy', 'pt_BR');

  static String integer(num v) => _int.format(v.round());
  static String decimal1(num v) => _dec1.format(v);
  static String date(DateTime d) => _date.format(d);
  static String dayMonth(DateTime d) => _dayMonth.format(d);
  static String weekdayDayMonth(DateTime d) => _weekdayDayMonth.format(d);
  static String time(DateTime d) => _time.format(d);

  static String percent(double v) => '${v >= 0 ? '' : '-'}${decimal1(v.abs())}%';

  static String distance(int meters) => meters >= 1000 ? '${decimal1(meters / 1000)} km' : '$meters m';

  static String duration(int minutes) {
    if (minutes < 60) return '$minutes min';
    final h = minutes ~/ 60;
    final m = minutes % 60;
    return m == 0 ? '${h}h' : '${h}h${m.toString().padLeft(2, '0')}';
  }

  static String relativeDay(DateTime d) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final diff = DateTime(d.year, d.month, d.day).difference(today).inDays;
    return switch (diff) {
      0 => 'Hoje, ${time(d)}',
      1 => 'Amanhã, ${time(d)}',
      -1 => 'Ontem, ${time(d)}',
      _ => '${weekdayDayMonth(d)}, ${time(d)}',
    };
  }

  static String timeAgo(DateTime d) {
    final diff = DateTime.now().difference(d);
    if (diff.inMinutes < 1) return 'agora';
    if (diff.inMinutes < 60) return 'há ${diff.inMinutes} min';
    if (diff.inHours < 24) return 'há ${diff.inHours} h';
    if (diff.inDays == 1) return 'ontem';
    return 'há ${diff.inDays} dias';
  }

  static String greeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }
}
