import 'dart:math' as math;

import 'models.dart';
import 'repository.dart';

/// Repositório em memória que espelha o comportamento da API, usado no modo demonstração.
class DemoRepository implements PetcareRepository {
  DemoRepository() {
    _seed();
  }

  static const user = AppUser(id: 'demo', name: 'Gustavo', email: 'demo@petcare.app');

  final _pets = <Pet>[];
  final _fever = <String>{};
  final _events = <PetEvent>[];
  final _documents = <PetDocument>[];
  final _notifications = <AppNotification>[];
  final _team = <CareMember>[];
  final _sessions = <_TeleSession>[];
  final _cache = <String, List<_Reading>>{};
  var _seq = 0;

  String _id() => 'demo-${_seq++}';

  Future<T> _delay<T>(T value) => Future.delayed(const Duration(milliseconds: 250), () => value);

  @override
  bool get isDemo => true;

  @override
  String? resolveImage(String? path) => path;

  DateTime _at(int days, int hour, int minute) {
    final now = DateTime.now();
    return DateTime(now.year, now.month, now.day + days, hour, minute);
  }

  void _seed() {
    final now = DateTime.now();
    Pet pet(
      String id,
      String name,
      Species s,
      String breed,
      String sex,
      DateTime birth,
      double kg,
      String collar,
      String photo,
    ) {
      var age = now.year - birth.year;
      if (now.month < birth.month || (now.month == birth.month && now.day < birth.day)) age--;
      return Pet(
        id: id,
        name: name,
        species: s,
        breed: breed,
        sex: sex,
        birthDate: birth,
        ageYears: age,
        weightKg: kg,
        collarId: collar,
        photoUrl: photo,
      );
    }

    _pets.addAll([
      pet(
        'bella',
        'Bella',
        Species.cachorro,
        'SRD',
        'femea',
        DateTime(2021, 3, 12),
        15,
        '52386',
        'asset:assets/pets/bela.png',
      ),
      pet('dom', 'Dom', Species.gato, 'SRD', 'macho', DateTime(2019, 8, 2), 5.4, '54486', 'asset:assets/pets/dom.jpeg'),
      pet(
        'thor',
        'Thor',
        Species.cachorro,
        'Golden Retriever',
        'macho',
        DateTime(2017, 1, 20),
        30,
        '512386',
        'asset:assets/pets/thor.jpg',
      ),
    ]);
    _fever.add('thor');

    PetEvent ev(String pet, String title, EventType type, DateTime at, {String? notes, bool done = false}) => PetEvent(
      id: _id(),
      petId: pet,
      title: title,
      type: type,
      startsAt: at,
      reminder: true,
      notes: notes,
      status: done ? EventStatus.concluido : EventStatus.agendado,
    );

    _events.addAll([
      ev('thor', 'Consulta de rotina', EventType.consulta, _at(3, 14, 30)),
      ev('bella', 'Vacinação anual (V10)', EventType.vacina, _at(7, 10, 0)),
      ev('dom', 'Exame de sangue', EventType.exame, _at(5, 9, 15), notes: 'Jejum de 8 horas'),
      ev('thor', 'Dose de antibiótico', EventType.remedio, _at(0, 8, 0), notes: 'Administrar com alimento'),
      ev('bella', 'Aplicação de vermífugo', EventType.vermifugo, _at(14, 19, 0)),
      ev('dom', 'Cirurgia dentária', EventType.cirurgia, _at(21, 8, 30), notes: 'Jejum de 12 horas antes da cirurgia'),
      ev('thor', 'Resultado de exames', EventType.exame, _at(10, 15, 45)),
      ev('bella', 'Consulta dermatológica', EventType.consulta, _at(2, 11, 30), notes: 'Verificar manchas na pele'),
      ev('dom', 'Vacina antirrábica', EventType.vacina, _at(12, 16, 0)),
      ev('thor', 'Medicação cardíaca', EventType.remedio, _at(1, 20, 0), notes: 'Administrar depois da janta'),
      ev('bella', 'Banho e tosa', EventType.consulta, _at(-6, 10, 0), done: true),
      ev('bella', 'Antipulgas mensal', EventType.vermifugo, _at(-1, 18, 0)),
      ev('thor', 'Raio-X de tórax', EventType.exame, _at(-12, 9, 0), done: true),
    ]);

    PetDocument doc(
      String pet,
      String name,
      DocumentCategory c,
      String type,
      int size,
      int daysAgo, {
      String? notes,
      bool fav = false,
    }) => PetDocument(
      id: _id(),
      petId: pet,
      name: name,
      category: c,
      fileType: type,
      fileSize: size,
      favorite: fav,
      uploadedAt: now.subtract(Duration(days: daysAgo)),
      notes: notes,
    );

    _documents.addAll([
      doc(
        'bella',
        'Resultado exame de sangue',
        DocumentCategory.exames,
        'pdf',
        1250000,
        9,
        notes: 'Hemograma completo — Clínica PetVet',
        fav: true,
      ),
      doc(
        'bella',
        'Carteira de vacinação',
        DocumentCategory.vacinas,
        'pdf',
        850000,
        30,
        notes: 'Inclui todas as vacinas até hoje',
        fav: true,
      ),
      doc(
        'dom',
        'Receita de antibiótico',
        DocumentCategory.receitas,
        'jpg',
        450000,
        4,
        notes: 'Após procedimento dental',
      ),
      doc(
        'thor',
        'Raio-X de tórax',
        DocumentCategory.exames,
        'png',
        2800000,
        12,
        notes: 'Suspeita de problema respiratório',
        fav: true,
      ),
      doc('thor', 'Laudo cardiológico', DocumentCategory.exames, 'pdf', 980000, 20),
    ]);

    AppNotification n(String pet, String type, String title, String message, double hoursAgo, {bool read = false}) =>
        AppNotification(
          id: _id(),
          petId: pet,
          type: type,
          title: title,
          message: message,
          read: read,
          createdAt: now.subtract(Duration(minutes: (hoursAgo * 60).round())),
        );

    _notifications.addAll([
      n('thor', 'alerta', 'Temperatura elevada', 'A coleira do Thor registrou temperatura acima de 39,5 °C.', 1),
      n('thor', 'lembrete', 'Medicação de hoje', 'Dose de antibiótico às 08:00 — administrar com alimento.', 3),
      n('bella', 'lembrete', 'Consulta dermatológica', 'Bella tem consulta em 2 dias às 11:30.', 6),
      n(
        'dom',
        'exame',
        'Preparo para exame',
        'Dom precisa de jejum de 8 horas antes do exame de sangue.',
        20,
        read: true,
      ),
      n(
        'bella',
        'atividade',
        'Meta de passos batida!',
        'Bella superou a meta diária de 10.000 passos ontem.',
        30,
        read: true,
      ),
    ]);

    CareMember m(String name, String role, String clinic, double rating, double hoursAgo) => CareMember(
      id: _id(),
      name: name,
      role: role,
      clinic: clinic,
      rating: rating,
      lastContactAt: now.subtract(Duration(minutes: (hoursAgo * 60).round())),
    );

    _team.addAll([
      m('Dra. Marina Lopes', 'Clínica geral', 'Clínica PetVet', 5, 0.5),
      m('Dr. Rafael Souza', 'Cardiologista', 'Hospital Vet Center', 4.8, 26),
      m('Ana Beatriz', 'Adestradora', 'Escola Pet Feliz', 4.5, 72),
      m('Dr. Caio Mendes', 'Dermatologista', 'DermaPet', 4.2, 192),
    ]);

    _sessions.addAll([
      _TeleSession(
        id: _id(),
        petId: 'bella',
        specialty: 'Dermatologia',
        symptoms: 'Manchas na pele e coceira',
        status: 'Finalizada',
      ),
      _TeleSession(
        id: _id(),
        petId: 'thor',
        specialty: 'Cardiologia',
        symptoms: 'Cansaço depois do passeio',
        status: 'Aguardando',
      ),
    ]);
  }

  Pet _pet(String id) =>
      _pets.firstWhere((p) => p.id == id, orElse: () => throw const ApiException('Pet não encontrado'));

  List<_Reading> _readings(Pet pet) {
    if (!pet.hasCollar) return const [];
    return _cache.putIfAbsent(pet.id, () {
      final now = DateTime.now();
      final end = DateTime(now.year, now.month, now.day, now.hour);
      final start = end.subtract(const Duration(days: 30));
      return [
        for (var t = start; !t.isAfter(end); t = t.add(const Duration(hours: 1)))
          _Reading.simulate(pet, t, fever: _fever.contains(pet.id)),
      ];
    });
  }

  @override
  Future<List<Pet>> pets() => _delay(List.of(_pets));

  @override
  Future<Pet> createPet(PetDraft draft) {
    final pet = Pet(
      id: _id(),
      name: draft.name,
      species: draft.species,
      breed: draft.breed,
      sex: draft.sex,
      birthDate: draft.birthDate,
      ageYears: draft.birthDate == null ? null : (DateTime.now().difference(draft.birthDate!).inDays / 365.25).floor(),
      weightKg: draft.weightKg,
      collarId: draft.collarId,
    );
    _pets.add(pet);
    return _delay(pet);
  }

  @override
  Future<void> deletePet(String petId) async {
    _pets.removeWhere((p) => p.id == petId);
    _events.removeWhere((e) => e.petId == petId);
    _documents.removeWhere((d) => d.petId == petId);
  }

  @override
  Future<DashboardData> dashboard(String petId) {
    final pet = _pet(petId);
    final profile = _Profile.of(pet.species);
    final all = _readings(pet);
    final now = DateTime.now();
    final last24 = all.where((r) => r.at.isAfter(now.subtract(const Duration(hours: 24)))).toList();
    final prev24 = all
        .where(
          (r) =>
              r.at.isAfter(now.subtract(const Duration(hours: 48))) &&
              !r.at.isAfter(now.subtract(const Duration(hours: 24))),
        )
        .toList();

    VitalStat vital(double Function(_Reading) pick, Range range, String unit, int decimals) {
      final values = last24.map(pick).toList();
      final avg = _avg(values);
      final f = math.pow(10, decimals);
      final latest = values.isEmpty ? null : values.last;
      return VitalStat(
        value: (avg * f).round() / f,
        latest: latest,
        unit: unit,
        changePct: _change(avg, _avg(prev24.map(pick).toList())),
        progress: values.isEmpty ? 0 : values.where((v) => v >= range.min && v <= range.max).length / values.length,
        isAlert: latest != null && (latest < range.min || latest > range.max),
        normalRange: range,
      );
    }

    final steps = last24.fold<int>(0, (a, r) => a + r.steps);
    final prevSteps = prev24.fold<int>(0, (a, r) => a + r.steps);
    final heartRate = vital((r) => r.heartRate.toDouble(), profile.heartRate, 'bpm', 0);
    final temperature = vital((r) => r.temperature, profile.temperature, '°C', 1);
    final weekDays = _days(all, 7);

    final upcoming =
        _events.where((e) => e.petId == petId && e.status == EventStatus.agendado).map(_withStatus).toList()
          ..sort((a, b) => a.startsAt.compareTo(b.startsAt));

    return _delay(
      DashboardData(
        pet: pet,
        hasCollar: pet.hasCollar,
        heartRate: heartRate,
        temperature: temperature,
        steps: VitalStat(
          value: steps.toDouble(),
          unit: 'passos',
          changePct: _change(steps.toDouble(), prevSteps.toDouble()),
          progress: (steps / profile.steps).clamp(0, 1).toDouble(),
          isAlert: false,
          goal: profile.steps.toDouble(),
        ),
        weeklyActivity: [
          for (final d in weekDays)
            DayActivity(
              label: _weekday(d.day),
              activeMinutes: d.rows.fold(0, (a, r) => a + r.activeMin),
              steps: d.rows.fold(0, (a, r) => a + r.steps),
              goalMinutes: profile.activeMinutes,
            ),
        ],
        locations: _locations(weekDays.expand((d) => d.rows).toList()),
        upcomingEvents: upcoming.take(5).toList(),
        careTeam: List.of(_team),
        alerts: [
          if (temperature.isAlert)
            HealthAlert(
              title: 'Temperatura fora do normal',
              message:
                  '${pet.name} está com ${temperature.latest} °C (referência ${profile.temperature.min}–${profile.temperature.max} °C).',
              isHigh: true,
            ),
          if (heartRate.isAlert)
            HealthAlert(
              title: 'Batimentos alterados',
              message: '${pet.name} está com ${heartRate.latest?.round()} bpm.',
              isHigh: false,
            ),
        ],
      ),
    );
  }

  List<SeriesPoint> _series(Pet pet, TimeRange range) {
    final all = _readings(pet);
    if (range == TimeRange.day) {
      final cutoff = DateTime.now().subtract(const Duration(hours: 24));
      return [
        for (final r in all.where((r) => r.at.isAfter(cutoff)))
          SeriesPoint(
            label: '${r.at.hour.toString().padLeft(2, '0')}h',
            temperature: r.temperature,
            heartRate: r.heartRate,
            activity: r.activity,
            steps: r.steps,
            distanceM: r.distanceM,
            activeMinutes: r.activeMin,
          ),
      ];
    }
    final days = _days(all, range == TimeRange.week ? 7 : 30);
    return [
      for (final d in days)
        SeriesPoint(
          label: range == TimeRange.week
              ? _weekday(d.day)
              : '${d.day.day.toString().padLeft(2, '0')}/${d.day.month.toString().padLeft(2, '0')}',
          temperature: (_avg(d.rows.map((r) => r.temperature).toList()) * 10).round() / 10,
          heartRate: _avg(d.rows.map((r) => r.heartRate.toDouble()).toList()).round(),
          activity: _avg(d.rows.map((r) => r.activity.toDouble()).toList()).round(),
          steps: d.rows.fold(0, (a, r) => a + r.steps),
          distanceM: d.rows.fold(0, (a, r) => a + r.distanceM),
          activeMinutes: d.rows.fold(0, (a, r) => a + r.activeMin),
        ),
    ];
  }

  @override
  Future<HealthReport> health(String petId, TimeRange range) {
    final pet = _pet(petId);
    final profile = _Profile.of(pet.species);
    final points = _series(pet, range);
    SeriesSummary summary(double Function(SeriesPoint) pick) {
      final values = points.map(pick).where((v) => v > 0).toList();
      if (values.isEmpty) return const SeriesSummary(0, 0, 0);
      return SeriesSummary((_avg(values) * 10).round() / 10, values.reduce(math.min), values.reduce(math.max));
    }

    return _delay(
      HealthReport(
        points: points,
        heartRateRange: profile.heartRate,
        temperatureRange: profile.temperature,
        heartRate: summary((p) => p.heartRate.toDouble()),
        temperature: summary((p) => p.temperature),
      ),
    );
  }

  @override
  Future<ActivityReport> activity(String petId, TimeRange range) {
    final pet = _pet(petId);
    final points = _series(pet, range);
    final hours = switch (range) {
      TimeRange.day => 24,
      TimeRange.week => 24 * 7,
      TimeRange.month => 24 * 30,
    };
    final cutoff = DateTime.now().subtract(Duration(hours: hours));
    return _delay(
      ActivityReport(
        points: points,
        locations: _locations(_readings(pet).where((r) => r.at.isAfter(cutoff)).toList()),
        totalSteps: points.fold(0, (a, p) => a + p.steps),
        totalDistanceM: points.fold(0, (a, p) => a + p.distanceM),
        totalActiveMinutes: points.fold(0, (a, p) => a + p.activeMinutes),
        dailyStepsGoal: _Profile.of(pet.species).steps,
      ),
    );
  }

  PetEvent _withStatus(PetEvent e) {
    if (e.status == EventStatus.agendado && e.startsAt.isBefore(DateTime.now())) {
      return _copyEvent(e, EventStatus.atrasado);
    }
    return e;
  }

  PetEvent _copyEvent(PetEvent e, EventStatus status) => PetEvent(
    id: e.id,
    petId: e.petId,
    title: e.title,
    type: e.type,
    startsAt: e.startsAt,
    reminder: e.reminder,
    notes: e.notes,
    status: status,
  );

  @override
  Future<List<PetEvent>> events({String? petId, EventType? type}) {
    final list =
        _events
            .where((e) => (petId == null || e.petId == petId) && (type == null || e.type == type))
            .map(_withStatus)
            .toList()
          ..sort((a, b) => a.startsAt.compareTo(b.startsAt));
    return _delay(list);
  }

  @override
  Future<PetEvent> createEvent(EventDraft draft) {
    final event = PetEvent(
      id: _id(),
      petId: draft.petId,
      title: draft.title,
      type: draft.type,
      startsAt: draft.startsAt,
      reminder: draft.reminder,
      notes: draft.notes,
      status: EventStatus.agendado,
    );
    _events.add(event);
    return _delay(_withStatus(event));
  }

  @override
  Future<PetEvent> updateEventStatus(String eventId, EventStatus status) {
    final i = _events.indexWhere((e) => e.id == eventId);
    _events[i] = _copyEvent(_events[i], status);
    return _delay(_withStatus(_events[i]));
  }

  @override
  Future<void> deleteEvent(String eventId) async => _events.removeWhere((e) => e.id == eventId);

  @override
  Future<List<PetDocument>> documents(String petId) {
    final list = _documents.where((d) => d.petId == petId).toList()
      ..sort((a, b) => a.favorite == b.favorite ? b.uploadedAt.compareTo(a.uploadedAt) : (a.favorite ? -1 : 1));
    return _delay(list);
  }

  @override
  Future<PetDocument> createDocument(
    String petId, {
    required String name,
    required DocumentCategory category,
    String? notes,
  }) {
    final doc = PetDocument(
      id: _id(),
      petId: petId,
      name: name,
      category: category,
      fileType: 'pdf',
      fileSize: 0,
      favorite: false,
      uploadedAt: DateTime.now(),
      notes: notes,
    );
    _documents.add(doc);
    return _delay(doc);
  }

  @override
  Future<PetDocument> setDocumentFavorite(String documentId, bool favorite) {
    final i = _documents.indexWhere((d) => d.id == documentId);
    _documents[i] = _documents[i].copyWith(favorite: favorite);
    return _delay(_documents[i]);
  }

  @override
  Future<void> deleteDocument(String documentId) async => _documents.removeWhere((d) => d.id == documentId);

  @override
  Future<List<AppNotification>> notifications() => _delay(List.of(_notifications));

  @override
  Future<void> markNotificationRead(String id) async {
    final i = _notifications.indexWhere((n) => n.id == id);
    if (i < 0) return;
    final n = _notifications[i];
    _notifications[i] = AppNotification(
      id: n.id,
      petId: n.petId,
      type: n.type,
      title: n.title,
      message: n.message,
      read: true,
      createdAt: n.createdAt,
    );
  }

  @override
  Future<void> markAllNotificationsRead() async {
    for (final n in List.of(_notifications)) {
      await markNotificationRead(n.id);
    }
  }

  @override
  Future<List<CareMember>> careTeam() => _delay(List.of(_team));

  @override
  Future<List<Specialty>> specialties() => _delay(const [
    Specialty(
      id: 'general',
      name: 'Clínico geral',
      description: 'Consultas gerais e check-ups de rotina',
      icon: 'stethoscope',
      waitMin: 5,
      waitMax: 15,
    ),
    Specialty(
      id: 'dermatology',
      name: 'Dermatologia',
      description: 'Problemas de pele, alergias e pelagem',
      icon: 'dermatology',
      waitMin: 20,
      waitMax: 30,
    ),
    Specialty(
      id: 'cardiology',
      name: 'Cardiologia',
      description: 'Saúde cardiovascular e problemas cardíacos',
      icon: 'cardiology',
      waitMin: 30,
      waitMax: 45,
    ),
    Specialty(
      id: 'orthopedics',
      name: 'Ortopedia',
      description: 'Problemas ósseos, articulares e de locomoção',
      icon: 'orthopedics',
      waitMin: 25,
      waitMax: 40,
    ),
    Specialty(
      id: 'nutrition',
      name: 'Nutrição',
      description: 'Orientação alimentar e dietas especiais',
      icon: 'nutrition',
      waitMin: 15,
      waitMax: 25,
    ),
    Specialty(
      id: 'behavior',
      name: 'Comportamento',
      description: 'Problemas comportamentais e adestramento',
      icon: 'behavior',
      waitMin: 20,
      waitMax: 35,
    ),
    Specialty(
      id: 'ophthalmology',
      name: 'Oftalmologia',
      description: 'Saúde ocular e problemas de visão',
      icon: 'ophthalmology',
      waitMin: 30,
      waitMax: 40,
    ),
    Specialty(
      id: 'dentistry',
      name: 'Odontologia',
      description: 'Saúde bucal e dental',
      icon: 'dentistry',
      waitMin: 25,
      waitMax: 35,
    ),
  ]);

  @override
  Future<void> requestTeleconsult({required String petId, required String specialtyId, String? symptoms}) {
    _sessions.insert(
      0,
      _TeleSession(
        id: _id(),
        petId: petId,
        specialty: _specialtyNames[specialtyId] ?? 'Teleconsulta',
        symptoms: symptoms ?? '',
        status: 'Aguardando',
      ),
    );
    return _delay(null);
  }

  @override
  Future<List<SearchHit>> search(String query) {
    final needle = foldText(query.trim());
    if (needle.length < 2) return Future.value(const []);
    final petName = {for (final pet in _pets) pet.id: pet.name};
    final hits = <SearchHit>[];
    bool matches(Iterable<String?> values) => values.any((value) => foldText(value ?? '').contains(needle));
    bool broad(List<String> words) => words.any((word) => needle == word || needle.startsWith('$word '));

    for (final pet in _pets) {
      if (broad(['pet', 'pets']) || matches([pet.name, pet.breed, pet.species.name, pet.collarId])) {
        hits.add(SearchHit(kind: SearchKind.pet, id: pet.id, title: pet.name, subtitle: pet.summary, petId: pet.id));
      }
    }
    for (final event in _events) {
      if (matches([event.title, event.notes, event.type.name, event.type.label, petName[event.petId]])) {
        hits.add(
          SearchHit(
            kind: SearchKind.event,
            id: event.id,
            title: event.title,
            subtitle: '${event.type.label} · ${petName[event.petId]}',
            petId: event.petId,
            type: event.type.name,
          ),
        );
      }
    }
    for (final doc in _documents) {
      if (broad(['documento', 'documentos']) ||
          matches([doc.name, doc.notes, doc.category.name, doc.category.label, petName[doc.petId]])) {
        hits.add(
          SearchHit(
            kind: SearchKind.document,
            id: doc.id,
            title: doc.name,
            subtitle: '${doc.category.label} · ${petName[doc.petId]}',
            petId: doc.petId,
            type: doc.category.name,
          ),
        );
      }
    }
    for (final session in _sessions) {
      if (broad(['sessao', 'sessoes', 'telemedicina', 'teleconsulta']) ||
          matches([session.symptoms, session.specialty, session.status, petName[session.petId]])) {
        hits.add(
          SearchHit(
            kind: SearchKind.session,
            id: session.id,
            title: session.specialty,
            subtitle: [session.status, petName[session.petId], session.symptoms].whereType<String>().join(' · '),
            petId: session.petId,
            type: session.status,
          ),
        );
      }
    }
    for (final member in _team) {
      if (broad(['equipe', 'veterinario']) || matches([member.name, member.role, member.clinic])) {
        hits.add(
          SearchHit(
            kind: SearchKind.care,
            id: member.id,
            title: member.name,
            subtitle: [member.role, member.clinic].whereType<String>().join(' · '),
          ),
        );
      }
    }
    return Future.value(hits.take(20).toList());
  }
}

const _specialtyNames = {
  'general': 'Clínico geral',
  'dermatology': 'Dermatologia',
  'cardiology': 'Cardiologia',
  'orthopedics': 'Ortopedia',
  'nutrition': 'Nutrição',
  'behavior': 'Comportamento',
  'ophthalmology': 'Oftalmologia',
  'dentistry': 'Odontologia',
};

class _TeleSession {
  const _TeleSession({
    required this.id,
    required this.petId,
    required this.specialty,
    required this.symptoms,
    required this.status,
  });

  final String id;
  final String petId;
  final String specialty;
  final String symptoms;
  final String status;
}

double _avg(List<double> values) => values.isEmpty ? 0 : values.reduce((a, b) => a + b) / values.length;

double _change(double current, double previous) =>
    previous == 0 ? 0 : (((current - previous) / previous) * 1000).round() / 10;

const _weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
String _weekday(DateTime d) => _weekdays[d.weekday - 1];

class _DayBucket {
  _DayBucket(this.day);
  final DateTime day;
  final rows = <_Reading>[];
}

List<_DayBucket> _days(List<_Reading> readings, int count) {
  final now = DateTime.now();
  final buckets = [for (var i = count - 1; i >= 0; i--) _DayBucket(DateTime(now.year, now.month, now.day - i))];
  for (final r in readings) {
    final key = DateTime(r.at.year, r.at.month, r.at.day);
    for (final b in buckets) {
      if (b.day == key) b.rows.add(r);
    }
  }
  return buckets;
}

List<LocationShare> _locations(List<_Reading> readings) {
  final counts = <String, int>{};
  for (final r in readings) {
    counts[r.location] = (counts[r.location] ?? 0) + 1;
  }
  final total = readings.isEmpty ? 1 : readings.length;
  return counts.entries
      .map(
        (e) =>
            LocationShare(location: e.key, minutes: e.value * 60, percentage: ((e.value / total) * 1000).round() / 10),
      )
      .toList()
    ..sort((a, b) => b.minutes.compareTo(a.minutes));
}

class _Profile {
  const _Profile(this.heartRate, this.temperature, this.steps, this.activeMinutes);

  final Range heartRate;
  final Range temperature;
  final int steps;
  final int activeMinutes;

  static _Profile of(Species s) => switch (s) {
    Species.cachorro => const _Profile(Range(60, 140), Range(37.5, 39.2), 10000, 180),
    Species.gato => const _Profile(Range(120, 220), Range(38.0, 39.2), 4000, 150),
    Species.outro => const _Profile(Range(60, 200), Range(37.5, 39.5), 5000, 120),
  };
}

class _Reading {
  const _Reading({
    required this.at,
    required this.temperature,
    required this.heartRate,
    required this.activity,
    required this.steps,
    required this.distanceM,
    required this.activeMin,
    required this.location,
  });

  final DateTime at;
  final double temperature;
  final int heartRate;
  final int activity;
  final int steps;
  final int distanceM;
  final int activeMin;
  final String location;

  static const _dog = [8, 4, 2, 2, 3, 10, 25, 70, 45, 30, 35, 40, 30, 25, 35, 30, 30, 75, 45, 35, 30, 20, 12, 8];
  static const _cat = [35, 30, 20, 15, 20, 30, 45, 40, 25, 15, 10, 10, 12, 10, 15, 20, 30, 45, 55, 50, 40, 35, 40, 38];

  factory _Reading.simulate(Pet pet, DateTime at, {required bool fever}) {
    final rand = math.Random(Object.hash(pet.id, at.millisecondsSinceEpoch));
    final isCat = pet.species == Species.gato;
    final hour = at.hour;
    final energy = 0.75 + (pet.id.hashCode.abs() % 50) / 100;
    final activity = ((isCat ? _cat : _dog)[hour] * energy + (rand.nextDouble() - 0.5) * 16).round().clamp(0, 100);

    var temperature = (isCat ? 38.3 : 38.0) + activity * 0.006 + (rand.nextDouble() - 0.5) * 0.3;
    var heartRate = (isCat ? 135 : 72) + activity * (isCat ? 0.45 : 0.4) + (rand.nextDouble() - 0.5) * 10;
    final now = DateTime.now();
    final isToday = at.year == now.year && at.month == now.month && at.day == now.day;
    if (fever && isToday && hour >= 6) {
      final intensity = math.min(1.0, (hour - 5) / 3);
      temperature += 1.7 * intensity;
      heartRate += 50 * intensity;
    }

    final steps = (activity * (isCat ? 5 : 13) * (0.8 + rand.nextDouble() * 0.4)).round();
    final String location;
    if (isCat) {
      location = activity > 40 && rand.nextDouble() > 0.6 ? 'quintal' : 'casa';
    } else if ((hour == 7 || hour == 17) && activity > 50) {
      location = rand.nextBool() ? 'parque' : 'rua';
    } else if (hour < 6 || hour > 21) {
      location = 'casa';
    } else {
      location = activity > 28 ? 'quintal' : 'casa';
    }

    return _Reading(
      at: at,
      temperature: (temperature * 10).round() / 10,
      heartRate: heartRate.round(),
      activity: activity,
      steps: steps,
      distanceM: (steps * (isCat ? 0.25 : 0.55)).round(),
      activeMin: math.min(60, (activity * 0.2 + rand.nextDouble() * 3).round()),
      location: location,
    );
  }
}
