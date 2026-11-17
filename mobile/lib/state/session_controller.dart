import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../core/config.dart';
import '../data/api_repository.dart';
import '../data/demo_repository.dart';
import '../data/models.dart';
import '../data/repository.dart';

enum SessionStatus { signedOut, signedIn }

class SessionController extends ChangeNotifier {
  SessionController(this._prefs);

  static const _tokenKey = 'session.token';
  static const _userKey = 'session.user';
  static const _demoKey = 'session.demo';

  final SharedPreferences _prefs;

  SessionStatus status = SessionStatus.signedOut;
  AppUser? user;
  PetcareRepository? repository;

  bool get isSignedIn => status == SessionStatus.signedIn;
  bool get isDemo => repository?.isDemo ?? false;

  ApiRepository _api([String? token]) => ApiRepository(baseUrl: AppConfig.apiUrl, token: token, onUnauthorized: logout);

  void restore() {
    if (_prefs.getBool(_demoKey) ?? false) {
      _enterDemo();
      return;
    }
    final token = _prefs.getString(_tokenKey);
    final userJson = _prefs.getString(_userKey);
    if (token == null || userJson == null) return;
    user = AppUser.fromJson(jsonDecode(userJson) as Json);
    repository = _api(token);
    status = SessionStatus.signedIn;
  }

  Future<void> login(String email, String password) async => _start(await _api().login(email.trim(), password));

  Future<void> register(String name, String email, String password) async =>
      _start(await _api().register(name.trim(), email.trim(), password));

  Future<void> _start(AuthResult result) async {
    await _prefs.setString(_tokenKey, result.token);
    await _prefs.setString(_userKey, jsonEncode(result.user.toJson()));
    await _prefs.remove(_demoKey);
    user = result.user;
    repository = _api(result.token);
    status = SessionStatus.signedIn;
    notifyListeners();
  }

  Future<void> startDemo() async {
    await _prefs.setBool(_demoKey, true);
    _enterDemo();
    notifyListeners();
  }

  void _enterDemo() {
    user = DemoRepository.user;
    repository = DemoRepository();
    status = SessionStatus.signedIn;
  }

  Future<void> logout() async {
    await _prefs.remove(_tokenKey);
    await _prefs.remove(_userKey);
    await _prefs.remove(_demoKey);
    user = null;
    repository = null;
    status = SessionStatus.signedOut;
    notifyListeners();
  }
}
