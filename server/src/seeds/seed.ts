import dataSource from '../data-source';
import { City } from '../entities/city.entity';
import { TrainingType } from '../entities/training-type.entity';

const cities = [
  { name_bg: 'София', name_en: 'Sofia', slug: 'sofia' },
  { name_bg: 'Пловдив', name_en: 'Plovdiv', slug: 'plovdiv' },
  { name_bg: 'Варна', name_en: 'Varna', slug: 'varna' },
  { name_bg: 'Бургас', name_en: 'Burgas', slug: 'burgas' },
  { name_bg: 'Стара Загора', name_en: 'Stara Zagora', slug: 'stara-zagora' },
];

const trainingTypes = [
  { name_bg: 'ММА', name_en: 'MMA', slug: 'mma', icon: 'mma' },
  { name_bg: 'Кикбокс', name_en: 'Kickboxing', slug: 'kickboxing', icon: 'kickboxing' },
  { name_bg: 'Бокс', name_en: 'Boxing', slug: 'boxing', icon: 'boxing' },
  { name_bg: 'БЖЖ', name_en: 'BJJ', slug: 'bjj', icon: 'bjj' },
  { name_bg: 'Йога', name_en: 'Yoga', slug: 'yoga', icon: 'yoga' },
  { name_bg: 'Пилатес', name_en: 'Pilates', slug: 'pilates', icon: 'pilates' },
  { name_bg: 'Спининг', name_en: 'Spinning', slug: 'spinning', icon: 'spinning' },
  { name_bg: 'Кросфит', name_en: 'CrossFit', slug: 'crossfit', icon: 'crossfit' },
  { name_bg: 'Фитнес', name_en: 'Gym/Fitness', slug: 'gym-fitness', icon: 'gym' },
  { name_bg: 'Танци', name_en: 'Dance', slug: 'dance', icon: 'dance' },
  { name_bg: 'Плуване', name_en: 'Swimming', slug: 'swimming', icon: 'swimming' },
  { name_bg: 'Борба', name_en: 'Wrestling', slug: 'wrestling', icon: 'wrestling' },
];

async function seed() {
  await dataSource.initialize();
  console.log('Connected to database');

  const cityRepo = dataSource.getRepository(City);
  const trainingTypeRepo = dataSource.getRepository(TrainingType);

  for (const city of cities) {
    const exists = await cityRepo.findOneBy({ slug: city.slug });
    if (!exists) {
      await cityRepo.save(cityRepo.create(city));
      console.log(`Created city: ${city.name_en}`);
    }
  }

  for (const tt of trainingTypes) {
    const exists = await trainingTypeRepo.findOneBy({ slug: tt.slug });
    if (!exists) {
      await trainingTypeRepo.save(trainingTypeRepo.create(tt));
      console.log(`Created training type: ${tt.name_en}`);
    }
  }

  console.log('Seeding complete');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
