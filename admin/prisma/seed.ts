import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Permission catalog — keys match Section 6 of the migration spec exactly.
const PERMISSIONS: Array<{ key: string; label: string; category: string }> = [
  { key: 'dashboard.view', label: 'Panoyu Görüntüle', category: 'dashboard' },
  { key: 'products.view', label: 'Ürünleri Görüntüle', category: 'products' },
  { key: 'products.create', label: 'Ürün Oluştur', category: 'products' },
  { key: 'products.update', label: 'Ürün Güncelle', category: 'products' },
  { key: 'products.delete', label: 'Ürün Sil', category: 'products' },
  { key: 'products.publish', label: 'Ürün Yayınla', category: 'products' },
  { key: 'categories.manage', label: 'Kategorileri Yönet', category: 'categories' },
  { key: 'pages.manage', label: 'Sayfaları Yönet', category: 'pages' },
  { key: 'pages.publish', label: 'Sayfa Yayınla', category: 'pages' },
  { key: 'news.manage', label: 'Haberleri Yönet', category: 'news' },
  { key: 'dealers.manage', label: 'Bayileri Yönet', category: 'dealers' },
  { key: 'banners.manage', label: 'Banner Yönet', category: 'banners' },
  { key: 'media.view', label: 'Medyayı Görüntüle', category: 'media' },
  { key: 'media.upload', label: 'Medya Yükle', category: 'media' },
  { key: 'media.delete', label: 'Medya Sil', category: 'media' },
  { key: 'translations.manage', label: 'Çevirileri Yönet', category: 'translations' },
  { key: 'users.manage', label: 'Kullanıcıları Yönet', category: 'users' },
  { key: 'roles.manage', label: 'Rolleri Yönet', category: 'roles' },
  { key: 'settings.manage', label: 'Ayarları Yönet', category: 'settings' },
  { key: 'audit.view', label: 'Denetim Kaydını Görüntüle', category: 'audit' },
  { key: 'redirects.manage', label: 'Yönlendirmeleri Yönet', category: 'redirects' },
  { key: 'seo.manage', label: 'SEO Yönet', category: 'seo' },
];

// Role -> permission-key assignments.
const ROLES: Array<{ key: string; label: string; description: string; isSystem: boolean; permissionKeys: string[] | '*' }> = [
  {
    key: 'SUPER_ADMIN',
    label: 'Süper Yönetici',
    description: 'Tüm modüllere ve sistem ayarlarına tam erişim.',
    isSystem: true,
    permissionKeys: '*',
  },
  {
    key: 'ADMIN',
    label: 'Yönetici',
    description: 'Kullanıcı ve rol yönetimi hariç tüm içerik ve sistem modüllerine erişim.',
    isSystem: true,
    permissionKeys: PERMISSIONS.map((p) => p.key).filter((k) => !k.startsWith('users.') && !k.startsWith('roles.')),
  },
  {
    key: 'EDITOR',
    label: 'Editör',
    description: 'İçerik oluşturma, düzenleme ve yayınlama.',
    isSystem: true,
    permissionKeys: [
      'dashboard.view', 'products.view', 'products.create', 'products.update', 'products.publish',
      'categories.manage', 'pages.manage', 'pages.publish', 'news.manage', 'dealers.manage',
      'banners.manage', 'media.view', 'media.upload', 'seo.manage',
    ],
  },
  {
    key: 'TRANSLATOR',
    label: 'Çevirmen',
    description: 'Sadece çeviri içeriklerini görüntüleme ve düzenleme.',
    isSystem: true,
    permissionKeys: ['dashboard.view', 'products.view', 'translations.manage', 'media.view'],
  },
  {
    key: 'MEDIA_MANAGER',
    label: 'Medya Yöneticisi',
    description: 'Medya kütüphanesi yönetimi.',
    isSystem: true,
    permissionKeys: ['dashboard.view', 'media.view', 'media.upload', 'media.delete'],
  },
  {
    key: 'VIEWER',
    label: 'İzleyici',
    description: 'Salt okunur erişim.',
    isSystem: true,
    permissionKeys: ['dashboard.view', 'products.view', 'media.view', 'audit.view'],
  },
];

const LANGUAGES: Array<{ code: string; label: string; isDefault: boolean; isRtl: boolean; sortOrder: number }> = [
  { code: 'tr', label: 'Türkçe', isDefault: true, isRtl: false, sortOrder: 0 },
  { code: 'en', label: 'English', isDefault: false, isRtl: false, sortOrder: 1 },
  { code: 'de', label: 'Deutsch', isDefault: false, isRtl: false, sortOrder: 2 },
  { code: 'fr', label: 'Français', isDefault: false, isRtl: false, sortOrder: 3 },
  { code: 'ru', label: 'Русский', isDefault: false, isRtl: false, sortOrder: 4 },
  { code: 'az', label: 'Azərbaycan', isDefault: false, isRtl: false, sortOrder: 5 },
  { code: 'ar', label: 'العربية', isDefault: false, isRtl: true, sortOrder: 6 },
];

async function seedLanguages() {
  for (const lang of LANGUAGES) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: { label: lang.label, isDefault: lang.isDefault, isRtl: lang.isRtl, sortOrder: lang.sortOrder },
      create: lang,
    });
  }
  console.log(`Seeded ${LANGUAGES.length} languages.`);
}

async function seedPermissions() {
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: { label: perm.label, category: perm.category },
      create: perm,
    });
  }
  console.log(`Seeded ${PERMISSIONS.length} permissions.`);
}

async function seedRoles() {
  const allPermissionKeys = PERMISSIONS.map((p) => p.key);

  for (const role of ROLES) {
    const roleRecord = await prisma.role.upsert({
      where: { key: role.key },
      update: { label: role.label, description: role.description, isSystem: role.isSystem },
      create: { key: role.key, label: role.label, description: role.description, isSystem: role.isSystem },
    });

    const permissionKeys = role.permissionKeys === '*' ? allPermissionKeys : role.permissionKeys;
    const permissions = await prisma.permission.findMany({ where: { key: { in: permissionKeys } } });

    // Idempotent: replace the role's permission set rather than accumulating duplicates on re-run.
    await prisma.rolePermission.deleteMany({ where: { roleId: roleRecord.id } });
    await prisma.rolePermission.createMany({
      data: permissions.map((p) => ({ roleId: roleRecord.id, permissionId: p.id })),
    });
  }
  console.log(`Seeded ${ROLES.length} roles.`);
}

async function seedInitialAdmin() {
  const email = process.env.INITIAL_ADMIN_EMAIL;
  const password = process.env.INITIAL_ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn(
      '\n⚠️  INITIAL_ADMIN_EMAIL / INITIAL_ADMIN_PASSWORD not set — skipping initial admin user creation.\n' +
      '   No production credential was fabricated. Set both in your environment and re-run this seed\n' +
      '   (`npx prisma db seed`) to create the first SUPER_ADMIN user.\n'
    );
    return;
  }

  if (password.length < 12) {
    throw new Error('INITIAL_ADMIN_PASSWORD must be at least 12 characters.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Sync the password hash + active status on re-run too, not just on create.
  // This is what makes the "same user-facing password" transition robust and
  // idempotent: re-seeding an existing admin re-derives the hash from
  // INITIAL_ADMIN_PASSWORD (e.g. after switching hash algorithms, or the
  // recovery -> database auth handover) instead of silently keeping a stale
  // hash. The initial admin is defined by the env var, so aligning to it on
  // every run is the intended behavior.
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, status: 'ACTIVE' },
    create: { name: 'Süper Yönetici', email, passwordHash, status: 'ACTIVE' },
  });

  const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { key: 'SUPER_ADMIN' } });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: superAdminRole.id } },
    update: {},
    create: { userId: user.id, roleId: superAdminRole.id },
  });

  console.log(`Seeded initial SUPER_ADMIN user: ${email}`);
}

async function main() {
  await seedLanguages();
  await seedPermissions();
  await seedRoles();
  await seedInitialAdmin();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
