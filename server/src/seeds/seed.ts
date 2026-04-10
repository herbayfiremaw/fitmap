import * as bcrypt from 'bcrypt';
import dataSource from '../data-source';
import { City } from '../entities/city.entity';
import { TrainingType } from '../entities/training-type.entity';
import { User, UserRole } from '../entities/user.entity';
import { Venue, PriceRange } from '../entities/venue.entity';
import { Trainer } from '../entities/trainer.entity';
import { Schedule } from '../entities/schedule.entity';
import { Review } from '../entities/review.entity';

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
  const userRepo = dataSource.getRepository(User);
  const venueRepo = dataSource.getRepository(Venue);
  const trainerRepo = dataSource.getRepository(Trainer);
  const scheduleRepo = dataSource.getRepository(Schedule);
  const reviewRepo = dataSource.getRepository(Review);

  // --- Cities ---
  const savedCities: Record<string, City> = {};
  for (const city of cities) {
    let existing = await cityRepo.findOneBy({ slug: city.slug });
    if (!existing) {
      existing = await cityRepo.save(cityRepo.create(city));
      console.log(`Created city: ${city.name_en}`);
    }
    savedCities[city.slug] = existing;
  }

  // --- Training Types ---
  const savedTypes: Record<string, TrainingType> = {};
  for (const tt of trainingTypes) {
    let existing = await trainingTypeRepo.findOneBy({ slug: tt.slug });
    if (!existing) {
      existing = await trainingTypeRepo.save(trainingTypeRepo.create(tt));
      console.log(`Created training type: ${tt.name_en}`);
    }
    savedTypes[tt.slug] = existing;
  }

  // --- Users ---
  const passwordHash = await bcrypt.hash('password123', 10);

  const usersData = [
    { name: 'Admin', email: 'admin@fitmap.bg', role: UserRole.ADMIN },
    { name: 'Иван Петров', email: 'ivan@fitmap.bg', role: UserRole.OWNER },
    { name: 'Мария Димитрова', email: 'maria@fitmap.bg', role: UserRole.OWNER },
    { name: 'Георги Тодоров', email: 'georgi@fitmap.bg', role: UserRole.USER },
    { name: 'Елена Иванова', email: 'elena@fitmap.bg', role: UserRole.USER },
  ];

  const savedUsers: Record<string, User> = {};
  for (const u of usersData) {
    let existing = await userRepo.findOneBy({ email: u.email });
    if (!existing) {
      existing = await userRepo.save(
        userRepo.create({ ...u, password_hash: passwordHash }),
      );
      console.log(`Created user: ${u.name}`);
    }
    savedUsers[u.email] = existing;
  }

  const ivan = savedUsers['ivan@fitmap.bg'];
  const maria = savedUsers['maria@fitmap.bg'];
  const georgi = savedUsers['georgi@fitmap.bg'];
  const elena = savedUsers['elena@fitmap.bg'];

  // --- Venues ---
  const venuesData = [
    {
      name: 'Fight Club Sofia',
      description_bg: 'Най-голямата зала за бойни изкуства в София. Модерно оборудване и професионални треньори.',
      description_en: 'The largest martial arts gym in Sofia. Modern equipment and professional coaches.',
      address: 'бул. Витоша 100, София',
      city_id: savedCities['sofia'].id,
      owner_id: ivan.id,
      latitude: 42.6877,
      longitude: 23.3219,
      phone: '+359 2 987 6543',
      email: 'info@fightclub-sofia.bg',
      website: 'https://fightclub-sofia.bg',
      price_range: PriceRange.MEDIUM,
      amenities: ['Съблекални', 'Душове', 'Паркинг', 'Магазин'],
      photos: [],
      is_verified: true,
      is_featured: true,
      trainingTypeSlugs: ['mma', 'kickboxing', 'boxing', 'bjj', 'wrestling'],
    },
    {
      name: 'Zen Yoga Studio',
      description_bg: 'Уютно студио за йога и пилатес в центъра на Пловдив.',
      description_en: 'A cozy yoga and pilates studio in the heart of Plovdiv.',
      address: 'ул. Княз Александър I 15, Пловдив',
      city_id: savedCities['plovdiv'].id,
      owner_id: maria.id,
      latitude: 42.1498,
      longitude: 24.7510,
      phone: '+359 32 123 456',
      email: 'hello@zenyoga.bg',
      website: 'https://zenyoga.bg',
      price_range: PriceRange.LOW,
      amenities: ['Съблекални', 'Душове', 'Чай бар'],
      photos: [],
      is_verified: true,
      is_featured: true,
      trainingTypeSlugs: ['yoga', 'pilates'],
    },
    {
      name: 'Iron Gym Varna',
      description_bg: 'Фитнес зала с тежести и кардио оборудване на морския бряг.',
      description_en: 'A weight and cardio gym right by the seaside.',
      address: 'бул. Приморски 50, Варна',
      city_id: savedCities['varna'].id,
      owner_id: ivan.id,
      latitude: 43.2141,
      longitude: 27.9147,
      phone: '+359 52 555 789',
      email: 'info@irongym-varna.bg',
      price_range: PriceRange.LOW,
      amenities: ['Съблекални', 'Душове', 'Сауна', 'Паркинг'],
      photos: [],
      is_verified: true,
      is_featured: true,
      trainingTypeSlugs: ['gym-fitness', 'crossfit', 'spinning'],
    },
    {
      name: 'CrossFit Burgas',
      description_bg: 'Кросфит бокс с отворен въздух и вътрешна зала.',
      description_en: 'CrossFit box with outdoor and indoor areas.',
      address: 'ул. Алеко Богориди 30, Бургас',
      city_id: savedCities['burgas'].id,
      owner_id: maria.id,
      latitude: 42.5048,
      longitude: 27.4626,
      phone: '+359 56 888 321',
      email: 'info@crossfit-burgas.bg',
      price_range: PriceRange.MEDIUM,
      amenities: ['Съблекални', 'Душове', 'Паркинг'],
      photos: [],
      is_verified: false,
      is_featured: false,
      trainingTypeSlugs: ['crossfit', 'gym-fitness'],
    },
    {
      name: 'Dance Academy',
      description_bg: 'Танцово студио с различни стилове — салса, хип-хоп, балет.',
      description_en: 'Dance studio with various styles — salsa, hip-hop, ballet.',
      address: 'ул. Граф Игнатиев 45, София',
      city_id: savedCities['sofia'].id,
      owner_id: maria.id,
      latitude: 42.6934,
      longitude: 23.3283,
      phone: '+359 2 444 5566',
      email: 'info@danceacademy.bg',
      website: 'https://danceacademy.bg',
      price_range: PriceRange.MEDIUM,
      amenities: ['Съблекални', 'Огледална зала'],
      photos: [],
      is_verified: true,
      is_featured: true,
      trainingTypeSlugs: ['dance'],
    },
    {
      name: 'Aqua Sport Center',
      description_bg: 'Басейн и водни спортове в Стара Загора.',
      description_en: 'Swimming pool and water sports in Stara Zagora.',
      address: 'бул. Цар Симеон Велики 80, Стара Загора',
      city_id: savedCities['stara-zagora'].id,
      owner_id: ivan.id,
      latitude: 42.4258,
      longitude: 25.6345,
      phone: '+359 42 600 700',
      email: 'info@aquasport-sz.bg',
      price_range: PriceRange.HIGH,
      amenities: ['Басейн', 'Съблекални', 'Душове', 'Сауна', 'Паркинг'],
      photos: [],
      is_verified: true,
      is_featured: true,
      trainingTypeSlugs: ['swimming'],
    },
  ];

  const savedVenues: Record<string, Venue> = {};
  for (const v of venuesData) {
    const { trainingTypeSlugs, ...venueData } = v;
    let existing = await venueRepo.findOne({
      where: { name: v.name, city_id: v.city_id },
      relations: ['trainingTypes'],
    });
    if (!existing) {
      existing = venueRepo.create(venueData);
      existing.trainingTypes = trainingTypeSlugs.map((slug) => savedTypes[slug]);
      existing = await venueRepo.save(existing);
      console.log(`Created venue: ${v.name}`);
    }
    savedVenues[v.name] = existing;
  }

  // --- Trainers ---
  const trainersData = [
    {
      name: 'Димитър Стоянов',
      bio_bg: 'Професионален боец с 10 години опит в ММА.',
      bio_en: 'Professional fighter with 10 years of MMA experience.',
      specialties: ['MMA', 'Boxing', 'Wrestling'],
      venue_id: savedVenues['Fight Club Sofia'].id,
    },
    {
      name: 'Петър Николов',
      bio_bg: 'Треньор по кикбокс и муай тай.',
      bio_en: 'Kickboxing and Muay Thai coach.',
      specialties: ['Kickboxing', 'MMA'],
      venue_id: savedVenues['Fight Club Sofia'].id,
    },
    {
      name: 'Анна Георгиева',
      bio_bg: 'Сертифициран инструктор по йога с 8 години опит.',
      bio_en: 'Certified yoga instructor with 8 years of experience.',
      specialties: ['Yoga', 'Pilates'],
      venue_id: savedVenues['Zen Yoga Studio'].id,
    },
    {
      name: 'Стефан Маринов',
      bio_bg: 'Фитнес треньор и бивш състезател по вдигане на тежести.',
      bio_en: 'Fitness trainer and former weightlifting competitor.',
      specialties: ['Gym/Fitness', 'CrossFit'],
      venue_id: savedVenues['Iron Gym Varna'].id,
    },
    {
      name: 'Калина Василева',
      bio_bg: 'Професионална танцьорка и хореограф.',
      bio_en: 'Professional dancer and choreographer.',
      specialties: ['Dance'],
      venue_id: savedVenues['Dance Academy'].id,
    },
  ];

  const savedTrainers: Record<string, Trainer> = {};
  for (const t of trainersData) {
    let existing = await trainerRepo.findOneBy({ name: t.name, venue_id: t.venue_id });
    if (!existing) {
      existing = await trainerRepo.save(trainerRepo.create(t));
      console.log(`Created trainer: ${t.name}`);
    }
    savedTrainers[t.name] = existing;
  }

  // --- Schedules ---
  const schedulesData = [
    // Fight Club Sofia
    { venue_id: savedVenues['Fight Club Sofia'].id, training_type_id: savedTypes['mma'].id, trainer_id: savedTrainers['Димитър Стоянов'].id, day_of_week: 1, start_time: '09:00', end_time: '10:30' },
    { venue_id: savedVenues['Fight Club Sofia'].id, training_type_id: savedTypes['kickboxing'].id, trainer_id: savedTrainers['Петър Николов'].id, day_of_week: 1, start_time: '18:00', end_time: '19:30' },
    { venue_id: savedVenues['Fight Club Sofia'].id, training_type_id: savedTypes['boxing'].id, trainer_id: savedTrainers['Димитър Стоянов'].id, day_of_week: 3, start_time: '18:00', end_time: '19:30' },
    { venue_id: savedVenues['Fight Club Sofia'].id, training_type_id: savedTypes['bjj'].id, trainer_id: savedTrainers['Димитър Стоянов'].id, day_of_week: 5, start_time: '18:00', end_time: '19:30' },
    // Zen Yoga Studio
    { venue_id: savedVenues['Zen Yoga Studio'].id, training_type_id: savedTypes['yoga'].id, trainer_id: savedTrainers['Анна Георгиева'].id, day_of_week: 1, start_time: '07:00', end_time: '08:00' },
    { venue_id: savedVenues['Zen Yoga Studio'].id, training_type_id: savedTypes['pilates'].id, trainer_id: savedTrainers['Анна Георгиева'].id, day_of_week: 2, start_time: '10:00', end_time: '11:00' },
    { venue_id: savedVenues['Zen Yoga Studio'].id, training_type_id: savedTypes['yoga'].id, trainer_id: savedTrainers['Анна Георгиева'].id, day_of_week: 3, start_time: '07:00', end_time: '08:00' },
    { venue_id: savedVenues['Zen Yoga Studio'].id, training_type_id: savedTypes['pilates'].id, trainer_id: savedTrainers['Анна Георгиева'].id, day_of_week: 4, start_time: '10:00', end_time: '11:00' },
    { venue_id: savedVenues['Zen Yoga Studio'].id, training_type_id: savedTypes['yoga'].id, trainer_id: savedTrainers['Анна Георгиева'].id, day_of_week: 5, start_time: '07:00', end_time: '08:00' },
    // Iron Gym Varna
    { venue_id: savedVenues['Iron Gym Varna'].id, training_type_id: savedTypes['gym-fitness'].id, trainer_id: savedTrainers['Стефан Маринов'].id, day_of_week: 1, start_time: '08:00', end_time: '09:30' },
    { venue_id: savedVenues['Iron Gym Varna'].id, training_type_id: savedTypes['crossfit'].id, trainer_id: savedTrainers['Стефан Маринов'].id, day_of_week: 3, start_time: '17:00', end_time: '18:30' },
    { venue_id: savedVenues['Iron Gym Varna'].id, training_type_id: savedTypes['spinning'].id, trainer_id: null, day_of_week: 5, start_time: '08:00', end_time: '09:00' },
    // Dance Academy
    { venue_id: savedVenues['Dance Academy'].id, training_type_id: savedTypes['dance'].id, trainer_id: savedTrainers['Калина Василева'].id, day_of_week: 2, start_time: '19:00', end_time: '20:30' },
    { venue_id: savedVenues['Dance Academy'].id, training_type_id: savedTypes['dance'].id, trainer_id: savedTrainers['Калина Василева'].id, day_of_week: 4, start_time: '19:00', end_time: '20:30' },
  ];

  for (const s of schedulesData) {
    const existing = await scheduleRepo.findOneBy({
      venue_id: s.venue_id,
      training_type_id: s.training_type_id,
      day_of_week: s.day_of_week,
      start_time: s.start_time,
    });
    if (!existing) {
      await scheduleRepo.save(scheduleRepo.create(s));
    }
  }
  console.log('Created schedules');

  // --- Reviews ---
  const reviewsData = [
    { venue_id: savedVenues['Fight Club Sofia'].id, user_id: georgi.id, rating: 5, comment: 'Страхотна зала! Треньорите са професионалисти.' },
    { venue_id: savedVenues['Fight Club Sofia'].id, user_id: elena.id, rating: 4, comment: 'Много добро оборудване, малко натоварено вечер.' },
    { venue_id: savedVenues['Zen Yoga Studio'].id, user_id: elena.id, rating: 5, comment: 'Най-доброто студио за йога в Пловдив!' },
    { venue_id: savedVenues['Zen Yoga Studio'].id, user_id: georgi.id, rating: 4, comment: 'Спокойна атмосфера, добър инструктор.' },
    { venue_id: savedVenues['Iron Gym Varna'].id, user_id: georgi.id, rating: 5, comment: 'Перфектно за тренировка с тежести. Страхотна локация.' },
    { venue_id: savedVenues['Iron Gym Varna'].id, user_id: elena.id, rating: 4, comment: 'Хубава зала, добра цена.' },
    { venue_id: savedVenues['Dance Academy'].id, user_id: elena.id, rating: 5, comment: 'Калина е невероятен преподавател!' },
  ];

  for (const r of reviewsData) {
    const existing = await reviewRepo.findOneBy({
      venue_id: r.venue_id,
      user_id: r.user_id,
    });
    if (!existing) {
      await reviewRepo.save(reviewRepo.create(r));
    }
  }
  console.log('Created reviews');

  console.log('Seeding complete');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
