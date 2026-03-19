import { sequelize } from './config/database.js';
import { User } from './models/User.js';
import bcrypt from 'bcrypt';

async function createAdminUser() {
  try {
    // Хешируем пароль
    const saltRounds = 10;
    const plainPassword = '1'; // Замените на нужный пароль
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    // Создаем админа
    const admin = await User.create({
      name: 'Admin',
      coins: 0,
      photoUrl: null,
      userLevel: 'ADMIN',
      login: 'CampusAdmin',
      hashedPassword: hashedPassword,
      isActive: true,
      lives: 0,
    });

    console.log('Админ успешно создан:', admin.toJSON());
  } catch (error) {
    console.error('Ошибка при создании админа:', error);
  } finally {
    await sequelize.close();
  }
}

createAdminUser();
