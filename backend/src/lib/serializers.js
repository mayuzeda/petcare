export function toUser(row) {
  return { id: row.id, name: row.name, email: row.email, createdAt: row.created_at };
}

function ageInYears(birthDate) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthday) years -= 1;
  return Math.max(0, years);
}

export function toPet(row) {
  return {
    id: row.id,
    name: row.name,
    species: row.species,
    breed: row.breed,
    sex: row.sex,
    birthDate: row.birth_date,
    ageYears: ageInYears(row.birth_date),
    weightKg: row.weight_kg,
    collarId: row.collar_id,
    photoUrl: row.photo_url,
    createdAt: row.created_at,
  };
}

export function toEvent(row, now = new Date()) {
  const overdue = row.status === 'agendado' && new Date(row.starts_at) < now;
  return {
    id: row.id,
    petId: row.pet_id,
    title: row.title,
    type: row.type,
    startsAt: row.starts_at,
    reminder: Boolean(row.reminder),
    notes: row.notes,
    status: overdue ? 'atrasado' : row.status,
  };
}

export function toDocument(row) {
  return {
    id: row.id,
    petId: row.pet_id,
    name: row.name,
    category: row.category,
    fileType: row.file_type,
    fileUrl: row.file_url,
    fileSize: row.file_size,
    notes: row.notes,
    favorite: Boolean(row.favorite),
    uploadedAt: row.uploaded_at,
  };
}

export function toNotification(row) {
  return {
    id: row.id,
    petId: row.pet_id,
    type: row.type,
    title: row.title,
    message: row.message,
    read: Boolean(row.read),
    createdAt: row.created_at,
  };
}

export function toCareMember(row) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    clinic: row.clinic,
    rating: row.rating,
    phone: row.phone,
    lastContactAt: row.last_contact_at,
  };
}

export function toSpecialty(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    waitMinutes: { min: row.wait_min, max: row.wait_max },
  };
}

export function toTeleSession(row) {
  return {
    id: row.id,
    petId: row.pet_id,
    specialtyId: row.specialty_id,
    symptoms: row.symptoms,
    status: row.status,
    createdAt: row.created_at,
  };
}
