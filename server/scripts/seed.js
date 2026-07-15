import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });

const { sequelize, Season, User, Group } = await import('../models/index.js');

const TEACHERS = [
  { name: 'James', login: 'teacher1' },
  { name: 'Emma', login: 'teacher2' },
  { name: 'Liam', login: 'teacher3' },
];

const GROUPS = [
  { name: 'Дельфины', teacherLogins: ['teacher1', 'teacher2'] },
  { name: 'Тигры', teacherLogins: ['teacher3'] },
];

const ENGLISH_FIRST_NAMES = [
  'James',
  'Emma',
  'Liam',
  'Olivia',
  'Noah',
  'Ava',
  'Ethan',
  'Sophia',
  'Mason',
  'Isabella',
  'Lucas',
  'Mia',
  'Henry',
  'Charlotte',
  'Jack',
  'Amelia',
];

function randomEnglishName() {
  return ENGLISH_FIRST_NAMES[Math.floor(Math.random() * ENGLISH_FIRST_NAMES.length)];
}

const SEED_PASSWORD = 'password123';

async function main() {
  await sequelize.sync({ alter: true });

  let season = await Season.findOne({ where: { isActive: true } });
  if (!season) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 21);
    season = await Season.create({
      year: String(startDate.getFullYear()),
      number: '1',
      startDate,
      endDate,
      isActive: true,
    });
    console.log(`Создан активный сезон: ${season.year} №${season.number} (${season.id})`);
  } else {
    console.log(`Использую существующий активный сезон: ${season.year} №${season.number} (${season.id})`);
  }

  const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);
  const teacherByLogin = {};

  for (const teacher of TEACHERS) {
    const [user] = await User.findOrCreate({
      where: { login: teacher.login },
      defaults: {
        name: teacher.name,
        russianName: '',
        login: teacher.login,
        hashedPassword,
        userLevel: 'TEACHER',
        isActive: true,
        seasonId: season.id,
      },
    });
    user.name = teacher.name;
    user.russianName = '';
    await user.save();
    teacherByLogin[teacher.login] = user;
  }
  console.log(`Учителя готовы: ${Object.keys(teacherByLogin).join(', ')}`);

  const createdGroups = [];
  for (const groupDef of GROUPS) {
    const teacherIds = groupDef.teacherLogins.map((login) => teacherByLogin[login].id);
    const [group] = await Group.findOrCreate({
      where: { name: groupDef.name, seasonId: season.id },
      defaults: {
        name: groupDef.name,
        seasonId: season.id,
        teacherIds,
        points: 0,
      },
    });
    if (!group.teacherIds || group.teacherIds.length === 0) {
      group.teacherIds = teacherIds;
      await group.save();
    }
    await User.update(
      { seasonId: season.id, groupId: group.id },
      { where: { id: teacherIds, userLevel: 'TEACHER' } },
    );
    createdGroups.push(group);
  }
  console.log(`Группы готовы: ${createdGroups.map((g) => g.name).join(', ')}`);

  let createdStudents = 0;
  for (const group of createdGroups) {
    const existingCount = await User.count({ where: { groupId: group.id, userLevel: 'STUDENT' } });
    if (existingCount > 0) {
      console.log(`В группе "${group.name}" уже есть студенты (${existingCount}), пропускаю`);
      continue;
    }

    for (let i = 0; i < 6; i++) {
      await User.create({
        name: randomEnglishName(),
        russianName: '',
        groupId: group.id,
        seasonId: season.id,
        userLevel: 'STUDENT',
        coins: 0,
        lives: 3,
        isActive: false,
      });
      createdStudents++;
    }
  }
  console.log(`Создано студентов: ${createdStudents}`);

  const allStudents = await User.findAll({ where: { userLevel: 'STUDENT' } });
  let normalized = 0;
  for (const student of allStudents) {
    const needsName = !student.name || student.name.trim().includes(' ');
    if (needsName) student.name = randomEnglishName();
    student.russianName = '';
    await student.save();
    normalized++;
  }
  console.log(`Нормализованы имена студентов (name = одно английское слово, russianName = ''): ${normalized}`);

  console.log('\nГотово. Логины учителей для локального входа (пароль у всех: ' + SEED_PASSWORD + '):');
  for (const login of Object.keys(teacherByLogin)) {
    console.log(`  ${login}`);
  }

  await sequelize.close();
}

main().catch(async (error) => {
  console.error('Ошибка сидинга:', error);
  await sequelize.close();
  process.exit(1);
});
