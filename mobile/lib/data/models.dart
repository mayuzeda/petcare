typedef Json = Map<String, dynamic>;

double _toDouble(Object? v) => (v as num?)?.toDouble() ?? 0;
int _toInt(Object? v) => (v as num?)?.round() ?? 0;
DateTime? _toDate(Object? v) => v == null ? null : DateTime.parse(v as String).toLocal();

class AppUser {
  const AppUser({required this.id, required this.name, required this.email});

  final String id;
  final String name;
  final String email;

  String get firstName => name.split(' ').first;

  factory AppUser.fromJson(Json j) => AppUser(id: j['id'], name: j['name'], email: j['email']);
  Json toJson() => {'id': id, 'name': name, 'email': email};
}

enum Species {
  cachorro('Cachorro'),
  gato('Gato'),
  outro('Outro');

  const Species(this.label);
  final String label;

  static Species parse(String? v) => Species.values.firstWhere((s) => s.name == v, orElse: () => Species.outro);
}

class Pet {
  const Pet({
    required this.id,
    required this.name,
    required this.species,
    this.breed,
    this.sex,
    this.birthDate,
    this.ageYears,
    this.weightKg,
    this.collarId,
    this.photoUrl,
  });

  final String id;
  final String name;
  final Species species;
  final String? breed;
  final String? sex;
  final DateTime? birthDate;
  final int? ageYears;
  final double? weightKg;
  final String? collarId;
  final String? photoUrl;

  bool get hasCollar => collarId != null && collarId!.isNotEmpty;

  String get summary {
    final parts = <String>[
      species.label,
      if (breed != null && breed!.isNotEmpty) breed!,
      if (ageYears != null) ageYears == 1 ? '1 ano' : '$ageYears anos',
    ];
    return parts.join(' • ');
  }

  factory Pet.fromJson(Json j) => Pet(
    id: j['id'],
    name: j['name'],
    species: Species.parse(j['species']),
    breed: j['breed'],
    sex: j['sex'],
    birthDate: _toDate(j['birthDate']),
    ageYears: j['ageYears'],
    weightKg: (j['weightKg'] as num?)?.toDouble(),
    collarId: j['collarId'],
    photoUrl: j['photoUrl'],
  );
}

class PetDraft {
  const PetDraft({
    required this.name,
    required this.species,
    this.breed,
    this.sex,
    this.birthDate,
    this.weightKg,
    this.collarId,
  });

  final String name;
  final Species species;
  final String? breed;
  final String? sex;
  final DateTime? birthDate;
  final double? weightKg;
  final String? collarId;

  Json toJson() => {
    'name': name,
    'species': species.name,
    'breed': breed,
    'sex': sex,
    'birthDate': birthDate == null
        ? null
        : '${birthDate!.year.toString().padLeft(4, '0')}-'
              '${birthDate!.month.toString().padLeft(2, '0')}-'
              '${birthDate!.day.toString().padLeft(2, '0')}',
    'weightKg': weightKg,
    'collarId': collarId,
  };
}

enum EventType {
  consulta('Consulta'),
  vacina('Vacina'),
  exame('Exame'),
  remedio('Remédio'),
  vermifugo('Vermífugo'),
  cirurgia('Cirurgia');

  const EventType(this.label);
  final String label;

  static EventType parse(String v) => EventType.values.firstWhere((t) => t.name == v);
}

enum EventStatus {
  agendado('Agendado'),
  atrasado('Atrasado'),
  concluido('Concluído'),
  cancelado('Cancelado');

  const EventStatus(this.label);
  final String label;

  static EventStatus parse(String v) => EventStatus.values.firstWhere((s) => s.name == v);
}

class PetEvent {
  const PetEvent({
    required this.id,
    required this.petId,
    required this.title,
    required this.type,
    required this.startsAt,
    required this.reminder,
    required this.status,
    this.notes,
  });

  final String id;
  final String petId;
  final String title;
  final EventType type;
  final DateTime startsAt;
  final bool reminder;
  final EventStatus status;
  final String? notes;

  factory PetEvent.fromJson(Json j) => PetEvent(
    id: j['id'],
    petId: j['petId'],
    title: j['title'],
    type: EventType.parse(j['type']),
    startsAt: _toDate(j['startsAt'])!,
    reminder: j['reminder'] ?? true,
    status: EventStatus.parse(j['status']),
    notes: j['notes'],
  );
}

class EventDraft {
  const EventDraft({
    required this.petId,
    required this.title,
    required this.type,
    required this.startsAt,
    this.reminder = true,
    this.notes,
  });

  final String petId;
  final String title;
  final EventType type;
  final DateTime startsAt;
  final bool reminder;
  final String? notes;

  Json toJson() => {
    'petId': petId,
    'title': title,
    'type': type.name,
    'startsAt': startsAt.toUtc().toIso8601String(),
    'reminder': reminder,
    'notes': notes,
  };
}

class Range {
  const Range(this.min, this.max);
  final double min;
  final double max;

  factory Range.fromJson(Json j) => Range(_toDouble(j['min']), _toDouble(j['max']));
}

class VitalStat {
  const VitalStat({
    required this.value,
    required this.unit,
    required this.changePct,
    required this.progress,
    required this.isAlert,
    this.latest,
    this.goal,
    this.normalRange,
  });

  final double value;
  final double? latest;
  final String unit;
  final double changePct;
  final double progress;
  final bool isAlert;
  final double? goal;
  final Range? normalRange;

  factory VitalStat.fromJson(Json j) => VitalStat(
    value: _toDouble(j['value']),
    latest: (j['latest'] as num?)?.toDouble(),
    unit: j['unit'],
    changePct: _toDouble(j['changePct']),
    progress: _toDouble(j['progress']).clamp(0, 1),
    isAlert: j['status'] == 'alerta',
    goal: (j['goal'] as num?)?.toDouble(),
    normalRange: j['normalRange'] == null ? null : Range.fromJson(j['normalRange']),
  );
}

class DayActivity {
  const DayActivity({required this.label, required this.activeMinutes, required this.steps, required this.goalMinutes});

  final String label;
  final int activeMinutes;
  final int steps;
  final int goalMinutes;

  factory DayActivity.fromJson(Json j) => DayActivity(
    label: j['label'],
    activeMinutes: _toInt(j['activeMinutes']),
    steps: _toInt(j['steps']),
    goalMinutes: _toInt(j['goalMinutes']),
  );
}

class LocationShare {
  const LocationShare({required this.location, required this.minutes, required this.percentage});

  final String location;
  final int minutes;
  final double percentage;

  String get label => switch (location) {
    'casa' => 'Casa',
    'quintal' => 'Quintal',
    'rua' => 'Passeio',
    'parque' => 'Parque',
    _ => location,
  };

  factory LocationShare.fromJson(Json j) =>
      LocationShare(location: j['location'], minutes: _toInt(j['minutes']), percentage: _toDouble(j['percentage']));
}

class CareMember {
  const CareMember({
    required this.id,
    required this.name,
    required this.role,
    required this.rating,
    this.clinic,
    this.phone,
    this.lastContactAt,
  });

  final String id;
  final String name;
  final String role;
  final double rating;
  final String? clinic;
  final String? phone;
  final DateTime? lastContactAt;

  factory CareMember.fromJson(Json j) => CareMember(
    id: j['id'],
    name: j['name'],
    role: j['role'],
    rating: _toDouble(j['rating']),
    clinic: j['clinic'],
    phone: j['phone'],
    lastContactAt: _toDate(j['lastContactAt']),
  );
}

class HealthAlert {
  const HealthAlert({required this.title, required this.message, required this.isHigh});

  final String title;
  final String message;
  final bool isHigh;

  factory HealthAlert.fromJson(Json j) =>
      HealthAlert(title: j['title'], message: j['message'], isHigh: j['severity'] == 'alta');
}

class DashboardData {
  const DashboardData({
    required this.pet,
    required this.hasCollar,
    required this.heartRate,
    required this.temperature,
    required this.steps,
    required this.weeklyActivity,
    required this.locations,
    required this.upcomingEvents,
    required this.careTeam,
    required this.alerts,
  });

  final Pet pet;
  final bool hasCollar;
  final VitalStat heartRate;
  final VitalStat temperature;
  final VitalStat steps;
  final List<DayActivity> weeklyActivity;
  final List<LocationShare> locations;
  final List<PetEvent> upcomingEvents;
  final List<CareMember> careTeam;
  final List<HealthAlert> alerts;

  factory DashboardData.fromJson(Json j) {
    final stats = j['stats'] as Json;
    return DashboardData(
      pet: Pet.fromJson(j['pet']),
      hasCollar: j['hasCollar'] ?? false,
      heartRate: VitalStat.fromJson(stats['heartRate']),
      temperature: VitalStat.fromJson(stats['temperature']),
      steps: VitalStat.fromJson(stats['steps']),
      weeklyActivity: [for (final d in j['weeklyActivity']) DayActivity.fromJson(d)],
      locations: [for (final l in j['locations']) LocationShare.fromJson(l)],
      upcomingEvents: [for (final e in j['upcomingEvents']) PetEvent.fromJson(e)],
      careTeam: [for (final c in j['careTeam']) CareMember.fromJson(c)],
      alerts: [for (final a in j['alerts']) HealthAlert.fromJson(a)],
    );
  }
}

enum TimeRange {
  day('Hoje'),
  week('7 dias'),
  month('30 dias');

  const TimeRange(this.label);
  final String label;
}

class SeriesPoint {
  const SeriesPoint({
    required this.label,
    required this.temperature,
    required this.heartRate,
    required this.activity,
    required this.steps,
    required this.distanceM,
    required this.activeMinutes,
  });

  final String label;
  final double temperature;
  final int heartRate;
  final int activity;
  final int steps;
  final int distanceM;
  final int activeMinutes;

  factory SeriesPoint.fromJson(Json j) => SeriesPoint(
    label: j['label'],
    temperature: _toDouble(j['temperature']),
    heartRate: _toInt(j['heartRate']),
    activity: _toInt(j['activity']),
    steps: _toInt(j['steps']),
    distanceM: _toInt(j['distanceM']),
    activeMinutes: _toInt(j['activeMinutes']),
  );
}

class SeriesSummary {
  const SeriesSummary(this.avg, this.min, this.max);
  final double avg;
  final double min;
  final double max;

  factory SeriesSummary.fromJson(Json j) =>
      SeriesSummary(_toDouble(j['avg']), _toDouble(j['min']), _toDouble(j['max']));
}

class HealthReport {
  const HealthReport({
    required this.points,
    required this.heartRateRange,
    required this.temperatureRange,
    required this.heartRate,
    required this.temperature,
  });

  final List<SeriesPoint> points;
  final Range heartRateRange;
  final Range temperatureRange;
  final SeriesSummary heartRate;
  final SeriesSummary temperature;

  factory HealthReport.fromJson(Json j) => HealthReport(
    points: [for (final p in j['points']) SeriesPoint.fromJson(p)],
    heartRateRange: Range.fromJson(j['normalRanges']['heartRate']),
    temperatureRange: Range.fromJson(j['normalRanges']['temperature']),
    heartRate: SeriesSummary.fromJson(j['summary']['heartRate']),
    temperature: SeriesSummary.fromJson(j['summary']['temperature']),
  );
}

class ActivityReport {
  const ActivityReport({
    required this.points,
    required this.locations,
    required this.totalSteps,
    required this.totalDistanceM,
    required this.totalActiveMinutes,
    required this.dailyStepsGoal,
  });

  final List<SeriesPoint> points;
  final List<LocationShare> locations;
  final int totalSteps;
  final int totalDistanceM;
  final int totalActiveMinutes;
  final int dailyStepsGoal;

  factory ActivityReport.fromJson(Json j) => ActivityReport(
    points: [for (final p in j['points']) SeriesPoint.fromJson(p)],
    locations: [for (final l in j['locations']) LocationShare.fromJson(l)],
    totalSteps: _toInt(j['totals']['steps']),
    totalDistanceM: _toInt(j['totals']['distanceM']),
    totalActiveMinutes: _toInt(j['totals']['activeMinutes']),
    dailyStepsGoal: _toInt(j['goals']['dailySteps']),
  );
}

enum DocumentCategory {
  vacinas('Vacinas'),
  receitas('Receitas'),
  exames('Exames'),
  outros('Outros');

  const DocumentCategory(this.label);
  final String label;

  static DocumentCategory parse(String v) =>
      DocumentCategory.values.firstWhere((c) => c.name == v, orElse: () => DocumentCategory.outros);
}

class PetDocument {
  const PetDocument({
    required this.id,
    required this.petId,
    required this.name,
    required this.category,
    required this.fileType,
    required this.fileSize,
    required this.favorite,
    required this.uploadedAt,
    this.notes,
  });

  final String id;
  final String petId;
  final String name;
  final DocumentCategory category;
  final String fileType;
  final int fileSize;
  final bool favorite;
  final DateTime uploadedAt;
  final String? notes;

  String get formattedSize {
    if (fileSize < 1024) return '$fileSize B';
    if (fileSize < 1024 * 1024) return '${(fileSize / 1024).toStringAsFixed(0)} KB';
    return '${(fileSize / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  PetDocument copyWith({bool? favorite}) => PetDocument(
    id: id,
    petId: petId,
    name: name,
    category: category,
    fileType: fileType,
    fileSize: fileSize,
    favorite: favorite ?? this.favorite,
    uploadedAt: uploadedAt,
    notes: notes,
  );

  factory PetDocument.fromJson(Json j) => PetDocument(
    id: j['id'],
    petId: j['petId'],
    name: j['name'],
    category: DocumentCategory.parse(j['category']),
    fileType: j['fileType'],
    fileSize: _toInt(j['fileSize']),
    favorite: j['favorite'] ?? false,
    uploadedAt: _toDate(j['uploadedAt'])!,
    notes: j['notes'],
  );
}

class AppNotification {
  const AppNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    required this.read,
    required this.createdAt,
    this.petId,
  });

  final String id;
  final String? petId;
  final String type;
  final String title;
  final String message;
  final bool read;
  final DateTime createdAt;

  factory AppNotification.fromJson(Json j) => AppNotification(
    id: j['id'],
    petId: j['petId'],
    type: j['type'],
    title: j['title'],
    message: j['message'],
    read: j['read'] ?? false,
    createdAt: _toDate(j['createdAt'])!,
  );
}

class Specialty {
  const Specialty({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
    required this.waitMin,
    required this.waitMax,
  });

  final String id;
  final String name;
  final String description;
  final String icon;
  final int waitMin;
  final int waitMax;

  factory Specialty.fromJson(Json j) => Specialty(
    id: j['id'],
    name: j['name'],
    description: j['description'],
    icon: j['icon'],
    waitMin: _toInt(j['waitMinutes']['min']),
    waitMax: _toInt(j['waitMinutes']['max']),
  );
}

enum SearchKind {
  pet,
  event,
  document,
  session,
  care,
  empty;

  static SearchKind parse(String? value) =>
      SearchKind.values.firstWhere((kind) => kind.name == value, orElse: () => SearchKind.empty);

  String get label => switch (this) {
    pet => 'Pet',
    event => 'Cuidado',
    document => 'Documento',
    session => 'Sessão',
    care => 'Equipe',
    empty => '',
  };
}

class SearchHit {
  const SearchHit({
    required this.kind,
    required this.id,
    required this.title,
    required this.subtitle,
    this.petId,
    this.type,
  });

  final SearchKind kind;
  final String id;
  final String title;
  final String subtitle;
  final String? petId;
  final String? type;

  factory SearchHit.fromJson(Json j) => SearchHit(
    kind: SearchKind.parse(j['kind'] as String?),
    id: j['id'] ?? '',
    title: j['title'] ?? '',
    subtitle: j['subtitle'] ?? '',
    petId: j['petId'],
    type: j['type'],
  );
}

String foldText(String value) {
  const from = 'áàâãäéèêëíìîïóòôõöúùûüçñ';
  const to = 'aaaaaeeeeiiiiooooouuuucn';
  final buffer = StringBuffer();
  for (final rune in value.toLowerCase().runes) {
    final char = String.fromCharCode(rune);
    final index = from.indexOf(char);
    buffer.write(index >= 0 ? to[index] : char);
  }
  return buffer.toString();
}
