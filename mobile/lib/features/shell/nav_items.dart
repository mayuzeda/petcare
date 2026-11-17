import 'package:material_ui/material_ui.dart';

class NavItem {
  const NavItem(this.label, this.icon, this.selectedIcon, this.path);

  final String label;
  final IconData icon;
  final IconData selectedIcon;
  final String path;
}

class NavGroup {
  const NavGroup(this.title, this.items);

  final String? title;
  final List<NavItem> items;
}

const navGroups = [
  NavGroup(null, [
    NavItem('Início', Icons.space_dashboard_outlined, Icons.space_dashboard_rounded, '/app'),
    NavItem('Meus pets', Icons.pets_outlined, Icons.pets_rounded, '/app/pets'),
    NavItem('Saúde', Icons.monitor_heart_outlined, Icons.monitor_heart_rounded, '/app/saude'),
    NavItem('Atividade e GPS', Icons.share_location_outlined, Icons.share_location_rounded, '/app/atividade'),
    NavItem('Agenda', Icons.calendar_month_outlined, Icons.calendar_month_rounded, '/app/agenda'),
  ]),
  NavGroup('Cuidados', [
    NavItem('Consultas', Icons.medical_services_outlined, Icons.medical_services_rounded, '/app/consultas'),
    NavItem('Exames', Icons.biotech_outlined, Icons.biotech_rounded, '/app/exames'),
    NavItem('Vermífugos', Icons.bug_report_outlined, Icons.bug_report_rounded, '/app/vermifugos'),
    NavItem('Documentos', Icons.folder_outlined, Icons.folder_rounded, '/app/documentos'),
  ]),
  NavGroup('Atendimento', [
    NavItem('Telemedicina', Icons.video_call_outlined, Icons.video_call_rounded, '/app/telemedicina'),
    NavItem('Chat com o vet', Icons.chat_bubble_outline_rounded, Icons.chat_bubble_rounded, '/app/chat'),
  ]),
];

final allNavItems = [for (final g in navGroups) ...g.items];

NavItem navItemFor(String location) => allNavItems.lastWhere(
  (i) => location == i.path || location.startsWith('${i.path}/'),
  orElse: () => allNavItems.first,
);
