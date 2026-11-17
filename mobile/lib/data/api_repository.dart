import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import 'models.dart';
import 'repository.dart';

class ApiRepository implements PetcareRepository {
  ApiRepository({required this.baseUrl, this.token, http.Client? client, this.onUnauthorized})
    : _client = client ?? http.Client();

  final String baseUrl;
  final String? token;
  final http.Client _client;
  final void Function()? onUnauthorized;

  static const _timeout = Duration(seconds: 15);

  @override
  bool get isDemo => false;

  @override
  String? resolveImage(String? path) {
    if (path == null || path.isEmpty) return null;
    return path.startsWith('http') ? path : '$baseUrl$path';
  }

  Future<AuthResult> login(String email, String password) async =>
      _auth(await _send('POST', '/auth/login', body: {'email': email, 'password': password}));

  Future<AuthResult> register(String name, String email, String password) async =>
      _auth(await _send('POST', '/auth/register', body: {'name': name, 'email': email, 'password': password}));

  AuthResult _auth(Object? json) {
    final j = json as Json;
    return AuthResult(token: j['token'], user: AppUser.fromJson(j['user']));
  }

  Future<Object?> _send(String method, String path, {Object? body, Map<String, String>? query}) async {
    final uri = Uri.parse('$baseUrl$path').replace(queryParameters: query);
    final request = http.Request(method, uri)
      ..headers['accept'] = 'application/json'
      ..headers.addAll({if (token != null) 'authorization': 'Bearer $token'});
    if (body != null) {
      request.headers['content-type'] = 'application/json';
      request.body = jsonEncode(body);
    }

    final http.Response response;
    try {
      response = await http.Response.fromStream(await _client.send(request).timeout(_timeout));
    } on TimeoutException {
      throw const ApiException('O servidor demorou para responder. Tente novamente.');
    } on http.ClientException {
      throw const ApiException('Não foi possível conectar ao servidor do PetCare.');
    }

    final decoded = response.body.isEmpty ? null : jsonDecode(utf8.decode(response.bodyBytes));
    if (response.statusCode >= 400) {
      if (response.statusCode == 401 && token != null) onUnauthorized?.call();
      final message = decoded is Json ? decoded['error'] as String? : null;
      final details = decoded is Json ? decoded['details'] as List? : null;
      final detail = details != null && details.isNotEmpty ? (details.first as Json)['message'] as String? : null;
      throw ApiException(
        detail ?? message ?? 'Erro inesperado (${response.statusCode})',
        statusCode: response.statusCode,
      );
    }
    return decoded;
  }

  Future<List<T>> _list<T>(String path, T Function(Json) parse, {Map<String, String>? query}) async {
    final data = await _send('GET', path, query: query) as List;
    return [for (final item in data) parse(item as Json)];
  }

  @override
  Future<List<Pet>> pets() => _list('/pets', Pet.fromJson);

  @override
  Future<Pet> createPet(PetDraft draft) async =>
      Pet.fromJson(await _send('POST', '/pets', body: draft.toJson()) as Json);

  @override
  Future<void> deletePet(String petId) => _send('DELETE', '/pets/$petId');

  @override
  Future<DashboardData> dashboard(String petId) async =>
      DashboardData.fromJson(await _send('GET', '/pets/$petId/dashboard') as Json);

  @override
  Future<HealthReport> health(String petId, TimeRange range) async =>
      HealthReport.fromJson(await _send('GET', '/pets/$petId/health', query: {'range': range.name}) as Json);

  @override
  Future<ActivityReport> activity(String petId, TimeRange range) async =>
      ActivityReport.fromJson(await _send('GET', '/pets/$petId/activity', query: {'range': range.name}) as Json);

  @override
  Future<List<PetEvent>> events({String? petId, EventType? type}) =>
      _list('/events', PetEvent.fromJson, query: {'petId': ?petId, 'type': ?type?.name});

  @override
  Future<PetEvent> createEvent(EventDraft draft) async =>
      PetEvent.fromJson(await _send('POST', '/events', body: draft.toJson()) as Json);

  @override
  Future<PetEvent> updateEventStatus(String eventId, EventStatus status) async =>
      PetEvent.fromJson(await _send('PATCH', '/events/$eventId', body: {'status': status.name}) as Json);

  @override
  Future<void> deleteEvent(String eventId) => _send('DELETE', '/events/$eventId');

  @override
  Future<List<PetDocument>> documents(String petId) => _list('/pets/$petId/documents', PetDocument.fromJson);

  @override
  Future<PetDocument> createDocument(
    String petId, {
    required String name,
    required DocumentCategory category,
    String? notes,
  }) async => PetDocument.fromJson(
    await _send(
      'POST',
      '/pets/$petId/documents',
      body: {'name': name, 'category': category.name, 'fileType': 'pdf', 'notes': notes},
    ) as Json,
  );

  @override
  Future<PetDocument> setDocumentFavorite(String documentId, bool favorite) async =>
      PetDocument.fromJson(await _send('PATCH', '/documents/$documentId', body: {'favorite': favorite}) as Json);

  @override
  Future<void> deleteDocument(String documentId) => _send('DELETE', '/documents/$documentId');

  @override
  Future<List<AppNotification>> notifications() => _list('/notifications', AppNotification.fromJson);

  @override
  Future<void> markNotificationRead(String id) => _send('POST', '/notifications/$id/read');

  @override
  Future<void> markAllNotificationsRead() => _send('POST', '/notifications/read-all');

  @override
  Future<List<CareMember>> careTeam() => _list('/care-team', CareMember.fromJson);

  @override
  Future<List<Specialty>> specialties() => _list('/telemedicine/specialties', Specialty.fromJson);

  @override
  Future<void> requestTeleconsult({required String petId, required String specialtyId, String? symptoms}) =>
      _send('POST', '/telemedicine/sessions', body: {'petId': petId, 'specialtyId': specialtyId, 'symptoms': symptoms});

  @override
  Future<List<SearchHit>> search(String query) => _list('/search', SearchHit.fromJson, query: {'q': query});
}
