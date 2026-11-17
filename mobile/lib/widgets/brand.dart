import 'package:flutter_svg/flutter_svg.dart';
import 'package:material_ui/material_ui.dart';

/// Logotipo PetCare, sempre na cor laranja original da marca.
class PetcareLogo extends StatelessWidget {
  const PetcareLogo({super.key, this.height = 22});

  final double height;

  @override
  Widget build(BuildContext context) =>
      SvgPicture.asset('assets/brand/logo-petcare.svg', height: height, semanticsLabel: 'PetCare');
}
