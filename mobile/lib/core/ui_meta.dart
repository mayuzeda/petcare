import 'package:material_ui/material_ui.dart';

import '../data/models.dart';
import 'theme/app_colors.dart';

extension EventTypeUi on EventType {
  Color get color => switch (this) {
    EventType.consulta => AppColors.info,
    EventType.vacina => AppColors.success,
    EventType.exame => AppColors.violet,
    EventType.remedio => AppColors.amberDeep,
    EventType.vermifugo => AppColors.warning,
    EventType.cirurgia => AppColors.danger,
  };

  IconData get icon => switch (this) {
    EventType.consulta => Icons.medical_services_rounded,
    EventType.vacina => Icons.vaccines_rounded,
    EventType.exame => Icons.biotech_rounded,
    EventType.remedio => Icons.medication_rounded,
    EventType.vermifugo => Icons.bug_report_rounded,
    EventType.cirurgia => Icons.healing_rounded,
  };
}

extension EventStatusUi on EventStatus {
  Color get color => switch (this) {
    EventStatus.agendado => AppColors.success,
    EventStatus.atrasado => AppColors.danger,
    EventStatus.concluido => AppColors.indigo600,
    EventStatus.cancelado => const Color(0xFF8A8FA8),
  };
}

extension DocumentCategoryUi on DocumentCategory {
  Color get color => switch (this) {
    DocumentCategory.vacinas => AppColors.success,
    DocumentCategory.receitas => AppColors.violet,
    DocumentCategory.exames => AppColors.info,
    DocumentCategory.outros => const Color(0xFF8A8FA8),
  };
}

IconData notificationIcon(String type) => switch (type) {
  'alerta' => Icons.warning_amber_rounded,
  'lembrete' => Icons.alarm_rounded,
  'exame' => Icons.biotech_rounded,
  'atividade' => Icons.directions_run_rounded,
  _ => Icons.notifications_rounded,
};

Color notificationColor(String type) => switch (type) {
  'alerta' => AppColors.danger,
  'lembrete' => AppColors.amberDeep,
  'exame' => AppColors.violet,
  'atividade' => AppColors.success,
  _ => AppColors.indigo600,
};

IconData specialtyIcon(String key) => switch (key) {
  'stethoscope' => Icons.medical_services_rounded,
  'dermatology' => Icons.spa_rounded,
  'cardiology' => Icons.favorite_rounded,
  'orthopedics' => Icons.accessibility_new_rounded,
  'nutrition' => Icons.restaurant_rounded,
  'behavior' => Icons.psychology_rounded,
  'ophthalmology' => Icons.visibility_rounded,
  'dentistry' => Icons.mood_rounded,
  _ => Icons.pets_rounded,
};

Color locationColor(int index) => AppColors.chart[index % AppColors.chart.length];
