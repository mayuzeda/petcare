import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:material_ui/material_ui.dart';
import 'package:petcare/app.dart';
import 'package:petcare/data/demo_repository.dart';
import 'package:petcare/data/models.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUpAll(() async {
    GoogleFonts.config.allowRuntimeFetching = false;
    await initializeDateFormatting('pt_BR');
  });

  group('DemoRepository', () {
    test('gera dashboard com indicadores e alerta de febre para o Thor', () async {
      final repo = DemoRepository();
      final pets = await repo.pets();
      expect(pets.map((p) => p.name), ['Bella', 'Dom', 'Thor']);

      final bella = await repo.dashboard('bella');
      expect(bella.weeklyActivity, hasLength(7));
      expect(bella.steps.progress, inInclusiveRange(0, 1));
      expect(bella.locations, isNotEmpty);

      final now = DateTime.now();
      final thor = await repo.dashboard('thor');
      if (now.hour >= 8) expect(thor.temperature.isAlert, isTrue);
    });

    test('cria e conclui eventos', () async {
      final repo = DemoRepository();
      final created = await repo.createEvent(
        EventDraft(
          petId: 'bella',
          title: 'Reforço',
          type: EventType.vacina,
          startsAt: DateTime.now().add(const Duration(days: 2)),
        ),
      );
      expect(created.status, EventStatus.agendado);
      final done = await repo.updateEventStatus(created.id, EventStatus.concluido);
      expect(done.status, EventStatus.concluido);
    });
  });

  testWidgets('home pública abre e o modo demonstração leva ao painel', (tester) async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    tester.view.physicalSize = const Size(1400, 1000);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(PetcareApp(prefs: prefs));
    await tester.pump();
    expect(find.text('Ver demonstração'), findsOneWidget);

    await tester.tap(find.text('Ver demonstração'));
    await tester.pump();
    await tester.pump(const Duration(seconds: 1));
    await tester.pump(const Duration(seconds: 2));

    expect(find.text('Atividade semanal'), findsOneWidget);
    expect(find.text('Próximos cuidados'), findsOneWidget);
    expect(find.text('Equipe de cuidado'), findsOneWidget);
  });
}
