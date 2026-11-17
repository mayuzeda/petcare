# PetCare

Acompanhamento da saúde dos pets para Android, iOS e web. O app fica em `mobile/` (Flutter) e a API em `backend/` (Node).

## Backend

```sh
cd backend
npm install
npm run seed
npm run dev
```

A API sobe em `http://localhost:3333`. A conta de demonstração é `demo@petcare.app` / `petcare123`.

## App

```sh
cd mobile
flutter pub get
flutter run
```

O emulador Android alcança a API em `10.0.2.2:3333`. Em um celular na mesma rede, passe o endereço da máquina:

```sh
flutter run --dart-define=API_URL=http://SEU_IP:3333
```

O botão "Ver demonstração" na home abre o dashboard com dados locais, sem precisar do backend.
