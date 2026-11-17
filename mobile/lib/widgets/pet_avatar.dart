import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import '../core/theme/app_colors.dart';
import '../data/models.dart';
import '../state/pets_controller.dart';

class PetAvatar extends StatelessWidget {
  const PetAvatar({super.key, required this.pet, this.size = 44, this.selected = false});

  final Pet pet;
  final double size;
  final bool selected;

  ImageProvider? _image(BuildContext context) {
    final url = context.read<PetsController>().repository.resolveImage(pet.photoUrl);
    if (url == null) return null;
    if (url.startsWith('asset:')) return AssetImage(url.substring(6));
    return NetworkImage(url);
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final image = _image(context);
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      padding: EdgeInsets.all(selected ? 2.5 : 0),
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: selected ? const LinearGradient(colors: [AppColors.amber, AppColors.amberDeep]) : null,
      ),
      child: Container(
        padding: EdgeInsets.all(selected ? 2 : 0),
        decoration: BoxDecoration(shape: BoxShape.circle, color: scheme.surface),
        child: CircleAvatar(
          radius: size / 2,
          backgroundColor: AppColors.amberSoft,
          foregroundImage: image,
          onForegroundImageError: image == null ? null : (_, _) {},
          child: Text(
            pet.name.characters.first.toUpperCase(),
            style: TextStyle(color: AppColors.amberDeep, fontWeight: FontWeight.w800, fontSize: size * 0.4),
          ),
        ),
      ),
    );
  }
}
