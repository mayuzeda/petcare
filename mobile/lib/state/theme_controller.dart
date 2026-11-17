import 'package:material_ui/material_ui.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeController extends ChangeNotifier {
  ThemeController(this._prefs) : mode = _read(_prefs);

  static const _key = 'theme.mode';
  final SharedPreferences _prefs;
  ThemeMode mode;

  static ThemeMode _read(SharedPreferences prefs) =>
      ThemeMode.values.firstWhere((m) => m.name == prefs.getString(_key), orElse: () => ThemeMode.light);

  Future<void> set(ThemeMode value) async {
    mode = value;
    notifyListeners();
    await _prefs.setString(_key, value.name);
  }
}
