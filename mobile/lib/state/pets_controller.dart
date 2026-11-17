import 'package:flutter/foundation.dart';

import '../data/models.dart';
import '../data/repository.dart';

class PetsController extends ChangeNotifier {
  PetcareRepository? _repository;

  List<Pet> pets = const [];
  Pet? selected;
  bool loading = false;
  String? error;
  int unreadNotifications = 0;

  PetcareRepository get repository => _repository!;

  void attach(PetcareRepository? repository) {
    if (identical(repository, _repository)) return;
    _repository = repository;
    pets = const [];
    selected = null;
    error = null;
    unreadNotifications = 0;
    if (repository != null) load();
  }

  Future<void> load() async {
    final repo = _repository;
    if (repo == null) return;
    loading = true;
    error = null;
    notifyListeners();
    try {
      final list = await repo.pets();
      if (!identical(repo, _repository)) return;
      pets = list;
      selected = list.where((p) => p.id == selected?.id).firstOrNull ?? list.firstOrNull;
      await refreshNotifications();
    } on ApiException catch (e) {
      error = e.message;
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  Future<void> refreshNotifications() async {
    final repo = _repository;
    if (repo == null) return;
    try {
      final list = await repo.notifications();
      unreadNotifications = list.where((n) => !n.read).length;
      notifyListeners();
    } on ApiException {
      // O contador de notificações não deve bloquear o restante do app.
    }
  }

  void select(Pet pet) {
    selected = pet;
    notifyListeners();
  }

  Future<Pet> add(PetDraft draft) async {
    final pet = await repository.createPet(draft);
    pets = [...pets, pet];
    selected = pet;
    notifyListeners();
    return pet;
  }

  Future<void> remove(Pet pet) async {
    await repository.deletePet(pet.id);
    pets = pets.where((p) => p.id != pet.id).toList();
    if (selected?.id == pet.id) selected = pets.firstOrNull;
    notifyListeners();
  }
}
