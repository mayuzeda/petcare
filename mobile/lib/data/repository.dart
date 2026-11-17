import 'models.dart';

class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  bool get isUnauthorized => statusCode == 401;

  @override
  String toString() => message;
}

class AuthResult {
  const AuthResult({required this.token, required this.user});
  final String token;
  final AppUser user;
}

abstract interface class PetcareRepository {
  bool get isDemo;

  /// Converte caminhos relativos da API (ex.: `/static/pets/bela.png`) em URLs/arquivos carregáveis.
  String? resolveImage(String? path);

  Future<List<Pet>> pets();
  Future<Pet> createPet(PetDraft draft);
  Future<void> deletePet(String petId);

  Future<DashboardData> dashboard(String petId);
  Future<HealthReport> health(String petId, TimeRange range);
  Future<ActivityReport> activity(String petId, TimeRange range);

  Future<List<PetEvent>> events({String? petId, EventType? type});
  Future<PetEvent> createEvent(EventDraft draft);
  Future<PetEvent> updateEventStatus(String eventId, EventStatus status);
  Future<void> deleteEvent(String eventId);

  Future<List<PetDocument>> documents(String petId);
  Future<PetDocument> createDocument(
    String petId, {
    required String name,
    required DocumentCategory category,
    String? notes,
  });
  Future<PetDocument> setDocumentFavorite(String documentId, bool favorite);
  Future<void> deleteDocument(String documentId);

  Future<List<AppNotification>> notifications();
  Future<void> markNotificationRead(String id);
  Future<void> markAllNotificationsRead();

  Future<List<CareMember>> careTeam();
  Future<List<Specialty>> specialties();
  Future<void> requestTeleconsult({required String petId, required String specialtyId, String? symptoms});

  Future<List<SearchHit>> search(String query);
}
